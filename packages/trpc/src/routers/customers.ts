import * as customerQueries from "@baito/db/queries";
import { z } from "zod";
import { adminProcedure, createTRPCRouter, customerProcedure } from "../trpc";

export const customersRouter = createTRPCRouter({
  // Customer endpoints
  me: customerProcedure.query(async ({ ctx }) => {
    return customerQueries.getCustomerByUserId(ctx.session.user.id);
  }),

  canPostJob: customerProcedure.query(async ({ ctx }) => {
    const customer = await customerQueries.getCustomerByUserId(
      ctx.session.user.id
    );
    if (!customer) return false;
    return customerQueries.canCustomerPostJob(customer.id);
  }),

  // Admin endpoints
  list: adminProcedure.query(async () => {
    return customerQueries.getActiveCustomers();
  }),

  byId: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return customerQueries.getCustomerById(input.id);
    }),

  create: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        organizationId: z.string(),
        plan: z
          .enum(["starter", "professional", "enterprise"])
          .default("starter"),
        billingEmail: z.string().email().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return customerQueries.createCustomer(input);
    }),

  updatePlan: adminProcedure
    .input(
      z.object({
        id: z.string(),
        plan: z.enum(["starter", "professional", "enterprise"]),
      })
    )
    .mutation(async ({ input }) => {
      return customerQueries.updateCustomerPlan(input.id, input.plan);
    }),

  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["active", "suspended", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      return customerQueries.updateCustomerStatus(input.id, input.status);
    }),
});
