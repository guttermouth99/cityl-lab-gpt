/**
 * Generate a content hash for change detection.
 * Used to detect when job/organization content has changed.
 */
export async function computeContentHash(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Synchronous hash using Bun's built-in hasher (for server-side use)
 */
export function computeContentHashSync(content: string): string {
  const hasher = new Bun.CryptoHasher('sha256')
  hasher.update(content)
  return hasher.digest('hex')
}

/**
 * Create a deterministic hash from job data for duplicate detection.
 * Normalizes the data before hashing to catch near-duplicates.
 */
export function createJobContentHash(job: {
  title: string
  description: string
  organizationId: string
}): string {
  const normalized = [
    normalizeText(job.title),
    normalizeText(job.description.substring(0, 1000)), // First 1000 chars
    job.organizationId,
  ].join('|')

  return computeContentHashSync(normalized)
}

/**
 * Normalize text for comparison (lowercase, remove extra whitespace, etc.)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim()
}
