"use client";

import { useEffect, useState } from "react";
import { streamToState } from "@/lib/stream";
import { StreamingResponse } from "../StreamingResponse";

interface Props {
  initialClause: string;
  ourParty: string;
  jurisdiction: string;
}

export function NegotiateTab({
  initialClause,
  ourParty,
  jurisdiction,
}: Props) {
  const [clause, setClause] = useState(initialClause);
  useEffect(() => {
    if (initialClause.trim()) setClause(initialClause);
  }, [initialClause]);
  const [theirParty, setTheirParty] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!clause.trim()) return;
    setLoading(true);
    setError(null);
    setOut("");
    await streamToState(
      "/api/ai/negotiate",
      {
        clauseText: clause,
        ourParty,
        theirParty: theirParty || "Counterparty",
        jurisdiction,
      },
      (t) => setOut((s) => s + t),
      () => setLoading(false),
      (e) => {
        setLoading(false);
        setError(e.message);
      },
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
      <textarea
        value={clause}
        onChange={(e) => setClause(e.target.value)}
        placeholder="Paste a clause to analyze…"
        rows={5}
        className="w-full resize-y rounded border border-[var(--border-mid)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-hint)] focus:border-[var(--gold)] focus:outline-none"
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-xs text-[var(--text-secondary)]">
          Our party
          <input
            readOnly
            value={ourParty}
            className="mt-1 w-full rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2 py-1 text-sm text-[var(--text-primary)]"
          />
        </label>
        <label className="text-xs text-[var(--text-secondary)]">
          Their party
          <input
            value={theirParty}
            onChange={(e) => setTheirParty(e.target.value)}
            placeholder="e.g. Vendor"
            className="mt-1 w-full rounded border border-[var(--border-mid)] bg-[var(--bg-base)] px-2 py-1 text-sm text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={() => void run()}
        disabled={loading}
        className="rounded-md bg-[var(--gold)] px-3 py-2 text-sm font-medium text-[var(--bg-base)] hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Generating…" : "Get negotiation playbook"}
      </button>
      {error && (
        <p className="text-sm text-[var(--risk-high)]">{error}</p>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto rounded border border-[var(--border-subtle)] bg-[var(--bg-base)] p-2">
        <StreamingResponse
          content={out}
          isStreaming={loading}
          emptyState={
            <p className="p-2 text-sm text-[var(--text-hint)]">
              Playbook will stream here.
            </p>
          }
        />
      </div>
    </div>
  );
}
