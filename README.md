# Trigger.dev + Mastra Boilerplate

A lightweight monorepo boilerplate demonstrating **Trigger.dev** background tasks with **Mastra AI** agents, featuring realtime responses streamed back to a Next.js frontend.

## Features

- **Next.js 15** - App Router with React Server Components
- **Trigger.dev v4** - Background task execution with realtime updates
- **Mastra AI** - Agent framework with tool support (Jina Search)
- **tRPC** - End-to-end typesafe APIs
- **Better-Auth** - Authentication (pre-configured)
- **Drizzle ORM** - Type-safe database access
- **AI Gateway** - Proxy endpoint for LLM providers
- **Turborepo** - Fast monorepo builds
- **Bun** - Fast package manager and runtime

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [Node.js](https://nodejs.org) >= 22
- PostgreSQL database
- [Trigger.dev](https://trigger.dev) account

### Installation

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Generate database types
bun db:generate

# Start development
bun dev
```

### Environment Variables

Create a `.env` file in the root:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/boilerplate

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key

# Trigger.dev
TRIGGER_SECRET_KEY=tr_dev_xxx

# LLM (required for Mastra)
OPENAI_API_KEY=sk-xxx

# Jina Search (optional - for web search tool)
JINA_API_KEY=jina_xxx
```

## Project Structure

```
apps/
  web/          # Next.js frontend
  server/       # Express API + AI Gateway
  worker/       # Trigger.dev background tasks

packages/
  mastra/       # Mastra AI agents & workflows
  trpc/         # tRPC routers
  db/           # Drizzle schema & queries
  ui/           # Shared UI components
  env/          # Environment validation
  shared/       # Shared types & utils
```

## How It Works

```
┌─────────────┐     ┌─────────┐     ┌──────────┐     ┌─────────┐
│   Next.js   │────▶│  tRPC   │────▶│ Trigger  │────▶│ Mastra  │
│  Frontend   │     │ Router  │     │   Task   │     │  Agent  │
└─────────────┘     └─────────┘     └──────────┘     └─────────┘
       ▲                                                   │
       │              useRealtimeRun                       │
       └───────────────────────────────────────────────────┘
```

1. User submits a message on the Hello World page
2. tRPC mutation triggers a Trigger.dev task
3. Task runs a Mastra workflow with an AI agent
4. Agent can use tools (like Jina Search) to answer
5. Results stream back to frontend via `useRealtimeRun`

## Development

```bash
# Start all apps
bun dev

# Start specific apps
bun dev:web      # Next.js only
bun dev:worker   # Trigger.dev worker
bun dev:mastra   # Mastra dev server

# Database
bun db:generate  # Generate types
bun db:migrate   # Run migrations
bun db:studio    # Open Drizzle Studio

# Linting
bun lint         # Check code
bun lint:fix     # Auto-fix issues
```

## Apps

### Web (apps/web)

Next.js frontend with a Hello World page that demonstrates:
- Triggering background tasks via tRPC
- Realtime updates using `useRealtimeRun`
- Displaying AI responses

### Server (apps/server)

Express API with:
- Health check endpoint (`GET /health`)
- AI Gateway proxy (`POST /v1/chat/completions`)

### Worker (apps/worker)

Trigger.dev worker with:
- `hello-world` task that runs Mastra workflows

## Packages

### Mastra (packages/mastra)

AI framework with:
- **Example Agent** - Uses Jina Search tool
- **Example Workflow** - Single-step workflow

### tRPC (packages/trpc)

Type-safe API routers:
- `hello.trigger` - Trigger background tasks
- `users.me` - Get current user

### DB (packages/db)

Drizzle ORM with Better-Auth compatible schema:
- Users, Sessions, Accounts, Verifications

## Extending

### Add a new Mastra agent

```typescript
// packages/mastra/src/mastra/agents/my-agent.ts
import { Agent } from "@mastra/core/agent";

export const myAgent = new Agent({
  id: "my-agent",
  name: "My Agent",
  instructions: "...",
  model: "openai/gpt-4o-mini",
  tools: { /* add tools */ },
});
```

### Add a new Trigger.dev task

```typescript
// apps/worker/src/jobs/my-task.ts
import { task } from "@trigger.dev/sdk";

export const myTask = task({
  id: "my-task",
  run: async (payload) => {
    // Task logic here
  },
});
```

### Add a new tRPC router

```typescript
// packages/trpc/src/routers/my-router.ts
import { createTRPCRouter, publicProcedure } from "../trpc";

export const myRouter = createTRPCRouter({
  hello: publicProcedure.query(() => "Hello!"),
});
```

## Deployment

### Trigger.dev

```bash
cd apps/worker
npx trigger.dev@latest deploy
```

### Vercel (Next.js)

Connect your repo to Vercel and set environment variables.

## License

MIT
