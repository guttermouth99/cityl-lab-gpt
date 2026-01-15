"use client";

import { Button } from "@baito/ui/components/button";
import { Textarea } from "@baito/ui/components/textarea";
import { useMutation } from "@tanstack/react-query";
import { useRealtimeBatch } from "@trigger.dev/react-hooks";
import {
  AlertCircle,
  CheckCircle2,
  Leaf,
  Loader2,
  Shield,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useTRPCClient } from "@/lib/trpc/client";

interface AssessmentResult {
  batchId: string;
  runCount: number;
  publicAccessToken: string;
  companyNames: string[];
}

interface TaskOutput {
  companyName: string;
  verdict: "Has Impact" | "No Clear Impact" | "Insufficient Information";
  confidenceLevel: "High" | "Medium" | "Low";
  summary: string;
  action: "marked_as_impact" | "marked_as_blacklisted";
}

function getVerdictIcon(verdict: TaskOutput["verdict"]) {
  switch (verdict) {
    case "Has Impact":
      return <Leaf className="h-5 w-5 text-green-600" />;
    case "No Clear Impact":
      return <XCircle className="h-5 w-5 text-red-600" />;
    case "Insufficient Information":
      return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    default:
      return null;
  }
}

function getVerdictBadge(verdict: TaskOutput["verdict"]) {
  switch (verdict) {
    case "Has Impact":
      return (
        <span className="rounded-full bg-green-100 px-2 py-1 font-medium text-green-800 text-xs">
          Has Impact
        </span>
      );
    case "No Clear Impact":
      return (
        <span className="rounded-full bg-red-100 px-2 py-1 font-medium text-red-800 text-xs">
          No Clear Impact
        </span>
      );
    case "Insufficient Information":
      return (
        <span className="rounded-full bg-yellow-100 px-2 py-1 font-medium text-xs text-yellow-800">
          Insufficient Info
        </span>
      );
    default:
      return null;
  }
}

function getConfidenceBadge(level: TaskOutput["confidenceLevel"]) {
  const colors = {
    High: "bg-blue-100 text-blue-800",
    Medium: "bg-gray-100 text-gray-800",
    Low: "bg-orange-100 text-orange-800",
  };

  return (
    <span className={`rounded-full px-2 py-1 text-xs ${colors[level]}`}>
      {level} Confidence
    </span>
  );
}

type RunStatus =
  | "EXECUTING"
  | "QUEUED"
  | "PENDING_VERSION"
  | "DEQUEUED"
  | "WAITING"
  | "DELAYED"
  | "COMPLETED"
  | "FAILED"
  | "CRASHED"
  | "SYSTEM_FAILURE"
  | "CANCELED"
  | "EXPIRED"
  | "TIMED_OUT";

interface TaskPayload {
  companyName: string;
  companyUrl?: string;
}

interface RunInfo {
  id: string;
  status: RunStatus;
  payload: TaskPayload;
  output?: TaskOutput;
}

function CompanyResultCard({ run }: { run: RunInfo }) {
  const output = run.output;

  const isRunning =
    run.status === "EXECUTING" ||
    run.status === "QUEUED" ||
    run.status === "PENDING_VERSION" ||
    run.status === "DEQUEUED" ||
    run.status === "WAITING" ||
    run.status === "DELAYED";
  const isCompleted = run.status === "COMPLETED";
  const isFailed =
    run.status === "FAILED" ||
    run.status === "CRASHED" ||
    run.status === "SYSTEM_FAILURE" ||
    run.status === "CANCELED" ||
    run.status === "EXPIRED" ||
    run.status === "TIMED_OUT";

  // Get company name from output (when completed) or payload (when still running)
  const companyName =
    output?.companyName ?? run.payload?.companyName ?? "Unknown Company";

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-semibold text-gray-900">
            {companyName}
          </h4>

          {/* Loading state */}
          {isRunning && (
            <div className="mt-2 flex items-center gap-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Analyzing...</span>
            </div>
          )}

          {/* Failed state */}
          {isFailed && (
            <div className="mt-2 flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Assessment failed</span>
            </div>
          )}

          {/* Success state */}
          {isCompleted && output && (
            <div className="mt-2 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {getVerdictBadge(output.verdict)}
                {getConfidenceBadge(output.confidenceLevel)}
              </div>
              <p className="text-gray-600 text-sm">{output.summary}</p>
            </div>
          )}
        </div>

        {/* Status icon */}
        <div className="shrink-0">
          {isCompleted && output && getVerdictIcon(output.verdict)}
          {isRunning && (
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          )}
          {isFailed && <XCircle className="h-5 w-5 text-red-600" />}
        </div>
      </div>
    </div>
  );
}

