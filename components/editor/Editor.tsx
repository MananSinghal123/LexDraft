"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import type { Editor as TiptapEditor } from "@tiptap/react";
import { useEffect } from "react";
import { editorExtensions } from "@/lib/tiptap-config";
import { EditorToolbar } from "./EditorToolbar";
import { TrackChangesBar } from "./TrackChangesBar";
import { SelectionBubble } from "./SelectionBubble";

interface Props {
  initialContent: JSONContent;
  onChange?: (payload: { json: JSONContent; text: string }) => void;
  onEditorReady?: (editor: TiptapEditor) => void;
  jurisdiction: string;
  ourParty: string;
}

export function Editor({
  initialContent,
  onChange,
  onEditorReady,
  jurisdiction,
  ourParty,
}: Props) {
  const editor = useEditor({
    extensions: editorExtensions,
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "lexdraft-editor max-w-none focus:outline-none",
        spellCheck: "false",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange?.({ json: ed.getJSON(), text: ed.getText() });
    },
  });

  useEffect(() => {
    if (editor) onEditorReady?.(editor);
  }, [editor, onEditorReady]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <EditorToolbar editor={editor} />
      <TrackChangesBar editor={editor} />
      <div className="relative min-h-0 flex-1 overflow-y-auto bg-[var(--bg-document)]">
        <EditorContent editor={editor} />
        <SelectionBubble
          editor={editor}
          jurisdiction={jurisdiction}
          ourParty={ourParty}
        />
      </div>
    </div>
  );
}
