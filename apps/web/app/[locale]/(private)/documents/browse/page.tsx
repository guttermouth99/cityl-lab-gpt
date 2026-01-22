"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@baito/ui/components/alert-dialog";
import { Badge } from "@baito/ui/components/badge";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useTRPC } from "@/lib/trpc/client";
import { DocumentsEmpty } from "./components/documents-empty";
import {
  DocumentsFilters,
  type SortOption,
} from "./components/documents-filters";
import { DocumentsGrid } from "./components/documents-grid";
import { DocumentsHeader } from "./components/documents-header";
import { DocumentsList } from "./components/documents-list";

interface DocumentSummary {
  sourceId: string;
  title: string;
  url: string;
  contentType: string;
  language: string;
  publishedAt?: string;
  tags?: string[];
  author?: string;
  topic?: string;
  chunkCount: number;
}

interface PreviewData {
  image?: string;
  description?: string;
  siteName?: string;
  favicon?: string;
}

export default function BrowseDocumentsPage() {
  const t = useTranslations("Knowledge");
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // State
  const [deleteDoc, setDeleteDoc] = useState<DocumentSummary | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("title");
  const [filters, setFilters] = useState<{
    contentType: string | null;
    language: string | null;
    topic: string | null;
  }>({
    contentType: null,
    language: null,
    topic: null,
  });

  // Preview data cache
  const [previews, setPreviews] = useState<Map<string, PreviewData | null>>(
    new Map()
  );

  // Debounce search query to prevent excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const isSearching = debouncedSearchQuery.length > 0;

  // Fetch documents with infinite scroll pagination when not searching
  const {
    data: paginatedData,
    isLoading: isLoadingAll,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    trpc.documents.listPaginated.infiniteQueryOptions(
      { limit: 12 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        enabled: !isSearching,
      }
    )
  );

  // Flatten paginated data into a single array
  const allDocuments = useMemo(
    () => paginatedData?.pages.flatMap((page) => page.items) ?? [],
    [paginatedData]
  );

  // Server-side search when there's a search query
  const { data: searchResults, isLoading: isLoadingSearch } = useQuery({
    ...trpc.documents.search.queryOptions({
      query: debouncedSearchQuery || "",
      filters: {
        contentType: filters.contentType,
        language: filters.language,
        topic: filters.topic,
      },
      sortBy,
    }),
    enabled: isSearching,
  });

  // Use search results when searching, otherwise use paginated documents
  const documents = isSearching ? searchResults : allDocuments;
  const isLoading = isSearching ? isLoadingSearch : isLoadingAll;

  // Intersection observer for infinite scroll
  const loadMoreRef = useIntersectionObserver(
    () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    {
      enabled: !isSearching && hasNextPage && !isFetchingNextPage,
      rootMargin: "200px",
    }
  );

  const deleteMutation = useMutation(
    trpc.documents.delete.mutationOptions({
      onSuccess: () => {
        // Invalidate both list and search queries
        queryClient.invalidateQueries({
          queryKey: trpc.documents.listPaginated.queryKey(),
        });
        if (isSearching) {
          queryClient.invalidateQueries({
            queryKey: trpc.documents.search.queryKey(),
          });
        }
        setDeleteDoc(null);
      },
    })
  );

  // Fetch previews for documents
  useEffect(() => {
    if (!documents) return;

    const fetchPreviews = async () => {
      const newPreviews = new Map(previews);

      for (const doc of documents) {
        if (newPreviews.has(doc.sourceId)) continue;

        try {
          const response = await fetch(
            `/api/link-preview?url=${encodeURIComponent(doc.url)}`
          );
          if (response.ok) {
            const data = await response.json();
            newPreviews.set(doc.sourceId, data);
          } else {
            newPreviews.set(doc.sourceId, null);
          }
        } catch {
          newPreviews.set(doc.sourceId, null);
        }
      }

      setPreviews(newPreviews);
    };

    fetchPreviews();
  }, [documents]);

  // Filter handler
  const handleFilterChange = useCallback(
    (
      filterType: "contentType" | "language" | "topic",
      value: string | null
    ) => {
      setFilters((prev) => ({ ...prev, [filterType]: value }));
    },
    []
  );

  // Filtered and sorted documents
  // When searching, server already handles filtering and sorting
  // When not searching, apply client-side filtering and sorting
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];

    // When searching, server handles everything - return as-is
    if (isSearching) {
      return documents;
    }

    let result = [...documents];

    // Apply client-side filters (only when not searching)
    if (filters.contentType) {
      result = result.filter((doc) => doc.contentType === filters.contentType);
    }
    if (filters.language) {
      result = result.filter((doc) => doc.language === filters.language);
    }
    if (filters.topic) {
      result = result.filter((doc) => doc.topic === filters.topic);
    }

    // Apply client-side sorting (only when not searching)
    result.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "date":
          if (!(a.publishedAt || b.publishedAt)) return 0;
          if (!a.publishedAt) return 1;
          if (!b.publishedAt) return -1;
          return (
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
          );
        case "chunks":
          return b.chunkCount - a.chunkCount;
        default:
          return 0;
      }
    });

    return result;
  }, [documents, isSearching, filters, sortBy]);

  // Total document count (from loaded documents)
  const documentCount = allDocuments.length;
  const filteredCount = filteredDocuments.length;
  const hasFilters = searchQuery || Object.values(filters).some(Boolean);

  // Show loading state when search query is typed but debounce hasn't triggered yet
  const isPendingSearch = searchQuery !== debouncedSearchQuery;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Header with search and view toggle */}
      <DocumentsHeader
        documentCount={documentCount}
        onSearchChange={setSearchQuery}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        viewMode={viewMode}
      />

      {/* Filters - only show when we have documents */}
      {!isLoading && documents && documents.length > 0 && (
        <DocumentsFilters
          activeFilters={filters}
          documents={documents}
          onFilterChange={handleFilterChange}
          onSortChange={setSortBy}
          sortBy={sortBy}
        />
      )}

      {/* Results count when filtered */}
      {hasFilters && !isLoading && !isPendingSearch && (
        <div className="fade-in mb-6 animate-in duration-200">
          <p className="text-muted-foreground text-sm">
            {t("showingResults", {
              count: filteredCount,
              total: documentCount,
            })}
          </p>
        </div>
      )}

      {/* Loading state */}
      {(isLoading || isPendingSearch) &&
        (viewMode === "grid" ? (
          <DocumentsGrid
            documents={[]}
            isLoading
            onDeleteDocument={() => {}}
            previews={new Map()}
          />
        ) : (
          <DocumentsList
            documents={[]}
            isLoading
            onDeleteDocument={() => {}}
            previews={new Map()}
          />
        ))}

      {/* Empty state - no documents at all */}
      {!(isLoading || isPendingSearch || isSearching) &&
        allDocuments.length === 0 && <DocumentsEmpty />}

      {/* No results from filtering/searching */}
      {!(isLoading || isPendingSearch) &&
        filteredDocuments.length === 0 &&
        (isSearching || (allDocuments && allDocuments.length > 0)) && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center border-2 border-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-semibold text-lg">
              {t("noResultsTitle")}
            </h3>
            <p className="text-muted-foreground">{t("noResultsDescription")}</p>
          </div>
        )}

      {/* Grid View */}
      {!(isLoading || isPendingSearch) &&
        filteredDocuments.length > 0 &&
        viewMode === "grid" && (
          <DocumentsGrid
            documents={filteredDocuments}
            hasMore={!isSearching && !!hasNextPage}
            isLoadingMore={isFetchingNextPage}
            loadMoreRef={loadMoreRef}
            onDeleteDocument={setDeleteDoc}
            previews={previews}
          />
        )}

      {/* List View */}
      {!(isLoading || isPendingSearch) &&
        filteredDocuments.length > 0 &&
        viewMode === "list" && (
          <DocumentsList
            documents={filteredDocuments}
            hasMore={!isSearching && !!hasNextPage}
            isLoadingMore={isFetchingNextPage}
            loadMoreRef={loadMoreRef}
            onDeleteDocument={setDeleteDoc}
            previews={previews}
          />
        )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        onOpenChange={(open) => !open && setDeleteDoc(null)}
        open={!!deleteDoc}
      >
        <AlertDialogContent className="border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              {t("deleteConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {deleteDoc &&
                t("deleteConfirmDescription", {
                  title: deleteDoc.title,
                  chunkCount: deleteDoc.chunkCount,
                })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Document preview in dialog */}
          {deleteDoc && (
            <div className="my-4 border-2 border-destructive/20 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <div className="min-w-0">
                  <p className="line-clamp-1 font-medium">{deleteDoc.title}</p>
                  <p className="line-clamp-1 text-muted-foreground text-sm">
                    {deleteDoc.url}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="secondary">{deleteDoc.contentType}</Badge>
                    <Badge variant="outline">
                      {deleteDoc.chunkCount} chunks
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() =>
                deleteDoc &&
                deleteMutation.mutate({ sourceId: deleteDoc.sourceId })
              }
            >
              {deleteMutation.isPending ? t("deleting") : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