function BatchResultsDisplay({
  batchId,
  publicAccessToken,
  companyNames,
}: {
  batchId: string;
  publicAccessToken: string;
  companyNames: string[];
}) {
  // Subscribe to all runs in the batch using useRealtimeBatch
  // Note: runs will have output typed as TaskOutput from the task
  const { runs, error } = useRealtimeBatch(batchId, {
    accessToken: publicAccessToken,
  });

  const completedCount = runs.filter((r) => r.status === "COMPLETED").length;
  const totalCount = runs.length || companyNames.length;
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  // Map runs to our RunInfo type
  const runInfos: RunInfo[] = runs.map((run) => ({
    id: run.id,
    status: run.status as RunStatus,
    payload: run.payload as TaskPayload,
    output: run.output as TaskOutput | undefined,
  }));

  // If we have runs from the subscription, use those
  // Otherwise, show placeholders for each company name
  const hasRuns = runs.length > 0;

  return (
    <div className="mt-6 space-y-4 border-t pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {error ? (
            <AlertCircle className="h-5 w-5 text-red-600" />
          ) : allCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          )}
          <span className="font-medium text-gray-900">
            {error
              ? "Connection error"
              : allCompleted
                ? "Assessment Complete"
                : `Assessing... (${completedCount}/${totalCount})`}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {hasRuns
          ? // Show actual runs from the batch subscription
            runInfos.map((run) => <CompanyResultCard key={run.id} run={run} />)
          : // Show placeholders while waiting for runs to appear
            companyNames.map((name) => (
              <div
                className="rounded-lg border bg-white p-4 shadow-sm"
                key={name}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-semibold text-gray-900">
                      {name}
                    </h4>
                    <div className="mt-2 flex items-center gap-2 text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Queued...</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}

export function ImpactAssessor() {
  const [companies, setCompanies] = useState("");
  const [assessmentResult, setAssessmentResult] =
    useState<AssessmentResult | null>(null);

  const trpcClient = useTRPCClient();

  const assessMutation = useMutation({
    mutationFn: async (input: { companies: string }) => {
      return await trpcClient.impact.assessImpactBatch.mutate(input);
    },
    onSuccess: (data) => {
      setAssessmentResult(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companies.trim()) {
      return;
    }
    setAssessmentResult(null);
    assessMutation.mutate({ companies: companies.trim() });
  };

  const companyCount = companies
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c.length > 0).length;

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Shield className="h-6 w-6 text-green-600" />
        <h3 className="font-semibold text-gray-900 text-lg">Impact Assessor</h3>
      </div>
      <p className="mb-4 text-gray-600 text-sm">
        Enter company names (comma-separated) to assess their social and
        environmental impact using AI.
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            className="mb-1 block font-medium text-gray-700 text-sm"
            htmlFor="companies"
          >
            Company Names
          </label>
          <Textarea
            id="companies"
            onChange={(e) => setCompanies(e.target.value)}
            placeholder="Patagonia, Tesla, Shell, Ben & Jerry's"
            rows={3}
            value={companies}
          />
          {companyCount > 0 && (
            <p className="mt-1 text-gray-500 text-xs">
              {companyCount} {companyCount === 1 ? "company" : "companies"} to
              assess {companyCount > 10 && "(max 10)"}
            </p>
          )}
        </div>

        <Button
          className="w-full"
          disabled={
            assessMutation.isPending ||
            !companies.trim() ||
            companyCount === 0 ||
            companyCount > 10
          }
          type="submit"
        >
          {assessMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting Assessment...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              Assess Impact
            </>
          )}
        </Button>
      </form>

      {assessMutation.isError && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-red-700 text-sm">
          {assessMutation.error?.message ||
            "Failed to start assessment. Please try again."}
        </div>
      )}

      {/* Results - render BatchResultsDisplay when we have a batch */}
      {assessmentResult && (
        <BatchResultsDisplay
          batchId={assessmentResult.batchId}
          companyNames={assessmentResult.companyNames}
          publicAccessToken={assessmentResult.publicAccessToken}
        />
      )}
    </div>
  );
}
