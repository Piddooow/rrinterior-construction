"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * next/image dengan tulang pemuatan halus. Tulangnya muncul hanya setelah
 * 140ms — muat cepat atau ter-cache tidak berkedip — lalu memudar begitu
 * foto selesai dimuat. Induknya harus `relative` (semua pemakaian media
 * situs sudah begitu) karena tulang memakai inset-0.
 */
export function MediaImage({ className, onLoad, alt, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [boneVisible, setBoneVisible] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Bila berkas selesai dimuat sebelum hidrasi (cache), onLoad tidak pernah
  // menyala; periksa sekali secara asinkron agar tidak set-state di efek.
  useEffect(() => {
    if (!ref.current?.complete) return;
    const id = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (loaded || boneVisible) return;
    const id = setTimeout(() => setBoneVisible(true), 140);
    return () => clearTimeout(id);
  }, [loaded, boneVisible]);

  return (
    <>
      <Image
        {...props}
        alt={alt}
        ref={ref}
        draggable={false}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
        className={className}
      />
      <span
        aria-hidden="true"
        className={cn(
          "skeleton-bone pointer-events-none absolute inset-0 transition-opacity duration-300",
          boneVisible && !loaded ? "opacity-100" : "opacity-0",
          // Kilauan dimatikan setelah muat selesai; elemennya boleh tetap
          // ada (transparan) tanpa biaya animasi.
          loaded && "[&::after]:hidden"
        )}
      />
    </>
  );
}
