import { mastra } from "@baito/mastra";
import { task } from "@trigger.dev/sdk";

interface AssessImpactPayload {
  companyName: string;
  companyUrl?: string;
}

interface AssessImpactResult {
  companyName: string;
  verdict: "Has Impact" | "No Clear Impact" | "Insufficient Information";
  confidenceLevel: "High" | "Medium" | "Low";
  summary: string;
  action: "marked_as_impact" | "marked_as_blacklisted";
}

export const assessImpactTask = task({
  id: "assess-impact",
  retry: {
    maxAttempts: 2,
    minTimeoutInMs: 5000,
    maxTimeoutInMs: 30_000,
    factor: 2,
  },
  run: async (payload: AssessImpactPayload): Promise<AssessImpactResult> => {
    const { companyName, companyUrl } = payload;

    console.log(`Assessing impact for: ${companyName}`);

    const workflow = mastra.getWorkflow("impactAssessmentWorkflow");
    const run = workflow.createRun();

    const result = await run.start({
      inputData: {
        companyName,
        companyUrl,
      },
    });

    if (result.status !== "success") {
      const errorMessage =
        result.status === "failed" && "error" in result
          ? JSON.stringify(result.error)
          : "Unknown error";
      throw new Error(
        `Workflow failed with status: ${result.status}. Error: ${errorMessage}`
      );
    }

    const output = result.result;

    console.log(
      `Assessment complete for ${companyName}: ${output.verdict} (${output.action})`
    );

    return {
      companyName: output.companyName,
      verdict: output.verdict,
      confidenceLevel: output.confidenceLevel,
      summary: output.summary,
      action: output.action,
    };
  },
});
