import "./globals.css";
import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import { NotFoundContent } from "@/components/not-found-content";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Page not found | RR Design & Build",
  robots: { index: false, follow: false },
};

/**
 * 404 global untuk rute tak dikenal (root layout situs berada di segmen
 * dinamis [locale], jadi halaman ini berdiri sendiri dengan dokumen penuh).
 * Locale tautan pemulihan dibaca dari path oleh NotFoundContent.
 */
export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geist.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head />
      <body className="flex min-h-full flex-col bg-canvas font-sans text-ink">
        <main className="flex-1">
          <NotFoundContent withBrand />
        </main>
      </body>
    </html>
  );
}
