import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { get, list } from '@vercel/blob';
export const dataDir=process.env.DOCUMENTS_DIR || path.join(process.cwd(),'data','documents');
export type DocumentMeta={id:string;title:string;formation:string;niveau:string;size:number;createdAt:string};
export const blobStorage = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
export async function listDocuments(): Promise<DocumentMeta[]> {
  if (blobStorage) {
    const result = await list({ prefix: 'documents/' });
    const metas = await Promise.all(result.blobs.filter(b => b.pathname.endsWith('.json')).map(async b => {
      const item = await get(b.pathname, { access: 'private' });
      if (!item?.stream) return null;
      return JSON.parse(await new Response(item.stream).text()) as DocumentMeta;
    }));
    return metas.filter((d): d is DocumentMeta => Boolean(d)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  }
  let names: string[];
  try {
    names = await readdir(dataDir);
  } catch (error) {
    // A new installation has no documents yet; listing must not require writes.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  const docs = await Promise.all(names.filter(n => /^[a-f0-9-]{36}\.json$/.test(n)).map(async n => {
    const document = JSON.parse(await readFile(path.join(dataDir, n), 'utf8')) as DocumentMeta;
    // Keep documents published before the terminology change discoverable.
    if (document.niveau === 'Institut') document.niveau = 'Centre de formation';
    return document;
  }));
  return docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
