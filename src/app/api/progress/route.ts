import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ progress: null });
    }

    const { searchParams } = new URL(req.url);
    const movieId = searchParams.get('movieId');

    if (movieId) {
      const record = await prisma.watchProgress.findUnique({
        where: {
          userId_movieId: {
            userId: session.user.id,
            movieId,
          },
        },
      });
      return NextResponse.json({ progress: record });
    }

    const allProgress = await prisma.watchProgress.findMany({
      where: { userId: session.user.id },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            titleRw: true,
            slug: true,
            posterUrl: true,
            durationMinutes: true,
            releaseYear: true,
            ageRating: true,
            hasKinyarwanda: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({ progressList: allProgress });
  } catch (error) {
    console.error('Error fetching watch progress:', error);
    return NextResponse.json({ error: 'Failed to retrieve progress.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { movieId, progressSeconds, durationSeconds, language, completed } = body;

    if (!movieId || progressSeconds === undefined) {
      return NextResponse.json({ error: 'Missing movieId or progressSeconds.' }, { status: 400 });
    }

    // If authenticated, sync to PostgreSQL database
    if (session?.user?.id) {
      const record = await prisma.watchProgress.upsert({
        where: {
          userId_movieId: {
            userId: session.user.id,
            movieId,
          },
        },
        update: {
          progressSeconds: Math.floor(progressSeconds),
          durationSeconds: durationSeconds ? Math.floor(durationSeconds) : 0,
          language: language || 'en',
          completed: Boolean(completed),
        },
        create: {
          userId: session.user.id,
          movieId,
          progressSeconds: Math.floor(progressSeconds),
          durationSeconds: durationSeconds ? Math.floor(durationSeconds) : 0,
          language: language || 'en',
          completed: Boolean(completed),
        },
      });

      return NextResponse.json({ success: true, progress: record });
    }

    // Guest users are saved in localStorage on client side
    return NextResponse.json({ success: true, guest: true });
  } catch (error) {
    console.error('Error saving progress:', error);
    return NextResponse.json({ error: 'Failed to save progress.' }, { status: 500 });
  }
}

