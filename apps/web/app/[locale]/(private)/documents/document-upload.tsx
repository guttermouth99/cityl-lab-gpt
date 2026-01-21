"use client";

import type {
  DocumentReviewPayload,
  EmbedDocumentOutput,
  ExtractedDocumentData,
  ExtractedDocumentMetadata,
} from "@baito/mastra";
import { Button } from "@baito/ui/components/button";
import { Input } from "@baito/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@baito/ui/components/select";
import { Textarea } from "@baito/ui/components/textarea";
import { useMutation } from "@tanstack/react-query";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { AlertCircle, CheckCircle, FileText, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { useTRPCClient } from "@/lib/trpc/client";
import { completeDocumentReview } from "./actions";

interface RunData {
  runId: string;
  token: string;
}

interface RunMetadata {
  status?: string;
  message?: string;
  extractedData?: ExtractedDocumentData;
  reviewToken?: {
    id: string;
    publicAccessToken: string;
  };
}

const CONTENT_TYPES = [
  { value: "blog", label: "Blog Post" },
  { value: "project", label: "Project" },
  { value: "youtube_transcript", label: "YouTube Transcript" },
  { value: "event", label: "Event" },
  { value: "page", label: "Page" },
  { value: "exhibition", label: "Exhibition" },
  { value: "team", label: "Team" },
  { value: "newsletter", label: "Newsletter" },
] as const;

const LANGUAGES = [
  { value: "de", label: "German" },
  { value: "en", label: "English" },
] as const;

export function DocumentUpload() {
  const [url, setUrl] = useState("");
  const [runData, setRunData] = useState<RunData | null>(null);
  const trpc = useTRPCClient();

  const triggerMutation = useMutation({
    mutationFn: (input: { url: string }) => trpc.documents.embed.mutate(input),
    onSuccess: (data) => setRunData(data),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setRunData(null);
    triggerMutation.mutate({ url: url.trim() });
  }

  function handleReset() {
    setUrl("");
    setRunData(null);
    triggerMutation.reset();
  }

  return (
    <div className="space-y-6">
      {/* URL Input Form */}
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <Input
          className="flex-1"
          disabled={triggerMutation.isPending || runData !== null}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL to embed (e.g., https://citylab-berlin.org/...)"
          type="url"
          value={url}
        />
        {runData ? (
          <Button onClick={handleReset} type="button" variant="outline">
            New Document
          </Button>
        ) : (
          <Button
            disabled={triggerMutation.isPending || !url.trim()}
            type="submit"
          >
            {triggerMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Embed Document
              </>
            )}
          </Button>
        )}
      </form>

      {/* Error Message */}
      {triggerMutation.isError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>
            {triggerMutation.error?.message || "Failed to start embedding"}
          </span>
        </div>
      )}

      {/* Realtime Status */}
      {runData && (
        <DocumentStatus
          accessToken={runData.token}
          onComplete={handleReset}
          runId={runData.runId}
        />
      )}
    </div>
  );
}

function DocumentStatus({
  runId,
  accessToken,
  onComplete,
}: {
  runId: string;
  accessToken: string;
  onComplete: () => void;
}) {
  const { run, error } = useRealtimeRun<EmbedDocumentOutput>(runId, {
    accessToken,
  });

  const metadata = run?.metadata as RunMetadata | undefined;
  const status = metadata?.status;
  const message = metadata?.message;
  const extractedData = metadata?.extractedData;
  const reviewToken = metadata?.reviewToken;

  const isAwaitingReview =
    status === "awaiting_review" && extractedData && reviewToken;
  const isCompleted = run?.status === "COMPLETED";
  const isFailed = run?.status === "FAILED" || run?.status === "CRASHED";

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>Error: {error.message}</span>
        </div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-4">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Connecting to task...</span>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>Task failed: {message || "Unknown error"}</span>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    const output = run.output as EmbedDocumentOutput | undefined;
    return (
      <div className="space-y-4">
        <div
          className={`flex items-center gap-2 rounded-lg border p-4 ${
            output?.status === "embedded"
              ? "border-green-500/50 bg-green-50 text-green-700 dark:bg-green-950/20"
              : output?.status === "rejected"
                ? "border-yellow-500/50 bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20"
                : "border-destructive/50 bg-destructive/10 text-destructive"
          }`}
        >
          {output?.status === "embedded" ? (
            <>
              <CheckCircle className="h-5 w-5" />
              <span>
                Document embedded successfully! Created {output.chunksCreated}{" "}
                chunks.
              </span>
            </>
          ) : output?.status === "rejected" ? (
            <>
              <X className="h-5 w-5" />
              <span>Document was rejected and not embedded.</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5" />
              <span>{output?.error || "Unknown error occurred"}</span>
            </>
          )}
        </div>
        <Button onClick={onComplete} variant="outline">
          Embed Another Document
        </Button>
      </div>
    );
  }

  if (isAwaitingReview) {
    return (
      <MetadataReview
        extractedData={extractedData}
        tokenId={reviewToken.id}
        tokenPublicAccessToken={reviewToken.publicAccessToken}
      />
    );
  }

  // Show processing status
  return (
    <div className="rounded-lg border bg-muted/50 p-4">
      <div className="flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="font-medium">{getStatusLabel(status)}</span>
      </div>
      {message && (
        <p className="mt-2 text-muted-foreground text-sm">{message}</p>
      )}
    </div>
  );
}

