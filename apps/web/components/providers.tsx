"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";
import { TRPCReactProvider } from "@/lib/trpc/client";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableColorScheme
      enableSystem
    >
      <React.Suspense>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </React.Suspense>
    </NextThemesProvider>
  );
}
