import { createTRPCRouter } from "../trpc";
import { customersRouter } from "./customers";
import { jobsRouter } from "./jobs";
import { llmRouter } from "./llm";
import { organizationsRouter } from "./organizations";
import { scrapingRouter } from "./scraping";
import { usersRouter } from "./users";

export const appRouter = createTRPCRouter({
  jobs: jobsRouter,
  organizations: organizationsRouter,
  users: usersRouter,
  customers: customersRouter,
  llm: llmRouter,
  scraping: scrapingRouter,
});

export type AppRouter = typeof appRouter;
