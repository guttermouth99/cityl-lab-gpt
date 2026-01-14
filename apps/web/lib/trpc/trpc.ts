import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

export interface TRPCContext {
  session: {
    user: {
      id: string
      email: string
      name: string
      role: 'user' | 'customer' | 'admin'
    }
  } | null
}

export async function createTRPCContext(
  opts?: FetchCreateContextFnOptions,
): Promise<TRPCContext> {
  // TODO: Get session from Better-Auth
  // const session = await getSession(opts?.req)
  
  return {
    session: null,
  }
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  })
})

export const customerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== 'customer' && ctx.session.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be a customer to access this resource',
    })
  }
  return next({ ctx })
})

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be an admin to access this resource',
    })
  }
  return next({ ctx })
})
