import { Agent } from "@mastra/core/agent";

import { jinaSearchTool } from "../tools/jina-search";

/**
 * Example Agent - A simple agent that can search the web
 *
 * This agent demonstrates basic Mastra agent setup with a tool.
 * It uses the Jina Search tool to find information on the web.
 */
export const exampleAgent = new Agent({
  id: "example-agent",
  name: "Example Agent",
  description: "A simple example agent that can search the web",
  instructions: `
    You are a helpful assistant. When given a message or question:
    
    1. If the user asks about something you can search for, use the jina-search tool
    2. Synthesize the information into a clear, concise response
    3. Be helpful and informative
    
    Keep responses brief but informative.
  `,
  model: "openai/gpt-4o-mini",
  tools: { jinaSearchTool },
});
