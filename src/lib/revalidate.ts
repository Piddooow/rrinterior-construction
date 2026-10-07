import { revalidatePath } from "next/cache";

/**
 * Segarkan situs publik setelah aksi tulis admin. Halaman publik memakai
 * ISR (revalidate = 300); satu panggilan pada layout root menandai seluruh
 * rute lama sehingga kunjungan berikutnya membaca data terbaru — terbit,
 * tarik kembali, pindah ke Trash, dan pulihkan langsung terlihat.
 * Halaman admin tidak terpengaruh (selalu dinamis karena sesi).
 *
 * R5 menambahkan penyegaran daftar sitemap karena isinya ikut berubah saat
 * proyek diterbitkan atau ditarik (sitemap dibaca mesin pencari).
 */
export function revalidatePublicSite(): void {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
}
