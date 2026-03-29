import type { Editor } from "@tiptap/react";
import type { Node as PMNode } from "@tiptap/pm/model";

function offsetsToRange(
  doc: PMNode,
  start: number,
  end: number,
): { from: number; to: number } | null {
  let acc = 0;
  let from = -1;
  let to = -1;
  doc.descendants((node, pos) => {
    if (!node.isText) return;
    const len = (node.text ?? "").length;
    const ns = acc;
    const ne = acc + len;
    if (from < 0 && start >= ns && start < ne) {
      from = pos + (start - ns);
    }
    if (to < 0 && end > ns && end <= ne) {
      to = pos + (end - ns);
    }
    acc = ne;
  });
  if (from >= 0 && to >= 0) return { from, to };
  return null;
}

/** Map a substring of `editor.getText()` to document positions. */
export function findTextRangeInEditor(
  editor: Editor,
  fragment: string,
): { from: number; to: number } | null {
  const full = editor.getText();
  const needle = fragment.slice(0, Math.min(80, fragment.length));
  if (!needle) return null;
  const start = full.indexOf(needle);
  if (start < 0) return null;
  const end = Math.min(start + fragment.length, full.length);
  return offsetsToRange(editor.state.doc, start, end);
}
