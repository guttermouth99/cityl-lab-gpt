import { mastra } from "@baito/mastra";
import { task } from "@trigger.dev/sdk";

export const helloWorldTask = task({
  id: "hello-world",
  run: async (payload: { message: string }) => {
    console.log(`Running example workflow with message: ${payload.message}`);

    const workflow = mastra.getWorkflow("exampleWorkflow");
    const run = await workflow.createRun();

    const result = await run.start({
      inputData: { message: payload.message },
    });

    if (result.status === "success") {
      return { response: result.result.response };
    }

    throw new Error(`Workflow failed: ${result.status}`);
  },
});
