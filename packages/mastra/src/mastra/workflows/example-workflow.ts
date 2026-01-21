import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

import { exampleAgent } from "../agents/example-agent";

/**
 * Process step - uses the example agent to generate a response
 */
const processStep = createStep({
  id: "process",
  inputSchema: z.object({
    message: z.string().describe("The user's message"),
  }),
  outputSchema: z.object({
    response: z.string().describe("The generated response"),
  }),
  execute: async ({ inputData }) => {
    const result = await exampleAgent.generate(inputData.message);
    return { response: result.text };
  },
});

/**
 * Example Workflow
 *
 * A simple single-step workflow that demonstrates Mastra workflow setup.
 * Takes a message and returns a response from the example agent.
 */
export const exampleWorkflow = createWorkflow({
  id: "example-workflow",
  inputSchema: z.object({
    message: z.string().describe("The message to process"),
  }),
  outputSchema: z.object({
    response: z.string().describe("The generated response"),
  }),
})
  .then(processStep)
  .commit();
