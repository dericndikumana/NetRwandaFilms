import { NextResponse } from 'next/server';
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

    const now = new Date();
    const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const [
      totalMovies,
      activeLicensedMovies,
      expiredMovies,
      expiringSoonMovies,
      viewsAggregate,
      popularMovies,
      pendingReportsCount,
      usersCount,
      commentsCount,
    ] = await Promise.all([
      prisma.movie.count(),
      prisma.movie.count({
        where: {
          licenseStatus: LicenseStatus.LICENSED,
          licenseExpires: { gte: now },
        },
      }),
      prisma.movie.count({
        where: {
          OR: [
            { licenseExpires: { lt: now } },
            { licenseStatus: LicenseStatus.EXPIRED },
          ],
        },
      }),
      prisma.movie.count({
        where: {
          licenseStatus: LicenseStatus.LICENSED,
          licenseExpires: { gte: now, lte: fourteenDaysFromNow },
        },
      }),
      prisma.movie.aggregate({
        _sum: {
          viewsCount: true,
        },
      }),
      prisma.movie.findMany({
        take: 5,
        orderBy: { viewsCount: 'desc' },
        select: {
          id: true,
          title: true,
          titleRw: true,
          slug: true,
          posterUrl: true,
          viewsCount: true,
          licenseStatus: true,
          licenseExpires: true,
          releaseYear: true,
          hasKinyarwanda: true,
        },
      }),
      prisma.copyrightReport.count({
        where: { status: 'PENDING' },
      }),
      prisma.user.count(),
      prisma.comment.count(),
    ]);

    // Calculate estimated storage used: each film averages ~1.4 GB (with 480p/720p/1080p + audio)
    const estimatedStorageBytes = BigInt(totalMovies) * BigInt(1468006400); // ~1.4 GB per movie
    // Calculate estimated bandwidth: each view consumes ~400 MB average (Rwandan mobile mobile streaming)
    const totalViews = viewsAggregate._sum.viewsCount || 0;
    const estimatedBandwidthBytes = BigInt(totalViews) * BigInt(419430400); // ~400 MB per view

    return NextResponse.json({
      totalMovies,
      activeLicensedMovies,
      expiredMovies,
      expiringSoonMovies,
      totalViews,
      estimatedStorageBytes: estimatedStorageBytes.toString(),
      estimatedBandwidthBytes: estimatedBandwidthBytes.toString(),
      popularMovies,
      pendingReportsCount,
      usersCount,
      commentsCount,
    });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    return NextResponse.json({ error: 'Failed to aggregate statistics.' }, { status: 500 });
  }
}

