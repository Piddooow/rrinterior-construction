"use server";

import { redirect } from "next/navigation";
import {
  createService,
  publishService,
  restoreService,
  trashService,
  unpublishService,
  updateService,
  type ServiceInput,
} from "@/lib/content-admin";
import { revalidatePublicSite } from "@/lib/revalidate";

/**
 * Server Actions layanan: simpan draf, terbit eksplisit (gerbang deskripsi),
 * tarik ke draf, Trash, dan pulihkan — pola sama dengan proyek.
 */

export type SaveServiceState = { error?: string };

function field(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseServiceInput(formData: FormData): ServiceInput {
  const sortRaw = field(formData, "sortOrder");
  const sortNumber = sortRaw ? Number.parseInt(sortRaw, 10) : NaN;
  return {
    titleEn: field(formData, "titleEn"),
    titleId: field(formData, "titleId"),
    descriptionEn: field(formData, "descriptionEn"),
    descriptionId: field(formData, "descriptionId"),
    sortOrder: Number.isFinite(sortNumber) ? sortNumber : undefined,
  };
}

async function saveFromForm(formData: FormData): Promise<string> {
  const id = field(formData, "id");
  const input = parseServiceInput(formData);
  if (!id || id === "new") {
    const row = await createService(input);
    return row.id;
  }
  await updateService(id, input);
  return id;
}

export async function saveServiceAction(
  _prev: SaveServiceState,
  formData: FormData
): Promise<SaveServiceState> {
  const id = field(formData, "id");
  const isNew = !id || id === "new";
  let targetId = id ?? "new";
  try {
    targetId = await saveFromForm(formData);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Gagal menyimpan layanan.",
    };
  }
  revalidatePublicSite();
  redirect(`/admin/services/${targetId}?ok=${isNew ? "created" : "saved"}`);
}

export async function publishServiceAction(formData: FormData): Promise<void> {
  const id = field(formData, "id");
  let targetId = id ?? "new";
  let failure: string | null = null;
  try {
    targetId = await saveFromForm(formData);
    await publishService(targetId);
  } catch (error) {
    failure =
      error instanceof Error ? error.message : "Gagal menerbitkan layanan.";
  }
  if (failure) {
    redirect(`/admin/services/${targetId}?err=${encodeURIComponent(failure)}`);
  }
  revalidatePublicSite();
  redirect(`/admin/services/${targetId}?ok=published`);
}

export async function unpublishServiceAction(formData: FormData): Promise<void> {
  const id = field(formData, "id") ?? "";
  let failure: string | null = null;
  try {
    await unpublishService(id);
  } catch (error) {
    failure =
      error instanceof Error ? error.message : "Gagal menarik layanan ke draf.";
  }
  if (failure) {
    redirect(`/admin/services/${id}?err=${encodeURIComponent(failure)}`);
  }
  revalidatePublicSite();
  redirect(`/admin/services/${id}?ok=draft`);
}

export async function trashServiceAction(formData: FormData): Promise<void> {
  const id = field(formData, "id") ?? "";
  let failure: string | null = null;
  try {
    await trashService(id);
  } catch (error) {
    failure =
      error instanceof Error ? error.message : "Gagal memindahkan layanan.";
  }
  if (failure) {
    redirect(`/admin/services/${id}?err=${encodeURIComponent(failure)}`);
  }
  revalidatePublicSite();
  redirect(`/admin/services/${id}?ok=trashed`);
}

export async function restoreServiceAction(formData: FormData): Promise<void> {
  const id = field(formData, "id") ?? "";
  let failure: string | null = null;
  try {
    await restoreService(id);
  } catch (error) {
    failure =
      error instanceof Error ? error.message : "Gagal memulihkan layanan.";
  }
  if (failure) {
    redirect(`/admin/services/${id}?err=${encodeURIComponent(failure)}`);
  }
  revalidatePublicSite();
  redirect(`/admin/services/${id}?ok=restored`);
}
