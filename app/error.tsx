"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-base)] px-4 text-center">
      <h1 className="font-display text-2xl text-[var(--text-primary)]">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">
        {error.message}
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-medium text-[var(--bg-base)]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-[var(--border-mid)] px-4 py-2 text-sm text-[var(--text-primary)]"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
