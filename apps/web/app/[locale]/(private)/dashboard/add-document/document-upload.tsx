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
import { useTranslations } from "next-intl";
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

const CONTENT_TYPE_VALUES = [
  "blog",
  "project",
  "youtube_transcript",
  "event",
  "page",
  "exhibition",
  "team",
  "newsletter",
] as const;

const LANGUAGE_VALUES = ["de", "en"] as const;

export function DocumentUpload() {
  const t = useTranslations("AddDocument");
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
          placeholder={t("urlPlaceholder")}
          type="url"
          value={url}
        />
        {runData ? (
          <Button onClick={handleReset} type="button" variant="outline">
            {t("newDocument")}
          </Button>
        ) : (
          <Button
            disabled={triggerMutation.isPending || !url.trim()}
            type="submit"
          >
            {triggerMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("starting")}
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                {t("embedDocument")}
              </>
            )}
          </Button>
        )}
      </form>

      {/* Error Message */}
      {triggerMutation.isError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{triggerMutation.error?.message || t("failedToStart")}</span>
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
  const t = useTranslations("AddDocument");
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

  const getStatusLabel = (statusValue?: string): string => {
    switch (statusValue) {
      case "fetching":
        return t("statusFetching");
      case "extracting":
        return t("statusExtracting");
      case "embedding":
        return t("statusEmbedding");
      default:
        return t("statusProcessing");
    }
  };

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
        <span>{t("connectingToTask")}</span>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>
            {t("taskFailed", { message: message || t("unknownError") })}
          </span>
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
                {t("embeddedSuccess", { chunksCreated: output.chunksCreated })}
              </span>
            </>
          ) : output?.status === "rejected" ? (
            <>
              <X className="h-5 w-5" />
              <span>{t("documentRejected")}</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5" />
              <span>{output?.error || t("unknownError")}</span>
            </>
          )}
        </div>
        <Button onClick={onComplete} variant="outline">
          {t("embedAnother")}
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

function MetadataReview({
  extractedData,
  tokenId,
  tokenPublicAccessToken,
}: {
  extractedData: ExtractedDocumentData;
  tokenId: string;
  tokenPublicAccessToken: string;
}) {
  const t = useTranslations("AddDocument");
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
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
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
        setError(result.error || t("failedToApprove"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToApprove"));
    } finally {
      setIsSubmitting(false);
    }
  }, [tokenId, metadata, t]);

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
        setError(result.error || t("failedToReject"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToReject"));
    } finally {
      setIsSubmitting(false);
    }
  }, [tokenId, t]);

  return (
    <div className="space-y-6 rounded-lg border bg-card p-6">
      <div>
        <h3 className="font-semibold text-lg">{t("reviewTitle")}</h3>
        <p className="text-muted-foreground text-sm">
          {t("reviewDescription")}
        </p>
      </div>

      {/* Content Preview */}
      <div className="space-y-2">
        <label className="font-medium text-sm">{t("contentPreview")}</label>
        <div className="max-h-48 overflow-y-auto rounded-md border bg-muted/50 p-3 text-sm">
          {extractedData.preview}...
        </div>
        <p className="text-muted-foreground text-xs">
          {t("urlLabel", { url: extractedData.url })}
        </p>
      </div>

      {/* Metadata Form */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Title */}
        <div className="space-y-2 sm:col-span-2">
          <label className="font-medium text-sm" htmlFor="title">
            {t("title")}
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
            {t("authorOptional")}
          </label>
          <Input
            id="author"
            onChange={(e) =>
              setMetadata((prev) => ({
                ...prev,
                author: e.target.value || undefined,
              }))
            }
            placeholder={t("authorPlaceholder")}
            value={metadata.author || ""}
          />
        </div>

        {/* Source ID */}
        <div className="space-y-2">
          <label className="font-medium text-sm" htmlFor="sourceId">
            {t("sourceId")}
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
          <label className="font-medium text-sm">{t("contentType")}</label>
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
              <SelectValue placeholder={t("selectContentType")} />
            </SelectTrigger>
            <SelectContent>
              {CONTENT_TYPE_VALUES.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`contentTypes.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <label className="font-medium text-sm">{t("language")}</label>
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
              <SelectValue placeholder={t("selectLanguage")} />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_VALUES.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {t(`languages.${lang}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Published At */}
        <div className="space-y-2">
          <label className="font-medium text-sm" htmlFor="publishedAt">
            {t("publishedDateOptional")}
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
            {t("tagsLabel")}
          </label>
          <Textarea
            className="min-h-[60px]"
            id="tags"
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder={t("tagsPlaceholder")}
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
          {t("reject")}
        </Button>
        <Button disabled={isSubmitting} onClick={handleApprove}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          {t("approveAndEmbed")}
        </Button>
      </div>
    </div>
  );
}
