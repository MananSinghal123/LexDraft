"use client";

import { useState } from "react";
import type { AIAnalysis, DocType } from "@/types";
import type { Editor } from "@tiptap/react";
import { AnalysisTab } from "./tabs/AnalysisTab";
import { NegotiateTab } from "./tabs/NegotiateTab";
import { DraftTab } from "./tabs/DraftTab";
import { OpposeTab } from "./tabs/OpposeTab";
import { DeposeTab } from "./tabs/DeposeTab";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "analysis", label: "Analysis" },
  { id: "negotiate", label: "Negotiate" },
  { id: "draft", label: "Draft" },
  { id: "oppose", label: "Oppose" },
  { id: "depose", label: "Depose" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Props {
  contentText: string;
  selectionText: string;
  docType: DocType;
  jurisdiction: string;
  ourParty: string;
  editor: Editor | null;
  analysis: AIAnalysis | null;
  analyzing: boolean;
  cacheHit: boolean;
  onAnalyze: () => void;
  onDocMetaChange: (p: {
    docType: DocType;
    jurisdiction: string;
    ourParty: string;
  }) => void;
}

export function AIPanel({
  contentText,
  selectionText,
  docType,
  jurisdiction,
  ourParty,
  editor,
  analysis,
  analyzing,
  cacheHit,
  onAnalyze,
  onDocMetaChange,
}: Props) {
  const [tab, setTab] = useState<TabId>("analysis");

  return (
    <div className="flex h-full min-h-0 w-[380px] shrink-0 flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="flex shrink-0 flex-wrap gap-0.5 border-b border-[var(--border-subtle)] p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide",
              tab === t.id
                ? "bg-[var(--gold-subtle)] text-[var(--gold-text)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === "analysis" && (
          <AnalysisTab
            analysis={analysis}
            loading={analyzing}
            contentText={contentText}
            jurisdiction={jurisdiction}
            ourParty={ourParty}
            editor={editor}
            onAnalyze={onAnalyze}
            cacheHit={cacheHit}
          />
        )}
        {tab === "negotiate" && (
          <NegotiateTab
            initialClause={selectionText || ""}
            ourParty={ourParty}
            jurisdiction={jurisdiction}
          />
        )}
        {tab === "draft" && (
          <DraftTab
            editor={editor}
            docType={docType}
            jurisdiction={jurisdiction}
            ourParty={ourParty}
            onMetaChange={onDocMetaChange}
          />
        )}
        {tab === "oppose" && (
          <OpposeTab documentText={contentText} jurisdiction={jurisdiction} />
        )}
        {tab === "depose" && (
          <DeposeTab documentText={contentText} jurisdiction={jurisdiction} />
        )}
      </div>
    </div>
  );
}
