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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  ExternalLink,
  FileText,
  Globe,
  RefreshCw,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
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
  chunkCount: number;
}

export default function BrowseDocumentsPage() {
  const t = useTranslations("Knowledge");
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [deleteDoc, setDeleteDoc] = useState<DocumentSummary | null>(null);

  const {
    data: documents,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery(trpc.documents.list.queryOptions());

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
        <Button
          disabled={isRefetching}
          onClick={() => refetch()}
          size="sm"
          variant="outline"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
          />
          {t("refresh")}
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={`skeleton-${i.toString()}`}>
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

      {!isLoading && documents && documents.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card className="flex flex-col" key={doc.sourceId}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2 text-lg">
                    {doc.title}
                  </CardTitle>
                  <Badge variant="secondary">{doc.contentType}</Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  <span className="uppercase">{doc.language}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <div className="flex-1 space-y-2 text-muted-foreground text-sm">
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
                <div className="mt-4 flex gap-2 border-t pt-3">
                  <Button
                    asChild
                    className="flex-1"
                    size="sm"
                    variant="outline"
                  >
                    <a href={doc.url} rel="noopener noreferrer" target="_blank">
                      <ExternalLink className="mr-2 h-3 w-3" />
                      {t("viewOriginal")}
                    </a>
                  </Button>
                  <Button
                    onClick={() => setDeleteDoc(doc)}
                    size="sm"
                    variant="outline"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="sr-only">{t("delete")}</span>
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
