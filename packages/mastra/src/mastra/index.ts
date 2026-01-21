import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { Observability } from "@mastra/observability";

import { exampleAgent } from "./agents/example-agent";
import { exampleWorkflow } from "./workflows/example-workflow";

// Use MASTRA_DB_URL env var or default to absolute path
// Absolute path ensures shared traces across dev server and worker

const dbUrl =
  "file:/Users/lukas/Projects/baito3000/baito-turbo/packages/mastra/mastra.db";
export const mastra = new Mastra({
  agents: { exampleAgent },
  workflows: { exampleWorkflow },
  storage: new LibSQLStore({
    id: "mastra",
    url: dbUrl,
  }),
  observability: new Observability({
    default: { enabled: true },
  }),
});
