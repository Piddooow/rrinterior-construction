"use client";

import Link from "next/link";
import {
  deleteTrashAction,
  restoreTrashAction,
} from "@/app/admin/(panel)/trash/actions";
import { ConfirmButton } from "@/components/admin-confirm";

export type AdminTrashRow = {
  type: "project" | "service" | "page" | "media";
  id: string;
  label: string;
  /** ISO string agar aman melewati batas server → klien. */
  trashedAt: string;
  dependencies: number;
  notes: string[];
};

const TYPE_LABEL: Record<AdminTrashRow["type"], string> = {
  project: "Proyek",
  service: "Layanan",
  page: "Halaman",
  media: "Media",
};

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Tempat sampah NYATA: pulihkan item ke draf atau hapus permanen lewat
 * Server Action. Hapus permanen ditahan selama masih ada dependensi
 * (data layer memblokir dan menjelaskan sebabnya).
 */
export function AdminTrashList({ items }: { items: AdminTrashRow[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-line bg-subtle px-6 py-10 text-center">
        <p className="font-display text-xl leading-snug">
          Tempat sampah kosong.
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-2">
          Item yang dipindahkan ke Trash muncul di sini dan bisa dipulihkan
          kapan pun sebelum dihapus permanen.
        </p>
        <Link href="/admin/projects" className="btn btn-secondary mt-5">
          Lihat proyek
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="overflow-hidden rounded-md border border-line bg-surface">
        {items.map((item) => {
          const key = `${item.type}-${item.id}`;
          const blocked = item.dependencies > 0;
          return (
            <li
              key={key}
              className="flex flex-col gap-3 border-b border-line px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-sm border border-line-strong px-2 py-0.5 text-[11px] text-ink-2">
                    {TYPE_LABEL[item.type]}
                  </span>
                  <p className="truncate text-sm text-ink">{item.label}</p>
                </div>
                <p className="mt-1 text-xs text-ink-3">
                  Dipindahkan {dateFmt.format(new Date(item.trashedAt))}
                </p>
                {item.notes.map((note) => (
                  <p key={note} className="mt-1 text-xs leading-relaxed text-ink-2">
                    {note}
                  </p>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <form action={restoreTrashAction}>
                  <input type="hidden" name="type" value={item.type} />
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="btn btn-secondary">
                    Pulihkan
                  </button>
                </form>

                {blocked ? (
                  <button
                    type="button"
                    disabled
                    title={item.notes.join(" ")}
                    className="focus-ring inline-flex min-h-11 items-center rounded-sm px-3 text-sm text-ink-3 underline decoration-line-strong underline-offset-4"
                  >
                    Hapus permanen
                  </button>
                ) : (
                  <form action={deleteTrashAction}>
                    <input type="hidden" name="type" value={item.type} />
                    <input type="hidden" name="id" value={item.id} />
                    <ConfirmButton
                      title="Hapus permanen?"
                      risk="Item dibuang permanen dan tidak bisa dipulihkan."
                      confirmLabel="Ya, hapus permanen"
                      className="focus-ring inline-flex min-h-11 items-center rounded-sm px-3 text-sm text-ink-2 underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink"
                    >
                      Hapus permanen
                    </ConfirmButton>
                  </form>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-xs leading-relaxed text-ink-3">
        Pemulihan mengembalikan item sebagai draf — terbitkan lagi secara
        eksplisit. Untuk media unggahan, hapus permanen juga membuang berkas
        dari folder unggahan; aset repositori tidak pernah disentuh.
      </p>
    </div>
  );
}
