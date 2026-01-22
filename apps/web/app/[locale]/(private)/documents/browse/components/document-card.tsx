"use client";

import { Badge } from "@baito/ui/components/badge";
import { Button } from "@baito/ui/components/button";
import {
  Calendar,
  ExternalLink,
  FileText,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface DocumentCardProps {
  document: {
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
  };
  index: number;
  onDelete: () => void;
  previewData?: {
    image?: string;
    description?: string;
    siteName?: string;
  } | null;
}

/** Format topic slug for display (e.g., "smart-city" -> "Smart City") */
function formatTopic(topic: string): string {
  return topic
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function DocumentCard({
  document,
  index,
  onDelete,
  previewData,
}: DocumentCardProps) {
  const t = useTranslations("Knowledge");
  const [imageError, setImageError] = useState(false);

  // Calculate stagger delay based on index (max 500ms)
  const animationDelay = Math.min(index * 50, 500);

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden border-2 border-muted bg-background transition-all duration-300 hover:-translate-y-1 hover:border-citylab-pink/50 hover:shadow-xl"
      style={{
        animationDelay: `${animationDelay}ms`,
      }}
    >
      {/* Accent stripe on left */}
      <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-citylab-pink to-citylab-blue transition-all duration-300 group-hover:w-2" />

      {/* Image area */}
      {previewData?.image && !imageError ? (
        <div className="relative h-40 w-full overflow-hidden bg-muted">
          <Image
            alt={document.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            fill
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={previewData.image}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

          {/* Content type badge - positioned on image */}
          <Badge
            className="absolute top-3 right-3 border-citylab-blue bg-citylab-blue text-white backdrop-blur-sm"
            variant="secondary"
          >
            {document.contentType}
          </Badge>
        </div>
      ) : (
        /* No image - show pattern background */
        <div className="relative flex h-24 w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  height="20"
                  id={`grid-${document.sourceId}`}
                  patternUnits="userSpaceOnUse"
                  width="20"
                >
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect
                fill={`url(#grid-${document.sourceId})`}
                height="100%"
                width="100%"
              />
            </svg>
          </div>
          <Badge
            className="border-citylab-blue bg-citylab-blue text-white"
            variant="secondary"
          >
            {document.contentType}
          </Badge>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 pl-6">
        {/* Topic and language */}
        <div className="mb-2 flex items-center gap-2">
          {document.topic && (
            <Badge
              className="bg-citylab-blue/10 text-citylab-blue"
              variant="outline"
            >
              {formatTopic(document.topic)}
            </Badge>
          )}
          <span className="font-mono text-muted-foreground text-xs uppercase">
            {document.language}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 font-semibold text-lg leading-tight transition-colors group-hover:text-citylab-pink">
          {document.title}
        </h3>

        {/* Description from preview */}
        {previewData?.description && (
          <p className="mb-3 line-clamp-2 text-muted-foreground text-sm">
            {previewData.description}
          </p>
        )}

        {/* Metadata row */}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs">
          {document.author && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {document.author}
            </span>
          )}
          {document.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(document.publishedAt).toLocaleDateString()}
            </span>
          )}
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {t("chunks", { count: document.chunkCount })}
          </span>
        </div>

        {/* Tags - fixed height container to ensure equal card heights */}
        <div className="mt-3 flex h-6 flex-nowrap items-center gap-1 overflow-hidden">
          {document.tags && document.tags.length > 0 ? (
            <>
              {document.tags.slice(0, 2).map((tag) => (
                <Badge
                  className="shrink-0 gap-1 text-xs"
                  key={tag}
                  variant="outline"
                >
                  <Tag className="h-2 w-2" />
                  {tag}
                </Badge>
              ))}
              {document.tags.length > 2 && (
                <Badge className="shrink-0 text-xs" variant="outline">
                  +{document.tags.length - 2}
                </Badge>
              )}
            </>
          ) : (
            /* Empty placeholder to maintain consistent height */
            <span className="invisible">placeholder</span>
          )}
        </div>
      </div>

      {/* Actions - appear on hover */}
      <div className="absolute right-4 bottom-4 flex gap-2 opacity-0 transition-all duration-200 group-hover:opacity-100">
        <Button
          asChild
          className="h-8 w-8 bg-background/90 backdrop-blur-sm"
          size="icon"
          variant="outline"
        >
          <a href={document.url} rel="noopener noreferrer" target="_blank">
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="sr-only">{t("viewOriginal")}</span>
          </a>
        </Button>
        <Button
          className="h-8 w-8 bg-background/90 text-destructive backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
          onClick={onDelete}
          size="icon"
          variant="outline"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="sr-only">{t("delete")}</span>
        </Button>
      </div>
    </article>
  );
}
