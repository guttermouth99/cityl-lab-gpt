"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ReactNode, Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { TRPCReactProvider } from "@/lib/trpc/client";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
      enableColorScheme
      enableSystem
    >
      <AuthUIProvider
        authClient={authClient}
        Link={Link}
        navigate={router.push}
        onSessionChange={() => router.refresh()}
        replace={router.replace}
      >
        <Suspense>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </Suspense>
      </AuthUIProvider>
    </NextThemesProvider>
  );
}
