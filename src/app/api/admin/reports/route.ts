import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ReportStatus } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const reports = await prisma.copyrightReport.findMany({
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            slug: true,
            licenseOwner: true,
            licenseStatus: true,
            licenseExpires: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch copyright reports.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { reportId, status, adminNotes } = await req.json();

    const report = await prisma.copyrightReport.update({
      where: { id: reportId },
      data: {
        status: status as ReportStatus,
        adminNotes: adminNotes !== undefined ? adminNotes : undefined,
      },
    });

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error updating report status:', error);
    return NextResponse.json({ error: 'Failed to update report status.' }, { status: 500 });
  }
}

