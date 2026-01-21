"use client";

import { cn } from "@baito/ui/lib/utils";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";

interface ChatMessagesProps {
  messages: UIMessage[];
  isLoading?: boolean;
}

function getMessageText(message: UIMessage): string {
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

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message/loading changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {messages.map((message, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-4",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
            initial={{ opacity: 0, y: 10 }}
            key={message.id}
            transition={{
              duration: 0.3,
              delay: index === messages.length - 1 ? 0.1 : 0,
            }}
          >
            {message.role === "assistant" && (
              <Image
                alt="CityLAB Berlin"
                className="h-8 w-8 shrink-0 rounded-full"
                height={32}
                src="/citylab_berlin_logo_square.jpeg"
                width={32}
              />
            )}

            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {getMessageText(message)}
              </p>
            </div>

            {message.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                <User className="h-4 w-4" />
              </div>
            )}
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
            initial={{ opacity: 0, y: 10 }}
          >
            <Image
              alt="CityLAB Berlin"
              className="h-8 w-8 shrink-0 rounded-full"
              height={32}
              src="/citylab_berlin_logo_square.jpeg"
              width={32}
            />
            <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
              <ThinkingDots />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          className="h-2 w-2 rounded-full bg-muted-foreground/50"
          key={i}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}
