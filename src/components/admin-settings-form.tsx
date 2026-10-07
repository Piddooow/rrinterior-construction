"use client";

import { useActionState, useEffect } from "react";
import {
  saveSettingsAction,
  type SaveSettingsState,
} from "@/app/admin/(panel)/settings/actions";
import { showAdminToast } from "@/components/admin-toast";

export type AdminSettingRow = {
  key: string;
  label: string;
  hint: string;
  /** false = nilai disimpan tetapi belum dipakai tampilan mana pun. */
  used: boolean;
  /** Nilai memuat baris baru — dirender sebagai textarea agar tidak hilang. */
  multiline: boolean;
  valueEn: string;
  valueId: string;
};

export type AdminSettingGroup = {
  id: string;
  label: string;
  description: string;
  items: AdminSettingRow[];
};

const inputClass =
  "focus-ring h-11 w-full rounded-sm border border-line-strong bg-canvas px-3 text-sm text-ink placeholder:text-ink-3";
const areaClass =
  "focus-ring min-h-20 w-full rounded-sm border border-line-strong bg-canvas px-3 py-2 text-sm leading-relaxed text-ink placeholder:text-ink-3";

/**
 * Form pengaturan NYATA: satu form untuk semua baris, hanya nilai yang
 * berubah yang disimpan (menghindari riwayat revisi sia-sia), lalu situs
 * publik direvalidasi oleh Server Action.
 */
export function AdminSettingsForm({ groups }: { groups: AdminSettingGroup[] }) {
  const [state, formAction, pending] = useActionState<
    SaveSettingsState,
    FormData
  >(saveSettingsAction, {});

  // Hasil selalu berakhir di popup (R29): sukses maupun galat — pesan galat
  // tetap tampil inline di atas tombol untuk konteks.
  useEffect(() => {
    if (state.ok) showAdminToast("success", state.ok);
    if (state.error) showAdminToast("error", state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {groups.map((group) => (
        <section
          key={group.id}
          aria-labelledby={`group-${group.id}`}
          className="overflow-hidden rounded-md border border-line bg-surface"
        >
          <div className="border-b border-line px-5 py-4">
            <h2 id={`group-${group.id}`} className="text-sm font-medium">
              {group.label}
            </h2>
            {group.description ? (
              <p className="mt-1 text-xs leading-relaxed text-ink-3">
                {group.description}
              </p>
            ) : null}
          </div>
          <ul className="divide-y divide-line">
            {group.items.map((item) => (
              <li
                key={item.key}
                className="grid gap-4 px-5 py-4 lg:grid-cols-[240px_minmax(0,1fr)]"
              >
                <div className="min-w-0">
                  <p className="text-sm text-ink">
                    {item.label}
                    {item.used ? null : (
                      <span className="ml-2 inline-flex items-center rounded-sm border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-3">
                        Cadangan
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-ink-3">
                    {item.key}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-3">
                    {item.hint}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor={`${item.key}-en`}
                      className="text-xs text-ink-3"
                    >
                      Inggris (EN)
                    </label>
                    {item.multiline ? (
                      <textarea
                        id={`${item.key}-en`}
                        name={`set__${item.key}__en`}
                        rows={3}
                        defaultValue={item.valueEn}
                        className={areaClass}
                      />
                    ) : (
                      <input
                        id={`${item.key}-en`}
                        name={`set__${item.key}__en`}
                        defaultValue={item.valueEn}
                        className={inputClass}
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor={`${item.key}-id`}
                      className="text-xs text-ink-3"
                    >
                      Indonesia (ID)
                    </label>
                    {item.multiline ? (
                      <textarea
                        id={`${item.key}-id`}
                        name={`set__${item.key}__id`}
                        rows={3}
                        defaultValue={item.valueId}
                        className={areaClass}
                      />
                    ) : (
                      <input
                        id={`${item.key}-id`}
                        name={`set__${item.key}__id`}
                        defaultValue={item.valueId}
                        className={inputClass}
                      />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-line bg-canvas px-4 py-3 text-sm text-ink"
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? "Menyimpan…" : "Simpan perubahan"}
        </button>
        <p className="text-xs leading-relaxed text-ink-3">
          Baris yang tidak diubah tidak disimpan ulang; minimal satu bahasa
          harus terisi di setiap baris yang berubah.
        </p>
      </div>
    </form>
  );
}
