# RR Design & Build — Website & Panel Admin

Website resmi + panel admin **RR Design & Build** (interior & konstruksi, Jabodetabek).
Dibangun dengan Next.js 16 (App Router), PostgreSQL (Neon) via driver `pg`, dan Drizzle ORM.

## Jalanin di lokal

```bash
npm install
npm run dev        # buka http://localhost:3000
```

Database aktif: PostgreSQL (Neon). Isi `DATABASE_URL` di `.env.local` (tidak ikut
repo), lalu siapkan schema & konten awal:

```bash
npm run db:migrate   # buat schema
npm run db:seed      # konten awal (idempoten, aman diulang)
```

`data/rr.db` adalah arsip SQLite pra-migrasi (versi di repo tanpa akun/sesi).

## Bikin akun admin (sekali saja)

Snapshot database di repo sengaja **tidak menyertakan akun & sesi login**
(demi keamanan — repo ini publik). Buat akun admin pertamamu:

```bash
USER_PASSWORD="kata-sandi-kamu" npm run db:user -- "Admin RR" email@kamu.com admin
```

Lalu login di **`/admin`** dengan email + kata sandi itu. Ganti kata sandi kapan
pun dari *Pengaturan → Keamanan akun*.

## Build & deploy

```bash
npm run build
npm start
```

- Unggahan runtime tersimpan di `public/uploads/` — sudah termasuk di repo.
- Tidak ada rahasia di repo ini: kata sandi admin dibuat saat deploy, kredensial
  (`DATABASE_URL`, dll.) lewat environment dan tidak pernah ikut.
- Backup arsip SQLite pra-migrasi: `npm run db:backup` (hasilnya di `backups/`,
  tidak ikut ke git).

## Peta singkat

| Folder | Isi |
| --- | --- |
| `src/app/[locale]` | Halaman publik (Indonesia / English) |
| `src/app/admin` | Panel admin (proyek, media, layanan, halaman, pengaturan) |
| `src/db/schema.ts` + `drizzle/` | Skema PostgreSQL & migrasi aktif (`drizzle-sqlite/` = arsip) |
| `public/work`, `public/mock` | Foto proyek & aset arsip |
| `scripts/` | Migrasi, seed, backup, buat akun admin |
