"use client";

import { useState } from "react";
import { streamToState } from "@/lib/stream";
import { StreamingResponse } from "../StreamingResponse";
import type { DocType } from "@/types";
import { DOC_TYPE_OPTIONS, docTypeLabel } from "@/lib/doc-meta";
import { plainTextToDoc } from "@/lib/draft-text";
import type { Editor } from "@tiptap/react";

interface Props {
  editor: Editor | null;
  docType: DocType;
  jurisdiction: string;
  ourParty: string;
  onMetaChange: (p: {
    docType: DocType;
    jurisdiction: string;
    ourParty: string;
  }) => void;
}

export function DraftTab({
  editor,
  docType,
  jurisdiction,
  ourParty,
  onMetaChange,
}: Props) {
  const [prompt, setPrompt] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setPreview("");
    let acc = "";
    await streamToState(
      "/api/ai/draft",
      {
        prompt,
        docType: docTypeLabel(docType),
        jurisdiction,
        ourParty,
      },
      (t) => {
        acc += t;
        setPreview(acc);
        const docJson = plainTextToDoc(acc);
        editor?.commands.setContent(docJson);
      },
      () => setLoading(false),
      (e) => {
        setLoading(false);
        setError(e.message);
      },
    );
  };

  const progress = loading
    ? Math.min(100, Math.round((preview.length / Math.max(prompt.length * 8, 400)) * 100))
    : 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the agreement you need…"
        rows={4}
        className="w-full resize-y rounded border border-[var(--border-mid)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-hint)] focus:border-[var(--gold)] focus:outline-none"
      />
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="text-xs text-[var(--text-secondary)]">
          Type
          <select
            value={docType}
            onChange={(e) =>
              onMetaChange({
                docType: e.target.value as DocType,
                jurisdiction,
                ourParty,
              })
            }
            className="mt-1 w-full rounded border border-[var(--border-mid)] bg-[var(--bg-base)] px-2 py-1 text-sm text-[var(--text-primary)]"
          >
            {DOC_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-[var(--text-secondary)]">
          Jurisdiction
          <input
            value={jurisdiction}
            onChange={(e) =>
              onMetaChange({
                docType,
                jurisdiction: e.target.value,
                ourParty,
              })
            }
            className="mt-1 w-full rounded border border-[var(--border-mid)] bg-[var(--bg-base)] px-2 py-1 text-sm text-[var(--text-primary)]"
          />
        </label>
        <label className="text-xs text-[var(--text-secondary)]">
          We represent
          <input
            value={ourParty}
            onChange={(e) =>
              onMetaChange({
                docType,
                jurisdiction,
                ourParty: e.target.value,
              })
            }
            className="mt-1 w-full rounded border border-[var(--border-mid)] bg-[var(--bg-base)] px-2 py-1 text-sm text-[var(--text-primary)]"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={() => void run()}
        disabled={loading}
        className="rounded-md bg-[var(--gold)] px-3 py-2 text-sm font-medium text-[var(--bg-base)] hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Drafting…" : "Draft contract"}
      </button>
      {loading && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-hover)]">
          <div
            className="h-full bg-[var(--gold)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {error && (
        <p className="text-sm text-[var(--risk-high)]">{error}</p>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto rounded border border-[var(--border-subtle)] bg-[var(--bg-base)] p-2">
        <StreamingResponse
          content={preview}
          isStreaming={loading}
          emptyState={
            <p className="p-2 text-sm text-[var(--text-hint)]">
              Draft preview streams here and into the editor.
            </p>
          }
        />
      </div>
    </div>
  );
}
