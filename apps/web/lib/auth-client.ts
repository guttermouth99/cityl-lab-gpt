"use client";

import { env } from "@baito/env/web";
import { createAuthClient } from "better-auth/react";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient(
  {
    baseURL: env.NEXT_PUBLIC_APP_URL,
  }
);
