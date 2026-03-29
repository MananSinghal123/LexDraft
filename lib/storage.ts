import type { AIAnalysis, Document, VersionSnapshot } from "@/types";

export function getAllDocuments(): Document[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("lexdraft:documents") ?? "[]");
  } catch {
    return [];
  }
}

export function getDocument(id: string): Document | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`lexdraft:doc:${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDocument(doc: Document): void {
  localStorage.setItem(`lexdraft:doc:${doc.id}`, JSON.stringify(doc));
  const all = getAllDocuments();
  const idx = all.findIndex((d) => d.id === doc.id);
  if (idx >= 0) all[idx] = doc;
  else all.unshift(doc);
  localStorage.setItem("lexdraft:documents", JSON.stringify(all));
}

export function deleteDocument(id: string): void {
  localStorage.removeItem(`lexdraft:doc:${id}`);
  localStorage.removeItem(`lexdraft:versions:${id}`);
  localStorage.removeItem(`lexdraft:analysis:${id}`);
  const all = getAllDocuments().filter((d) => d.id !== id);
  localStorage.setItem("lexdraft:documents", JSON.stringify(all));
}

export function getVersions(documentId: string): VersionSnapshot[] {
  try {
    return JSON.parse(
      localStorage.getItem(`lexdraft:versions:${documentId}`) ?? "[]",
    );
  } catch {
    return [];
  }
}

export function saveVersion(snapshot: VersionSnapshot): void {
  const versions = getVersions(snapshot.documentId);
  versions.push(snapshot);
  localStorage.setItem(
    `lexdraft:versions:${snapshot.documentId}`,
    JSON.stringify(versions),
  );
}

export function getAnalysis(documentId: string): AIAnalysis | null {
  try {
    const raw = localStorage.getItem(`lexdraft:analysis:${documentId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAnalysis(analysis: AIAnalysis): void {
  localStorage.setItem(
    `lexdraft:analysis:${analysis.documentId}`,
    JSON.stringify(analysis),
  );
}

export function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}
