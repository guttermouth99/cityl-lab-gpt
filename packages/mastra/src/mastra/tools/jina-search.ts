import { createTool } from "@mastra/core/tools";
import { ofetch } from "ofetch";
import { z } from "zod";

interface JinaSearchResult {
  title: string;
  url: string;
  description: string;
  content: string;
  date?: string;
  usage: {
    tokens: number;
  };
}

interface JinaSearchResponse {
  code: number;
  status: number;
  data: JinaSearchResult[];
  meta: {
    usage: {
      tokens: number;
    };
  };
}

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
    tokensUsed: z.number().describe("Number of tokens used by Jina Search API"),
  }),
  execute: async (inputData) => {
    const MAX_RESULTS = 5;
    const MAX_SNIPPET_CHARS = 400;

    const jinaApiKey = process.env.JINA_API_KEY;
    if (!jinaApiKey) {
      throw new Error("JINA_API_KEY environment variable is not configured");
    }

    const response = await ofetch<JinaSearchResponse>(
      `https://s.jina.ai/${encodeURIComponent(inputData.query)}`,
      {
        headers: {
          Authorization: `Bearer ${jinaApiKey}`,
          Accept: "application/json",
        },
      }
    );

    const sanitizedResults = response.data
      .slice(0, MAX_RESULTS)
      .map((item) => ({
        title: item.title,
        url: item.url,
        snippet: item.description.slice(0, MAX_SNIPPET_CHARS),
      }));

    const tokensUsed = response.meta?.usage?.tokens ?? 0;

    return {
      results: JSON.stringify(
        {
          query: inputData.query,
          results: sanitizedResults,
          truncated: response.data.length > MAX_RESULTS,
        },
        null,
        2
      ),
      tokensUsed,
    };
  },
});
