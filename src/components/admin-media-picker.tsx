"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";

export type MediaPickerItem = {
  id: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  /** Nama ramah (R25b); fallback nama berkas sudah dihitung di server. */
  name: string;
  consent: boolean;
};

/**
 * Pemilih media (R25a): dialog berisi kisi thumbnail dari pustaka — klik
 * satu kartu untuk memilih, tanpa mengetik URL. Pencarian menyaring
 * nama/berkas. Dirender lewat portal ke `document.body` karena
 * `[data-admin-rise]` menyimpan transform yang menjebak `position: fixed`
 * (pelajaran R19).
 */
export function MediaPicker({
  open,
  items,
  title,
  onClose,
  onSelect,
}: {
  open: boolean;
  items: MediaPickerItem[];
  title: string;
  onClose: () => void;
  onSelect: (item: MediaPickerItem) => void;
}) {
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const id = useId();

  // Reset pencarian saat menutup; buka lagi = bersih (tanpa setState di efek).
  const close = () => {
    setQ("");
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const query = q.trim().toLowerCase();
  const list = query
    ? items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.fileUrl.toLowerCase().includes(query)
      )
    : items;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        onClick={close}
        className="absolute inset-0 bg-[#130f0b]/40 backdrop-blur-[6px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className="card-in relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-md border border-line bg-surface shadow-xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 id={id} className="font-display text-lg leading-snug text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Tutup pemilih foto"
            className="focus-ring flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-sm text-ink-2 transition-colors hover:bg-hover-surface hover:text-ink"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="border-b border-line px-5 py-3">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3"
            />
            <input
              ref={searchRef}
              type="search"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Cari nama atau berkas"
              aria-label="Cari media"
              className="focus-ring h-11 w-full rounded-sm border border-line-strong bg-canvas pl-9 pr-3 text-sm text-ink placeholder:text-ink-3"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-3">
              Pustaka masih kosong — unggah dulu di halaman Media.
            </p>
          ) : list.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-3">
              Tidak ada media yang cocok dengan pencarian.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {list.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(item);
                      close();
                    }}
                    className="focus-ring group block w-full cursor-pointer overflow-hidden rounded-md border border-line bg-surface text-left transition-colors hover:border-line-strong"
                  >
                    <span className="relative block aspect-[4/3] bg-subtle">
                      <Image
                        src={item.thumbnailUrl ?? item.fileUrl}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 220px, 45vw"
                        className="object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
                      />
                      {!item.consent ? (
                        <span className="label-plate absolute left-2 top-2">
                          Belum berizin
                        </span>
                      ) : null}
                    </span>
                    <span className="block truncate px-3 py-2 text-xs text-ink">
                      {item.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="border-t border-line px-5 py-3 text-xs leading-relaxed text-ink-3">
          Klik satu foto untuk memilih. Kelola nama dan izin tayang di
          halaman Media.
        </p>
      </div>
    </div>,
    document.body
  );
}
