import * as orgQueries from "@baito/db/queries";
import { z } from "zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

export const organizationsRouter = createTRPCRouter({
  // Public endpoints
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const org = await orgQueries.getOrganizationBySlug(input.slug);
      if (!org) {
        throw new Error("Organization not found");
      }
      return org;
    }),

  search: publicProcedure
    .input(z.object({ query: z.string(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      return orgQueries.searchOrganizations(input.query, input.limit);
    }),

  impactOrgs: publicProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => {
      return orgQueries.getImpactOrganizations(input.limit);
    }),

  // Admin endpoints
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        url: z.string().url().optional(),
        isImpact: z.boolean().default(false),
        careerPageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return orgQueries.createOrganization(input);
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        url: z.string().url().optional().nullable(),
        isImpact: z.boolean().optional(),
        isBlacklisted: z.boolean().optional(),
        careerPageUrl: z.string().url().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return orgQueries.updateOrganization(id, data);
    }),

  stats: adminProcedure.query(async () => {
    const count = await orgQueries.getOrganizationsCount();
    return { total: count };
  }),
});
