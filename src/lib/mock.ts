/**
 * Data tiruan untuk pratinjau layout (frontend dulu, backend menyusul).
 *
 * Sumber: arsip publik RR di data-foto/ (caption asli Instagram).
 * - Field type/location/year/status diambil dari caption RR sendiri.
 * - Label media (render vs foto lapangan) sudah diverifikasi visual
 *   satu per satu pada berkas di data-foto/postingan/.
 * - Status "Completed" adalah klaim caption RR; publikasi final menunggu
 *   konfirmasi RR (lihat prinsip non-negosiasi PRD).
 * - Semua ini data contoh untuk layout; kontrak API menyusul di fase backend.
 */

export type Localized = { en: string; id: string };

export type WorkRole = "render" | "site";

export type WorkItem = {
  slug: string;
  number: string;
  title: Localized;
  /** Ringkasan jujur dari caption arsip; bukan klaim tambahan. */
  summary: Localized;
  type: Localized;
  /** Lokasi umum bila disebut di arsip; kosong bila tidak diketahui. */
  location: string;
  year: string;
  /** Kalimat status asli arsip (konteks); tidak dipakai seed. */
  status?: Localized;
  /** Status terkonfirmasi dari caption arsip; kosong = belum dikonfirmasi. */
  projectStatus?: "selesai" | "berjalan";
  role: WorkRole;
  image: {
    src: string;
    width: number;
    height: number;
    alt: Localized;
  };
  /** Jejak ke arsip sumber di data-foto/postingan/. */
  sourcePost: string;
};

