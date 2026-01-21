"use client";

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
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  ExternalLink,
  FileText,
  Globe,
  RefreshCw,
  Tag,
  User,
} from "lucide-react";
import { useTRPC } from "@/lib/trpc/client";

export default function BrowseDocumentsPage() {
  const trpc = useTRPC();
  const {
    data: documents,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery(trpc.documents.list.queryOptions());

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-bold text-3xl">Browse Documents</h1>
          <p className="text-muted-foreground">
            View all documents in the CityLAB Berlin knowledge base.
          </p>
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
          Refresh
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
                    <span>{doc.chunkCount} chunks</span>
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
                        +{doc.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
                <div className="mt-4 border-t pt-3">
                  <Button
                    asChild
                    className="w-full"
                    size="sm"
                    variant="outline"
                  >
                    <a href={doc.url} rel="noopener noreferrer" target="_blank">
                      <ExternalLink className="mr-2 h-3 w-3" />
                      View Original
                    </a>
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
            <h2 className="mb-2 font-semibold text-lg">No documents yet</h2>
            <p className="mb-4 text-muted-foreground">
              Start by adding a document to the knowledge base.
            </p>
            <Button asChild>
              <a href="/dashboard/add-document">Add Document</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
