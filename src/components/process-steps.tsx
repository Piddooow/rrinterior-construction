/** Bentuk tampilan langkah proses (teks sudah dipilih sesuai locale). */
export type ProcessStepView = {
  number: string;
  title: string;
  description: string;
};

/**
 * Alur konsultasi terkonfirmasi dari database (published-only).
 * Dipakai beranda dan halaman Layanan agar urutannya satu sumber.
 */
export function ProcessSteps({
  steps,
  empty,
}: {
  steps: ProcessStepView[];
  empty: string;
}) {
  if (steps.length === 0) {
    return <p className="mt-12 text-sm text-ink-2">{empty}</p>;
  }

  return (
    <ol className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((step) => (
        <li key={step.number} data-reveal className="border-t border-line-strong pt-4">
          <span className="text-[13px] font-semibold tracking-[0.14em] tabular-nums text-ink-3">
            {step.number}
          </span>
          <h3 className="mt-2 text-[17px] leading-snug font-semibold">
            {step.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            {step.description}
          </p>
        </li>
      ))}
    </ol>
  );
}