export const works: WorkItem[] = [
  {
    slug: "house-renovation-tangerang",
    number: "01",
    title: {
      en: "House renovation in Tangerang",
      id: "Renovasi rumah di Tangerang",
    },
    summary: {
      en: "Adding a building behind an existing house demands precision in placing structure and room points. Workers who follow direction closely matter just as much during construction.",
      id: "Menambahkan bangunan di belakang rumah existing membutuhkan ketepatan penempatan struktur dan titik ruangan. Pekerja yang profesional dan mengikuti arahan sama pentingnya dalam proses pembangunan.",
    },
    type: { en: "House renovation", id: "Renovasi rumah" },
    location: "Tangerang",
    year: "2024",
    status: { en: "Completed", id: "Selesai" },
    projectStatus: "selesai",
    role: "site",
    image: {
      src: "/mock/work-tangerang.jpg",
      width: 720,
      height: 899,
      alt: {
        en: "House under renovation in Tangerang, pool and scaffolding visible on site",
        id: "Rumah dalam renovasi di Tangerang, kolam dan perancah terlihat di lokasi",
      },
    },
    sourcePost: "DG5DSMETIUa",
  },
  {
    slug: "apartment-interior-bsd",
    number: "02",
    title: {
      en: "Apartment interior in BSD",
      id: "Interior apartemen di BSD",
    },
    summary: {
      en: "Interior and furniture needs follow the size of the place and the function of each piece, so the people who live in it feel comfortable.",
      id: "Kebutuhan interior dan furniture disesuaikan dengan besaran tempat serta fungsionalitas tiap item, sehingga penghuninya merasa nyaman.",
    },
    type: { en: "Apartment interior", id: "Interior apartemen" },
    location: "BSD",
    year: "2025",
    status: { en: "Completed", id: "Selesai" },
    projectStatus: "selesai",
    role: "render",
    image: {
      src: "/mock/work-bsd.jpg",
      width: 1024,
      height: 1280,
      alt: {
        en: "Apartment living room render with a gold pendant light and TV wall",
        id: "Render ruang tamu apartemen dengan lampu gantung emas dan dinding TV",
      },
    },
    sourcePost: "DE6wn9XyxeV",
  },
  {
    slug: "residential-furniture-meruya",
    number: "03",
    title: {
      en: "Residential furniture in Meruya",
      id: "Furnitur hunian di Meruya",
    },
    summary: {
      en: "Furniture matters a great deal in a home. Good quality and shapes that follow the room bring a beautiful atmosphere for the owner.",
      id: "Furniture untuk rumah sangat penting. Kualitas yang baik dan bentuk yang menyesuaikan ruangan membawa suasana yang indah bagi pemilik rumah.",
    },
    type: { en: "Custom furniture", id: "Furnitur kustom" },
    location: "Meruya",
    year: "2024",
    status: { en: "Completed", id: "Selesai" },
    projectStatus: "selesai",
    role: "render",
    image: {
      src: "/mock/work-meruya.jpg",
      width: 1077,
      height: 1280,
      alt: {
        en: "Walk-in wardrobe render with lit display cabinets and mirrored panels",
        id: "Render lemari walk-in dengan kabinet display menyala dan panel cermin",
      },
    },
    sourcePost: "DFKD-i9ThUv",
  },
  {
    slug: "guest-house-design-cilegon",
    number: "04",
    title: {
      en: "Guest house design in Cilegon",
      id: "Desain guest house di Cilegon",
    },
    summary: {
      en: "Designing a modern guest house is in high demand lately, so the design must be right and suit the size of each room.",
      id: "Mendesain guest house dengan konsep modern makin diminati belakangan ini, sehingga diperlukan desain yang tepat agar memadai dengan ukuran ruangan.",
    },
    type: { en: "Guest house design", id: "Desain guest house" },
    location: "Cilegon",
    year: "2024",
    status: { en: "Completed", id: "Selesai" },
    projectStatus: "selesai",
    role: "render",
    image: {
      src: "/mock/work-cilegon.jpg",
      width: 582,
      height: 304,
      alt: {
        en: "Guest house bedroom render with wood wall panels and a desk",
        id: "Render kamar guest house dengan panel dinding kayu dan meja",
      },
    },
    sourcePost: "DEer9M9TknR",
  },
  {
    slug: "restaurant-cikarang",
    number: "05",
    title: { en: "Restaurant in Cikarang", id: "Restoran di Cikarang" },
    summary: {
      en: "Building a restaurant with a unique concept is a challenge for us. And a challenge is a chance to turn a dream into reality.",
      id: "Membangun restoran dengan konsep unik adalah tantangan bagi kami. Dan tantangan adalah kesempatan untuk menjadikan impian menjadi kenyataan.",
    },
    type: { en: "Restaurant", id: "Restoran" },
    location: "Cikarang",
    year: "2022",
    status: { en: "Completed", id: "Selesai" },
    projectStatus: "selesai",
    role: "site",
    image: {
      src: "/mock/work-cikarang.jpg",
      width: 1080,
      height: 1350,
      alt: {
        en: "Restaurant facade under construction in Cikarang, site photo with scaffolding",
        id: "Fasad restoran dalam pembangunan di Cikarang, foto lapangan dengan perancah",
      },
    },
    sourcePost: "DEZRKYSTP8C",
  },
  {
    slug: "coffee-shop-design-rustic",
    number: "06",
    title: {
      en: "Coffee shop design in a rustic mood",
      id: "Desain coffee shop bernuansa rustic",
    },
    summary: {
      en: "A coffee shop concept with a minimalist, rustic mood, adapted to the size of the place.",
      id: "Sebuah konsep coffee shop minimalis dengan mood rustic, disesuaikan dengan luasan tempat.",
    },
    type: { en: "Interior design", id: "Desain interior" },
    location: "",
    year: "2022",
    role: "render",
    image: {
      src: "/work/coffee-shop-design-rustic/01.jpg",
      width: 1120,
      height: 1400,
      alt: {
        en: "Coffee shop render: timber shelves, counter, and warm lighting",
        id: "Render coffee shop: rak kayu, konter, dan pencahayaan hangat",
      },
    },
    sourcePost: "CcQKS8OPDNY",
  },
  {
    slug: "clothing-store-bogor",
    number: "07",
    title: {
      en: "Clothing store in a Bogor mall",
      id: "Toko baju di mal kawasan Bogor",
    },
    summary: {
      en: "A clothing store inside a mall, with a colourful theme matched to the design of the clothes on sale.",
      id: "Pengerjaan toko baju di dalam mal dengan tema colourful yang disesuaikan dengan desain dan model baju yang dijual.",
    },
    type: { en: "Retail interior", id: "Interior retail" },
    location: "Bogor",
    year: "2022",
    projectStatus: "selesai",
    role: "site",
    image: {
      src: "/work/clothing-store-bogor/01.jpg",
      width: 851,
      height: 565,
      alt: {
        en: "Clothing store interior with racks, display tables, and brick walls",
        id: "Interior toko baju dengan rak, meja display, dan dinding bata",
      },
    },
    sourcePost: "CfF-uyBvy-Y",
  },
  {
    slug: "barbershop-re-design",
    number: "08",
    title: { en: "Barbershop redesign", id: "Redesain barbershop" },
    summary: {
      en: "A barbershop redesigned around the client's needs and wishes.",
      id: "Redesain barbershop menyesuaikan kebutuhan dan keinginan klien.",
    },
    type: { en: "Commercial design", id: "Desain komersial" },
    location: "",
    year: "2021",
    role: "render",
    image: {
      src: "/work/barbershop-re-design/01.jpg",
      width: 670,
      height: 350,
      alt: {
        en: "Barbershop render with barber chairs, mirrors, and pendant lights",
        id: "Render barbershop dengan kursi barber, cermin, dan lampu gantung",
      },
    },
    sourcePost: "CN65bBoHav7",
  },
  {
    slug: "living-room-nature-classic",
    number: "09",
    title: {
      en: "Living room design with a classic nature mood",
      id: "Desain ruang tamu bertema nature classic",
    },
    summary: {
      en: "A living room with a nature theme and a touch of classic elegance, made to be enjoyed for a long time.",
      id: "Ruang tamu bertemakan nature dengan sentuhan classic yang elegan, dibuat untuk dinikmati dalam waktu lama.",
    },
    type: { en: "Interior design", id: "Desain interior" },
    location: "",
    year: "2026",
    role: "render",
    image: {
      src: "/work/living-room-nature-classic/01.webp",
      width: 1440,
      height: 803,
      alt: {
        en: "Living room render with indoor plants, wall panels, and a pendant light",
        id: "Render ruang tamu dengan tanaman indoor, panel dinding, dan lampu gantung",
      },
    },
    sourcePost: "DWk36ZDknE_",
  },
  {
    slug: "bedroom-toilet-warm-minimalist",
    number: "10",
    title: {
      en: "Bedroom and toilet design in warm minimalism",
      id: "Desain kamar tidur & toilet bergaya minimalis hangat",
    },
    summary: {
      en: "Bedroom and toilet designed in a warm minimalist mood, so the room invites you to settle in.",
      id: "Pekerjaan desain kamar tidur dan toilet dengan nuansa minimalis hangat, supaya betah berada di dalamnya.",
    },
    type: { en: "Interior design", id: "Desain interior" },
    location: "",
    year: "2026",
    role: "render",
    image: {
      src: "/work/bedroom-toilet-warm-minimalist/01.webp",
      width: 1440,
      height: 803,
      alt: {
        en: "Bedroom render with a TV wall, wardrobe lighting, and warm tones",
        id: "Render kamar dengan dinding TV, pencahayaan lemari, dan nuansa hangat",
      },
    },
    sourcePost: "DW3RMIoktdE",
  },
  {
    slug: "apartment-family-area",
    number: "11",
    title: {
      en: "Apartment interior with family area and bedroom",
      id: "Interior apartemen dengan ruang keluarga dan kamar",
    },
    summary: {
      en: "Apartment interior with an integrated bedroom workspace, a family area with a gallery wall, and a calm seating corner.",
      id: "Interior apartemen dengan meja kerja terpasang di kamar, ruang keluarga dengan dinding galeri, dan sudut duduk yang tenang.",
    },
    type: { en: "Apartment interior", id: "Interior apartemen" },
    location: "",
    year: "2026",
    role: "render",
    image: {
      src: "/work/apartment-family-area/01.jpg",
      width: 768,
      height: 487,
      alt: {
        en: "Apartment render: bedroom with a built-in desk, TV, and wardrobe",
        id: "Render apartemen: kamar dengan meja kerja terpasang, TV, dan lemari",
      },
    },
    sourcePost: "DYmAqHTHV9m",
  },
  {
    slug: "kitchen-set-design",
    number: "12",
    title: {
      en: "Kitchen set design (two lighting options)",
      id: "Desain kitchen set (dua opsi pencahayaan)",
    },
    summary: {
      en: "Kitchen set designed in two lighting options, for a more elegant kitchen.",
      id: "Desain kitchen set dengan dua opsi pencahayaan untuk menambah kesan elegan.",
    },
    type: { en: "Custom furniture", id: "Furnitur kustom" },
    location: "",
    year: "2026",
    role: "render",
    image: {
      src: "/work/kitchen-set-design/01.webp",
      width: 1440,
      height: 810,
      alt: {
        en: "Kitchen set render with dark lower cabinets and white upper cabinets",
        id: "Render kitchen set dengan kabinet bawah gelap dan kabinet atas putih",
      },
    },
    sourcePost: "DWnqlPukpFw",
  },
  {
    slug: "house-renovation-documentation",
    number: "13",
    title: {
      en: "House renovation · field documentation",
      id: "Renovasi rumah · dokumentasi lapangan",
    },
    summary: {
      en: "Field documentation from a house renovation, covering structure work, finishing, and the finished dining room.",
      id: "Dokumentasi lapangan renovasi rumah, pekerjaan struktur, finishing, dan ruang makan yang telah selesai.",
    },
    type: { en: "House renovation", id: "Renovasi rumah" },
    location: "",
    year: "2020",
    role: "site",
    image: {
      src: "/work/house-renovation-documentation/01.jpg",
      width: 1200,
      height: 1200,
      alt: {
        en: "Site photo: wall under construction with a bamboo ladder",
        id: "Foto lapangan: dinding dalam pengerjaan dengan tangga bambu",
      },
    },
    sourcePost: "CHwsIe-HmtA",
  },
  {
    slug: "modern-house-exterior",
    number: "14",
    title: {
      en: "Modern three level house design",
      id: "Desain rumah tiga lantai modern",
    },
    summary: {
      en: "A three level house exterior with warm lighting, a planted front terrace, and a pool along the entrance.",
      id: "Rumah tiga lantai bergaya modern dengan pencahayaan eksterior hangat, teras depan hijau, dan kolam di sisi masuk.",
    },
    type: { en: "House design", id: "Desain rumah" },
    location: "",
    year: "2026",
    role: "render",
    image: {
      src: "/work/modern-house-exterior/01.jpg",
      width: 971,
      height: 590,
      alt: {
        en: "Evening render of a modern three-storey house with warm exterior lights and a front terrace",
        id: "Render malam rumah modern tiga lantai dengan lampu eksterior hangat dan teras depan",
      },
    },
    sourcePost: "DajgrebHfg-",
  },
  {
    slug: "bedroom-work-space",
    number: "15",
    title: {
      en: "Bedroom with an integrated work area",
      id: "Kamar tidur dengan area kerja terpasang",
    },
    summary: {
      en: "A warm minimalist bedroom with an integrated desk and shelves, a lit wardrobe wall, and a bathroom in the same palette.",
      id: "Kamar tidur minimalis hangat dengan meja dan rak terpasang, dinding lemari berpencahayaan, serta kamar mandi bernuansa senada.",
    },
    type: { en: "Interior design", id: "Desain interior" },
    location: "",
    year: "2026",
    role: "render",
    image: {
      src: "/work/bedroom-work-space/01.jpg",
      width: 893,
      height: 498,
      alt: {
        en: "Bedroom render with a built-in desk, floating shelves, and a bed",
        id: "Render kamar tidur dengan meja kerja terpasang, rak gantung, dan tempat tidur",
      },
    },
    sourcePost: "DZuLxq8kesp",
  },
  {
    slug: "office-meeting-room",
    number: "16",
    title: {
      en: "Office meeting room and workspace",
      id: "Ruang rapat dan ruang kerja kantor",
    },
    summary: {
      en: "Office interior with a timber panelled meeting room and a separate workspace, adjusted to the client's budget.",
      id: "Interior kantor dengan ruang rapat berpanel kayu dan ruang kerja terpisah, disesuaikan dengan anggaran klien.",
    },
    type: { en: "Office interior", id: "Interior kantor" },
    location: "",
    year: "2022",
    role: "render",
    image: {
      src: "/work/office-meeting-room/01.jpg",
      width: 851,
      height: 565,
      alt: {
        en: "Meeting room render with a long table and wood-panelled walls",
        id: "Render ruang rapat dengan meja panjang dan dinding panel kayu",
      },
    },
    sourcePost: "Ce8dCmHvEE5",
  },
  {
    slug: "house-facade-design",
    number: "17",
    title: { en: "House facade design", id: "Desain fasad rumah" },
    summary: {
      en: "A facade study for a two level home, the perspective that shapes a building's first impression.",
      id: "Studi fasad rumah dua lantai, perspektif yang membentuk kesan pertama sebuah bangunan.",
    },
    type: { en: "House design", id: "Desain rumah" },
    location: "",
    year: "2022",
    role: "render",
    image: {
      src: "/work/house-facade-design/01.jpg",
      width: 1080,
      height: 882,
      alt: {
        en: "Two-storey house facade render with a paved courtyard",
        id: "Render fasad rumah dua lantai dengan halaman berpelat",
      },
    },
    sourcePost: "Cfnb1Xyvs5w",
  },
  {
    slug: "auditorium-design",
    number: "18",
    title: { en: "Auditorium concept", id: "Konsep auditorium" },
    summary: {
      en: "An auditorium concept in brown tones with warm lighting and colourful bean bag seating.",
      id: "Konsep auditorium bernuansa cokelat dengan pencahayaan hangat dan bean bag berwarna cerah.",
    },
    type: { en: "Interior design", id: "Desain interior" },
    location: "",
    year: "2022",
    role: "render",
    image: {
      src: "/work/auditorium-design/01.jpg",
      width: 665,
      height: 442,
      alt: {
        en: "Auditorium render with a wood-slat ceiling and colourful bean bags",
        id: "Render auditorium dengan plafon bilah kayu dan bean bag warna-warni",
      },
    },
    sourcePost: "CfCGf3lPv4-",
  },
  {
    slug: "sushi-restaurant-design",
    number: "19",
    title: { en: "Sushi restaurant design", id: "Desain restoran sushi" },
    summary: {
      en: "A sushi restaurant design with a timber storefront, lantern lighting, and a long communal table.",
      id: "Desain restoran sushi dengan fasad kayu, lampu lampion, dan meja komunal panjang.",
    },
    type: { en: "Restaurant", id: "Restoran" },
    location: "",
    year: "2021",
    role: "render",
    image: {
      src: "/work/sushi-restaurant-design/01.jpg",
      width: 960,
      height: 720,
      alt: {
        en: "Sushi restaurant render with a timber storefront and hanging lanterns",
        id: "Render restoran sushi dengan fasad kayu dan lampion gantung",
      },
    },
    sourcePost: "CRDf_EBnc6E",
  },
  {
    slug: "cake-shop-karawang",
    number: "20",
    title: { en: "Cake shop in Karawang", id: "Cake shop di Karawang" },
    summary: {
      en: "A minimalist cake shop in Karawang, designed to stay efficient on a low budget.",
      id: "Cake shop minimalis di Karawang, dirancang tetap efisien dengan anggaran terbatas.",
    },
    type: { en: "Retail interior", id: "Interior retail" },
    location: "Karawang",
    year: "2021",
    role: "render",
    image: {
      src: "/work/cake-shop-karawang/01.jpg",
      width: 1080,
      height: 664,
      alt: {
        en: "Cake shop render with shelving, a display counter, and pendant lights",
        id: "Render cake shop dengan rak, konter display, dan lampu gantung",
      },
    },
    sourcePost: "CJpdsaKHuYm",
  },
  {
    slug: "restaurant-interior-concept",
    number: "21",
    title: { en: "Restaurant interior concept", id: "Konsep interior restoran" },
    summary: {
      en: "A restaurant interior concept with a teal tiled counter, greenery, and warm timber seating.",
      id: "Konsep interior restoran dengan konter berubin teal, tanaman hijau, dan area duduk kayu hangat.",
    },
    type: { en: "Restaurant", id: "Restoran" },
    location: "",
    year: "2020",
    role: "render",
    image: {
      src: "/work/restaurant-interior-concept/01.jpg",
      width: 809,
      height: 450,
      alt: {
        en: "Restaurant render with a teal-tiled counter, plants, and timber tables",
        id: "Render restoran dengan konter ubin teal, tanaman, dan meja kayu",
      },
    },
    sourcePost: "CF1JuSpHz3Y",
  },
  {
    slug: "cafe-design-concept",
    number: "22",
    title: { en: "Cafe design concept", id: "Konsep desain kafe" },
    summary: {
      en: "A cafe concept with dark walls, timber furniture, and industrial pendant lighting.",
      id: "Konsep kafe dengan dinding gelap, furnitur kayu, dan lampu gantung industrial.",
    },
    type: { en: "Cafe", id: "Kafe" },
    location: "",
    year: "2020",
    role: "render",
    image: {
      src: "/work/cafe-design-concept/01.jpg",
      width: 760,
      height: 398,
      alt: {
        en: "Cafe render with dark walls, wood tables, and pendant lights",
        id: "Render kafe dengan dinding gelap, meja kayu, dan lampu gantung",
      },
    },
    sourcePost: "CFJGj5dnahN",
  },
  {
    slug: "residential-home-tangerang",
    number: "23",
    title: { en: "Residential home in Tangerang", id: "Rumah tinggal di Tangerang" },
    summary: {
      en: "A two level home outlook with a carport and a light steel canopy over the entrance.",
      id: "Tampak rumah dua lantai dengan carport dan kanopi baja ringan di atas pintu masuk.",
    },
    type: { en: "House design", id: "Desain rumah" },
    location: "Tangerang",
    year: "2020",
    role: "render",
    image: {
      src: "/work/residential-home-tangerang/01.jpg",
      width: 1279,
      height: 719,
      alt: {
        en: "House outlook render with a carport and a canopy over the entrance",
        id: "Render tampak rumah dengan carport dan kanopi di atas pintu masuk",
      },
    },
    sourcePost: "CCIoNb8nqiZ",
  },
  {
    slug: "warehouse-north-jakarta",
    number: "24",
    title: { en: "Warehouse in North Jakarta", id: "Gudang di Jakarta Utara" },
    summary: {
      en: "A warehouse interior in North Jakarta with a steel structure, skylights, and storage pallets.",
      id: "Interior gudang di Jakarta Utara dengan struktur baja, skylight, dan palet penyimpanan.",
    },
    type: { en: "Warehouse", id: "Gudang" },
    location: "Jakarta Utara",
    year: "2020",
    role: "site",
    image: {
      src: "/work/warehouse-north-jakarta/01.jpg",
      width: 1400,
      height: 1050,
      alt: {
        en: "Site photo of a warehouse interior with storage pallets and steel roof trusses",
        id: "Foto lapangan interior gudang dengan palet penyimpanan dan rangka baja atap",
      },
    },
    sourcePost: "B_MjQ_rHLUP",
  },
  {
    slug: "compact-kitchen-set",
    number: "25",
    title: { en: "Compact kitchen set", id: "Kitchen set ringkas" },
    summary: {
      en: "A compact kitchen set with an L shaped counter and a chevron patterned backsplash.",
      id: "Kitchen set ringkas dengan konter bentuk L dan backsplash bermotif chevron.",
    },
    type: { en: "Custom furniture", id: "Furnitur kustom" },
    location: "",
    year: "2020",
    role: "render",
    image: {
      src: "/work/compact-kitchen-set/01.jpg",
      width: 1279,
      height: 719,
      alt: {
        en: "Kitchen set render with white cabinets and a patterned backsplash",
        id: "Render kitchen set dengan kabinet putih dan backsplash bermotif",
      },
    },
    sourcePost: "B_O1dbSHvsH",
  },
];

