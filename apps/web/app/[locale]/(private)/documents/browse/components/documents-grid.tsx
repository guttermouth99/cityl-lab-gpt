"use client";

import { Skeleton } from "@baito/ui/components/skeleton";
import { Loader2 } from "lucide-react";
import { DocumentCard } from "./document-card";

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
}

interface DocumentsGridProps {
  documents: DocumentSummary[];
  previews: Map<string, PreviewData | null>;
  onDeleteDocument: (doc: DocumentSummary) => void;
  isLoading?: boolean;
  loadMoreRef?: (node: HTMLElement | null) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export function DocumentsGrid({
  documents,
  previews,
  onDeleteDocument,
  isLoading,
  loadMoreRef,
  hasMore,
  isLoadingMore,
}: DocumentsGridProps) {
  if (isLoading) {
    return <DocumentsGridSkeleton />;
  }

  return (
    <>
      <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc, index) => (
          <div
            className="fade-in slide-in-from-bottom-4 h-full animate-in fill-mode-backwards duration-500"
            key={`${doc.sourceId}-${index}`}
            style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
          >
            <DocumentCard
              document={doc}
              index={index}
              onDelete={() => onDeleteDocument(doc)}
              previewData={previews.get(doc.sourceId)}
            />
          </div>
        ))}
      </div>

      {/* Infinite scroll sentinel and loading indicator */}
      {hasMore && (
        <div
          className="flex items-center justify-center py-8"
          ref={loadMoreRef}
        >
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading more...</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function DocumentsGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          className="fade-in animate-in fill-mode-backwards duration-300"
          key={`skeleton-${i.toString()}`}
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="relative overflow-hidden border-2 border-muted">
            {/* Accent stripe */}
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-citylab-pink/30 to-citylab-blue/30" />

            {/* Image skeleton with shimmer */}
            <div className="relative h-40 w-full overflow-hidden bg-muted">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            {/* Content skeleton */}
            <div className="p-5 pl-6">
              <div className="mb-2 flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-8" />
              </div>
              <Skeleton className="mb-2 h-6 w-full" />
              <Skeleton className="mb-3 h-6 w-3/4" />
              <Skeleton className="mb-3 h-4 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
