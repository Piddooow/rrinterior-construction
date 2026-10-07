"use client";

import Link from "next/link";
import { useActionState, useEffect, useId } from "react";
import {
  publishServiceAction,
  restoreServiceAction,
  saveServiceAction,
  trashServiceAction,
  unpublishServiceAction,
  type SaveServiceState,
} from "@/app/admin/(panel)/services/actions";
import { showAdminToast } from "@/components/admin-toast";
import { ConfirmButton } from "@/components/admin-confirm";

export type AdminServiceFormValue = {
  id: string;
  slug: string;
  status: "draft" | "published" | "trashed";
  titleEn: string;
  titleId: string;
  descriptionEn: string;
  descriptionId: string;
  sortOrder: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type AdminRevisionRow = {
  id: string;
  status: string;
  createdAt: string;
};

const STATUS_LABEL: Record<AdminServiceFormValue["status"], string> = {
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
  "focus-ring min-h-24 w-full rounded-sm border border-line-strong bg-canvas px-3 py-2 text-sm leading-relaxed text-ink placeholder:text-ink-3 disabled:opacity-60";

/** Editor layanan NYATA: draf → terbit → tarik → Trash → pulihkan. */
export function AdminServiceEditor({
  isNew,
  service,
  revisions,
}: {
  isNew: boolean;
  service: AdminServiceFormValue | null;
  revisions: AdminRevisionRow[];
}) {
  const titleEnId = useId();
  const titleIdId = useId();
  const descEnId = useId();
  const descIdId = useId();
  const orderId = useId();

  const [state, formAction, pending] = useActionState<
    SaveServiceState,
    FormData
  >(saveServiceAction, {});

  // Galat simpan selalu berakhir di popup (R29) — tidak menggantung di
  // "sedang diproses"; pesan tetap inline untuk konteks.
  useEffect(() => {
    if (state.error) showAdminToast("error", state.error);
  }, [state]);

  const status = service?.status ?? "draft";
  const trashed = status === "trashed";
  const published = status === "published";

  return (
    <div className="flex flex-col gap-6">
      <div className="min-w-0">
        <Link
          href="/admin/services"
          className="focus-ring inline-flex min-h-11 items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink lg:min-h-0"
        >
          <span aria-hidden="true">←</span>
          Semua layanan
        </Link>
        <h1 className="mt-2 font-display text-balance text-3xl leading-tight sm:text-4xl">
          {isNew ? "Layanan baru" : "Ubah layanan"}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-2">
          <span className="inline-flex items-center rounded-sm border border-line-strong px-2 py-0.5 text-[11px]">
            {STATUS_LABEL[status]}
          </span>
          {service ? (
            <span className="text-xs text-ink-3">
              /{service.slug} · diperbarui{" "}
              {dateFmt.format(new Date(service.updatedAt))}
            </span>
          ) : (
            <span className="text-xs text-ink-3">
              Slug dibuat otomatis dari judul.
            </span>
          )}
        </p>
      </div>

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
          Layanan ini ada di Trash. Isinya dinonaktifkan sampai dipulihkan;
          pemulihan mengembalikannya sebagai draf.
        </p>
      ) : null}

      <form action={formAction} className="flex flex-col gap-8">
        <input type="hidden" name="id" value={service?.id ?? "new"} />

        <fieldset disabled={trashed} className="flex flex-col gap-6 border-0 p-0">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={titleEnId} className="text-sm text-ink">
                Judul — Inggris
              </label>
              <input
                id={titleEnId}
                name="titleEn"
                defaultValue={service?.titleEn ?? ""}
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
                defaultValue={service?.titleId ?? ""}
                className={inputClass}
              />
              <p className="text-xs text-ink-3">
                Minimal satu bahasa wajib diisi (slug mengikuti judul pertama).
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={descEnId} className="text-sm text-ink">
                Deskripsi — Inggris
              </label>
              <textarea
                id={descEnId}
                name="descriptionEn"
                defaultValue={service?.descriptionEn ?? ""}
                className={areaClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={descIdId} className="text-sm text-ink">
                Deskripsi — Indonesia
              </label>
              <textarea
                id={descIdId}
                name="descriptionId"
                defaultValue={service?.descriptionId ?? ""}
                className={areaClass}
              />
              <p className="text-xs text-ink-3">
                Minimal satu bahasa wajib ada sebelum terbit.
              </p>
            </div>
          </div>

          <div className="max-w-40">
            <label htmlFor={orderId} className="text-sm text-ink">
              Urutan tampil
            </label>
            <input
              id={orderId}
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={service?.sortOrder ?? ""}
              className={`${inputClass} mt-1.5`}
            />
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
              title="Terbitkan layanan?"
              risk="Layanan akan langsung tampil di situs publik."
              confirmLabel="Ya, terbitkan"
              formAction={publishServiceAction}
              className="btn btn-secondary"
            >
              {published ? "Terbitkan ulang" : "Terbitkan"}
            </ConfirmButton>
          ) : null}
          {published ? (
            <ConfirmButton
              title="Tarik ke draf?"
              risk="Layanan ini akan hilang dari situs."
              confirmLabel="Ya, tarik"
              formAction={unpublishServiceAction}
              className="btn btn-secondary"
            >
              Tarik ke draf
            </ConfirmButton>
          ) : null}
          {!isNew && !trashed ? (
            <ConfirmButton
              title="Pindahkan ke Trash?"
              risk="Layanan hilang dari situs dan pindah ke Tempat sampah. Masih bisa dipulihkan."
              confirmLabel="Ya, pindahkan"
              formAction={trashServiceAction}
              className="btn btn-secondary"
            >
              Pindahkan ke Trash
            </ConfirmButton>
          ) : null}
          {trashed ? (
            <button
              type="submit"
              formAction={restoreServiceAction}
              className="btn btn-primary"
            >
              Pulihkan sebagai draf
            </button>
          ) : null}

          {published ? (
            <Link
              href="/id/services"
              target="_blank"
              rel="noopener"
              className="focus-ring inline-flex min-h-11 items-center text-sm text-ink-2 underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink lg:min-h-0"
            >
              Lihat di situs ↗
            </Link>
          ) : null}
        </div>
      </form>

      {service ? (
        <section
          aria-labelledby="service-revisions-title"
          className="rounded-md border border-line bg-surface"
        >
          <div className="border-b border-line px-5 py-4">
            <h2 id="service-revisions-title" className="text-sm font-medium">
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
