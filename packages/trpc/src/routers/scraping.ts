// Type-only import to prevent task dependencies from leaking into the TRPC bundle
import type { scrapeCareerPageTask } from "@baito/worker";
import { auth, tasks } from "@trigger.dev/sdk";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const scrapingRouter = createTRPCRouter({
  scrapeCareerPage: publicProcedure
    .input(
      z.object({
        careerPageUrl: z.string().url("Please enter a valid URL"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const handle = await tasks.trigger<typeof scrapeCareerPageTask>(
          "scrape-career-page",
          { careerPageUrl: input.careerPageUrl }
        );

        // Create a scoped public token for this specific run
        const publicToken = await auth.createPublicToken({
          scopes: {
            read: {
              runs: [handle.id],
            },
          },
          expirationTime: "1h",
        });

        return {
          runId: handle.id,
          publicAccessToken: publicToken,
          careerPageUrl: input.careerPageUrl,
        };
      } catch (error) {
        console.error(error, "error");
        throw error;
      }
    }),
});
