import sharp from 'sharp';
import type { ImageInput } from './types';

/**
 * Preprocesses an image for better OCR results
 * - Converts to grayscale
 * - Increases contrast
 * - Applies thresholding for clearer text
 * - Optionally resizes for better recognition
 */
export async function preprocessImage(input: ImageInput): Promise<Buffer> {
  const image = sharp(input as Buffer | string);

  const processed = await image
    // Convert to grayscale for better text recognition
    .grayscale()
    // Normalize to improve contrast
    .normalize()
    // Increase sharpness for clearer edges
    .sharpen({
      sigma: 1.5,
      m1: 1.0,
      m2: 0.5,
    })
    // Apply linear contrast adjustment
    .linear(1.2, -30)
    // Output as PNG for lossless quality
    .png()
    .toBuffer();

  return processed;
}

/**
 * Extracts a specific cell region from a bingo card image
 * @param input - The full bingo card image
 * @param row - Row index (0-based)
 * @param col - Column index (0-based)
 * @param gridSize - Size of the grid
 * @returns Buffer containing the extracted cell image
 */
export async function extractCell(
  input: ImageInput,
  row: number,
  col: number,
  gridSize: { rows: number; cols: number }
): Promise<Buffer> {
  const image = sharp(input as Buffer | string);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Could not determine image dimensions');
  }

  const cellWidth = Math.floor(metadata.width / gridSize.cols);
  const cellHeight = Math.floor(metadata.height / gridSize.rows);

  // Add small padding to avoid edge issues
  const padding = Math.min(cellWidth, cellHeight) * 0.05;
  const left = Math.max(0, Math.floor(col * cellWidth + padding));
  const top = Math.max(0, Math.floor(row * cellHeight + padding));
  const width = Math.floor(cellWidth - padding * 2);
  const height = Math.floor(cellHeight - padding * 2);

  const cell = await image
    .extract({
      left,
      top,
      width: Math.min(width, metadata.width - left),
      height: Math.min(height, metadata.height - top),
    })
    .toBuffer();

  return cell;
}

/**
 * Extracts all cells from a bingo card image
 * @param input - The full bingo card image
 * @param gridSize - Size of the grid
 * @returns Array of cell images with their positions
 */
export async function extractAllCells(
  input: ImageInput,
  gridSize: { rows: number; cols: number }
): Promise<Array<{ buffer: Buffer; row: number; col: number }>> {
  const image = sharp(input as Buffer | string);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Could not determine image dimensions');
  }

  const cellWidth = Math.floor(metadata.width / gridSize.cols);
  const cellHeight = Math.floor(metadata.height / gridSize.rows);
  const padding = Math.min(cellWidth, cellHeight) * 0.05;

  const cells: Array<{ buffer: Buffer; row: number; col: number }> = [];

  for (let row = 0; row < gridSize.rows; row++) {
    for (let col = 0; col < gridSize.cols; col++) {
      const left = Math.max(0, Math.floor(col * cellWidth + padding));
      const top = Math.max(0, Math.floor(row * cellHeight + padding));
      const width = Math.floor(cellWidth - padding * 2);
      const height = Math.floor(cellHeight - padding * 2);

      const cellBuffer = await sharp(input as Buffer | string)
        .extract({
          left,
          top,
          width: Math.min(width, metadata.width - left),
          height: Math.min(height, metadata.height - top),
        })
        .grayscale()
        .normalize()
        .sharpen({ sigma: 1.5 })
        .linear(1.2, -30)
        .png()
        .toBuffer();

      cells.push({ buffer: cellBuffer, row, col });
    }
  }

  return cells;
}

/**
 * Gets the dimensions of an image
 */
export async function getImageDimensions(
  input: ImageInput
): Promise<{ width: number; height: number }> {
  const image = sharp(input as Buffer | string);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Could not determine image dimensions');
  }

  return { width: metadata.width, height: metadata.height };
}

/**
 * Resizes an image to a target width while maintaining aspect ratio
 */
export async function resizeImage(input: ImageInput, targetWidth: number): Promise<Buffer> {
  return sharp(input as Buffer | string).resize(targetWidth).png().toBuffer();
}
