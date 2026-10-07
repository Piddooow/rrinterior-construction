"use server";

import { redirect } from "next/navigation";
import { trashMediaAsset, updateMediaAsset } from "@/lib/content-admin";
import { uploadMedia } from "@/lib/media-upload";
import { revalidatePublicSite } from "@/lib/revalidate";

/**
 * Server Actions pustaka media: unggah (validasi jenis & ukuran di
 * lib/media-upload.ts), ubah metadata (peran, alt, caption, kredit, izin
 * tayang), dan pindah ke Trash. Semua sisi server; sesi diverifikasi oleh
 * penjaga layout panel (DAL).
 */

export type UploadState = { error?: string; ok?: string };

function field(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function uploadMediaAction(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Pilih berkas foto atau video dulu." };
  }
  const roleRaw = field(formData, "mediaRole");
  if (roleRaw !== "render" && roleRaw !== "foto_lapangan") {
    return { error: "Pilih peran media: render atau foto lapangan." };
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const row = await uploadMedia({
      mimeType: file.type,
      bytes,
      mediaRole: roleRaw,
      name: file.name,
      altTextEn: field(formData, "altTextEn"),
      altTextId: field(formData, "altTextId"),
      credit: field(formData, "credit"),
      consentConfirmed: formData.get("consent") === "on",
    });
    revalidatePublicSite();
    const name = row.fileUrl.split("/").pop() ?? row.fileUrl;
    return {
      ok: `"${name}" tersimpan. ${
        row.consentConfirmed
          ? "Izin tayang sudah dicatat."
          : "Izin tayang belum diberikan — lengkapi di kartu media bila sudah aman dipublikasikan."
      }`,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Gagal mengunggah berkas.",
    };
  }
}

export async function updateMediaAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  let failure: string | null = null;
  try {
    const roleRaw = field(formData, "mediaRole");
    await updateMediaAsset(id, {
      name: field(formData, "name"),
      mediaRole:
        roleRaw === "render" || roleRaw === "foto_lapangan"
          ? roleRaw
          : undefined,
      altTextEn: field(formData, "altTextEn"),
      altTextId: field(formData, "altTextId"),
      captionEn: field(formData, "captionEn"),
      captionId: field(formData, "captionId"),
      credit: field(formData, "credit"),
      consentConfirmed: formData.get("consent") === "on",
    });
  } catch (error) {
    failure = error instanceof Error ? error.message : "Gagal menyimpan media.";
  }
  if (failure) {
    redirect(`/admin/media?err=${encodeURIComponent(failure)}`);
  }
  revalidatePublicSite();
  redirect("/admin/media?ok=updated");
}

export async function trashMediaAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  let failure: string | null = null;
  try {
    await trashMediaAsset(id);
  } catch (error) {
    failure =
      error instanceof Error ? error.message : "Gagal memindahkan media.";
  }
  if (failure) {
    redirect(`/admin/media?err=${encodeURIComponent(failure)}`);
  }
  revalidatePublicSite();
  redirect("/admin/media?ok=trashed");
}
