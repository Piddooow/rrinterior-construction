import type { CSSProperties, ReactNode } from "react";

/**
 * Ilustrasi garis untuk empat kartu Persiapan (Tahap H5) — masing-masing
 * bermakna sesuai kartunya: foto ruang, ukuran kasar, cerita masalah, dan
 * referensi. Setiap elemen `[data-draw]` digambar berurutan saat kartunya
 * masuk ke dek (aturan `.prep-art` di globals.css); tanpa JS atau dengan
 * reduced-motion, garis tampil utuh sejak awal.
 */

const delay = (ms: number) => ({ "--draw-delay": `${ms}ms` }) as CSSProperties;

const svg = {
  viewBox: "0 0 120 120",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "h-full w-full",
  "aria-hidden": true,
} as const;

export const PREP_ART: ReactNode[] = [
  // 01 — Foto ruang: dua bingkai foto bertumpuk, isinya pemandangan.
  <svg key="photos" {...svg}>
    <rect
      data-draw
      pathLength={1}
      x="38"
      y="16"
      width="50"
      height="42"
      rx="4"
      style={delay(0)}
    />
    <circle data-draw pathLength={1} cx="76" cy="28" r="3.5" style={delay(110)} />
    <path
      data-draw
      pathLength={1}
      d="M45 49l9-11 6 7 7-8 12 12"
      style={delay(200)}
    />
    <rect
      data-draw
      pathLength={1}
      x="22"
      y="40"
      width="50"
      height="42"
      rx="4"
      fill="currentColor"
      fillOpacity={0.08}
      style={delay(260)}
    />
    <circle data-draw pathLength={1} cx="34" cy="53" r="4.5" style={delay(360)} />
    <path
      data-draw
      pathLength={1}
      d="M29 73l10-12 7 8 6-7 10 11"
      style={delay(440)}
    />
  </svg>,

  // 02 — Ukuran kasar: sudut ruang, meteran, dan dua garis ukur berpanah.
  <svg key="sizes" {...svg}>
    <path data-draw pathLength={1} d="M30 102V44h32" style={delay(0)} />
    <rect
      data-draw
      pathLength={1}
      x="40"
      y="16"
      width="46"
      height="13"
      rx="6.5"
      fill="currentColor"
      fillOpacity={0.08}
      style={delay(120)}
    />
    <path
      data-draw
      pathLength={1}
      d="M51 17v5M60 17v7M69 17v5"
      style={delay(240)}
    />
    <path data-draw pathLength={1} d="M20 112h60" style={delay(340)} />
    <path
      data-draw
      pathLength={1}
      d="M20 112l6-4M20 112l6 4M80 112l-6-4M80 112l-6 4"
      style={delay(400)}
    />
    <path data-draw pathLength={1} d="M96 104V50" style={delay(460)} />
    <path
      data-draw
      pathLength={1}
      d="M96 50l-4 6M96 50l4 6M96 104l-4-6M96 104l4-6"
      style={delay(520)}
    />
  </svg>,

  // 03 — Cerita masalah: balon percakapan, dua baris cerita, dan percikan.
  <svg key="story" {...svg}>
    <rect
      data-draw
      pathLength={1}
      x="22"
      y="22"
      width="76"
      height="52"
      rx="12"
      fill="currentColor"
      fillOpacity={0.07}
      style={delay(0)}
    />
    <path data-draw pathLength={1} d="M45 74l-5 13 15-13" style={delay(120)} />
    <path
      data-draw
      pathLength={1}
      d="M37 40h46M37 52h28"
      style={delay(220)}
    />
    <path
      data-draw
      pathLength={1}
      d="M99 12l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"
      style={delay(340)}
    />
  </svg>,

  // 04 — Referensi (opsional): tiga kartu mood board berkipas dengan penanda.
  <svg key="references" {...svg}>
    <rect
      data-draw
      pathLength={1}
      x="18"
      y="36"
      width="34"
      height="46"
      rx="4"
      fill="currentColor"
      fillOpacity={0.06}
      style={delay(0)}
    />
    <circle data-draw pathLength={1} cx="35" cy="68" r="4" style={delay(90)} />
    <rect
      data-draw
      pathLength={1}
      x="43"
      y="26"
      width="34"
      height="46"
      rx="4"
      fill="currentColor"
      fillOpacity={0.08}
      style={delay(140)}
    />
    <circle data-draw pathLength={1} cx="52" cy="40" r="4" style={delay(240)} />
    <path data-draw pathLength={1} d="M50 60h20" style={delay(300)} />
    <rect
      data-draw
      pathLength={1}
      x="68"
      y="36"
      width="34"
      height="46"
      rx="4"
      fill="currentColor"
      fillOpacity={0.06}
      style={delay(360)}
    />
    <circle data-draw pathLength={1} cx="85" cy="68" r="4" style={delay(460)} />
    <circle data-draw pathLength={1} cx="60" cy="14" r="3.5" style={delay(520)} />
    <path data-draw pathLength={1} d="M60 18v6" style={delay(560)} />
  </svg>,
];
