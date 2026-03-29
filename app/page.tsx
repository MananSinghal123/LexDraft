"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllDocuments, deleteDocument } from "@/lib/storage";
import type { Document } from "@/types";
import { DocumentCard } from "@/components/dashboard/DocumentCard";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function DashboardPage() {
  const [docs, setDocs] = useState<Document[]>([]);

  useEffect(() => {
    setDocs(getAllDocuments());
  }, []);

  const onDelete = (id: string) => {
    deleteDocument(id);
    setDocs(getAllDocuments());
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <header className="flex h-14 items-center justify-between border-b border-[var(--border-subtle)] px-6">
        <Link
          href="/"
          className="font-display text-xl font-medium text-[var(--gold)]"
        >
          LexDraft
        </Link>
        <Link
          href="/documents/new"
          className="rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-medium text-[var(--bg-base)] hover:opacity-90"
        >
          New document
        </Link>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        {docs.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {docs.map((d) => (
              <DocumentCard key={d.id} doc={d} onDelete={onDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
