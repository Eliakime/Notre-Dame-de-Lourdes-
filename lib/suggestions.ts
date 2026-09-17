import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { del, get, list, put } from '@vercel/blob';

export type Suggestion = { id: string; message: string; name?: string; contact?: string; category?: string; createdAt: string; status: 'new' | 'read' };
const dataDir = process.env.SUGGESTIONS_DIR || path.join(process.cwd(), 'data', 'suggestions');
const blobStorage = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

export async function listSuggestions() {
  if (blobStorage) {
    const result = await list({ prefix: 'suggestions/' });
    const values = await Promise.all(result.blobs.filter(blob => blob.pathname.endsWith('.json')).map(async blob => {
      const item = await get(blob.pathname, { access: 'private', useCache: false });
      return item?.stream ? JSON.parse(await new Response(item.stream).text()) as Suggestion : null;
    }));
    return values.filter((value): value is Suggestion => Boolean(value)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  let names: string[];
  try { names = await readdir(dataDir); } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []; throw error; }
  const values = await Promise.all(names.filter(name => /^[a-f0-9-]{36}\.json$/.test(name)).map(async name => JSON.parse(await readFile(path.join(dataDir, name), 'utf8')) as Suggestion));
  return values.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveSuggestion(suggestion: Suggestion) {
  if (blobStorage) { await put(`suggestions/${suggestion.id}.json`, JSON.stringify(suggestion), { access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true }); return; }
  await mkdir(dataDir, { recursive: true }); await writeFile(path.join(dataDir, `${suggestion.id}.json`), JSON.stringify(suggestion, null, 2), 'utf8');
}

export async function deleteSuggestion(id: string) {
  if (blobStorage) { await del(`suggestions/${id}.json`).catch(() => undefined); return; }
  await unlink(path.join(dataDir, `${id}.json`)).catch(() => undefined);
}
