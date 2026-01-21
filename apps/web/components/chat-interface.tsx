"use client";

import { useChat } from "@ai-sdk/react";
import { Button } from "@baito/ui/components/button";
import { Textarea } from "@baito/ui/components/textarea";
import { DefaultChatTransport } from "ai";
import { Bot, Loader2, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ChatInterface() {
  const { messages, error, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const [input, setInput] = useState("");
  const isBusy = status !== "ready";

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function getMessageText(message: (typeof messages)[number]) {
    if ("content" in message && typeof message.content === "string") {
      return message.content;
    }

    if ("parts" in message && Array.isArray(message.parts)) {
      return message.parts
        .map((part) => (part.type === "text" ? part.text : ""))
        .join("");
    }

    return "";
  }

  return (
    <div className="flex h-[600px] flex-col rounded-lg border bg-card">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>
              Ask me anything about CityLAB Berlin, its projects, or
              initiatives.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
                key={message.id}
              >
                {message.role === "assistant" && (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="size-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">
                    {getMessageText(message)}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <User className="size-4" />
                  </div>
                )}
              </div>
            ))}
            {isBusy && (
              <div className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="size-4 text-primary" />
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span className="text-muted-foreground text-sm">
                    Thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mb-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-destructive text-sm">
          {error.message || "An error occurred. Please try again."}
        </div>
      )}

      {/* Input Form */}
      <form
        className="flex gap-2 border-t bg-background p-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!sendMessage) return;
          const trimmedInput = input.trim();
          if (!trimmedInput) return;
          sendMessage({ text: trimmedInput });
          setInput("");
        }}
      >
        <Textarea
          className="min-h-[44px] flex-1 resize-none"
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Ask about CityLAB Berlin..."
          rows={1}
          value={input}
        />
        <Button disabled={isBusy || !input.trim()} size="icon" type="submit">
          {isBusy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
