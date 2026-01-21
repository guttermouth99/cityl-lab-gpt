import type { helloWorldTask } from "@baito/worker";
import { tasks } from "@trigger.dev/sdk";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const helloRouter = createTRPCRouter({
  /**
   * Trigger a hello-world background task
   * Returns the run ID and public access token for realtime updates
   */
  trigger: publicProcedure
    .input(z.object({ message: z.string().min(1, "Message is required") }))
    .mutation(async ({ input }) => {
      const handle = await tasks.trigger<typeof helloWorldTask>("hello-world", {
        message: input.message,
      });
      return {
        runId: handle.id,
        token: handle.publicAccessToken,
      };
    }),
});
