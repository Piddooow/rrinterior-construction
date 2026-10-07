"use client";

import Image from "next/image";
import { useActionState, useEffect, useId, useState } from "react";
import { AdminSelect } from "@/components/ui/admin-select";
import { ConfirmButton } from "@/components/admin-confirm";
import { showAdminToast } from "@/components/admin-toast";
import {
  trashMediaAction,
  updateMediaAction,
  uploadMediaAction,
  type UploadState,
} from "@/app/admin/(panel)/media/actions";

export type AdminMediaRow = {
  id: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  /** Nama ramah operator (R25b); kosong = tampil pakai nama berkas. */
  name: string;
  mediaType: "foto" | "video";
  mediaRole: "render" | "foto_lapangan";
  altEn: string;
  altId: string;
  captionEn: string;
  captionId: string;
  credit: string;
  consent: boolean;
  mimeType: string;
  fileSize: number;
  /** ISO string agar aman melewati batas server → klien. */
  createdAt: string;
};

const ROLE_LABEL: Record<AdminMediaRow["mediaRole"], string> = {
  render: "Render",
  foto_lapangan: "Foto lapangan",
};

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const fileName = (url: string) => url.split("/").pop() ?? url;

type TypeFilter = "Semua" | "foto" | "video";
type RoleFilter = "Semua" | "render" | "foto_lapangan";
type ConsentFilter = "Semua" | "ya" | "belum";

const inputClass =
  "focus-ring h-11 w-full rounded-sm border border-line-strong bg-canvas px-3 text-sm text-ink placeholder:text-ink-3";
const labelClass = "text-xs text-ink-3";

/**
 * Pustaka media NYATA: unggah lewat Server Action (jenis & ukuran divalidasi
 * server), cari/saring, dan ubah metadata per berkas — peran, teks alternatif,
 * caption, kredit, serta izin tayang. Media baru selalu masuk tanpa izin
 * tayang sampai disetujui.
 */
