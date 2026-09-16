import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { get } from '@vercel/blob';
import { blobStorage, dataDir } from '../../../../../lib/documents';
import { coverContentType } from '../../../../../lib/document-covers';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id)) return new NextResponse(null, { status: 404 });
  try {
    let bytes: Uint8Array;
    if (blobStorage) {
      const cover = await get(`documents/${id}.cover`, { access: 'private' });
      if (!cover?.stream) return new NextResponse(null, { status: 404 });
      bytes = new Uint8Array(await new Response(cover.stream).arrayBuffer());
    } else {
      bytes = new Uint8Array(await readFile(path.join(dataDir, `${id}.cover`)));
    }
    const contentType = coverContentType(bytes);
    if (!contentType) return new NextResponse(null, { status: 404 });
    return new NextResponse(new Uint8Array(bytes), { headers: {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=86400',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    } });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
