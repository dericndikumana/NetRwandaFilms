import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const banners = await prisma.featuredBanner.findMany({
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            titleRw: true,
            slug: true,
            bannerUrl: true,
            posterUrl: true,
            durationMinutes: true,
            releaseYear: true,
            ageRating: true,
            hasKinyarwanda: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ error: 'Failed to fetch featured banners.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { movieId, title, titleRw, tagline, taglineRw, imageUrl, isActive, order } = await req.json();

    if (!movieId) {
      return NextResponse.json({ error: 'Movie ID is required.' }, { status: 400 });
    }

    const banner = await prisma.featuredBanner.create({
      data: {
        movieId,
        title: title || null,
        titleRw: titleRw || null,
        tagline: tagline || null,
        taglineRw: taglineRw || null,
        imageUrl: imageUrl || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        order: order ? parseInt(order, 10) : 0,
      },
      include: {
        movie: true,
      },
    });

    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json({ error: 'Failed to create banner.' }, { status: 500 });
  }
}

