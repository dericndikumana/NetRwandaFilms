import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const movie = await prisma.movie.update({
      where: { id: params.id },
      data: {
        viewsCount: { increment: 1 },
      },
      select: {
        id: true,
        viewsCount: true,
      },
    });

    return NextResponse.json({ success: true, viewsCount: movie.viewsCount });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return NextResponse.json({ error: 'Failed to record view.' }, { status: 500 });
  }
}
