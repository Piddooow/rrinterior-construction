import { serializeJsonLd } from "@/lib/seo";

/**
 * Blok data terstruktur JSON-LD (dirender server). Payload diserialisasi
 * aman (`<` → \u003c) dan tetap kompatibel dengan CSP situs — kebijakan
 * script-src saat ini memuat 'unsafe-inline' (catatan R5/R8 di next.config).
 */
export function JsonLd({ data }: { data: unknown | unknown[] }) {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((block, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(block) }}
        />
      ))}
    </>
  );
}
