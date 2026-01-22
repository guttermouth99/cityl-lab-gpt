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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@baito/ui/components/tabs";
import { Textarea } from "@baito/ui/components/textarea";
import { useMutation } from "@tanstack/react-query";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Link,
  Loader2,
  Type,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { useTRPCClient } from "@/lib/trpc/client";
import { completeDocumentReview } from "./actions";

type InputMode = "url" | "text";

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
  const [inputMode, setInputMode] = useState<InputMode>("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [runData, setRunData] = useState<RunData | null>(null);
  const trpc = useTRPCClient();

  const triggerMutation = useMutation({
    mutationFn: (input: {
      url?: string;
      text?: string;
      title?: string;
      source?: string;
    }) => trpc.documents.embed.mutate(input),
    onSuccess: (data) => setRunData(data),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRunData(null);

    if (inputMode === "url") {
      if (!url.trim()) return;
      triggerMutation.mutate({ url: url.trim() });
    } else {
      if (!text.trim()) return;
      triggerMutation.mutate({
        text: text.trim(),
        title: title.trim() || undefined,
        source: source.trim() || undefined,
      });
    }
  }

  function handleReset() {
    setUrl("");
    setText("");
    setTitle("");
    setSource("");
    setRunData(null);
    triggerMutation.reset();
  }

  const isDisabled = triggerMutation.isPending || runData !== null;
  const canSubmit =
    inputMode === "url" ? url.trim().length > 0 : text.trim().length > 0;

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="url"
        onValueChange={(value) => setInputMode(value as InputMode)}
        value={inputMode}
      >
        <TabsList className="h-auto w-full border-2 border-muted bg-transparent p-1">
          <TabsTrigger
            className={
              "flex-1 gap-2 py-2.5 transition-all data-[state=active]:bg-citylab-blue data-[state=active]:text-white data-[state=active]:shadow-none"
            }
            disabled={isDisabled}
            value="url"
          >
            <Link className="h-4 w-4" />
            {t("fromUrl")}
          </TabsTrigger>
          <TabsTrigger
            className={
              "flex-1 gap-2 py-2.5 transition-all data-[state=active]:bg-citylab-blue data-[state=active]:text-white data-[state=active]:shadow-none"
            }
            disabled={isDisabled}
            value="text"
          >
            <Type className="h-4 w-4" />
            {t("fromText")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url">
          <form className="flex gap-3" onSubmit={handleSubmit}>
            <Input
              className="flex-1 border-2 border-muted bg-background transition-all focus:border-citylab-pink focus:ring-2 focus:ring-citylab-pink/20"
              disabled={isDisabled}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t("urlPlaceholder")}
              type="url"
              value={url}
            />
            {runData ? (
              <Button
                className="border-2"
                onClick={handleReset}
                type="button"
                variant="outline"
              >
                {t("newDocument")}
              </Button>
            ) : (
              <Button
                className="bg-citylab-pink hover:bg-citylab-pink/90"
                disabled={triggerMutation.isPending || !canSubmit}
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
        </TabsContent>

        <TabsContent value="text">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Input
                className="border-2 border-muted bg-background transition-all focus:border-citylab-pink focus:ring-2 focus:ring-citylab-pink/20"
                disabled={isDisabled}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("titlePlaceholder")}
                value={title}
              />
            </div>
            <div className="space-y-2">
              <Input
                className="border-2 border-muted bg-background transition-all focus:border-citylab-pink focus:ring-2 focus:ring-citylab-pink/20"
                disabled={isDisabled}
                onChange={(e) => setSource(e.target.value)}
                placeholder={t("sourcePlaceholder")}
                type="url"
                value={source}
              />
              <p className="text-muted-foreground text-xs">{t("sourceHelp")}</p>
            </div>
            <div className="space-y-2">
              <Textarea
                className="min-h-[200px] border-2 border-muted bg-background transition-all focus:border-citylab-pink focus:ring-2 focus:ring-citylab-pink/20"
                disabled={isDisabled}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("textPlaceholder")}
                value={text}
              />
              <p className="text-muted-foreground text-xs">{t("textHelp")}</p>
            </div>
            <div className="flex justify-end gap-3">
              {runData ? (
                <Button
                  className="border-2"
                  onClick={handleReset}
                  type="button"
                  variant="outline"
                >
                  {t("newDocument")}
                </Button>
              ) : (
                <Button
                  className="bg-citylab-pink hover:bg-citylab-pink/90"
                  disabled={triggerMutation.isPending || !canSubmit}
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
            </div>
          </form>
        </TabsContent>
      </Tabs>

      {/* Error Message */}
      {triggerMutation.isError && (
        <div className="fade-in relative animate-in overflow-hidden border-2 border-destructive/30 bg-destructive/5 p-4 duration-300">
          {/* Accent stripe */}
          <div className="absolute top-0 bottom-0 left-0 w-1 bg-destructive" />
          <div className="flex items-center gap-3 pl-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
            <span className="text-destructive">
              {triggerMutation.error?.message || t("failedToStart")}
            </span>
          </div>
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
      <div className="fade-in relative animate-in overflow-hidden border-2 border-destructive/30 bg-destructive/5 p-4 duration-300">
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-destructive" />
        <div className="flex items-center gap-3 pl-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span className="text-destructive">Error: {error.message}</span>
        </div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="fade-in relative animate-in overflow-hidden border-2 border-muted bg-muted/30 p-4 duration-300">
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-citylab-pink to-citylab-blue" />
        <div className="flex items-center gap-3 pl-3">
          <Loader2 className="h-5 w-5 animate-spin text-citylab-pink" />
          <span>{t("connectingToTask")}</span>
        </div>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="fade-in relative animate-in overflow-hidden border-2 border-destructive/30 bg-destructive/5 p-4 duration-300">
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-destructive" />
        <div className="flex items-center gap-3 pl-3 text-destructive">
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
    const isEmbedded = output?.status === "embedded";
    const isRejected = output?.status === "rejected";

    const getContainerClass = (): string => {
      if (isEmbedded)
        return "border-green-500/30 bg-green-50/50 dark:bg-green-950/20";
      if (isRejected)
        return "border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-950/20";
      return "border-destructive/30 bg-destructive/5";
    };

    const getStripeClass = (): string => {
      if (isEmbedded) return "bg-green-500";
      if (isRejected) return "bg-yellow-500";
      return "bg-destructive";
    };

    return (
      <div className="fade-in animate-in space-y-4 duration-300">
        <div
          className={`relative overflow-hidden border-2 p-4 ${getContainerClass()}`}
        >
          {/* Accent stripe */}
          <div
            className={`absolute top-0 bottom-0 left-0 w-1 ${getStripeClass()}`}
          />
          <div className="flex items-center gap-3 pl-3">
            {isEmbedded && (
              <>
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300">
                  {t("embeddedSuccess", {
                    chunksCreated: output.chunksCreated,
                  })}
                </span>
              </>
            )}
            {isRejected && (
              <>
                <X className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-yellow-700 dark:text-yellow-300">
                  {t("documentRejected")}
                </span>
              </>
            )}
            {!(isEmbedded || isRejected) && (
              <>
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span className="text-destructive">
                  {output?.error || t("unknownError")}
                </span>
              </>
            )}
          </div>
        </div>
        <Button className="border-2" onClick={onComplete} variant="outline">
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
    <div className="fade-in relative animate-in overflow-hidden border-2 border-muted bg-muted/30 p-4 duration-300">
      {/* Animated gradient stripe */}
      <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-citylab-pink to-citylab-blue" />
      <div className="pl-3">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-citylab-pink" />
          <span className="font-medium">{getStatusLabel(status)}</span>
        </div>
        {message && (
          <p className="mt-2 text-muted-foreground text-sm">{message}</p>
        )}
      </div>
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
    <div className="fade-in relative animate-in overflow-hidden border-2 border-muted bg-card p-6 duration-500">
      {/* Accent stripe on left */}
      <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-citylab-pink to-citylab-blue" />

      <div className="space-y-6 pl-4">
        {/* Header with gradient text */}
        <div>
          <h3 className="mb-1 font-bold text-xl">
            <span className="bg-gradient-to-r from-citylab-pink to-citylab-blue bg-clip-text text-transparent">
              {t("reviewTitle")}
            </span>
          </h3>
          <p className="text-muted-foreground text-sm">
            {t("reviewDescription")}
          </p>
        </div>

        {/* Content Preview */}
        <div className="space-y-2">
          <label className="font-medium text-sm">{t("contentPreview")}</label>
          <div className="relative overflow-hidden border-2 border-muted bg-muted/30">
            <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-citylab-blue/50" />
            <div className="max-h-48 overflow-y-auto p-4 pl-4 text-sm">
              {extractedData.preview}...
            </div>
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
              className="border-2 border-muted bg-background transition-all focus:border-citylab-pink focus:ring-2 focus:ring-citylab-pink/20"
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
              className="border-2 border-muted bg-background transition-all focus:border-citylab-pink focus:ring-2 focus:ring-citylab-pink/20"
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
              className="border-2 border-muted bg-background transition-all focus:border-citylab-pink focus:ring-2 focus:ring-citylab-pink/20"
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
                  contentType:
                    value as ExtractedDocumentMetadata["contentType"],
                }))
              }
              value={metadata.contentType}
            >
              <SelectTrigger className="border-2 border-muted bg-background transition-all focus:border-citylab-pink focus:ring-2 focus:ring-citylab-pink/20">
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
              <SelectTrigger className="border-2 border-muted bg-background transition-all focus:border-citylab-pink focus:ring-2 focus:ring-citylab-pink/20">
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
              className="border-2 border-muted bg-background transition-all focus:border-citylab-pink focus:ring-2 focus:ring-citylab-pink/20"
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
              className="min-h-[60px] border-2 border-muted bg-background transition-all focus:border-citylab-pink focus:ring-2 focus:ring-citylab-pink/20"
              id="tags"
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder={t("tagsPlaceholder")}
              value={tagsInput}
            />
            <div className="flex flex-wrap gap-1.5">
              {metadata.tags.map((tag, index) => (
                <span
                  className="border border-citylab-pink/30 bg-citylab-pink/10 px-2 py-0.5 text-citylab-pink text-xs"
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
          <div className="relative overflow-hidden border-2 border-destructive/30 bg-destructive/5 p-3">
            <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-destructive" />
            <div className="flex items-center gap-2 pl-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            className="border-2"
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
          <Button
            className="bg-citylab-pink hover:bg-citylab-pink/90"
            disabled={isSubmitting}
            onClick={handleApprove}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            {t("approveAndEmbed")}
          </Button>
        </div>
      </div>
    </div>
  );
}
