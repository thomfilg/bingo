import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { detectCards, splitImage, extractCardRegion } from '../card-detection';

// Create a simple test image buffer
async function createTestImage(width = 400, height = 400): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .png()
    .toBuffer();
}

describe('detectCards', () => {
  it('should detect single card when no layout specified', async () => {
    const testImage = await createTestImage(250, 250);
    const cards = await detectCards(testImage);

    expect(cards).toHaveLength(1);
    expect(cards[0]?.bounds).toEqual({ x: 0, y: 0, width: 250, height: 250 });
    expect(cards[0]?.index).toBe(0);
    expect(cards[0]?.imageBuffer).toBeInstanceOf(Buffer);
  });

  it('should split image by layout', async () => {
    const testImage = await createTestImage(400, 200);
    const cards = await detectCards(testImage, {
      cardLayout: { rows: 1, cols: 2 },
    });

    expect(cards).toHaveLength(2);
    expect(cards[0]?.bounds).toEqual({ x: 0, y: 0, width: 200, height: 200 });
    expect(cards[1]?.bounds).toEqual({ x: 200, y: 0, width: 200, height: 200 });
  });

  it('should split image by expected card count', async () => {
    const testImage = await createTestImage(400, 400);
    const cards = await detectCards(testImage, {
      expectedCards: 4,
    });

    expect(cards).toHaveLength(4);
  });

  it('should arrange cards in reading order (left to right, top to bottom)', async () => {
    const testImage = await createTestImage(400, 400);
    const cards = await detectCards(testImage, {
      cardLayout: { rows: 2, cols: 2 },
    });

    expect(cards).toHaveLength(4);
    expect(cards[0]?.index).toBe(0); // top-left
    expect(cards[1]?.index).toBe(1); // top-right
    expect(cards[2]?.index).toBe(2); // bottom-left
    expect(cards[3]?.index).toBe(3); // bottom-right
  });

  it('should calculate correct bounds for 2x3 layout', async () => {
    const testImage = await createTestImage(600, 400);
    const cards = await detectCards(testImage, {
      cardLayout: { rows: 2, cols: 3 },
    });

    expect(cards).toHaveLength(6);

    // First row
    expect(cards[0]?.bounds).toEqual({ x: 0, y: 0, width: 200, height: 200 });
    expect(cards[1]?.bounds).toEqual({ x: 200, y: 0, width: 200, height: 200 });
    expect(cards[2]?.bounds).toEqual({ x: 400, y: 0, width: 200, height: 200 });

    // Second row
    expect(cards[3]?.bounds).toEqual({ x: 0, y: 200, width: 200, height: 200 });
    expect(cards[4]?.bounds).toEqual({ x: 200, y: 200, width: 200, height: 200 });
    expect(cards[5]?.bounds).toEqual({ x: 400, y: 200, width: 200, height: 200 });
  });

  it('should throw error for cards outside area constraints', async () => {
    const testImage = await createTestImage(100, 100);

    // With minCardAreaPercent of 50%, a 2x2 grid would make each card 25% of the image
    await expect(
      detectCards(testImage, {
        cardLayout: { rows: 2, cols: 2 },
        minCardAreaPercent: 0.5,
      })
    ).rejects.toThrow(/outside the allowed range/);
  });

  it('should extract each card as a valid image buffer', async () => {
    const testImage = await createTestImage(400, 400);
    const cards = await detectCards(testImage, {
      cardLayout: { rows: 2, cols: 2 },
    });

    for (const card of cards) {
      const metadata = await sharp(card.imageBuffer).metadata();
      expect(metadata.width).toBe(200);
      expect(metadata.height).toBe(200);
    }
  });
});

describe('splitImage', () => {
  it('should split image into specified grid', async () => {
    const testImage = await createTestImage(300, 300);
    const cards = await splitImage(testImage, 3, 3);

    expect(cards).toHaveLength(9);

    for (const card of cards) {
      const metadata = await sharp(card.imageBuffer).metadata();
      expect(metadata.width).toBe(100);
      expect(metadata.height).toBe(100);
    }
  });

  it('should work with non-square grids', async () => {
    const testImage = await createTestImage(400, 200);
    const cards = await splitImage(testImage, 1, 4);

    expect(cards).toHaveLength(4);

    for (const card of cards) {
      const metadata = await sharp(card.imageBuffer).metadata();
      expect(metadata.width).toBe(100);
      expect(metadata.height).toBe(200);
    }
  });
});

