export interface Document {
  id: string;
  title: string;
  contentText: string;
  content: object;
  docType: DocType;
  jurisdiction: string;
  ourParty: string;
  status: "draft" | "review" | "final";
  overallRisk?: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
}

export type DocType =
  | "nda"
  | "msa"
  | "employment"
  | "saas"
  | "lease"
  | "partnership"
  | "general";

export interface VersionSnapshot {
  id: string;
  documentId: string;
  versionNumber: number;
  label?: string;
  content: object;
  contentText: string;
  createdAt: string;
  charCount: number;
}

export interface AIAnalysis {
  documentId: string;
  contentHash: string;
  overallRisk: "low" | "medium" | "high";
  executiveSummary: string;
  clauses: ClauseAnalysis[];
  missingClauses: MissingClause[];
  definedTerms: string[];
  negotiationLeverage: string;
  createdAt: string;
}

export interface ClauseAnalysis {
  id: string;
  title: string;
  excerpt: string;
  risk: "low" | "medium" | "high" | "info";
  issue: string;
  fix: string;
  favoredParty: "us" | "them" | "neutral";
  confidence: number;
}

export interface MissingClause {
  name: string;
  severity: "critical" | "recommended";
  reason: string;
}
