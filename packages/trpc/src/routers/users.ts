import {
  createAlert,
  deleteAlert,
  getUserAlerts,
  getUserById,
  updateAlert,
  updateUserAlertFrequency,
  updateUserRole,
} from "@baito/db/queries";
import { z } from "zod";
import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";

export const usersRouter = createTRPCRouter({
  // User endpoints
  me: protectedProcedure.query(({ ctx }) => {
    return getUserById(ctx.session.user.id);
  }),

  updateAlertFrequency: protectedProcedure
    .input(
      z.object({
        frequency: z.enum(["daily", "weekly", "instant", "none"]),
      })
    )
    .mutation(({ ctx, input }) => {
      return updateUserAlertFrequency(ctx.session.user.id, input.frequency);
    }),

  // Alert management
  alerts: protectedProcedure.query(({ ctx }) => {
    return getUserAlerts(ctx.session.user.id);
  }),

  createAlert: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        filters: z
          .object({
            keywords: z.array(z.string()).optional(),
            jobTypes: z.array(z.string()).optional(),
            jobBranches: z.array(z.string()).optional(),
            remoteTypes: z.array(z.string()).optional(),
            experienceLevels: z.array(z.string()).optional(),
            locations: z.array(z.string()).optional(),
          })
          .optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return createAlert({
        userId: ctx.session.user.id,
        name: input.name,
        filters: input.filters,
      });
    }),

  updateAlert: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        filters: z.record(z.unknown()).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(({ input }) => {
      return updateAlert(input.id, input);
    }),

  deleteAlert: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      return deleteAlert(input.id);
    }),

  // Admin endpoints
  updateRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["user", "customer", "admin"]),
      })
    )
    .mutation(({ input }) => {
      return updateUserRole(input.userId, input.role);
    }),
});
