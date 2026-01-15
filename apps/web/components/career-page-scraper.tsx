"use client";

import { Button } from "@baito/ui/components/button";
import { Input } from "@baito/ui/components/input";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, ExternalLink, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { useTRPCClient } from "@/lib/trpc/client";

interface ScrapeResult {
  runId: string;
  careerPageUrl: string;
}

export function CareerPageScraper() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ScrapeResult | null>(null);

  const trpcClient = useTRPCClient();

  const scrapeMutation = useMutation({
    mutationFn: async (input: { careerPageUrl: string }) => {
      return await trpcClient.scraping.scrapeCareerPage.mutate(input);
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      return;
    }
    setResult(null);
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
          disabled={scrapeMutation.isPending || !url.trim() || !isValidUrl(url)}
          type="submit"
        >
          {scrapeMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting scrape...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Find Jobs
            </>
          )}
        </Button>
      </form>

      {scrapeMutation.isError && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-red-700 text-sm">
          Failed to start scraping. Please check the URL and try again.
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-3 border-t pt-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Scraping started successfully!</span>
          </div>

          <div className="rounded-md bg-gray-50 p-3 text-sm">
            <p className="text-gray-600">
              Job extraction is running in the background. Results will be
              processed and indexed automatically.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-gray-500">Run ID:</span>
              <code className="rounded bg-gray-200 px-2 py-0.5 font-mono text-xs">
                {result.runId}
              </code>
            </div>
          </div>

          <a
            className="inline-flex items-center gap-1 text-green-600 text-sm hover:text-green-700"
            href={result.careerPageUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            View original page
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}
