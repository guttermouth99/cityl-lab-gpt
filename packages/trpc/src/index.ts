import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "./routers/_app";

export type { AppRouter } from "./routers/_app";
export { appRouter } from "./routers/_app";
export type { TRPCContext } from "./trpc";
export {
  adminProcedure,
  createCallerFactory,
  createTRPCContext,
  createTRPCRouter,
  customerProcedure,
  protectedProcedure,
  publicProcedure,
} from "./trpc";

/**
 * Inference helpers for input types
 * @example
 * type JobListInput = RouterInputs['jobs']['list']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example
 * type JobListOutput = RouterOutputs['jobs']['list']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
