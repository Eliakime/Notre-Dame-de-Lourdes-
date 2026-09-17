import { NextResponse } from 'next/server';
import { readFile, mkdir, writeFile, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { dataDir, blobStorage, listDocuments, type DocumentMeta } from '../../../../lib/documents';
import { del, get, put } from '@vercel/blob';
import { addActivity, currentAdmin } from '../../../../lib/admin-auth';
import { coverContentType, MAX_COVER_SIZE } from '../../../../lib/document-covers';
import { formations } from '../../../../lib/formations';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const validId = (id:string) => /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id);
const validFormation = (value:string) => ['TOUS', ...formations.map(f => f.code)].includes(value);
const validLevel = (value:string) => ['Tous niveaux','Seconde','Première','Terminale','Centre de formation'].includes(value);
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;if(!validId(id))return new NextResponse('Document introuvable.',{status:404});try{if(blobStorage){const result=await get(`documents/${id}.pdf`,{access:'private'});if(!result?.stream)return new NextResponse('Document introuvable.',{status:404});return new NextResponse(result.stream,{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="notre-dame-${id}.pdf"`,'X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store','Content-Security-Policy':"sandbox"}})}await readFile(path.join(dataDir,`${id}.json`),'utf8');const file=await readFile(path.join(dataDir,`${id}.pdf`));return new NextResponse(file,{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="notre-dame-${id}.pdf"`,'X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store','Content-Security-Policy':"sandbox"}})}catch{return new NextResponse('Document introuvable.',{status:404})}}

export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}) {
  const { id } = await params;
  const actor = await currentAdmin();
  if (!validId(id) || !actor) return NextResponse.json({ error: 'Connexion administrateur requise.' }, { status: 401 });
  try {
    const existing = (await listDocuments()).find(document => document.id === id);
    if (!existing) return NextResponse.json({ error: 'Document introuvable.' }, { status: 404 });
    const data = await request.formData();
    const title = String(data.get('title') || '').trim();
    const formation = String(data.get('formation') || '');
    const niveau = String(data.get('niveau') || '');
    if (!title || title.length > 140 || !validFormation(formation) || !validLevel(niveau)) return NextResponse.json({ error: 'Vérifiez le titre, la filière et le niveau.' }, { status: 400 });
    const file = data.get('file');
    let pdfBytes: Buffer | undefined;
    if (file instanceof File && file.size > 0) {
      if (file.size > 15 * 1024 * 1024 || !file.name.toLowerCase().endsWith('.pdf')) return NextResponse.json({ error: 'Le fichier doit être un PDF de 15 Mo maximum.' }, { status: 400 });
      pdfBytes = Buffer.from(await file.arrayBuffer());
      if (pdfBytes.subarray(0, 5).toString() !== '%PDF-') return NextResponse.json({ error: 'Le fichier sélectionné n’est pas un PDF valide.' }, { status: 400 });
    }
    const cover = data.get('cover');
    let coverBytes: Buffer | undefined; let coverType: string | null = null;
    if (cover instanceof File && cover.size > 0) {
      if (cover.size > MAX_COVER_SIZE) return NextResponse.json({ error: 'La couverture ne doit pas dépasser 1 Mo.' }, { status: 400 });
      coverBytes = Buffer.from(await cover.arrayBuffer()); coverType = coverContentType(coverBytes);
      if (!coverType) return NextResponse.json({ error: 'Choisissez une couverture JPEG, PNG ou WebP.' }, { status: 400 });
    }
    const removeCover = String(data.get('removeCover') || '') === 'true';
    const meta: DocumentMeta = { ...existing, title, formation, niveau, size: pdfBytes?.length ?? existing.size, hasCover: coverBytes ? true : removeCover ? false : existing.hasCover };
    if (blobStorage) {
      if (pdfBytes) await put(`documents/${id}.pdf`, pdfBytes, { access: 'private', contentType: 'application/pdf', addRandomSuffix: false, allowOverwrite: true });
      if (coverBytes && coverType) await put(`documents/${id}.cover`, coverBytes, { access: 'private', contentType: coverType, addRandomSuffix: false, allowOverwrite: true });
      if (removeCover && !coverBytes) await del(`documents/${id}.cover`).catch(() => undefined);
      await put(`documents/${id}.json`, JSON.stringify(meta), { access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true });
    } else {
      await mkdir(dataDir, { recursive: true });
      if (pdfBytes) await writeFile(path.join(dataDir, `${id}.pdf`), pdfBytes);
      if (coverBytes) await writeFile(path.join(dataDir, `${id}.cover`), coverBytes);
      if (removeCover && !coverBytes) await unlink(path.join(dataDir, `${id}.cover`)).catch(() => undefined);
      await writeFile(path.join(dataDir, `${id}.json`), JSON.stringify(meta, null, 2));
    }
    await addActivity(actor.id, 'Modification d’un document', title);
    return NextResponse.json(meta);
  } catch (error) { console.error('[documents:update]', error instanceof Error ? error.message : error); return NextResponse.json({ error: 'Impossible de modifier le document.' }, { status: 500 }); }
}

export async function DELETE(_request:Request,{params}:{params:Promise<{id:string}>}) {
  const { id } = await params;
  const actor = await currentAdmin();
  if (!validId(id) || !actor) return NextResponse.json({ error: 'Connexion administrateur requise.' }, { status: 401 });
  try {
    if (!(await listDocuments()).some(document => document.id === id)) return NextResponse.json({ error: 'Document introuvable.' }, { status: 404 });
    if (blobStorage) await del([`documents/${id}.pdf`, `documents/${id}.cover`, `documents/${id}.json`]).catch(() => undefined);
    else await Promise.all(['pdf','cover','json'].map(extension => unlink(path.join(dataDir, `${id}.${extension}`)).catch(() => undefined)));
    await addActivity(actor.id, 'Suppression d’un document', id);
    return NextResponse.json({ ok: true });
  } catch (error) { console.error('[documents:delete]', error instanceof Error ? error.message : error); return NextResponse.json({ error: 'Impossible de supprimer le document.' }, { status: 500 }); }
}