describe('extractCardRegion', () => {
  it('should extract a specific region from the image', async () => {
    const testImage = await createTestImage(400, 400);
    const region = await extractCardRegion(testImage, {
      x: 100,
      y: 100,
      width: 200,
      height: 200,
    });

    const metadata = await sharp(region).metadata();
    expect(metadata.width).toBe(200);
    expect(metadata.height).toBe(200);
  });

  it('should extract corner regions correctly', async () => {
    const testImage = await createTestImage(400, 400);

    // Top-left corner
    const topLeft = await extractCardRegion(testImage, {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
    const topLeftMeta = await sharp(topLeft).metadata();
    expect(topLeftMeta.width).toBe(100);
    expect(topLeftMeta.height).toBe(100);

    // Bottom-right corner
    const bottomRight = await extractCardRegion(testImage, {
      x: 300,
      y: 300,
      width: 100,
      height: 100,
    });
    const bottomRightMeta = await sharp(bottomRight).metadata();
    expect(bottomRightMeta.width).toBe(100);
    expect(bottomRightMeta.height).toBe(100);
  });
});

describe('optimal layout calculation', () => {
  it('should prefer square layouts for square images', async () => {
    const testImage = await createTestImage(400, 400);
    const cards = await detectCards(testImage, { expectedCards: 4 });

    // For 4 cards on a square image, should be 2x2
    expect(cards).toHaveLength(4);

    const cardWidth = cards[0]?.bounds.width;
    const cardHeight = cards[0]?.bounds.height;
    expect(cardWidth).toBe(cardHeight); // Square cards for square image
  });

  it('should prefer horizontal layouts for wide images', async () => {
    const testImage = await createTestImage(800, 200);
    const cards = await detectCards(testImage, { expectedCards: 4 });

    // For 4 cards on a wide image, should be 1x4 or 2x2
    expect(cards).toHaveLength(4);

    // Check that layout matches aspect ratio better
    const firstCard = cards[0];
    const lastCard = cards[3];
    expect(lastCard!.bounds.x).toBeGreaterThan(firstCard!.bounds.x);
  });
});

// Helper to create an image with separator lines
async function createImageWithSeparators(
  width: number,
  height: number,
  verticalSeparators: number[],
  horizontalSeparators: number[],
  separatorWidth = 10
): Promise<Buffer> {
  // Create white background
  let image = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  });

  // Composite dark lines for separators
  const overlays: sharp.OverlayOptions[] = [];

  // Add vertical separators (dark lines)
  for (const x of verticalSeparators) {
    const lineBuffer = await sharp({
      create: {
        width: separatorWidth,
        height,
        channels: 3,
        background: { r: 30, g: 30, b: 30 },
      },
    })
      .png()
      .toBuffer();

    overlays.push({
      input: lineBuffer,
      left: Math.max(0, x - Math.floor(separatorWidth / 2)),
      top: 0,
    });
  }

  // Add horizontal separators (dark lines)
  for (const y of horizontalSeparators) {
    const lineBuffer = await sharp({
      create: {
        width,
        height: separatorWidth,
        channels: 3,
        background: { r: 30, g: 30, b: 30 },
      },
    })
      .png()
      .toBuffer();

    overlays.push({
      input: lineBuffer,
      left: 0,
      top: Math.max(0, y - Math.floor(separatorWidth / 2)),
    });
  }

  if (overlays.length > 0) {
    image = image.composite(overlays);
  }

  return image.png().toBuffer();
}

