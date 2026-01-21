import { chatRoute } from "@mastra/ai-sdk";
import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";

import { citylabAgent } from "./agents/citylab-agent";
import { contentRetrievalAgent } from "./agents/content-retrieval-agent";
import { exampleAgent } from "./agents/example-agent";
import { embedDocumentWorkflow } from "./workflows/embed-document-workflow";
import { exampleWorkflow } from "./workflows/example-workflow";

// Re-export RAG and vector modules for external use
export * from "./rag";
export type {
  JinaReaderContent,
  JinaReaderResponse,
} from "./tools/jina-reader";

// Export tools for use in worker
export { fetchUrlContent } from "./tools/jina-reader";
export * from "./vector";

// Use MASTRA_DB_URL env var or default to absolute path
// Absolute path ensures shared traces across dev server and worker
const dbUrl =
  process.env.MASTRA_DB_URL ??
  "file:/Users/lukas/Projects/citylabgpt/packages/mastra/mastra.db";

export const mastra = new Mastra({
  agents: {
    exampleAgent,
    citylabAgent,
    "content-retrieval": contentRetrievalAgent,
  },
  workflows: {
    exampleWorkflow,
    embedDocumentWorkflow,
  },
  storage: new LibSQLStore({
    id: "mastra",
    url: dbUrl,
  }),
  server: {
    apiRoutes: [chatRoute({ path: "/chat/:agentId" })],
  },
  // Disable observability in worker context to avoid bundling issues
  // The deprecation warning is a known issue with @mastra/core@1.0.x
});
