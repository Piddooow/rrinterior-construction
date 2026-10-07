"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const timeFmt = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Pengintip langsung untuk dasbor (R5): menyegarkan angka & daftar tanpa
 * muat ulang halaman — saat tab kembali aktif, tiap 45 detik selama tab
 * terlihat, atau lewat tombol "Muat ulang". `router.refresh()` memuat ulang
 * data server component; posisi gulir dan fokus tidak berubah.
 */
export function DashboardLive() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [time, setTime] = useState<Date | null>(null);

  const refresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
      setTime(new Date());
    });
  }, [router]);

  useEffect(() => {
    refresh();
    const onVisible = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    const id = window.setInterval(() => {
      if (!document.hidden) refresh();
    }, 45000);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.clearInterval(id);
    };
  }, [refresh]);

  return (
    <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
      <p aria-live="polite" className="text-xs tabular-nums text-ink-3">
        {time
          ? `Diperbarui pukul ${timeFmt.format(time)} · otomatis saat tab kembali aktif`
          : "Menyiapkan data terbaru…"}
      </p>
      <button
        type="button"
        onClick={refresh}
        disabled={pending}
        className="focus-ring inline-flex min-h-11 min-w-[112px] cursor-pointer items-center justify-center whitespace-nowrap rounded-sm border border-line-strong px-3 text-xs text-ink-2 transition-colors hover:bg-hover-surface hover:text-ink disabled:opacity-60"
      >
        {pending ? "Menyegarkan…" : "Muat ulang"}
      </button>
    </div>
  );
}
