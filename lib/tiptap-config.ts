import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import { Mark } from "@tiptap/core";

const InsertionMark = Mark.create({
  name: "insertion",
  renderHTML() {
    return ["span", { class: "mark-insertion" }, 0];
  },
  parseHTML() {
    return [{ tag: "span.mark-insertion" }];
  },
});

const DeletionMark = Mark.create({
  name: "deletion",
  renderHTML() {
    return ["span", { class: "mark-deletion" }, 0];
  },
  parseHTML() {
    return [{ tag: "span.mark-deletion" }];
  },
});

export const editorExtensions = [
  StarterKit,
  Highlight.configure({ multicolor: true }),
  Typography,
  Underline,
  CharacterCount,
  Placeholder.configure({
    placeholder: "Start drafting or use AI to generate a contract…",
  }),
  InsertionMark,
  DeletionMark,
];
