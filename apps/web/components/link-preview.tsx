"use client";

import { cn } from "@baito/ui/lib/utils";
import { ExternalLink, Globe } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface LinkPreviewData {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  favicon: string | null;
}

interface LinkPreviewProps {
  url: string;
  className?: string;
}

export function LinkPreview({ url, className }: LinkPreviewProps) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchPreview() {
      try {
        const response = await fetch(
          `/api/link-preview?url=${encodeURIComponent(url)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch preview");
        }

        const data = await response.json();
        if (isMounted) {
          setPreview(data);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setError(true);
          setIsLoading(false);
        }
      }
    }

    fetchPreview();

    return () => {
      isMounted = false;
    };
  }, [url]);

  if (isLoading) {
    return <LinkPreviewSkeleton className={className} />;
  }

  if (error || !preview) {
    return null;
  }

  const hostname = new URL(url).hostname.replace("www.", "");

  return (
    <a
      className={cn(
        "group mt-3 flex overflow-hidden rounded-xl border bg-card transition-all hover:border-primary/50 hover:shadow-md",
        className
      )}
      href={url}
      rel="noopener noreferrer"
      target="_blank"
    >
      {/* Image Section */}
      {preview.image && !imageError && (
        <div className="relative hidden h-[120px] w-[200px] shrink-0 overflow-hidden sm:block">
          <Image
            alt={preview.title ?? "Link preview"}
            className="object-cover transition-transform group-hover:scale-105"
            fill
            onError={() => setImageError(true)}
            sizes="200px"
            src={preview.image}
          />
        </div>
      )}

      {/* Content Section */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-3">
        {/* Site Info */}
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          {preview.favicon && !imageError ? (
            <Image
              alt=""
              className="rounded-sm"
              height={14}
              onError={() => setImageError(true)}
              src={preview.favicon}
              width={14}
            />
          ) : (
            <Globe className="h-3.5 w-3.5" />
          )}
          <span className="truncate">{preview.siteName ?? hostname}</span>
        </div>

        {/* Title */}
        {preview.title && (
          <h4 className="line-clamp-2 font-medium text-foreground text-sm leading-snug group-hover:text-primary">
            {preview.title}
          </h4>
        )}

        {/* Description */}
        {preview.description && (
          <p className="line-clamp-2 text-muted-foreground text-xs">
            {preview.description}
          </p>
        )}
      </div>

      {/* External Link Icon */}
      <div className="flex items-center px-3">
        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </a>
  );
}

function LinkPreviewSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "mt-3 flex animate-pulse overflow-hidden rounded-xl border bg-card",
        className
      )}
    >
      <div className="hidden h-[120px] w-[200px] shrink-0 bg-muted sm:block" />
      <div className="flex flex-1 flex-col justify-center gap-2 p-3">
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-3.5 rounded bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
        </div>
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
      </div>
    </div>
  );
}
