import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";

import { exampleAgent } from "./agents/example-agent";
import { impactAssessmentAgent } from "./agents/impact-assessment-agent";
import { impactAssessmentWorkflow } from "./workflows/impact-assessment-workflow";

export const mastra = new Mastra({
  agents: { exampleAgent, impactAssessmentAgent },
  workflows: { impactAssessmentWorkflow },
  storage: new LibSQLStore({
    id: "mastra",
    url: "file:./mastra.db",
  }),
});
