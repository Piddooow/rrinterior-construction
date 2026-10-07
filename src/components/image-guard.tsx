"use client";

import { useEffect } from "react";

/**
 * Penjaga gambar publik (R19e): mencegah simpan-cepat lewat klik-kanan pada
 * gambar. Hold/save di ponsel sudah dimatikan lewat CSS (`-webkit-touch-callout`
 * + `user-select` + `-webkit-user-drag` di globals) dan `draggable={false}` di
 * komponen gambar — meminimalkan human error tanpa mengganggu interaksi lain.
 */
export function ImageGuard() {
  useEffect(() => {
    const onContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && target.tagName === "IMG") event.preventDefault();
    };
    document.addEventListener("contextmenu", onContextMenu);
    return () => document.removeEventListener("contextmenu", onContextMenu);
  }, []);
  return null;
}
