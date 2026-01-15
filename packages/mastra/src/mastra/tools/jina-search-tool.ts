import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const jinaSearchTool = createTool({
  id: "jina-search",
  description:
    "Search the web for information about a company using Jina AI. Use this to find company details, certifications, news, sustainability reports, and impact-related information.",
  inputSchema: z.object({
    query: z.string().describe("The search query to find company information"),
  }),
  outputSchema: z.object({
    results: z.string().describe("Search results in markdown format"),
  }),
  execute: async ({ context }) => {
    const encodedQuery = encodeURIComponent(context.query);
    const response = await fetch(`https://s.jina.ai/${encodedQuery}`, {
      headers: {
        Authorization: `Bearer ${process.env.JINA_API_KEY}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Jina Search API error: ${response.status} ${response.statusText}`
      );
    }

    const results = await response.text();
    return { results };
  },
});
