import Link from "next/link";

/**
 * Panduan panel untuk tim RR (R5): bahasa sehari hari, langkah pendek, dan
 * tautan langsung ke layar yang dimaksud. Halaman ini murni teks bantuan,
 * tidak membaca basis data.
 */

const stepLink =
  "focus-ring font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-primary";

export const metadata = {
  title: "Panduan | Panel Admin RR Design & Build",
  robots: { index: false, follow: false },
};

export default function AdminGuidePage() {
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div>
        <h1 className="font-display text-balance text-3xl leading-tight sm:text-4xl">
          Panduan singkat
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Halaman ini menjelaskan cara mengelola situs sehari hari. Tidak perlu
          pengetahuan teknis. Semua perubahan bisa Anda lihat dulu lewat
          Pratinjau sebelum tayang.
        </p>
      </div>

      <section className="rounded-md border border-line bg-surface p-5">
        <h2 className="font-display text-xl leading-snug">
          1. Masuk dan keluar
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Buka alamat situs lalu tambahkan <code>/admin</code> pada alamatnya.
          Masukkan email dan kata sandi tim. Tombol Keluar ada di kanan atas.
          Sesi berakhir sendiri setelah 7 hari, dan Anda bisa keluar kapan pun.
        </p>
      </section>

      <section className="rounded-md border border-line bg-surface p-5">
        <h2 className="font-display text-xl leading-snug">
          2. Menambah proyek baru
        </h2>
        <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed text-ink-2">
          <li>
            Buka menu <Link href="/admin/projects" className={stepLink}>Proyek</Link>{" "}
            lalu tekan Tambah proyek.
          </li>
          <li>
            Isi judul. Kolom alamat halaman terisi otomatis dari judul versi
            Inggris, jadi biasanya tidak perlu diubah.
          </li>
          <li>
            Unggah foto utama pada bagian sampul, lalu pilih labelnya, Render
            atau Foto lapangan.
          </li>
          <li>
            Lengkapi ringkasan, lingkup pekerjaan, lokasi umum, dan tahun bila
            sudah pasti. Yang belum pasti boleh dibiarkan kosong.
          </li>
          <li>
            Tekan Simpan draf untuk mengendapkan pekerjaan, atau Terbitkan agar
            langsung tampil di situs.
          </li>
          <li>
            Tekan Pratinjau untuk melihat hasilnya seperti yang dilihat
            pengunjung.
          </li>
        </ol>
      </section>

      <section className="rounded-md border border-line bg-surface p-5">
        <h2 className="font-display text-xl leading-snug">
          3. Mengunggah foto atau video
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Semua berkas masuk lewat menu{" "}
          <Link href="/admin/media" className={stepLink}>Media</Link>. Jenis dan
          ukuran berkas diperiksa otomatis, dan unggahan yang gagal bisa
          diulang. Tandai izin tayang sebelum berkas dipakai di proyek.
        </p>
      </section>

      <section className="rounded-md border border-line bg-surface p-5">
        <h2 className="font-display text-xl leading-snug">
          4. Menata galeri di halaman proyek
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Di editor proyek, bagian Galeri media menyediakan tiga hal. Tempelkan
          media dari pustaka, geser urutannya naik atau turun, dan lepas media
          yang tidak dipakai. Berkas yang dilepas tetap aman di pustaka.
        </p>
      </section>

      <section className="rounded-md border border-line bg-surface p-5">
        <h2 className="font-display text-xl leading-snug">
          5. Menerbitkan, menarik, dan menghapus
        </h2>
        <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-ink-2">
          <li>
            <strong>Terbitkan</strong> menampilkan proyek di situs publik,
            langsung saat itu juga.
          </li>
          <li>
            <strong>Jadikan draf</strong> menyembunyikannya lagi tanpa
            menghapus apa pun.
          </li>
          <li>
            <strong>Hapus</strong> memindahkan item ke Tempat sampah, bukan
            menghilangkannya permanen.
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Pengunjung selalu melihat versi yang sudah diterbitkan saja.
        </p>
      </section>

      <section className="rounded-md border border-line bg-surface p-5">
        <h2 className="font-display text-xl leading-snug">
          6. Salah menghapus?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Buka{" "}
          <Link href="/admin/trash" className={stepLink}>Tempat sampah</Link>,
          cari itemnya, lalu tekan Pulihkan. Item kembali sebagai draf dan bisa
          diterbitkan ulang.
        </p>
      </section>

      <section className="rounded-md border border-line bg-surface p-5">
        <h2 className="font-display text-xl leading-snug">
          7. Mengganti kata sandi
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Buka{" "}
          <Link href="/admin/settings" className={stepLink}>Pengaturan</Link>{" "}
          lalu bagian Keamanan akun. Isi kata sandi saat ini dan kata sandi
          baru dua kali.
        </p>
      </section>

      <section className="rounded-md border border-line bg-subtle p-5">
        <h2 className="font-display text-xl leading-snug">
          8. Kalau ragu, tanyakan dulu
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Tidak ada perubahan yang hilang tanpa jejak. Kalau ada yang terasa
          aneh atau Anda tidak yakin, jangan ragu bertanya ke tim pengembang
          sebelum menekan Terbitkan.
        </p>
      </section>
    </div>
  );
}
