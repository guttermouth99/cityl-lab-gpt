"use server";

import type { DocumentReviewPayload } from "@baito/mastra";
import { wait } from "@trigger.dev/sdk";

/**
 * Complete a waitpoint token with the review payload
 * This server action is called when the user approves or rejects a document
 */
export async function completeDocumentReview(
  tokenId: string,
  payload: DocumentReviewPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    await wait.completeToken<DocumentReviewPayload>({ id: tokenId }, payload);
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to complete review";
    console.error("Error completing document review:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
