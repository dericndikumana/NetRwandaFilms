import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { getActiveLicenseFilter } from '@/lib/license';
import { LicenseStatus, KinyarwandaType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const licenseStatus = searchParams.get('licenseStatus') as LicenseStatus | null;
    const includeExpired = searchParams.get('includeExpired') === 'true';

    // Base query conditions
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { titleRw: { contains: search, mode: 'insensitive' } },
        { synopsis: { contains: search, mode: 'insensitive' } },
        { licenseOwner: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categories = {
        some: {
          slug: category,
        },
      };
    }

    if (licenseStatus) {
      where.licenseStatus = licenseStatus;
    }

    // For public consumers, automatically hide expired movies
    if (!includeExpired) {
      Object.assign(where, getActiveLicenseFilter());
    }

    const movies = await prisma.movie.findMany({
      where,
      include: {
        categories: {
          select: { id: true, name: true, nameRw: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ movies });
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json({ error: 'Failed to fetch movies.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized. Staff role required.' }, { status: 401 });
    }

    const body = await req.json();

    const {
      title,
      titleRw,
      synopsis,
      synopsisRw,
      releaseYear,
      durationMinutes,
      ageRating,
      posterUrl,
      bannerUrl,
      trailerUrl,
      videoUrl,
      videoKey,
      video480pUrl,
      video720pUrl,
      video1080pUrl,
      subtitlesUrl,
      subtitlesRwUrl,
      hasKinyarwanda,
      kinyarwandaType,
      kinyarwandaAudioUrl,
      kinyarwandaVideoUrl,
      licenseStatus,
      licenseOwner,
      licenseContact,
      licenseStart,
      licenseExpires,
      licenseNotes,
      licenseDocUrl,
      isPublished,
      isFeatured,
      featuredOrder,
      categoryIds,
    } = body;

    if (!title || !synopsis || !releaseYear || !durationMinutes || !posterUrl || !bannerUrl || !videoUrl) {
      return NextResponse.json({ error: 'Missing mandatory film fields (title, synopsis, year, duration, poster, banner, video).' }, { status: 400 });
    }

    // Create unique slug
    let baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.movie.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const movie = await prisma.movie.create({
      data: {
        title,
        titleRw: titleRw || null,
        slug,
        synopsis,
        synopsisRw: synopsisRw || null,
        releaseYear: parseInt(releaseYear, 10),
        durationMinutes: parseInt(durationMinutes, 10),
        ageRating: ageRating || '13+',
        posterUrl,
        bannerUrl,
        trailerUrl: trailerUrl || null,
        videoUrl,
        videoKey: videoKey || null,
        video480pUrl: video480pUrl || null,
        video720pUrl: video720pUrl || null,
        video1080pUrl: video1080pUrl || null,
        subtitlesUrl: subtitlesUrl || null,
        subtitlesRwUrl: subtitlesRwUrl || null,
        hasKinyarwanda: Boolean(hasKinyarwanda),
        kinyarwandaType: (kinyarwandaType as KinyarwandaType) || KinyarwandaType.NONE,
        kinyarwandaAudioUrl: kinyarwandaAudioUrl || null,
        kinyarwandaVideoUrl: kinyarwandaVideoUrl || null,
        licenseStatus: (licenseStatus as LicenseStatus) || LicenseStatus.LICENSED,
        licenseOwner: licenseOwner || null,
        licenseContact: licenseContact || null,
        licenseStart: licenseStart ? new Date(licenseStart) : null,
        licenseExpires: licenseExpires ? new Date(licenseExpires) : null,
        licenseNotes: licenseNotes || null,
        licenseDocUrl: licenseDocUrl || null,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        isFeatured: Boolean(isFeatured),
        featuredOrder: featuredOrder ? parseInt(featuredOrder, 10) : 0,
        categories: categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0
          ? { connect: categoryIds.map((id: string) => ({ id })) }
          : undefined,
      },
      include: {
        categories: true,
      },
    });

    // If featured, add or update featured banner record
    if (movie.isFeatured) {
      await prisma.featuredBanner.create({
        data: {
          movieId: movie.id,
          title: movie.title,
          titleRw: movie.titleRw,
          tagline: 'Featured Film',
          taglineRw: 'Filime y\'Icyitegererezo',
          imageUrl: movie.bannerUrl,
          isActive: true,
          order: movie.featuredOrder,
        },
      });
    }

    return NextResponse.json({ movie }, { status: 201 });
  } catch (error) {
    console.error('Error creating movie:', error);
    return NextResponse.json({ error: 'Failed to create movie record.' }, { status: 500 });
  }
}
