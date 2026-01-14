<p align="center">
  <img src="https://nextjs.org/static/favicon/favicon-32x32.png" alt="Next.js" width="32" />
  <img src="https://expressjs.com/images/favicon.png" alt="Express" width="32" />
  <img src="https://trpc.io/img/logo.svg" alt="tRPC" width="32" />
  <img src="https://raw.githubusercontent.com/oven-sh/bun/main/assets/logo.svg" alt="Bun" width="32" />
  <img src="https://www.prisma.io/favicon.ico" alt="Prisma" width="32" />
</p>

<h1 align="center">Next.js × Express × tRPC × Bun × Better Auth × Prisma × Turborepo Template</h1>

<p align="center">
  <b>Kickstart your next project with a modern, scalable, and type-safe monorepo template.</b><br/>
  <i>Production-ready, batteries included, and easy to extend.</i>
</p>

---

## 🧪 Use this template

```sh
bun create turbo@latest --example https://github.com/KitsuneKode/template-nextjs-express-trpc-bettera-auth-monorepo
cd my-app
bun install
bun dev
```

> Requires Bun: [Bun](https://bun.sh)

## 🔗 Repository

- GitHub: [KitsuneKode/template-nextjs-express-trpc-bettera-auth-monorepo](https://github.com/KitsuneKode/template-nextjs-express-trpc-bettera-auth-monorepo)

---

## 🚀 Features

- **Full-Stack Ready:** Next.js frontend, Express backend, tRPC for typesafe APIs.
- **Ultra-Fast Tooling:** Powered by Bun for rapid installs and scripts.
- **Type Safety:** End-to-end TypeScript, including API contracts.
- **Modular Auth:** Plug-and-play authentication package.
- **Reusable UI:** Shared component library for consistent design.
- **Monorepo Power:** Code sharing and easy scaling with Turborepo.
- **Production Best Practices:** Pre-configured for real-world deployments.

---

## 🗂️ Project Structure

```
apps/
  api/        # Express backend (tRPC, Auth, Prisma)
  client/     # Next.js frontend (tRPC client, UI)
packages/
  auth/       # Authentication logic(better-auth)
  store/      # Prisma schema & DB access
  trpc/       # tRPC routers & helpers
  ui/         # Shared UI components
  common/     # Shared types & utilities
  backend-common/ # Backend-specific shared code
```

---

## ⚡ Quick Start

1. **Install dependencies (with Bun):**

   ```sh
   bun install
   ```

2. **Set up environment variables** (see section below)

3. **Start development (all apps/packages):**

   ```sh
   bun dev
   ```

4. **Build everything:**
   ```sh
   bun run build
   ```

---

## 🔐 Environment Variables

This monorepo uses environment variables across different apps and packages. Place `.env` files in the **root directory** — Turborepo will automatically pass them to the appropriate packages.

### Required Variables

Create a `.env` file in the **root** of the project:

```env
# Database (required - used by packages/db)
DATABASE_URL=postgresql://user:password@localhost:5432/baito

# App URLs (required)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Authentication (apps/web)

```env
# Better Auth
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-here

# OAuth Providers (optional - enable as needed)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Background Jobs (apps/worker)

```env
# Trigger.dev
TRIGGER_API_KEY=tr_dev_xxx
TRIGGER_API_URL=https://api.trigger.dev

# Web Scraping
JINA_API_KEY=jina_xxx

# Job Feeds
STEPSTONE_FEED_URL=https://...
```

### AI/LLM (packages/llm)

```env
# OpenAI API (used via AI SDK)
OPENAI_API_KEY=sk-xxx
```

### Search (packages/search)

```env
# Typesense
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
```

### Email (packages/email)

```env
# SendGrid
SENDGRID_API_KEY=SG.xxx
```

### Summary by Location

| Package/App | Variables |
|-------------|-----------|
| **Root** | `NODE_ENV`, `DATABASE_URL`, `NEXT_PUBLIC_APP_URL` |
| **apps/web** | `BETTER_AUTH_*`, `GITHUB_*`, `GOOGLE_*` |
| **apps/worker** | `TRIGGER_*`, `JINA_API_KEY`, `STEPSTONE_FEED_URL` |
| **packages/db** | `DATABASE_URL` |
| **packages/llm** | `OPENAI_API_KEY` |
| **packages/search** | `TYPESENSE_*` |
| **packages/email** | `SENDGRID_API_KEY` |

> **Note:** All env vars should go in the root `.env` file. Turborepo handles passing them to the correct packages via `globalEnv` and `globalPassThroughEnv` in `turbo.json`.

---

## 🛠️ Why Use This Template?

- **Easy Initial Setup:** Get started in minutes, not hours.
- **Type-Safe Everywhere:** No more guessing types between client and server.
- **Scalable & Maintainable:** Modular structure for growing teams and projects.
- **Modern Stack:** Stay up-to-date with the latest best practices.
- **Ready for Production:** Sensible defaults and extensible configuration.

---

## 📚 Learn More

- [Next.js](https://nextjs.org/)
- [Express.js](https://expressjs.com/)
- [tRPC](https://trpc.io/)
- [Bun](https://bun.sh/)
- [Prisma](https://prisma.io/)
- [Turborepo](https://turbo.build/)
- [Better Auth](https://better-auth.com/)

---

## 📝 Author

- [@KitsunKode](https://x.com/KitsunKode)

---

## 📄 License

MIT

---

> Want to contribute? Add badges, contribution guidelines, or a screenshot/demo section!
