"use client";

import Link from "next/link";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h2 className="font-display text-2xl text-[var(--text-primary)]">
        No documents yet
      </h2>
      <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">
        Create a blank agreement, upload a Word file, or let AI draft a first
        version — everything stays in this browser.
      </p>
      <Link
        href="/documents/new"
        className="mt-8 rounded-md bg-[var(--gold)] px-6 py-3 text-sm font-medium text-[var(--bg-base)] hover:opacity-90"
      >
        New document
      </Link>
    </div>
  );
}
