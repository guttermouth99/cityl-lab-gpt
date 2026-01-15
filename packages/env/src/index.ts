// Re-export schemas for convenience

export { env as serverEnv } from "./apps/server.js";

// Re-export app-specific envs
export { env as webEnv } from "./apps/web.js";
export { env as workerEnv } from "./apps/worker.js";
export * from "./schemas/index.js";
