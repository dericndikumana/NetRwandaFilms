import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const movieId = searchParams.get('movieId');

    if (!movieId) {
      return NextResponse.json({ error: 'Movie ID is required.' }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: {
        movieId,
        isApproved: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { movieId, userName, content } = body;

    if (!movieId || !content || !content.trim()) {
      return NextResponse.json({ error: 'Movie ID and comment content are required.' }, { status: 400 });
    }

    const commenterName = session?.user?.name || userName?.trim() || 'Rwandan Movie Fan';

    const comment = await prisma.comment.create({
      data: {
        movieId,
        userId: session?.user?.id || null,
        userName: commenterName,
        content: content.trim(),
        isApproved: true, // Default approved or moderated
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ error: 'Failed to post comment.' }, { status: 500 });
  }
}

