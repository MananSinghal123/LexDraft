import type { Editor } from "@tiptap/react";

export function acceptAllInsertions(editor: Editor): void {
  const { state } = editor;
  const type = state.schema.marks.insertion;
  if (!type) return;
  let tr = state.tr;
  state.doc.descendants((node, pos) => {
    if (node.isText && node.marks.some((m) => m.type === type)) {
      const len = (node.text ?? "").length;
      tr = tr.removeMark(pos, pos + len, type);
    }
  });
  editor.view.dispatch(tr);
}

export function rejectAllInsertions(editor: Editor): void {
  const { state } = editor;
  const type = state.schema.marks.insertion;
  if (!type) return;
  let tr = state.tr;
  const ranges: { from: number; to: number }[] = [];
  state.doc.descendants((node, pos) => {
    if (node.isText && node.marks.some((m) => m.type === type)) {
      const len = (node.text ?? "").length;
      ranges.push({ from: pos, to: pos + len });
    }
  });
  ranges.sort((a, b) => b.from - a.from).forEach((r) => {
    tr = tr.delete(r.from, r.to);
  });
  editor.view.dispatch(tr);
}
