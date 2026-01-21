"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { ChatGreeting } from "./chat-greeting";
import { ChatInput } from "./chat-input";
import { ChatMessages } from "./chat-messages";

export function ChatInterface() {
  const { messages, error, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const [input, setInput] = useState("");
  const isBusy = status !== "ready";
  const hasMessages = messages.length > 0;

  const handleSendMessage = () => {
    const trimmedInput = input.trim();
    if (!(trimmedInput && sendMessage)) {
      return;
    }
    sendMessage({ text: trimmedInput });
    setInput("");
  };

  const handleSelectSuggestion = (prompt: string) => {
    if (!sendMessage) {
      return;
    }
    sendMessage({ text: prompt });
  };

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      {/* Error Banner */}
      {error && (
        <div className="mx-auto w-full max-w-3xl px-4 pt-4">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive text-sm">
            {error.message ||
              "Ein Fehler ist aufgetreten. Bitte versuche es erneut."}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {hasMessages ? (
        <ChatMessages isLoading={isBusy} messages={messages} />
      ) : (
        <ChatGreeting
          disabled={isBusy}
          onSelectSuggestion={handleSelectSuggestion}
        />
      )}

      {/* Input Area */}
      <ChatInput
        disabled={isBusy}
        onChange={setInput}
        onSubmit={handleSendMessage}
        placeholder="Frag mich etwas über CityLAB Berlin..."
        value={input}
      />
    </div>
  );
}
