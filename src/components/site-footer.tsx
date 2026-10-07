import Link from "next/link";
import { type Dictionary, type Locale } from "@/i18n";
import { SITE, waHref } from "@/lib/site";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { BrandLogo } from "@/components/brand-mark";
import { CopyEmail } from "@/components/ui/copy-email";
import { InstagramGlyph, WhatsAppGlyph } from "@/components/ui/channel-glyphs";

/**
 * Footer situs. Struktur mengikuti pola footer modern (ajakan kontak di
 * atas, kolom navigasi, baris legal, tanda air besar) tetapi seluruh isinya
 * berasal dari data nyata: tanpa formulir, tanpa status layanan palsu.
 * Kolom: brand + kanal sosial, Jelajahi, Karya (kategori), Kontak.
 */
export function SiteFooter({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  // Tautan WhatsApp di footer (ikondan kanal) memakai konteks footer.
  const waBase = waHref(dict.wa.footer);
  const projectsHref = `/${locale}/projects`;

  const exploreLinks = [
    { label: dict.navMenu.selectedWork, href: projectsHref },
    { label: dict.nav.services, href: `/${locale}/services` },
    { label: dict.nav.about, href: `/${locale}/about` },
    { label: dict.proof.faqTitle, href: `/${locale}/faq` },
    { label: dict.nav.help, href: `/${locale}/help` },
    { label: dict.footer.privacy, href: `/${locale}/privacy` },
  ];

  const workLinks = [
    {
      label: dict.navMenu.categoryHunian,
      href: `${projectsHref}#hunian`,
    },
    {
      label: dict.navMenu.categoryKomersial,
      href: `${projectsHref}#komersial`,
    },
    {
      label: dict.navMenu.categoryFurnitur,
      href: `${projectsHref}#furnitur`,
    },
    { label: dict.navMenu.archive, href: `/${locale}/gallery` },
    { label: dict.footer.allProjects, href: projectsHref },
  ];

  const linkClass =
    "focus-ring inline-flex min-h-11 w-fit items-center text-sm text-ink-2 transition-colors hover:text-ink lg:min-h-0";

  return (
    <footer data-band className="text-ink">
      <section
        id="contact"
        aria-labelledby="contact-title"
        className="shell grid gap-10 py-16 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:py-20"
      >
        <div>
          <h2
            id="contact-title"
            className="font-display text-balance text-4xl leading-tight sm:text-5xl"
          >
            {dict.contact.title}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-2">
            {dict.contact.body}
          </p>
        </div>
        <div className="flex flex-col items-start gap-4 lg:items-end">
          <WhatsAppButton
            message={dict.wa.footer}
            label={dict.contact.whatsapp}
          />
        </div>
      </section>

      <div className="border-t border-line">
        <div className="shell grid gap-8 py-10 sm:grid-cols-2 sm:gap-12 sm:py-14 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="flex min-w-0 max-w-xs flex-col gap-4 sm:gap-5">
            <Link
              href={`/${locale}`}
              aria-label="RR Design & Build"
              className="focus-ring w-fit"
            >
              <BrandLogo className="h-20 w-auto" />
            </Link>
            <p className="text-sm leading-relaxed text-ink-2">
              {dict.footer.blurb}
            </p>
            <ul className="flex items-center gap-2">
              <li>
                <a
                  href={waBase}
                  target="_blank"
                  rel="noopener"
                  aria-label="WhatsApp"
                  className="btn btn-secondary focus-ring size-11 p-0"
                >
                  <WhatsAppGlyph className="size-4" />
                </a>
              </li>
              <li>
                <a
                  href={SITE.instagram}
                  target="_blank"
                  rel="noopener"
                  aria-label="Instagram"
                  className="btn btn-secondary focus-ring size-11 p-0"
                >
                  <InstagramGlyph className="size-4" />
                </a>
              </li>
            </ul>
          </div>

          <nav aria-label={dict.footer.explore} className="flex flex-col gap-2.5 sm:gap-3">
            <h3 className="text-sm font-medium text-ink">
              {dict.footer.explore}
            </h3>
            {exploreLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
          </nav>

          <nav aria-label={dict.footer.work} className="flex flex-col gap-2.5 sm:gap-3">
            <h3 className="text-sm font-medium text-ink">{dict.footer.work}</h3>
            {workLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-2.5 sm:gap-3">
            <h3 className="text-sm font-medium text-ink">
              {dict.footer.channels}
            </h3>
            <a
              href={waBase}
              target="_blank"
              rel="noopener"
              className={linkClass}
            >
              {dict.footer.whatsappLabel} · {SITE.phoneDisplay}
            </a>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener"
              className={linkClass}
            >
              {SITE.instagramHandle}
            </a>
            <CopyEmail
              email={SITE.email}
              labels={{
                copy: dict.footer.emailCopy,
                copied: dict.footer.emailCopied,
                failed: dict.footer.emailFailed,
                hint: dict.footer.emailHint,
              }}
            />
            <Link href={`/${locale}/contact`} className={linkClass}>
              {dict.footer.contactPage}
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col gap-2 py-6 text-xs text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 RR Design &amp; Build. {dict.footer.rights}</p>
          <p className="sm:text-right">{dict.footer.archiveNote}</p>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none -mt-[2.5vw] select-none overflow-hidden"
      >
        <p className="translate-y-[6%] text-center font-display text-[24vw] leading-none text-ink/5">
          RR
        </p>
      </div>
    </footer>
  );
}
