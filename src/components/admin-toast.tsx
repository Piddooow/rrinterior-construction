"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Check, Loader2, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Notifikasi panel (R28): popup kecil di kanan bawah untuk tiga keadaan —
 * "Sedang diproses" begitu formulir dikirim, lalu "Berhasil"/"Gagal" saat
 * hasilnya tiba (dibaca dari parameter ?ok= / ?err= yang langsung
 * dibersihkan dari URL supaya tidak terulang saat muat ulang).
 *
 * Halus & sederhana: masuk naik-memudar, keluar memudar, bisa ditutup
 * manual, dan tunduk pada prefers-reduced-motion (aturan global).
 */

type Kind = "process" | "success" | "error";
type Toast = { id: number; kind: Kind; text: string };
type ToastEvent = { type: "toast"; toast: Toast } | { type: "clearProcess" };

const OK_TEXT: Record<string, string> = {
  created: "Draf dibuat — lengkapi isinya, lalu terbitkan secara eksplisit.",
  saved: "Perubahan tersimpan.",
  published: "Diterbitkan — halaman publik langsung menyegar.",
  draft: "Ditarik menjadi draf — tidak tampil di situs.",
  trashed: "Dipindahkan ke Trash — bisa dipulihkan kapan pun.",
  restored: "Dipulihkan sebagai draf. Terbitkan lagi secara eksplisit.",
  gallery: "Galeri media diperbarui — situs publik ikut menyegar.",
  updated: "Perubahan tersimpan.",
  deleted: "Dihapus permanen. Tidak bisa dipulihkan lagi.",
};

const LIFETIME: Record<Kind, number> = {
  process: 12000,
  success: 5000,
  error: 8000,
};

let seq = 0;
const listeners = new Set<(event: ToastEvent) => void>();
const emit = (event: ToastEvent) => listeners.forEach((listener) => listener(event));

/** Panggil dari mana pun di panel: showAdminToast("success", "…"). */
export function showAdminToast(kind: Kind, text: string) {
  emit({ type: "toast", toast: { id: ++seq, kind, text } });
}

/** Bersihkan sisa "sedang diproses" (mis. navigasi tanpa hasil aksi). */
export function clearAdminProcess() {
  emit({ type: "clearProcess" });
}

export function AdminToasts() {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [leaving, setLeaving] = useState<number[]>([]);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    setLeaving((current) => (current.includes(id) ? current : [...current, id]));
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
      setLeaving((current) => current.filter((value) => value !== id));
    }, 220);
  }, []);

  // Emitter: terima toast baru; hasil baru menggantikan "sedang diproses".
  useEffect(() => {
    const listener = (event: ToastEvent) => {
      if (event.type === "clearProcess") {
        setToasts((current) => current.filter((toast) => toast.kind !== "process"));
        return;
      }
      const { toast } = event;
      setToasts((current) => {
        const base =
          toast.kind === "process"
            ? current
            : current.filter((item) => item.kind !== "process");
        return [...base, toast].slice(-3);
      });
      const timer = window.setTimeout(() => dismiss(toast.id), LIFETIME[toast.kind]);
      timers.current.set(toast.id, timer);
    };
    listeners.add(listener);
    const timerMap = timers.current;
    return () => {
      listeners.delete(listener);
      timerMap.forEach((timer) => window.clearTimeout(timer));
      timerMap.clear();
    };
  }, [dismiss]);

  // Hasil aksi dari URL: tampilkan lalu bersihkan parameter.
  const ok = searchParams.get("ok");
  const err = searchParams.get("err");
  useEffect(() => {
    if (!ok && !err) return;
    if (err) showAdminToast("error", err);
    else if (ok) showAdminToast("success", OK_TEXT[ok] ?? "Berhasil.");
    const url = new URL(window.location.href);
    url.searchParams.delete("ok");
    url.searchParams.delete("err");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, [ok, err, pathname]);

  // Pindah halaman tanpa hasil aksi: bersihkan sisa "sedang diproses".
  useEffect(() => {
    if (!ok && !err) clearAdminProcess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Setiap formulir panel dikirim -> popup "sedang diproses" (kecuali
  // pencarian sidebar dan form keluar — keduanya bukan aksi konten).
  useEffect(() => {
    const onSubmit = (event: Event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (form.getAttribute("role") === "search") return;
      if (form.closest("[data-no-toast]")) return;
      showAdminToast("process", "Sedang diproses…");
    };
    document.addEventListener("submit", onSubmit, true);
    return () => document.removeEventListener("submit", onSubmit, true);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <ul
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-20 z-[80] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2 lg:top-4"
    >
      {toasts.map((toast) => {
        const leavingNow = leaving.includes(toast.id);
        return (
          <li
            key={toast.id}
            data-leaving={leavingNow || undefined}
            className="admin-toast pointer-events-auto flex items-start gap-3 rounded-md border border-line bg-surface px-4 py-3 shadow-xl"
          >
            <span
              aria-hidden="true"
              className={cn(
                "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                toast.kind === "success" && "bg-prep-4 text-prep-4-ink",
                toast.kind === "error" && "bg-prep-3 text-prep-3-ink",
                toast.kind === "process" && "bg-subtle text-ink-2"
              )}
            >
              {toast.kind === "success" ? (
                <Check className="size-3.5" />
              ) : toast.kind === "error" ? (
                <TriangleAlert className="size-3.5" />
              ) : (
                <Loader2 className="size-3.5 animate-spin" />
              )}
            </span>
            <p className="min-w-0 flex-1 text-sm leading-snug text-ink">
              {toast.text}
            </p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Tutup notifikasi"
              className="focus-ring -mr-1 -mt-0.5 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-sm text-ink-3 transition-colors hover:bg-hover-surface hover:text-ink"
            >
              <X aria-hidden="true" className="size-3.5" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
