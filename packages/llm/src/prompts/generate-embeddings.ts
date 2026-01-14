import { embed, embedMany } from "ai";

const EMBEDDING_MODEL = "openai/text-embedding-3-small";

/**
 * Generate embeddings for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: EMBEDDING_MODEL,
    value: text,
  });

  return embedding;
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const { embeddings } = await embedMany({
    model: EMBEDDING_MODEL,
    values: texts,
  });

  return embeddings;
}

/**
 * Create a searchable embedding from job data
 */
export function createJobEmbedding(job: {
  title: string;
  description: string;
  organizationName: string;
}): Promise<number[]> {
  const text = `${job.title}\n${job.organizationName}\n${job.description.substring(0, 2000)}`;
  return generateEmbedding(text);
}

/**
 * Create a searchable embedding from organization data
 */
export function createOrgEmbedding(org: {
  name: string;
  description?: string;
}): Promise<number[]> {
  const text = org.description ? `${org.name}\n${org.description}` : org.name;
  return generateEmbedding(text);
}
