import { router } from '../trpc'
import { jobsRouter } from './jobs'
import { organizationsRouter } from './organizations'
import { usersRouter } from './users'
import { customersRouter } from './customers'

export const appRouter = router({
  jobs: jobsRouter,
  organizations: organizationsRouter,
  users: usersRouter,
  customers: customersRouter,
})

export type AppRouter = typeof appRouter
