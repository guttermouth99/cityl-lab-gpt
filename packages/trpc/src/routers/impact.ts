// Type-only import to prevent task dependencies from leaking into the TRPC bundle
import type { assessImpactTask } from "@baito/worker";
import { tasks } from "@trigger.dev/sdk";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

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

      // Batch trigger all assessments
      // The batchHandle includes batchId, runCount, and publicAccessToken
      const batchHandle = await tasks.batchTrigger<typeof assessImpactTask>(
        "assess-impact",
        companyNames.map((companyName) => ({
          payload: { companyName },
        }))
      );

      // Return batch info and company names for the frontend
      // The frontend will use useRealtimeBatch to subscribe to all runs
      return {
        batchId: batchHandle.batchId,
        runCount: batchHandle.runCount,
        publicAccessToken: batchHandle.publicAccessToken,
        companyNames,
      };
    }),
});
