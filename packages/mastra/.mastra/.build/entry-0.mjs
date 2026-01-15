import { Agent } from "@mastra/core/agent";
import { Mastra } from "@mastra/core/mastra";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

("use strict");
const exampleTool = createTool({
  id: "example-tool",
  description: "An example tool that echoes the input message",
  inputSchema: z.object({
    message: z.string().describe("The message to echo"),
  }),
  outputSchema: z.object({
    output: z.string(),
  }),
  execute: async ({ context }) => {
    return {
      output: `Echo: ${context.message}`,
    };
  },
});

("use strict");
const exampleAgent = new Agent({
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

("use strict");
const mastra = new Mastra({
  agents: {
    exampleAgent,
  },
});

export { mastra };
