"use server";

import { redirect } from "next/navigation";
import {
  createStaticPage,
  publishStaticPage,
  restoreStaticPage,
  trashStaticPage,
  unpublishStaticPage,
  updateStaticPage,
  type StaticPageInput,
} from "@/lib/content-admin";
import { requireUser } from "@/lib/admin-auth";
import { revalidatePublicSite } from "@/lib/revalidate";

/**
 * Server Actions halaman teks: draf, terbit eksplisit (gerbang isi),
 * tarik ke draf, Trash, pulihkan. Slug hanya diisi saat pembuatan dan
 * mengunci alamat halaman.
 */

export type SavePageState = { error?: string };

function field(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parsePageInput(formData: FormData): StaticPageInput {
  return {
    titleEn: field(formData, "titleEn"),
    titleId: field(formData, "titleId"),
    bodyEn: field(formData, "bodyEn"),
    bodyId: field(formData, "bodyId"),
  };
}

async function saveFromForm(formData: FormData): Promise<string> {
  const id = field(formData, "id");
  const input = parsePageInput(formData);
  if (!id || id === "new") {
    const slug = field(formData, "slug");
    if (!slug) throw new Error("Slug halaman wajib diisi.");
    const row = await createStaticPage(slug, input);
    return row.id;
  }
  await updateStaticPage(id, input);
  return id;
}

export async function savePageAction(
  _prev: SavePageState,
  formData: FormData
): Promise<SavePageState> {
  await requireUser();
  const id = field(formData, "id");
  const isNew = !id || id === "new";
  let targetId = id ?? "new";
  try {
    targetId = await saveFromForm(formData);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Gagal menyimpan halaman.",
    };
  }
  revalidatePublicSite();
  redirect(`/admin/pages/${targetId}?ok=${isNew ? "created" : "saved"}`);
}

export async function publishPageAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = field(formData, "id");
  let targetId = id ?? "new";
  let failure: string | null = null;
  try {
    targetId = await saveFromForm(formData);
    await publishStaticPage(targetId);
  } catch (error) {
    failure =
      error instanceof Error ? error.message : "Gagal menerbitkan halaman.";
  }
  if (failure) {
    redirect(`/admin/pages/${targetId}?err=${encodeURIComponent(failure)}`);
  }
  revalidatePublicSite();
  redirect(`/admin/pages/${targetId}?ok=published`);
}

export async function unpublishPageAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = field(formData, "id") ?? "";
  let failure: string | null = null;
  try {
    await unpublishStaticPage(id);
  } catch (error) {
    failure =
      error instanceof Error ? error.message : "Gagal menarik halaman ke draf.";
  }
  if (failure) {
    redirect(`/admin/pages/${id}?err=${encodeURIComponent(failure)}`);
  }
  revalidatePublicSite();
  redirect(`/admin/pages/${id}?ok=draft`);
}

export async function trashPageAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = field(formData, "id") ?? "";
  let failure: string | null = null;
  try {
    await trashStaticPage(id);
  } catch (error) {
    failure =
      error instanceof Error ? error.message : "Gagal memindahkan halaman.";
  }
  if (failure) {
    redirect(`/admin/pages/${id}?err=${encodeURIComponent(failure)}`);
  }
  revalidatePublicSite();
  redirect(`/admin/pages/${id}?ok=trashed`);
}

export async function restorePageAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = field(formData, "id") ?? "";
  let failure: string | null = null;
  try {
    await restoreStaticPage(id);
  } catch (error) {
    failure =
      error instanceof Error ? error.message : "Gagal memulihkan halaman.";
  }
  if (failure) {
    redirect(`/admin/pages/${id}?err=${encodeURIComponent(failure)}`);
  }
  revalidatePublicSite();
  redirect(`/admin/pages/${id}?ok=restored`);
}
