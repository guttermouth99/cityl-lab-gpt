import { analyzeJobPosting } from "@baito/llm/prompts/example-structured-object";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const llmRouter = createTRPCRouter({
  analyzeJob: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
      })
    )
    .mutation(async ({ input }) => {
      console.log(input, "input");
      return await analyzeJobPosting(input);
    }),
});
