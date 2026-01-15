import { Mastra } from "@mastra/core/mastra";

import { exampleAgent } from "./agents/example-agent";

export const mastra = new Mastra({
  agents: { exampleAgent },
});
