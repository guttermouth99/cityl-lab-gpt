import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: "baito-worker",
  runtime: "node",
  logLevel: "log",
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10_000,
      factor: 2,
      randomize: true,
    },
  },
  maxDuration: 300, // 5 minutes default
  dirs: ["./src/jobs"],
});
