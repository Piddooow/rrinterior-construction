export const locales = ["en", "id"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

const en = {
  meta: {
    title: "RR Design & Build | Interior and construction in Jabodetabek",
    description:
      "Design and construction for homes and business spaces in Jabodetabek. Project documentation with labelled renders and site photos.",
  },
  skipToContent: "Skip to content",
  breadcrumb: { label: "Breadcrumb", home: "Home" },
  pageSpine: { label: "On this page" },
  nav: {
    work: "Work",
    services: "Services & process",
    about: "About",
    contact: "Contact",
    help: "Help",
  },
  navMenu: {
    latest: "Latest project",
    viewProject: "See project",
    selectedWork: "Selected works",
    selectedWorkDesc: "Curated projects with labelled documentation.",
    archive: "Archive & gallery",
    archiveDesc: "Every photo post from RR's Instagram archive.",
    categoryHunian: "Homes",
    categoryHunianDesc: "Houses, apartments, and residential interiors.",
    categoryKomersial: "Commercial & hospitality",
    categoryKomersialDesc:
      "Restaurants, retail, guest houses, and other business spaces.",
    categoryFurnitur: "Furniture & interiors",
    categoryFurniturDesc: "Kitchen sets, wardrobes, and custom joinery.",
    process: "Consultation flow",
    processDesc: "From first contact to handover.",
  },
  menu: {
    open: "Menu",
    close: "Close",
    label: "Site menu",
    socials: "Socials",
    eyebrow: "Menu",
    tagline: "Design, build, handover.",
  },
  menuNote: {
    motif: "One team, one scope",
    area: "Jabodetabek and surrounding areas",
    scope: "Interior · Architecture · Building work",
    invite: "Start with photos, rough sizes, or the story of the problem",
  },
  language: { legend: "Language" },
  hero: {
    title: "Design and build, from first sketch to handover.",
    body: "RR is an interior and construction team working on homes and business spaces in Jabodetabek. Everything you see here carries its honest label. Renders stay renders, and site work is shown as it was photographed.",
    ctaPrimary: "Discuss your project",
    ctaSecondary: "See RR's portfolio",
    imageAlt:
      "Living room render with wood panelling and large plants, from RR's project archive",
    imageCaption: "Living room render from RR's public project archive.",
    rotator: {
      prefix: "Design and build, from first sketch to",
      words: ["handover", "move in", "completion"],
      conjunction: "or",
    },
  },
  work: {
    title: "RR's Portfolio",
    intro:
      "A sample of RR's published projects. Every image keeps its real label, design render or site photo.",
    cardCta: "Discuss a similar project",
    roleRender: "Render",
    roleSite: "Site photo",
    footnote:
      "Images are taken from RR's public project archive. Labels follow the original posts, and some projects include both renders and site photos.",
    statusSelesai: "Completed",
    statusBerjalan: "In progress",
    photoFallback: "Photo not yet available.",
    empty:
      "No published projects yet. New work appears here once it is documented.",
    viewAll: "See all projects",
    prev: "Previous projects",
    next: "Next projects",
  },
  directory: {
    metaTitle: "RR's Portfolio | RR Design & Build",
    metaDescription:
      "Curated RR projects, sorted newest first and grouped by category. Filter by location, work type, or status. Every image keeps its render or site photo label.",
    title: "RR's Portfolio",
    intro:
      "Curated RR projects, sorted newest first and grouped by category. Every image keeps its label, design render or site photo.",
    sliderRegion: "Featured projects",
    sliderPrev: "Previous project",
    sliderNext: "Next project",
    categoryNav: "Work categories",
    categoryEmpty: "No work in this category yet.",
    filterLocation: "Location",
    filterType: "Work type",
    filterStatus: "Status",
    filtersLabel: "Project filters",
    clearAll: "Clear all filters",
    activeFilters: "Active filters",
    removeFilter: "Remove filter",
    all: "All",
    clear: "Clear filters",
    count: "{count} published projects",
    countOne: "{count} published project",
    emptyTitle: "No projects match these filters.",
    emptyHint:
      "A missing match does not mean RR cannot take on your project. Clear a filter, or start a conversation.",
    emptyAllTitle: "No published projects yet.",
    emptyAllHint:
      "New work appears here once it is documented. In the meantime, start a conversation or follow the latest on Instagram.",
  },
  gallery: {
    metaTitle: "Archive & gallery | RR Design & Build",
    metaDescription:
      "Every photo post from RR's public Instagram archive, newest first, with links to the original posts. Videos are not embedded.",
    title: "Archive & gallery",
    intro:
      "Every photo post from RR's public Instagram archive, newest first. Only photos are shown here, and videos in the original posts are not embedded.",
    count: "{count} posts · {video} video posts without photos are not shown",
    photos: "{count} photos",
    hasVideo: "+ video",
    yearNav: "Jump to year",
    curatedBadge: "Selected work",
    openOnInstagram: "Open on Instagram",
    viewPhoto: "View photo",
    viewNote: "{n} of {total} photos · the rest are on Instagram",
    captionNote: "Captions are kept from the original posts (Indonesian).",
  },
  detail: {
    back: "All projects",
    scopeLabel: "Scope of work",
    yearLabel: "Year",
    sourceLabel: "Source",
    sourcePost: "Original post on Instagram",
    discuss: "Discuss this project",
    share: "Share",
    copyLink: "Copy link",
    linkCopied: "Link copied.",
    copyLinkFailed: "Couldn't copy automatically. Copy this link.",
    shareLinkFailed: "Couldn't open sharing. Copy this link.",
    galleryTitle: "Documentation",
    videoLabel: "Video",
    viewer: "Photo viewer",
    close: "Close",
    prev: "Previous photo",
    next: "Next photo",
    counter: "Photo {n} of {total}",
    videoCounter: "Video {n} of {total}",
    moreMediaSoon: "More documentation for this project is being prepared.",
    labelLegend: "Media labels",
    renderHint:
      "A render is a design visualisation, the planned result, not a finished photo.",
    siteHint:
      "A site photo documents the work as photographed, real condition, real progress.",
    hintLink: "More in common questions",
  },
  services: {
    title: "What RR can take on",
    intro:
      "Design, construction, and finishing under one scope, so nothing is lost between the drawing and the site.",
    empty: "The confirmed service list is being prepared.",
    viewAll: "See services & process",
  },
  servicesPage: {
    metaTitle: "Services & consultation | RR Design & Build",
    metaDescription:
      "Design, construction, and finishing as confirmed by RR, plus the consultation steps, from first contact to handover.",
    title: "Services & consultation",
    intro: "What RR can take on, and how the first conversation becomes a clear plan.",
    prepTitle: "Start without final drawings",
    prepBody:
      "A photo, a rough size, or a description of the problem is enough. Measurements, budget, and final design can come later, step by step.",
    prepStack: {
      region: "Getting started, four things you can prepare",
      title: "Four things that are enough to start",
      hint: "Scroll inside the deck to flip through them.",
      items: [
        {
          title: "Photos of the space",
          text: "A few photos as they are. Nothing needs to be tidy or professional.",
        },
        {
          title: "Rough sizes",
          text: "Approximate width and length are enough. Precise measurements come at the survey.",
        },
        {
          title: "The story of the problem",
          text: "What feels off today and what you want to change, in your own words.",
        },
        {
          title: "References (optional)",
          text: "Mood boards, links, or styles you like, if you already have them.",
        },
      ],
    },
    spotlight: {
      region: "How a project flows",
      showing: "Showing {title}",
      illustrationNote:
        "Illustration of a project progress report, not a screenshot of a live app.",
      board: {
        week: "Week 6 report",
        project: "Example · kitchen & dining room",
        status: "In progress",
        briefTitle: "Brief notes",
        briefBody: "A brighter kitchen, more storage, a dining table for six.",
        surveyTitle: "Sizes & condition",
        surveyBody: "3.2 × 4.1 m · ceiling 2.8 m · damp north wall.",
        designTitle: "Design & cost plan",
        designBody:
          "Final layout and a cost breakdown, approved before work starts.",
        progressTitle: "Site progress",
        progressBody: "Cabinets 80% installed · dining table in finishing.",
        photoLabel: "Site photo",
        handoverTitle: "Handover checklist",
        handoverBody: "10 of 12 items done · left, handles and silicone.",
      },
    },
  },
  process: {
    title: "From first contact to handover",
    intro:
      "You do not need final drawings or a fixed budget to start. Each decision stays visible before the next step begins.",
    cta: "Start a conversation",
    empty: "The process steps are being prepared.",
  },
  proof: {
    testimonialsTitle: "What clients say",
    testimonialsLead: "Notes from the people RR has worked with.",
    testimonialsPrev: "Previous review",
    testimonialsNext: "Next review",
    faqTitle: "FAQ",
    faqLink: "See all common questions",
  },
  story: {
    region: "How RR works",
    frames: [
      {
        kicker: "01 · Studio",
        title: "One team, one scope",
        lead: "Everything runs through one team and one scope.",
        body: "Interior design, architecture, construction, and custom furniture run under one team, from the first layout to the final installation.",
      },
      {
        kicker: "02 · How we work",
        title: "Start with what you have",
        lead: "No drawings or a fixed budget needed for the first conversation.",
        body: "A photo, a rough size, or a story about the space is enough to open the conversation. Final drawings and firm numbers come later, step by step.",
      },
      {
        kicker: "03 · Documentation",
        title: "Proof, not claims",
        lead: "Labels on every photo, with links back to the original archive.",
        body: "Every image on this site keeps its honest label. Renders stay renders, site work is shown as photographed, with links back to the original archive.",
      },
    ],
    ctaServices: "See services & process",
    ctaWork: "See RR's portfolio",
    ctaGallery: "Browse the archive",
  },
  aboutPage: {
    metaTitle: "About | RR Design & Build",
    metaDescription:
      "Who RR is, how they work, and what to expect, interior and construction in Jabodetabek.",
    title: "About RR",
    intro:
      "Interior and construction for homes and business spaces in Jabodetabek, one scope from the first layout to the final installation.",
    projectsLink: "See all projects",
  },
  about: {
    title: "The team behind the work",
    paragraphs: [
      "RR Design & Build takes on homes and business spaces in Jabodetabek and the surrounding area. Interior design, architecture, cost planning, building work, custom furniture, and steel work run under one scope, from the first layout through to handover.",
      "Work starts from what you already have, a photo, a rough size, or the story of the problem. Every image on this site keeps its original label, so renders stay renders and site photos are shown as they were taken.",
    ],
    scope: [
      {
        label: "Interior Team",
        value:
          "Layout, materials, lighting, and custom furniture for homes and business spaces.",
      },
      {
        label: "Civil Team",
        value:
          "Structure, finishing, mechanical and electrical, through to steel work. One team from start to handover.",
      },
      {
        label: "Typical projects",
        value:
          "Homes and apartments, cafes and restaurants, retail, offices, guest houses, through to warehouses.",
      },
      {
        label: "How it works",
        value:
          "Start with photos, rough sizes, or the story of the problem. Design, cost planning, and building move step by step.",
      },
    ],
    instagram: "See more on Instagram",
    viewMore: "More about RR",
    stackRegion: "RR project photo archive",
    stackHint: "Tap the photo for the next one.",
    facts: {
      studio: "Studio",
      area: "Service area",
      areaValue: "Jabodetabek and surrounding areas",
      instagram: "Instagram",
      whatsapp: "WhatsApp",
    },
    kitchenAlt:
      "Kitchen render with dark cabinets and warm wood panelling, from RR's project archive",
    siteAlt:
      "Restaurant facade under construction in Cikarang, site photo with scaffolding",
  },
  closingCta: {
    title: "Start with what you have.",
    body: "Send photos, rough sizes, or the story of the problem. RR explains the next step without making preparation feel complicated.",
  },
  founder: {
    lead: "Led by",
    role: "Founder of RR Design & Build",
    followers: "followers",
    photoAlt: "Portrait of Rangga Harahap, founder of RR Design & Build",
    photoCredit: "Photo from the RR archive",
  },
  contact: {
    title: "Let's talk",
    body: "Tell us what you are planning. A short conversation is enough to start, and we will explain what the next step looks like.",
    whatsapp: "Chat on WhatsApp",
  },
  contactPage: {
    metaTitle: "Contact | RR Design & Build",
    metaDescription:
      "Reach RR through the official WhatsApp number or Instagram. Messages are written and sent by you.",
    title: "Talk to RR",
    intro:
      "WhatsApp and Instagram are RR's official channels. You write and send the message yourself, and the site never sends anything on your behalf.",
    whatsappBody:
      "A short conversation is enough to start. The message opens already filled and you can edit it before sending.",
    instagramBody: "See more work and updates in RR's public archive.",
    servicesLink: "See services & process",
    projectsLink: "See all projects",
  },
  privacyPage: {
    metaTitle: "Privacy | RR Design & Build",
    metaDescription:
      "What this website stores, what it does not collect, and how contact channels are handled.",
    title: "Privacy",
    intro:
      "In short, this website has no accounts, no forms, and no visitor tracking. Nothing is stored on your device.",
    sections: [
      {
        title: "What is stored on your device",
        body: "Nothing. This site does not save a theme choice or any setting on your device, and it holds no personal data. The site is light for every visitor, so nothing needs to be remembered from a previous visit.",
      },
      {
        title: "What is not collected",
        body: "This site does not ask for your name, email, or phone number, and it does not run analytics, advertising, or tracking scripts. No visitor accounts exist.",
      },
      {
        title: "Contact channels",
        body: "WhatsApp and Instagram open on their own platforms with their own privacy policies. Messages are written and sent by you. This website never sends messages on your behalf.",
      },
      {
        title: "If this changes",
        body: "If a feature that collects data is added later, such as an enquiry form, this page will explain it before that feature launches. Until then, there is nothing further to disclose.",
      },
    ],
    questions: "Questions about this page? Reach RR through the contact page.",
    contactLink: "Contact RR",
  },
  faqPage: {
    metaTitle: "Common questions | RR Design & Build",
    metaDescription:
      "Straight answers about RR's services, consultation steps, service area, render and site photo labels, contact channels, and privacy.",
    title: "Common questions",
    intro:
      "Short answers drawn from what is already on this site, no prices, no promises, and no claims beyond the archive.",
    empty: "The official questions are being prepared.",
    ctaTitle: "Still have a question?",
    ctaBody:
      "Ask directly. A short conversation is enough to start, and the next step will be explained before anything moves.",
    servicesLink: "See services & process",
  },
  helpPage: {
    metaTitle: "Help | RR Design & Build",
    metaDescription:
      "Practical help for using this site, reading render and site photo labels, filtering the project directory, sharing a project, contacting RR, and what to prepare before the first conversation.",
    title: "Help",
    intro:
      "Short, practical guidance for using this site, from reading the label on every photo to starting a conversation with RR.",
    sections: [
      {
        title: "Read the labels on every photo",
        body: "“Render” marks a design visualisation. “Site photo” marks documentation from real work. A single project can include both, always labelled.",
      },
      {
        title: "Browse and filter projects",
        body: "Use the filters for room type, general location, and status. Filters combine, and every choice can be cleared.",
      },
      {
        title: "Open and share a project",
        body: "Each project page shows the scope of work, labelled photos, and a share button, useful when deciding with family or partners.",
      },
      {
        title: "Contact RR on WhatsApp",
        body: "The WhatsApp button opens a chat with a message you can edit before sending. The site never sends it for you. If the link will not open, copy the number instead.",
      },
      {
        title: "What to prepare is optional",
        body: "A photo, a rough size, or a description of the problem is enough. Measurements, budget, and final design can come later, step by step.",
      },
      {
        title: "Privacy and your device",
        body: "No visitor accounts and no analytics from third parties. Nothing is stored on your device. Details are in the privacy policy.",
      },
    ],
    faqCta: "Looking for a specific question?",
    faqLink: "See common questions",
    servicesLink: "See services & process",
    contactLink: "Go to contact",
  },
  notFound: {
    title: "This page is not here",
    body: "The link may be old, or the address may have a typo. The work and contact options below still lead somewhere useful.",
    home: "Home",
    projects: "All projects",
    contact: "Contact RR",
  },
  footer: {
    blurb:
      "Interior and construction for homes and business spaces in Jabodetabek.",
    explore: "Explore",
    work: "Work",
    allProjects: "All projects",
    channels: "Contact",
    whatsappLabel: "WhatsApp",
    contactPage: "Contact page",
    privacy: "Privacy",
    emailCopy: "Copy {email}",
    emailCopied: "Copied",
    emailFailed: "Couldn't copy",
    emailHint: "Click to copy",
    rights: "All rights reserved.",
    archiveNote: "Project preview built from RR's public archive.",
  },
  wa: {
    // Katalog pesan siap edit per lokasi (POV pengunjung, tanpa klaim).
    // base dipakai header; kunci lain dipakai halaman/seksinya masing-masing.
    base: "Hello RR, I would like to discuss an interior or construction plan.",
    hero: "Hello RR, I just opened the RR website and would like to discuss my interior or construction plan.",
    process:
      "Hello RR, I have read the process through to handover. I would like to start with the first consultation.",
    services:
      "Hello RR, I have read the Services page. I would like to discuss which service fits, and I can start with a photo or rough sizes.",
    project:
      "Hello RR, I saw the project “{title}”{details} on your website and would like to discuss a similar one.\nInstagram {post}",
    directory:
      "Hello RR, I am browsing the RR project list. I would like to ask which project is closest to what I need.",
    about:
      "Hello RR, I have read the About RR section and would like to discuss my plan.",
    contact: "Hello RR, I would like to reach the RR team to talk about my plan.",
    faq: "Hello RR, I have read the FAQ and still have something I would like to ask.",
    footer:
      "Hello RR, I have been browsing the RR website and would like to talk about my plan.",
  },
};

export type Dictionary = typeof en;

const id: Dictionary = {
  meta: {
    title: "RR Design & Build | Interior dan konstruksi di Jabodetabek",
    description:
      "Desain dan pembangunan untuk rumah dan ruang usaha di Jabodetabek. Dokumentasi proyek dengan label render dan foto lapangan yang jelas.",
  },
  skipToContent: "Lompat ke konten",
  breadcrumb: { label: "Remah navigasi", home: "Beranda" },
  pageSpine: { label: "Di halaman ini" },
  nav: {
    work: "Karya",
    services: "Layanan & Proses",
    about: "Tentang",
    contact: "Kontak",
    help: "Bantuan",
  },
  navMenu: {
    latest: "Proyek terbaru",
    viewProject: "Lihat proyek",
    selectedWork: "Karya pilihan",
    selectedWorkDesc: "Kurasi proyek dengan dokumentasi berlabel.",
    archive: "Arsip & Galeri",
    archiveDesc: "Semua unggahan berfoto dari arsip Instagram RR.",
    categoryHunian: "Hunian",
    categoryHunianDesc: "Rumah, apartemen, dan interior hunian.",
    categoryKomersial: "Komersial & Hospitality",
    categoryKomersialDesc: "Restoran, retail, guest house, dan ruang usaha lain.",
    categoryFurnitur: "Furnitur & Interior",
    categoryFurniturDesc: "Kitchen set, wardrobe, dan pekerjaan kayu kustom.",
    process: "Alur konsultasi",
    processDesc: "Dari kontak pertama hingga serah terima.",
  },
  menu: {
    open: "Menu",
    close: "Tutup",
    label: "Menu situs",
    socials: "Sosial",
    eyebrow: "Menu",
    tagline: "Desain, bangun, serah terima.",
  },
  menuNote: {
    motif: "Satu tim, satu lingkup",
    area: "Jabodetabek dan sekitarnya",
    scope: "Interior · Arsitektur · Pembangunan",
    invite: "Mulai dari foto, ukuran kasar, atau cerita masalahnya",
  },
  language: { legend: "Bahasa" },
  hero: {
    title: "Desain dan pembangunan, dari sketsa pertama hingga serah terima.",
    body: "RR adalah tim interior dan konstruksi untuk rumah dan ruang usaha di Jabodetabek. Semua yang Anda lihat di sini diberi label jujur. Render tetap render, dan pekerjaan lapangan ditampilkan apa adanya.",
    ctaPrimary: "Diskusikan proyek Anda",
    ctaSecondary: "Lihat portofolio RR",
    imageAlt:
      "Render ruang tamu dengan panel kayu dan tanaman besar, dari arsip proyek RR",
    imageCaption: "Render ruang tamu dari arsip proyek publik RR.",
    rotator: {
      prefix: "Desain dan pembangunan, dari sketsa pertama hingga",
      words: ["serah terima", "siap huni", "tuntas"],
      conjunction: "atau",
    },
  },
  work: {
    title: "Portofolio RR",
    intro:
      "Contoh proyek publik RR. Setiap gambar tetap memakai label aslinya, render desain atau foto lapangan.",
    cardCta: "Diskusikan proyek serupa",
    roleRender: "Render",
    roleSite: "Foto lapangan",
    footnote:
      "Gambar diambil dari arsip proyek publik RR. Label mengikuti unggahan aslinya, dan sebagian proyek memuat render serta foto lapangan sekaligus.",
    statusSelesai: "Selesai",
    statusBerjalan: "Sedang berjalan",
    photoFallback: "Foto belum tersedia.",
    empty:
      "Belum ada proyek terbit. Karya baru muncul di sini setelah terdokumentasi.",
    viewAll: "Lihat semua proyek",
    prev: "Proyek sebelumnya",
    next: "Proyek berikutnya",
  },
  directory: {
    metaTitle: "Portofolio RR | RR Design & Build",
    metaDescription:
      "Kurasi proyek RR, diurutkan dari yang terbaru dan dikelompokkan per kategori. Saring berdasarkan lokasi, jenis pekerjaan, atau status. Setiap gambar tetap berlabel render atau foto lapangan.",
    title: "Portofolio RR",
    intro:
      "Kurasi proyek RR, diurutkan dari yang terbaru dan dikelompokkan per kategori. Setiap gambar tetap berlabel jujur, render desain atau foto lapangan.",
    sliderRegion: "Karya unggulan",
    sliderPrev: "Proyek sebelumnya",
    sliderNext: "Proyek berikutnya",
    categoryNav: "Kategori karya",
    categoryEmpty: "Belum ada karya di kategori ini.",
    filterLocation: "Lokasi",
    filterType: "Jenis pekerjaan",
    filterStatus: "Status",
    filtersLabel: "Saringan proyek",
    clearAll: "Hapus semua saringan",
    activeFilters: "Saringan aktif",
    removeFilter: "Hapus saringan",
    all: "Semua",
    clear: "Hapus saringan",
    count: "{count} proyek terbit",
    countOne: "{count} proyek terbit",
    emptyTitle: "Tidak ada proyek yang cocok dengan saringan ini.",
    emptyHint:
      "Tidak ada kecocokan bukan berarti RR tidak bisa mengerjakan proyek Anda. Hapus salah satu saringan, atau mulai percakapan.",
    emptyAllTitle: "Belum ada proyek terbit.",
    emptyAllHint:
      "Karya baru muncul di sini setelah terdokumentasi. Sementara itu, mulai percakapan atau ikuti kabar terbaru di Instagram.",
  },
  gallery: {
    metaTitle: "Arsip & Galeri | RR Design & Build",
    metaDescription:
      "Seluruh unggahan berfoto dari arsip Instagram publik RR, terbaru dulu, dengan tautan ke postingan aslinya. Video tidak ditanam.",
    title: "Arsip & Galeri",
    intro:
      "Seluruh unggahan berfoto dari arsip Instagram publik RR, terbaru dulu. Hanya foto yang ditampilkan, dan video di postingan asli tidak ditanam.",
    count: "{count} unggahan · {video} unggahan berisi video saja tidak ditampilkan",
    photos: "{count} foto",
    hasVideo: "+ video",
    yearNav: "Lompat ke tahun",
    curatedBadge: "Karya pilihan",
    openOnInstagram: "Lihat di Instagram",
    viewPhoto: "Lihat foto",
    viewNote: "{n} dari {total} foto · sisanya ada di Instagram",
    captionNote: "Keterangan diambil apa adanya dari unggahan asli (bahasa Indonesia).",
  },
  detail: {
    back: "Semua proyek",
    scopeLabel: "Lingkup kerja",
    yearLabel: "Tahun",
    sourceLabel: "Sumber",
    sourcePost: "Postingan asli di Instagram",
    discuss: "Diskusikan proyek ini",
    share: "Bagikan",
    copyLink: "Salin tautan",
    linkCopied: "Tautan tersalin.",
    copyLinkFailed: "Tidak bisa menyalin otomatis. Salin tautan ini.",
    shareLinkFailed: "Tidak bisa membuka berbagi. Salin tautan ini.",
    galleryTitle: "Dokumentasi",
    videoLabel: "Video",
    viewer: "Penampil foto",
    close: "Tutup",
    prev: "Foto sebelumnya",
    next: "Foto berikutnya",
    counter: "Foto {n} dari {total}",
    videoCounter: "Video {n} dari {total}",
    moreMediaSoon: "Dokumentasi tambahan untuk proyek ini sedang disiapkan.",
    labelLegend: "Label media",
    renderHint:
      "Render adalah visualisasi desain, gambaran yang direncanakan, bukan foto hasil jadi.",
    siteHint:
      "Foto lapangan adalah dokumentasi apa adanya, kondisi nyata dan progres nyata.",
    hintLink: "Selengkapnya di pertanyaan umum",
  },
  services: {
    title: "Yang dapat RR kerjakan",
    intro:
      "Desain, pembangunan, dan finishing dalam satu lingkup, sehingga tidak ada yang hilang antara gambar dan lapangan.",
    empty: "Daftar layanan terkonfirmasi sedang disiapkan.",
    viewAll: "Lihat layanan & proses",
  },
  servicesPage: {
    metaTitle: "Layanan & konsultasi | RR Design & Build",
    metaDescription:
      "Desain, pembangunan, dan finishing yang sudah dikonfirmasi RR, plus alur konsultasi dari kontak pertama hingga serah terima.",
    title: "Layanan & konsultasi",
    intro: "Yang dapat RR kerjakan, dan bagaimana percakapan pertama menjadi rencana yang jelas.",
    prepTitle: "Mulai tanpa gambar final",
    prepBody:
      "Foto, ukuran kasar, atau deskripsi masalahnya sudah cukup. Ukuran, anggaran, dan desain final bisa menyusul, selangkah demi selangkah.",
    prepStack: {
      region: "Persiapan awal, empat hal yang bisa Anda siapkan",
      title: "Empat hal yang cukup untuk mulai",
      hint: "Geser di dalam dek untuk menelusuri.",
      items: [
        {
          title: "Foto ruang",
          text: "Beberapa foto apa adanya. Tidak perlu rapi atau profesional.",
        },
        {
          title: "Ukuran kasar",
          text: "Perkiraan panjang dan lebar sudah cukup. Ukuran presisi menyusul saat survei.",
        },
        {
          title: "Cerita masalahnya",
          text: "Apa yang terasa mengganggu dan apa yang ingin diubah, dengan kata Anda sendiri.",
        },
        {
          title: "Referensi (opsional)",
          text: "Mood board, tautan, atau gaya yang Anda suka, kalau sudah punya.",
        },
      ],
    },
    spotlight: {
      region: "Alur sebuah proyek",
      showing: "Menampilkan {title}",
      illustrationNote:
        "Ilustrasi laporan progres proyek, bukan tangkapan layar aplikasi nyata.",
      board: {
        week: "Laporan minggu 6",
        project: "Contoh · dapur & ruang makan",
        status: "Berjalan",
        briefTitle: "Catatan kebutuhan",
        briefBody:
          "Dapur lebih terang, penyimpanan lebih banyak, meja makan untuk enam orang.",
        surveyTitle: "Ukuran & kondisi",
        surveyBody: "3,2 × 4,1 m · plafon 2,8 m · dinding utara lembap.",
        designTitle: "Desain & rencana biaya",
        designBody:
          "Layout final dan rincian biaya, disetujui sebelum pekerjaan mulai.",
        progressTitle: "Progres lapangan",
        progressBody: "Kabinet terpasang 80% · meja makan dalam finishing.",
        photoLabel: "Foto lapangan",
        handoverTitle: "Checklist serah terima",
        handoverBody: "10 dari 12 item beres · sisa, handle dan silikon.",
      },
    },
  },
  process: {
    title: "Dari kontak pertama hingga serah terima",
    intro:
      "Anda tidak perlu gambar final atau anggaran pasti untuk memulai. Setiap keputusan tetap terlihat sebelum langkah berikutnya dimulai.",
    cta: "Mulai percakapan",
    empty: "Langkah proses sedang disiapkan.",
  },
  proof: {
    testimonialsTitle: "Kata klien",
    testimonialsLead: "Catatan dari orang yang pernah bekerja dengan RR.",
    testimonialsPrev: "Ulasan sebelumnya",
    testimonialsNext: "Ulasan berikutnya",
    faqTitle: "FAQ",
    faqLink: "Lihat semua pertanyaan umum",
  },
  story: {
    region: "Cara kerja RR",
    frames: [
      {
        kicker: "01 · Studio",
        title: "Satu tim, satu lingkup",
        lead: "Semuanya berjalan lewat satu tim dengan satu lingkup.",
        body: "Desain interior, arsitektur, pembangunan, dan furnitur kustom berjalan dalam satu tim, dari tata letak pertama hingga pemasangan terakhir.",
      },
      {
        kicker: "02 · Cara kerja",
        title: "Mulai dari yang ada",
        lead: "Belum perlu gambar atau anggaran pasti untuk percakapan pertama.",
        body: "Foto, ukuran kasar, atau cerita soal ruangnya sudah cukup untuk membuka percakapan. Gambar final dan angka pasti menyusul, selangkah demi selangkah.",
      },
      {
        kicker: "03 · Dokumentasi",
        title: "Bukti, bukan klaim",
        lead: "Label di setiap foto, lengkap dengan tautan ke arsip aslinya.",
        body: "Semua gambar di situs ini berlabel jujur. Render tetap render, pekerjaan lapangan ditampilkan apa adanya, lengkap dengan tautan ke arsip aslinya.",
      },
    ],
    ctaServices: "Lihat layanan & proses",
    ctaWork: "Lihat portofolio RR",
    ctaGallery: "Telusuri arsip",
  },
  aboutPage: {
    metaTitle: "Tentang | RR Design & Build",
    metaDescription:
      "Siapa RR, cara kerjanya, dan apa yang bisa diharapkan, interior dan konstruksi di Jabodetabek.",
    title: "Tentang RR",
    intro:
      "Interior dan konstruksi untuk rumah dan ruang usaha di Jabodetabek, satu lingkup dari tata letak pertama hingga pemasangan akhir.",
    projectsLink: "Lihat semua proyek",
  },
  about: {
    title: "Tim di balik pekerjaan ini",
    paragraphs: [
      "RR Design & Build menangani rumah dan ruang usaha di Jabodetabek dan sekitarnya. Desain interior, arsitektur, perencanaan biaya, pembangunan, furnitur kustom, dan pekerjaan baja berjalan dalam satu lingkup, dari tata letak pertama hingga serah terima.",
      "Semuanya dimulai dari apa yang sudah Anda punya, foto, ukuran kasar, atau cerita masalahnya. Setiap gambar di situs ini memakai label aslinya, jadi render tetap render dan foto lapangan ditampilkan apa adanya.",
    ],
    scope: [
      {
        label: "Tim Interior",
        value:
          "Tata letak, material, pencahayaan, dan furnitur kustom untuk rumah maupun ruang usaha.",
      },
      {
        label: "Tim Sipil",
        value:
          "Struktur, finishing, mekanikal dan elektrikal, sampai pekerjaan baja. Satu tim dari awal sampai serah terima.",
      },
      {
        label: "Jenis proyek",
        value:
          "Rumah dan apartemen, kafe dan restoran, retail, kantor, guest house, sampai gudang.",
      },
      {
        label: "Cara kerja",
        value:
          "Mulai dari foto, ukuran kasar, atau cerita masalahnya. Desain, rencana biaya, dan pengerjaan berjalan bertahap.",
      },
    ],
    instagram: "Lihat lebih banyak di Instagram",
    viewMore: "Selengkapnya tentang RR",
    stackRegion: "Arsip foto proyek RR",
    stackHint: "Ketuk foto untuk melihat berikutnya.",
    facts: {
      studio: "Studio",
      area: "Wilayah layanan",
      areaValue: "Jabodetabek dan sekitarnya",
      instagram: "Instagram",
      whatsapp: "WhatsApp",
    },
    kitchenAlt:
      "Render dapur dengan kabinet gelap dan panel kayu hangat, dari arsip proyek RR",
    siteAlt:
      "Fasad restoran dalam pembangunan di Cikarang, foto lapangan dengan perancah",
  },
  closingCta: {
    title: "Mulai dari yang Anda punya.",
    body: "Kirim foto, ukuran kasar, atau cerita masalahnya. RR menjelaskan langkah berikutnya tanpa membuat persiapan terasa rumit.",
  },
  founder: {
    lead: "Dipimpin oleh",
    role: "Pendiri RR Design & Build",
    followers: "pengikut",
    photoAlt: "Potret Rangga Harahap, pendiri RR Design & Build",
    photoCredit: "Foto arsip RR",
  },
  contact: {
    title: "Mari bicara",
    body: "Ceritakan yang sedang Anda rencanakan. Satu percakapan singkat sudah cukup untuk memulai, dan kami akan menjelaskan langkah berikutnya.",
    whatsapp: "Chat on WhatsApp",
  },
  contactPage: {
    metaTitle: "Kontak | RR Design & Build",
    metaDescription:
      "Hubungi RR lewat nomor WhatsApp resmi atau Instagram. Pesan ditulis dan dikirim oleh Anda sendiri.",
    title: "Bicara dengan RR",
    intro:
      "WhatsApp dan Instagram adalah kanal resmi RR. Anda sendiri yang menulis dan mengirim pesan, dan situs tidak pernah mengirim atas nama Anda.",
    whatsappBody:
      "Satu percakapan singkat sudah cukup untuk memulai. Pesan terbuka terisi dan bisa Anda ubah sebelum dikirim.",
    instagramBody: "Lihat lebih banyak pekerjaan dan kabar di arsip publik RR.",
    servicesLink: "Lihat layanan & proses",
    projectsLink: "Lihat semua proyek",
  },
  privacyPage: {
    metaTitle: "Privasi | RR Design & Build",
    metaDescription:
      "Apa yang disimpan situs ini, apa yang tidak dikumpulkan, dan bagaimana kanal kontak ditangani.",
    title: "Kebijakan Privasi",
    intro:
      "Ringkasnya, situs ini tidak punya akun, formulir, maupun pelacakan pengunjung. Tidak ada yang tersimpan di perangkat Anda.",
    sections: [
      {
        title: "Yang disimpan di perangkat Anda",
        body: "Tidak ada. Situs ini tidak menyimpan pilihan tema atau pengaturan apa pun di perangkat Anda, dan tidak ada data pribadi di dalamnya. Situs tampil terang untuk semua pengunjung, jadi tidak ada yang perlu diingat dari kunjungan sebelumnya.",
      },
      {
        title: "Yang tidak dikumpulkan",
        body: "Situs ini tidak meminta nama, email, atau nomor telepon Anda, dan tidak menjalankan analytics, iklan, atau skrip pelacak. Tidak ada akun pengunjung.",
      },
      {
        title: "Kanal kontak",
        body: "WhatsApp dan Instagram terbuka di platform mereka sendiri dan memakai kebijakan privasi mereka sendiri. Pesan ditulis dan dikirim oleh Anda. Situs ini tidak pernah mengirim pesan atas nama Anda.",
      },
      {
        title: "Jika ini berubah",
        body: "Bila nanti ada fitur yang mengumpulkan data, misalnya formulir pertanyaan, halaman ini akan menjelaskannya sebelum fitur itu aktif. Sampai saat itu, tidak ada hal lain yang perlu diungkapkan.",
      },
    ],
    questions:
      "Ada pertanyaan tentang halaman ini? Hubungi RR lewat halaman kontak.",
    contactLink: "Hubungi RR",
  },
  faqPage: {
    metaTitle: "Pertanyaan umum | RR Design & Build",
    metaDescription:
      "Jawaban singkat soal layanan RR, alur konsultasi, wilayah layanan, label render vs foto lapangan, kanal kontak, dan privasi.",
    title: "Pertanyaan umum",
    intro:
      "Jawaban singkat dari hal yang sudah ada di situs ini, tanpa harga, tanpa janji, dan tanpa klaim di luar arsip.",
    empty: "Pertanyaan resmi sedang disiapkan.",
    ctaTitle: "Masih ada pertanyaan?",
    ctaBody:
      "Tanyakan langsung. Percakapan singkat sudah cukup untuk memulai, dan langkah berikutnya dijelaskan sebelum apa pun berjalan.",
    servicesLink: "Lihat layanan & proses",
  },
  helpPage: {
    metaTitle: "Bantuan | RR Design & Build",
    metaDescription:
      "Panduan singkat memakai situs ini, membaca label render dan foto lapangan, menyaring direktori proyek, membagikan proyek, menghubungi RR, dan persiapan sebelum percakapan pertama.",
    title: "Bantuan",
    intro:
      "Panduan singkat dan praktis, dari membaca label di setiap foto hingga memulai percakapan dengan RR.",
    sections: [
      {
        title: "Baca label di setiap foto",
        body: "“Render” adalah visualisasi desain. “Foto lapangan” adalah dokumentasi pekerjaan nyata. Satu proyek bisa memuat keduanya, selalu berlabel.",
      },
      {
        title: "Jelajahi dan saring proyek",
        body: "Gunakan saringan untuk jenis ruang, lokasi umum, dan status. Saringan bisa digabung dan dibersihkan kapan pun.",
      },
      {
        title: "Buka dan bagikan proyek",
        body: "Tiap halaman proyek memuat lingkup kerja, foto berlabel, dan tombol bagikan, berguna saat berdiskusi dengan keluarga atau rekan.",
      },
      {
        title: "Hubungi RR lewat WhatsApp",
        body: "Tombol WhatsApp membuka percakapan dengan pesan yang bisa Anda ubah sebelum dikirim. Situs tidak mengirim atas nama Anda. Bila tautan tidak terbuka, salin nomornya.",
      },
      {
        title: "Persiapan itu opsional",
        body: "Foto, ukuran kasar, atau deskripsi masalahnya sudah cukup. Ukuran, anggaran, dan desain final bisa menyusul selangkah demi selangkah.",
      },
      {
        title: "Privasi dan perangkat Anda",
        body: "Tanpa akun pengunjung dan tanpa analitik pihak ketiga. Tidak ada yang tersimpan di perangkat ini. Selengkapnya di kebijakan privasi.",
      },
    ],
    faqCta: "Mencari pertanyaan tertentu?",
    faqLink: "Lihat pertanyaan umum",
    servicesLink: "Lihat layanan & proses",
    contactLink: "Ke halaman kontak",
  },
  notFound: {
    title: "Halaman ini tidak ada di sini",
    body: "Tautannya mungkin sudah lama, atau alamatnya salah ketik. Karya dan kanal kontak di bawah tetap membawa Anda ke tempat yang berguna.",
    home: "Beranda",
    projects: "Semua proyek",
    contact: "Hubungi RR",
  },
  footer: {
    blurb:
      "Interior dan konstruksi untuk rumah dan ruang usaha di Jabodetabek.",
    explore: "Jelajahi",
    work: "Karya",
    allProjects: "Semua proyek",
    channels: "Kontak",
    whatsappLabel: "WhatsApp",
    contactPage: "Halaman kontak",
    privacy: "Privasi",
    emailCopy: "Salin {email}",
    emailCopied: "Tersalin",
    emailFailed: "Gagal menyalin",
    emailHint: "Klik untuk salin",
    rights: "Seluruh hak dilindungi.",
    archiveNote: "Pratinjau proyek dari arsip publik RR.",
  },
  wa: {
    // Katalog pesan siap edit per lokasi (POV pengunjung, tanpa klaim).
    // base dipakai header; kunci lain dipakai halaman/seksinya masing-masing.
    base: "Halo RR, saya ingin berdiskusi tentang rencana interior atau konstruksi.",
    hero: "Halo RR, saya baru membuka situs web RR dan ingin berdiskusi tentang rencana interior atau konstruksi saya.",
    process:
      "Halo RR, saya sudah membaca alur kerjanya sampai serah terima. Saya ingin mulai dari konsultasi pertama.",
    services:
      "Halo RR, saya membaca halaman Layanan. Saya ingin berdiskusi tentang layanan yang cocok, dan saya bisa mulai dari foto atau ukuran kasar.",
    project:
      "Halo RR, saya melihat proyek “{title}”{details} di website dan ingin membahas rencana serupa.\nInstagram {post}",
    directory:
      "Halo RR, saya sedang menelusuri daftar proyek RR. Saya ingin bertanya proyek mana yang paling dekat dengan kebutuhan saya.",
    about:
      "Halo RR, saya membaca bagian Tentang RR dan ingin berdiskusi tentang rencana saya.",
    contact:
      "Halo RR, saya ingin menghubungi tim RR untuk membahas rencana saya.",
    faq: "Halo RR, saya sudah membaca FAQ, dan masih ada yang ingin saya tanyakan.",
    footer:
      "Halo RR, saya menelusuri situs web RR dan ingin membahas rencana saya.",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, id };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
