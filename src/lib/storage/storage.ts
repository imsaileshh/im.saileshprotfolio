import { createClient } from '@supabase/supabase-js';

const bucketName = 'portfolio-images';

function getSupabaseStorage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and a Supabase key.');
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
  const storage = getSupabaseStorage();
  const path = `${input.folder}/${Date.now()}-${safeFileName(input.fileName)}`;
  const { error } = await storage.upload(path, input.buffer, {
    contentType: input.contentType || 'application/octet-stream',
    upsert: false,
  });

  if (error) throw new Error(`Persistent file upload failed: ${error.message}`);

  const { data } = storage.getPublicUrl(path);
  return { path, url: data.publicUrl };
}
