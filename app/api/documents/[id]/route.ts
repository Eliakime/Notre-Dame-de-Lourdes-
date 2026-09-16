import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { dataDir } from '../../../../lib/documents';
import { blobStorage } from '../../../../lib/documents';
import { get } from '@vercel/blob';
export const runtime='nodejs';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id))return new NextResponse('Document introuvable.',{status:404});try{if(blobStorage){const result=await get(`documents/${id}.pdf`,{access:'private'});if(!result?.stream)return new NextResponse('Document introuvable.',{status:404});return new NextResponse(result.stream,{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="notre-dame-${id}.pdf"`,'X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store','Content-Security-Policy':"sandbox"}})}await readFile(path.join(dataDir,`${id}.json`),'utf8');const file=await readFile(path.join(dataDir,`${id}.pdf`));return new NextResponse(file,{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="notre-dame-${id}.pdf"`,'X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store','Content-Security-Policy':"sandbox"}})}catch{return new NextResponse('Document introuvable.',{status:404})}}
