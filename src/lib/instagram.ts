/**
 * Penghitung pengikut Instagram RR — hanya lewat jalur resmi Instagram
 * Graph API (R14j). Tidak ada pengikis pihak ketiga: itu melanggar ketentuan
 * Instagram dan berisiko menampilkan angka yang salah.
 *
 * Tanpa kredensial (INSTAGRAM_ACCESS_TOKEN + INSTAGRAM_USER_ID) atau saat
 * permintaan gagal, fungsi mengembalikan null dan UI menyembunyikan angka —
 * lebih baik tanpa angka daripada angka karangan. Hasil permintaan di-cache
 * 6 jam di server sehingga halaman tetap ringan dan jauh di bawah batas
 * kuota API.
 *
 * Kredensial hanya dibaca dari environment; tidak pernah masuk ke klien.
 * Akun Instagram target harus akun Professional (Persyaratan Graph API).
 */

const GRAPH_VERSION = "v21.0";
const CACHE_SECONDS = 6 * 60 * 60;

export type InstagramFollowerInfo = {
  followers: number;
};

export async function getInstagramFollowers(): Promise<InstagramFollowerInfo | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;
  if (!token || !userId) return null;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(userId)}?fields=followers_count`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: CACHE_SECONDS },
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { followers_count?: number };
    const followers = Number(data.followers_count);
    if (!Number.isInteger(followers) || followers < 0) return null;
    return { followers };
  } catch {
    return null;
  }
}
