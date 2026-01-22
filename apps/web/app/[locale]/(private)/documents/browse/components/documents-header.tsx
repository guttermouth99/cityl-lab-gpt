"use client";

import { Button } from "@baito/ui/components/button";
import { Input } from "@baito/ui/components/input";
import { LayoutGrid, List, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface DocumentsHeaderProps {
  documentCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
}

export function DocumentsHeader({
  documentCount,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: DocumentsHeaderProps) {
  const t = useTranslations("Knowledge");

  return (
    <header className="relative mb-12 overflow-hidden">
      {/* Background decoration - diagonal stripe */}
      <div className="absolute -top-20 -right-20 h-64 w-64 rotate-12 bg-gradient-to-br from-citylab-pink/10 to-citylab-blue/5" />

      <div className="relative">
        {/* Staggered title animation */}
        <div className="fade-in slide-in-from-bottom-4 animate-in duration-500">
          <h1 className="mb-2 font-bold text-5xl tracking-tight md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-citylab-pink via-citylab-blue to-citylab-pink bg-clip-text text-transparent">
              {t("pageTitle")}
            </span>
          </h1>
        </div>

        <div className="fade-in slide-in-from-bottom-4 animate-in fill-mode-backwards duration-500 [animation-delay:100ms]">
          <p className="mb-6 flex items-center gap-3 text-lg text-muted-foreground">
            {t("pageDescription")}
            <span className="inline-flex items-center gap-1.5 border-citylab-pink/30 border-l pl-3 font-medium text-citylab-pink">
              <span className="tabular-nums">{documentCount}</span>
              <span className="text-sm">
                {documentCount === 1 ? "entry" : "entries"}
              </span>
            </span>
          </p>
        </div>

        {/* Search and view controls */}
        <div className="fade-in slide-in-from-bottom-4 animate-in fill-mode-backwards duration-500 [animation-delay:200ms]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search input */}
            <div className="relative max-w-md flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="border-2 border-muted bg-background pr-10 pl-10 transition-all focus:border-citylab-pink focus:ring-2 focus:ring-citylab-pink/20"
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t("searchPlaceholder")}
                type="search"
                value={searchQuery}
              />
              {searchQuery && (
                <button
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => onSearchChange("")}
                  type="button"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">{t("clearSearch")}</span>
                </button>
              )}
            </div>

            {/* View mode toggle - pill style */}
            <div className="flex items-center gap-1 self-start border-2 border-muted p-1 sm:self-auto">
              <Button
                aria-label={t("listView")}
                className={`gap-2 transition-all ${
                  viewMode === "list"
                    ? "bg-citylab-blue text-white hover:bg-citylab-blue/90"
                    : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                onClick={() => onViewModeChange("list")}
                size="sm"
                variant="ghost"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">{t("listView")}</span>
              </Button>
              <Button
                aria-label={t("gridView")}
                className={`gap-2 transition-all ${
                  viewMode === "grid"
                    ? "bg-citylab-blue text-white hover:bg-citylab-blue/90"
                    : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                onClick={() => onViewModeChange("grid")}
                size="sm"
                variant="ghost"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">{t("gridView")}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
