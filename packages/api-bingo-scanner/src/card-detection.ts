import sharp from 'sharp';
import type { ImageInput, DetectedCard, MultiCardScannerOptions } from './types';
import { DEFAULT_MULTI_CARD_OPTIONS } from './types';

// Configuration constants for automatic card detection
const SEPARATOR_DETECTION = {
  /** Minimum gap between separator groups as percentage of image dimension */
  MIN_GAP_PERCENT: 0.05,
  /** Minimum window size for separator detection */
  MIN_WINDOW_SIZE: 3,
  /** Window size as percentage of image dimension */
  WINDOW_SIZE_PERCENT: 0.01,
  /** Standard deviation multiplier for threshold */
  THRESHOLD_MULTIPLIER: 1.5,
} as const;

const CARD_SIZE_LIMITS = {
  /** Minimum card size as percentage of image dimension */
  MIN_PERCENT: 0.15,
  /** Maximum card size as percentage of image dimension */
  MAX_PERCENT: 0.85,
} as const;

/**
 * Detects and extracts multiple bingo cards from a single image
 * Uses automatic detection to find card boundaries, or falls back to grid-based splitting
 */
export async function detectCards(
  input: ImageInput,
  options: Pick<MultiCardScannerOptions, 'cardLayout' | 'expectedCards' | 'minCardAreaPercent' | 'maxCardAreaPercent'> = {}
): Promise<DetectedCard[]> {
  const image = sharp(input as Buffer | string);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Could not determine image dimensions');
  }

  const { width, height } = metadata;
  const imageArea = width * height;
  const minArea = (options.minCardAreaPercent ?? DEFAULT_MULTI_CARD_OPTIONS.minCardAreaPercent) * imageArea;
  const maxArea = (options.maxCardAreaPercent ?? DEFAULT_MULTI_CARD_OPTIONS.maxCardAreaPercent) * imageArea;

  // If layout is specified, use it to split the image
  if (options.cardLayout) {
    return splitByLayout(input, width, height, options.cardLayout, minArea, maxArea);
  }

  // If expected cards count is specified, try to determine optimal layout
  if (options.expectedCards) {
    const layout = calculateOptimalLayout(options.expectedCards, width, height);
    return splitByLayout(input, width, height, layout, minArea, maxArea);
  }

  // Try automatic detection
  const autoDetectedCards = await autoDetectCards(input, width, height, minArea, maxArea);
  if (autoDetectedCards.length > 0) {
    return autoDetectedCards;
  }

  // Fallback: treat the entire image as a single card
  const imageBuffer = await sharp(input as Buffer | string).toBuffer();
  return [
    {
      bounds: { x: 0, y: 0, width, height },
      index: 0,
      imageBuffer,
    },
  ];
}

/**
 * Splits an image into cards based on a grid layout
 */
async function splitByLayout(
  input: ImageInput,
  imageWidth: number,
  imageHeight: number,
  layout: { rows: number; cols: number },
  minArea: number,
  maxArea: number
): Promise<DetectedCard[]> {
  const { rows, cols } = layout;
  const cardWidth = Math.floor(imageWidth / cols);
  const cardHeight = Math.floor(imageHeight / rows);
  const cardArea = cardWidth * cardHeight;

  // Validate card size
  if (cardArea < minArea || cardArea > maxArea) {
    throw new Error(
      `Detected card size (${cardWidth}x${cardHeight}) is outside the allowed range. ` +
        `Card area: ${cardArea}, allowed: ${minArea}-${maxArea}`
    );
  }

  const cards: DetectedCard[] = [];
  let index = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cardWidth;
      const y = row * cardHeight;

      // Extract the card region
      const cardBuffer = await sharp(input as Buffer | string)
        .extract({
          left: x,
          top: y,
          width: Math.min(cardWidth, imageWidth - x),
          height: Math.min(cardHeight, imageHeight - y),
        })
        .toBuffer();

      cards.push({
        bounds: {
          x,
          y,
          width: cardWidth,
          height: cardHeight,
        },
        index,
        imageBuffer: cardBuffer,
      });

      index++;
    }
  }

  return cards;
}

