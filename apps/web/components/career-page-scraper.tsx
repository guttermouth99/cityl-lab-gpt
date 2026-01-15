"use client";

import { Button } from "@baito/ui/components/button";
import { Input } from "@baito/ui/components/input";
import { useMutation } from "@tanstack/react-query";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Search,
} from "lucide-react";
import { useState } from "react";
import { useTRPCClient } from "@/lib/trpc/client";

interface JobListing {
  jobTitle: string;
  jobUrl: string;
  jobDate: string | null;
}

interface ScrapeResult {
  runId: string;
  publicAccessToken: string;
  careerPageUrl: string;
}

interface TaskOutput {
  jobs: JobListing[];
  url: string;
  scrapedAt: string;
}

function ButtonContent({
  isPending,
  isRunning,
}: {
  isPending: boolean;
  isRunning: boolean;
}) {
  if (isPending) {
    return (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        Starting...
      </>
    );
  }
  if (isRunning) {
    return (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        Scraping...
      </>
    );
  }
  return (
    <>
      <Search className="h-4 w-4" />
      Find Jobs
    </>
  );
}

export function CareerPageScraper() {
  const [url, setUrl] = useState("");
  const [triggerResult, setTriggerResult] = useState<ScrapeResult | null>(null);

  const trpcClient = useTRPCClient();

  // Subscribe to realtime updates when we have a runId and token
  const { run, error: realtimeError } = useRealtimeRun<{
    output: TaskOutput;
  }>(triggerResult?.runId ?? "", {
    accessToken: triggerResult?.publicAccessToken,
    enabled: !!triggerResult?.runId && !!triggerResult?.publicAccessToken,
  });

  const scrapeMutation = useMutation({
    mutationFn: async (input: { careerPageUrl: string }) => {
      return await trpcClient.scraping.scrapeCareerPage.mutate(input);
    },
    onSuccess: (data) => {
      setTriggerResult(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      return;
    }
    setTriggerResult(null);
    scrapeMutation.mutate({ careerPageUrl: url.trim() });
  };

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const isRunning =
    run?.status === "EXECUTING" ||
    run?.status === "QUEUED" ||
    run?.status === "PENDING";
  const isCompleted = run?.status === "COMPLETED";
  const isFailed =
    run?.status === "FAILED" ||
    run?.status === "CRASHED" ||
    run?.status === "SYSTEM_FAILURE";

  const output = run?.output as TaskOutput | undefined;

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-gray-900 text-lg">
        Career Page Scraper
      </h3>
      <p className="mb-4 text-gray-600 text-sm">
        Enter a company&apos;s career page URL to extract all job listings.
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            className="mb-1 block font-medium text-gray-700 text-sm"
            htmlFor="career-page-url"
          >
            Career Page URL
          </label>
          <Input
            id="career-page-url"
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://company.com/careers"
            type="url"
            value={url}
          />
        </div>

        <Button
          className="w-full"
          disabled={
            scrapeMutation.isPending ||
            isRunning ||
            !url.trim() ||
            !isValidUrl(url)
          }
          type="submit"
        >
          <ButtonContent
            isPending={scrapeMutation.isPending}
            isRunning={isRunning}
          />
        </Button>
      </form>

      {(scrapeMutation.isError || realtimeError) && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-red-700 text-sm">
          Failed to start scraping. Please check the URL and try again.
        </div>
      )}

      {/* Running state */}
      {triggerResult && isRunning && (
        <div className="mt-6 space-y-3 border-t pt-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="font-medium">Extracting job listings...</span>
          </div>
          <p className="text-gray-600 text-sm">
            This may take a few seconds depending on the page size.
          </p>
        </div>
      )}

      {/* Failed state */}
      {triggerResult && isFailed && (
        <div className="mt-6 space-y-3 border-t pt-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Scraping failed</span>
          </div>
          <p className="text-gray-600 text-sm">
            Unable to extract jobs from this page. The page may be protected or
            have an unsupported format.
          </p>
        </div>
      )}

      {/* Completed state with results */}
      {triggerResult && isCompleted && output && (
        <div className="mt-6 space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">
                Found {output.jobs.length} job
                {output.jobs.length !== 1 ? "s" : ""}
              </span>
            </div>
            <a
              className="inline-flex items-center gap-1 text-gray-500 text-sm hover:text-gray-700"
              href={triggerResult.careerPageUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              View page
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {output.jobs.length > 0 ? (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {output.jobs.map((job, index) => (
                <div
                  className="rounded-md border bg-gray-50 p-3"
                  key={`${job.jobUrl}-${index}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-medium text-gray-900 text-sm">
                        {job.jobTitle}
                      </h4>
                      {job.jobDate && (
                        <p className="mt-0.5 text-gray-500 text-xs">
                          {job.jobDate}
                        </p>
                      )}
                    </div>
                    {job.jobUrl && (
                      <a
                        className="shrink-0 text-green-600 hover:text-green-700"
                        href={
                          job.jobUrl.startsWith("http")
                            ? job.jobUrl
                            : new URL(job.jobUrl, triggerResult.careerPageUrl)
                                .href
                        }
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">
              No job listings were found on this page.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
