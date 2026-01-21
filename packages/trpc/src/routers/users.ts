import { createTRPCRouter, protectedProcedure } from "../trpc";

export const usersRouter = createTRPCRouter({
  // Get current user - placeholder for auth integration
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.session.user;
  }),
});
