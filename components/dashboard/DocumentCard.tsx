"use client";

import type { Document } from "@/types";
import { docTypeLabel } from "@/lib/doc-meta";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Props {
  doc: Document;
  onDelete: (id: string) => void;
}

function riskDot(r?: Document["overallRisk"]) {
  if (!r) return "bg-[var(--text-hint)]";
  if (r === "high") return "bg-[var(--risk-high)]";
  if (r === "medium") return "bg-[var(--risk-med)]";
  return "bg-[var(--risk-low)]";
}

export function DocumentCard({ doc, onDelete }: Props) {
  const updated = new Date(doc.updatedAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="group relative rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 transition hover:border-[var(--border-mid)]">
      <Link href={`/documents/${doc.id}`} className="block">
        <div className="flex items-start gap-2">
          <span
            className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", riskDot(doc.overallRisk))}
            title={doc.overallRisk ?? "Not analyzed"}
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg text-[var(--text-primary)] group-hover:text-[var(--gold-text)]">
              {doc.title || "Untitled"}
            </h3>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {docTypeLabel(doc.docType)} · {doc.jurisdiction}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded border border-[var(--border-mid)] px-2 py-0.5 text-[10px] uppercase text-[var(--text-hint)]">
                {doc.status}
              </span>
              <span className="text-[10px] text-[var(--text-hint)]">
                {updated}
              </span>
            </div>
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (confirm("Delete this document?")) onDelete(doc.id);
        }}
        className="absolute right-2 top-2 rounded px-2 py-1 text-[10px] text-[var(--text-hint)] opacity-0 transition hover:bg-[var(--bg-hover)] hover:text-[var(--risk-high)] group-hover:opacity-100"
      >
        Delete
      </button>
    </div>
  );
}
