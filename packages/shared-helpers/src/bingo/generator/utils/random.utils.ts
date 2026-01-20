/**
 * Generate a random integer within a range (inclusive)
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @returns Random integer between min and max
 */
export function getRandomInt(min: number, max: number): number {
  const minInt = Math.ceil(min);
  const maxInt = Math.floor(max);
  return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
}

/**
 * Get a specified number of unique random numbers within a range
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @param count Number of unique values to generate
 * @returns Array of unique random numbers
 * @throws Error if count exceeds the range size
 */
export function getRandomNumbersInRange(min: number, max: number, count: number): number[] {
  const rangeSize = max - min + 1;

  if (count > rangeSize) {
    throw new Error(
      `Cannot generate ${count} unique numbers in range [${min}, ${max}] (range size: ${rangeSize})`,
    );
  }

  if (count === 0) {
    return [];
  }

  // For efficiency, create array of all possible values and shuffle
  const available: number[] = [];
  for (let i = min; i <= max; i++) {
    available.push(i);
  }

  // Fisher-Yates shuffle and take first 'count' elements
  for (let i = available.length - 1; i > 0; i--) {
    const j = getRandomInt(0, i);
    const temp = available[i]!;
    available[i] = available[j]!;
    available[j] = temp;
  }

  return available.slice(0, count);
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param array Array to shuffle (not mutated)
 * @returns New shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = getRandomInt(0, i);
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }

  return result;
}
