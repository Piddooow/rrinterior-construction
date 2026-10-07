# Arsip migrasi SQLite (pra-migrasi PostgreSQL)

Folder ini adalah arsip beku riwayat migrasi SQLite (dialect lama).
Tooling aktif sekarang memakai **PostgreSQL**: schema di `src/db/schema.ts`
(pg-core) dan migrasi di `../drizzle/`.

Jangan mencampur SQL dua dialect dalam satu riwayat migrasi aktif.
Alasan & pemetaan lengkap: dokumen audit internal Fase 0.
