export { cn } from "cn";

/**
 * Slug URL sederhana dari teks bebas.
 * Dipakai chip filter direktori (lokasi/jenis) dan resolusi query-nya.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
