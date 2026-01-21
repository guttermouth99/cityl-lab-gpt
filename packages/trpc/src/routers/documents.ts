import type { embedDocumentTask } from "@baito/worker";
import { tasks } from "@trigger.dev/sdk";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const documentsRouter = createTRPCRouter({
  /**
   * Trigger document embedding workflow
   * Returns the run ID and public access token for realtime updates
   */
  embed: publicProcedure
    .input(z.object({ url: z.string().url("Valid URL is required") }))
    .mutation(async ({ input }) => {
      const handle = await tasks.trigger<typeof embedDocumentTask>(
        "embed-document",
        {
          url: input.url,
        }
      );
      return {
        runId: handle.id,
        token: handle.publicAccessToken,
      };
    }),
});
