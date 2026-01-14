import { openai, EMBEDDING_MODEL } from '../client'

/**
 * Generate embeddings for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  })

  return response.data[0]?.embedding || []
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []

  // OpenAI supports up to 2048 inputs per request
  const batchSize = 2048
  const results: number[][] = []

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    })

    results.push(...response.data.map((d) => d.embedding))
  }

  return results
}

/**
 * Create a searchable embedding from job data
 */
export async function createJobEmbedding(job: {
  title: string
  description: string
  organizationName: string
}): Promise<number[]> {
  // Combine relevant fields for embedding
  const text = `${job.title}\n${job.organizationName}\n${job.description.substring(0, 2000)}`
  return generateEmbedding(text)
}

/**
 * Create a searchable embedding from organization data
 */
export async function createOrgEmbedding(org: {
  name: string
  description?: string
}): Promise<number[]> {
  const text = org.description ? `${org.name}\n${org.description}` : org.name
  return generateEmbedding(text)
}
