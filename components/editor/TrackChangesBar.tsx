"use client";

import type { Editor } from "@tiptap/react";
import { acceptAllInsertions, rejectAllInsertions } from "@/lib/track-changes";

interface Props {
  editor: Editor | null;
}

export function TrackChangesBar({ editor }: Props) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-xs text-[var(--text-secondary)]">
      <span className="font-medium text-[var(--text-primary)]">Track changes</span>
      <button
        type="button"
        className="rounded border border-[var(--border-mid)] px-2 py-1 hover:bg-[var(--bg-hover)]"
        onClick={() => acceptAllInsertions(editor)}
      >
        Accept all
      </button>
      <button
        type="button"
        className="rounded border border-[var(--border-mid)] px-2 py-1 hover:bg-[var(--bg-hover)]"
        onClick={() => rejectAllInsertions(editor)}
      >
        Reject all
      </button>
    </div>
  );
}
