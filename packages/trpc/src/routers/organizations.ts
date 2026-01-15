import {
  createOrganization,
  getImpactOrganizations,
  getOrganizationBySlug,
  getOrganizationsCount,
  searchOrganizations,
  updateOrganization,
} from "@baito/db/queries";
import { z } from "zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

export const organizationsRouter = createTRPCRouter({
  // Public endpoints
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const org = await getOrganizationBySlug(input.slug);
      if (!org) {
        throw new Error("Organization not found");
      }
      return org;
    }),

  search: publicProcedure
    .input(z.object({ query: z.string(), limit: z.number().default(20) }))
    .query(({ input }) => {
      return searchOrganizations(input.query, input.limit);
    }),

  impactOrgs: publicProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(({ input }) => {
      return getImpactOrganizations(input.limit);
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
    .mutation(({ input }) => {
      return createOrganization(input);
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
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateOrganization(id, data);
    }),

  stats: adminProcedure.query(async () => {
    const count = await getOrganizationsCount();
    return { total: count };
  }),
});
