import { createClient } from '@supabase/supabase-js';

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const bucketName = 'portfolio-images';

function getSupabaseStorage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key).storage.from(bucketName);
}

function safeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');
}

export async function uploadPersistentFile(input: {
  buffer: Buffer;
  fileName: string;
  contentType: string;
  folder: 'case-studies' | 'resumes';
}) {
  const safeName = `${Date.now()}-${safeFileName(input.fileName)}`;
  const storage = getSupabaseStorage();

  if (storage) {
    try {
      const storagePath = `${input.folder}/${safeName}`;
      const { error } = await storage.upload(storagePath, input.buffer, {
        contentType: input.contentType || 'application/octet-stream',
        upsert: false,
      });

      if (!error) {
        const { data } = storage.getPublicUrl(storagePath);
        return { path: storagePath, url: data.publicUrl };
      }
      console.warn('Supabase storage upload error, falling back to local storage:', error.message);
    } catch (err) {
      console.warn('Supabase storage upload exception, falling back to local storage:', err);
    }
  }

  // Local filesystem fallback
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', input.folder);
  await mkdir(uploadDir, { recursive: true });
  const localFilePath = path.join(uploadDir, safeName);
  await writeFile(localFilePath, input.buffer);

  const url = `/uploads/${input.folder}/${safeName}`;
  return { path: `${input.folder}/${safeName}`, url };
}
