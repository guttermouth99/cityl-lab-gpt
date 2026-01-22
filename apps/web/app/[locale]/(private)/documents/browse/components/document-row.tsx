"use client";

import { Badge } from "@baito/ui/components/badge";
import { Button } from "@baito/ui/components/button";
import {
  Calendar,
  ExternalLink,
  FileText,
  Globe,
  Trash2,
  User,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface DocumentRowProps {
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
    favicon?: string;
  } | null;
}

/** Format topic slug for display (e.g., "smart-city" -> "Smart City") */
function formatTopic(topic: string): string {
  return topic
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function DocumentRow({
  document,
  index,
  onDelete,
  previewData,
}: DocumentRowProps) {
  const t = useTranslations("Knowledge");
  const [imageError, setImageError] = useState(false);

  // Calculate stagger delay based on index (max 400ms)
  const animationDelay = Math.min(index * 30, 400);

  // Alternating background for visual rhythm
  const isEven = index % 2 === 0;

  return (
    <article
      className={`group relative flex items-stretch gap-4 border-muted border-b p-4 transition-all duration-200 hover:bg-muted/30 ${
        isEven ? "bg-background" : "bg-muted/10"
      }`}
      style={{
        animationDelay: `${animationDelay}ms`,
      }}
    >
      {/* Accent stripe */}
      <div className="absolute top-0 bottom-0 left-0 w-1 bg-citylab-pink opacity-0 transition-all duration-200 group-hover:opacity-100" />

      {/* Thumbnail */}
      <div className="relative hidden h-16 w-24 shrink-0 overflow-hidden bg-muted sm:block">
        {previewData?.image && !imageError ? (
          <Image
            alt=""
            className="h-full w-full object-cover"
            fill
            onError={() => setImageError(true)}
            sizes="96px"
            src={previewData.image}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-citylab-blue/10 to-citylab-pink/10">
            <FileText className="h-6 w-6 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        {/* Title row */}
        <div className="flex items-center gap-2">
          <h3 className="line-clamp-1 font-medium transition-colors group-hover:text-citylab-pink">
            {document.title}
          </h3>
          {previewData?.favicon && (
            <Image
              alt=""
              className="h-4 w-4 shrink-0"
              height={16}
              src={previewData.favicon}
              width={16}
            />
          )}
        </div>

        {/* URL and metadata row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
          <span className="line-clamp-1 max-w-xs font-mono opacity-60">
            {new URL(document.url).hostname}
          </span>

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
      </div>

      {/* Badges */}
      <div className="hidden shrink-0 flex-wrap items-center justify-end gap-2 lg:flex">
        <Badge variant="secondary">{document.contentType}</Badge>
        {document.topic && (
          <Badge
            className="bg-citylab-blue/10 text-citylab-blue"
            variant="outline"
          >
            {formatTopic(document.topic)}
          </Badge>
        )}
        <Badge className="font-mono uppercase" variant="outline">
          <Globe className="mr-1 h-3 w-3" />
          {document.language}
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <Button
          asChild
          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
          size="icon"
          variant="ghost"
        >
          <a href={document.url} rel="noopener noreferrer" target="_blank">
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">{t("viewOriginal")}</span>
          </a>
        </Button>
        <Button
          className="h-8 w-8 text-muted-foreground opacity-60 transition-all hover:bg-destructive hover:text-destructive-foreground hover:opacity-100 group-hover:opacity-100"
          onClick={onDelete}
          size="icon"
          variant="ghost"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">{t("delete")}</span>
        </Button>
      </div>
    </article>
  );
}