export type ServiceItem = {
  number: string;
  title: Localized;
  description: Localized;
};

export const services: ServiceItem[] = [
  {
    number: "01",
    title: { en: "Interior design", id: "Desain interior" },
    description: {
      en: "Space planning, layouts, and 2D/3D visuals before anything is built.",
      id: "Perencanaan ruang, tata letak, dan visual 2D/3D sebelum apa pun dibangun.",
    },
  },
  {
    number: "02",
    title: { en: "Architecture", id: "Arsitektur" },
    description: {
      en: "Building design and structural drawings.",
      id: "Desain bangunan dan gambar struktur.",
    },
  },
  {
    number: "03",
    title: { en: "General contractor", id: "Kontraktor umum" },
    description: {
      en: "One team running the site, covering structure, finishing, and trades.",
      id: "Satu tim yang menangani struktur, finishing, dan tukang di lapangan.",
    },
  },
  {
    number: "04",
    title: { en: "Mechanical and electrical", id: "Mekanikal dan elektrikal" },
    description: {
      en: "Electrical, plumbing, and MEP coordination.",
      id: "Kelistrikan, perpipaan, dan koordinasi MEP.",
    },
  },
  {
    number: "05",
    title: { en: "Custom furniture", id: "Furnitur kustom" },
    description: {
      en: "Wardrobes, kitchens, and joinery, made and installed to fit.",
      id: "Lemari, dapur, dan pekerjaan kayu, dibuat dan dipasang sesuai ukuran.",
    },
  },
  {
    number: "06",
    title: { en: "Steel and structural works", id: "Pekerjaan baja dan struktur" },
    description: {
      en: "Steel frames, canopies, and structural repairs.",
      id: "Rangka baja, kanopi, dan perbaikan struktur.",
    },
  },
];

