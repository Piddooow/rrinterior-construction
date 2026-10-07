"use server";

import { listSettingsForAdmin, updateSiteSetting } from "@/lib/content-admin";
import { revalidatePublicSite } from "@/lib/revalidate";
import { changeUserPassword } from "@/lib/auth";
import { requireUser } from "@/lib/admin-auth";

/**
 * Server Action pengaturan: menyimpan hanya baris yang benar-benar berubah
 * (menghindari snapshot revisi sia-sia), melaporkan kunci yang gagal dengan
 * namanya, lalu menyegarkan situs publik.
 */

export type SaveSettingsState = { error?: string; ok?: string };

export async function saveSettingsAction(
  _prev: SaveSettingsState,
  formData: FormData
): Promise<SaveSettingsState> {
  const rows = await listSettingsForAdmin();
  const failures: string[] = [];
  let changed = 0;

  for (const row of rows) {
    const enRaw = formData.get(`set__${row.key}__en`);
    const idRaw = formData.get(`set__${row.key}__id`);
    if (typeof enRaw !== "string" && typeof idRaw !== "string") continue;

    const nextEn =
      typeof enRaw === "string" ? enRaw.replace(/\r\n/g, "\n").trim() : "";
    const nextId =
      typeof idRaw === "string" ? idRaw.replace(/\r\n/g, "\n").trim() : "";
    if (
      nextEn === (row.valueEn ?? "") &&
      nextId === (row.valueId ?? "")
    ) {
      continue;
    }

    try {
      await updateSiteSetting(row.key, { valueEn: nextEn, valueId: nextId });
      changed += 1;
    } catch (error) {
      failures.push(
        `${row.key} (${error instanceof Error ? error.message : "gagal"})`
      );
    }
  }

  if (failures.length > 0) {
    return {
      error: `Sebagian tidak tersimpan — ${failures.join(" · ")}`,
    };
  }
  if (changed === 0) {
    return { ok: "Tidak ada perubahan untuk disimpan." };
  }

  revalidatePublicSite();
  return {
    ok: `${changed} pengaturan tersimpan — halaman publik ikut menyegar.`,
  };
}

export type ChangePasswordState = { error?: string; ok?: string };

/**
 * Ganti kata sandi akun yang sedang masuk (R5). Pesan galat ramah dan tidak
 * membocorkan detail akun; verifikasi sesungguhnya ada di lapisan auth.
 */
export async function changePasswordAction(
  _prev: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const user = await requireUser();
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!current || !next || !confirm) {
    return { error: "Semua kolom kata sandi wajib diisi." };
  }
  if (next !== confirm) {
    return { error: "Ulangan kata sandi baru tidak sama." };
  }
  try {
    await changeUserPassword(user.id, current, next);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Gagal mengubah kata sandi.",
    };
  }
  return { ok: "Kata sandi berhasil diganti." };
}
