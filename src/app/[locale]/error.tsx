"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { BrandLogo } from "@/components/brand-mark";
import { ErrorWaves } from "@/components/ui/error-404-page";

const copy = {
  id: {
    title: "Ada kendala singkat",
    body: "Halaman ini gagal dimuat sepenuhnya. Coba lagi sebentar lagi; bila tetap sama, kembali ke beranda dan lanjutkan dari sana.",
    retry: "Coba lagi",
    home: "Kembali ke beranda",
  },
  en: {
    title: "A short interruption",
    body: "This page did not finish loading. Try again in a moment; if it persists, head back home and continue from there.",
    retry: "Try again",
    home: "Back to home",
  },
} as const;

const subscribeNoop = () => () => {};
const readLocale = () =>
  typeof window !== "undefined" &&
  window.location.pathname.split("/")[1] === "en"
    ? ("en" as const)
    : ("id" as const);
const serverLocale = () => "id" as const;

/**
 * Batas galat untuk rute publik (R5): menampilkan halaman yang tenang dan
 * serapi desain situs ketika render sisi server gagal, lengkap dengan
 * tombol coba lagi (reset) dan jalan pulang. Bahasa mengikuti locale di
 * path, sama seperti halaman 404, dibaca tanpa efek samping.
 */
export default function LocaleError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useSyncExternalStore(subscribeNoop, readLocale, serverLocale);
  const t = copy[locale];

  return (
    <section className="relative flex min-h-[72vh] w-full items-center justify-center overflow-hidden">
      <ErrorWaves className="absolute inset-0" />
      <div className="relative z-10 flex w-full max-w-xl flex-col items-center px-6 pb-32 pt-16 text-center">
        <Link
          href={`/${locale}`}
          className="focus-ring mb-8 flex min-h-11 items-center gap-3"
        >
          <BrandLogo eager className="h-12 w-auto" />
        </Link>
        <h1 className="font-display text-balance text-3xl leading-tight sm:text-4xl">
          {t.title}
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-ink-2">
          {t.body}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn-primary">
            {t.retry}
          </button>
          <Link href={`/${locale}`} className="btn btn-secondary">
            {t.home}
          </Link>
        </div>
      </div>
    </section>
  );
}