export type ProcessStep = {
  number: string;
  title: Localized;
  description: Localized;
};

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: { en: "Consultation", id: "Konsultasi" },
    description: {
      en: "Start with the space, the goal, and what you already know. No drawings or final sizes are required to begin.",
      id: "Mulai dari ruangnya, tujuannya, dan apa yang sudah Anda ketahui. Belum perlu gambar atau ukuran final untuk memulai.",
    },
  },
  {
    number: "02",
    title: { en: "Survey", id: "Survei" },
    description: {
      en: "The team measures the site and documents the existing condition as the basis for planning.",
      id: "Tim mengukur lokasi dan mendokumentasikan kondisi yang ada sebagai dasar perencanaan.",
    },
  },
  {
    number: "03",
    title: { en: "Design and cost plan", id: "Desain dan rencana biaya" },
    description: {
      en: "Layouts, visuals, and a cost plan are prepared for review, so every decision is agreed before work starts.",
      id: "Tata letak, visual, dan rencana biaya disiapkan untuk ditinjau, sehingga setiap keputusan disetujui sebelum pekerjaan dimulai.",
    },
  },
  {
    number: "04",
    title: { en: "Construction and furniture", id: "Pembangunan dan furnitur" },
    description: {
      en: "Site work and custom furniture run under one team, keeping the schedule and quality aligned.",
      id: "Pekerjaan lapangan dan furnitur kustom berjalan di bawah satu tim, menjaga jadwal dan mutu tetap selaras.",
    },
  },
  {
    number: "05",
    title: { en: "Handover", id: "Serah terima" },
    description: {
      en: "Final checks and a joint walkthrough close the project, with the finished work handed over in full.",
      id: "Pemeriksaan akhir dan peninjauan bersama menutup proyek, dengan pekerjaan diserahkan secara utuh.",
    },
  },
];

