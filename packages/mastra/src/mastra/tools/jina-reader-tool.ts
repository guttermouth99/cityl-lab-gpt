import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const jinaReaderTool = createTool({
  id: "jina-reader",
  description:
    "Read and extract content from a URL in markdown format using Jina AI Reader. Use this to read company websites, about pages, sustainability reports, and other web pages.",
  inputSchema: z.object({
    url: z.string().url().describe("The URL to read and extract content from"),
  }),
  outputSchema: z.object({
    content: z.string().describe("Page content in markdown format"),
  }),
  execute: async ({ context }) => {
    const response = await fetch(`https://r.jina.ai/${context.url}`, {
      headers: {
        Authorization: `Bearer ${process.env.JINA_API_KEY}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Jina Reader API error: ${response.status} ${response.statusText}`
      );
    }

    const content = await response.text();
    return { content };
  },
});
