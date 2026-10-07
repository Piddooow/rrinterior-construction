"use server";

import { redirect } from "next/navigation";
import {
  deleteFromTrash,
  restoreMediaAsset,
  restoreProject,
  restoreService,
  restoreStaticPage,
  type TrashEntityType,
} from "@/lib/content-admin";
import { revalidatePublicSite } from "@/lib/revalidate";

/**
 * Aksi Trash: pulihkan ke draf atau hapus permanen dengan penjagaan
 * dependensi (data layer memblokir bila masih dipakai).
 */

function readType(formData: FormData): TrashEntityType | null {
  const value = formData.get("type");
  return value === "project" ||
    value === "service" ||
    value === "page" ||
    value === "media"
    ? value
    : null;
}

export async function restoreTrashAction(formData: FormData): Promise<void> {
  const type = readType(formData);
  const id = String(formData.get("id") ?? "");
  let failure: string | null = null;
  try {
    if (!type || !id) throw new Error("Item Trash tidak dikenal.");
    if (type === "project") await restoreProject(id);
    else if (type === "service") await restoreService(id);
    else if (type === "page") await restoreStaticPage(id);
    else await restoreMediaAsset(id);
  } catch (error) {
    failure = error instanceof Error ? error.message : "Gagal memulihkan item.";
  }
  if (failure) {
    redirect(`/admin/trash?err=${encodeURIComponent(failure)}`);
  }
  revalidatePublicSite();
  redirect("/admin/trash?ok=restored");
}

export async function deleteTrashAction(formData: FormData): Promise<void> {
  const type = readType(formData);
  const id = String(formData.get("id") ?? "");
  let failure: string | null = null;
  try {
    if (!type || !id) throw new Error("Item Trash tidak dikenal.");
    await deleteFromTrash(type, id);
  } catch (error) {
    failure =
      error instanceof Error ? error.message : "Gagal menghapus permanen.";
  }
  if (failure) {
    redirect(`/admin/trash?err=${encodeURIComponent(failure)}`);
  }
  revalidatePublicSite();
  redirect("/admin/trash?ok=deleted");
}
