/**
 * Jina Reader API service for fetching web page content as markdown
 */

export interface FetchPageContentOptions {
  timeout?: string;
  withIframe?: boolean;
  withShadowDom?: boolean;
}

const DEFAULT_OPTIONS: FetchPageContentOptions = {
  timeout: "20",
  withIframe: true,
  withShadowDom: true,
};

/**
 * Fetch page content using Jina Reader API
 * Returns the page content as markdown for LLM processing
 */
export async function fetchPageContent(
  url: string,
  options: FetchPageContentOptions = {}
): Promise<string> {
  const jinaApiKey = process.env.JINA_API_KEY;
  if (!jinaApiKey) {
    throw new Error("JINA_API_KEY environment variable is not configured");
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };

  const response = await fetch(`https://r.jina.ai/${url}`, {
    headers: {
      Authorization: `Bearer ${jinaApiKey}`,
      "X-Engine": "browser",
      "X-Return-Format": "markdown",
      "X-Timeout": opts.timeout ?? "20",
      "X-With-Iframe": opts.withIframe ? "true" : "false",
      "X-With-Shadow-Dom": opts.withShadowDom ? "true" : "false",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch page content from ${url}: ${response.status} ${response.statusText}`
    );
  }

  return response.text();
}
