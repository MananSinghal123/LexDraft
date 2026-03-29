"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { JSONContent } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
import type { AIAnalysis, Document } from "@/types";
import {
  getDocument,
  getVersions,
  saveAnalysis,
  saveDocument,
  saveVersion,
  simpleHash,
  getAnalysis,
} from "@/lib/storage";
import { streamToState } from "@/lib/stream";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar, type HeadingItem } from "@/components/layout/Sidebar";
import { Editor as LexEditor } from "@/components/editor/Editor";
import { AIPanel } from "@/components/ai/AIPanel";
import { RiskHeatmap } from "@/components/visualizations/RiskHeatmap";
import { plainTextToDoc } from "@/lib/draft-text";
import { docTypeLabel } from "@/lib/doc-meta";

const emptyDoc: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

function extractHeadings(editor: Editor): HeadingItem[] {
  const out: HeadingItem[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "heading") {
      out.push({
        level: (node.attrs.level as number) ?? 1,
        text: node.textContent,
        pos,
        end: pos + node.nodeSize,
      });
    }
  });
  return out;
}

interface Props {
  documentId: string;
}

export function DocumentWorkspace({ documentId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [doc, setDoc] = useState<Document | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [contentJson, setContentJson] = useState<JSONContent>(emptyDoc);
  const [contentText, setContentText] = useState("");
  const [selectionText, setSelectionText] = useState("");
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const draftStarted = useRef(false);
  const latest = useRef({
    doc: null as Document | null,
    contentJson: emptyDoc as JSONContent,
    contentText: "",
  });

  useEffect(() => {
    latest.current = { doc, contentJson, contentText };
  }, [doc, contentJson, contentText]);

  useEffect(() => {
    const d = getDocument(documentId);
    if (!d) {
      router.replace("/");
      return;
    }
    setDoc(d);
    setContentJson((d.content as JSONContent) ?? emptyDoc);
    setContentText(d.contentText ?? "");
    const h = simpleHash(d.contentText ?? "");
    const cached = getAnalysis(d.id);
    if (cached && cached.contentHash === h) setAnalysis(cached);
    else setAnalysis(null);
  }, [documentId, router]);

  useEffect(() => {
    if (!editor) return;
    const syncSel = () => {
      const sel = editor.state.selection;
      if (sel.empty) setSelectionText("");
      else
        setSelectionText(editor.state.doc.textBetween(sel.from, sel.to, "\n"));
    };
    editor.on("selectionUpdate", syncSel);
    syncSel();
    return () => {
      editor.off("selectionUpdate", syncSel);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const up = () => setHeadings(extractHeadings(editor));
    editor.on("update", up);
    up();
    return () => {
      editor.off("update", up);
    };
  }, [editor]);

  useEffect(() => {
    if (!doc) return;
    const t = setTimeout(() => {
      const { doc: d, contentJson: j, contentText: txt } = latest.current;
      if (!d) return;
      saveDocument({
        ...d,
        content: j as object,
        contentText: txt,
        updatedAt: new Date().toISOString(),
      });
    }, 30000);
    return () => clearTimeout(t);
  }, [contentText, doc]);

  const contentHash = useMemo(() => simpleHash(contentText), [contentText]);
  const cacheHit = Boolean(
    analysis && analysis.contentHash === contentHash,
  );

  const runAnalyze = useCallback(async () => {
    const { doc: d, contentText: txt } = latest.current;
    if (!d || !txt.trim()) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentText: txt,
          docType: docTypeLabel(d.docType),
          jurisdiction: d.jurisdiction,
          ourParty: d.ourParty,
        }),
      });
      if (!res.ok) throw new Error(`Analysis failed (${res.status})`);
      const data = await res.json();
      const next: AIAnalysis = {
        documentId: d.id,
        contentHash: simpleHash(txt),
        overallRisk: data.overallRisk,
        executiveSummary: data.executiveSummary,
        clauses: data.clauses ?? [],
        missingClauses: data.missingClauses ?? [],
        definedTerms: data.definedTerms ?? [],
        negotiationLeverage: data.negotiationLeverage ?? "",
        createdAt: new Date().toISOString(),
      };
      saveAnalysis(next);
      setAnalysis(next);
      setDoc((prev) =>
        prev
          ? { ...prev, overallRisk: next.overallRisk, updatedAt: new Date().toISOString() }
          : null,
      );
      saveDocument({
        ...d,
        overallRisk: next.overallRisk,
        content: latest.current.contentJson as object,
        contentText: txt,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveRef.current?.();
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        void runAnalyze();
      }
      if (e.key === "Escape") setVersionsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [runAnalyze]);

  const handleSaveRef = useRef<() => void>(() => {});

  const handleSave = useCallback(() => {
    const { doc: d, contentJson: j, contentText: txt } = latest.current;
    if (!d) return;
    setSaving(true);
    try {
      const versions = getVersions(d.id);
      const vnum = versions.length + 1;
      saveVersion({
        id: crypto.randomUUID(),
        documentId: d.id,
        versionNumber: vnum,
        label: "Save",
        content: j as object,
        contentText: txt,
        createdAt: new Date().toISOString(),
        charCount: txt.length,
      });
      const updated: Document = {
        ...d,
        content: j as object,
        contentText: txt,
        updatedAt: new Date().toISOString(),
      };
      saveDocument(updated);
      setDoc(updated);
    } finally {
      setSaving(false);
    }
  }, []);

  handleSaveRef.current = handleSave;

  useEffect(() => {
    if (!editor || !doc) return;
    const key = `lexdraft:pendingHtml:${documentId}`;
    const html = sessionStorage.getItem(key);
    if (html) {
      editor.commands.setContent(html);
      sessionStorage.removeItem(key);
    }
  }, [editor, doc, documentId]);

  useEffect(() => {
    if (!editor || !doc) return;
    const draft = searchParams.get("draft");
    const prompt = searchParams.get("prompt") ?? "";
    if (draft !== "true" || draftStarted.current) return;
    draftStarted.current = true;
    let acc = "";
    void streamToState(
      "/api/ai/draft",
      {
        prompt,
        docType: docTypeLabel(doc.docType),
        jurisdiction: doc.jurisdiction,
        ourParty: doc.ourParty,
      },
      (t) => {
        acc += t;
        editor.commands.setContent(plainTextToDoc(acc));
      },
      () => {
        router.replace(`/documents/${documentId}`);
      },
      () => {
        router.replace(`/documents/${documentId}`);
      },
    );
  }, [editor, doc, documentId, searchParams, router]);

  const onEditorChange = useCallback(
    ({ json, text }: { json: JSONContent; text: string }) => {
      setContentJson(json);
      setContentText(text);
      setDoc((prev) =>
        prev
          ? {
              ...prev,
              content: json as object,
              contentText: text,
            }
          : null,
      );
    },
    [],
  );

  const onTitleChange = useCallback((title: string) => {
    setDoc((prev) => {
      if (!prev) return null;
      const next = { ...prev, title, updatedAt: new Date().toISOString() };
      saveDocument(next);
      return next;
    });
  }, []);

  const onStatusCycle = useCallback(() => {
    setDoc((prev) => {
      if (!prev) return null;
      const order = ["draft", "review", "final"] as const;
      const i = order.indexOf(prev.status);
      const nextStatus = order[(i + 1) % order.length];
      const next = { ...prev, status: nextStatus, updatedAt: new Date().toISOString() };
      saveDocument(next);
      return next;
    });
  }, []);

  const onDocMetaChange = useCallback(
    (p: { docType: Document["docType"]; jurisdiction: string; ourParty: string }) => {
      setDoc((prev) => {
        if (!prev) return null;
        const next = { ...prev, ...p, updatedAt: new Date().toISOString() };
        saveDocument(next);
        return next;
      });
    },
    [],
  );

  const onHeadingClick = useCallback(
    (pos: number, end: number) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .setTextSelection({ from: pos + 1, to: Math.max(pos + 1, end - 1) })
        .scrollIntoView()
        .run();
    },
    [editor],
  );

  if (!doc) {
    return (
      <div className="flex h-screen items-center justify-center text-[var(--text-hint)]">
        Loading…
      </div>
    );
  }

  const versions = getVersions(doc.id);
  const currentVersionNumber = versions.length;

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-[var(--bg-base)]">
      <TopBar
        doc={doc}
        onTitleChange={onTitleChange}
        onStatusCycle={onStatusCycle}
        onSave={handleSave}
        onAnalyze={() => void runAnalyze()}
        saving={saving}
      />
      <div className="flex min-h-0 flex-1">
        <Sidebar
          headings={headings}
          onHeadingClick={onHeadingClick}
          versions={versions}
          currentVersionNumber={currentVersionNumber}
          analysis={analysis}
          onOpenVersions={() => setVersionsOpen((o) => !o)}
          versionsOpen={versionsOpen}
        />
        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
          <div className="relative mx-auto flex h-full max-w-[760px] flex-col border-x border-[var(--border-subtle)] bg-[var(--bg-document)]">
            <LexEditor
              initialContent={contentJson}
              onChange={onEditorChange}
              onEditorReady={setEditor}
              jurisdiction={doc.jurisdiction}
              ourParty={doc.ourParty}
            />
            {analysis && cacheHit && (
              <RiskHeatmap
                clauses={analysis.clauses}
                contentText={contentText}
                editor={editor}
              />
            )}
          </div>
        </div>
        <AIPanel
          contentText={contentText}
          selectionText={selectionText}
          docType={doc.docType}
          jurisdiction={doc.jurisdiction}
          ourParty={doc.ourParty}
          editor={editor}
          analysis={cacheHit ? analysis : null}
          analyzing={analyzing}
          cacheHit={cacheHit}
          onAnalyze={() => void runAnalyze()}
          onDocMetaChange={onDocMetaChange}
        />
      </div>
    </div>
  );
}
