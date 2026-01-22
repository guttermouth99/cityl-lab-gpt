"use client";

import { Skeleton } from "@baito/ui/components/skeleton";
import { DocumentRow } from "./document-row";

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

interface DocumentsListProps {
  documents: DocumentSummary[];
  previews: Map<string, PreviewData | null>;
  onDeleteDocument: (doc: DocumentSummary) => void;
  isLoading?: boolean;
}

export function DocumentsList({
  documents,
  previews,
  onDeleteDocument,
  isLoading,
}: DocumentsListProps) {
  if (isLoading) {
    return <DocumentsListSkeleton />;
  }

  return (
    <div className="overflow-hidden border-2 border-muted">
      {documents.map((doc, index) => (
        <div
          className="fade-in slide-in-from-left-2 animate-in fill-mode-backwards duration-300"
          key={doc.sourceId}
          style={{ animationDelay: `${Math.min(index * 30, 400)}ms` }}
        >
          <DocumentRow
            document={doc}
            index={index}
            onDelete={() => onDeleteDocument(doc)}
            previewData={previews.get(doc.sourceId)}
          />
        </div>
      ))}
    </div>
  );
}

function DocumentsListSkeleton() {
  return (
    <div className="overflow-hidden border-2 border-muted">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          className={`fade-in animate-in fill-mode-backwards duration-200 ${
            i % 2 === 0 ? "bg-background" : "bg-muted/10"
          }`}
          key={`skeleton-${i.toString()}`}
          style={{ animationDelay: `${i * 30}ms` }}
        >
          <div className="flex items-center gap-4 border-muted border-b p-4">
            {/* Thumbnail skeleton */}
            <div className="relative hidden h-16 w-24 shrink-0 overflow-hidden bg-muted sm:block">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            {/* Content skeleton */}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-5 w-3/4" />
              <div className="flex gap-3">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>

            {/* Badges skeleton */}
            <div className="hidden shrink-0 gap-2 lg:flex">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-10" />
            </div>

            {/* Actions skeleton */}
            <div className="flex shrink-0 gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
