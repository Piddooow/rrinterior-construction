import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";

/** Bentuk tampilan testimoni (teks sudah dipilih sesuai locale). */
export type TestimonialView = {
  quote: string;
  author: string;
  context: string;
};

/** Bentuk tampilan pertanyaan resmi. */
export type FaqView = {
  question: string;
  answer: string;
};

/**
 * Testimoni & pertanyaan resmi — hanya dirender bila kontennya ada.
 * QC22: komponen opsional tanpa konten terkonfirmasi disembunyikan,
 * tanpa heading kosong dan tanpa contoh karangan.
 */
export function TestimonialsFaq({
  testimonials,
  faqs,
  labels,
  bare = false,
}: {
  testimonials: TestimonialView[];
  faqs: FaqView[];
  labels: { testimonialsTitle: string; testimonialsLead?: string; faqTitle: string; prev: string; next: string };
  /** Tanpa kelas `shell`: untuk dipasang di dalam kolom yang sudah ber-padding. */
  bare?: boolean;
}) {
  if (testimonials.length === 0 && faqs.length === 0) return null;
  const sectionClass = bare ? "section-y" : "shell section-y";

  return (
    <>
      {testimonials.length > 0 ? (
        <section
          className={sectionClass}
          aria-labelledby="testimonials-title"
        >
          <h2
            id="testimonials-title"
            className="font-display text-balance text-3xl leading-tight sm:text-4xl"
          >
            {labels.testimonialsTitle}
          </h2>
          {labels.testimonialsLead ? (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-2 sm:text-base">
              {labels.testimonialsLead}
            </p>
          ) : null}
          {/* Satu komponen dengan Beranda (permintaan RR): "What clients say"
              tampil sebagai dek bergeser yang sama. */}
          <div className="mt-10 sm:mt-12">
            <StaggerTestimonials
              items={testimonials.map((item, i) => ({
                id: `tst-${String(i + 1).padStart(2, "0")}`,
                quote: item.quote,
                author: item.author,
                context: item.context || undefined,
              }))}
              labels={{
                region: labels.testimonialsTitle,
                prev: labels.prev,
                next: labels.next,
              }}
            />
          </div>
        </section>
      ) : null}

      {faqs.length > 0 ? (
        <section className={sectionClass} aria-labelledby="faq-title">
          <h2
            id="faq-title"
            className="font-display text-balance text-3xl leading-tight sm:text-4xl"
          >
            {labels.faqTitle}
          </h2>
          <dl className="mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-2">
            {faqs.map((item) => (
              <div
                key={item.question}
                className="border-t border-line-strong pt-4"
              >
                <dt className="font-display text-lg leading-snug">
                  {item.question}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-2">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </>
  );
}
