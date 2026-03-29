"use client";

import { useState } from "react";
import { streamToState } from "@/lib/stream";
import { StreamingResponse } from "../StreamingResponse";

interface Props {
  documentText: string;
  jurisdiction: string;
}

export function DeposeTab({ documentText, jurisdiction }: Props) {
  const [scenario, setScenario] = useState("");
  const [ourPosition, setOurPosition] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!documentText.trim()) {
      setError("Document is empty.");
      return;
    }
    setLoading(true);
    setError(null);
    setOut("");
    await streamToState(
      "/api/ai/depose",
      {
        documentText,
        disputeScenario: scenario || "Contract dispute under the agreement.",
        ourPosition: ourPosition || "Our client acted in good faith.",
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
        value={scenario}
        onChange={(e) => setScenario(e.target.value)}
        placeholder="Describe the dispute scenario…"
        rows={4}
        className="w-full resize-y rounded border border-[var(--border-mid)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-hint)] focus:border-[var(--gold)] focus:outline-none"
      />
      <label className="text-xs text-[var(--text-secondary)]">
        Our position
        <input
          value={ourPosition}
          onChange={(e) => setOurPosition(e.target.value)}
          placeholder="e.g. We performed; they breached first"
          className="mt-1 w-full rounded border border-[var(--border-mid)] bg-[var(--bg-base)] px-2 py-1 text-sm text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none"
        />
      </label>
      <button
        type="button"
        onClick={() => void run()}
        disabled={loading}
        className="rounded-md bg-[var(--gold)] px-3 py-2 text-sm font-medium text-[var(--bg-base)] hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Generating…" : "Generate deposition questions"}
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
              Questions stream here.
            </p>
          }
        />
      </div>
    </div>
  );
}
