import {
  type DocumentReviewPayload,
  type EmbedDocumentInput,
  type EmbedDocumentOutput,
  type ExtractedDocumentData,
  mastra,
} from "@baito/mastra";
import { metadata, task, wait } from "@trigger.dev/sdk";

/**
 * Embed Document Task
 *
 * Orchestrates the Mastra embed-document workflow which:
 * 1. Fetches content from URL
 * 2. Extracts metadata using AI
 * 3. Suspends for human review (HITL)
 * 4. Embeds approved content into vector database
 *
 * This task handles the Trigger.dev waitpoint for human review and
 * resumes the Mastra workflow when the review is complete.
 */
export const embedDocumentTask = task({
  id: "embed-document",
  run: async (payload: EmbedDocumentInput): Promise<EmbedDocumentOutput> => {
    const { url } = payload;

    try {
      // Start the embed-document workflow
      metadata.set("status", "preparing");
      metadata.set("message", `Fetching and analyzing content from ${url}...`);

      const workflow = mastra.getWorkflow("embedDocumentWorkflow");
      const run = await workflow.createRun();
      const result = await run.start({ inputData: { url } });

      // Check if workflow suspended for human review
      if (result.status === "suspended") {
        metadata.set("status", "awaiting_review");
        metadata.set("message", "Waiting for human review...");

        // Get the suspend payload from the human-review step
        // suspended[0] can be an array for nested workflows, or a string for direct steps
        const suspendedStep = result.suspended[0];
        const suspendedStepId: string = Array.isArray(suspendedStep)
          ? (suspendedStep[0] ?? "human-review")
          : (suspendedStep ?? "human-review");
        const suspendPayload = result.steps[suspendedStepId]?.suspendPayload as
          | ExtractedDocumentData
          | undefined;

        if (!suspendPayload) {
          throw new Error("Missing suspend payload from human-review step");
        }

        // Create Trigger.dev waitpoint for human review
        const token = await wait.createToken({
          timeout: "1h",
        });

        // Set review data for frontend
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata.set("extractedData", suspendPayload as any);
        metadata.set("reviewToken", {
          id: token.id,
          publicAccessToken: token.publicAccessToken,
        });

        // Wait for human approval via Trigger.dev
        const reviewResult = await wait.forToken<DocumentReviewPayload>(token);

        if (!reviewResult.ok) {
          // Token timed out
          metadata.set("status", "timeout");
          metadata.set("message", "Review timed out after 1 hour");
          return {
            success: false,
            status: "error",
            error: "Review timed out",
            url,
          };
        }

        const review = reviewResult.output;

        // Resume the Mastra workflow with the review decision
        metadata.set("status", review.approved ? "embedding" : "rejected");
        metadata.set(
          "message",
          review.approved
            ? "Embedding document into vector database..."
            : (review.rejectionReason ?? "Document rejected")
        );

        const resumeResult = await run.resume({
          step: suspendedStepId,
          resumeData: {
            approved: review.approved,
            metadata: review.metadata,
            rejectionReason: review.rejectionReason,
          },
        });

        // Handle resume result
        if (resumeResult.status !== "success") {
          metadata.set("status", "error");
          metadata.set(
            "message",
            `Workflow ${resumeResult.status} after resume`
          );
          return {
            success: false,
            status: "error",
            error: `Workflow ${resumeResult.status} after resume`,
            url,
          };
        }

        // Get the final result from the embed step
        const embedResult = resumeResult.result as {
          success: boolean;
          status: "embedded" | "rejected";
          chunksCreated?: number;
          sourceId?: string;
          rejectionReason?: string;
        };

        if (embedResult.status === "rejected") {
          metadata.set("status", "rejected");
          metadata.set(
            "message",
            embedResult.rejectionReason ?? "Document rejected"
          );
          return {
            success: true,
            status: "rejected",
            url,
          };
        }

        // Success!
        metadata.set("status", "completed");
        metadata.set(
          "message",
          `Successfully embedded ${embedResult.chunksCreated} chunks`
        );

        return {
          success: true,
          status: "embedded",
          chunksCreated: embedResult.chunksCreated,
          sourceId: embedResult.sourceId,
          url,
        };
      }

      // Workflow completed without suspending (shouldn't happen normally)
      if (result.status === "success" && result.result) {
        const embedResult = result.result as {
          success: boolean;
          status: "embedded" | "rejected";
          chunksCreated?: number;
          sourceId?: string;
        };

        metadata.set("status", "completed");
        metadata.set(
          "message",
          `Successfully embedded ${embedResult.chunksCreated} chunks`
        );

        return {
          success: true,
          status: embedResult.status,
          chunksCreated: embedResult.chunksCreated,
          sourceId: embedResult.sourceId,
          url,
        };
      }

      // Workflow failed
      metadata.set("status", "error");
      metadata.set("message", "Workflow failed");
      return {
        success: false,
        status: "error",
        error: "Workflow failed",
        url,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      metadata.set("status", "error");
      metadata.set("message", errorMessage);

      return {
        success: false,
        status: "error",
        error: errorMessage,
        url,
      };
    }
  },
});
