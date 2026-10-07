/** Bentuk tampilan layanan (teks sudah dipilih sesuai locale). */
export type ServiceView = {
  number: string;
  title: string;
  description: string;
};

/**
 * Daftar layanan terkonfirmasi dari database (published-only).
 * Dipakai beranda dan halaman Layanan agar tampilannya satu sumber.
 */
export function ServiceGrid({
  services,
  empty,
}: {
  services: ServiceView[];
  empty: string;
}) {
  if (services.length === 0) {
    return <p className="mt-12 text-center text-sm text-ink-2">{empty}</p>;
  }

  return (
    <div className="mt-12 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <div key={service.number} data-reveal className="bg-canvas p-6 sm:p-8">
          <span className="font-display text-sm text-ink-3">
            /{service.number}
          </span>
          <h3 className="mt-3 font-display text-xl leading-snug">
            {service.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            {service.description}
          </p>
        </div>
      ))}
    </div>
  );
}
