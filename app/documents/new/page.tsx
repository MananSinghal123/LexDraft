"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import mammoth from "mammoth";
import type { Document, DocType } from "@/types";
import { saveDocument } from "@/lib/storage";
import { DOC_TYPE_OPTIONS, JURISDICTION_OPTIONS } from "@/lib/doc-meta";

export default function NewDocumentPage() {
  const router = useRouter();
  const [title, setTitle] = useState("Untitled Agreement");
  const [docType, setDocType] = useState<DocType>("general");
  const [jurisdiction, setJurisdiction] = useState("India");
  const [ourParty, setOurParty] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [busy, setBusy] = useState(false);

  const baseDoc = (): Document => ({
    id: crypto.randomUUID(),
    title,
    contentText: "",
    content: {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    docType,
    jurisdiction,
    ourParty,
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const goBlank = () => {
    const doc = baseDoc();
    saveDocument(doc);
    router.push(`/documents/${doc.id}`);
  };

  const goAiDraft = () => {
    if (!aiPrompt.trim()) return;
    setBusy(true);
    const doc = baseDoc();
    saveDocument(doc);
    router.push(
      `/documents/${doc.id}?draft=true&prompt=${encodeURIComponent(aiPrompt)}`,
    );
  };

  const onUploadDocx = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const buffer = await file.arrayBuffer();
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buffer });
      const doc = baseDoc();
      saveDocument(doc);
      sessionStorage.setItem(`lexdraft:pendingHtml:${doc.id}`, html);
      router.push(`/documents/${doc.id}`);
    } catch (err) {
      console.error(err);
      alert("Could not read DOCX file.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <header className="flex h-14 items-center justify-between border-b border-[var(--border-subtle)] px-6">
        <Link
          href="/"
          className="font-display text-xl font-medium text-[var(--gold)]"
        >
          LexDraft
        </Link>
        <Link
          href="/"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          Dashboard
        </Link>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display text-2xl text-[var(--text-primary)]">
          New document
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Choose how to start, then set metadata for AI and analysis.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={() => !busy && goBlank()}
            disabled={busy}
            className="flex flex-col rounded-lg border border-[var(--border-mid)] bg-[var(--bg-elevated)] p-6 text-left transition hover:border-[var(--gold)] disabled:opacity-50"
          >
            <span className="font-display text-lg text-[var(--gold-text)]">
              Blank
            </span>
            <span className="mt-2 text-sm text-[var(--text-secondary)]">
              Empty agreement. Start typing or use AI from the editor.
            </span>
          </button>
          <label className="flex cursor-pointer flex-col rounded-lg border border-[var(--border-mid)] bg-[var(--bg-elevated)] p-6 text-left transition hover:border-[var(--gold)]">
            <span className="font-display text-lg text-[var(--gold-text)]">
              Upload DOCX
            </span>
            <span className="mt-2 text-sm text-[var(--text-secondary)]">
              Convert Word to HTML in the browser — no server upload.
            </span>
            <input
              type="file"
              accept=".doc,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              onChange={(e) => void onUploadDocx(e)}
              disabled={busy}
            />
          </label>
          <div className="rounded-lg border border-[var(--border-mid)] bg-[var(--bg-elevated)] p-6">
            <span className="font-display text-lg text-[var(--gold-text)]">
              AI draft
            </span>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Mutual NDA for a software vendor in India, favoring the disclosing party…"
              rows={4}
              className="mt-2 w-full resize-none rounded border border-[var(--border-subtle)] bg-[var(--bg-base)] px-2 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-hint)]"
            />
            <button
              type="button"
              onClick={() => !busy && goAiDraft()}
              disabled={busy || !aiPrompt.trim()}
              className="mt-2 w-full rounded bg-[var(--gold)] py-2 text-sm font-medium text-[var(--bg-base)] hover:opacity-90 disabled:opacity-50"
            >
              Draft with AI
            </button>
          </div>
        </div>

        <div className="mt-10 space-y-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--text-hint)]">
            Document metadata
          </h2>
          <label className="block text-xs text-[var(--text-secondary)]">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded border border-[var(--border-mid)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs text-[var(--text-secondary)]">
              Document type
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocType)}
                className="mt-1 w-full rounded border border-[var(--border-mid)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)]"
              >
                {DOC_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-[var(--text-secondary)]">
              Jurisdiction
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="mt-1 w-full rounded border border-[var(--border-mid)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)]"
              >
                {JURISDICTION_OPTIONS.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-xs text-[var(--text-secondary)]">
            We represent
            <input
              value={ourParty}
              onChange={(e) => setOurParty(e.target.value)}
              placeholder="e.g. Disclosing Party, Buyer, Employer…"
              className="mt-1 w-full rounded border border-[var(--border-mid)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-hint)]"
            />
          </label>
        </div>
      </main>
    </div>
  );
}
