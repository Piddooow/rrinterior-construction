"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { initGsap, prefersReducedMotion } from "@/lib/motion";
import { MediaImage } from "@/components/ui/media-image";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { cn } from "@/lib/utils";

/**
 * Foto arsip yang "membuka" saat digulir: bingkai mulai menyempit (clip
 * inset) lalu melebar sampai penuh layar, dengan foto yang perlahan
 * menenangkan zoom-nya. Non-pin — hanya clip & transform, jadi tidak ada
 * pergeseran tata letak. Reduced-motion: tampil penuh sejak awal, statis.
 * Semua teks memakai label Render/Foto Lapangan dan judul proyek asli;
 * CTA membawa konteks proyek ke WhatsApp.
 */
export function ScrollExpand({
  image,
  title,
  plate,
  ctaLabel,
  waMessage,
  className,
}: {
  image: { src: string; alt: string };
  title: string;
  plate: string;
  ctaLabel: string;
  waMessage: string;
  className?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      initGsap();
      const frameEl = frame.current;
      if (!frameEl || prefersReducedMotion()) return;

      const imageEl = frameEl.querySelector("img");
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top 82%",
          end: "top 20%",
          scrub: 0.6,
        },
      });
      tl.fromTo(
        frameEl,
        { clipPath: "inset(19% 21% 19% 21% round 20px)" },
        { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none" },
        0,
      );
      if (imageEl) {
        tl.fromTo(imageEl, { scale: 1.18 }, { scale: 1.0, ease: "none" }, 0);
      }
      if (caption.current) {
        tl.fromTo(
          caption.current,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, ease: "power2.out" },
          0.35,
        );
      }
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-label={title}
      className={cn("overflow-x-clip", className)}
    >
      <div
        ref={frame}
        className="relative h-[58vh] min-h-[340px] overflow-hidden sm:h-[72vh]"
      >
        <MediaImage
          src={image.src}
          alt={image.alt}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <span aria-hidden className="photo-veil" />
        <div
          ref={caption}
          className="absolute inset-x-0 bottom-0"
          style={{ color: "var(--media-caption-foreground)" }}
        >
          <div className="shell flex flex-wrap items-end justify-between gap-4 pb-6 sm:pb-8">
            <div className="max-w-2xl">
              <span className="label-plate">{plate}</span>
              <h2 className="mt-3 font-display text-2xl leading-tight text-balance sm:text-4xl">
                {title}
              </h2>
            </div>
            <WhatsAppButton message={waMessage} label={ctaLabel} />
          </div>
        </div>
      </div>
    </section>
  );
}
