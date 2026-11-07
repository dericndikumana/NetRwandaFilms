import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { title, titleRw, tagline, taglineRw, imageUrl, isActive, order } = await req.json();

    const banner = await prisma.featuredBanner.update({
      where: { id: params.id },
      data: {
        title: title || null,
        titleRw: titleRw || null,
        tagline: tagline || null,
        taglineRw: taglineRw || null,
        imageUrl: imageUrl || null,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        order: order !== undefined ? parseInt(order, 10) : undefined,
      },
      include: {
        movie: true,
      },
    });

    return NextResponse.json({ banner });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json({ error: 'Failed to update banner.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    await prisma.featuredBanner.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Featured banner removed.' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json({ error: 'Failed to delete banner.' }, { status: 500 });
  }
}

