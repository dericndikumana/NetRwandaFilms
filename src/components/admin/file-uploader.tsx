'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, X, File, Loader2 } from 'lucide-react';
import { formatBytes } from '@/lib/utils';

interface FileUploaderProps {
  label: string;
  accept: string;
  folder: 'videos' | 'posters' | 'banners' | 'audio' | 'subtitles' | 'documents';
  currentUrl?: string;
  onUploadComplete: (publicUrl: string, fileKey: string) => void;
  helperText?: string;
}

export function FileUploader({
  label,
  accept,
  folder,
  currentUrl,
  onUploadComplete,
  helperText,
}: FileUploaderProps) {
  const [progress, setProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentUrl || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [uploadedBytes, setUploadedBytes] = useState<number>(0);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);
    setFileSize(file.size);
    setUploading(true);
    setProgress(0);
    setUploadedBytes(0);

    try {
      // Step 1: Request presigned upload URL from our API
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || 'application/octet-stream',
          folder,
        }),
      });

      if (!presignRes.ok) {
        throw new Error('Failed to obtain direct upload authorization.');
      }

      const { uploadUrl, publicUrl, fileKey } = await presignRes.json();

      // Step 2: Upload directly to Cloudflare R2 / S3 with XMLHttpRequest for exact progress tracking
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
          setUploadedBytes(event.loaded);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setProgress(100);
          setUploading(false);
          setUploadedUrl(publicUrl);
          onUploadComplete(publicUrl, fileKey);
        } else {
          setError(`Direct storage upload failed with status ${xhr.status}.`);
          setUploading(false);
          setProgress(null);
        }
      };

      xhr.onerror = () => {
        setError('Network error while streaming file to Cloudflare R2.');
        setUploading(false);
        setProgress(null);
      };

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.send(file);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during file upload.');
      setUploading(false);
      setProgress(null);
    }
  };

  const handleCancel = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
    }
    setUploading(false);
    setProgress(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleClear = () => {
    setUploadedUrl(null);
    setFileName(null);
    setProgress(null);
    onUploadComplete('', '');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
          {label}
        </label>
        {uploadedUrl && !uploading && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-brand-coral hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Remove File
          </button>
        )}
      </div>

      {!uploadedUrl && !uploading && (
        <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-brand-border hover:border-brand-amber/60 rounded-2xl cursor-pointer bg-brand-surface/40 hover:bg-brand-surface transition-all duration-200 group">
          <UploadCloud className="w-8 h-8 text-brand-amber group-hover:scale-110 transition-transform mb-2" />
          <span className="text-sm font-medium text-brand-text">
            Choose file or drag & drop here
          </span>
          <span className="text-xs text-brand-text-muted mt-1">
            {helperText || `Supports direct high-speed upload (${accept})`}
          </span>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      )}

      {/* Live Upload Progress Card */}
      {uploading && (
        <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 truncate pr-2">
              <Loader2 className="w-4 h-4 text-brand-amber animate-spin flex-shrink-0" />
              <span className="font-medium text-brand-text truncate">{fileName}</span>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1 text-brand-text-muted hover:text-brand-coral transition-colors"
              title="Cancel Upload"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Track */}
          <div className="w-full h-2.5 bg-brand-bg rounded-full overflow-hidden border border-brand-border">
            <div
              className="h-full bg-brand-amber transition-all duration-150 rounded-full"
              style={{ width: `${progress || 0}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-brand-text-muted">
            <span>
              {fileSize ? `${formatBytes(uploadedBytes)} / ${formatBytes(fileSize)}` : 'Uploading...'}
            </span>
            <span className="font-bold text-brand-amber">{progress}%</span>
          </div>
        </div>
      )}

      {/* Upload Complete Success View */}
      {uploadedUrl && !uploading && (
        <div className="p-3.5 rounded-2xl bg-brand-green/10 border border-brand-green/30 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2.5 truncate mr-2">
            <CheckCircle2 className="w-5 h-5 text-brand-green flex-shrink-0" />
            <div className="truncate">
              <p className="text-xs font-semibold text-brand-green uppercase tracking-wider">
                Uploaded to R2
              </p>
              <p className="text-xs text-brand-text-muted truncate max-w-xs">{uploadedUrl}</p>
            </div>
          </div>
          <a
            href={uploadedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-blue hover:underline whitespace-nowrap"
          >
            Preview
          </a>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-brand-coral/15 border border-brand-coral/30 flex items-center gap-2 text-brand-coral text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

