import {
  canCustomerPostJob,
  createCustomer,
  getActiveCustomers,
  getCustomerById,
  getCustomerByUserId,
  updateCustomerPlan,
  updateCustomerStatus,
} from "@baito/db/queries";
import { z } from "zod";
import { adminProcedure, createTRPCRouter, customerProcedure } from "../trpc";

export const customersRouter = createTRPCRouter({
  // Customer endpoints
  me: customerProcedure.query(({ ctx }) => {
    return getCustomerByUserId(ctx.session.user.id);
  }),

  canPostJob: customerProcedure.query(async ({ ctx }) => {
    const customer = await getCustomerByUserId(ctx.session.user.id);
    if (!customer) {
      return false;
    }
    return canCustomerPostJob(customer.id);
  }),

  // Admin endpoints
  list: adminProcedure.query(() => {
    return getActiveCustomers();
  }),

  byId: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return getCustomerById(input.id);
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
    .mutation(({ input }) => {
      return createCustomer(input);
    }),

  updatePlan: adminProcedure
    .input(
      z.object({
        id: z.string(),
        plan: z.enum(["starter", "professional", "enterprise"]),
      })
    )
    .mutation(({ input }) => {
      return updateCustomerPlan(input.id, input.plan);
    }),

  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["active", "suspended", "cancelled"]),
      })
    )
    .mutation(({ input }) => {
      return updateCustomerStatus(input.id, input.status);
    }),
});
