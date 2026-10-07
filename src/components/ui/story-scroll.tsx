"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { initGsap } from "@/lib/motion";
import { ArrowIcon } from "@/components/ui/arrow-icon";

export type StoryFrame = {
  kicker: string;
  title: string;
  /** Kalimat pendek pengantar di bawah judul (deskripsi singkat seksi). */
  lead: string;
  body: string;
  facts?: { label: string; value: string }[];
  links?: { label: string; href: string }[];
};

/**
 * Narasi studio bergaya "story scroll": tiap frame adalah seksi setinggi
 * layar yang tertahan sementara frame berikutnya masuk dengan rotasi
 * ditahan 12° dari kiri bawah, lalu menegak. Diadaptasi dari komponen
 * FlowArt (21st.dev) untuk RR:
 *
 * - hanya aktif di >=1024px dan tanpa prefers-reduced-motion (mobile &
 *   reduced-motion = seksi bertumpuk statis, tanpa pin),
 * - rotasi dikecilkan (12°, dari 30°) sesuai prinsip "gerak tertahan" PRD,
 *   dan tiap seksi meng-clip rotasinya sendiri (overflow-hidden),
 * - sejak R15h tiap frame `sticky` berhenti tepat di bawah navbar
 *   (top 4rem, tinggi 100svh dikurangi tinggi header) — sebelumnya frame
 *   menggeser sampai menembus header sehingga tepi atasnya terpotong,
 * - sejak R23a ponsel ikut sticky + rotasi seperti desktop (UX seragam
 *   untuk semua perangkat; R18 dulu membuat ponsel aliran normal) dan
 *   white spot antara lead dan info bawah memakai `clamp(…svh)` supaya
 *   napas antar blok proporsional dan konsisten di semua layar,
 * - sejak R22a blok konten dipusatkan vertikal (sebelumnya `justify-between`
 *   menyisakan jurang besar dan info bawah tertutup frame berikutnya terlalu
 *   dini),
 * - tanpa dependensi baru; ScrollTrigger yang sudah terpasang di initGsap.
 */
export function StoryScroll({
  region,
  frames,
}: {
  region: string;
  frames: StoryFrame[];
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      initGsap();
      const mm = gsap.matchMedia();
      // Rotasi masuk menyesuaikan perangkat (ponsel 6°, tablet 9°,
      // desktop 12°) — gerak tetap tertahan, tetap berjalan di semua ukuran
      // selama pengguna tidak meminta reduced-motion.
      mm.add(
        {
          motionOk: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 1024px)",
          tablet: "(min-width: 640px) and (max-width: 1023.98px)",
          phone: "(max-width: 639.98px)",
        },
        (context) => {
          const conditions = context.conditions as {
            motionOk?: boolean;
            desktop?: boolean;
            tablet?: boolean;
          };
          if (!conditions.motionOk) return;
          const rotation = conditions.desktop ? 12 : conditions.tablet ? 9 : 6;

          const root = rootRef.current;
          if (!root) return;
          const sections = gsap.utils.toArray<HTMLElement>(
            "[data-story-section]",
            root
          );
          const triggers: ScrollTrigger[] = [];

          sections.forEach((section, index) => {
            gsap.set(section, { zIndex: index + 1 });
            const inner = section.querySelector<HTMLElement>(
              "[data-story-inner]"
            );
            if (!inner || index === 0) return;

            gsap.set(inner, {
              rotation,
              transformOrigin: "bottom left",
            });
            const tween = gsap.to(inner, {
              rotation: 0,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "top 30%",
                scrub: true,
              },
            });
            if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
          });

          return () => {
            for (const trigger of triggers) trigger.kill();
          };
        }
      );
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  // Warna frame seperti sebelumnya (permintaan RR di R16c): frame 1 band
  // gelap sinematik, frame 2 plate krem, frame 3 plate cokelat. Sejak R32
  // latar opak dipindah ke `[data-story-inner]` (elemen yang BEROTASI),
  // sementara section dibiarkan transparan — supaya baji rotasi saat frame
  // masuk menampilkan frame sebelumnya (bukan latar section sendiri), jadi
  // gerakan tetap seamless sampai tepi frame menyentuh navbar.
  const tone = (index: number) => {
    if (index === 2) {
      return {
        attr: "dark" as const,
        className: "bg-[#70360A] text-[#FFFCEF]",
        rule: "border-[#FFFCEF]/25",
      };
    }
    if (index === 1) {
      return {
        attr: "light" as const,
        className: "bg-[#FFFCEF] text-[#261B13]",
        rule: "border-[#261B13]/15",
      };
    }
    return {
      attr: "dark" as const,
      className: "text-ink",
      rule: "border-line",
    };
  };

  return (
    <div ref={rootRef} role="region" aria-label={region} className="relative">
      {frames.map((frame, index) => {
        const scheme = tone(index);
        return (
          <section
            key={frame.kicker}
            data-story-section
            data-default={scheme.attr}
            className="sticky top-16 flex min-h-[calc(100svh-4rem)] w-full overflow-hidden"
          >
            <div
              data-story-inner
              data-band={index === 0 ? "" : undefined}
              className={`relative flex min-h-[calc(100svh-4rem)] w-full grow flex-col ${scheme.className}`}
            >
              <div className="shell flex grow flex-col justify-center gap-[clamp(3.5rem,15svh,10rem)] pt-10 pb-32 sm:pt-14 sm:pb-36 lg:py-16">
                <div className="flex flex-col gap-4 sm:gap-6">
                  <p className="text-xs font-medium uppercase tracking-[0.22em]">
                    {frame.kicker}
                  </p>
                  <hr className={scheme.rule} />
                  <h2 className="max-w-5xl font-display text-[clamp(2.4rem,8vw,6.5rem)] leading-[0.98] tracking-tight">
                    {frame.title}
                  </h2>
                  <p className="max-w-[46ch] text-base leading-relaxed opacity-85 sm:text-lg">
                    {frame.lead}
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:gap-6">
                  <hr className={scheme.rule} />
                  <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <p className="max-w-[54ch] text-base leading-relaxed sm:text-lg">
                      {frame.body}
                    </p>

                    {frame.facts && frame.facts.length > 0 ? (
                      <dl className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
                        {frame.facts.map((fact) => (
                          <div key={fact.label}>
                            <dt className="text-xs uppercase tracking-wide opacity-60">
                              {fact.label}
                            </dt>
                            <dd className="mt-1 font-medium">{fact.value}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}

                    {frame.links && frame.links.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {frame.links.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={
                              index === 2
                                ? "focus-ring inline-flex h-11 items-center gap-2 rounded-sm border border-[#FFFCEF]/40 px-5 text-sm font-medium text-[#FFFCEF] transition-colors hover:bg-[#FFFCEF]/10"
                                : index === 1
                                  ? "focus-ring inline-flex h-11 items-center gap-2 rounded-sm border border-[#261B13]/25 px-5 text-sm font-medium text-[#261B13] transition-colors hover:bg-[#261B13]/5"
                                  : "btn btn-secondary"
                            }
                          >
                            {link.label}
                            <ArrowIcon />
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
