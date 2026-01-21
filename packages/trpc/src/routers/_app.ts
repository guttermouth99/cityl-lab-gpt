import { createTRPCRouter } from "../trpc";
import { helloRouter } from "./hello";
import { usersRouter } from "./users";

export const appRouter = createTRPCRouter({
  hello: helloRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
