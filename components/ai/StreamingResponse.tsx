"use client";

import ReactMarkdown from "react-markdown";
import { useEffect, useRef } from "react";

interface Props {
  content: string;
  isStreaming: boolean;
  emptyState?: React.ReactNode;
  asMemo?: boolean;
}

export function StreamingResponse({
  content,
  isStreaming,
  emptyState,
  asMemo,
}: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [content, isStreaming]);

  if (!content && !isStreaming) return <>{emptyState ?? null}</>;

  return (
    <div className={`streaming-response ${asMemo ? "memo-style" : ""}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
      {isStreaming && (
        <span className="cursor-blink" aria-hidden>
          ▋
        </span>
      )}
      <div ref={endRef} />
    </div>
  );
}
