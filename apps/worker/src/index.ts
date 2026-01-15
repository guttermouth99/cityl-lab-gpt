// Validate environment variables at startup
import "@baito/env/worker";

import { logger } from "@/utils/logger";

let running = true;
while (running) {
  await new Promise(() =>
    setTimeout(() => logger.info("worker started"), 1000)
  );

  running = false;
}
