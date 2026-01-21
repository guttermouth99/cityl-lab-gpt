import { ofetch } from "ofetch";

/**
 * Response from Jina Reader API when using JSON format
 */
export interface JinaReaderResponse {
  code: number;
  status: number;
  data: {
    title: string;
    url: string;
    content: string;
    description?: string;
    publishedTime?: string;
    usage: {
      tokens: number;
    };
  };
}

/**
 * Parsed content from Jina Reader
 */
export interface JinaReaderContent {
  title: string;
  url: string;
  content: string;
  description?: string;
  publishedTime?: string;
  tokensUsed: number;
}

/**
 * Fetch and extract content from a URL using Jina AI Reader API
 *
 * Uses r.jina.ai to fetch the content of a URL and return it in a clean,
 * LLM-friendly markdown format with metadata.
 *
 * @param url - The URL to fetch content from
 * @returns Parsed content with title, content, and metadata
 */
export async function fetchUrlContent(url: string): Promise<JinaReaderContent> {
  const jinaApiKey = process.env.JINA_API_KEY;
  if (!jinaApiKey) {
    throw new Error("JINA_API_KEY environment variable is not configured");
  }

  const response = await ofetch<JinaReaderResponse>(
    `https://r.jina.ai/${url}`,
    {
      headers: {
        Authorization: `Bearer ${jinaApiKey}`,
        Accept: "application/json",
      },
    }
  );

  if (response.code !== 200 || !response.data) {
    throw new Error(
      `Jina Reader failed with status ${response.status}: Unable to fetch content from URL`
    );
  }

  return {
    title: response.data.title,
    url: response.data.url,
    content: response.data.content,
    description: response.data.description,
    publishedTime: response.data.publishedTime,
    tokensUsed: response.data.usage?.tokens ?? 0,
  };
}
