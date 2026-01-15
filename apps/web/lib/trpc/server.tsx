import "server-only";

import { env } from "@baito/env/web";
import type { AppRouter } from "@baito/trpc";
import { appRouter, createCallerFactory, createTRPCContext } from "@baito/trpc";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCClient, httpLink } from "@trpc/client";
import {
  createTRPCOptionsProxy,
  type TRPCQueryOptions,
} from "@trpc/tanstack-react-query";
import { cache } from "react";
import superjson from "superjson";
import { makeQueryClient } from "./query-client";

export const getQueryClient = cache(makeQueryClient);

function getBaseUrl() {
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  return `http://localhost:${env.PORT}`;
}

/**
 * Create a server-side tRPC caller for direct procedure calls in RSC.
 * Usage: const caller = await createCaller(); const result = await caller.jobs.list();
 */
const _createCaller = createCallerFactory(appRouter);
type Caller = Awaited<ReturnType<typeof _createCaller>>;

export async function createCaller(): Promise<Caller> {
  const context = await createTRPCContext();
  return _createCaller(context);
}

/**
 * tRPC options proxy for prefetching queries in RSC
 */
export const trpc = createTRPCOptionsProxy({
  client: createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
      }),
    ],
  }),
  queryClient: getQueryClient,
});

/**
 * Hydrate client component that passes server state to client
 */
export function HydrateClient({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}

/**
 * Prefetch a tRPC query on the server for hydration
 */
export function prefetch(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryOptions: ReturnType<TRPCQueryOptions<any>>
) {
  const queryClient = getQueryClient();
  if (queryOptions.queryKey[1]?.type === "infinite") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    void queryClient.prefetchQuery(queryOptions);
  }
}
