"use client";

import { diffWords } from "diff";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  oldText: string;
  newText: string;
  title?: string;
}

export function DiffModal({
  open,
  onClose,
  oldText,
  newText,
  title = "Compare versions",
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const parts = diffWords(oldText, newText);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diff-modal-title"
    >
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-lg border border-[var(--border-mid)] bg-[var(--bg-elevated)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
          <h2
            id="diff-modal-title"
            className="font-display text-lg text-[var(--gold-text)]"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
          >
            Close
          </button>
        </div>
        <div className="overflow-y-auto p-4 font-mono text-xs leading-relaxed text-[var(--text-primary)]">
          {parts.map((part, i) => {
            if (part.added) {
              return (
                <span
                  key={i}
                  className="rounded-sm bg-[var(--track-ins-bg)] text-[var(--track-ins)]"
                >
                  {part.value}
                </span>
              );
            }
            if (part.removed) {
              return (
                <span
                  key={i}
                  className="rounded-sm bg-[var(--track-del-bg)] text-[var(--track-del)] line-through"
                >
                  {part.value}
                </span>
              );
            }
            return <span key={i}>{part.value}</span>;
          })}
        </div>
      </div>
    </div>
  );
}
