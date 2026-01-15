import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Jina Search tool for web searches using s.jina.ai API
 */
export const jinaSearchTool = createTool({
  id: "jina-search",
  description:
    "Search the web for information about organizations, companies, or topics. Returns search results with titles, URLs, and snippets.",
  inputSchema: z.object({
    query: z.string().describe("The search query to find information about"),
  }),
  outputSchema: z.object({
    results: z.string().describe("JSON string containing search results"),
  }),
  execute: async ({ context }) => {
    const jinaApiKey = process.env.JINA_API_KEY;
    if (!jinaApiKey) {
      throw new Error("JINA_API_KEY environment variable is not configured");
    }

    const response = await fetch(
      `https://s.jina.ai/${encodeURIComponent(context.query)}`,
      {
        headers: {
          Authorization: `Bearer ${jinaApiKey}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Search failed for "${context.query}": ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return {
      results: JSON.stringify(data, null, 2),
    };
  },
});
