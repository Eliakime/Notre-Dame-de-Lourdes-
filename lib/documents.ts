import { mkdir, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
export const dataDir=process.env.DOCUMENTS_DIR || path.join(process.cwd(),'data','documents');
export type DocumentMeta={id:string;title:string;formation:string;niveau:string;size:number;createdAt:string};
export async function listDocuments(): Promise<DocumentMeta[]> {
  await mkdir(dataDir, { recursive: true });
  const names = await readdir(dataDir);
  const docs = await Promise.all(names.filter(n => /^[a-f0-9-]{36}\.json$/.test(n)).map(async n => {
    const document = JSON.parse(await readFile(path.join(dataDir, n), 'utf8')) as DocumentMeta;
    // Keep documents published before the terminology change discoverable.
    if (document.niveau === 'Institut') document.niveau = 'Centre de formation';
    return document;
  }));
  return docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
