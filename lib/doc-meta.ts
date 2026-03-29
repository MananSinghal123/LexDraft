import type { DocType } from "@/types";

export const DOC_TYPE_OPTIONS: { value: DocType; label: string }[] = [
  { value: "nda", label: "NDA" },
  { value: "msa", label: "MSA" },
  { value: "employment", label: "Employment Agreement" },
  { value: "saas", label: "SaaS Agreement" },
  { value: "lease", label: "Lease" },
  { value: "partnership", label: "Partnership" },
  { value: "general", label: "General" },
];

export const JURISDICTION_OPTIONS = [
  "India",
  "United States",
  "United Kingdom",
  "Singapore",
  "UAE",
  "Other",
] as const;

export function docTypeLabel(t: DocType): string {
  return DOC_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t;
}
