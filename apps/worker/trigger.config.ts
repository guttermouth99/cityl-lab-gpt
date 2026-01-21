import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: "proj_nhpxrlptcxsoqwmboczb",
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
  build: {
    // Native modules need to be external (they have platform-specific binaries)
    // @baito/mastra is NOT external - it's a local TS package that needs bundling
    external: [
      "libsql",
      "@libsql/client",
      "@mastra/core",
      "@mastra/libsql",
      "@mastra/pg",
      "@mastra/rag",
    ],
  },
});
