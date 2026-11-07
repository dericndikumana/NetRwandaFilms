import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LicenseStatus, KinyarwandaType } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: params.id },
      include: {
        categories: true,
      },
    });

    if (!movie) {
      return NextResponse.json({ error: 'Movie not found.' }, { status: 404 });
    }

    return NextResponse.json({ movie });
  } catch (error) {
    console.error('Error fetching movie:', error);
    return NextResponse.json({ error: 'Failed to retrieve movie.' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
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

    const movie = await prisma.movie.update({
      where: { id: params.id },
      data: {
        title,
        titleRw: titleRw || null,
        synopsis,
        synopsisRw: synopsisRw || null,
        releaseYear: releaseYear ? parseInt(releaseYear, 10) : undefined,
        durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : undefined,
        ageRating,
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
        hasKinyarwanda: hasKinyarwanda !== undefined ? Boolean(hasKinyarwanda) : undefined,
        kinyarwandaType: kinyarwandaType as KinyarwandaType,
        kinyarwandaAudioUrl: kinyarwandaAudioUrl || null,
        kinyarwandaVideoUrl: kinyarwandaVideoUrl || null,
        licenseStatus: licenseStatus as LicenseStatus,
        licenseOwner: licenseOwner !== undefined ? licenseOwner : undefined,
        licenseContact: licenseContact !== undefined ? licenseContact : undefined,
        licenseStart: licenseStart ? new Date(licenseStart) : null,
        licenseExpires: licenseExpires ? new Date(licenseExpires) : null,
        licenseNotes: licenseNotes || null,
        licenseDocUrl: licenseDocUrl || null,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
        featuredOrder: featuredOrder !== undefined ? parseInt(featuredOrder, 10) : undefined,
        categories: categoryIds
          ? {
              set: categoryIds.map((id: string) => ({ id })),
            }
          : undefined,
      },
      include: {
        categories: true,
      },
    });

    return NextResponse.json({ movie });
  } catch (error) {
    console.error('Error updating movie:', error);
    return NextResponse.json({ error: 'Failed to update movie.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super Admin privileges required to delete a movie.' }, { status: 403 });
    }

    await prisma.movie.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Movie deleted successfully.' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    return NextResponse.json({ error: 'Failed to delete movie.' }, { status: 500 });
  }
}

