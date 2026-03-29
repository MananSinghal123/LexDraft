"use client";

import { useCallback, useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import { streamToState } from "@/lib/stream";
import { StreamingResponse } from "@/components/ai/StreamingResponse";

interface Props {
  editor: Editor | null;
  jurisdiction: string;
  ourParty: string;
}

export function SelectionBubble({ editor, jurisdiction, ourParty }: Props) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainText, setExplainText] = useState("");
  const [explainLoading, setExplainLoading] = useState(false);

  const update = useCallback(() => {
    if (!editor) {
      setVisible(false);
      return;
    }
    const { from: f, to: t, empty } = editor.state.selection;
    if (empty || f === t) {
      setVisible(false);
      setExplainOpen(false);
      return;
    }
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      setVisible(false);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setVisible(false);
      return;
    }
    setFrom(f);
    setTo(t);
    setPos({
      top: rect.top - 44,
      left: rect.left + rect.width / 2,
    });
    setVisible(true);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor, update]);

  const selectedText = editor
    ? editor.state.doc.textBetween(from, to, "\n")
    : "";

  const runExplain = async () => {
    if (!editor || !selectedText.trim()) return;
    setExplainOpen(true);
    setExplainLoading(true);
    setExplainText("");
    await streamToState(
      "/api/ai/explain",
      { selectedText, jurisdiction },
      (chunk) => setExplainText((s) => s + chunk),
      () => setExplainLoading(false),
      () => setExplainLoading(false),
    );
  };

  const runRedline = async () => {
    if (!editor || !selectedText.trim()) return;
    let result = "";
    await streamToState(
      "/api/ai/redline",
      { clauseText: selectedText, ourParty, jurisdiction },
      (chunk) => {
        result += chunk;
      },
      () => {
        editor
          .chain()
          .focus()
          .deleteRange({ from, to })
          .insertContent({
            type: "text",
            text: result.trim(),
            marks: [{ type: "insertion" }],
          })
          .run();
        setVisible(false);
      },
    );
  };

  if (!visible || !editor) return null;

  return (
    <>
      <div
        className="pointer-events-auto fixed z-[100] flex -translate-x-1/2 flex-col items-center gap-2"
        style={{ top: pos.top, left: pos.left }}
      >
        <div className="flex items-center gap-0.5 rounded-lg border border-[var(--border-mid)] bg-[var(--bg-elevated)] px-1 py-1 shadow-lg">
          <button
            type="button"
            className="rounded px-2 py-1 text-xs font-bold hover:bg-[var(--bg-hover)]"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            B
          </button>
          <button
            type="button"
            className="rounded px-2 py-1 text-xs italic hover:bg-[var(--bg-hover)]"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            I
          </button>
          <button
            type="button"
            className="rounded px-2 py-1 text-xs text-[var(--gold-text)] hover:bg-[var(--bg-hover)]"
            onClick={() => void runExplain()}
          >
            Explain
          </button>
          <button
            type="button"
            className="rounded px-2 py-1 text-xs hover:bg-[var(--bg-hover)]"
            onClick={() => void runRedline()}
          >
            Redline
          </button>
        </div>
        {explainOpen && (
          <div className="max-w-[320px] rounded-lg border border-[var(--border-mid)] bg-[var(--bg-elevated)] p-3 shadow-xl">
            <StreamingResponse
              content={explainText}
              isStreaming={explainLoading}
              emptyState={<p className="text-xs text-[var(--text-hint)]">…</p>}
            />
          </div>
        )}
      </div>
    </>
  );
}
