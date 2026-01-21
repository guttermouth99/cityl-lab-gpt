import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";

import { citylabAgent } from "./agents/citylab-agent";
import { exampleAgent } from "./agents/example-agent";
import { exampleWorkflow } from "./workflows/example-workflow";

// Re-export RAG and vector modules for external use
export * from "./rag";
export * from "./vector";

// Use MASTRA_DB_URL env var or default to absolute path
// Absolute path ensures shared traces across dev server and worker
const dbUrl =
  process.env.MASTRA_DB_URL ??
  "file:/Users/lukas/Projects/citylabgpt/packages/mastra/mastra.db";

export const mastra = new Mastra({
  agents: { exampleAgent, citylabAgent },
  workflows: { exampleWorkflow },
  storage: new LibSQLStore({
    id: "mastra",
    url: dbUrl,
  }),
  // Disable observability in worker context to avoid bundling issues
  // The deprecation warning is a known issue with @mastra/core@1.0.x
});
