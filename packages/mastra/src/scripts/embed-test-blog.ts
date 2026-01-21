/**
 * Test script to embed a CityLAB Berlin blog post into the vector database.
 *
 * Usage: bun run src/scripts/embed-test-blog.ts
 *
 * Prerequisites:
 * - DATABASE_URL pointing to Neon Postgres with pgvector extension
 * - JINA_API_KEY for Jina Reader API
 * - OPENAI_API_KEY for embeddings
 */

import { ofetch } from "ofetch";

import { embedContent } from "../mastra/rag/embed";
import type { CityLabContent } from "../mastra/rag/types";
import { cityLabIndexExists, initializeCityLabIndex } from "../mastra/vector";

const BLOG_URL =
  "https://citylab-berlin.org/de/blog/baergpt-technischer-deep-dive-ki-assistenten-berliner-verwaltung/";

interface JinaReaderResponse {
  code: number;
  status: number;
  data: {
    title: string;
    description: string;
    url: string;
    content: string;
    usage: {
      tokens: number;
    };
  };
}

/**
 * Fetch blog content as markdown using Jina Reader API
 */
async function fetchBlogContent(url: string): Promise<string> {
  const jinaApiKey = process.env.JINA_API_KEY;
  if (!jinaApiKey) {
    throw new Error("JINA_API_KEY environment variable is required");
  }

  console.log(`Fetching content from: ${url}`);

  const response = await ofetch<JinaReaderResponse>(
    `https://r.jina.ai/${url}`,
    {
      headers: {
        Authorization: `Bearer ${jinaApiKey}`,
        Accept: "application/json",
        "X-Return-Format": "markdown",
      },
    }
  );

  console.log(`Fetched ${response.data.usage.tokens} tokens from Jina Reader`);
  return response.data.content;
}

async function main() {
  console.log("=== Embedding CityLAB Blog Post ===\n");

  // Step 1: Ensure the vector index exists
  console.log("Checking vector index...");
  const indexExists = await cityLabIndexExists();
  if (indexExists) {
    console.log("Index already exists");
  } else {
    console.log("Creating citylab_content index...");
    await initializeCityLabIndex();
    console.log("Index created successfully");
  }

  // Step 2: Fetch blog content
  console.log("\nFetching blog content...");
  const markdownContent = await fetchBlogContent(BLOG_URL);
  console.log(`Content length: ${markdownContent.length} characters`);

  // Step 3: Prepare content object
  const content: CityLabContent = {
    id: "blog-baergpt-technical-deep-dive",
    title:
      "BärGPT: Der technische Deep Dive zum neuen KI-Assistenten für die Berliner Verwaltung",
    content: markdownContent,
    url: BLOG_URL,
    contentType: "blog",
    language: "de",
    publishedAt: "2025-11-25",
    author: "Malte Barth",
    tags: ["BärGPT", "KI", "Tool-Calling", "RAG", "Architektur"],
  };

  // Step 4: Embed the content
  console.log("\nEmbedding content...");
  const result = await embedContent(content);

  if (result.success) {
    console.log(`\n✓ Successfully embedded "${content.title}"`);
    console.log(`  Chunks created: ${result.chunksCreated}`);
    console.log(`  Content ID: ${result.contentId}`);
  } else {
    console.error(`\n✗ Failed to embed content: ${result.error}`);
    process.exit(1);
  }

  console.log("\n=== Done ===");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
