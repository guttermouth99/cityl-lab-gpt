import type { Mastra } from "@mastra/core/mastra";

import { isBotInitialized, notifyHumanReview } from "./index";

/**
 * Run the impact assessment workflow
 *
 * Note: Telegram notifications are now sent directly from the humanReviewStep
 * when the workflow suspends. This wrapper provides a convenient API for
 * running the workflow and accessing the result.
 */
export async function runImpactAssessmentWithTelegram(
  mastra: Mastra,
  input: {
    companyName: string;
    companyUrl?: string;
  }
) {
  const workflow = mastra.getWorkflow("impactAssessmentWorkflow");
  const run = await workflow.createRun();

  // Start the workflow
  // Note: If human review is needed, the humanReviewStep will automatically
  // send a Telegram notification (if bot is initialized) before suspending
  const result = await run.start({
    inputData: input,
  });

  if (result.status === "suspended") {
    console.log(
      `[Workflow Integration] Workflow suspended for "${input.companyName}" - awaiting human review via Telegram or Mastra UI`
    );
  }

  return {
    run,
    result,
    runId: run.runId,
    status: result.status,
  };
}

/**
 * Check if a run is suspended and send Telegram notification
 *
 * Useful when you want to check an existing run's status
 */
export async function checkAndNotifySuspendedRun(
  mastra: Mastra,
  runId: string,
  suspendPayload?: {
    companyName: string;
    deciderVerdict: string;
    deciderConfidence: string;
    deciderReasoning: string;
    unresolvedConcerns: string[];
  }
): Promise<boolean> {
  if (!isBotInitialized()) {
    console.warn(
      "[Telegram Integration] Bot not initialized, skipping notification"
    );
    return false;
  }

  if (!suspendPayload) {
    console.warn(
      "[Telegram Integration] No suspend payload provided, skipping notification"
    );
    return false;
  }

  await notifyHumanReview(runId, {
    companyName: suspendPayload.companyName,
    deciderVerdict: suspendPayload.deciderVerdict,
    deciderConfidence: suspendPayload.deciderConfidence,
    deciderReasoning: suspendPayload.deciderReasoning,
    unresolvedConcerns: suspendPayload.unresolvedConcerns,
  });

  return true;
}