export function AdminMediaLibrary({ items }: { items: AdminMediaRow[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("Semua");
  const [role, setRole] = useState<RoleFilter>("Semua");
  const [consent, setConsent] = useState<ConsentFilter>("Semua");
  const [openId, setOpenId] = useState<string | null>(null);

  const needle = query.trim().toLowerCase();
  const filtered = items.filter((item) => {
    if (type !== "Semua" && item.mediaType !== type) return false;
    if (role !== "Semua" && item.mediaRole !== role) return false;
    if (consent === "ya" && !item.consent) return false;
    if (consent === "belum" && item.consent) return false;
    if (!needle) return true;
    return [
      fileName(item.fileUrl),
      item.altEn,
      item.altId,
      item.captionEn,
      item.captionId,
      item.credit,
    ]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  return (
    <div className="flex flex-col gap-8">
      <UploadPanel />

      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-1">
            <label htmlFor="media-search" className={labelClass}>
              Cari media
            </label>
            <input
              id="media-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nama berkas, alt, kredit"
              className={inputClass}
            />
          </div>
          <FilterGroup
            label="Jenis"
            value={type}
            options={[
              ["Semua", "Semua"],
              ["foto", "Foto"],
              ["video", "Video"],
            ]}
            onChange={(value) => setType(value as TypeFilter)}
          />
          <FilterGroup
            label="Peran"
            value={role}
            options={[
              ["Semua", "Semua"],
              ["render", "Render"],
              ["foto_lapangan", "Foto lapangan"],
            ]}
            onChange={(value) => setRole(value as RoleFilter)}
          />
          <FilterGroup
            label="Izin tayang"
            value={consent}
            options={[
              ["Semua", "Semua"],
              ["ya", "Sudah"],
              ["belum", "Belum"],
            ]}
            onChange={(value) => setConsent(value as ConsentFilter)}
          />
        </div>

        <p aria-live="polite" className="text-sm text-ink-3">
          {filtered.length} dari {items.length} media
        </p>

        {items.length === 0 ? (
          <div className="rounded-md border border-line bg-subtle px-6 py-10 text-center">
            <p className="font-display text-xl leading-snug">
              Pustaka media masih kosong.
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-2">
              Unggah berkas pertama di panel atas; media masuk tanpa izin
              tayang sampai tim menyetujuinya.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-md border border-line bg-subtle px-6 py-10 text-center">
            <p className="font-display text-xl leading-snug">
              Tidak ada media yang cocok.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setType("Semua");
                setRole("Semua");
                setConsent("Semua");
              }}
              className="btn btn-secondary mt-5"
            >
              Bersihkan saringan
            </button>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => {
              const open = openId === item.id;
              const alt = item.altEn || item.altId || fileName(item.fileUrl);
              return (
                <li
                  key={item.id}
                  className="overflow-hidden rounded-md border border-line bg-surface"
                >
                  <figure className="relative aspect-[4/3] bg-subtle">
                    {item.mediaType === "video" && !item.thumbnailUrl ? (
                      <div className="flex h-full items-center justify-center text-sm text-ink-3">
                        Video — tanpa bingkai pratinjau
                      </div>
                    ) : (
                      <Image
                        src={item.thumbnailUrl ?? item.fileUrl}
                        alt={alt}
                        fill
                        sizes="(min-width: 1280px) 360px, (min-width: 640px) 45vw, 92vw"
                        className="object-cover"
                      />
                    )}
                    <figcaption className="absolute left-3 top-3 flex items-center gap-2">
                      <span className="label-plate">
                        {ROLE_LABEL[item.mediaRole]}
                      </span>
                      {item.mediaType === "video" ? (
                        <span className="label-plate">Video</span>
                      ) : null}
                    </figcaption>
                  </figure>

                  <div className="flex items-start justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink">
                        {item.name || fileName(item.fileUrl)}
                      </p>
                      <p className="text-xs text-ink-3">
                        {item.name ? `${fileName(item.fileUrl)} · ` : ""}
                        {item.mediaType === "foto" ? "Foto" : "Video"} ·{" "}
                        {formatSize(item.fileSize)} ·{" "}
                        {dateFmt.format(new Date(item.createdAt))}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-sm border px-2 py-0.5 text-[11px] ${
                        item.consent
                          ? "border-line-strong text-ink"
                          : "border-line-strong text-ink-2"
                      }`}
                    >
                      {item.consent ? "Izin tayang" : "Belum berizin"}
                    </span>
                  </div>

                  <div className="border-t border-line px-4 py-3">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenId(open ? null : item.id)}
                      className="focus-ring inline-flex min-h-11 items-center text-sm text-ink-2 underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink"
                    >
                      {open ? "Tutup pengaturan" : "Ubah pengaturan"}
                    </button>

                    {open ? (
                      <form
                        action={updateMediaAction}
                        className="mt-4 flex flex-col gap-4 border-t border-line pt-4"
                      >
                        <input type="hidden" name="id" value={item.id} />
                        <div className="flex flex-col gap-1">
                          <label htmlFor={`name-${item.id}`} className={labelClass}>
                            Nama (tampil di pustaka &amp; pemilih foto)
                          </label>
                          <input
                            id={`name-${item.id}`}
                            name="name"
                            defaultValue={item.name}
                            placeholder={fileName(item.fileUrl)}
                            className={inputClass}
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="flex flex-col gap-1">
                            <label
                              htmlFor={`role-${item.id}`}
                              className={labelClass}
                            >
                              Peran
                            </label>
                            <AdminSelect
                              id={`role-${item.id}`}
                              name="mediaRole"
                              defaultValue={item.mediaRole}
                              ariaLabel="Peran"
                              options={[
                                { value: "render", label: "Render" },
                                { value: "foto_lapangan", label: "Foto lapangan" },
                              ]}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label
                              htmlFor={`credit-${item.id}`}
                              className={labelClass}
                            >
                              Kredit (opsional)
                            </label>
                            <input
                              id={`credit-${item.id}`}
                              name="credit"
                              defaultValue={item.credit}
                              className={inputClass}
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="flex flex-col gap-1">
                            <label
                              htmlFor={`alt-en-${item.id}`}
                              className={labelClass}
                            >
                              Teks alternatif — Inggris
                            </label>
                            <input
                              id={`alt-en-${item.id}`}
                              name="altTextEn"
                              defaultValue={item.altEn}
                              className={inputClass}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label
                              htmlFor={`alt-id-${item.id}`}
                              className={labelClass}
                            >
                              Teks alternatif — Indonesia
                            </label>
                            <input
                              id={`alt-id-${item.id}`}
                              name="altTextId"
                              defaultValue={item.altId}
                              className={inputClass}
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="flex flex-col gap-1">
                            <label
                              htmlFor={`caption-en-${item.id}`}
                              className={labelClass}
                            >
                              Caption — Inggris (opsional)
                            </label>
                            <input
                              id={`caption-en-${item.id}`}
                              name="captionEn"
                              defaultValue={item.captionEn}
                              className={inputClass}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label
                              htmlFor={`caption-id-${item.id}`}
                              className={labelClass}
                            >
                              Caption — Indonesia (opsional)
                            </label>
                            <input
                              id={`caption-id-${item.id}`}
                              name="captionId"
                              defaultValue={item.captionId}
                              className={inputClass}
                            />
                          </div>
                        </div>
                        <label className="flex min-h-11 items-center gap-2 text-sm text-ink-2">
                          <input
                            type="checkbox"
                            name="consent"
                            defaultChecked={item.consent}
                            className="h-4 w-4 accent-[var(--color-primary)]"
                          />
                          Sudah aman dipublikasikan (izin tayang)
                        </label>

                        <div className="flex flex-wrap items-center gap-3">
                          <button type="submit" className="btn btn-primary">
                            Simpan
                          </button>
                          <ConfirmButton
                            title="Pindahkan media ke Trash?"
                            risk="Media pindah ke Tempat sampah. Proyek yang memakainya bisa kehilangan gambar."
                            confirmLabel="Ya, pindahkan"
                            formAction={trashMediaAction}
                            className="btn btn-secondary"
                          >
                            Pindahkan ke Trash
                          </ConfirmButton>
                        </div>
                      </form>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className={labelClass}>{label}</span>
      <AdminSelect
        value={value}
        onChange={onChange}
        ariaLabel={label}
        options={options.map(([optionValue, optionLabel]) => ({
          value: optionValue,
          label: optionLabel,
        }))}
      />
    </div>
  );
}

/**
 * Panel unggah nyata. Berkas dikirim ke Server Action; validasi jenis & ukuran
 * ada di server (JPG/PNG/WebP maks 10MB, MP4 maks 100MB). Nama penyimpanan
 * dibuat server — nama dari pengguna tidak pernah dipakai.
 */
function UploadPanel() {
  const [state, formAction, pending] = useActionState<UploadState, FormData>(
    uploadMediaAction,
    {}
  );
  const fileId = useId();

  // Hasil selalu berakhir di popup (R29): sukses maupun galat — pesan galat
  // tetap tampil inline di bawah form untuk konteks.
  useEffect(() => {
    if (state.ok) showAdminToast("success", state.ok);
    if (state.error) showAdminToast("error", state.error);
  }, [state]);

  return (
    <section
      aria-labelledby="upload-title"
      className="rounded-md border border-line bg-surface p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="upload-title" className="text-sm font-medium">
          Unggah media
        </h2>
        <span className="rounded-sm border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-3">
          Tersimpan aman
        </span>
      </div>

      <form action={formAction} className="mt-4 flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor={fileId} className={labelClass}>
              Berkas (JPG/PNG/WebP maks 10MB · MP4 maks 100MB)
            </label>
            <input
              id={fileId}
              type="file"
              name="file"
              required
              accept="image/jpeg,image/png,image/webp,video/mp4"
              className="focus-ring min-h-11 w-full rounded-sm border border-line-strong bg-canvas px-3 py-2 text-sm text-ink-2 file:mr-3 file:rounded-sm file:border-0 file:bg-subtle file:px-3 file:py-1.5 file:text-sm file:text-ink"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="upload-role" className={labelClass}>
              Peran
            </label>
            <AdminSelect
              id="upload-role"
              name="mediaRole"
              defaultValue="render"
              ariaLabel="Peran"
              options={[
                { value: "render", label: "Render" },
                { value: "foto_lapangan", label: "Foto lapangan" },
              ]}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="upload-alt-en" className={labelClass}>
              Teks alternatif — Inggris
            </label>
            <input
              id="upload-alt-en"
              name="altTextEn"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="upload-alt-id" className={labelClass}>
              Teks alternatif — Indonesia
            </label>
            <input
              id="upload-alt-id"
              name="altTextId"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="upload-credit" className={labelClass}>
              Kredit (opsional)
            </label>
            <input
              id="upload-credit"
              name="credit"
              className={inputClass}
            />
          </div>
        </div>

        <label className="flex min-h-11 items-center gap-2 text-sm text-ink-2">
          <input
            type="checkbox"
            name="consent"
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          Sudah aman dipublikasikan (izin tayang)
        </label>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary disabled:cursor-wait disabled:opacity-70"
          >
            {pending ? "Mengunggah…" : "Unggah"}
          </button>
          <p className="text-xs leading-relaxed text-ink-3">
            Tanpa centang izin tayang, media tersimpan di pustaka tetapi tidak
            pernah tampil di situs sampai disetujui.
          </p>
        </div>
      </form>

      {state.error ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-line bg-canvas px-4 py-3 text-sm text-ink"
        >
          {state.error}
        </p>
      ) : null}
    </section>
  );
}
