import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { Observability } from "@mastra/observability";

import { impactAssessmentAgent } from "./agents/impact-assessment-agent";
import { impactAssessmentWorkflow } from "./workflows/impact-assessment-workflow";

// Use MASTRA_DB_URL env var or default to relative path
// For shared traces across dev server and worker, set MASTRA_DB_URL to an absolute path
const dbUrl =
  "file:/Users/lukas/Projects/baito3000/baito-turbo/packages/mastra/mastra.db";
console.log(dbUrl, "dbUrl");
export const mastra = new Mastra({
  agents: { impactAssessmentAgent },
  workflows: { impactAssessmentWorkflow },
  storage: new LibSQLStore({
    id: "mastra",
    url: dbUrl,
  }),
  observability: new Observability({
    default: { enabled: true },
  }),
});
