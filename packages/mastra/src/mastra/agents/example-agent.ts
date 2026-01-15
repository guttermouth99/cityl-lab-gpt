import { Agent } from "@mastra/core/agent";

import { exampleTool } from "../tools/example-tool";

export const exampleAgent = new Agent({
  name: "Example Agent",
  instructions: `
    You are a helpful assistant that can answer questions and help with tasks.
    
    When responding:
    - Be concise and clear
    - Ask for clarification if the request is ambiguous
    - Use the available tools when appropriate
  `,
  model: "openai/gpt-4o",
  tools: { exampleTool },
});