describe('automatic card detection', () => {
  it('should detect cards separated by vertical dark line', async () => {
    // Create 400x200 image with vertical separator at x=200
    const testImage = await createImageWithSeparators(400, 200, [200], []);
    const cards = await detectCards(testImage);

    expect(cards.length).toBe(2);
    // First card should be left half
    expect(cards[0]?.bounds.x).toBe(0);
    expect(cards[0]?.bounds.width).toBeLessThanOrEqual(205); // Allow some tolerance for separator width
    // Second card should be right half
    expect(cards[1]?.bounds.x).toBeGreaterThanOrEqual(195);
  });

  it('should detect cards separated by horizontal dark line', async () => {
    // Create 200x400 image with horizontal separator at y=200
    const testImage = await createImageWithSeparators(200, 400, [], [200]);
    const cards = await detectCards(testImage);

    expect(cards.length).toBe(2);
    // First card should be top half
    expect(cards[0]?.bounds.y).toBe(0);
    expect(cards[0]?.bounds.height).toBeLessThanOrEqual(205);
    // Second card should be bottom half
    expect(cards[1]?.bounds.y).toBeGreaterThanOrEqual(195);
  });

  it('should detect 2x2 grid with separators', async () => {
    // Create 400x400 image with both vertical and horizontal separators
    const testImage = await createImageWithSeparators(400, 400, [200], [200]);
    const cards = await detectCards(testImage);

    expect(cards.length).toBe(4);

    // Verify all four quadrants are detected
    const topLeft = cards.find(c => c.bounds.x < 100 && c.bounds.y < 100);
    const topRight = cards.find(c => c.bounds.x > 150 && c.bounds.y < 100);
    const bottomLeft = cards.find(c => c.bounds.x < 100 && c.bounds.y > 150);
    const bottomRight = cards.find(c => c.bounds.x > 150 && c.bounds.y > 150);

    expect(topLeft).toBeDefined();
    expect(topRight).toBeDefined();
    expect(bottomLeft).toBeDefined();
    expect(bottomRight).toBeDefined();
  });

  it('should fall back to single card when no separators detected', async () => {
    // Plain white image with no separators
    const testImage = await createTestImage(300, 300);
    const cards = await detectCards(testImage);

    expect(cards.length).toBe(1);
    expect(cards[0]?.bounds).toEqual({ x: 0, y: 0, width: 300, height: 300 });
  });

  it('should detect 1x3 horizontal layout with separators', async () => {
    // Create 600x200 image with 2 vertical separators
    const testImage = await createImageWithSeparators(600, 200, [200, 400], []);
    const cards = await detectCards(testImage);

    expect(cards.length).toBe(3);

    // Cards should be in left-to-right order
    expect(cards[0]?.bounds.x).toBeLessThan(cards[1]?.bounds.x ?? 0);
    expect(cards[1]?.bounds.x).toBeLessThan(cards[2]?.bounds.x ?? 0);
  });

  it('should ignore separators that create too-small regions', async () => {
    // Create image with separators very close to edge (would create tiny cards)
    const testImage = await createImageWithSeparators(400, 400, [50, 350], []);
    const cards = await detectCards(testImage);

    // Should fall back since separators at 50 and 350 would create cards that are
    // only 12.5% of image width (below 15% minimum)
    expect(cards.length).toBeLessThanOrEqual(2);
  });

  it('should handle images with varied content between separators', async () => {
    // Create image with separator and different colored regions
    const width = 400;
    const height = 200;

    // Create left half (red)
    const leftBuffer = await sharp({
      create: { width: 195, height, channels: 3, background: { r: 255, g: 100, b: 100 } },
    }).png().toBuffer();

    // Create separator (black)
    const separatorBuffer = await sharp({
      create: { width: 10, height, channels: 3, background: { r: 0, g: 0, b: 0 } },
    }).png().toBuffer();

    // Create right half (blue)
    const rightBuffer = await sharp({
      create: { width: 195, height, channels: 3, background: { r: 100, g: 100, b: 255 } },
    }).png().toBuffer();

    // Composite them together
    const testImage = await sharp({
      create: { width, height, channels: 3, background: { r: 255, g: 255, b: 255 } },
    })
      .composite([
        { input: leftBuffer, left: 0, top: 0 },
        { input: separatorBuffer, left: 195, top: 0 },
        { input: rightBuffer, left: 205, top: 0 },
      ])
      .png()
      .toBuffer();

    const cards = await detectCards(testImage);

    expect(cards.length).toBe(2);
  });
});
