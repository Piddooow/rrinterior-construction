"use server";

import { redirect } from "next/navigation";
import {
  attachProjectMedia,
  createProject,
  detachProjectMedia,
  moveProjectMedia,
  publishProject,
  restoreProject,
  trashProject,
  unpublishProject,
  updateProject,
  type ProjectInput,
  type ProjectMediaSection,
} from "@/lib/content-admin";
import { requireUser } from "@/lib/admin-auth";
import { revalidatePublicSite } from "@/lib/revalidate";

/**
 * Aksi tulis proyek dari panel. Pola mengikuti panduan Next: setiap aksi
 * memverifikasi sesi lebih dulu (lapisan DAL), error validasi dikembalikan
 * atau dibawa lewat parameter, dan `redirect()` tidak pernah dipanggil di
 * dalam blok try agar sinyal NEXT_REDIRECT tidak tertangkap.
 */

export type SaveProjectState = { error?: string };

function field(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseProjectInput(formData: FormData): ProjectInput {
  const statusRaw = field(formData, "projectStatus");
  const roleRaw = field(formData, "coverRole");
  const yearRaw = field(formData, "yearCompleted");
  const sortRaw = field(formData, "sortOrder");

  return {
    titleEn: field(formData, "titleEn"),
    titleId: field(formData, "titleId"),
    summaryEn: field(formData, "summaryEn"),
    summaryId: field(formData, "summaryId"),
    scopeOfWorkEn: field(formData, "scopeOfWorkEn"),
    scopeOfWorkId: field(formData, "scopeOfWorkId"),
    roomType: field(formData, "roomType"),
    generalLocation: field(formData, "generalLocation"),
    projectStatus:
      statusRaw === "selesai" || statusRaw === "berjalan" ? statusRaw : null,
    // Tahun kosong → null (tidak diisi); angka tidak valid ditolak data layer.
    yearCompleted: yearRaw ? Number.parseInt(yearRaw, 10) : null,
    coverUrl: field(formData, "coverUrl"),
    coverRole:
      roleRaw === "render" || roleRaw === "foto_lapangan" ? roleRaw : null,
    coverAltEn: field(formData, "coverAltEn"),
    coverAltId: field(formData, "coverAltId"),
    sortOrder: sortRaw ? Number.parseInt(sortRaw, 10) : undefined,
  };
}

async function saveFromForm(formData: FormData): Promise<string> {
  const id = field(formData, "id");
  const input = parseProjectInput(formData);
  if (!id || id === "new") {
    const slug = field(formData, "slug");
    if (!slug) throw new Error("Slug wajib diisi untuk proyek baru.");
    const row = await createProject(slug, input);
    return row.id;
  }
  await updateProject(id, input);
  return id;
}

/** Simpan perubahan (tetap pada status sekarang). */
export async function saveProjectAction(
  _prev: SaveProjectState,
  formData: FormData
): Promise<SaveProjectState> {
  await requireUser();
  const id = field(formData, "id");
  let targetId = id ?? "new";
  let created = false;
  try {
    created = !id || id === "new";
    targetId = await saveFromForm(formData);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Gagal menyimpan proyek.",
    };
  }
  revalidatePublicSite();
  redirect(
    `/admin/projects/${targetId}?ok=${created ? "created" : "saved"}`
  );
}

/** Simpan apa pun yang tampak di form, lalu terbitkan. */
export async function publishProjectAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = field(formData, "id");
  let targetId = id ?? "new";
  let failure: string | null = null;
  try {
    targetId = await saveFromForm(formData);
    await publishProject(targetId);
  } catch (error) {
    failure =
      error instanceof Error ? error.message : "Gagal menerbitkan proyek.";
  }
  if (failure) {
    redirect(`/admin/projects/${targetId}?err=${encodeURIComponent(failure)}`);
  }
  revalidatePublicSite();
  redirect(`/admin/projects/${targetId}?ok=published`);
}

