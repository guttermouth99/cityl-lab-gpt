/**
 * Token counting utilities using js-tiktoken
 *
 * Uses the o200k_base tokenizer (GPT-4o) for consistent token counting
 * across chunking and embedding operations.
 */

import { getEncoding } from "js-tiktoken";

// Initialize the tokenizer once (o200k_base is used by GPT-4o)
const encoder = getEncoding("o200k_base");

// Pre-compiled regex for word splitting (moved to top level for performance)
const WORD_SPLIT_REGEX = /\s+/;

/**
 * Count the number of tokens in a text string
 * @param text - The text to count tokens for
 * @returns The number of tokens
 */
export function countTokens(text: string): number {
  if (!text) {
    return 0;
  }
  return encoder.encode(text).length;
}

/**
 * Trim text to a token limit by words using binary search.
 * This is more efficient than character-by-character trimming.
 *
 * @param text - The text to trim
 * @param maxTokens - Maximum number of tokens allowed
 * @returns The trimmed text, or empty string if cannot be trimmed
 */
export function trimToTokenLimitByWords(
  text: string,
  maxTokens: number
): string {
  const words = text.split(WORD_SPLIT_REGEX);
  if (words.length === 0) {
    return "";
  }

  // Check if already within limit
  if (countTokens(text) <= maxTokens) {
    return text;
  }

  // Binary search for the right number of words
  let low = 0;
  let high = words.length;
  let result = "";

  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2);
    const candidate = words.slice(0, mid).join(" ");
    const tokenCount = countTokens(candidate);

    if (tokenCount <= maxTokens) {
      result = candidate;
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  return result;
}
