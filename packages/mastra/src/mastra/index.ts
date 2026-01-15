import { Mastra } from "@mastra/core/mastra";

import { exampleAgent } from "./agents/example-agent";
import { impactResearchAgent } from "./agents/impact-research-agent";

export const mastra = new Mastra({
  agents: { exampleAgent, impactResearchAgent },
});