function getStatusLabel(status?: string): string {
  switch (status) {
    case "fetching":
      return "Fetching content...";
    case "extracting":
      return "Extracting metadata...";
    case "embedding":
      return "Embedding document...";
    default:
      return "Processing...";
  }
}

function MetadataReview({
  extractedData,
  tokenId,
  tokenPublicAccessToken,
}: {
  extractedData: ExtractedDocumentData;
  tokenId: string;
  tokenPublicAccessToken: string;
}) {
  const [metadata, setMetadata] = useState<ExtractedDocumentMetadata>(
    extractedData.metadata
  );
  const [tagsInput, setTagsInput] = useState(
    extractedData.metadata.tags.join(", ")
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update tags when input changes
  useEffect(() => {
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    setMetadata((prev) => ({ ...prev, tags }));
  }, [tagsInput]);

  const handleApprove = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload: DocumentReviewPayload = {
        approved: true,
        metadata,
      };
      const result = await completeDocumentReview(tokenId, payload);
      if (!result.success) {
        setError(result.error || "Failed to approve document");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to approve document"
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [tokenId, metadata]);

  const handleReject = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload: DocumentReviewPayload = {
        approved: false,
        rejectionReason: "Manually rejected by user",
      };
      const result = await completeDocumentReview(tokenId, payload);
      if (!result.success) {
        setError(result.error || "Failed to reject document");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reject document"
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [tokenId]);

  return (
    <div className="space-y-6 rounded-lg border bg-card p-6">
      <div>
        <h3 className="font-semibold text-lg">Review Extracted Content</h3>
        <p className="text-muted-foreground text-sm">
          Review and edit the metadata before embedding this document.
        </p>
      </div>

      {/* Content Preview */}
      <div className="space-y-2">
        <label className="font-medium text-sm">Content Preview</label>
        <div className="max-h-48 overflow-y-auto rounded-md border bg-muted/50 p-3 text-sm">
          {extractedData.preview}...
        </div>
        <p className="text-muted-foreground text-xs">
          URL: {extractedData.url}
        </p>
      </div>

      {/* Metadata Form */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Title */}
        <div className="space-y-2 sm:col-span-2">
          <label className="font-medium text-sm" htmlFor="title">
            Title
          </label>
          <Input
            id="title"
            onChange={(e) =>
              setMetadata((prev) => ({ ...prev, title: e.target.value }))
            }
            value={metadata.title}
          />
        </div>

        {/* Author */}
        <div className="space-y-2">
          <label className="font-medium text-sm" htmlFor="author">
            Author (optional)
          </label>
          <Input
            id="author"
            onChange={(e) =>
              setMetadata((prev) => ({
                ...prev,
                author: e.target.value || undefined,
              }))
            }
            placeholder="Author name"
            value={metadata.author || ""}
          />
        </div>

        {/* Source ID */}
        <div className="space-y-2">
          <label className="font-medium text-sm" htmlFor="sourceId">
            Source ID (slug)
          </label>
          <Input
            id="sourceId"
            onChange={(e) =>
              setMetadata((prev) => ({ ...prev, sourceId: e.target.value }))
            }
            value={metadata.sourceId}
          />
        </div>

        {/* Content Type */}
        <div className="space-y-2">
          <label className="font-medium text-sm">Content Type</label>
          <Select
            onValueChange={(value) =>
              setMetadata((prev) => ({
                ...prev,
                contentType: value as ExtractedDocumentMetadata["contentType"],
              }))
            }
            value={metadata.contentType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              {CONTENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <label className="font-medium text-sm">Language</label>
          <Select
            onValueChange={(value) =>
              setMetadata((prev) => ({
                ...prev,
                language: value as ExtractedDocumentMetadata["language"],
              }))
            }
            value={metadata.language}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Published At */}
        <div className="space-y-2">
          <label className="font-medium text-sm" htmlFor="publishedAt">
            Published Date (optional)
          </label>
          <Input
            id="publishedAt"
            onChange={(e) =>
              setMetadata((prev) => ({
                ...prev,
                publishedAt: e.target.value || undefined,
              }))
            }
            placeholder="YYYY-MM-DD"
            type="date"
            value={metadata.publishedAt?.split("T")[0] || ""}
          />
        </div>

        {/* Tags */}
        <div className="space-y-2 sm:col-span-2">
          <label className="font-medium text-sm" htmlFor="tags">
            Tags (comma-separated)
          </label>
          <Textarea
            className="min-h-[60px]"
            id="tags"
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="tag1, tag2, tag3"
            value={tagsInput}
          />
          <div className="flex flex-wrap gap-1">
            {metadata.tags.map((tag, index) => (
              <span
                className="rounded-full bg-primary/10 px-2 py-0.5 text-primary text-xs"
                key={index}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          disabled={isSubmitting}
          onClick={handleReject}
          variant="outline"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <X className="mr-2 h-4 w-4" />
          )}
          Reject
        </Button>
        <Button disabled={isSubmitting} onClick={handleApprove}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          Approve & Embed
        </Button>
      </div>
    </div>
  );
}
