import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import "../globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Panel Admin | RR Design & Build",
  robots: { index: false, follow: false },
};

/**
 * Layout root panel admin: skema terang (default operator), bahasa
 * Indonesia, tanpa tautan dari situs publik. Shell panel ada di grup
 * (panel); halaman masuk berdiri sendiri di grup (auth).
 * Autentikasi menyusul — jangan menaruh data privat di sini sebelum itu.
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geist.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas font-sans text-ink">{children}</body>
    </html>
  );
}