/**
 * Calculates the optimal grid layout for a given number of cards
 * Tries to match the aspect ratio of the image
 */
function calculateOptimalLayout(
  cardCount: number,
  imageWidth: number,
  imageHeight: number
): { rows: number; cols: number } {
  const aspectRatio = imageWidth / imageHeight;

  // Find the best row/column combination
  let bestLayout = { rows: 1, cols: cardCount };
  let bestScore = Infinity;

  for (let rows = 1; rows <= cardCount; rows++) {
    if (cardCount % rows === 0) {
      const cols = cardCount / rows;
      const layoutRatio = cols / rows;
      const score = Math.abs(layoutRatio - aspectRatio);

      if (score < bestScore) {
        bestScore = score;
        bestLayout = { rows, cols };
      }
    }
  }

  return bestLayout;
}

/**
 * Detects cards by splitting the image into equal parts
 * @param input - The input image
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @returns Array of detected cards
 */
export async function splitImage(
  input: ImageInput,
  rows: number,
  cols: number
): Promise<DetectedCard[]> {
  return detectCards(input, { cardLayout: { rows, cols } });
}

/**
 * Extracts a single card region from an image
 */
export async function extractCardRegion(
  input: ImageInput,
  bounds: { x: number; y: number; width: number; height: number }
): Promise<Buffer> {
  return sharp(input as Buffer | string)
    .extract({
      left: bounds.x,
      top: bounds.y,
      width: bounds.width,
      height: bounds.height,
    })
    .toBuffer();
}

/**
 * Automatically detects bingo cards in an image by analyzing pixel patterns
 * Looks for separator lines (dark/light lines between cards) and grid patterns
 */
async function autoDetectCards(
  input: ImageInput,
  width: number,
  height: number,
  minArea: number,
  maxArea: number
): Promise<DetectedCard[]> {
  // Convert to grayscale and get raw pixel data
  const { data: pixels, info } = await sharp(input as Buffer | string)
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Analyze horizontal and vertical profiles to find separators
  const horizontalSeparators = findSeparators(pixels, info.width, info.height, 'horizontal');
  const verticalSeparators = findSeparators(pixels, info.width, info.height, 'vertical');

  // Determine grid layout from separators
  const rows = horizontalSeparators.length + 1;
  const cols = verticalSeparators.length + 1;

  // If no separators found or only 1 card detected, return empty to use fallback
  if (rows === 1 && cols === 1) {
    return [];
  }

  // Calculate card boundaries from separators
  const rowBoundaries = [0, ...horizontalSeparators, height];
  const colBoundaries = [0, ...verticalSeparators, width];

  const cards: DetectedCard[] = [];
  let index = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = colBoundaries[col] ?? 0;
      const y = rowBoundaries[row] ?? 0;
      const cardWidth = (colBoundaries[col + 1] ?? width) - x;
      const cardHeight = (rowBoundaries[row + 1] ?? height) - y;
      const cardArea = cardWidth * cardHeight;

      // Skip cards outside allowed size range
      if (cardArea < minArea || cardArea > maxArea) {
        continue;
      }

      // Extract card region
      const cardBuffer = await sharp(input as Buffer | string)
        .extract({
          left: x,
          top: y,
          width: cardWidth,
          height: cardHeight,
        })
        .toBuffer();

      cards.push({
        bounds: { x, y, width: cardWidth, height: cardHeight },
        index,
        imageBuffer: cardBuffer,
      });

      index++;
    }
  }

  return cards;
}

/**
 * Finds separator lines in the image by analyzing pixel intensity profiles
 * Separators are typically darker (or lighter) lines between cards
 */
