/**
 * Split an array into chunks of a specified size.
 * Useful for batch processing jobs, emails, etc.
 *
 * @param array - The array to chunk
 * @param size - Maximum size of each chunk
 * @returns Array of chunks
 *
 * @example
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) {
    throw new Error("Chunk size must be greater than 0");
  }

  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * Process an array in batches with a callback function.
 * Processes each batch sequentially.
 *
 * @param array - The array to process
 * @param batchSize - Size of each batch
 * @param callback - Function to call for each batch
 *
 * @example
 * await processBatches(jobs, 50, async (batch) => {
 *   await db.insert(batch)
 * })
 */
export async function processBatches<T>(
  array: T[],
  batchSize: number,
  callback: (batch: T[], index: number) => Promise<void>
): Promise<void> {
  const batches = chunk(array, batchSize);

  for (let i = 0; i < batches.length; i++) {
    await callback(batches[i]!, i);
  }
}

/**
 * Process an array in parallel batches with concurrency control.
 *
 * @param array - The array to process
 * @param batchSize - Size of each batch
 * @param concurrency - Maximum number of parallel batches
 * @param callback - Function to call for each batch
 */
export async function processParallelBatches<T, R>(
  array: T[],
  batchSize: number,
  concurrency: number,
  callback: (batch: T[], index: number) => Promise<R>
): Promise<R[]> {
  const batches = chunk(array, batchSize);
  const results: R[] = [];

  for (let i = 0; i < batches.length; i += concurrency) {
    const parallelBatches = batches.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      parallelBatches.map((batch, idx) => callback(batch!, i + idx))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Create a generator that yields chunks of an array.
 * Useful for memory-efficient processing of large arrays.
 */
export function* chunkGenerator<T>(array: T[], size: number): Generator<T[]> {
  for (let i = 0; i < array.length; i += size) {
    yield array.slice(i, i + size);
  }
}
