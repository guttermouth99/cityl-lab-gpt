"use client";

import { Button } from "@baito/ui/components/button";
import { Input } from "@baito/ui/components/input";
import { useMutation } from "@tanstack/react-query";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTRPCClient } from "@/lib/trpc/client";

interface RunData {
  runId: string;
  token: string;
}

export default function HelloWorldPage() {
  const [message, setMessage] = useState("");
  const [runData, setRunData] = useState<RunData | null>(null);
  const trpc = useTRPCClient();

  const triggerMutation = useMutation({
    mutationFn: (input: { message: string }) =>
      trpc.hello.trigger.mutate(input),
    onSuccess: (data) => setRunData(data),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      return;
    }
    setRunData(null);
    triggerMutation.mutate({ message: message.trim() });
  };

  return (
    <div className="container mx-auto max-w-2xl p-8">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="mb-8 text-center">
        <h1 className="mb-2 font-bold text-3xl">Hello World Boilerplate</h1>
        <p className="text-muted-foreground">
          Enter a message to trigger a background task with Mastra AI.
        </p>
      </div>

      <form className="mb-6 flex gap-2" onSubmit={handleSubmit}>
        <Input
          className="flex-1"
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter a message..."
          value={message}
        />
        <Button
          disabled={triggerMutation.isPending || !message.trim()}
          type="submit"
        >
          {triggerMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Trigger Task"
          )}
        </Button>
      </form>

      {triggerMutation.isError && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
          {triggerMutation.error?.message || "Failed to trigger task"}
        </div>
      )}

      {runData && (
        <RealtimeResult accessToken={runData.token} runId={runData.runId} />
      )}
    </div>
  );
}

interface TaskOutput {
  response: string;
}

function RealtimeResult({
  runId,
  accessToken,
}: {
  runId: string;
  accessToken: string;
}) {
  const { run } = useRealtimeRun(runId, {
    accessToken,
  });

  const output = run?.output as TaskOutput | undefined;

  const isRunning = run?.status === "EXECUTING" || run?.status === "QUEUED";
  const isCompleted = run?.status === "COMPLETED";
  const isFailed = run?.status === "FAILED" || run?.status === "CRASHED";

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      {isRunning && (
        <div className="flex items-center gap-2 text-primary">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Processing with Mastra AI...</span>
        </div>
      )}

      {isFailed && (
        <div className="text-destructive">
          Something went wrong. Please try again.
        </div>
      )}

      {isCompleted && output && (
        <div className="flex items-start gap-3">
          <Sparkles className="mt-1 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-medium text-foreground">Response</p>
            <p className="mt-1 text-muted-foreground">{output.response}</p>
          </div>
        </div>
      )}
    </div>
  );
}
