/**
 * Dibuat oleh scripts/build-archive.py dari arsip publik RR
 * (data-foto/). Jangan sunting manual — jalankan ulang skripnya.
 *
 * excerpt = potongan caption asli (bahasa Indonesia) tanpa hashtag
 * dan baris promosi. Video dari arsip asli tidak ditampilkan.
 */
export type ArchivePost = {
  shortcode: string;
  /** Tanggal unggahan asli (ISO). */
  date: string;
  year: number;
  /** Potongan caption asli; boleh kosong. */
  excerpt: string;
  photos: number;
  hasVideo: boolean;
  cover: { src: string; width: number; height: number };
};

export const archiveStats = {
  total: 95,
  withPhotos: 79,
  videoOnly: 16,
} as const;

export const archivePosts: ArchivePost[] = [
  {
    "shortcode": "DajgrebHfg-",
    "date": "2026-07-09",
    "year": 2026,
    "excerpt": "",
    "photos": 3,
    "hasVideo": false,
    "cover": {
      "src": "/archive/DajgrebHfg-.jpg",
      "width": 900,
      "height": 547
    }
  },
  {
    "shortcode": "DZuLxq8kesp",
    "date": "2026-06-18",
    "year": 2026,
    "excerpt": "",
    "photos": 4,
    "hasVideo": false,
    "cover": {
      "src": "/archive/DZuLxq8kesp.jpg",
      "width": 893,
      "height": 498
    }
  },
  {
    "shortcode": "DYmAqHTHV9m",
    "date": "2026-05-21",
    "year": 2026,
    "excerpt": "",
    "photos": 3,
    "hasVideo": false,
    "cover": {
      "src": "/archive/DYmAqHTHV9m.jpg",
      "width": 768,
      "height": 487
    }
  },
  {
    "shortcode": "DW3RMIoktdE",
    "date": "2026-04-08",
    "year": 2026,
    "excerpt": "Pekerjaan design kamar tidur dan juga toilet yang terkesan minimalis dengan suasana yang warm pasti akan membuat anda betah berada didalamnya dan bisa jadi…",
    "photos": 3,
    "hasVideo": false,
    "cover": {
      "src": "/archive/DW3RMIoktdE.jpg",
      "width": 900,
      "height": 502
    }
  },
  {
    "shortcode": "DWnqlPukpFw",
    "date": "2026-04-02",
    "year": 2026,
    "excerpt": "Kitchen set design pilihan mu seperti ini? Swipe kanan untuk melihat design dengan lampu untuk menambah kesan elegan pada kitchen set mu.",
    "photos": 2,
    "hasVideo": false,
    "cover": {
      "src": "/archive/DWnqlPukpFw.jpg",
      "width": 900,
      "height": 506
    }
  },
  {
    "shortcode": "DWk36ZDknE_",
    "date": "2026-04-01",
    "year": 2026,
    "excerpt": "Mempunyai ruang tamu yang bertemakan nature memang terkadang memberikan resiko, tapi kalau dipadukan dengan sentuhan classic yang elegant pasti akan membuat…",
    "photos": 3,
    "hasVideo": false,
    "cover": {
      "src": "/archive/DWk36ZDknE_.jpg",
      "width": 900,
      "height": 502
    }
  },
  {
    "shortcode": "DG5DSMETIUa",
    "date": "2025-03-07",
    "year": 2025,
    "excerpt": "Project type : house renovation Location : tangerang Year : 2024 Status : Completed Menambahkan bangunan di belakang rumah existing membutuhkan ketepatan dalam…",
    "photos": 5,
    "hasVideo": true,
    "cover": {
      "src": "/archive/DG5DSMETIUa.jpg",
      "width": 720,
      "height": 899
    }
  },
  {
    "shortcode": "DFKD-i9ThUv",
    "date": "2025-01-23",
    "year": 2025,
    "excerpt": "Project type : furniture - residential Location : meruya Year : 2024 Status : Completed Kebutuhan furniture untuk rumah sangat penting. Dengan kualitas yang…",
    "photos": 4,
    "hasVideo": false,
    "cover": {
      "src": "/archive/DFKD-i9ThUv.jpg",
      "width": 757,
      "height": 900
    }
  },
  {
    "shortcode": "DE6wn9XyxeV",
    "date": "2025-01-17",
    "year": 2025,
    "excerpt": "Project type : interior apartemen Location : BSD Year : 2025 Status : Completed Kebutuhan untuk interior dan juga furniture sesuai dengan besaran tempat dan…",
    "photos": 6,
    "hasVideo": false,
    "cover": {
      "src": "/archive/DE6wn9XyxeV.jpg",
      "width": 720,
      "height": 900
    }
  },
  {
    "shortcode": "DEer9M9TknR",
    "date": "2025-01-06",
    "year": 2025,
    "excerpt": "Project type : Guest house - Design Location : Cilegon Year : 2024 Status : Completed Mendesign guest house dengan konsep yang modern menjadi sebuah kebutuhan…",
    "photos": 6,
    "hasVideo": false,
    "cover": {
      "src": "/archive/DEer9M9TknR.jpg",
      "width": 582,
      "height": 304
    }
  },
  {
    "shortcode": "DEZRKYSTP8C",
    "date": "2025-01-04",
    "year": 2025,
    "excerpt": "Project type : Restaurant Location : Cikarang Year : 2022 Status : Completed Membangun restoran yang mempunyai konsep yang unik adalah sebuah tantangan bagi…",
    "photos": 6,
    "hasVideo": false,
    "cover": {
      "src": "/archive/DEZRKYSTP8C.jpg",
      "width": 720,
      "height": 900
    }
  },
  {
    "shortcode": "C5xOSF2R0Kx",
    "date": "2024-04-15",
    "year": 2024,
    "excerpt": "Pilih bahan atap yang tepat untuk rumah impianmu sekarang! Pilihan atap rumahmu adalah fondasi keamanan dan keindahan Temukan jenis bahan atap yang cocok dan…",
    "photos": 2,
    "hasVideo": false,
    "cover": {
      "src": "/archive/C5xOSF2R0Kx.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "C3cRqeURNnb",
    "date": "2024-02-17",
    "year": 2024,
    "excerpt": "Pilih bata merah atau bata ringan untuk rumah impianmu? Keputusan bijak membawa impian rumah menjadi kenyataan Yuk, cari tahu mana yang lebih worth it buat…",
    "photos": 3,
    "hasVideo": false,
    "cover": {
      "src": "/archive/C3cRqeURNnb.jpg",
      "width": 900,
      "height": 881
    }
  },
  {
    "shortcode": "C14GkjixsuQ",
    "date": "2024-01-09",
    "year": 2024,
    "excerpt": "Setiap tamu layak merasakan kenyamanan Dengan ruang tamu yang dirancang oleh RR Interior, setiap tamu akan merasakan hangatnya sambutan dan kenyamanan yang tak…",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/C14GkjixsuQ.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "C1wQz1FxFvl",
    "date": "2024-01-06",
    "year": 2024,
    "excerpt": "Rumah impianmu tak lagi menjadi sekadar mimpi! Bangun rumah sempurna yang kamu inginkan dengan RR Interior Construction Tak ada lagi batasan untuk mewujudkan…",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/C1wQz1FxFvl.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "Cz_LgOrxxw0",
    "date": "2023-11-23",
    "year": 2023,
    "excerpt": "Berani beda dengan RR Interior! Dengan RR Interior, setiap detail rumah akan mencerminkan keindahan dan fungsionalitas yang kamu idamkan Percayakan proyek kamu…",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/Cz_LgOrxxw0.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "Cz551cSxNk7",
    "date": "2023-11-21",
    "year": 2023,
    "excerpt": "Upgrade rumahmu dengan Bata Hebel atau Bata Ringan sekarang juga! Dapatkan manfaat luar biasa untuk kenyamanan dan keamanan rumah kamu Bangun rumah idamanmu…",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/Cz551cSxNk7.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "Cz3MKe-xl0A",
    "date": "2023-11-20",
    "year": 2023,
    "excerpt": "Ruang yang menarik mencerminkan kepribadian seseorang Biarkan ruanganmu menceritakan kisah keunikanmu dengan keindahan yang diciptakan . .",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/Cz3MKe-xl0A.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "Cz0R7d-xSd5",
    "date": "2023-11-19",
    "year": 2023,
    "excerpt": "Tambahkan kesan eksklusif pada rumah Anda dengan kanopi yang tepat! Jadikan setiap rumah tempat ternyaman untuk kamu tempati . .",
    "photos": 3,
    "hasVideo": false,
    "cover": {
      "src": "/archive/Cz0R7d-xSd5.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CzyKNrDRtGJ",
    "date": "2023-11-18",
    "year": 2023,
    "excerpt": "Dengan RR Interior Construction setiap detail ruangan akan terwujud sesuai dengan impian kamu Percayakan pada ahli kontraktor dan desain interior untuk…",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CzyKNrDRtGJ.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CzvKjVMxx0R",
    "date": "2023-11-17",
    "year": 2023,
    "excerpt": "Jangan sampai salah pilih! Pahami pilihanmu dengan teliti sebelum memulai kerja sama Jangan ragu untuk menuntut yang terbaik dalam memilih mitra konstruksi…",
    "photos": 5,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CzvKjVMxx0R.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "Czs7mS4RNYz",
    "date": "2023-11-16",
    "year": 2023,
    "excerpt": "You can make a place beautiful or find a place that is already beautiful Come on, let's make the environment around us better! Show the beauty around you or…",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/Czs7mS4RNYz.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "Cvt8LKYS2lh",
    "date": "2023-08-09",
    "year": 2023,
    "excerpt": "Untuk pertanyaan lebih lanjut bisa langsung menghubungi : +62 856 81 22 11 9",
    "photos": 2,
    "hasVideo": false,
    "cover": {
      "src": "/archive/Cvt8LKYS2lh.jpg",
      "width": 720,
      "height": 404
    }
  },
  {
    "shortcode": "Cr3AZeyPnMY",
    "date": "2023-05-05",
    "year": 2023,
    "excerpt": "Untuk pertanyaan lebih lanjut bisa langsung menghubungi : +62 856 81 22 11 9",
    "photos": 3,
    "hasVideo": false,
    "cover": {
      "src": "/archive/Cr3AZeyPnMY.jpg",
      "width": 720,
      "height": 720
    }
  },
  {
    "shortcode": "CqsDc1rPXpB",
    "date": "2023-04-06",
    "year": 2023,
    "excerpt": "Untuk pertanyaan lebih lanjut bisa langsung menghubungi : +62 856 81 22 11 9",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CqsDc1rPXpB.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CpfK3c8PEpX",
    "date": "2023-03-07",
    "year": 2023,
    "excerpt": "Untuk pertanyaan lebih lanjut bisa langsung menghubungi : +62 856 81 22 11 9",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CpfK3c8PEpX.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CpJ6BXLhIP8",
    "date": "2023-02-27",
    "year": 2023,
    "excerpt": "Untuk pertanyaan lebih lanjut bisa langsung menghubungi : +62 856 81 22 11 9",
    "photos": 6,
    "hasVideo": true,
    "cover": {
      "src": "/archive/CpJ6BXLhIP8.jpg",
      "width": 799,
      "height": 799
    }
  },
  {
    "shortcode": "CpAXlJ5hp7l",
    "date": "2023-02-23",
    "year": 2023,
    "excerpt": "Untuk pertanyaan lebih lanjut bisa langsung menghubungi : +62 856 81 22 11 9",
    "photos": 3,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CpAXlJ5hp7l.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CnRXe2TBAr2",
    "date": "2023-01-11",
    "year": 2023,
    "excerpt": "Untuk pertanyaan lebih lanjut bisa langsung menghubungi : +62 856 81 22 11 9",
    "photos": 3,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CnRXe2TBAr2.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "Clk6Z1SOOk7",
    "date": "2022-11-30",
    "year": 2022,
    "excerpt": "Untuk pertanyaan lebih lanjut bisa langsung menghubungi : +62 856 81 22 11 9",
    "photos": 3,
    "hasVideo": false,
    "cover": {
      "src": "/archive/Clk6Z1SOOk7.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "Cfsi6DsvlIM",
    "date": "2022-07-07",
    "year": 2022,
    "excerpt": "2 perspektif ini menggambarkan kamar mandi yang terkesan mewah dengan sentuhan kaca dan perpaduan warna keramik yang pas. Kalau dilihat, kira2 berapa ukuran…",
    "photos": 2,
    "hasVideo": false,
    "cover": {
      "src": "/archive/Cfsi6DsvlIM.jpg",
      "width": 399,
      "height": 265
    }
  },
  {
    "shortcode": "Cfnb1Xyvs5w",
    "date": "2022-07-05",
    "year": 2022,
    "excerpt": "Bentuk facade dari sebuah rumah penting untuk dilihat dari perspektif yang benar. Karena dari bentuk facade yang menarik, menjadi daya tarik dari sebuah…",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/Cfnb1Xyvs5w.jpg",
      "width": 900,
      "height": 735
    }
  },
  {
    "shortcode": "CfF-uyBvy-Y",
    "date": "2022-06-22",
    "year": 2022,
    "excerpt": "Pengerjaan toko baju yang terletak di mall di daerah bogor. Dengan thema colourfull disesuaikan dengan desain dan model baju yang dijual. Untuk konsultasi…",
    "photos": 3,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CfF-uyBvy-Y.jpg",
      "width": 851,
      "height": 565
    }
  },
  {
    "shortcode": "CfCGf3lPv4-",
    "date": "2022-06-20",
    "year": 2022,
    "excerpt": "Membuat sebuah auditorium dengan konsep warna didominasi coklat, dengan perpaduan lampu dan bean bag dengan warna2 youthful membuat kesan lebih bersemangat dan…",
    "photos": 2,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CfCGf3lPv4-.jpg",
      "width": 665,
      "height": 442
    }
  },
  {
    "shortcode": "Ce8dCmHvEE5",
    "date": "2022-06-18",
    "year": 2022,
    "excerpt": "Perpaduan warna dan matrial untuk kebutuhan interior kantor menjadi solusi bagi anda yang membutuhkan desain dan pembangunan kantor yang nyaman sesuai dengan…",
    "photos": 2,
    "hasVideo": false,
    "cover": {
      "src": "/archive/Ce8dCmHvEE5.jpg",
      "width": 851,
      "height": 565
    }
  },
  {
    "shortcode": "Ccc_g9qPcaM",
    "date": "2022-04-17",
    "year": 2022,
    "excerpt": "Buat rumahmu menjadi indah bersama dengan RR Interior Construction",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/Ccc_g9qPcaM.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CcXfrZHP0Xj",
    "date": "2022-04-15",
    "year": 2022,
    "excerpt": "Tim kami akan memberikan arahan kepada anda, lalu memberikan penawaran sesuai dengan kebutuhan dan anggaran anda. Setelah Disepakati, kami mulai mengerjakan…",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CcXfrZHP0Xj.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CcQou4Svsss",
    "date": "2022-04-12",
    "year": 2022,
    "excerpt": "Masih bingung dengan langkah awal untuk membangun bangunan yang sangat anda impikan? Caranya mudah, cukup hubungi kami karena kami memberikan fasilitas…",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CcQou4Svsss.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CcQKS8OPDNY",
    "date": "2022-04-12",
    "year": 2022,
    "excerpt": "Sebuah konsep coffee shop, minimalis dengan mood rustic. Tentunya bisa diaplikasikan dan disesuaikan dengan luasan tempat yang kita miliki.",
    "photos": 5,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CcQKS8OPDNY.jpg",
      "width": 720,
      "height": 900
    }
  },
  {
    "shortcode": "CcNzll-PnLY",
    "date": "2022-04-11",
    "year": 2022,
    "excerpt": "",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CcNzll-PnLY.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CcLPhPYv6cg",
    "date": "2022-04-10",
    "year": 2022,
    "excerpt": "",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CcLPhPYv6cg.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CcKRxRXPhsZ",
    "date": "2022-04-10",
    "year": 2022,
    "excerpt": "",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CcKRxRXPhsZ.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CcIfogfPDE3",
    "date": "2022-04-09",
    "year": 2022,
    "excerpt": "The latest interior design display with a modern style to make your favorite space more comfortable.",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CcIfogfPDE3.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CcDUNCWPuxM",
    "date": "2022-04-07",
    "year": 2022,
    "excerpt": "Mau punya rumah sesuai dengan apa yang anda impikan? Kami akan membantu untuk mewujudkannya!",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CcDUNCWPuxM.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CcAzPtaPP0e",
    "date": "2022-04-06",
    "year": 2022,
    "excerpt": "We will design your dream house according to your style!",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CcAzPtaPP0e.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "Cb-ZSibP14P",
    "date": "2022-04-05",
    "year": 2022,
    "excerpt": "Kami akan buat rumah anda menjadi jauh lebih menarik dan indah daripada sebelumnya.",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/Cb-ZSibP14P.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "Cb7mx8lvPn4",
    "date": "2022-04-04",
    "year": 2022,
    "excerpt": "Make your home more beautiful than before!",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/Cb7mx8lvPn4.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "Cb4MUTFvL4k",
    "date": "2022-04-03",
    "year": 2022,
    "excerpt": "Selamat menunaikan Ibadah Puasa buat kalian yang menjalankan! Semangatt!!",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/Cb4MUTFvL4k.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CbwsyRSP3SS",
    "date": "2022-03-31",
    "year": 2022,
    "excerpt": "We build your house with special techniques to make the building stronger!",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CbwsyRSP3SS.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CbuR6JKv-P1",
    "date": "2022-03-30",
    "year": 2022,
    "excerpt": "Wujudkan rumah impian anda bersama kami! Hubungi kami untuk konsultasi terlebih dahulu!",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CbuR6JKv-P1.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "Cbrtyb0P_lL",
    "date": "2022-03-29",
    "year": 2022,
    "excerpt": "Build your dream house with us!",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/Cbrtyb0P_lL.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CbogPPdvD8G",
    "date": "2022-03-28",
    "year": 2022,
    "excerpt": "We provide the best offer to build your dream home!",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CbogPPdvD8G.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CbnMBj2POy8",
    "date": "2022-03-27",
    "year": 2022,
    "excerpt": "",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CbnMBj2POy8.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "Cbc31VHP5J2",
    "date": "2022-03-23",
    "year": 2022,
    "excerpt": "RRIntrerior Construction menyediakan jasa desain & perhitungan RAB, konstruksi, mekanikal & elektrikal, dan interior serta furniture.",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/Cbc31VHP5J2.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CbaOAnqvm4B",
    "date": "2022-03-22",
    "year": 2022,
    "excerpt": "",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CbaOAnqvm4B.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CbW_KdXvnnd",
    "date": "2022-03-21",
    "year": 2022,
    "excerpt": "Ruangan yang nyaman dan indah dapat membantu untuk menghilangkan stress dan menambah tingkat kebahagiaan kita loh!",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CbW_KdXvnnd.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CbPZHYrvQS3",
    "date": "2022-03-18",
    "year": 2022,
    "excerpt": "Yuk buat rumahmu menjadi nyaman dan rapi!",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CbPZHYrvQS3.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CbHg60PPDVp",
    "date": "2022-03-15",
    "year": 2022,
    "excerpt": "Kami memiliki pengalaman yang sangat cukup dan sudah mengerjakan berbagai macam project, oleh karena itu jangan ragu untuk menghubungi kami jika anda ingin…",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CbHg60PPDVp.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CbEyxYZvIqN",
    "date": "2022-03-14",
    "year": 2022,
    "excerpt": "Yuk wujudkan rumah impianmu dengan kami sekarang juga!",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CbEyxYZvIqN.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CbCeponvDis",
    "date": "2022-03-13",
    "year": 2022,
    "excerpt": "",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CbCeponvDis.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CRDf_EBnc6E",
    "date": "2021-07-08",
    "year": 2021,
    "excerpt": "3D design sushi restaurant 🍣🍙🍱",
    "photos": 2,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CRDf_EBnc6E.jpg",
      "width": 900,
      "height": 675
    }
  },
  {
    "shortcode": "CQ3AyhLHZh9",
    "date": "2021-07-03",
    "year": 2021,
    "excerpt": "",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CQ3AyhLHZh9.jpg",
      "width": 720,
      "height": 900
    }
  },
  {
    "shortcode": "CN65bBoHav7",
    "date": "2021-04-21",
    "year": 2021,
    "excerpt": "Re-design barbershop dengan kebutuhan dan keinginan client. Jika ingin konsultasi atau bertanya2 bisa langsung menghubungi via DM atau whatsapp.",
    "photos": 3,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CN65bBoHav7.jpg",
      "width": 670,
      "height": 350
    }
  },
  {
    "shortcode": "CJpdsaKHuYm",
    "date": "2021-01-05",
    "year": 2021,
    "excerpt": "3D design for cake shop at karawang. Minimalist and shopisticated store, low budget too.",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CJpdsaKHuYm.jpg",
      "width": 900,
      "height": 553
    }
  },
  {
    "shortcode": "CHwsIe-HmtA",
    "date": "2020-11-19",
    "year": 2020,
    "excerpt": "Renovasi rumah adalah kebutuhan primer bagi kita yang ingin memiliki rumah yang nyaman untuk dihuni. Terkadang sulit untuk menemukan kontraktor yang…",
    "photos": 4,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CHwsIe-HmtA.jpg",
      "width": 900,
      "height": 900
    }
  },
  {
    "shortcode": "CHhWocQHhzS",
    "date": "2020-11-13",
    "year": 2020,
    "excerpt": "3D exterior",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CHhWocQHhzS.jpg",
      "width": 900,
      "height": 507
    }
  },
  {
    "shortcode": "CGzjEyJn9At",
    "date": "2020-10-26",
    "year": 2020,
    "excerpt": "Interior project at north jakarta",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CGzjEyJn9At.jpg",
      "width": 900,
      "height": 506
    }
  },
  {
    "shortcode": "CF_eFy_H-JI",
    "date": "2020-10-06",
    "year": 2020,
    "excerpt": "Meeting room 3D concept",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CF_eFy_H-JI.jpg",
      "width": 800,
      "height": 450
    }
  },
  {
    "shortcode": "CF1JuSpHz3Y",
    "date": "2020-10-02",
    "year": 2020,
    "excerpt": "Restaurant 3D concept",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CF1JuSpHz3Y.jpg",
      "width": 808,
      "height": 900
    }
  },
  {
    "shortcode": "CFpbUPsnGyV",
    "date": "2020-09-27",
    "year": 2020,
    "excerpt": "Accounting room 3D concept",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CFpbUPsnGyV.jpg",
      "width": 900,
      "height": 506
    }
  },
  {
    "shortcode": "CFJGj5dnahN",
    "date": "2020-09-15",
    "year": 2020,
    "excerpt": "3D cafe concept",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CFJGj5dnahN.jpg",
      "width": 760,
      "height": 398
    }
  },
  {
    "shortcode": "CFG_bPTH26P",
    "date": "2020-09-14",
    "year": 2020,
    "excerpt": "3D concept restaurant",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CFG_bPTH26P.jpg",
      "width": 639,
      "height": 479
    }
  },
  {
    "shortcode": "CCIoNb8nqiZ",
    "date": "2020-07-02",
    "year": 2020,
    "excerpt": "3D outlook residential home in tangerang",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CCIoNb8nqiZ.jpg",
      "width": 900,
      "height": 506
    }
  },
  {
    "shortcode": "CBDMRwGnF6T",
    "date": "2020-06-05",
    "year": 2020,
    "excerpt": "Work hard and dream big",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CBDMRwGnF6T.jpg",
      "width": 800,
      "height": 450
    }
  },
  {
    "shortcode": "CAxAb0nnVU4",
    "date": "2020-05-29",
    "year": 2020,
    "excerpt": "Work Hard",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/CAxAb0nnVU4.jpg",
      "width": 900,
      "height": 506
    }
  },
  {
    "shortcode": "B_xIJBZnzry",
    "date": "2020-05-04",
    "year": 2020,
    "excerpt": "Warehouse",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/B_xIJBZnzry.jpg",
      "width": 900,
      "height": 675
    }
  },
  {
    "shortcode": "B_O1dbSHvsH",
    "date": "2020-04-21",
    "year": 2020,
    "excerpt": "Kitchen set 3D",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/B_O1dbSHvsH.jpg",
      "width": 900,
      "height": 506
    }
  },
  {
    "shortcode": "B_MjQ_rHLUP",
    "date": "2020-04-20",
    "year": 2020,
    "excerpt": "Warehouse at north jakarta",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/B_MjQ_rHLUP.jpg",
      "width": 900,
      "height": 675
    }
  },
  {
    "shortcode": "B-zjg1WnEsZ",
    "date": "2020-04-10",
    "year": 2020,
    "excerpt": "Boetique at south jakarta",
    "photos": 1,
    "hasVideo": false,
    "cover": {
      "src": "/archive/B-zjg1WnEsZ.jpg",
      "width": 720,
      "height": 900
    }
  }
];
