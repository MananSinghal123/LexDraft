"use client";

import { useState } from "react";
import type { AIAnalysis } from "@/types";
import { VersionTimeline } from "@/components/visualizations/VersionTimeline";
import type { VersionSnapshot } from "@/types";

export interface HeadingItem {
  level: number;
  text: string;
  pos: number;
  end: number;
}

interface Props {
  headings: HeadingItem[];
  onHeadingClick: (pos: number, end: number) => void;
  versions: VersionSnapshot[];
  currentVersionNumber: number;
  analysis: AIAnalysis | null;
  onOpenVersions: () => void;
  versionsOpen: boolean;
}

export function Sidebar({
  headings,
  onHeadingClick,
  versions,
  currentVersionNumber,
  analysis,
  onOpenVersions,
  versionsOpen,
}: Props) {
  const [riskOpen, setRiskOpen] = useState(true);

  let high = 0,
    med = 0,
    low = 0;
  if (analysis?.clauses) {
    for (const c of analysis.clauses) {
      if (c.risk === "high") high++;
      else if (c.risk === "medium") med++;
      else if (c.risk === "low") low++;
    }
  }

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="border-b border-[var(--border-subtle)] p-3">
        <h2 className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-hint)]">
          Outline
        </h2>
        <nav className="mt-2 max-h-[28vh] space-y-1 overflow-y-auto">
          {headings.length === 0 && (
            <p className="text-xs text-[var(--text-hint)]">No headings yet</p>
          )}
          {headings.map((h, i) => (
            <button
              key={`${h.pos}-${i}`}
              type="button"
              onClick={() => onHeadingClick(h.pos, h.end)}
              className="block w-full truncate rounded px-1 py-0.5 text-left text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              style={{ paddingLeft: 8 + (h.level - 1) * 8 }}
            >
              {h.text || "(empty)"}
            </button>
          ))}
        </nav>
      </div>
      <div className="border-b border-[var(--border-subtle)] p-3">
        <button
          type="button"
          onClick={onOpenVersions}
          className="text-xs font-medium text-[var(--gold-text)] hover:underline"
        >
          Versions {versionsOpen ? "▾" : "▸"}
        </button>
        {versionsOpen && (
          <div className="mt-2">
            <VersionTimeline
              versions={versions}
              currentVersionNumber={currentVersionNumber}
            />
          </div>
        )}
      </div>
      <div className="p-3">
        <button
          type="button"
          onClick={() => setRiskOpen((o) => !o)}
          className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-hint)]"
        >
          Risk summary {riskOpen ? "▾" : "▸"}
        </button>
        {riskOpen && analysis && (
          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            {high}H · {med}M · {low}L
          </p>
        )}
        {riskOpen && !analysis && (
          <p className="mt-2 text-xs text-[var(--text-hint)]">
            Run analysis to see counts
          </p>
        )}
      </div>
    </aside>
  );
}
