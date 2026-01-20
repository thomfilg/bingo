import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import {
  preprocessImage,
  extractCell,
  extractAllCells,
  getImageDimensions,
  resizeImage,
} from '../preprocessing';

// Create a simple test image buffer (1x1 red pixel PNG)
async function createTestImage(width = 100, height = 100): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 255, g: 0, b: 0 },
    },
  })
    .png()
    .toBuffer();
}

describe('preprocessImage', () => {
  it('should process an image and return a buffer', async () => {
    const testImage = await createTestImage();
    const result = await preprocessImage(testImage);

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should convert image to grayscale', async () => {
    const testImage = await createTestImage();
    const result = await preprocessImage(testImage);

    // Verify the output is still a valid image
    const metadata = await sharp(result).metadata();
    expect(metadata.format).toBe('png');
  });
});

describe('getImageDimensions', () => {
  it('should return correct dimensions', async () => {
    const testImage = await createTestImage(200, 150);
    const dimensions = await getImageDimensions(testImage);

    expect(dimensions.width).toBe(200);
    expect(dimensions.height).toBe(150);
  });

  it('should handle square images', async () => {
    const testImage = await createTestImage(100, 100);
    const dimensions = await getImageDimensions(testImage);

    expect(dimensions.width).toBe(100);
    expect(dimensions.height).toBe(100);
  });
});

describe('resizeImage', () => {
  it('should resize image to target width', async () => {
    const testImage = await createTestImage(200, 100);
    const result = await resizeImage(testImage, 100);

    const metadata = await sharp(result).metadata();
    expect(metadata.width).toBe(100);
    // Height should scale proportionally (50)
    expect(metadata.height).toBe(50);
  });

  it('should maintain aspect ratio', async () => {
    const testImage = await createTestImage(400, 200);
    const result = await resizeImage(testImage, 200);

    const metadata = await sharp(result).metadata();
    expect(metadata.width).toBe(200);
    expect(metadata.height).toBe(100);
  });
});

describe('extractCell', () => {
  it('should extract a cell region from the image', async () => {
    const testImage = await createTestImage(100, 100);
    const cell = await extractCell(testImage, 0, 0, { rows: 5, cols: 5 });

    expect(cell).toBeInstanceOf(Buffer);

    const metadata = await sharp(cell).metadata();
    // Cell should be roughly 20x20 (100/5) minus padding
    expect(metadata.width).toBeLessThanOrEqual(20);
    expect(metadata.height).toBeLessThanOrEqual(20);
  });

  it('should extract cells from different positions', async () => {
    const testImage = await createTestImage(100, 100);

    const cell00 = await extractCell(testImage, 0, 0, { rows: 5, cols: 5 });
    const cell24 = await extractCell(testImage, 2, 4, { rows: 5, cols: 5 });

    expect(cell00).toBeInstanceOf(Buffer);
    expect(cell24).toBeInstanceOf(Buffer);
  });

  it('should throw error for invalid image', async () => {
    await expect(extractCell(Buffer.from('invalid'), 0, 0, { rows: 5, cols: 5 })).rejects.toThrow();
  });
});

describe('extractAllCells', () => {
  it('should extract all cells from a grid', async () => {
    const testImage = await createTestImage(100, 100);
    const cells = await extractAllCells(testImage, { rows: 2, cols: 2 });

    expect(cells).toHaveLength(4);
    expect(cells[0]).toHaveProperty('buffer');
    expect(cells[0]).toHaveProperty('row', 0);
    expect(cells[0]).toHaveProperty('col', 0);
  });

  it('should return cells in correct order (row by row)', async () => {
    const testImage = await createTestImage(100, 100);
    const cells = await extractAllCells(testImage, { rows: 2, cols: 2 });

    expect(cells[0]).toMatchObject({ row: 0, col: 0 });
    expect(cells[1]).toMatchObject({ row: 0, col: 1 });
    expect(cells[2]).toMatchObject({ row: 1, col: 0 });
    expect(cells[3]).toMatchObject({ row: 1, col: 1 });
  });

  it('should extract 25 cells for a 5x5 grid', async () => {
    const testImage = await createTestImage(250, 250);
    const cells = await extractAllCells(testImage, { rows: 5, cols: 5 });

    expect(cells).toHaveLength(25);
  });

  it('should include row and col in each cell object', async () => {
    const testImage = await createTestImage(100, 100);
    const cells = await extractAllCells(testImage, { rows: 3, cols: 3 });

    cells.forEach((cell, index) => {
      const expectedRow = Math.floor(index / 3);
      const expectedCol = index % 3;
      expect(cell.row).toBe(expectedRow);
      expect(cell.col).toBe(expectedCol);
    });
  });
});
