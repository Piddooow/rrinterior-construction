import { Suspense } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminToasts } from "@/components/admin-toast";
import { getAdminBadgeCounts } from "@/lib/content-admin";
import { requireUser } from "@/lib/admin-auth";

/** Label peran panel (kebijakan satu peran admin untuk versi awal). */
const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  editor: "Editor",
  approver: "Penyetuju",
};

/**
 * Shell panel admin (R24a, komposisi referensi uiable yang diadaptasi ke
 * bahasa situs): sidebar dengan pencarian, dua kelompok menu berlabel,
 * kartu aksi, dan identitas pengguna di kaki sidebar — di ponsel menjadi
 * laci geser. Verifikasi sesi dilakukan di sini (DAL), bukan di Proxy,
 * sesuai panduan Next.
 */
export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const counts = await getAdminBadgeCounts();

  return (
    <>
      <a href="#admin-main" className="skip-link">
        Ke konten utama
      </a>
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col lg:flex-row">
        <AdminSidebar
          name={user.name}
          role={ROLE_LABEL[user.role] ?? user.role}
          counts={counts}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <main
            id="admin-main"
            className="admin-scope flex-1 px-5 py-6 sm:px-8 sm:py-8"
          >
            {/* Entrance halus mengikuti bahasa gerak situs (tanpa transisi
                antar-halaman sesuai permintaan klien). */}
            <div data-admin-rise>{children}</div>
          </main>
        </div>
      </div>
      <Suspense fallback={null}>
        <AdminToasts />
      </Suspense>
    </>
  );
}
