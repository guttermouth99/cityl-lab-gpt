"use client";

import { Button } from "@baito/ui/components/button";
import { Input } from "@baito/ui/components/input";
import { Textarea } from "@baito/ui/components/textarea";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useTRPCClient } from "@/lib/trpc/client";

interface JobAnalysis {
  title: string;
  category: "tech" | "healthcare" | "education" | "finance" | "other";
  experienceLevel: "entry" | "mid" | "senior" | "executive";
  skills: string[];
  salary: {
    min: number | null;
    max: number | null;
    currency: string;
  };
  isRemote: boolean;
  benefits: string[];
  relevantSDGs: number[];
}

function formatSalary(salary: JobAnalysis["salary"]): string {
  if (salary.min && salary.max) {
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  }
  if (salary.min) {
    return `${salary.currency} ${salary.min.toLocaleString()}+`;
  }
  return `Up to ${salary.currency} ${salary.max?.toLocaleString()}`;
}

export function JobAnalyzer() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<JobAnalysis | null>(null);

  const trpcClient = useTRPCClient();

  const analyzeMutation = useMutation({
    mutationFn: async (input: { title: string; description: string }) => {
      return await trpcClient.llm.analyzeJob.mutate(input);
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!(title.trim() && description.trim())) {
      return;
    }
    analyzeMutation.mutate({ title, description });
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-gray-900 text-lg">
        Analyze Job Posting
      </h3>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            className="mb-1 block font-medium text-gray-700 text-sm"
            htmlFor="job-title"
          >
            Job Title
          </label>
          <Input
            id="job-title"
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Senior Software Engineer"
            value={title}
          />
        </div>

        <div>
          <label
            className="mb-1 block font-medium text-gray-700 text-sm"
            htmlFor="job-description"
          >
            Job Description
          </label>
          <Textarea
            className="min-h-32"
            id="job-description"
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Paste the job description here..."
            value={description}
          />
        </div>

        <Button
          className="w-full"
          disabled={
            analyzeMutation.isPending || !title.trim() || !description.trim()
          }
          type="submit"
        >
          {analyzeMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Job"
          )}
        </Button>
      </form>

      {analyzeMutation.isError && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-red-700 text-sm">
          Failed to analyze job posting. Please try again.
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-3 border-t pt-4">
          <h4 className="font-medium text-gray-900">Analysis Results</h4>

          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium capitalize">{result.category}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Experience Level:</span>
              <span className="font-medium capitalize">
                {result.experienceLevel}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Remote:</span>
              <span className="font-medium">
                {result.isRemote ? "Yes" : "No"}
              </span>
            </div>

            {(result.salary.min || result.salary.max) && (
              <div className="flex justify-between">
                <span className="text-gray-600">Salary:</span>
                <span className="font-medium">
                  {formatSalary(result.salary)}
                </span>
              </div>
            )}

            {result.skills.length > 0 && (
              <div>
                <span className="text-gray-600">Skills:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {result.skills.map((skill) => (
                    <span
                      className="rounded bg-gray-100 px-2 py-0.5 text-gray-700 text-xs"
                      key={skill}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.benefits.length > 0 && (
              <div>
                <span className="text-gray-600">Benefits:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {result.benefits.map((benefit) => (
                    <span
                      className="rounded bg-green-100 px-2 py-0.5 text-green-700 text-xs"
                      key={benefit}
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.relevantSDGs.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">UN SDGs:</span>
                <span className="font-medium">
                  {result.relevantSDGs.map((sdg) => `#${sdg}`).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
