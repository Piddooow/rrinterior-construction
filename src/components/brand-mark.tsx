import Image from "next/image";

/**
 * Logo resmi RR (aset final di `public/brand`): monogram rumah + RR tanpa
 * teks, dua varian warna (R17) — `coklat` untuk latar terang dan `light`
 * untuk latar cokelat/gelap. Varian light memakai kelas `brand-cream`
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
          ? "/brand/color-rr-logo-light.svg"
          : "/brand/color-rr-logo-coklat.svg"
      }
      alt={BRAND_NAME}
      width={304}
      height={315}
      draggable={false}
      loading={eager ? "eager" : "lazy"}
      className={light ? `brand-cream ${className}` : className}
    />
  );
}
