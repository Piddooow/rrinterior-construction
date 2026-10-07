"use client";

import Link from "next/link";
import { useActionState, useEffect, useId } from "react";
import {
  publishPageAction,
  restorePageAction,
  savePageAction,
  trashPageAction,
  unpublishPageAction,
  type SavePageState,
} from "@/app/admin/(panel)/pages/actions";
import { showAdminToast } from "@/components/admin-toast";
import { ConfirmButton } from "@/components/admin-confirm";

export type AdminPageFormValue = {
  id: string;
  slug: string;
  status: "draft" | "published" | "trashed";
  titleEn: string;
  titleId: string;
  bodyEn: string;
  bodyId: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type AdminPageRevisionRow = {
  id: string;
  status: string;
  createdAt: string;
};

const STATUS_LABEL: Record<AdminPageFormValue["status"], string> = {
  published: "Terbit",
  draft: "Draf",
  trashed: "Trash",
};

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const inputClass =
  "focus-ring h-11 w-full rounded-sm border border-line-strong bg-canvas px-3 text-sm text-ink placeholder:text-ink-3 disabled:opacity-60";
const areaClass =
  "focus-ring min-h-40 w-full rounded-sm border border-line-strong bg-canvas px-3 py-2 text-sm leading-relaxed text-ink placeholder:text-ink-3 disabled:opacity-60";

/**
 * Editor halaman teks NYATA (Tentang/Privasi dsb. untuk penyuntingan tanpa
 * kode). Catatan jujur: rute publik yang merender isi ini belum tersambung —
 * penyambungan menunggu keputusan RR.
 */
export function AdminPageEditor({
  isNew,
  page,
  revisions,
}: {
  isNew: boolean;
  page: AdminPageFormValue | null;
  revisions: AdminPageRevisionRow[];
}) {
  const slugId = useId();
  const titleEnId = useId();
  const titleIdId = useId();
  const bodyEnId = useId();
  const bodyIdId = useId();

  const [state, formAction, pending] = useActionState<SavePageState, FormData>(
    savePageAction,
    {}
  );

  // Galat simpan selalu berakhir di popup (R29) — tidak menggantung di
  // "sedang diproses"; pesan tetap inline untuk konteks.
  useEffect(() => {
    if (state.error) showAdminToast("error", state.error);
  }, [state]);

  const status = page?.status ?? "draft";
  const trashed = status === "trashed";
  const published = status === "published";

  return (
    <div className="flex flex-col gap-6">
      <div className="min-w-0">
        <Link
          href="/admin/pages"
          className="focus-ring inline-flex min-h-11 items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink lg:min-h-0"
        >
          <span aria-hidden="true">←</span>
          Semua halaman
        </Link>
        <h1 className="mt-2 font-display text-balance text-3xl leading-tight sm:text-4xl">
          {isNew ? "Halaman baru" : "Ubah halaman"}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-2">
          <span className="inline-flex items-center rounded-sm border border-line-strong px-2 py-0.5 text-[11px]">
            {STATUS_LABEL[status]}
          </span>
          {page ? (
            <span className="text-xs text-ink-3">
              /{page.slug} · diperbarui{" "}
              {dateFmt.format(new Date(page.updatedAt))}
            </span>
          ) : null}
        </p>
      </div>

      <p className="rounded-md border border-line bg-subtle px-4 py-3 text-xs leading-relaxed text-ink-2">
        Isi halaman tersimpan di basis data. Rute publik yang menampilkannya
        belum tersambung (Tentang/Privasi saat ini memakai kamus bawaan) —
        penyambungan menunggu keputusan RR; draf tetap bisa disiapkan dari
        sekarang.
      </p>

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-line bg-canvas px-4 py-3 text-sm text-ink"
        >
          {state.error}
        </p>
      ) : null}
      {trashed ? (
        <p className="rounded-md border border-line bg-subtle px-4 py-3 text-sm leading-relaxed text-ink-2">
          Halaman ini ada di Trash. Isinya dinonaktifkan sampai dipulihkan;
          pemulihan mengembalikannya sebagai draf.
        </p>
      ) : null}

      <form action={formAction} className="flex flex-col gap-8">
        <input type="hidden" name="id" value={page?.id ?? "new"} />

        <fieldset disabled={trashed} className="flex flex-col gap-6 border-0 p-0">
          <div className="max-w-md">
            <label htmlFor={slugId} className="text-sm text-ink">
              Slug (alamat halaman)
            </label>
            <input
              id={slugId}
              name="slug"
              defaultValue={page?.slug ?? ""}
              disabled={!isNew}
              required={isNew}
              placeholder="mis. tentang-rr"
              className={`${inputClass} mt-1.5`}
            />
            <p className="mt-1.5 text-xs text-ink-3">
              {isNew
                ? "Wajib diisi — huruf kecil dan tanda hubung; mengunci alamat halaman."
                : "Slug tidak bisa diubah setelah dibuat."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={titleEnId} className="text-sm text-ink">
                Judul — Inggris
              </label>
              <input
                id={titleEnId}
                name="titleEn"
                defaultValue={page?.titleEn ?? ""}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={titleIdId} className="text-sm text-ink">
                Judul — Indonesia
              </label>
              <input
                id={titleIdId}
                name="titleId"
                defaultValue={page?.titleId ?? ""}
                className={inputClass}
              />
              <p className="text-xs text-ink-3">
                Minimal satu bahasa wajib diisi.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={bodyEnId} className="text-sm text-ink">
                Isi — Inggris
              </label>
              <textarea
                id={bodyEnId}
                name="bodyEn"
                defaultValue={page?.bodyEn ?? ""}
                className={areaClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={bodyIdId} className="text-sm text-ink">
                Isi — Indonesia
              </label>
              <textarea
                id={bodyIdId}
                name="bodyId"
                defaultValue={page?.bodyId ?? ""}
                className={areaClass}
              />
              <p className="text-xs text-ink-3">
                Minimal satu bahasa wajib ada sebelum terbit.
              </p>
            </div>
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <button
            type="submit"
            disabled={trashed || pending}
            className="btn btn-primary disabled:cursor-wait disabled:opacity-70"
          >
            {pending ? "Menyimpan…" : "Simpan"}
          </button>

          {!isNew && !trashed ? (
            <ConfirmButton
              title="Terbitkan halaman?"
              risk="Halaman akan langsung tampil di situs publik."
              confirmLabel="Ya, terbitkan"
              formAction={publishPageAction}
              className="btn btn-secondary"
            >
              {published ? "Terbitkan ulang" : "Terbitkan"}
            </ConfirmButton>
          ) : null}
          {published ? (
            <ConfirmButton
              title="Tarik ke draf?"
              risk="Halaman ini akan hilang dari situs."
              confirmLabel="Ya, tarik"
              formAction={unpublishPageAction}
              className="btn btn-secondary"
            >
              Tarik ke draf
            </ConfirmButton>
          ) : null}
          {!isNew && !trashed ? (
            <ConfirmButton
              title="Pindahkan ke Trash?"
              risk="Halaman hilang dari situs dan pindah ke Tempat sampah. Masih bisa dipulihkan."
              confirmLabel="Ya, pindahkan"
              formAction={trashPageAction}
              className="btn btn-secondary"
            >
              Pindahkan ke Trash
            </ConfirmButton>
          ) : null}
          {trashed ? (
            <button
              type="submit"
              formAction={restorePageAction}
              className="btn btn-primary"
            >
              Pulihkan sebagai draf
            </button>
          ) : null}
        </div>
      </form>

      {page ? (
        <section
          aria-labelledby="page-revisions-title"
          className="rounded-md border border-line bg-surface"
        >
          <div className="border-b border-line px-5 py-4">
            <h2 id="page-revisions-title" className="text-sm font-medium">
              Riwayat publikasi
            </h2>
          </div>
          {revisions.length === 0 ? (
            <p className="px-5 py-4 text-sm text-ink-3">
              Belum ada riwayat — akan terisi setelah penerbitan pertama.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {revisions.map((revision) => (
                <li
                  key={revision.id}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3 text-sm"
                >
                  <span className="text-ink-2">
                    {revision.status === "published"
                      ? "Diterbitkan"
                      : "Dipindahkan ke Trash"}
                  </span>
                  <span className="text-xs text-ink-3">
                    {dateFmt.format(new Date(revision.createdAt))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