/** Tarik proyek terbit kembali ke draf. */
export async function unpublishProjectAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = field(formData, "id") ?? "";
  let failure: string | null = null;
  try {
    await unpublishProject(id);
  } catch (error) {
    failure =
      error instanceof Error ? error.message : "Gagal menarik proyek ke draf.";
  }
  if (failure) {
    redirect(`/admin/projects/${id}?err=${encodeURIComponent(failure)}`);
  }
  revalidatePublicSite();
  redirect(`/admin/projects/${id}?ok=draft`);
}

/** Pindahkan proyek ke Trash (aman; bisa dipulihkan). */
export async function trashProjectAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = field(formData, "id") ?? "";
  let failure: string | null = null;
  try {
    await trashProject(id);
  } catch (error) {
    failure =
      error instanceof Error ? error.message : "Gagal memindahkan ke Trash.";
  }
  if (failure) {
    redirect(`/admin/projects/${id}?err=${encodeURIComponent(failure)}`);
  }
  revalidatePublicSite();
  redirect(`/admin/projects/${id}?ok=trashed`);
}

/** Pulihkan proyek dari Trash sebagai draf. */
export async function restoreProjectAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = field(formData, "id") ?? "";
  let failure: string | null = null;
  try {
    await restoreProject(id);
  } catch (error) {
    failure =
      error instanceof Error ? error.message : "Gagal memulihkan proyek.";
  }
  if (failure) {
    redirect(`/admin/projects/${id}?err=${encodeURIComponent(failure)}`);
  }
  revalidatePublicSite();
  redirect(`/admin/projects/${id}?ok=restored`);
}

/* ------------------------------------------------------------------ */
/* Galeri media proyek (B1-2b)                                        */
/* ------------------------------------------------------------------ */

function readSection(formData: FormData): ProjectMediaSection | null {
  const value = formData.get("section");
  return value === "sebelum" || value === "sesudah" || value === "galeri"
    ? value
    : null;
}

/** Tempelkan media ke galeri proyek. */
export async function attachProjectMediaAction(
  formData: FormData
): Promise<void> {
  await requireUser();
  const projectId = field(formData, "id") ?? "";
  const mediaId = field(formData, "mediaId") ?? "";
  let failure: string | null = null;
  try {
    await attachProjectMedia(projectId, mediaId, readSection(formData));
  } catch (error) {
    failure =
      error instanceof Error ? error.message : "Gagal menempelkan media.";
  }
  if (failure) {
    redirect(
      `/admin/projects/${projectId}?err=${encodeURIComponent(failure)}`
    );
  }
  revalidatePublicSite();
  redirect(`/admin/projects/${projectId}?ok=gallery`);
}

/** Lepas media dari galeri proyek (berkas tetap aman di pustaka). */
export async function detachProjectMediaAction(
  formData: FormData
): Promise<void> {
  await requireUser();
  const projectId = field(formData, "id") ?? "";
  const mediaId = field(formData, "mediaId") ?? "";
  let failure: string | null = null;
  try {
    await detachProjectMedia(projectId, mediaId);
  } catch (error) {
    failure = error instanceof Error ? error.message : "Gagal melepas media.";
  }
  if (failure) {
    redirect(
      `/admin/projects/${projectId}?err=${encodeURIComponent(failure)}`
    );
  }
  revalidatePublicSite();
  redirect(`/admin/projects/${projectId}?ok=gallery`);
}

/** Geser urutan media di galeri (naik/turun satu posisi). */
export async function moveProjectMediaAction(
  formData: FormData
): Promise<void> {
  await requireUser();
  const projectId = field(formData, "id") ?? "";
  const mediaId = field(formData, "mediaId") ?? "";
  const direction = field(formData, "direction") === "naik" ? "naik" : "turun";
  let failure: string | null = null;
  try {
    await moveProjectMedia(projectId, mediaId, direction);
  } catch (error) {
    failure = error instanceof Error ? error.message : "Gagal menggeser media.";
  }
  if (failure) {
    redirect(
      `/admin/projects/${projectId}?err=${encodeURIComponent(failure)}`
    );
  }
  revalidatePublicSite();
  redirect(`/admin/projects/${projectId}?ok=gallery`);
}
