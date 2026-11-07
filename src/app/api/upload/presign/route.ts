import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPresignedUploadUrl } from '@/lib/r2';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized. Staff access required.' }, { status: 401 });
    }

    const { filename, contentType, folder } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Filename and contentType are required.' }, { status: 400 });
    }

    // Sanitize filename and create unique key
    const sanitizedFilename = filename.toLowerCase().replace(/[^a-z0-9.-]/g, '-');
    const timestamp = Date.now();
    const targetFolder = folder ? `${folder}/` : 'uploads/';
    const fileKey = `${targetFolder}${timestamp}-${sanitizedFilename}`;

    const { uploadUrl, publicUrl } = await getPresignedUploadUrl({
      fileKey,
      contentType,
      expiresInSeconds: 3600, // 1 hour upload window
    });

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      fileKey,
    });
  } catch (error) {
    console.error('Presign URL generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate presigned upload URL.' },
      { status: 500 }
    );
  }
}
