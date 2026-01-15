import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const exampleTool = createTool({
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
