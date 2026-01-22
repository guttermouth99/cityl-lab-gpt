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
import { Button } from "@baito/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@baito/ui/components/card";
import { Skeleton } from "@baito/ui/components/skeleton";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@baito/ui/components/toggle-group";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  FileText,
  Globe,
  LayoutGrid,
  List,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LinkPreview } from "@/components/link-preview";
import { useTRPC } from "@/lib/trpc/client";

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

/** Format topic slug for display (e.g., "smart-city" -> "Smart City") */
function formatTopic(topic: string): string {
  return topic
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function BrowseDocumentsPage() {
  const t = useTranslations("Knowledge");
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [deleteDoc, setDeleteDoc] = useState<DocumentSummary | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const { data: documents, isLoading } = useQuery(
    trpc.documents.list.queryOptions()
  );

  const deleteMutation = useMutation(
    trpc.documents.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.documents.list.queryKey(),
        });
        setDeleteDoc(null);
      },
    })
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-bold text-3xl">{t("pageTitle")}</h1>
          <p className="text-muted-foreground">{t("pageDescription")}</p>
        </div>
        <ToggleGroup
          onValueChange={(value) =>
            value && setViewMode(value as "list" | "grid")
          }
          type="single"
          value={viewMode}
          variant="outline"
        >
          <ToggleGroupItem aria-label={t("listView")} value="list">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label={t("gridView")} value="grid">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {isLoading && viewMode === "list" && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              className="flex items-center gap-4 rounded-lg border p-4"
              key={`skeleton-list-${i.toString()}`}
            >
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="ml-auto h-8 w-20" />
            </div>
          ))}
        </div>
      )}

      {isLoading && viewMode === "grid" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={`skeleton-grid-${i.toString()}`}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {!isLoading &&
        documents &&
        documents.length > 0 &&
        viewMode === "list" && (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                key={doc.sourceId}
              >
                {/* Header Row with Title, Badges, and Actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  {/* Title */}
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-1 font-medium">{doc.title}</h3>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    <Badge variant="secondary">{doc.contentType}</Badge>
                    {doc.topic && (
                      <Badge variant="outline">{formatTopic(doc.topic)}</Badge>
                    )}
                    <Badge className="uppercase" variant="outline">
                      {doc.language}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {t("chunks", { count: doc.chunkCount })}
                    </span>
                  </div>

                  {/* Delete Action */}
                  <div className="flex gap-2 sm:shrink-0">
                    <Button
                      onClick={() => setDeleteDoc(doc)}
                      size="sm"
                      variant="outline"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">{t("delete")}</span>
                    </Button>
                  </div>
                </div>

                {/* Link Preview */}
                <LinkPreview className="mt-0" url={doc.url} />
              </div>
            ))}
          </div>
        )}

      {/* Grid View */}
      {!isLoading &&
        documents &&
        documents.length > 0 &&
        viewMode === "grid" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <Card className="flex flex-col" key={doc.sourceId}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 text-lg">
                      {doc.title}
                    </CardTitle>
                    <div className="flex flex-col gap-1">
                      <Badge variant="secondary">{doc.contentType}</Badge>
                      {doc.topic && (
                        <Badge variant="outline">
                          {formatTopic(doc.topic)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    <span className="uppercase">{doc.language}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  {/* Link Preview with OG metadata */}
                  <LinkPreview className="mt-0" url={doc.url} />

                  <div className="mt-4 space-y-2 text-muted-foreground text-sm">
                    {doc.author && (
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>{doc.author}</span>
                      </div>
                    )}
                    {doc.publishedAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(doc.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      <span>{t("chunks", { count: doc.chunkCount })}</span>
                    </div>
                  </div>
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {doc.tags.slice(0, 3).map((tag) => (
                        <Badge className="text-xs" key={tag} variant="outline">
                          <Tag className="mr-1 h-2 w-2" />
                          {tag}
                        </Badge>
                      ))}
                      {doc.tags.length > 3 && (
                        <Badge className="text-xs" variant="outline">
                          {t("moreTags", { count: doc.tags.length - 3 })}
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="mt-4 flex justify-end border-t pt-3">
                    <Button
                      onClick={() => setDeleteDoc(doc)}
                      size="sm"
                      variant="outline"
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      {t("delete")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      {!isLoading && (!documents || documents.length === 0) && (
        <Card className="py-12 text-center">
          <CardContent>
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 font-semibold text-lg">{t("noDocuments")}</h2>
            <p className="mb-4 text-muted-foreground">
              {t("noDocumentsDescription")}
            </p>
            <Button asChild>
              <a href="/dashboard/add-document">{t("addDocument")}</a>
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog
        onOpenChange={(open) => !open && setDeleteDoc(null)}
        open={!!deleteDoc}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDoc &&
                t("deleteConfirmDescription", {
                  title: deleteDoc.title,
                  chunkCount: deleteDoc.chunkCount,
                })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
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
