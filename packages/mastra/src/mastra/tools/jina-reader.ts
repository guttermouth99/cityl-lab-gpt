import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Jina Reader tool for extracting content from URLs using r.jina.ai API
 */
export const jinaReaderTool = createTool({
  id: "jina-reader",
  description:
    "Read and extract content from a URL as clean markdown. Use this to analyze organization websites, about pages, impact reports, and other web content.",
  inputSchema: z.object({
    url: z
      .string()
      .describe(
        "The URL to read and extract content from (must be a valid URL)"
      ),
  }),
  outputSchema: z.object({
    content: z.string().describe("The extracted page content as markdown"),
  }),
  execute: async (inputData) => {
    const MAX_CONTENT_CHARS = 15_000;

    const jinaApiKey = process.env.JINA_API_KEY;
    if (!jinaApiKey) {
      throw new Error("JINA_API_KEY environment variable is not configured");
    }

    const response = await fetch(`https://r.jina.ai/${inputData.url}`, {
      headers: {
        Authorization: `Bearer ${jinaApiKey}`,
        "X-Engine": "browser",
        "X-Return-Format": "markdown",
        "X-Timeout": "20",
        "X-With-Iframe": "true",
        "X-With-Shadow-Dom": "true",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to read content from ${inputData.url}: ${response.status} ${response.statusText}`
      );
    }

    const fullContent = await response.text();
    const truncated =
      fullContent.length > MAX_CONTENT_CHARS
        ? `${fullContent.slice(0, MAX_CONTENT_CHARS)}\n\n[content truncated to ${MAX_CONTENT_CHARS} characters]`
        : fullContent;

    return { content: truncated };
  },
});
