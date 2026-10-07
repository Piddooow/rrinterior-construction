import { listSettingsForAdmin } from "@/lib/content-admin";
import {
  AdminSettingsForm,
  type AdminSettingGroup,
  type AdminSettingRow,
} from "@/components/admin-settings-form";
import { AdminPasswordForm } from "@/components/admin-password-form";

/**
 * Label & keterangan per kunci pengaturan. `used: false` berarti nilai masih
 * cadangan — disimpan tetapi belum dipakai tampilan mana pun (dicatat di UI,
 * bukan disembunyikan).
 */
const META: Record<
  string,
  { label: string; hint: string; used: boolean }
> = {
  site_name: {
    label: "Nama situs",
    hint: "Cadangan untuk metadata/teks identitas.",
    used: false,
  },
  service_area: {
    label: "Wilayah layanan",
    hint: "Cadangan untuk teks jangkauan wilayah.",
    used: false,
  },
  public_language: {
    label: "Bahasa publik bawaan",
    hint: "Cadangan (nilai: en / id).",
    used: false,
  },
  default_theme: {
    label: "Tema bawaan pengunjung baru",
    hint: "Cadangan (terang / gelap / auto).",
    used: false,
  },
  whatsapp_number: {
    label: "Nomor WhatsApp (kanonik)",
    hint: "Dipakai tombol WhatsApp seluruh situs (tanpa + dan spasi).",
    used: true,
  },
  whatsapp_display: {
    label: "Nomor tampilan",
    hint: "Teks nomor yang dibaca pengunjung.",
    used: true,
  },
  instagram_url: {
    label: "URL Instagram",
    hint: "Tautan keluar ke profil Instagram.",
    used: true,
  },
  instagram_handle: {
    label: "Akun Instagram",
    hint: "Teks @akun yang ditampilkan.",
    used: true,
  },
  wa_message_base: {
    label: "Pesan WhatsApp umum",
    hint: "Teks awal tombol WhatsApp umum.",
    used: true,
  },
  wa_message_project: {
    label: "Pesan WhatsApp dari proyek",
    hint: "Dipakai tombol WhatsApp di detail proyek; tempat khusus {title}, {details}, {url}.",
    used: true,
  },
  wa_message_services: {
    label: "Pesan WhatsApp layanan",
    hint: "Dipakai tombol WhatsApp di halaman Layanan.",
    used: true,
  },
  prep_title: {
    label: "Judul persiapan awal",
    hint: "Judul blok persiapan di halaman Layanan.",
    used: true,
  },
  prep_body: {
    label: "Isi persiapan awal",
    hint: "Isi blok persiapan di halaman Layanan.",
    used: true,
  },
};

const GROUP_ORDER = ["kontak", "umum", "tampilan"];

const GROUP_LABEL: Record<string, string> = {
  kontak: "Kontak & pesan",
  umum: "Umum",
  tampilan: "Tampilan",
};

const GROUP_DESCRIPTION: Record<string, string> = {
  kontak: "Kanal kontak dan pesan WhatsApp yang dipakai tombol situs.",
  umum: "Teks umum halaman layanan.",
  tampilan: "Preferensi tampilan pengunjung baru.",
};

/** Pengaturan NYATA dari basis data, dikelompokkan dengan label manusiawi. */
export default async function AdminSettingsPage() {
  const rows = await listSettingsForAdmin();

  const grouped = new Map<string, AdminSettingRow[]>();
  for (const row of rows) {
    const meta = META[row.key] ?? {
      label: row.key,
      hint: "Belum ada keterangan untuk kunci ini.",
      used: false,
    };
    const list = grouped.get(row.group) ?? [];
    list.push({
      key: row.key,
      label: meta.label,
      hint: meta.hint,
      used: meta.used,
      multiline:
        (row.valueEn?.includes("\n") ?? false) ||
        (row.valueId?.includes("\n") ?? false),
      valueEn: row.valueEn ?? "",
      valueId: row.valueId ?? "",
    });
    grouped.set(row.group, list);
  }

  const groups: AdminSettingGroup[] = [...grouped.entries()]
    .sort((a, b) => {
      const indexA = GROUP_ORDER.indexOf(a[0]);
      const indexB = GROUP_ORDER.indexOf(b[0]);
      return (
        (indexA === -1 ? GROUP_ORDER.length : indexA) -
        (indexB === -1 ? GROUP_ORDER.length : indexB)
      );
    })
    .map(([id, items]) => ({
      id,
      label: GROUP_LABEL[id] ?? id,
      description: GROUP_DESCRIPTION[id] ?? "",
      items,
    }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-balance text-3xl leading-tight sm:text-4xl">
          Pengaturan
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-2">
          Kontak, pesan WhatsApp, dan teks situs yang tersimpan di basis data.
          Nilai yang diubah langsung menyegarkan halaman publik; baris
          berlabel “Cadangan” disimpan untuk penyambungan berikutnya.
        </p>
      </div>

      <AdminSettingsForm groups={groups} />

      <section aria-labelledby="security-title" className="flex flex-col gap-4">
        <div>
          <h2
            id="security-title"
            className="font-display text-2xl leading-snug"
          >
            Keamanan akun
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-2">
            Ganti kata sandi panel Anda di sini. Setelah tersimpan, gunakan
            kata sandi baru pada sesi masuk berikutnya.
          </p>
        </div>
        <AdminPasswordForm />
      </section>
    </div>
  );
}
