import { Mastra } from "@mastra/core/mastra";

import { exampleAgent } from "./agents/example-agent";
import { impactAssessmentAgent } from "./agents/impact-assessment-agent";
import { impactAssessmentWorkflow } from "./workflows/impact-assessment-workflow";

export const mastra = new Mastra({
  agents: { exampleAgent, impactAssessmentAgent },
  workflows: { impactAssessmentWorkflow },
});
