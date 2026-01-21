import { Agent } from "@mastra/core/agent";

import { jinaReaderTool } from "../tools/jina-reader";
import { youtubeTranscriberTool } from "../tools/youtube-transcriber";

/**
 * Content Retrieval Agent
 *
 * Analyzes input URLs and routes to the appropriate content fetcher:
 * - YouTube Transcriber for youtube.com/youtu.be URLs
 * - Jina Reader for all other webpages
 */
export const contentRetrievalAgent = new Agent({
  id: "content-retrieval",
  name: "Content Retrieval Agent",
  instructions: `You are a content retrieval agent. Given a URL, determine the source type and fetch content using the appropriate tool.

- For YouTube URLs (youtube.com, youtu.be), use youtubeTranscriberTool
- For all other URLs, use jinaReaderTool

Always call exactly one tool to fetch the content. Return the result directly.`,
  model: "openai/gpt-4o-mini",
  tools: { jinaReaderTool, youtubeTranscriberTool },
});
