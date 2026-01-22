"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@baito/ui/components/avatar";
import { Button } from "@baito/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@baito/ui/components/dropdown-menu";
import { cn } from "@baito/ui/lib/utils";

import { LayoutDashboard, LogIn, LogOut, MessageSquare } from "lucide-react";
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

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

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

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  const isLoggedIn = !!session?.user;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 w-full items-center justify-between px-4 px-8 sm:px-6">
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
              <Link
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-sm transition-colors",
                  pathname === "/chat"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                href="/chat"
              >
                <MessageSquare className="h-4 w-4" />
                Chat
              </Link>
              <Link
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-sm transition-colors",
                  pathname === "/dashboard"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                href="/dashboard"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </>
          )}

          {/* Language Switch */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center rounded-lg px-3 py-2 text-muted-foreground text-xl transition-colors hover:bg-accent hover:text-accent-foreground"
                type="button"
              >
                {localeConfig[currentLocale].flag}
                <span className="sr-only">Switch language</span>
              </button>
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

          {/* User avatar dropdown */}
          {isMounted && isLoggedIn && session?.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  type="button"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      alt={session.user.name}
                      src={session.user.image ?? undefined}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                      {getInitials(session.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden font-medium text-sm sm:inline-block">
                    {session.user.name.split(" ")[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="font-medium text-sm leading-none">
                      {session.user.name}
                    </p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleSignOut}
                  variant="destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
