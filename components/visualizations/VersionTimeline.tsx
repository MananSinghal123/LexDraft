"use client";

import { useMemo, useState } from "react";
import type { VersionSnapshot } from "@/types";
import { DiffModal } from "./DiffModal";

const NODE_R = 10;
const X_GAP = 150;
const Y = 55;

interface Props {
  versions: VersionSnapshot[];
  currentVersionNumber: number;
}

export function VersionTimeline({ versions, currentVersionNumber }: Props) {
  const [diffOpen, setDiffOpen] = useState(false);
  const [compare, setCompare] = useState<{
    oldText: string;
    newText: string;
    label: string;
  } | null>(null);

  const width = useMemo(
    () => Math.max(versions.length * X_GAP + 60, 400),
    [versions.length],
  );

  const viewBox = `0 0 ${width} 120`;

  const openDiff = (idx: number) => {
    if (idx <= 0) return;
    const prev = versions[idx - 1];
    const cur = versions[idx];
    setCompare({
      oldText: prev.contentText,
      newText: cur.contentText,
      label: `v${prev.versionNumber} → v${cur.versionNumber}`,
    });
    setDiffOpen(true);
  };

  return (
    <>
      <div className="overflow-x-auto pb-2">
        <svg
          width={width}
          height={120}
          viewBox={viewBox}
          className="min-w-full"
          aria-label="Version history"
        >
          {versions.map((v, index) => {
            const cx = 60 + index * X_GAP;
            const isCurrent = v.versionNumber === currentVersionNumber;
            const prevCx = index > 0 ? 60 + (index - 1) * X_GAP : null;
            return (
              <g key={v.id}>
                {prevCx != null && (
                  <line
                    x1={prevCx + NODE_R}
                    y1={Y}
                    x2={cx - NODE_R}
                    y2={Y}
                    stroke="var(--border-mid)"
                    strokeWidth={1.5}
                  />
                )}
                <circle
                  cx={cx}
                  cy={Y}
                  r={NODE_R}
                  fill={isCurrent ? "var(--gold)" : "transparent"}
                  stroke={isCurrent ? "var(--gold)" : "var(--border-strong)"}
                  strokeWidth={1.5}
                  className={index > 0 ? "cursor-pointer" : ""}
                  onClick={() => index > 0 && openDiff(index)}
                />
                <text
                  x={cx}
                  y={Y + 28}
                  textAnchor="middle"
                  fill="var(--text-hint)"
                  fontSize={10}
                  fontFamily="var(--font-mono)"
                >
                  v{v.versionNumber}
                </text>
                {v.label && (
                  <text
                    x={cx}
                    y={Y + 42}
                    textAnchor="middle"
                    fill="var(--text-hint)"
                    fontSize={9}
                    fontFamily="var(--font-ui)"
                  >
                    {v.label.slice(0, 18)}
                    {v.label.length > 18 ? "…" : ""}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {compare && (
        <DiffModal
          open={diffOpen}
          onClose={() => setDiffOpen(false)}
          oldText={compare.oldText}
          newText={compare.newText}
          title={compare.label}
        />
      )}
    </>
  );
}
