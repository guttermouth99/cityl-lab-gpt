/**
 * Verify the embedded content by checking stats and running a test query.
 *
 * Usage: bun run src/scripts/verify-embedding.ts
 */

import { generateJinaEmbedding, getEmbeddingStats } from "../mastra/rag/embed";
import { pgVector } from "../mastra/vector";

async function main() {
  console.log("=== Verifying Embedded Content (Jina AI) ===\n");

  // Step 1: Get embedding stats
  console.log("Checking embedding statistics...");
  const stats = await getEmbeddingStats();
  console.log(`  Index exists: ${stats.indexExists}`);
  console.log(`  Total chunks: ${stats.totalChunks}`);

  if (!stats.indexExists || stats.totalChunks === 0) {
    console.log(
      "\n⚠️  No embedded content found. Please embed some documents first."
    );
    return;
  }

  // Step 2: Run a test query using Jina AI embeddings
  const testQuery = "Was ist Tool-Calling bei BärGPT?";
  console.log(`\nRunning test query: "${testQuery}"`);
  console.log("Using Jina AI embeddings with retrieval.query task...");

  const { embedding, tokenUsage } = await generateJinaEmbedding(
    testQuery,
    "retrieval.query"
  );

  console.log(`  Embedding dimensions: ${embedding.length}`);
  console.log(`  Tokens used: ${tokenUsage}`);

  const results = await pgVector.query({
    indexName: "citylab_content",
    queryVector: embedding,
    topK: 3,
  });

  console.log("\nTop 3 results:");
  for (const result of results) {
    console.log(`\n  Score: ${result.score.toFixed(4)}`);
    console.log(`  Title: ${result.metadata?.title}`);
    console.log(`  Content Type: ${result.metadata?.contentType}`);
    console.log(`  Text: ${String(result.metadata?.text).slice(0, 200)}...`);
  }

  console.log("\n=== Done ===");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
