"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { initPageMotion, prefersReducedMotion } from "@/lib/motion";

/**
 * Template ber-locale: dirender ulang setiap navigasi halaman.
 * 1) Menyalakan sistem motion halaman (reveal/hero/parallax) dalam scope ini.
 * 2) Animasi masuk halaman hanya untuk navigasi klien — bukan muat pertama,
 *    supaya konten SSR tidak berkedip; StrictMode aman lewat penanda path.
 */

let lastPath: string | null = null;

export default function LocaleTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      initPageMotion(root);

      const isClientNavigation = lastPath !== null && lastPath !== pathname;
      lastPath = pathname;

      if (!isClientNavigation || prefersReducedMotion()) return;
      gsap.from(root, { autoAlpha: 0, duration: 0.28, ease: "power1.out" });
    },
    { scope: rootRef, dependencies: [pathname] }
  );

  return <div ref={rootRef}>{children}</div>;
}
