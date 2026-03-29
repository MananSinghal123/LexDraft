import { Suspense } from "react";
import { DocumentWorkspace } from "@/components/documents/DocumentWorkspace";

export default function DocumentPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[var(--bg-base)] text-[var(--text-hint)]">
          Loading…
        </div>
      }
    >
      <DocumentWorkspace documentId={params.id} />
    </Suspense>
  );
}
