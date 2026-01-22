import { PgVector } from "@mastra/pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is required for vector store"
  );
}

export const pgVector = new PgVector({
  id: "citylab-pgvector",
  connectionString,
});

/**
 * Initialize the vector index for CityLAB content.
 * Run this once to create the index in your Neon database.
 *
 * Prerequisites:
 * 1. Enable pgvector extension: CREATE EXTENSION IF NOT EXISTS vector;
 * 2. Ensure DATABASE_URL points to your Neon Postgres instance
 */
export async function initializeCityLabIndex(): Promise<void> {
  await pgVector.createIndex({
    indexName: "citylab_content",
    dimension: 256, // jina-embeddings-v3 Matryoshka dimension (98.9% quality)
    metric: "cosine",
    indexConfig: {
      type: "hnsw",
      hnsw: {
        m: 16,
        efConstruction: 64,
      },
    },
  });
}

/**
 * Check if the CityLAB content index exists
 */
export async function cityLabIndexExists(): Promise<boolean> {
  const indexes = await pgVector.listIndexes();
  return indexes.includes("citylab_content");
}
