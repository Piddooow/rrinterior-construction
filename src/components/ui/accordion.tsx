"use client";

import { useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccordionItem = { question: string; answer: string };

/**
 * Akordeon FAQ eksklusif: membuka satu pertanyaan menutup yang lain, jadi
 * halaman tetap ringkas dan pengunjung tidak perlu menutup manual.
 *
 * Tinggi dianimasikan lewat grid-template-rows 0fr→1fr: baris mengikuti
 * tinggi isi yang sebenarnya, jadi teks yang membungkus ulang di lebar baru
 * tidak pernah terpotong. Isinya sendiri turun seperti flap berengsel di
 * bawah kepala pertanyaan, lalu terlipat kembali saat ditutup.
 * Papan ketik: panah atas/bawah, Home/End berpindah antar kepala.
 */
export function Accordion({
  items,
  className,
}: {
  items: AccordionItem[];
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const headers = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  const toggle = (index: number) =>
    setOpen((current) => (current === index ? null : index));

  const focusHeader = (index: number) => {
    const count = items.length;
    headers.current[(index + count) % count]?.focus();
  };

  return (
    <div
      className={cn(
        "w-full divide-y divide-line border-y border-line",
        className
      )}
    >
      {items.map((item, i) => {
        const isOpen = open === i;
        const headerId = `${baseId}-header-${i}`;
        const panelId = `${baseId}-panel-${i}`;

        return (
          <div key={item.question}>
            <h3>
              <button
                ref={(el) => {
                  headers.current[i] = el;
                }}
                id={headerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                onKeyDown={(e) => {
                  const target = {
                    ArrowDown: i + 1,
                    ArrowUp: i - 1,
                    Home: 0,
                    End: items.length - 1,
                  }[e.key];
                  if (target === undefined) return;
                  e.preventDefault();
                  focusHeader(target);
                }}
                className="focus-ring group flex min-h-14 w-full items-center justify-between gap-5 py-4 text-left font-display text-lg leading-snug text-ink sm:text-xl"
              >
                {item.question}
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "size-5 shrink-0 text-ink-3 transition-[rotate,color] duration-250 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:text-ink motion-reduce:transition-[color]",
                    isOpen && "rotate-180 text-ink"
                  )}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              inert={!isOpen}
              className={cn(
                "grid ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                isOpen
                  ? "grid-rows-[1fr] transition-[grid-template-rows] duration-250"
                  : "grid-rows-[0fr] transition-[grid-template-rows] duration-200"
              )}
            >
              <div className="min-h-0 overflow-hidden">
                {/* Jawaban adalah flap yang terlipat di bawah pertanyaannya:
                    ia turun pada engsel di tepi bawah kepala sambil baris
                    membuka, jadi geraknya mengatakan dari mana teks itu
                    datang. */}
                <div
                  className={cn(
                    "relative origin-top transition-[transform,opacity] motion-reduce:transform-none motion-reduce:transition-[opacity]",
                    isOpen
                      ? "[transform:perspective(640px)_rotateX(0deg)] opacity-100 duration-280 ease-[cubic-bezier(0.32,0.72,0,1)]"
                      : "[transform:perspective(640px)_rotateX(-72deg)] opacity-0 duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]"
                  )}
                >
                  <p className="pr-10 pb-6 text-[15px] leading-relaxed text-pretty text-ink-2">
                    {item.answer}
                  </p>
                  {/* Crease: teks terdekat engsel tetap tersaput warna
                      halaman sampai flap benar-benar rata. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute inset-0 bg-linear-to-b from-canvas to-transparent to-80% transition-[opacity] ease-out motion-reduce:hidden",
                      isOpen
                        ? "opacity-0 duration-280"
                        : "opacity-100 duration-150"
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