/**
 * Kanal resmi RR (data tiruan kanal untuk pratinjau halaman kontak;
 * backend menyusul dari pengaturan situs). Nomor & tautan sudah
 * dikonfirmasi pada brief.
 */
export type ChannelItem = {
  key: "whatsapp" | "instagram";
  label: Localized;
  /** Tampilan nomor/username yang dikonfirmasi. */
  handle: string;
  href: string;
};

export const channels: ChannelItem[] = [
  {
    key: "whatsapp",
    label: { en: "WhatsApp", id: "WhatsApp" },
    handle: "0856-8122-119",
    href: "https://wa.me/628568122119",
  },
  {
    key: "instagram",
    label: { en: "Instagram", id: "Instagram" },
    handle: "@rrinterior.construction",
    href: "https://www.instagram.com/rrinterior.construction/",
  },
];

/**
 * Ulasan klien untuk pratinjau (Tahap 4).
 *
 * PENTING: 7 ulasan ini adalah CONTOH yang ditulis mirip ulasan asli agar
 * tata letak beranda bisa dinilai. Wajib diganti ulasan asli + izin tertulis
 * sebelum produksi (lihat kendala-dan-tindakan.md A4). Kolom `source` di
 * basis data menyimpan penanda "contoh" agar tidak lolos tanpa disadari.
 */
