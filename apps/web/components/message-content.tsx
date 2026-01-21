"use client";

import { useMemo } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LinkPreview } from "./link-preview";

interface MessageContentProps {
  content: string;
  showLinkPreviews?: boolean;
}

// Regex to match markdown links: [text](url) and plain URLs
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g;
const URL_REGEX = /https?:\/\/[^\s<>)"']+/g;

function extractUniqueUrls(content: string): string[] {
  const urls = new Set<string>();

  // Extract URLs from markdown links
  const markdownMatches = content.matchAll(MARKDOWN_LINK_REGEX);
  for (const match of markdownMatches) {
    if (match[2]) {
      urls.add(match[2]);
    }
  }

  // Extract plain URLs
  const urlMatches = content.matchAll(URL_REGEX);
  for (const match of urlMatches) {
    urls.add(match[0]);
  }

  return Array.from(urls);
}

// Custom components for react-markdown
const markdownComponents: Components = {
  // Links
  a: ({ href, children }) => (
    <a
      className="text-primary underline underline-offset-2 hover:text-primary/80"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  ),
  // Paragraphs
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  // Strong/Bold
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  // Emphasis/Italic
  em: ({ children }) => <em className="italic">{children}</em>,
  // Unordered lists
  ul: ({ children }) => (
    <ul className="mb-3 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>
  ),
  // Ordered lists
  ol: ({ children }) => (
    <ol className="mb-3 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>
  ),
  // List items
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  // Code blocks
  code: ({ className, children }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="rounded bg-muted-foreground/10 px-1.5 py-0.5 font-mono text-xs">
          {children}
        </code>
      );
    }
    return (
      <code className="block overflow-x-auto rounded-lg bg-muted-foreground/10 p-3 font-mono text-xs">
        {children}
      </code>
    );
  },
  // Pre blocks (code block wrapper)
  pre: ({ children }) => <pre className="mb-3 last:mb-0">{children}</pre>,
  // Blockquotes
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-primary/50 border-l-2 pl-3 italic last:mb-0">
      {children}
    </blockquote>
  ),
  // Headings
  h1: ({ children }) => <h1 className="mb-2 font-bold text-lg">{children}</h1>,
  h2: ({ children }) => (
    <h2 className="mb-2 font-bold text-base">{children}</h2>
  ),
  h3: ({ children }) => <h3 className="mb-2 font-bold text-sm">{children}</h3>,
  // Horizontal rule
  hr: () => <hr className="my-3 border-border" />,
  // Tables (GFM)
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto last:mb-0">
      <table className="min-w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-border border-b">{children}</tr>,
  th: ({ children }) => (
    <th className="px-2 py-1 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => <td className="px-2 py-1">{children}</td>,
};

export function MessageContent({
  content,
  showLinkPreviews = true,
}: MessageContentProps) {
  const uniqueUrls = useMemo(() => extractUniqueUrls(content), [content]);

  return (
    <div className="space-y-0">
      {/* Message Text with Markdown */}
      <div className="prose-sm text-sm leading-relaxed">
        <ReactMarkdown
          components={markdownComponents}
          remarkPlugins={[remarkGfm]}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* Link Previews */}
      {showLinkPreviews && uniqueUrls.length > 0 && (
        <div className="mt-3 space-y-2">
          {uniqueUrls.map((url) => (
            <LinkPreview key={url} url={url} />
          ))}
        </div>
      )}
    </div>
  );
}
