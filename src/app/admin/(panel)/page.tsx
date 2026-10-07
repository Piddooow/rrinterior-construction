import Link from "next/link";
import { Plus } from "lucide-react";
import {
  getAdminOverview,
  getAdminStats,
  listProjectsForAdmin,
} from "@/lib/content-admin";
import { getCurrentUser } from "@/lib/admin-auth";
import { DashboardLive } from "@/components/admin-dashboard-live";
import { AdminBarChart } from "@/components/admin-bar-chart";
import { MediaImage } from "@/components/ui/media-image";

const STATUS_LABEL: Record<string, string> = {
  published: "Terbit",
  draft: "Draf",
  trashed: "Trash",
};

const CATEGORY_LABEL: Record<string, string> = {
  hunian: "Hunian",
  komersial: "Komersial & Hospitality",
  furnitur: "Furnitur & Interior",
};

/**
 * Dasbor panel (R24b): hanya poin utama — empat angka kunci, sebaran
 * portofolio, kelengkapan konten, dan proyek terbaru. Semua angka dihitung
 * NYATA dari basis data; tidak ada metrik karangan. Aksi cepat, ringkasan
 * konten, kanal, dan daftar "terbaru diperbarui" dipindahkan/disederhanakan
 * supaya layar ini mudah dibaca dalam sekali lihat.
 */
export default async function AdminHomePage() {
  const [stats, overview, projectRows, user] = await Promise.all([
    getAdminStats(),
    getAdminOverview(),
    listProjectsForAdmin(),
    getCurrentUser(),
  ]);

  const firstName = (user?.name ?? "tim RR").split(/\s+/)[0];
  const latest = [...projectRows]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);
  const pct =
    overview.completeness.total > 0
      ? Math.round(
          (overview.completeness.ready / overview.completeness.total) * 100
        )
      : 100;

  const kpis = [
    {
      label: "Proyek terbit",
      value: stats.projects.published,
      hint: "Tampil di situs publik.",
    },
    {
      label: "Proyek draf",
      value: stats.projects.draft,
      hint:
        stats.projects.draft > 0
          ? "Menunggu diterbitkan."
          : "Tidak ada draf tertunda.",
    },
    {
      label: "Media siap tayang",
      value: stats.mediaReady,
      hint: "Sudah berizin tayang.",
    },
    {
      label: "Media perlu izin",
      value: overview.mediaNeedsConsent,
      hint:
        overview.mediaNeedsConsent > 0
          ? "Tandai izin sebelum dipakai."
          : "Semua media sudah berizin.",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Kepala halaman */}
      <div className="flex flex-wrap items-start gap-4">
        <div>
          <h1 className="font-display text-balance text-3xl leading-tight sm:text-4xl">
            Ringkasan
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-2">
            Selamat kembali, {firstName}. Angka di halaman ini diambil
            langsung dari basis data.
          </p>
        </div>
        <div className="ml-auto flex flex-col items-end gap-2">
          <Link href="/admin/projects/new" className="btn btn-primary">
            <Plus aria-hidden="true" className="size-4" />
            Tambah proyek
          </Link>
          <DashboardLive />
        </div>
      </div>

      {/* Empat angka kunci */}
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((card) => (
          <li
            key={card.label}
            data-admin-kpi
            className="admin-lift rounded-md border border-line bg-surface p-5"
          >
            <p className="text-xs text-ink-3">{card.label}</p>
            <p className="mt-2 font-display text-3xl leading-none">
              {card.value}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink-2">
              {card.hint}
            </p>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Sebaran portofolio */}
        <section className="rounded-md border border-line bg-surface p-5">
          <h2 className="text-sm font-medium">Sebaran portofolio</h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-3">
            Jumlah proyek per tahun dan kategori, dari arsip yang ada.
          </p>
          <AdminBarChart
            year={overview.projectsByYear}
            category={overview.projectsByCategory.map((item) => ({
              label: CATEGORY_LABEL[item.id] ?? item.id,
              value: item.value,
            }))}
          />
        </section>

        {/* Kelengkapan konten */}
        <section className="rounded-md border border-line bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium">Kelengkapan konten</h2>
            <span className="font-display text-2xl leading-none">{pct}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Kelengkapan konten proyek terbit"
            className="mt-3 h-2 w-full overflow-hidden rounded-full bg-subtle"
          >
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-3">
            {overview.completeness.ready} dari {overview.completeness.total}{" "}
            proyek terbit sudah lengkap, artinya punya foto utama dan
            ringkasan.
          </p>
        </section>
      </div>

      {/* Proyek terbaru */}
      <section className="rounded-md border border-line bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="text-sm font-medium">Proyek terbaru</h2>
          <Link
            href="/admin/projects"
            className="focus-ring text-xs text-ink-3 underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Semua proyek
          </Link>
        </div>
        {latest.length === 0 ? (
          <p className="px-5 py-4 text-sm text-ink-3">Belum ada proyek.</p>
        ) : (
          <ul className="divide-y divide-line">
            {latest.map((project) => (
              <li key={project.id} className="flex items-center gap-3 px-5 py-3">
                <span className="relative block size-10 shrink-0 overflow-hidden rounded-md bg-subtle">
                  {project.coverUrl ? (
                    <MediaImage
                      src={project.coverUrl}
                      alt=""
                      width={80}
                      height={80}
                      className="size-10 object-cover"
                    />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="focus-ring block truncate text-sm text-ink transition-colors hover:text-primary"
                  >
                    {project.titleEn ?? project.titleId ?? project.slug}
                  </Link>
                  <span className="text-xs text-ink-3">
                    {project.yearCompleted ? `${project.yearCompleted} · ` : ""}
                    {STATUS_LABEL[project.contentStatus] ??
                      project.contentStatus}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
