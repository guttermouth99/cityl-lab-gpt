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
  execute: async (inputData) => {
    const MAX_RESULTS = 5;
    const MAX_SNIPPET_CHARS = 400;
    console.log(inputData, "inputData in jina-search tool");
    const jinaApiKey = process.env.JINA_API_KEY;
    if (!jinaApiKey) {
      throw new Error("JINA_API_KEY environment variable is not configured");
    }

    const response = await fetch(
      `https://s.jina.ai/${encodeURIComponent(inputData.query)}`,
      {
        headers: {
          Authorization: `Bearer ${jinaApiKey}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Search failed for "${inputData.query}": ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    const rawResults = Array.isArray(data)
      ? data
      : Array.isArray(data.results)
        ? data.results
        : data.data;

    const sanitizedResults = Array.isArray(rawResults)
      ? rawResults.slice(0, MAX_RESULTS).map((item) => {
          const title = item.title ?? item.source?.title ?? "Untitled";
          const url = item.url ?? item.link ?? item.source?.url ?? "";
          const snippet = (
            item.snippet ??
            item.description ??
            item.content ??
            ""
          )
            .toString()
            .slice(0, MAX_SNIPPET_CHARS);

          return { title, url, snippet };
        })
      : [];

    return {
      results: JSON.stringify(
        {
          query: inputData.query,
          results: sanitizedResults,
          truncated:
            Array.isArray(rawResults) && rawResults.length > MAX_RESULTS,
        },
        null,
        2
      ),
    };
  },
});
