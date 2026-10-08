"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { defaultLocale, dictionaries, isLocale } from "@/i18n";
import { BrandLogo } from "@/components/brand-mark";
import { ErrorWaves } from "@/components/ui/error-404-page";

const subscribeNoop = () => () => {};
const readPathname = () => window.location.pathname;
const serverPathname = () => "";

/**
 * Konten halaman Tidak Ditemukan (dipakai not-found di dalam layout locale
 * dan global-not-found untuk rute tak dikenal). Tampilan R5 mengikuti
 * komponen referensi klien dengan palet PRD: angka 404 besar, gelombang
 * hangat, dan dua jalur pemulihan yang berguna. Locale dibaca dari path
 * karena berkas not-found tidak menerima params; snapshot server kosong
 * lalu dikoreksi setelah hidrasi agar tidak ada mismatch.
 */
export function NotFoundContent({ withBrand = false }: { withBrand?: boolean }) {
  const pathname = useSyncExternalStore(
    subscribeNoop,
    readPathname,
    serverPathname
  );
  const segment = pathname.split("/")[1] ?? "";
  const locale = isLocale(segment) ? segment : defaultLocale;
  const dict = dictionaries[locale];

  // Dokumen standalone (global-not-found) tidak tahu locale saat server;
  // samakan atribut bahasa setelah path terbaca di klien.
  useEffect(() => {
    if (document.documentElement.lang !== locale) {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return (
    <section
      className={`relative flex w-full items-center justify-center overflow-hidden ${
        withBrand ? "min-h-dvh" : "min-h-[64vh]"
      }`}
    >
      <ErrorWaves className="absolute inset-0" />
      <div className="relative z-10 flex w-full max-w-xl flex-col items-center px-6 pb-32 pt-16 text-center">
        {withBrand ? (
          <Link
            href={`/${locale}`}
            className="focus-ring mb-8 flex min-h-11 items-center gap-3"
          >
            <BrandLogo eager className="h-12 w-auto" />
          </Link>
        ) : null}

        <p className="font-display text-7xl leading-none text-primary sm:text-8xl">
          404
        </p>
        <h1 className="mt-6 font-display text-balance text-3xl leading-tight sm:text-4xl">
          {dict.notFound.title}
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-ink-2">
          {dict.notFound.body}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href={`/${locale}`} className="btn btn-primary">
            {dict.notFound.home}
          </Link>
          <Link href={`/${locale}/projects`} className="btn btn-secondary">
            {dict.notFound.projects}
          </Link>
          <Link href={`/${locale}/contact`} className="btn btn-secondary">
            {dict.notFound.contact}
          </Link>
        </div>
      </div>
    </section>
  );
}
