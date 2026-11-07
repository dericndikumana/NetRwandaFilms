import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'netrwanda-media';
const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || '';

export const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Generate a pre-signed PUT URL so the browser can upload directly
 * to Cloudflare R2 / Backblaze B2 without hitting Next.js server memory or disk.
 */
export async function getPresignedUploadUrl({
  fileKey,
  contentType,
  expiresInSeconds = 3600,
}: {
  fileKey: string;
  contentType: string;
  expiresInSeconds?: number;
}) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: expiresInSeconds,
  });

  const publicUrl = R2_PUBLIC_DOMAIN
    ? `${R2_PUBLIC_DOMAIN.replace(/\/$/, '')}/${fileKey}`
    : `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${fileKey}`;

  return { uploadUrl, publicUrl, fileKey };
}

/**
 * Delete an object from R2 bucket
 */
export async function deleteR2Object(fileKey: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
    });
    return await s3Client.send(command);
  } catch (error) {
    console.error('Failed to delete object from R2:', error);
    throw error;
  }
}

