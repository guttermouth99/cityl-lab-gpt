// Type-only import to prevent task dependencies from leaking into the TRPC bundle
import type { assessImpactTask } from "@baito/worker";
import { auth, batch, tasks } from "@trigger.dev/sdk";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

// Type for batch handle response (SDK types may be incomplete)
interface BatchHandleResponse {
  batchId: string;
  id?: string;
  runs?: string[];
}

export const impactRouter = createTRPCRouter({
  assessImpactBatch: publicProcedure
    .input(
      z.object({
        companies: z
          .string()
          .min(1, "Please enter at least one company name")
          .describe("Comma-separated list of company names"),
      })
    )
    .mutation(async ({ input }) => {
      // Parse comma-separated company names
      const companyNames = input.companies
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

      if (companyNames.length === 0) {
        throw new Error("No valid company names provided");
      }

      // Limit to prevent abuse
      if (companyNames.length > 10) {
        throw new Error("Maximum 10 companies per batch");
      }

      // Generate a unique tag for this batch
      const batchTag = `impact-batch-${Date.now()}`;

      // Batch trigger all assessments with a shared tag
      const batchHandle = (await tasks.batchTrigger<typeof assessImpactTask>(
        "assess-impact",
        companyNames.map((companyName) => ({
          payload: { companyName },
          options: {
            tags: [batchTag, `company:${companyName}`],
          },
        }))
      )) as unknown as BatchHandleResponse;

      // Get batch ID (may be batchId or id depending on SDK version)
      const batchId = batchHandle.batchId || batchHandle.id || "";

      // In v4, we need to retrieve the batch to get run IDs
      const batchDetails = await batch.retrieve(batchId);

      // Extract run IDs from batch details
      // The runs array may contain run objects with id property or just strings
      const runIds = batchDetails.runs.map((run: unknown) =>
        typeof run === "string" ? run : (run as { id: string }).id
      );

      // Create a scoped public token for all runs in this batch
      const publicToken = await auth.createPublicToken({
        scopes: {
          read: {
            runs: runIds,
            tags: [batchTag],
          },
        },
        expirationTime: "1h",
      });

      return {
        batchTag,
        batchId,
        runs: runIds.map((runId, index) => ({
          id: runId,
          companyName: companyNames[index] ?? "",
        })),
        publicAccessToken: publicToken,
      };
    }),
});