function findSeparators(
  pixels: Buffer,
  width: number,
  height: number,
  direction: 'horizontal' | 'vertical'
): number[] {
  const isHorizontal = direction === 'horizontal';
  const length = isHorizontal ? height : width;
  const crossLength = isHorizontal ? width : height;

  // Handle edge case of empty or very small images
  if (length === 0 || crossLength === 0) {
    return [];
  }

  // Calculate average intensity for each row/column
  const profile: number[] = [];
  for (let i = 0; i < length; i++) {
    let sum = 0;
    for (let j = 0; j < crossLength; j++) {
      const pixelIndex = isHorizontal ? i * width + j : j * width + i;
      sum += pixels[pixelIndex] ?? 0;
    }
    profile.push(sum / crossLength);
  }

  // Handle edge case of empty profile
  if (profile.length === 0) {
    return [];
  }

  // Find the overall average and standard deviation
  const avgIntensity = profile.reduce((a, b) => a + b, 0) / profile.length;
  const variance = profile.reduce((sum, val) => sum + Math.pow(val - avgIntensity, 2), 0) / profile.length;
  const stdDev = Math.sqrt(variance);

  // Find lines that deviate significantly from average (potential separators)
  const threshold = stdDev * SEPARATOR_DETECTION.THRESHOLD_MULTIPLIER;
  const potentialSeparators: { position: number; intensity: number }[] = [];

  // Use a sliding window to find separator regions
  const windowSize = Math.max(
    SEPARATOR_DETECTION.MIN_WINDOW_SIZE,
    Math.floor(length * SEPARATOR_DETECTION.WINDOW_SIZE_PERCENT)
  );

  // Optimize: calculate window sum incrementally instead of using slice()
  for (let i = windowSize; i < length - windowSize; i++) {
    let windowSum = 0;
    for (let w = i - windowSize; w <= i + windowSize; w++) {
      windowSum += profile[w] ?? 0;
    }
    const windowAvg = windowSum / (windowSize * 2 + 1);

    // Check if this region is significantly different from average
    if (Math.abs(windowAvg - avgIntensity) > threshold) {
      potentialSeparators.push({ position: i, intensity: windowAvg });
    }
  }

  // Group nearby separators and find their centers
  const separators = groupAndFindCenters(potentialSeparators, length);

  // Filter separators to ensure reasonable card sizes
  return filterSeparators(separators, length);
}

/**
 * Groups nearby potential separators and returns their center positions
 */
function groupAndFindCenters(
  potentialSeparators: { position: number; intensity: number }[],
  totalLength: number
): number[] {
  if (potentialSeparators.length === 0) return [];

  const minGap = totalLength * SEPARATOR_DETECTION.MIN_GAP_PERCENT;
  const groups: { position: number; intensity: number }[][] = [];
  let currentGroup: { position: number; intensity: number }[] = [];

  for (const sep of potentialSeparators) {
    if (currentGroup.length === 0) {
      currentGroup.push(sep);
    } else {
      const lastPos = currentGroup[currentGroup.length - 1]?.position ?? 0;
      if (sep.position - lastPos < minGap) {
        currentGroup.push(sep);
      } else {
        groups.push(currentGroup);
        currentGroup = [sep];
      }
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  // Find center of each group
  return groups.map(group => {
    const positions = group.map(s => s.position);
    return Math.round(positions.reduce((a, b) => a + b, 0) / positions.length);
  });
}

/**
 * Filters separators to ensure they create reasonably-sized card regions
 * Removes separators that would create very small or very large regions
 */
function filterSeparators(separators: number[], totalLength: number): number[] {
  if (separators.length === 0) return [];

  // Standard bingo card aspect ratio is roughly square
  // With 5x5 grid + margins, a typical card is about 20-50% of image dimension
  const minCardSize = totalLength * CARD_SIZE_LIMITS.MIN_PERCENT;
  const maxCardSize = totalLength * CARD_SIZE_LIMITS.MAX_PERCENT;

  const filteredSeparators: number[] = [];
  let lastPosition = 0;

  for (const sep of separators) {
    const size = sep - lastPosition;
    if (size >= minCardSize && size <= maxCardSize) {
      filteredSeparators.push(sep);
      lastPosition = sep;
    }
  }

  // Verify last region is also valid
  const lastRegionSize = totalLength - (filteredSeparators[filteredSeparators.length - 1] ?? 0);
  if (lastRegionSize < minCardSize) {
    // Remove last separator if it creates too small a final region
    filteredSeparators.pop();
  }

  return filteredSeparators;
}
