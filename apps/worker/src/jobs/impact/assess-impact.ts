import { mastra } from "@baito/mastra";
import { metadata, tags, task } from "@trigger.dev/sdk";

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

    // Create a run ID prefixed with the company name for easier identification in the dashboard
    const sanitizedName = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const runId = `${sanitizedName}-${Date.now()}`;

    // Add company name as tag for easier filtering in the dashboard
    await tags.add(`company:${sanitizedName}`);

    // Add link to Mastra workflow graph in run metadata
    const mastraGraphUrl = `http://localhost:4111/workflows/impactAssessmentWorkflow/graph/${runId}`;
    metadata.set("mastraGraphUrl", mastraGraphUrl);

    const run = await workflow.createRun({ runId });

    const result = await run.start({
      inputData: {
        companyName,
        companyUrl,
      },
    });

    // Store the trace ID for observability correlation
    if (result.traceId) {
      metadata.set("mastraTraceId", result.traceId);
      // If using Mastra's observability UI, you can link directly to the trace
      metadata.set(
        "mastraTraceUrl",
        `http://localhost:4111/traces/${result.traceId}`
      );
    }

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
