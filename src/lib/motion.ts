import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/**
 * Sistem motion terpusat (klien). Dipakai oleh template ber-locale:
 * - reveal batch per seksi untuk elemen [data-reveal],
 * - timeline intro untuk elemen [data-hero-step],
 * - parallax halus untuk foto besar [data-parallax].
 *
 * Prinsip (PRD): gerak tertahan, hanya transform/opacity, menghormati
 * prefers-reduced-motion. Elemen disembunyikan pra-cat lewat kelas `motion`
 * pada <html> (lihat globals.css); kelas dilepas begitu GSAP mengambil alih,
 * dan failsafe di skrip kepala melepasnya bila modul ini gagal dimuat.
 *
 * Ketahanan "patah" saat muat pertama:
 * 1) Penanda `__rrMotion` dipasang SEGERA saat modul termuat — failsafe
 *    berbasis waktu (2,5 dtk) tidak melepas kelas pra-cat hanya karena
 *    efek GSAP belum sempat berjalan di perangkat lambat.
 * 2) Bila failsafe sempat melepas kelas (chunk termuat terlambat), konten
 *    TIDAK disembunyikan ulang — animasi menjadi no-op, jadi tidak ada
 *    kedipan tampil → sembunyi → tampil.
 * 3) Animasi menunggu `document.fonts.ready` (maks ±350 ms) supaya teks
 *    tidak bertukar font di tengah animasi.
 */

if (typeof window !== "undefined") {
  (window as unknown as { __rrMotion?: boolean }).__rrMotion = true;
}

let registered = false;

export function initGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // Jangan refresh karena perubahan tinggi viewport (bilah URL ponsel).
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Siapkan seluruh animasi halaman di dalam `root` (dalam konteks useGSAP). */
export function initPageMotion(root: HTMLElement) {
  initGsap();
  (window as unknown as { __rrMotion?: boolean }).__rrMotion = true;

  const html = document.documentElement;
  const revealEls = gsap.utils.toArray<HTMLElement>("[data-reveal]", root);
  const heroSteps = gsap.utils.toArray<HTMLElement>("[data-hero-step]", root);
  const parallaxEls = gsap.utils.toArray<HTMLElement>("[data-parallax]", root);

  if (prefersReducedMotion()) {
    html.classList.remove("motion");
    return;
  }

  // Sembunyikan pra-animasi hanya bila pra-cat masih aktif; bila failsafe
  // sudah melepas kelas, konten dibiarkan terlihat (animasi jadi no-op).
  const preHidden = html.classList.contains("motion");
  if (preHidden) {
    if (revealEls.length) gsap.set(revealEls, { opacity: 0, y: 18 });
    if (heroSteps.length) gsap.set(heroSteps, { opacity: 0, y: 20 });
  }
  html.classList.remove("motion");

  const start = () => {
    if (heroSteps.length) {
      gsap.to(heroSteps, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
        delay: 0.05,
        clearProps: "transform",
      });
    }

    if (revealEls.length) {
      // Elemen yang sudah bersinggungan viewport dianimasikan segera (tidak
      // menunggu garis trigger) supaya tidak ada strip kosong di dasar layar;
      // sisanya memakai batch per kedatangan viewport.
      const viewport = window.innerHeight;
      const inView = revealEls.filter(
        (el) => el.getBoundingClientRect().top < viewport * 0.98
      );
      const below = revealEls.filter((el) => !inView.includes(el));

      if (inView.length) {
        gsap.to(inView, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.06,
          delay: 0.08,
          clearProps: "transform",
        });
      }

      if (below.length) {
        ScrollTrigger.batch(below, {
          start: "top 88%",
          once: true,
          interval: 0.12,
          batchMax: 8,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power3.out",
              stagger: 0.07,
              clearProps: "transform",
            }),
        });
      }
    }

    for (const el of parallaxEls) {
      gsap.fromTo(
        el,
        { yPercent: -3.5 },
        {
          yPercent: 3.5,
          ease: "none",
          scrollTrigger: {
            trigger: el.closest("figure") ?? el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        }
      );
    }

    ScrollTrigger.refresh();
  };

  // Tunggu font siap (maks ±350 ms) supaya tidak ada pertukaran font di
  // tengah animasi — penyebab gerak terlihat "patah" pada muat pertama.
  const fontsReady =
    typeof document !== "undefined" && "fonts" in document
      ? document.fonts.ready
      : Promise.resolve();
  Promise.race([
    fontsReady,
    new Promise((resolve) => setTimeout(resolve, 350)),
  ]).then(start);
}
