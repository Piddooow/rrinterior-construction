import type { Dictionary, Locale } from "@/i18n";
import type { PublicProject, PublicService } from "@/lib/content";
import { pickLocalized } from "@/lib/view-models";
import { workCategoryHref } from "@/lib/work-categories";

/**
 * Model navigasi utama (header & footer). Satu sumber untuk label bahasa,
 * tautan, dan isi dropdown — dipakai bilah atas (desktop & seluler) dan
 * kolom footer.
 *
 * Aturan: hanya menautkan halaman yang sudah ada. Item "Arsip & Galeri"
 * ditambahkan saat halamannya dibangun (Tahap 3), supaya tidak pernah ada
 * tautan mati.
 */

export type NavLeaf = {
  key: string;
  label: string;
  description?: string;
  href: string;
};

export type NavCard = {
  kicker: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  image: { src: string; alt: string } | null;
};

export type WorkMenu = {
  label: string;
  leaves: NavLeaf[];
  featured: NavCard | null;
};

export type ServicesMenu = {
  label: string;
  leaves: NavLeaf[];
  process: NavLeaf;
};

export type NavData = {
  work: WorkMenu;
  services: ServicesMenu;
  about: { label: string; href: string };
  contact: { label: string; href: string };
  faq: { label: string; href: string };
  help: { label: string; href: string };
};

export function buildNavData({
  locale,
  dict,
  services,
  latestProject,
}: {
  locale: Locale;
  dict: Dictionary;
  services: PublicService[];
  latestProject: PublicProject | null;
}): NavData {
  const categories: NavLeaf[] = [
    {
      key: "hunian",
      label: dict.navMenu.categoryHunian,
      description: dict.navMenu.categoryHunianDesc,
      href: workCategoryHref(locale, "hunian"),
    },
    {
      key: "komersial",
      label: dict.navMenu.categoryKomersial,
      description: dict.navMenu.categoryKomersialDesc,
      href: workCategoryHref(locale, "komersial"),
    },
    {
      key: "furnitur",
      label: dict.navMenu.categoryFurnitur,
      description: dict.navMenu.categoryFurniturDesc,
      href: workCategoryHref(locale, "furnitur"),
    },
  ];

  const featured: NavCard | null = latestProject
    ? {
        kicker: dict.navMenu.latest,
        title: pickLocalized(latestProject.title, locale, latestProject.slug),
        description: [
          pickLocalized(latestProject.scopeOfWork, locale, ""),
          latestProject.generalLocation ?? "",
          latestProject.yearCompleted ? String(latestProject.yearCompleted) : "",
        ]
          .filter(Boolean)
          .join(" · "),
        href: `/${locale}/projects/${latestProject.slug}`,
        cta: dict.navMenu.viewProject,
        image: latestProject.cover
          ? {
              src: latestProject.cover.url,
              alt: pickLocalized(latestProject.cover.alt, locale, ""),
            }
          : null,
      }
    : null;

  return {
    work: {
      label: dict.nav.work,
      leaves: [
        {
          key: "all",
          label: dict.navMenu.selectedWork,
          description: dict.navMenu.selectedWorkDesc,
          href: `/${locale}/projects`,
        },
        ...categories,
        {
          key: "archive",
          label: dict.navMenu.archive,
          description: dict.navMenu.archiveDesc,
          href: `/${locale}/gallery`,
        },
      ],
      featured,
    },
    services: {
      label: dict.nav.services,
      leaves: services.map((service) => ({
        key: service.slug,
        label: pickLocalized(service.title, locale, service.slug),
        description: pickLocalized(service.description, locale, ""),
        href: `/${locale}/services`,
      })),
      process: {
        key: "process",
        label: dict.navMenu.process,
        description: dict.navMenu.processDesc,
        href: `/${locale}/services#process`,
      },
    },
    about: { label: dict.nav.about, href: `/${locale}/about` },
    contact: { label: dict.nav.contact, href: `/${locale}/contact` },
    faq: { label: dict.proof.faqTitle, href: `/${locale}/faq` },
    help: { label: dict.nav.help, href: `/${locale}/help` },
  };
}
