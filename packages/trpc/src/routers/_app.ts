import { createTRPCRouter } from "../trpc";
import { customersRouter } from "./customers";
import { jobsRouter } from "./jobs";
import { organizationsRouter } from "./organizations";
import { usersRouter } from "./users";

export const appRouter = createTRPCRouter({
  jobs: jobsRouter,
  organizations: organizationsRouter,
  users: usersRouter,
  customers: customersRouter,
});

export type AppRouter = typeof appRouter;
