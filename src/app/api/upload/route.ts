import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/dashboard/auth';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|svg|pdf)$/i)) {
      return NextResponse.json({ error: 'Unsupported file type. Allowed: JPG, PNG, WEBP, SVG, PDF' }, { status: 400 });
    }

    // 20MB limit
    const MAX_FILE_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File is too large. Maximum size is 20MB.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const hash = crypto.createHash('md5').update(buffer).digest('hex').substring(0, 8);
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
    const fileName = `${Date.now()}-${hash}-${safeName}`;

    let url = '';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    // Use service role key to bypass RLS for admin uploads
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    // 1. Try Supabase Storage if credentials are configured
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { error: uploadError } = await supabase
          .storage
          .from('portfolio-images')
          .upload(fileName, buffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: false
          });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
          url = publicUrl;
        } else {
          console.warn('Supabase storage upload error, falling back to local uploads:', uploadError.message);
        }
      } catch (err) {
        console.warn('Supabase upload exception, falling back to local uploads:', err);
      }
    }

    // 2. Seamless local disk fallback (public/uploads/) if Supabase storage is not configured or fails
    if (!url) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      url = `/uploads/${fileName}`;
    }

    let type = 'image';
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      type = 'pdf';
    } else if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
      type = 'svg';
    }

    return NextResponse.json({
      success: true,
      url,
      type
    });

  } catch (error) {
    console.error('File upload failed:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
