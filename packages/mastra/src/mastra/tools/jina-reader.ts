import { createTool } from "@mastra/core/tools";
import { ofetch } from "ofetch";
import { z } from "zod";

interface JinaReaderResponse {
  code: number;
  status: number;
  data: {
    title: string;
    url: string;
    content: string;
    usage: {
      tokens: number;
    };
  };
}

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
    tokensUsed: z.number().describe("Number of tokens used by Jina Reader API"),
  }),
  execute: async (inputData) => {
    const MAX_CONTENT_CHARS = 15_000;

    const jinaApiKey = process.env.JINA_API_KEY;
    if (!jinaApiKey) {
      throw new Error("JINA_API_KEY environment variable is not configured");
    }

    const response = await ofetch<JinaReaderResponse>(
      `https://r.jina.ai/${inputData.url}`,
      {
        headers: {
          Authorization: `Bearer ${jinaApiKey}`,
          Accept: "application/json",
          "X-Engine": "browser",
          "X-Timeout": "20",
          "X-With-Iframe": "true",
          "X-With-Shadow-Dom": "true",
        },
      }
    );

    const fullContent = response.data.content;
    const truncated =
      fullContent.length > MAX_CONTENT_CHARS
        ? `${fullContent.slice(0, MAX_CONTENT_CHARS)}\n\n[content truncated to ${MAX_CONTENT_CHARS} characters]`
        : fullContent;

    const tokensUsed = response.data.usage?.tokens ?? 0;

    return { content: truncated, tokensUsed };
  },
});
