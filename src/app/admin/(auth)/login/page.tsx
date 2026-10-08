import type { Metadata } from "next";
import Link from "next/link";
import { AdminLoginForm } from "@/components/admin-login-form";

export const metadata: Metadata = {
  title: "Masuk | Panel Admin RR Design & Build",
  robots: { index: false, follow: false },
};

/** Halaman masuk panel: berdiri sendiri tanpa shell panel. */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/color-rr-logo-coklat.webp"
          alt="RR Design & Build"
          width={1024}
          height={1024}
          className="h-24 w-24"
        />

        <h1 className="mt-8 font-display text-balance text-3xl leading-tight">
          Masuk panel
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Hanya tim RR. Peran akses mengikuti kebijakan yang disetujui.
        </p>

        <AdminLoginForm
          next={typeof next === "string" && next.length > 0 ? next : undefined}
        />

        <p className="mt-8 text-xs leading-relaxed text-ink-3">
          Belum punya akun atau lupa kata sandi? Hubungi tim pengembang RR.
          Akun dibuat dan dipulihkan dari sisi server dengan aman, tanpa kata
          sandi bawaan di mana pun.
        </p>

        <p className="mt-6 text-xs text-ink-3">
          <Link
            href="/"
            className="focus-ring inline-flex min-h-11 items-center underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink lg:min-h-0"
          >
            ← Kembali ke situs
          </Link>
        </p>
      </div>
    </main>
  );
}
