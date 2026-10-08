import Link from "next/link";
import { waHref } from "@/lib/site";
import type { ProjectCardView } from "@/lib/view-models";
import { ProjectLabels } from "@/components/project-labels";
import { BrandLogo } from "@/components/brand-mark";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { MediaImage } from "@/components/ui/media-image";

/**
 * Kartu proyek untuk beranda dan direktori.
 * `href` opsional: bila tersedia, foto dan judul menuju halaman detail.
 * Nomor urut opsional (/01) untuk strip beranda; badge hanya muncul bila
 * jenis media diketahui; tanpa gambar tetap tampil sebagai bidang kosong
 * netral dengan label jujur (bukan klaim atau foto proyek lain).
 */
export function ProjectCard({
  card,
  number,
  badge,
  cta,
  photoFallback,
  href,
  priority = false,
  reveal = true,
  fade = false,
}: {
  card: ProjectCardView;
  number?: string;
  badge: { render: string; site: string };
  cta: string;
  photoFallback: string;
  href?: string;
  priority?: boolean;
  /**
   * `false` = jangan pasang data-reveal — untuk grid yang punya animasi
   * masuknya sendiri (mis. explorer direktori yang mengelola animasinya),
   * supaya tidak ada dua sistem menganimasikan elemen yang sama.
   */
  reveal?: boolean;
  /**
   * `true` = foto sedikit diredam (saturate 88%) dan terekspos penuh saat
   * hover/ditekan. Veil gradasi bawah kini standar untuk semua foto
   * (Tahap R2, `.photo-veil`) dan ikut menghilang saat foto disorot.
   */
  fade?: boolean;
}) {
  const media = (
    <div className="group relative aspect-[4/5] overflow-hidden rounded-md bg-subtle">
      {card.image ? (
        <MediaImage
          src={card.image.src}
          alt={card.image.alt}
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 78vw"
          loading={priority ? "eager" : "lazy"}
          className={
            fade
              ? "object-cover transition-[scale,filter] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] saturate-[.88] group-hover:scale-[1.03] group-hover:saturate-100 group-active:saturate-100"
              : "object-cover transition-[scale] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          }
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <BrandLogo className="h-14 w-14 opacity-50" />
          <p className="text-xs leading-relaxed text-ink-3">
            {photoFallback}
          </p>
        </div>
      )}
      <span aria-hidden="true" className="photo-veil" />
      {card.image && card.role ? (
        <span className="label-plate absolute left-3 top-3">
          {card.role === "render" ? badge.render : badge.site}
        </span>
      ) : null}
      {number ? (
        <span className="label-plate absolute right-3 top-3">/{number}</span>
      ) : null}
    </div>
  );

  return (
    <article
      data-reveal={reveal ? "" : undefined}
      className="flex h-full flex-col"
    >
      {href ? (
        <Link href={href} className="focus-ring block rounded-md">
          {media}
        </Link>
      ) : (
        media
      )}
      <h3 className="mt-4 font-display text-balance text-xl leading-snug">
        {href ? (
          <Link
            href={href}
            className="focus-ring inline-flex min-h-11 items-center underline-offset-4 hover:underline decoration-line-strong lg:min-h-0"
          >
            {card.title}
          </Link>
        ) : (
          card.title
        )}
      </h3>
      {card.meta ? (
        <p className="mt-1.5 text-sm text-ink-2">{card.meta}</p>
      ) : null}
      <ProjectLabels location={card.location} status={card.status} />
      <a
        href={waHref(card.waMessage)}
        target="_blank"
        rel="noopener"
        className="focus-ring group/cta mt-4 inline-flex min-h-11 w-fit items-center gap-2.5 text-sm font-medium text-ink lg:min-h-0"
      >
        {cta}
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center rounded-full border border-line-strong transition-colors duration-200 group-hover/cta:border-primary group-hover/cta:bg-primary group-hover/cta:text-primary-ink group-focus-visible/cta:border-primary group-focus-visible/cta:bg-primary group-focus-visible/cta:text-primary-ink"
        >
          <ArrowIcon />
        </span>
      </a>
    </article>
  );
}
