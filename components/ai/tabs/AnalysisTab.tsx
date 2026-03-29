"use client";

import type { AIAnalysis, ClauseAnalysis } from "@/types";
import type { Editor } from "@tiptap/react";
import { ClauseRiskCard } from "../ClauseRiskCard";
import { cn } from "@/lib/utils";

function riskBadgeClass(r: AIAnalysis["overallRisk"]) {
  switch (r) {
    case "high":
      return "bg-[var(--risk-high-bg)] text-[var(--risk-high)]";
    case "medium":
      return "bg-[var(--risk-med-bg)] text-[var(--risk-med)]";
    default:
      return "bg-[var(--risk-low-bg)] text-[var(--risk-low)]";
  }
}

function countRisks(clauses: ClauseAnalysis[]) {
  let h = 0,
    m = 0,
    l = 0;
  for (const c of clauses) {
    if (c.risk === "high") h++;
    else if (c.risk === "medium") m++;
    else if (c.risk === "low") l++;
  }
  return { h, m, l };
}

interface Props {
  analysis: AIAnalysis | null;
  loading: boolean;
  contentText: string;
  jurisdiction: string;
  ourParty: string;
  editor: Editor | null;
  onAnalyze: () => void;
  cacheHit: boolean;
}

export function AnalysisTab({
  analysis,
  loading,
  contentText,
  jurisdiction,
  ourParty,
  editor,
  onAnalyze,
  cacheHit,
}: Props) {
  if (loading) {
    return (
      <div className="space-y-3 p-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-md bg-[var(--bg-hover)]"
          />
        ))}
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="max-w-xs text-sm text-[var(--text-secondary)]">
          Run clause risk analysis on the full document. Results are cached until
          the text changes.
        </p>
        <button
          type="button"
          onClick={onAnalyze}
          className="rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-medium text-[var(--bg-base)] hover:opacity-90"
        >
          Analyze document
        </button>
      </div>
    );
  }

  const { h, m, l } = countRisks(analysis.clauses);

  return (
    <div className="space-y-4 p-3">
      {cacheHit && (
        <p className="text-[10px] uppercase tracking-wide text-[var(--text-hint)]">
          Cached for current text
        </p>
      )}
      <div
        className="rounded-md border-l-4 border-[var(--gold)] bg-[var(--bg-elevated)] p-3"
        style={{ borderLeftColor: "var(--gold)" }}
      >
        <p className="text-sm leading-relaxed text-[var(--text-primary)]">
          {analysis.executiveSummary}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded px-2 py-0.5 text-xs font-medium",
            riskBadgeClass(analysis.overallRisk),
          )}
        >
          {analysis.overallRisk} risk
        </span>
        <span className="text-xs text-[var(--text-secondary)]">
          {h} High · {m} Medium · {l} Low
        </span>
      </div>
      <div className="space-y-2">
        {analysis.clauses.map((c) => (
          <ClauseRiskCard
            key={c.id}
            clause={c}
            editor={editor}
            jurisdiction={jurisdiction}
            ourParty={ourParty}
            contentText={contentText}
          />
        ))}
      </div>
      {analysis.missingClauses?.length > 0 && (
        <div>
          <h3 className="mb-2 font-display text-sm text-[var(--gold-text)]">
            Missing clauses
          </h3>
          <ul className="space-y-2">
            {analysis.missingClauses.map((mc, i) => (
              <li
                key={i}
                className="rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 text-xs"
              >
                <span className="font-medium text-[var(--text-primary)]">
                  {mc.name}
                </span>
                <span
                  className={cn(
                    "ml-2 rounded px-1 text-[10px]",
                    mc.severity === "critical"
                      ? "bg-[var(--risk-high-bg)] text-[var(--risk-high)]"
                      : "bg-[var(--risk-med-bg)] text-[var(--risk-med)]",
                  )}
                >
                  {mc.severity}
                </span>
                <p className="mt-1 text-[var(--text-secondary)]">{mc.reason}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="rounded-md border border-[var(--border-mid)] bg-[var(--bg-surface)] p-3">
        <h3 className="mb-1 font-display text-sm text-[var(--gold-text)]">
          Negotiation leverage
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          {analysis.negotiationLeverage}
        </p>
      </div>
    </div>
  );
}
