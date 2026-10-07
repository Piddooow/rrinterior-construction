"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type BarDatum = { label: string; value: number };

/**
 * Grafik batang panel (R6; dirapikan R26d): segmented control Tahun/Kategori
 * yang menyatu (radius tombol situs), garis bantu halus, dan batang yang
 * tumbuh dari garis dasar secara bertahap saat pertama tampil atau saat
 * sudut pandang diganti — tenang, tanpa gerakan berlebihan. SVG murni tanpa
 * library baru; data NYATA dari basis data.
 */
export function AdminBarChart({
  year,
  category,
}: {
  year: BarDatum[];
  category: BarDatum[];
}) {
  const [mode, setMode] = useState<"year" | "category">("year");
  const data = mode === "year" ? year : category;
  const max = Math.max(1, ...data.map((d) => d.value));
  const empty = data.length === 0 || data.every((d) => d.value === 0);

  const W = 640;
  const H = 260;
  const pad = { top: 30, right: 10, bottom: 34, left: 10 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const baseline = H - pad.bottom;
  const slot = data.length ? innerW / data.length : innerW;
  const barW = Math.min(42, slot * 0.52);
  const summary = data.map((d) => `${d.label} ${d.value}`).join(", ");

  const options = [
    ["year", "Tahun"],
    ["category", "Kategori"],
  ] as const;

  return (
    <div className="mt-4">
      <div
        role="group"
        aria-label="Sudut pandang grafik"
        className="inline-flex overflow-hidden rounded-sm border border-line-strong"
      >
        {options.map(([value, label], index) => {
          const active = mode === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              aria-pressed={active}
              className={cn(
                "focus-ring inline-flex min-h-11 cursor-pointer items-center px-4 text-xs transition-colors",
                index > 0 && "border-l border-line-strong",
                active
                  ? "bg-primary text-primary-ink"
                  : "text-ink-2 hover:bg-hover-surface hover:text-ink"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {empty ? (
        <p className="mt-4 rounded-md border border-dashed border-line-strong px-4 py-8 text-center text-sm text-ink-3">
          Belum ada data untuk ditampilkan.
        </p>
      ) : (
        <div
          key={mode}
          role="img"
          aria-label={`Grafik ${summary}`}
          className="mt-4"
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
            <defs>
              <linearGradient id="rrAdminBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D9AE6B" />
                <stop offset="100%" stopColor="#70360A" />
              </linearGradient>
            </defs>

            {/* Garis bantu halus: napas vertikal tanpa mengganggu batang. */}
            {[0.25, 0.5, 0.75, 1].map((fraction) => (
              <line
                key={fraction}
                x1={pad.left}
                y1={baseline - innerH * fraction}
                x2={W - pad.right}
                y2={baseline - innerH * fraction}
                stroke="#E4D7C5"
                strokeOpacity="0.55"
                strokeWidth="1"
              />
            ))}
            <line
              x1={pad.left}
              y1={baseline}
              x2={W - pad.right}
              y2={baseline}
              stroke="#E4D7C5"
              strokeWidth="1"
            />

            {data.map((d, i) => {
              const h = d.value === 0 ? 0 : Math.max(5, (d.value / max) * innerH);
              const x = pad.left + i * slot + (slot - barW) / 2;
              const y = baseline - h;
              return (
                <g key={d.label}>
                  <rect
                    className="admin-bar"
                    style={{ animationDelay: `${i * 70}ms` }}
                    x={x}
                    y={y}
                    width={barW}
                    height={h}
                    rx={5}
                    fill="url(#rrAdminBar)"
                  />
                  {d.value > 0 ? (
                    <text
                      x={x + barW / 2}
                      y={y - 8}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#554437"
                    >
                      {d.value}
                    </text>
                  ) : null}
                  <text
                    x={x + barW / 2}
                    y={baseline + 20}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#65564a"
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}
