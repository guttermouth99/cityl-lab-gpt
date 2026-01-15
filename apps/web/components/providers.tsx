"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ReactNode, Suspense } from "react";
import { TRPCReactProvider } from "@/lib/trpc/client";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableColorScheme
      enableSystem
    >
      <Suspense>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </Suspense>
    </NextThemesProvider>
  );
}
