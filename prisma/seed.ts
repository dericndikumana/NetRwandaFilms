import { PrismaClient, Role, LicenseStatus, KinyarwandaType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding NetRwandaFilms Database ---');

  // 1. Seed Super Admin and Editor Users
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'AdminRwanda2025!Secure';
  const editorPassword = process.env.DEFAULT_EDITOR_PASSWORD || 'EditorRwanda2025!Secure';

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const editorHash = await bcrypt.hash(editorPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@netrwanda.com' },
    update: {
      role: Role.SUPER_ADMIN,
      passwordHash: adminHash,
    },
    create: {
      name: 'Super Admin Rwanda',
      email: 'admin@netrwanda.com',
      passwordHash: adminHash,
      role: Role.SUPER_ADMIN,
    },
  });
  console.log(`Created Super Admin: ${admin.email}`);

  const editor = await prisma.user.upsert({
    where: { email: 'editor@netrwanda.com' },
    update: {
      role: Role.EDITOR,
      passwordHash: editorHash,
    },
    create: {
      name: 'Content Editor',
      email: 'editor@netrwanda.com',
      passwordHash: editorHash,
      role: Role.EDITOR,
    },
  });
  console.log(`Created Editor: ${editor.email}`);

  // 2. Seed Film Categories
  const categoriesData = [
    {
      name: 'Rwandan Cinema',
      nameRw: 'Filime Nyarwanda',
      slug: 'rwandan-cinema',
      description: 'Locally directed and produced Rwandan motion pictures and stories.',
      displayOrder: 1,
    },
    {
      name: 'Action & Thriller',
      nameRw: "Filime z'Imirwano",
      slug: 'action-thriller',
      description: 'High-adrenaline action films and mystery thrillers.',
      displayOrder: 2,
    },
    {
      name: 'Drama & Society',
      nameRw: "Ikinamico n'Imibereho",
      slug: 'drama-society',
      description: 'Deep emotional storytelling, relationships, and human drama.',
      displayOrder: 3,
    },
    {
      name: 'Comedy & Humor',
      nameRw: 'Gusetsa no Kwenyura',
      slug: 'comedy-humor',
      description: 'Laugh-out-loud comedy from top Rwandan and African comedians.',
      displayOrder: 4,
    },
    {
      name: 'Documentary & Heritage',
      nameRw: "Inyandiko n'Amateka",
      slug: 'documentary-heritage',
      description: 'Rwandan history, national parks, wildlife, and cultural heritage.',
      displayOrder: 5,
    },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categories.push(record);
  }
  console.log(`Seeded ${categories.length} categories.`);

  // 3. Seed Movies with Legal Licensing Data
  const sampleMovies = [
    {
      title: 'The Hills of Kigali',
      titleRw: 'Imisozi ya Kigali',
      slug: 'the-hills-of-kigali',
      synopsis:
        'A young tech entrepreneur returns to his family coffee plantation on Mount Kigali to build a solar irrigation cooperative, confronting traditional land brokers and forging modern unity.',
      synopsisRw:
        'Umusore wize iby\'ikoranabuhanga agaruka mu mirima ya kawa y\'umuryango we ku musozi wa Kigali guhanga umushinga w\'imirasire y\'izuba, akazahura n\'abashakaga kugurisha umurage wabo.',
      releaseYear: 2024,
      durationMinutes: 114,
      ageRating: '13+',
      posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80',
      trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      video480pUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      video720pUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      video1080pUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      hasKinyarwanda: true,
      kinyarwandaType: KinyarwandaType.AUDIO_TRACK,
      kinyarwandaAudioUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      licenseStatus: LicenseStatus.LICENSED,
      licenseOwner: 'Kigali Motion Pictures Ltd',
      licenseContact: 'licensing@kigalimp.rw',
      licenseStart: new Date('2024-01-01'),
      licenseExpires: new Date('2027-12-31'),
      licenseNotes: 'Exclusive free-streaming streaming agreement for East Africa territory.',
      isPublished: true,
      viewsCount: 3420,
      isFeatured: true,
      featuredOrder: 1,
      categorySlug: 'rwandan-cinema',
    },
    {
      title: 'Midnight Nyabarongo',
      titleRw: 'Ijoro ku Nyabarongo',
      slug: 'midnight-nyabarongo',
      synopsis:
        'A retired marine diver in Gatsata is drawn into an undercover recovery mission across the winding Nyabarongo river after an ancient briefcase surfaces in the marshlands.',
      synopsisRw:
        'Umwoguzi w\'inararibonye utuye mu Gatsata asabwa gufasha gushakisha igikapu cy\'ibanga cyarohamye mu mugezi wa Nyabarongo mbere y\'uko kigera mu maboko y\'abanyabyaha.',
      releaseYear: 2023,
      durationMinutes: 98,
      ageRating: '16+',
      posterUrl: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
      trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      video480pUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      video720pUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      hasKinyarwanda: true,
      kinyarwandaType: KinyarwandaType.SEPARATE_VIDEO,
      kinyarwandaVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      licenseStatus: LicenseStatus.LICENSED,
      licenseOwner: 'Nyabarongo Film Collective',
      licenseContact: 'directors@nyabarongofilms.rw',
      licenseStart: new Date('2024-06-01'),
      licenseExpires: new Date('2026-06-30'),
      licenseNotes: 'Written authorization granted for NetRwandaFilms public streaming with ads.',
      isPublished: true,
      viewsCount: 2150,
      isFeatured: true,
      featuredOrder: 2,
      categorySlug: 'action-thriller',
    },
    {
      title: 'Akagera: The Great Sanctuary',
      titleRw: 'Akagera: Ubwiza n\'Ibitangaza',
      slug: 'akagera-great-sanctuary',
      synopsis:
        'A cinematic 4K documentary detailing the historic return of black rhinos and lions to Akagera National Park and the local community rangers defending the park.',
      synopsisRw:
        'Filime mbarankuru yerekana kugaruka kw\'inkura n\'intare muri pariki y\'Akagera ndetse n\'ubwitange bw\'abarinzi b\'ibyanya by\'ubukerarugendo.',
      releaseYear: 2024,
      durationMinutes: 72,
      ageRating: 'All',
      posterUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=600&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&auto=format&fit=crop&q=80',
      trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      hasKinyarwanda: true,
      kinyarwandaType: KinyarwandaType.AUDIO_TRACK,
      licenseStatus: LicenseStatus.LICENSED,
      licenseOwner: 'Rwanda Wildlife Media Trust',
      licenseContact: 'media@wildlife.rw',
      licenseStart: new Date('2024-03-15'),
      licenseExpires: new Date('2028-03-15'),
      licenseNotes: 'Educational & cultural heritage distribution license.',
      isPublished: true,
      viewsCount: 5120,
      isFeatured: false,
      featuredOrder: 3,
      categorySlug: 'documentary-heritage',
    },
    // Sample movie with EXPIRED license to test auto-hide behavior
    {
      title: 'Vintage Kigali 1999 (Expired License)',
      titleRw: 'Kigali yo Hambere 1999',
      slug: 'vintage-kigali-1999',
      synopsis:
        'Historical footage of Kigali in the late 90s. (Note: License expired; automatically hidden from public catalog).',
      synopsisRw:
        'Amashusho y\'amateka ya Kigali. (Icyitonderwa: Uruhushya rwararangiye, ntigaragara ku rubuga).',
      releaseYear: 1999,
      durationMinutes: 50,
      ageRating: 'All',
      posterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1600&auto=format&fit=crop&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      licenseStatus: LicenseStatus.EXPIRED,
      licenseOwner: 'Heritage Archives Ltd',
      licenseContact: 'archive@heritage.rw',
      licenseStart: new Date('2020-01-01'),
      licenseExpires: new Date('2023-01-01'), // Expired date!
      licenseNotes: 'License term concluded. Pending renewal negotiations.',
      isPublished: true,
      viewsCount: 890,
      isFeatured: false,
      featuredOrder: 99,
      categorySlug: 'documentary-heritage',
    },
  ];

  for (const m of sampleMovies) {
    const { categorySlug, ...movieData } = m;
    const cat = categories.find((c) => c.slug === categorySlug);

    const movie = await prisma.movie.upsert({
      where: { slug: movieData.slug },
      update: {
        ...movieData,
        categories: cat ? { set: [{ id: cat.id }] } : undefined,
      },
      create: {
        ...movieData,
        categories: cat ? { connect: [{ id: cat.id }] } : undefined,
      },
    });

    // Create Featured Banner if featured
    if (movie.isFeatured) {
      const bannerExists = await prisma.featuredBanner.findFirst({
        where: { movieId: movie.id },
      });
      if (!bannerExists) {
        await prisma.featuredBanner.create({
          data: {
            movieId: movie.id,
            title: movie.title,
            titleRw: movie.titleRw,
            tagline: 'Stream Free • Dual Audio Available',
            taglineRw: 'Reba ku buntu • Mu Kinyarwanda & Cyongereza',
            imageUrl: movie.bannerUrl,
            isActive: true,
            order: movie.featuredOrder,
          },
        });
      }
    }
  }
  console.log(`Seeded movies with legal licensing and Kinyarwanda dubbing metadata.`);

  // 4. Seed Site Settings
  const siteSettings = [
    { key: 'site_name', value: 'NetRwandaFilms', description: 'Public platform brand name' },
    { key: 'contact_email', value: 'support@netrwandafilms.rw', description: 'Public support and rights inquiry email' },
    { key: 'dmca_email', value: 'legal@netrwandafilms.rw', description: 'Copyright claims and takedown notices' },
    { key: 'donation_message_en', value: 'Support Rwandan filmmakers by donating via MTN Mobile Money or Airtel Money.', description: 'English donation callout' },
    { key: 'donation_message_rw', value: 'Tera inkunga abakora filime mu Rwanda unyuze kuri MTN MoMo cyangwa Airtel Money.', description: 'Kinyarwanda donation callout' },
    { key: 'momo_code', value: '*182*8*1*123456# (NetRwanda Creators Fund)', description: 'Merchant / MoMo payment code' },
  ];

  for (const setting of siteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting,
    });
  }
  console.log(`Seeded site settings.`);

  console.log('--- Database seeding completed successfully! ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

