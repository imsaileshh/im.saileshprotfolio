'use client';

import { useState, useEffect, useRef, ChangeEvent, DragEvent } from 'react';
import Image from 'next/image';
import { 
  AlertCircle, 
  Check, 
  ImageOff,
  Link as LinkIcon, 
  Loader2, 
  RefreshCw, 
  Trash2, 
  UploadCloud 
} from 'lucide-react';

interface ImageUploaderProps {
  name: string;
  value?: string | null;
  onChange?: (url: string) => void;
  label?: string;
  helperText?: string;
  aspectRatio?: string;
}

export function ImageUploader({
  name,
  value = '',
  onChange,
  label = 'Cover Image',
  helperText = 'Upload a high-quality JPG, PNG, WebP or SVG (max 20MB).',
  aspectRatio = 'aspect-[16/10]',
}: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState<string>(value || '');
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImageUrl(value || '');
    setImageLoadError(false);
  }, [value]);

  const handleUpload = async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|svg|gif)$/i)) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP, SVG, GIF).');
      return;
    }

    // Validate size (20MB)
    if (file.size > 20 * 1024 * 1024) {
      setUploadError('Image size exceeds 20MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setImageUrl(data.url);
      onChange?.(data.url);
    } catch (err: unknown) {
      console.error('Image upload failed:', err);
      const message = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleRemove = () => {
    setImageUrl('');
    onChange?.('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleManualUrlChange = (val: string) => {
    setImageUrl(val);
    onChange?.(val);
  };

  return (
    <div className="space-y-2 w-full">
      {/* Hidden input for standard FormData submissions */}
      <input type="hidden" name={name} value={imageUrl} />

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
        onChange={onFileChange}
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-zinc-300">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1 font-mono"
        >
          <LinkIcon size={11} />
          <span>{showUrlInput ? 'Hide URL input' : 'Or paste URL'}</span>
        </button>
      </div>

      {/* Image Preview or Dropzone */}
      {imageUrl ? (
        <div className="relative group rounded-xl border border-white/10 overflow-hidden bg-black/40">
          <div className={`relative w-full ${aspectRatio} max-h-[300px]`}>
            {imageLoadError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 p-4 text-center">
                <ImageOff size={28} className="text-zinc-500 mb-2" />
                <p className="text-xs text-zinc-400 font-medium">Image could not be loaded</p>
                <p className="text-[10px] text-zinc-600 mt-1 max-w-xs truncate">{imageUrl}</p>
              </div>
            ) : (
              <Image
                src={imageUrl}
                alt="Uploaded preview"
                fill
                unoptimized={imageUrl.startsWith('/uploads/')}
                className="object-cover"
                onError={() => setImageLoadError(true)}
              />
            )}
            {/* Ambient Dark Overlay on Hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 backdrop-blur-[2px]">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium backdrop-blur-md transition-all active:scale-95"
              >
                <RefreshCw size={13} className={isUploading ? 'animate-spin' : ''} />
                <span>Replace Image</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-red-200 border border-red-500/40 text-xs font-medium backdrop-blur-md transition-all active:scale-95"
              >
                <Trash2 size={13} />
                <span>Remove</span>
              </button>
            </div>
          </div>
          <div className="px-3.5 py-2 bg-[#141518] border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span className="truncate max-w-xs">{imageUrl}</span>
            <span className="text-emerald-400 flex items-center gap-1 shrink-0">
              <Check size={12} /> Ready
            </span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-[#4F8CFF] bg-[#4F8CFF]/10'
              : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-black/30'
          } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-3">
              <Loader2 className="h-8 w-8 text-[#4F8CFF] animate-spin" />
              <p className="text-xs font-medium text-white">Uploading image...</p>
              <p className="text-[11px] text-zinc-500">Processing file</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 mb-3 group-hover:text-white group-hover:scale-105 transition-all">
                <UploadCloud size={22} className="text-[#4F8CFF]" />
              </div>
              <p className="text-sm font-medium text-white mb-1">
                Click to upload <span className="text-zinc-500 font-normal">or drag and drop</span>
              </p>
              <p className="text-xs text-zinc-500 max-w-xs font-normal">
                {helperText}
              </p>
            </>
          )}
        </div>
      )}

      {/* Manual URL Input Fallback */}
      {showUrlInput && (
        <div className="pt-2">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => handleManualUrlChange(e.target.value)}
            placeholder="https://... or /images/projects/cover.png"
            className="h-9 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-xs text-white outline-none transition placeholder:text-zinc-600 focus:border-[#4F8CFF] font-mono"
          />
        </div>
      )}

      {/* Upload Error Message */}
      {uploadError && (
        <div className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
          <AlertCircle size={13} className="shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}
