import { createTRPCRouter } from "../trpc";
import { documentsRouter } from "./documents";
import { helloRouter } from "./hello";
import { usersRouter } from "./users";

export const appRouter = createTRPCRouter({
  documents: documentsRouter,
  hello: helloRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
