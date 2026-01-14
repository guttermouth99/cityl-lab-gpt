# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

Turborepo monorepo using:
- **Runtime**: Bun (NOT npm/pnpm/node)
- **Frontend**: Next.js 16 App Router + React 19
- **Backend**: Express server
- **API**: tRPC for type-safe API layer
- **Auth**: Better Auth
- **Database**: Prisma with PostgreSQL
- **UI**: Tailwind CSS + Radix UI components

## Core Commands

```bash
# Development
bun dev                    # Start all apps/packages
bun dev:web               # Start Next.js web app only
bun dev:server            # Start Express server only
bun dev:worker            # Start worker only

# Build
bun run build             # Build all apps/packages
bun run build:vercel      # Vercel-specific build

# Code Quality
bun lint                  # Lint all packages
bun lint:fix              # Auto-fix lint issues
bun run check-types       # Type check all packages
bun run format            # Format code with Prettier
bun run format:check      # Check formatting

# Database
bun db:generate           # Generate Prisma client
bun db:migrate            # Run Prisma migrations
bun db:seed               # Seed database
bun db:studio             # Open Prisma Studio

# Testing
cd tests && bun test              # Run tests
cd tests && bun test:watch        # Watch mode
cd tests && bun test:coverage     # With coverage

# Utility
bun run clean             # Remove node_modules/.next/.turbo/dist
bun run rename-scope      # Rename @template scope
```

## Architecture

### Apps (`apps/`)

**server** (Express backend)
- Entry: `apps/server/src/server.ts`
- App setup: `apps/server/src/app.ts`
- Dev: `bun run --watch src/server.ts`
- Hosts tRPC endpoints via Express middleware

**web** (Next.js frontend)
- Entry: `apps/web/app/layout.tsx` and `apps/web/app/page.tsx`
- Uses App Router with React Server Components by default
- TRPC client: `apps/web/trpc/client.tsx`
- TRPC server helpers: `apps/web/trpc/server.tsx`
- Providers: `apps/web/components/providers.tsx`

**worker** (Background jobs)
- Entry: `apps/worker/src/index.ts`
- Handles async tasks, queues

### Packages (`packages/`)

**auth** - Better Auth implementation
- Exports: `@template/auth/server` and `@template/auth/client`
- Used by both web and server apps

**store** - Prisma ORM
- Schema: `packages/store/prisma/schema.prisma`
- Generated client exported from `packages/store/src/index.ts`
- Migrations: `packages/store/prisma/migrations/`

**trpc** - Type-safe API layer
- Main router: `packages/trpc/src/routers/_app.ts`
- Individual routers: `packages/trpc/src/routers/`
- Server setup helpers: `packages/trpc/src/trpc.ts`

**common** - Shared utilities/types
- Browser-safe code
- Zod schemas: `packages/common/src/types/zod-schema.ts`
- Client logger: `packages/common/src/utils/client-logger.ts`
- Config: exported from `packages/common/src/index.ts`

**backend-common** - Backend-specific shared code
- Logger: `packages/backend-common/src/utils/logger.ts`
- Config: `packages/backend-common/src/utils/config.ts`
- Redis utils: shared across server/worker

**ui** - Shared React components
- Components exported from `packages/ui/src/`
- Used by web app

### Tooling (`tooling/`)

**eslint-config** - Shared ESLint configuration
**typescript-config** - Base TypeScript configs

## Development Conventions

### Use Bun, Not Node/npm/pnpm

- Run files: `bun <file>` not `node <file>`
- Install: `bun install` not `npm install`
- Scripts: `bun run <script>` not `npm run <script>`
- Tests: `bun test` (built-in test runner)
- Bun auto-loads .env files (no dotenv needed)

### TypeScript Guidelines

- Explicit return types for exported functions/public APIs
- No `any` - use `unknown` + narrowing when needed
- Favor early returns over deep nesting
- Server Components by default in Next.js; Client Components only when needed (`"use client"`)

### Import Patterns

- Backend code: import from `packages/backend-common`
- Shared/browser code: import from `packages/common`
- Never import server-only modules in web client code
- Use TRPC hooks from generated client, not direct endpoint calls

### Logging

- Server/Worker: use `packages/backend-common/src/utils/logger.ts`
- Web client: use `packages/common/src/utils/client-logger.ts`

### Configuration

- Backend: `packages/backend-common/src/utils/config.ts`
- Web: `apps/web/utils/config.ts`

### Code Organization

- Business logic belongs in services and packages, not route handlers
- Validate inputs at TRPC boundary using Zod schemas from `packages/common/src/types/zod-schema.ts`
- Keep route handlers thin
- Centralize config and logging via shared packages

### Frontend Patterns

- Prefer Server Components; use Client Components only when necessary
- Use TRPC hooks from generated client
- Shared UI from `packages/ui/src`
- Keep env vars in server components/utilities; never leak secrets to client

## Package Scope

Default scope: `@template`
To rename: `bun run rename-scope` (with `--dry-run` to preview)

## Environment Variables

Key env vars (see `turbo.json` globalEnv/globalPassThroughEnv):
- `DATABASE_URL` - Postgres connection
- `NODE_ENV` - Environment (development/production)
- `NEXT_PUBLIC_APP_URL` - Frontend URL
- `NEXT_PUBLIC_API_URL` - Backend URL
- `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET` - Auth config
- `GITHUB_CLIENT_ID/SECRET`, `GOOGLE_CLIENT_ID/SECRET` - OAuth providers
- `REDIS_URL` - Redis connection
- `JWT_SECRET` - JWT signing

## Project Entry Points

- Web app: `apps/web/app/page.tsx`
- API server: `apps/server/src/server.ts`
- Worker: `apps/worker/src/index.ts`
- TRPC router: `packages/trpc/src/routers/_app.ts`
- Prisma schema: `packages/store/prisma/schema.prisma`
- Auth config: `packages/auth/src/index.ts`
