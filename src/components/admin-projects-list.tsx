"use client";

import Link from "next/link";
import { useId, useState } from "react";

export type AdminProjectRow = {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published" | "trashed";
  location: string;
  year: string;
  /** ISO string agar aman melewati batas server → klien. */
  updatedAt: string;
};

const STATUS_LABEL: Record<AdminProjectRow["status"], string> = {
  published: "Terbit",
  draft: "Draf",
  trashed: "Trash",
};

const STATUS_STYLE: Record<AdminProjectRow["status"], string> = {
  published: "border-line-strong text-ink",
  draft: "border-line-strong text-ink-2",
  trashed: "border-line-strong text-ink-3",
};

type StatusFilter = "Semua" | AdminProjectRow["status"];
const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "Semua", label: "Semua" },
  { value: "published", label: "Terbit" },
  { value: "draft", label: "Draf" },
  { value: "trashed", label: "Trash" },
];

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Daftar proyek panel dari basis data: cari + saring status di klien,
 * tautan ke editor, dan keadaan kosong yang jujur.
 */
export function AdminProjectsList({
  projects,
  initialQuery = "",
}: {
  projects: AdminProjectRow[];
  initialQuery?: string;
}) {
  const searchId = useId();
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<StatusFilter>("Semua");

  const needle = query.trim().toLowerCase();
  const filtered = projects.filter((project) => {
    if (status !== "Semua" && project.status !== status) return false;
    if (!needle) return true;
    return [project.title, project.slug, project.location]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  const chipBase =
    "focus-ring inline-flex min-h-11 items-center rounded-sm border px-3 text-sm transition-colors";
  const chipIdle = `${chipBase} border-line-strong text-ink-2 hover:bg-hover-surface`;
  const chipActive = `${chipBase} border-primary bg-primary text-primary-ink`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="w-full min-w-0 sm:max-w-xs">
          <label htmlFor={searchId} className="text-xs text-ink-3">
            Cari proyek
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Judul, slug, atau lokasi"
            className="focus-ring mt-1 h-11 w-full rounded-sm border border-line-strong bg-canvas px-3 text-sm text-ink placeholder:text-ink-3"
          />
        </div>
        <div
          role="group"
          aria-label="Saring status"
          className="flex flex-wrap items-center gap-2"
        >
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={status === option.value}
              onClick={() => setStatus(option.value)}
              className={status === option.value ? chipActive : chipIdle}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-ink-3" aria-live="polite">
        {filtered.length} dari {projects.length} proyek
      </p>

      {projects.length === 0 ? (
        <div className="rounded-md border border-line bg-subtle px-6 py-10 text-center">
          <p className="font-display text-xl leading-snug">Belum ada proyek.</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-2">
            Mulai dari satu proyek baru; simpan sebagai draf lebih dulu, lalu
            terbitkan setelah ringkasannya siap.
          </p>
          <Link href="/admin/projects/new" className="btn btn-primary mt-5">
            Proyek baru
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-line bg-subtle px-6 py-10 text-center">
          <p className="font-display text-xl leading-snug">
            Tidak ada proyek yang cocok.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-2">
            Ubah kata kunci atau kembalikan saringan status.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatus("Semua");
            }}
            className="btn btn-secondary mt-5"
          >
            Bersihkan saringan
          </button>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-md border border-line bg-surface">
          {filtered.map((project) => (
            <li
              key={project.id}
              className="grid gap-x-4 gap-y-2 border-b border-line px-5 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="focus-ring block truncate py-3 text-sm text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-primary lg:py-0"
                >
                  {project.title}
                </Link>
                <p className="mt-0.5 truncate text-xs text-ink-3">
                  /{project.slug}
                  {project.location ? ` · ${project.location}` : ""}
                  {project.year ? ` · ${project.year}` : ""}
                </p>
              </div>
              <span
                className={`inline-flex w-fit items-center rounded-sm border px-2 py-0.5 text-[11px] ${STATUS_STYLE[project.status]}`}
              >
                {STATUS_LABEL[project.status]}
              </span>
              <span className="text-xs text-ink-3 sm:text-right">
                {dateFmt.format(new Date(project.updatedAt))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