export type TestimonialItem = {
  author: string;
  quote: Localized;
  /** Proyek terkait (slug) — konteks ditampilkan dari judul proyek. */
  projectSlug: string;
  source: string;
};

export const testimonials: TestimonialItem[] = [
  {
    author: "Rani & Dimas",
    quote: {
      en: "We stayed in during the rebuild, and the team kept the work area clean. Every stage was explained before it started.",
      id: "Kami tetap tinggal selama perombakan, dan timnya menjaga area kerja tetap bersih. Tiap tahap dijelaskan sebelum dikerjakan.",
    },
    projectSlug: "house-renovation-tangerang",
    source: "Contoh internal — ganti ulasan asli sebelum rilis",
  },
  {
    author: "Sarah",
    quote: {
      en: "Our apartment is small, yet the result feels open. The desk built into the wardrobe is an idea we had never thought of.",
      id: "Apartemen kami sempit, tapi hasilnya terasa lapang. Meja kerja yang menyatu dengan lemari itu ide yang tidak terpikir oleh kami.",
    },
    projectSlug: "apartment-interior-bsd",
    source: "Contoh internal — ganti ulasan asli sebelum rilis",
  },
  {
    author: "Sari",
    quote: {
      en: "The kitchen is tidy at last because everything has a place. Careful installation, and leftovers cleaned up before handover.",
      id: "Dapur akhirnya rapi karena setiap alat punya tempatnya. Pemasangannya teliti, sisa material dibersihkan sebelum serah terima.",
    },
    projectSlug: "kitchen-set-design",
    source: "Contoh internal — ganti ulasan asli sebelum rilis",
  },
  {
    author: "Hendra",
    quote: {
      en: "The bold concept I asked for, translated without losing function. Even the lights were picked to be easy to maintain.",
      id: "Konsep berani yang saya minta diterjemahkan tanpa mengorbankan fungsi. Lampunya juga dipilih yang gampang dirawat.",
    },
    projectSlug: "restaurant-cikarang",
    source: "Contoh internal — ganti ulasan asli sebelum rilis",
  },
  {
    author: "Nadia",
    quote: {
      en: "Customers keep photographing the shelves and counter. For a new business, a place that photographs well matters.",
      id: "Pelanggan sering memotret rak dan konternya. Untuk usaha yang baru buka, tempat yang enak difoto itu penting.",
    },
    projectSlug: "coffee-shop-design-rustic",
    source: "Contoh internal — ganti ulasan asli sebelum rilis",
  },
  {
    author: "Ayu",
    quote: {
      en: "Small things were thought through, down to spots for the iron and vacuum. Everything was measured again before installation.",
      id: "Detail kecil dipikirkan, sampai tempat menyimpan setrika dan vacuum. Semua diukur ulang di lokasi sebelum dipasang.",
    },
    projectSlug: "residential-furniture-meruya",
    source: "Contoh internal — ganti ulasan asli sebelum rilis",
  },
  {
    author: "Bayu",
    quote: {
      en: "I only sent a photo and rough measurements. Enough to start, and the cost breakdown was explained step by step.",
      id: "Saya cuma kirim foto dan ukuran kasar. Ternyata cukup untuk mulai, dan rincian biayanya dijelaskan bertahap.",
    },
    projectSlug: "house-renovation-documentation",
    source: "Contoh internal — ganti ulasan asli sebelum rilis",
  },
];

