"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { AdminSelect } from "@/components/ui/admin-select";
import { ConfirmButton } from "@/components/admin-confirm";
import { showAdminToast } from "@/components/admin-toast";
import {
  MediaPicker,
  type MediaPickerItem,
} from "@/components/admin-media-picker";
import {
  attachProjectMediaAction,
  detachProjectMediaAction,
  moveProjectMediaAction,
  publishProjectAction,
  restoreProjectAction,
  saveProjectAction,
  trashProjectAction,
  unpublishProjectAction,
  type SaveProjectState,
} from "@/app/admin/(panel)/projects/actions";

export type AdminProjectFormValue = {
  id: string;
  slug: string;
  status: "draft" | "published" | "trashed";
  titleEn: string;
  titleId: string;
  summaryEn: string;
  summaryId: string;
  scopeEn: string;
  scopeId: string;
  roomType: string;
  location: string;
  projectStatus: "" | "selesai" | "berjalan";
  year: string;
  sortOrder: string;
  coverUrl: string;
  coverRole: "" | "render" | "foto_lapangan";
  coverAltEn: string;
  coverAltId: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type AdminRevisionRow = {
  id: string;
  status: string;
  createdAt: string;
};

export type AdminGalleryRow = {
  mediaId: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  mediaType: "foto" | "video";
  mediaRole: "render" | "foto_lapangan";
  altEn: string;
  altId: string;
  consent: boolean;
  mediaTrashed: boolean;
  section: "" | "sebelum" | "sesudah" | "galeri";
};

export type AdminGalleryOption = {
  id: string;
  label: string;
};

const STATUS_LABEL: Record<AdminProjectFormValue["status"], string> = {
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

/**
 * Editor proyek NYATA: menyimpan ke basis data, menerbitkan eksplisit,
 * menarik kembali ke draf, dan memindahkan ke Trash — semuanya lewat Server
 * Action dengan verifikasi sesi di sisi server. Pratinjau pribadi tersedia
 * untuk semua status.
 */
export function AdminProjectEditor({
  isNew,
  project,
  revisions,
  gallery,
  coverOptions,
}: {
  isNew: boolean;
  project: AdminProjectFormValue | null;
  revisions: AdminRevisionRow[];
  gallery: { items: AdminGalleryRow[]; options: AdminGalleryOption[] };
  /** Foto pustaka untuk pemilih "URL foto utama" (R25a). */
  coverOptions: MediaPickerItem[];
}) {
  const ids = {
    titleEn: useId(),
    titleId: useId(),
    summaryEn: useId(),
    summaryId: useId(),
    scopeEn: useId(),
    scopeId: useId(),
    roomType: useId(),
    location: useId(),
    projectStatus: useId(),
    year: useId(),
    sortOrder: useId(),
    slug: useId(),
    coverUrl: useId(),
    coverRole: useId(),
    coverAltEn: useId(),
    coverAltId: useId(),
  };

  const [state, formAction, pending] = useActionState<
    SaveProjectState,
    FormData
  >(saveProjectAction, {});

  // Galat simpan selalu berakhir di popup (R29) — tidak menggantung di
  // "sedang diproses"; pesan tetap inline untuk konteks.
  useEffect(() => {
    if (state.error) showAdminToast("error", state.error);
  }, [state]);

  // Pemilih foto utama (R25a): URL dikendalikan state supaya pilihan
  // langsung tampil sebagai pratinjau; input teks tetap tersedia untuk
  // fleksibilitas (menempel URL sendiri).
  const [coverUrl, setCoverUrl] = useState(project?.coverUrl ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerBtnRef = useRef<HTMLButtonElement>(null);

  const status = project?.status ?? "draft";
  const trashed = status === "trashed";
  const published = status === "published";

  return (
    <div className="flex flex-col gap-6">
      <div className="min-w-0">
        <Link
          href="/admin/projects"
          className="focus-ring inline-flex min-h-11 items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink lg:min-h-0"
        >
          <span aria-hidden="true">←</span>
          Semua proyek
        </Link>
        <h1 className="mt-2 font-display text-balance text-3xl leading-tight sm:text-4xl">
          {isNew ? "Proyek baru" : "Ubah proyek"}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-2">
          <span className="inline-flex items-center rounded-sm border border-line-strong px-2 py-0.5 text-[11px]">
            {STATUS_LABEL[status]}
          </span>
          {project ? (
            <span className="text-xs text-ink-3">
              Diperbarui {dateFmt.format(new Date(project.updatedAt))}
              {project.publishedAt
                ? ` · terakhir terbit ${dateFmt.format(new Date(project.publishedAt))}`
                : ""}
            </span>
          ) : (
            <span className="text-xs text-ink-3">
              Simpan dulu sebagai draf; slug akan mengunci URL halaman.
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
          Proyek ini ada di Trash. Isinya dinonaktifkan sampai dipulihkan;
          pemulihan mengembalikannya sebagai draf.
        </p>
      ) : null}

      <form action={formAction} className="flex flex-col gap-8">
        <input type="hidden" name="id" value={project?.id ?? "new"} />

        <fieldset
          disabled={trashed}
          className="flex flex-col gap-6 border-0 p-0"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={ids.slug} className="text-sm text-ink">
                Slug (alamat halaman)
              </label>
              <input
                id={ids.slug}
                name="slug"
                defaultValue={project?.slug ?? ""}
                disabled={!isNew}
                required={isNew}
                placeholder="mis. living-room-nature-classic"
                className={inputClass}
              />
              <p className="text-xs text-ink-3">
                {isNew
                  ? "Wajib diisi — huruf kecil dan tanda hubung; mengunci URL halaman detail."
                  : "Slug tidak bisa diubah setelah dibuat agar tautan lama tetap hidup."}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor={ids.year} className="text-sm text-ink">
                  Tahun selesai
                </label>
                <input
                  id={ids.year}
                  name="yearCompleted"
                  type="number"
                  min={1900}
                  max={2100}
                  defaultValue={project?.year ?? ""}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor={ids.sortOrder} className="text-sm text-ink">
                  Urutan tampil
                </label>
                <input
                  id={ids.sortOrder}
                  name="sortOrder"
                  type="number"
                  min={0}
                  defaultValue={project?.sortOrder ?? ""}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={ids.titleEn} className="text-sm text-ink">
                Judul — Inggris
              </label>
              <input
                id={ids.titleEn}
                name="titleEn"
                defaultValue={project?.titleEn ?? ""}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={ids.titleId} className="text-sm text-ink">
                Judul — Indonesia
              </label>
              <input
                id={ids.titleId}
                name="titleId"
                defaultValue={project?.titleId ?? ""}
                className={inputClass}
              />
              <p className="text-xs text-ink-3">
                Minimal satu bahasa wajib diisi.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={ids.summaryEn} className="text-sm text-ink">
                Ringkasan — Inggris
              </label>
              <textarea
                id={ids.summaryEn}
                name="summaryEn"
                defaultValue={project?.summaryEn ?? ""}
                className={areaClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={ids.summaryId} className="text-sm text-ink">
                Ringkasan — Indonesia
              </label>
              <textarea
                id={ids.summaryId}
                name="summaryId"
                defaultValue={project?.summaryId ?? ""}
                className={areaClass}
              />
              <p className="text-xs text-ink-3">
                Minimal satu bahasa wajib ada sebelum terbit.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={ids.scopeEn} className="text-sm text-ink">
                Lingkup kerja — Inggris
              </label>
              <input
                id={ids.scopeEn}
                name="scopeOfWorkEn"
                defaultValue={project?.scopeEn ?? ""}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={ids.scopeId} className="text-sm text-ink">
                Lingkup kerja — Indonesia
              </label>
              <input
                id={ids.scopeId}
                name="scopeOfWorkId"
                defaultValue={project?.scopeId ?? ""}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={ids.roomType} className="text-sm text-ink">
                Jenis ruang
              </label>
              <input
                id={ids.roomType}
                name="roomType"
                defaultValue={project?.roomType ?? ""}
                placeholder="mis. kitchen"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={ids.location} className="text-sm text-ink">
                Lokasi umum
              </label>
              <input
                id={ids.location}
                name="generalLocation"
                defaultValue={project?.location ?? ""}
                placeholder="mis. Tangerang"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={ids.projectStatus} className="text-sm text-ink">
                Status proyek
              </label>
              <AdminSelect
                id={ids.projectStatus}
                name="projectStatus"
                defaultValue={project?.projectStatus ?? ""}
                ariaLabel="Status proyek"
                options={[
                  { value: "", label: "— belum ditentukan —" },
                  { value: "selesai", label: "Selesai" },
                  { value: "berjalan", label: "Sedang berjalan" },
                ]}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={ids.coverUrl} className="text-sm text-ink">
                URL foto utama
              </label>
              <div className="flex items-stretch gap-2">
                <input
                  id={ids.coverUrl}
                  name="coverUrl"
                  value={coverUrl}
                  onChange={(event) => setCoverUrl(event.target.value)}
                  placeholder="/work/nama-proyek/01.webp"
                  className={inputClass}
                />
                <button
                  ref={pickerBtnRef}
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="btn btn-secondary shrink-0"
                >
                  Pilih foto
                </button>
              </div>
              {coverUrl ? (
                <span className="mt-1 flex items-center gap-3">
                  <span className="relative block h-16 w-24 shrink-0 overflow-hidden rounded-sm border border-line bg-subtle">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  </span>
                  <span className="text-xs leading-relaxed text-ink-3">
                    Foto utama terpilih. Klik &ldquo;Pilih foto&rdquo; untuk
                    menggantinya.
                  </span>
                </span>
              ) : (
                <span className="text-xs leading-relaxed text-ink-3">
                  Belum ada foto — klik &ldquo;Pilih foto&rdquo; dari pustaka,
                  atau tempel URL sendiri.
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={ids.coverRole} className="text-sm text-ink">
                Peran cover
              </label>
              <AdminSelect
                id={ids.coverRole}
                name="coverRole"
                defaultValue={project?.coverRole ?? ""}
                ariaLabel="Peran cover"
                options={[
                  { value: "", label: "— belum ditentukan —" },
                  { value: "render", label: "Render" },
                  { value: "foto_lapangan", label: "Foto lapangan" },
                ]}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={ids.coverAltEn} className="text-sm text-ink">
                Teks alternatif cover — Inggris
              </label>
              <input
                id={ids.coverAltEn}
                name="coverAltEn"
                defaultValue={project?.coverAltEn ?? ""}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={ids.coverAltId} className="text-sm text-ink">
                Teks alternatif cover — Indonesia
              </label>
              <input
                id={ids.coverAltId}
                name="coverAltId"
                defaultValue={project?.coverAltId ?? ""}
                className={inputClass}
              />
            </div>
          </div>

          <MediaPicker
            open={pickerOpen}
            items={coverOptions}
            title="Pilih foto utama"
            onClose={() => {
              setPickerOpen(false);
              pickerBtnRef.current?.focus();
            }}
            onSelect={(item) => setCoverUrl(item.fileUrl)}
          />
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
              title="Terbitkan proyek?"
              risk="Proyek akan langsung tampil di situs publik."
              confirmLabel="Ya, terbitkan"
              formAction={publishProjectAction}
              className="btn btn-secondary"
            >
              {published ? "Terbitkan ulang" : "Terbitkan"}
            </ConfirmButton>
          ) : null}
          {published ? (
            <ConfirmButton
              title="Tarik ke draf?"
              risk="Halaman publik proyek ini akan hilang dari situs."
              confirmLabel="Ya, tarik"
              formAction={unpublishProjectAction}
              className="btn btn-secondary"
            >
              Tarik ke draf
            </ConfirmButton>
          ) : null}
          {!isNew && !trashed ? (
            <ConfirmButton
              title="Pindahkan ke Trash?"
              risk="Proyek hilang dari situs dan pindah ke Tempat sampah. Masih bisa dipulihkan."
              confirmLabel="Ya, pindahkan"
              formAction={trashProjectAction}
              className="btn btn-secondary"
            >
              Pindahkan ke Trash
            </ConfirmButton>
          ) : null}
          {trashed ? (
            <button type="submit" formAction={restoreProjectAction} className="btn btn-primary">
              Pulihkan sebagai draf
            </button>
          ) : null}

          {!isNew && project ? (
            <span className="flex flex-wrap items-center gap-4 text-sm">
              <Link
                href={`/admin/projects/${project.id}/preview`}
                className="focus-ring inline-flex min-h-11 items-center text-ink-2 underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink lg:min-h-0"
              >
                Pratinjau pribadi
              </Link>
              {published ? (
                <Link
                  href={`/id/projects/${project.slug}`}
                  target="_blank"
                  rel="noopener"
                  className="focus-ring inline-flex min-h-11 items-center text-ink-2 underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink lg:min-h-0"
                >
                  Lihat di situs ↗
                </Link>
              ) : (
                <span className="text-xs text-ink-3">
                  {trashed
                    ? "Tidak tampil di situs selama di Trash."
                    : "Tampil di situs setelah diterbitkan."}
                </span>
              )}
            </span>
          ) : null}
        </div>
      </form>

      {project ? (
        <ProjectGallerySection
          projectId={project.id}
          items={gallery.items}
          options={gallery.options}
          readOnly={trashed}
        />
      ) : null}

      {project ? (
        <section
          aria-labelledby="revisions-title"
          className="rounded-md border border-line bg-surface"
        >
          <div className="border-b border-line px-5 py-4">
            <h2 id="revisions-title" className="text-sm font-medium">
              Riwayat publikasi
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-3">
              Snapshot tersimpan setiap kali status publik berubah (terbit /
              dipindah ke Trash) — untuk penelusuran, bukan untuk dipulihkan
              otomatis.
            </p>
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

const SECTION_LABEL: Record<string, string> = {
  sebelum: "Sebelum",
  sesudah: "Sesudah",
  galeri: "Galeri",
};

/**
 * Relasi galeri proyek: daftar media urut tampil + tempel/lepas/geser.
 * Aksi galeri tersedia selama proyek tidak di Trash; media tanpa izin tayang
 * boleh ditempel sebagai persiapan tetapi tidak tampil ke pengunjung.
 */
function ProjectGallerySection({
  projectId,
  items,
  options,
  readOnly,
}: {
  projectId: string;
  items: AdminGalleryRow[];
  options: AdminGalleryOption[];
  readOnly: boolean;
}) {
  const smallButton =
    "focus-ring inline-flex min-h-9 items-center rounded-sm border border-line-strong px-2.5 text-xs text-ink-2 transition-colors hover:bg-hover-surface hover:text-ink";

  return (
    <section
      aria-labelledby="gallery-title"
      className="rounded-md border border-line bg-surface"
    >
      <div className="border-b border-line px-5 py-4">
        <h2 id="gallery-title" className="text-sm font-medium">
          Galeri media ({items.length})
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-3">
          Urutan di sini menentukan urutan tampil di halaman proyek publik.
          Hanya media berizin tayang yang dilihat pengunjung; media tanpa izin
          tetap tersimpan sebagai persiapan.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="px-5 py-4 text-sm text-ink-3">
          Belum ada media di galeri proyek ini.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {items.map((item) => {
            const name = item.fileUrl.split("/").pop() ?? item.fileUrl;
            const alt = item.altEn || item.altId || name;
            return (
              <li
                key={item.mediaId}
                className="flex flex-wrap items-center gap-4 px-5 py-3"
              >
                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-sm border border-line bg-subtle">
                  {item.mediaType === "video" && !item.thumbnailUrl ? (
                    <span className="flex h-full items-center justify-center text-[10px] text-ink-3">
                      Video
                    </span>
                  ) : (
                    <Image
                      src={item.thumbnailUrl ?? item.fileUrl}
                      alt={alt}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{name}</p>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-3">
                    <span>
                      {item.mediaRole === "render"
                        ? "Render"
                        : "Foto lapangan"}
                    </span>
                    <span>
                      · {item.section ? SECTION_LABEL[item.section] : "Tanpa seksi"}
                    </span>
                    {!item.consent ? (
                      <span className="text-ink-2">
                        · belum berizin (tidak tampil publik)
                      </span>
                    ) : null}
                    {item.mediaTrashed ? (
                      <span className="text-ink-2">· media di Trash</span>
                    ) : null}
                  </p>
                </div>
                {!readOnly ? (
                  <form
                    action={moveProjectMediaAction}
                    className="flex items-center gap-2"
                  >
                    <input type="hidden" name="id" value={projectId} />
                    <input type="hidden" name="mediaId" value={item.mediaId} />
                    <button
                      type="submit"
                      name="direction"
                      value="naik"
                      className={smallButton}
                    >
                      Naik
                    </button>
                    <button
                      type="submit"
                      name="direction"
                      value="turun"
                      className={smallButton}
                    >
                      Turun
                    </button>
                    <button
                      type="submit"
                      formAction={detachProjectMediaAction}
                      className={smallButton}
                    >
                      Lepas
                    </button>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {!readOnly ? (
        <form
          action={attachProjectMediaAction}
          className="flex flex-wrap items-end gap-3 border-t border-line px-5 py-4"
        >
          <input type="hidden" name="id" value={projectId} />
          <div className="min-w-0 flex-1 basis-64">
            <label htmlFor="gallery-media" className="text-xs text-ink-3">
              Media dari pustaka
            </label>
            <AdminSelect
              id="gallery-media"
              name="mediaId"
              defaultValue=""
              className="mt-1"
              ariaLabel="Media dari pustaka"
              options={[
                { value: "", label: "— pilih media —", disabled: true },
                ...options.map((option) => ({ value: option.id, label: option.label })),
              ]}
            />
          </div>
          <div>
            <label htmlFor="gallery-section" className="text-xs text-ink-3">
              Seksi
            </label>
            <AdminSelect
              id="gallery-section"
              name="section"
              defaultValue="galeri"
              className="mt-1"
              ariaLabel="Seksi"
              options={[
                { value: "galeri", label: "Galeri" },
                { value: "sebelum", label: "Sebelum" },
                { value: "sesudah", label: "Sesudah" },
                { value: "", label: "Tanpa seksi" },
              ]}
            />
          </div>
          <button
            type="submit"
            disabled={options.length === 0}
            className="btn btn-secondary disabled:opacity-60"
          >
            Tambahkan
          </button>
        </form>
      ) : null}
    </section>
  );
}
