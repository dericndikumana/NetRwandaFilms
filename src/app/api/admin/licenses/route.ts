import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LicenseStatus } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const movies = await prisma.movie.findMany({
      select: {
        id: true,
        title: true,
        titleRw: true,
        slug: true,
        posterUrl: true,
        licenseStatus: true,
        licenseOwner: true,
        licenseContact: true,
        licenseStart: true,
        licenseExpires: true,
        licenseNotes: true,
        licenseDocUrl: true,
        isPublished: true,
        viewsCount: true,
      },
      orderBy: { licenseExpires: 'asc' },
    });

    const now = new Date();
    const fourteenDays = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const enriched = movies.map((m) => {
      if (!m.licenseExpires) {
        return {
          ...m,
          isExpired: m.licenseStatus === LicenseStatus.EXPIRED,
          isExpiringSoon: false,
          daysLeft: null,
        };
      }
      const expiry = new Date(m.licenseExpires);
      const isExpired = expiry < now || m.licenseStatus === LicenseStatus.EXPIRED;
      const isExpiringSoon = !isExpired && expiry <= fourteenDays && m.licenseStatus === LicenseStatus.LICENSED;
      const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        ...m,
        isExpired,
        isExpiringSoon,
        daysLeft,
      };
    });

    return NextResponse.json({
      movies: enriched,
    });
  } catch (error) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json({ error: 'Failed to fetch license records.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { movieId, licenseStatus, licenseExpires, licenseNotes, licenseDocUrl, isPublished } = await req.json();

    if (!movieId) {
      return NextResponse.json({ error: 'Movie ID is required.' }, { status: 400 });
    }

    const updated = await prisma.movie.update({
      where: { id: movieId },
      data: {
        licenseStatus: licenseStatus as LicenseStatus,
        licenseExpires: licenseExpires ? new Date(licenseExpires) : undefined,
        licenseNotes: licenseNotes !== undefined ? licenseNotes : undefined,
        licenseDocUrl: licenseDocUrl !== undefined ? licenseDocUrl : undefined,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : undefined,
      },
    });

    return NextResponse.json({ movie: updated });
  } catch (error) {
    console.error('Error updating license:', error);
    return NextResponse.json({ error: 'Failed to update license.' }, { status: 500 });
  }
}

