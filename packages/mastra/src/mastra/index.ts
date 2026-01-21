import path from "node:path";
import { fileURLToPath } from "node:url";
import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { Observability } from "@mastra/observability";

import { exampleAgent } from "./agents/example-agent";
import { exampleWorkflow } from "./workflows/example-workflow";

// Use MASTRA_DB_URL env var or default to absolute path
// Absolute path ensures shared traces across dev server and worker
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDbPath = path.resolve(__dirname, "../../mastra.db");
const dbUrl = process.env.MASTRA_DB_URL ?? `file:${defaultDbPath}`;

const storage = new LibSQLStore({
  id: "mastra",
  url: dbUrl,
});

export const mastra = new Mastra({
  agents: { exampleAgent },
  workflows: { exampleWorkflow },
  storage,
  observability: new Observability({
    default: { enabled: true },
  }),
});
