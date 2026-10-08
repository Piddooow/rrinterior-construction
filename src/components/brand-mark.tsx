import Image from "next/image";

/**
 * Logo resmi RR (aset final di `public/brand`): monogram rumah + RR tanpa
 * teks, dua varian warna — `coklat` untuk latar terang dan `light` untuk
 * latar cokelat/gelap. Aset baru (Okt 2026): WEBP 1024² dari master 2500²
 * (garis lebih rapi, tidak pecah). Varian light memakai kelas `brand-cream`
 * sebagai penanda audit (r1/r7).
 *
 * `eager` dipakai untuk pemakaian di atas lipatan (header, panel, tirai,
 * 404, admin) agar tidak tertunda lazy-load; bagian bawah lipatan
 * (footer) biarkan lazy.
 */

const BRAND_NAME = "RR Design & Build";

export function BrandLogo({
  className = "",
  eager = false,
  tone = "coklat",
}: {
  className?: string;
  eager?: boolean;
  tone?: "coklat" | "light";
}) {
  const light = tone === "light";
  return (
    <Image
      src={
        light
          ? "/brand/color-rr-logo-light.webp"
          : "/brand/color-rr-logo-coklat.webp"
      }
      alt={BRAND_NAME}
      width={1024}
      height={1024}
      draggable={false}
      loading={eager ? "eager" : "lazy"}
      className={light ? `brand-cream ${className}` : className}
    />
  );
}
