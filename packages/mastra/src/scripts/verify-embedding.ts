/**
 * Verify the embedded content by checking stats and running a test query.
 *
 * Usage: bun run src/scripts/verify-embedding.ts
 */

import { openai } from "@ai-sdk/openai";
import { embed } from "ai";

import { getEmbeddingStats } from "../mastra/rag/embed";
import { pgVector } from "../mastra/vector";

async function main() {
  console.log("=== Verifying Embedded Content ===\n");

  // Step 1: Get embedding stats
  console.log("Checking embedding statistics...");
  const stats = await getEmbeddingStats();
  console.log(`  Index exists: ${stats.indexExists}`);
  console.log(`  Total chunks: ${stats.totalChunks}`);

  // Step 2: Run a test query
  const testQuery = "Was ist Tool-Calling bei BärGPT?";
  console.log(`\nRunning test query: "${testQuery}"`);

  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: testQuery,
    providerOptions: {
      openai: {
        dimensions: 512,
      },
    },
  });

  const results = await pgVector.query({
    indexName: "citylab_content",
    queryVector: embedding,
    topK: 3,
  });

  console.log("\nTop 3 results:");
  for (const result of results) {
    console.log(`\n  Score: ${result.score.toFixed(4)}`);
    console.log(`  Title: ${result.metadata?.title}`);
    console.log(`  Text: ${String(result.metadata?.text).slice(0, 200)}...`);
  }

  console.log("\n=== Done ===");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
