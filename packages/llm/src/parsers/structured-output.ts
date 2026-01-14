/**
 * Parse JSON output from LLM with fallback defaults
 */
export function parseStructuredOutput<T>(content: string, defaults: T): T {
  try {
    const parsed = JSON.parse(content)
    return { ...defaults, ...parsed }
  } catch (error) {
    console.error('Failed to parse LLM output:', error)
    return defaults
  }
}

/**
 * Validate that a value is one of the allowed enum values
 */
export function validateEnum<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
): T | null {
  if (typeof value !== 'string') return null
  if (allowedValues.includes(value as T)) {
    return value as T
  }
  return null
}

/**
 * Clean and normalize LLM text output
 */
export function cleanLLMOutput(text: string): string {
  return text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()
}
