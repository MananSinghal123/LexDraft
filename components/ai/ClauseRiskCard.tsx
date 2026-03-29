"use client";

import { useState } from "react";
import { streamToState } from "@/lib/stream";
import type { ClauseAnalysis } from "@/types";
import type { Editor } from "@tiptap/react";
import { findTextRangeInEditor } from "@/lib/editor-pos";
import { cn } from "@/lib/utils";

function riskStyle(risk: ClauseAnalysis["risk"]) {
  switch (risk) {
    case "high":
      return {
        border: "var(--risk-high)",
        badgeBg: "var(--risk-high-bg)",
        badgeFg: "var(--risk-high)",
        bar: "var(--risk-high)",
      };
    case "medium":
      return {
        border: "var(--risk-med)",
        badgeBg: "var(--risk-med-bg)",
        badgeFg: "var(--risk-med)",
        bar: "var(--risk-med)",
      };
    case "low":
      return {
        border: "var(--risk-low)",
        badgeBg: "var(--risk-low-bg)",
        badgeFg: "var(--risk-low)",
        bar: "var(--risk-low)",
      };
    default:
      return {
        border: "var(--risk-info)",
        badgeBg: "var(--risk-info-bg)",
        badgeFg: "var(--risk-info)",
        bar: "var(--risk-info)",
      };
  }
}

interface Props {
  clause: ClauseAnalysis;
  editor: Editor | null;
  jurisdiction: string;
  ourParty: string;
  contentText: string;
}

export function ClauseRiskCard({
  clause,
  editor,
  jurisdiction,
  ourParty,
  contentText,
}: Props) {
  const [open, setOpen] = useState(false);
  const [redlining, setRedlining] = useState(false);
  const s = riskStyle(clause.risk);

  const jump = () => {
    if (!editor) return;
    const range = findTextRangeInEditor(editor, clause.excerpt);
    if (!range) return;
    editor
      .chain()
      .focus()
      .setTextSelection({ from: range.from, to: range.to })
      .scrollIntoView()
      .run();
  };

  const applyRedline = async () => {
    if (!editor) return;
    const idx = contentText.indexOf(clause.excerpt.slice(0, 40));
    const clauseText =
      idx >= 0
        ? contentText.slice(idx, idx + Math.max(clause.excerpt.length, 120))
        : clause.excerpt;
    setRedlining(true);
    let result = "";
    await streamToState(
      "/api/ai/redline",
      { clauseText, ourParty, jurisdiction },
      (t) => {
        result += t;
      },
      () => {
        setRedlining(false);
        const range = findTextRangeInEditor(editor, clause.excerpt);
        if (!range) return;
        editor
          .chain()
          .focus()
          .deleteRange({ from: range.from, to: range.to })
          .insertContent({
            type: "text",
            text: result.trim(),
            marks: [{ type: "insertion" }],
          })
          .run();
      },
      () => {
        setRedlining(false);
      },
    );
  };

  const favoredLabel =
    clause.favoredParty === "us"
      ? "Favors: us"
      : clause.favoredParty === "them"
        ? "Favors: them"
        : "Neutral";

  const favoredClass =
    clause.favoredParty === "us"
      ? "bg-emerald-950/80 text-emerald-300"
      : clause.favoredParty === "them"
        ? "bg-red-950/80 text-red-300"
        : "bg-zinc-800 text-zinc-400";

  return (
    <div
      className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3"
      style={{ borderLeftWidth: 3, borderLeftColor: s.border }}
    >
      <button
        type="button"
        className="flex w-full items-start gap-2 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span
          className={cn(
            "mt-0.5 inline-block transition-transform duration-200",
            open ? "rotate-90" : "",
          )}
        >
          ▸
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {clause.title}
            </span>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
              style={{ background: s.badgeBg, color: s.badgeFg }}
            >
              {clause.risk}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-[var(--text-secondary)]">
            {clause.excerpt}
          </p>
          <div
            className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[var(--bg-base)]"
            title={`${clause.confidence}% confidence`}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, Math.max(0, clause.confidence))}%`,
                background: s.bar,
              }}
            />
          </div>
        </div>
      </button>
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            jump();
          }}
          className="text-xs text-[var(--gold-text)] hover:underline"
        >
          Jump
        </button>
      </div>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-2 pt-2 text-sm">
            <p>
              <span className="text-[var(--text-secondary)]">Issue: </span>
              <span className="text-[var(--text-primary)]">{clause.issue}</span>
            </p>
            <p>
              <span className="text-[var(--text-secondary)]">
                Suggested fix:{" "}
              </span>
              <span className="text-[var(--gold-text)]">{clause.fix}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn("rounded px-2 py-0.5 text-[10px]", favoredClass)}
              >
                {favoredLabel}
              </span>
              <button
                type="button"
                disabled={redlining || !editor}
                onClick={(e) => {
                  e.stopPropagation();
                  void applyRedline();
                }}
                className="rounded border border-[var(--border-mid)] bg-[var(--bg-hover)] px-2 py-1 text-xs text-[var(--text-primary)] hover:border-[var(--gold)] disabled:opacity-50"
              >
                {redlining ? "Applying…" : "Apply as Redline"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
