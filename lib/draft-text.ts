import type { JSONContent } from "@tiptap/core";

/** Convert streamed plain-text draft into Tiptap JSON document. */
export function plainTextToDoc(text: string): JSONContent {
  const blocks = text.split(/\n\n+/).filter((b) => b.trim().length > 0);
  if (blocks.length === 0) {
    return { type: "doc", content: [{ type: "paragraph" }] };
  }
  return {
    type: "doc",
    content: blocks.map((block) => ({
      type: "paragraph",
      content: [{ type: "text", text: block.replace(/\s+/g, " ").trim() }],
    })),
  };
}