/**
 * Pertanyaan umum resmi (FAQ) yang ditulis dari fakta yang sudah ada di
 * situs: layanan, alur konsultasi, wilayah layanan, label media, kanal
 * resmi, dan privasi. Tanpa harga, janji jadwal, atau klaim yang tidak
 * bersumber — sesuai aturan PRD §2.3.
 */
export type Faq = {
  question: Localized;
  answer: Localized;
};

export const faqs: Faq[] = [
  {
    question: { en: "What can RR take on?", id: "Apa saja yang bisa RR kerjakan?" },
    answer: {
      en: "Interior and architectural design, construction, finishing, and custom furniture, one team with one scope, from the first layout to the final installation.",
      id: "Desain interior dan arsitektur, pembangunan, finishing, hingga furnitur kustom, satu tim dengan satu lingkup, dari tata letak pertama sampai pemasangan akhir.",
    },
  },
  {
    question: {
      en: "Do I need final drawings or a fixed budget to start?",
      id: "Apakah saya perlu gambar final atau anggaran pasti untuk mulai?",
    },
    answer: {
      en: "No. A photo of the space, a rough size, or a description of the problem is enough to open the conversation. Measurements, budget, and the final design can come later, step by step.",
      id: "Tidak. Foto ruang, ukuran kasar, atau deskripsi masalahnya sudah cukup untuk membuka percakapan. Ukuran, anggaran, dan desain final bisa menyusul, selangkah demi selangkah.",
    },
  },
  {
    question: {
      en: "How does the consultation process work?",
      id: "Bagaimana alur konsultasinya?",
    },
    answer: {
      en: "It starts with a conversation about the space and the goal. From there RR explains the next steps, a survey, a design and cost plan, site work, and handover. Nothing needs to be prepared before the first contact.",
      id: "Dimulai dari percakapan tentang ruang dan tujuannya. Dari situ RR menjelaskan langkah berikutnya, survei, desain dan rencana biaya, pengerjaan, sampai serah terima. Belum ada yang perlu disiapkan sebelum kontak pertama.",
    },
  },
  {
    question: { en: "Where does RR work?", id: "Di mana saja RR melayani?" },
    answer: {
      en: "Jabodetabek and surrounding areas. Projects in the public archive span Tangerang, BSD, Meruya, Cilegon, Cikarang, Bogor, Karawang, and North Jakarta.",
      id: "Jabodetabek dan sekitarnya. Proyek di arsip publik mencakup Tangerang, BSD, Meruya, Cilegon, Cikarang, Bogor, Karawang, hingga Jakarta Utara.",
    },
  },
  {
    question: {
      en: "What do the \"Render\" and \"Site photo\" labels mean?",
      id: "Apa arti label \"Render\" dan \"Foto lapangan\"?",
    },
    answer: {
      en: "A render is a design visualisation, the planned result. A site photo documents the work as it was photographed. Every image on this site carries one of these labels, taken from the original posts.",
      id: "Render adalah visualisasi desain, gambaran yang direncanakan. Foto lapangan adalah dokumentasi pekerjaan seperti apa adanya saat difoto. Setiap gambar di situs ini memakai salah satu label tersebut, mengikuti unggahan aslinya.",
    },
  },
  {
    question: {
      en: "Are all of the projects here finished?",
      id: "Apakah semua proyek di sini sudah selesai?",
    },
    answer: {
      en: "Each project card shows its status as Completed or In progress. The year shown is the one confirmed in the archive, not an estimate.",
      id: "Setiap kartu proyek mencantumkan status Selesai atau Sedang berjalan. Tahun yang ditampilkan adalah tahun yang terkonfirmasi di arsip, bukan perkiraan.",
    },
  },
  {
    question: {
      en: "How do I contact RR?",
      id: "Bagaimana cara menghubungi RR?",
    },
    answer: {
      en: "Through WhatsApp at 0856-8122-119 or Instagram @rrinterior.construction. The WhatsApp message opens already filled and stays editable before sending. The site never sends anything on your behalf.",
      id: "Lewat WhatsApp di 0856-8122-119 atau Instagram @rrinterior.construction. Pesan WhatsApp terbuka sudah terisi dan tetap bisa Anda ubah sebelum dikirim. Situs tidak pernah mengirim apa pun atas nama Anda.",
    },
  },
  {
    question: {
      en: "Does this site store my personal data?",
      id: "Apakah situs ini menyimpan data pribadi saya?",
    },
    answer: {
      en: "No accounts, no forms, no visitor tracking. Nothing is stored in your browser.",
      id: "Tidak ada akun, formulir, atau pelacakan pengunjung. Tidak ada data yang disimpan di peramban Anda.",
    },
  },
  {
    question: {
      en: "Can I change the appearance of the site?",
      id: "Apakah tampilan situs bisa diganti?",
    },
    answer: {
      en: "The site uses a single light theme so it stays easy to read for everyone. There is no display setting to change.",
      id: "Situs memakai satu tema terang agar mudah dibaca semua orang. Tidak ada pengaturan tampilan yang perlu diubah.",
    },
  },
  {
    question: {
      en: "How do I find projects similar to what I am planning?",
      id: "Bagaimana menemukan proyek yang mirip rencana saya?",
    },
    answer: {
      en: "Open the project directory and filter by location, work type, or status. Every image keeps its render or site photo label.",
      id: "Buka direktori karya lalu saring berdasarkan lokasi, jenis pekerjaan, atau status. Setiap gambar tetap memakai label render atau foto lapangan.",
    },
  },
];
