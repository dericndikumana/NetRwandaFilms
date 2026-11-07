import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { movieId, reporterName, reporterEmail, rightsOwnerProof, description } = body;

    if (!movieId || !reporterName || !reporterEmail || !rightsOwnerProof || !description) {
      return NextResponse.json({ error: 'All fields are required to submit a copyright inquiry.' }, { status: 400 });
    }

    const report = await prisma.copyrightReport.create({
      data: {
        movieId,
        reporterName: reporterName.trim(),
        reporterEmail: reporterEmail.trim().toLowerCase(),
        rightsOwnerProof: rightsOwnerProof.trim(),
        description: description.trim(),
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, reportId: report.id }, { status: 201 });
  } catch (error) {
    console.error('Error submitting copyright claim:', error);
    return NextResponse.json({ error: 'Failed to submit copyright report.' }, { status: 500 });
  }
}

