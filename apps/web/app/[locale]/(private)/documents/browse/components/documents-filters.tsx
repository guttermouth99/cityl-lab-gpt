"use client";

import { Badge } from "@baito/ui/components/badge";
import { Button } from "@baito/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@baito/ui/components/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@baito/ui/components/sheet";
import {
  ArrowDownAZ,
  ArrowUpDown,
  Calendar,
  FileText,
  Filter,
  Globe,
  Hash,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export type SortOption = "title" | "date" | "chunks";

interface DocumentsFiltersProps {
  documents: Array<{
    contentType: string;
    language: string;
    topic?: string;
  }>;
  activeFilters: {
    contentType: string | null;
    language: string | null;
    topic: string | null;
  };
  onFilterChange: (
    filterType: "contentType" | "language" | "topic",
    value: string | null
  ) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

/** Format topic slug for display (e.g., "smart-city" -> "Smart City") */
function formatTopic(topic: string): string {
  return topic
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function DocumentsFilters({
  documents,
  activeFilters,
  onFilterChange,
  sortBy,
  onSortChange,
}: DocumentsFiltersProps) {
  const t = useTranslations("Knowledge");

  // Extract unique values for filters
  const filterOptions = useMemo(() => {
    const contentTypes = [
      ...new Set(documents.map((d) => d.contentType)),
    ].sort();
    const languages = [...new Set(documents.map((d) => d.language))].sort();
    const topics = [
      ...new Set(documents.map((d) => d.topic).filter(Boolean)),
    ] as string[];
    return { contentTypes, languages, topics: topics.sort() };
  }, [documents]);

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  const sortOptions: Array<{
    value: SortOption;
    label: string;
    icon: typeof ArrowDownAZ;
  }> = [
    { value: "title", label: t("sortByTitle"), icon: ArrowDownAZ },
    { value: "date", label: t("sortByDate"), icon: Calendar },
    { value: "chunks", label: t("sortByChunks"), icon: Hash },
  ];

  const currentSort =
    sortOptions.find((s) => s.value === sortBy) ?? sortOptions[0];

  const FilterContent = () => (
    <div className="flex flex-wrap items-center gap-2">
      {/* Content Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className={`gap-2 ${
              activeFilters.contentType
                ? "border-citylab-pink bg-citylab-pink/10 text-citylab-pink"
                : ""
            }`}
            size="sm"
            variant="outline"
          >
            <FileText className="h-3.5 w-3.5" />
            {activeFilters.contentType ?? t("contentType")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {activeFilters.contentType && (
            <DropdownMenuItem
              onClick={() => onFilterChange("contentType", null)}
            >
              <X className="mr-2 h-3.5 w-3.5" />
              {t("clearFilter")}
            </DropdownMenuItem>
          )}
          {filterOptions.contentTypes.map((type) => (
            <DropdownMenuItem
              key={type}
              onClick={() => onFilterChange("contentType", type)}
            >
              {type}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Language Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className={`gap-2 ${
              activeFilters.language
                ? "border-citylab-pink bg-citylab-pink/10 text-citylab-pink"
                : ""
            }`}
            size="sm"
            variant="outline"
          >
            <Globe className="h-3.5 w-3.5" />
            {activeFilters.language?.toUpperCase() ?? t("language")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {activeFilters.language && (
            <DropdownMenuItem onClick={() => onFilterChange("language", null)}>
              <X className="mr-2 h-3.5 w-3.5" />
              {t("clearFilter")}
            </DropdownMenuItem>
          )}
          {filterOptions.languages.map((lang) => (
            <DropdownMenuItem
              key={lang}
              onClick={() => onFilterChange("language", lang)}
            >
              {lang.toUpperCase()}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Topic Filter */}
      {filterOptions.topics.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={`gap-2 ${
                activeFilters.topic
                  ? "border-citylab-pink bg-citylab-pink/10 text-citylab-pink"
                  : ""
              }`}
              size="sm"
              variant="outline"
            >
              <Hash className="h-3.5 w-3.5" />
              {activeFilters.topic
                ? formatTopic(activeFilters.topic)
                : t("topic")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {activeFilters.topic && (
              <DropdownMenuItem onClick={() => onFilterChange("topic", null)}>
                <X className="mr-2 h-3.5 w-3.5" />
                {t("clearFilter")}
              </DropdownMenuItem>
            )}
            {filterOptions.topics.map((topic) => (
              <DropdownMenuItem
                key={topic}
                onClick={() => onFilterChange("topic", topic)}
              >
                {formatTopic(topic)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Clear all filters */}
      {activeFilterCount > 0 && (
        <Button
          className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => {
            onFilterChange("contentType", null);
            onFilterChange("language", null);
            onFilterChange("topic", null);
          }}
          size="sm"
          variant="ghost"
        >
          <X className="h-3.5 w-3.5" />
          {t("clearAllFilters")}
        </Button>
      )}
    </div>
  );

  return (
    <div className="fade-in slide-in-from-bottom-2 mb-8 animate-in fill-mode-backwards duration-300 [animation-delay:300ms]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Desktop filters */}
        <div className="hidden md:block">
          <FilterContent />
        </div>

        {/* Mobile filters - Sheet */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="gap-2" size="sm" variant="outline">
                <Filter className="h-4 w-4" />
                {t("filters")}
                {activeFilterCount > 0 && (
                  <Badge
                    className="ml-1 h-5 w-5 p-0 text-xs"
                    variant="secondary"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom">
              <SheetHeader>
                <SheetTitle>{t("filters")}</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2" size="sm" variant="outline">
              <ArrowUpDown className="h-3.5 w-3.5" />
              {currentSort?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onSortChange(option.value)}
              >
                <option.icon className="mr-2 h-3.5 w-3.5" />
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm">
            {t("activeFilters")}:
          </span>
          {activeFilters.contentType && (
            <Badge
              className="cursor-pointer gap-1 hover:bg-destructive/10"
              onClick={() => onFilterChange("contentType", null)}
              variant="secondary"
            >
              {activeFilters.contentType}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {activeFilters.language && (
            <Badge
              className="cursor-pointer gap-1 hover:bg-destructive/10"
              onClick={() => onFilterChange("language", null)}
              variant="secondary"
            >
              {activeFilters.language.toUpperCase()}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {activeFilters.topic && (
            <Badge
              className="cursor-pointer gap-1 hover:bg-destructive/10"
              onClick={() => onFilterChange("topic", null)}
              variant="secondary"
            >
              {formatTopic(activeFilters.topic)}
              <X className="h-3 w-3" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
