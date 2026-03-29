"use client";

import { useMemo } from "react";
import type { ClauseAnalysis } from "@/types";
import type { Editor } from "@tiptap/react";
import { findTextRangeInEditor } from "@/lib/editor-pos";

function riskBg(r: ClauseAnalysis["risk"]): string {
  switch (r) {
    case "high":
      return "var(--risk-high)";
    case "medium":
      return "var(--risk-med)";
    case "low":
      return "var(--risk-low)";
    default:
      return "var(--risk-info)";
  }
}

function sortByExcerptPosition(
  clauses: ClauseAnalysis[],
  contentText: string,
): ClauseAnalysis[] {
  return [...clauses].sort((a, b) => {
    const ai = contentText.indexOf(a.excerpt.slice(0, 40));
    const bi = contentText.indexOf(b.excerpt.slice(0, 40));
    return (ai === -1 ? 999999 : ai) - (bi === -1 ? 999999 : bi);
  });
}

interface Props {
  clauses: ClauseAnalysis[];
  contentText: string;
  editor: Editor | null;
}

export function RiskHeatmap({ clauses, contentText, editor }: Props) {
  const ordered = useMemo(
    () => sortByExcerptPosition(clauses, contentText),
    [clauses, contentText],
  );

  const total = useMemo(
    () => ordered.reduce((s, c) => s + Math.max(c.excerpt.length, 1), 0),
    [ordered],
  );

  if (!ordered.length || total === 0) return null;

  const handleClick = (c: ClauseAnalysis) => {
    if (!editor) return;
    const range = findTextRangeInEditor(editor, c.excerpt);
    if (!range) return;
    editor
      .chain()
      .focus()
      .setTextSelection({ from: range.from, to: range.to })
      .scrollIntoView()
      .run();
  };

  return (
    <div
      className="pointer-events-auto absolute right-0 top-0 z-10 flex h-full w-2 flex-col overflow-hidden rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)]/80"
      aria-hidden
    >
      {ordered.map((c) => {
        const pct = (Math.max(c.excerpt.length, 1) / total) * 100;
        return (
          <button
            key={c.id}
            type="button"
            title={c.title}
            className="w-full min-h-[4px] shrink-0 border-0 p-0 opacity-70 transition-opacity hover:opacity-100"
            style={{
              height: `${pct}%`,
              background: riskBg(c.risk),
            }}
            onClick={() => handleClick(c)}
          />
        );
      })}
    </div>
  );
}
