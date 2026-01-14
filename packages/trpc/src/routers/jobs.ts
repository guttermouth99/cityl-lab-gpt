import * as jobQueries from "@baito/db/queries";
import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  customerProcedure,
  publicProcedure,
} from "../trpc";

export const jobsRouter = createTRPCRouter({
  // Public endpoints
  list: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        jobType: z.string().optional(),
        jobBranch: z.string().optional(),
        remoteType: z.string().optional(),
        experienceLevel: z.string().optional(),
        organizationId: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      return jobQueries.getActiveJobs(input);
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const job = await jobQueries.getJobBySlug(input.slug);
      if (!job) {
        throw new Error("Job not found");
      }
      return job;
    }),

  byOrganization: publicProcedure
    .input(
      z.object({ organizationId: z.string(), limit: z.number().default(20) })
    )
    .query(async ({ input }) => {
      return jobQueries.getJobsByOrganization(
        input.organizationId,
        input.limit
      );
    }),

  // Customer endpoints
  create: customerProcedure
    .input(
      z.object({
        organizationId: z.string(),
        title: z.string().min(1),
        description: z.string().min(1),
        jobType: z.string().optional(),
        jobBranch: z.string().optional(),
        remoteType: z.string().optional(),
        experienceLevel: z.string().optional(),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return jobQueries.createJob(input);
    }),

  updateStatus: customerProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["draft", "pending", "active", "expired", "archived"]),
      })
    )
    .mutation(async ({ input }) => {
      return jobQueries.updateJobStatus(input.id, input.status);
    }),

  // Admin endpoints
  expireOld: adminProcedure.mutation(async () => {
    const expiredCount = await jobQueries.getExpiredJobsCount();
    if (expiredCount > 0) {
      await jobQueries.expireOldJobs(new Date());
    }
    return { expiredCount };
  }),
});
