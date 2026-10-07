# RR Design & Build — Website & Panel Admin

Website resmi + panel admin **RR Design & Build** (interior & konstruksi, Jabodetabek).
Dibangun dengan Next.js 16 (App Router), SQLite (better-sqlite3), dan Drizzle ORM.

## Jalanin di lokal

```bash
npm install
npm run dev        # buka http://localhost:3000
```

Database `data/rr.db` ikut di repo (isi konten lengkap: proyek, media, layanan,
halaman, pengaturan). Migrasi & seed juga otomatis jalan saat build (`prebuild`),
jadi tidak ada langkah manual yang wajib.

## Bikin akun admin (sekali saja)

Snapshot database di repo sengaja **tidak menyertakan akun & sesi login**
(demi keamanan — repo ini publik). Buat akun admin pertamamu:

```bash
USER_PASSWORD="kata-sandi-kamu" npx tsx scripts/create-user.mts "Admin RR" email@kamu.com admin
```

Lalu login di **`/admin`** dengan email + kata sandi itu. Ganti kata sandi kapan
pun dari *Pengaturan → Keamanan akun*.

## Build & deploy

```bash
npm run build
npm start
```

- Unggahan runtime tersimpan di `public/uploads/` — sudah termasuk di repo.
- Tidak ada rahasia di repo ini: kata sandi admin dibuat saat deploy, `.env`
  tidak pernah ikut.
- Backup database manual: `npm run db:backup` (hasilnya di `backups/`, tidak
  ikut ke git).

## Peta singkat

| Folder | Isi |
| --- | --- |
| `src/app/[locale]` | Halaman publik (Indonesia / English) |
| `src/app/admin` | Panel admin (proyek, media, layanan, halaman, pengaturan) |
| `src/db/schema.ts` + `drizzle/` | Skema & migrasi database |
| `public/work`, `public/mock` | Foto proyek & aset arsip |
| `scripts/` | Migrasi, seed, backup, buat akun admin |
