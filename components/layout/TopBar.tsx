"use client";

import type { Document } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  doc: Document;
  onTitleChange: (title: string) => void;
  onStatusCycle: () => void;
  onSave: () => void;
  onAnalyze: () => void;
  saving?: boolean;
}

export function TopBar({
  doc,
  onTitleChange,
  onStatusCycle,
  onSave,
  onAnalyze,
  saving,
}: Props) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4">
      <input
        value={doc.title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="min-w-0 flex-1 border-0 bg-transparent font-display text-lg text-[var(--text-primary)] outline-none placeholder:text-[var(--text-hint)] focus:ring-0"
        placeholder="Untitled agreement"
      />
      <button
        type="button"
        onClick={onStatusCycle}
        className={cn(
          "shrink-0 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide",
          doc.status === "final"
            ? "border-[var(--risk-low)] text-[var(--risk-low)]"
            : doc.status === "review"
              ? "border-[var(--risk-med)] text-[var(--risk-med)]"
              : "border-[var(--border-mid)] text-[var(--text-secondary)]",
        )}
      >
        {doc.status}
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="shrink-0 rounded border border-[var(--border-mid)] px-3 py-1.5 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
      <button
        type="button"
        onClick={onAnalyze}
        className="shrink-0 rounded bg-[var(--gold)] px-3 py-1.5 text-xs font-medium text-[var(--bg-base)] hover:opacity-90"
      >
        Analyze
      </button>
    </header>
  );
}
