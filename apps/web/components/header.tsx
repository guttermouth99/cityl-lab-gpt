"use client";

import { Button } from "@baito/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@baito/ui/components/dropdown-menu";
import { LayoutDashboard, LogIn, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { authClient } from "@/lib/auth-client";

const localeConfig: Record<Locale, { label: string; flag: string }> = {
  de: { label: "Deutsch", flag: "🇩🇪" },
  en: { label: "English", flag: "🇬🇧" },
};

export function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const currentLocale = (params.locale as Locale) || "de";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLocaleChange = (locale: Locale) => {
    router.replace(pathname, { locale });
  };

  const isLoggedIn = !!session?.user;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link className="flex items-center" href="/">
          <Image
            alt="CityLAB Berlin"
            className="h-8 w-auto dark:invert"
            height={32}
            priority
            src="/CityLAB Berlin.svg"
            width={150}
          />
        </Link>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Logged in: Chat and Dashboard buttons */}
          {isMounted && isLoggedIn && (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link href="/chat">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            </>
          )}

          {/* Language Switch */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-1.5" size="sm" variant="ghost">
                <span className="text-base">
                  {localeConfig[currentLocale].flag}
                </span>
                <span className="hidden sm:inline">
                  {localeConfig[currentLocale].label}
                </span>
                <span className="sr-only">Switch language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(localeConfig) as Locale[]).map((locale) => (
                <DropdownMenuItem
                  key={locale}
                  onClick={() => handleLocaleChange(locale)}
                >
                  <span className="mr-2 text-base">
                    {localeConfig[locale].flag}
                  </span>
                  <span
                    className={
                      locale === currentLocale ? "font-semibold" : undefined
                    }
                  >
                    {localeConfig[locale].label}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Login button or loading state */}
          {/* Show loading skeleton until mounted and session resolved to prevent hydration mismatch */}
          {(!isMounted || isPending) && (
            <Button disabled size="sm" variant="outline">
              <span className="h-4 w-16 animate-pulse rounded bg-muted" />
            </Button>
          )}
          {isMounted && !isPending && !isLoggedIn && (
            <Button asChild size="sm" variant="default">
              <Link href="/auth/sign-in">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
