import type { LocalizedText } from "@/lib/content";

/**
 * Pemetaan galeri arsip RR — sumber seed pustaka media (media_assets +
 * project_media). Halaman publik membaca hasil seed dari database, bukan
 * berkas ini langsung. Semua berkas berasal dari arsip publik RR
 * (data-foto/postingan) dan perannya (render vs foto lapangan) sudah
 * diverifikasi visual per gambar. `order` mengikuti urutan media di
 * unggahan aslinya; item 1 (sampul) tidak diulang di sini karena tampil
 * sebagai gambar utama halaman.
 */
export type GalleryItem = {
  order: number;
  src: string;
  /** "video" memakai elemen video manual (tanpa autoplay); default foto. */
  type?: "foto" | "video";
  /** Poster untuk video (frame asli dari berkasnya). */
  poster?: string;
  role: "render" | "foto_lapangan";
  alt: LocalizedText;
};

export const sampleGallery: Record<string, GalleryItem[]> = {
  "restaurant-cikarang": [
    {
      order: 2,
      src: "/mock/gallery/restaurant-cikarang/02.jpg",
      role: "foto_lapangan",
      alt: {
        en: "Restaurant corridor with timber door frames and hanging lanterns during fit-out",
        id: "Koridor restoran dengan kusen kayu dan lampion gantung saat pengerjaan",
      },
    },
    {
      order: 3,
      src: "/mock/gallery/restaurant-cikarang/03.jpg",
      role: "foto_lapangan",
      alt: {
        en: "Finished dining room with a marble table and a red lantern",
        id: "Ruang makan selesai dengan meja marmer dan lampion merah",
      },
    },
    {
      order: 4,
      src: "/mock/gallery/restaurant-cikarang/04.jpg",
      role: "foto_lapangan",
      alt: {
        en: "Bathroom with patterned wallpaper, dark tile wainscot, and a marble vanity",
        id: "Kamar mandi dengan wallpaper bermotif, dinding ubin gelap, dan wastafel marmer",
      },
    },
    {
      order: 5,
      src: "/mock/gallery/restaurant-cikarang/05.jpg",
      role: "foto_lapangan",
      alt: {
        en: "Dining room with a marble table, wooden chairs, and lantern lighting",
        id: "Ruang makan dengan meja marmer, kursi kayu, dan pencahayaan lampion",
      },
    },
    {
      order: 6,
      src: "/mock/gallery/restaurant-cikarang/06.jpg",
      role: "foto_lapangan",
      alt: {
        en: "Round dining table under a circular mural with lantern lighting",
        id: "Meja makan bundar di bawah mural bulat dengan pencahayaan lampion",
      },
    },
  ],
  "guest-house-design-cilegon": [
    {
      order: 2,
      src: "/mock/gallery/guest-house-design-cilegon/02.jpg",
      role: "render",
      alt: {
        en: "Guest house dining hall render with long tables and a central timber volume",
        id: "Render aula makan guest house dengan meja panjang dan massa kayu di tengah",
      },
    },
    {
      order: 3,
      src: "/mock/gallery/guest-house-design-cilegon/03.jpg",
      role: "render",
      alt: {
        en: "Guest house bathroom render with a glass shower and timber vanity",
        id: "Render kamar mandi guest house dengan shower kaca dan wastafel kayu",
      },
    },
    {
      order: 4,
      src: "/mock/gallery/guest-house-design-cilegon/04.jpg",
      role: "render",
      alt: {
        en: "Guest house dining room render with timber walls and ceiling cove lighting",
        id: "Render ruang makan guest house dengan dinding kayu dan lampu plafon tersembunyi",
      },
    },
    {
      order: 5,
      src: "/mock/gallery/guest-house-design-cilegon/05.jpg",
      role: "render",
      alt: {
        en: "Twin bedroom render with timber bed bases and grey throws",
        id: "Render kamar twin dengan dipan kayu dan selimut abu-abu",
      },
    },
    {
      order: 6,
      src: "/mock/gallery/guest-house-design-cilegon/06.jpg",
      role: "render",
      alt: {
        en: "Wardrobe render with open shelving beside full-height timber doors",
        id: "Render lemari dengan rak terbuka di samping pintu kayu setinggi ruangan",
      },
    },
  ],
  "apartment-interior-bsd": [
    {
      order: 2,
      src: "/mock/gallery/apartment-interior-bsd/02.jpg",
      role: "render",
      alt: {
        en: "Bedroom render with a study desk, TV wall, and city view",
        id: "Render kamar dengan meja belajar, dinding TV, dan pemandangan kota",
      },
    },
    {
      order: 3,
      src: "/mock/gallery/apartment-interior-bsd/03.jpg",
      role: "render",
      alt: {
        en: "Dining and kitchen render with marble wall panels and gold pendant lights",
        id: "Render ruang makan dan dapur dengan panel marmer dan lampu gantung emas",
      },
    },
    {
      order: 4,
      src: "/mock/gallery/apartment-interior-bsd/04.jpg",
      role: "foto_lapangan",
      alt: {
        en: "Site photo of the dining table and gold pendant lights after installation",
        id: "Foto lapangan meja makan dan lampu gantung emas setelah pemasangan",
      },
    },
    {
      order: 5,
      src: "/mock/gallery/apartment-interior-bsd/05.jpg",
      role: "foto_lapangan",
      alt: {
        en: "Site photo of the study desk and wall panels during finishing",
        id: "Foto lapangan meja kerja dan panel dinding saat finishing",
      },
    },
    {
      order: 6,
      src: "/mock/gallery/apartment-interior-bsd/06.jpg",
      role: "foto_lapangan",
      alt: {
        en: "Site photo of the dining area with marble panels and timber slats",
        id: "Foto lapangan area makan dengan panel marmer dan bilah kayu",
      },
    },
  ],
  "residential-furniture-meruya": [
    {
      order: 2,
      src: "/mock/gallery/residential-furniture-meruya/02.jpg",
      role: "foto_lapangan",
      alt: {
        en: "Wardrobe with lit display cabinets, photographed on site",
        id: "Lemari dengan kabinet display menyala, difoto di lokasi",
      },
    },
    {
      order: 3,
      src: "/mock/gallery/residential-furniture-meruya/03.jpg",
      role: "foto_lapangan",
      alt: {
        en: "Sliding mirrored wardrobe in the finished bedroom",
        id: "Lemari geser bercermin di kamar yang sudah selesai",
      },
    },
    {
      order: 4,
      src: "/mock/gallery/residential-furniture-meruya/04.jpg",
      role: "foto_lapangan",
      alt: {
        en: "Kitchen cabinets during installation, doors open",
        id: "Kabinet dapur saat pemasangan, pintu terbuka",
      },
    },
  ],
  "house-renovation-tangerang": [
    {
      order: 2,
      src: "/mock/gallery/house-renovation-tangerang/02.jpg",
      role: "foto_lapangan",
      alt: {
        en: "Worker finishing the upper facade on bamboo scaffolding",
        id: "Pekerja menyelesaikan fasad atas di perancah bambu",
      },
    },
    {
      order: 3,
      src: "/mock/gallery/house-renovation-tangerang/03.jpg",
      role: "foto_lapangan",
      alt: {
        en: "Bamboo scaffolding against the concrete structure",
        id: "Perancah bambu di struktur beton",
      },
    },
    {
      order: 4,
      src: "/mock/gallery/house-renovation-tangerang/04.jpg",
      role: "foto_lapangan",
      alt: {
        en: "Structure in progress with ladder, scaffolding, and blocks",
        id: "Struktur dalam pengerjaan dengan tangga, perancah, dan bata",
      },
    },
    {
      order: 5,
      src: "/mock/gallery/house-renovation-tangerang/05.mp4",
      type: "video",
      poster: "/mock/gallery/house-renovation-tangerang/05-poster.jpg",
      role: "foto_lapangan",
      alt: {
        en: "Construction progress video: blockwork and rebar at the back of the house",
        id: "Video progres pembangunan: dinding bata dan besi tulangan di belakang rumah",
      },
    },
    {
      order: 6,
      src: "/mock/gallery/house-renovation-tangerang/06.jpg",
      role: "foto_lapangan",
      alt: {
        en: "Half-built wall with construction materials on site",
        id: "Dinding setengah jadi dengan material konstruksi di lokasi",
      },
    },
  ],
  "coffee-shop-design-rustic": [
    {
      order: 2,
      src: "/work/coffee-shop-design-rustic/02.jpg",
      role: "render",
      alt: {
        en: "Coffee shop render: seating area with timber shelves and warm lighting",
        id: "Render coffee shop: area duduk dengan rak kayu dan pencahayaan hangat",
      },
    },
    {
      order: 3,
      src: "/work/coffee-shop-design-rustic/03.jpg",
      role: "render",
      alt: {
        en: "Coffee shop render: tables, shelving, and framed signs on the wall",
        id: "Render coffee shop: meja, rak, dan bingkai papan pada dinding",
      },
    },
    {
      order: 4,
      src: "/work/coffee-shop-design-rustic/04.jpg",
      role: "render",
      alt: {
        en: "Coffee shop render: the counter with open shelving above",
        id: "Render coffee shop: konter dengan rak terbuka di atasnya",
      },
    },
    {
      order: 5,
      src: "/work/coffee-shop-design-rustic/05.jpg",
      role: "foto_lapangan",
      alt: {
        en: "Site photo: the coffee shop seen through its glass front",
        id: "Foto lapangan: coffee shop terlihat dari kaca depannya",
      },
    },
  ],
  "clothing-store-bogor": [
    {
      order: 2,
      src: "/work/clothing-store-bogor/02.jpg",
      role: "foto_lapangan",
      alt: {
        en: "Clothing racks and display tables in the finished store",
        id: "Rak baju dan meja display di toko yang telah selesai",
      },
    },
    {
      order: 3,
      src: "/work/clothing-store-bogor/03.jpg",
      role: "foto_lapangan",
      alt: {
        en: "Storefront seen from the mall corridor, with signage above",
        id: "Bagian depan toko terlihat dari koridor mal, dengan papan nama di atas",
      },
    },
  ],
  "barbershop-re-design": [
    {
      order: 2,
      src: "/work/barbershop-re-design/02.jpg",
      role: "render",
      alt: {
        en: "Barbershop render: barber stations and timber-framed mirrors",
        id: "Render barbershop: stasiun barber dan cermin berbingkai kayu",
      },
    },
    {
      order: 3,
      src: "/work/barbershop-re-design/03.jpg",
      role: "render",
      alt: {
        en: "Barbershop render: brick wall, window light, and a seating bench",
        id: "Render barbershop: dinding bata, cahaya jendela, dan bangku tunggu",
      },
    },
  ],
  "living-room-nature-classic": [
    {
      order: 2,
      src: "/work/living-room-nature-classic/02.webp",
      role: "render",
      alt: {
        en: "Living room render: seating with carved wall panels and a chandelier",
        id: "Render ruang tamu: area duduk dengan panel dinding ukir dan lampu gantung",
      },
    },
    {
      order: 3,
      src: "/work/living-room-nature-classic/03.webp",
      role: "render",
      alt: {
        en: "Living room render: sofa corner with indoor plants and side lamps",
        id: "Render ruang tamu: sudut sofa dengan tanaman indoor dan lampu meja",
      },
    },
  ],
  "bedroom-toilet-warm-minimalist": [
    {
      order: 2,
      src: "/work/bedroom-toilet-warm-minimalist/02.webp",
      role: "render",
      alt: {
        en: "Bedroom render: bed with a desk and framed art above",
        id: "Render kamar: tempat tidur dengan meja dan hiasan dinding",
      },
    },
    {
      order: 3,
      src: "/work/bedroom-toilet-warm-minimalist/03.webp",
      role: "render",
      alt: {
        en: "Toilet render: floating vanity and warm mirror light",
        id: "Render toilet: wastafel gantung dan lampu cermin hangat",
      },
    },
    {
      order: 4,
      src: "/work/bedroom-toilet-warm-minimalist/04.jpg",
      role: "render",
      alt: {
        en: "Bedroom render: desk and bed with a TV cabinet",
        id: "Render kamar: meja kerja dan tempat tidur dengan kabinet TV",
      },
    },
    {
      order: 5,
      src: "/work/bedroom-toilet-warm-minimalist/05.jpg",
      role: "render",
      alt: {
        en: "Bedroom render: bed close-up with artwork and wood panels",
        id: "Render kamar: close-up tempat tidur dengan karya dan panel kayu",
      },
    },
    {
      order: 6,
      src: "/work/bedroom-toilet-warm-minimalist/06.jpg",
      role: "render",
      alt: {
        en: "Bedroom render: TV wall with wardrobe and warm strip lighting",
        id: "Render kamar: dinding TV dengan lemari dan lampu strip hangat",
      },
    },
    {
      order: 7,
      src: "/work/bedroom-toilet-warm-minimalist/07.jpg",
      role: "render",
      alt: {
        en: "Toilet render: vanity with a storage niche and warm lighting",
        id: "Render toilet: wastafel dengan relung penyimpanan dan lampu hangat",
      },
    },
  ],
  "apartment-family-area": [
    {
      order: 2,
      src: "/work/apartment-family-area/02.jpg",
      role: "render",
      alt: {
        en: "Apartment render: family area with a gallery wall and bench",
        id: "Render apartemen: ruang keluarga dengan dinding galeri dan bangku",
      },
    },
    {
      order: 3,
      src: "/work/apartment-family-area/03.jpg",
      role: "render",
      alt: {
        en: "Apartment render: sofa, sideboard, and framed artwork",
        id: "Render apartemen: sofa, sideboard, dan karya berbingkai",
      },
    },
  ],
  "kitchen-set-design": [
    {
      order: 2,
      src: "/work/kitchen-set-design/02.webp",
      role: "render",
      alt: {
        en: "Kitchen set render with under-cabinet lighting switched on",
        id: "Render kitchen set dengan lampu bawah kabinet menyala",
      },
    },
  ],
  "house-renovation-documentation": [
    {
      order: 2,
      src: "/work/house-renovation-documentation/02.jpg",
      role: "foto_lapangan",
      alt: {
        en: "Site photo: structure work with timber beams and blockwork",
        id: "Foto lapangan: pekerjaan struktur dengan balok kayu dan dinding bata",
      },
    },
    {
      order: 3,
      src: "/work/house-renovation-documentation/03.jpg",
      role: "foto_lapangan",
      alt: {
        en: "Finished dining room with a pendant light and glass blocks",
        id: "Ruang makan selesai dengan lampu gantung dan glass block",
      },
    },
    {
      order: 4,
      src: "/work/house-renovation-documentation/04.jpg",
      role: "foto_lapangan",
      alt: {
        en: "Site photo: bathroom and kitchen finishing",
        id: "Foto lapangan: finishing kamar mandi dan dapur",
      },
    },
  ],
  "modern-house-exterior": [
    {
      order: 2,
      src: "/work/modern-house-exterior/02.jpg",
      role: "render",
      alt: {
        en: "Side view of the three-storey house render at dusk, warm lights on",
        id: "Tampak samping render rumah tiga lantai saat senja, lampu menyala hangat",
      },
    },
    {
      order: 3,
      src: "/work/modern-house-exterior/03.jpg",
      role: "render",
      alt: {
        en: "Front gate and planted terrace of the house render",
        id: "Gerbang depan dan teras hijau pada render rumah",
      },
    },
  ],
  "bedroom-work-space": [
    {
      order: 2,
      src: "/work/bedroom-work-space/02.jpg",
      role: "render",
      alt: {
        en: "Bedroom render: bed with artwork and wood slat panels",
        id: "Render kamar: tempat tidur dengan karya dan panel bilah kayu",
      },
    },
    {
      order: 3,
      src: "/work/bedroom-work-space/03.jpg",
      role: "render",
      alt: {
        en: "Bedroom render with a TV, wardrobe, and warm strip lighting",
        id: "Render kamar dengan TV, lemari, dan lampu strip hangat",
      },
    },
    {
      order: 4,
      src: "/work/bedroom-work-space/04.jpg",
      role: "render",
      alt: {
        en: "Bathroom render with a floating vanity and warm lighting",
        id: "Render kamar mandi dengan wastafel gantung dan cahaya hangat",
      },
    },
  ],
  "office-meeting-room": [
    {
      order: 2,
      src: "/work/office-meeting-room/02.jpg",
      role: "render",
      alt: {
        en: "Office workspace render with desks and a lounge seat",
        id: "Render ruang kerja kantor dengan meja dan kursi santai",
      },
    },
  ],
  "auditorium-design": [
    {
      order: 2,
      src: "/work/auditorium-design/02.jpg",
      role: "render",
      alt: {
        en: "Auditorium render: closer view of the seating and the wood-slat ceiling",
        id: "Render auditorium: tampak lebih dekat area duduk dan plafon bilah kayu",
      },
    },
  ],
  "sushi-restaurant-design": [
    {
      order: 2,
      src: "/work/sushi-restaurant-design/02.jpg",
      role: "render",
      alt: {
        en: "Restaurant interior render with signage and hanging lanterns",
        id: "Render interior restoran dengan papan nama dan lampion gantung",
      },
    },
  ],
};
