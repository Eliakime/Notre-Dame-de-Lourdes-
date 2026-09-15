import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { mkdir, writeFile, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { dataDir, listDocuments } from '../../../lib/documents';
import { formations } from '../../../lib/formations';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){try{return NextResponse.json(await listDocuments(),{headers:{'Cache-Control':'no-store'}})}catch{return NextResponse.json({error:'Bibliothèque indisponible.'},{status:503})}}
export async function POST(request:NextRequest){
 const expected=process.env.ADMIN_UPLOAD_TOKEN;
 if(!expected||expected.length<32)return NextResponse.json({error:'Le dépôt doit être configuré par le responsable du site.'},{status:503});
 const supplied=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';
 const hash=(s:string)=>createHash('sha256').update(s).digest();
 if(!timingSafeEqual(hash(expected),hash(supplied)))return NextResponse.json({error:'Clé d’administration incorrecte.'},{status:401});
 const origin=request.headers.get('origin');
 if(origin&&origin!==request.nextUrl.origin)return NextResponse.json({error:'Origine de la requête non autorisée.'},{status:403});
 const limit=15*1024*1024;
 if(Number(request.headers.get('content-length')||0)>limit+65536)return NextResponse.json({error:'Le fichier dépasse 15 Mo.'},{status:413});
 try{
 const reader=request.body?.getReader();if(!reader)return NextResponse.json({error:'Fichier manquant.'},{status:400});
 const chunks:Uint8Array[]=[];let total=0;
 while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>limit+65536){await reader.cancel();return NextResponse.json({error:'Le fichier dépasse 15 Mo.'},{status:413})}chunks.push(value)}
 const data=await new Response(Buffer.concat(chunks),{headers:{'Content-Type':request.headers.get('content-type')||''}}).formData();
 const file=data.get('file'),title=String(data.get('title')||'').trim(),formation=String(data.get('formation')||''),niveau=String(data.get('niveau')||'');
 if(!(file instanceof File)||!title||title.length>140||!['TOUS',...formations.map(f=>f.code)].includes(formation)||!['Tous niveaux','Seconde','Première','Terminale','Centre de formation'].includes(niveau))return NextResponse.json({error:'Vérifiez le fichier, le titre, la formation et le niveau.'},{status:400});
 if(file.size>limit||file.size<5)return NextResponse.json({error:'Le PDF doit contenir des données et ne pas dépasser 15 Mo.'},{status:400});
 const bytes=Buffer.from(await file.arrayBuffer());
 if(bytes.subarray(0,5).toString()!=='%PDF-'||!file.name.toLowerCase().endsWith('.pdf'))return NextResponse.json({error:'Seuls les fichiers PDF sont acceptés.'},{status:400});
 const id=randomUUID();const meta={id,title,formation,niveau,size:file.size,createdAt:new Date().toISOString()};await mkdir(dataDir,{recursive:true});
 await writeFile(path.join(dataDir,`${id}.pdf`),bytes,{flag:'wx'});
 try{await writeFile(path.join(dataDir,`${id}.tmp`),JSON.stringify(meta),{flag:'wx'});await rename(path.join(dataDir,`${id}.tmp`),path.join(dataDir,`${id}.json`))}catch(error){await unlink(path.join(dataDir,`${id}.pdf`)).catch(()=>{});await unlink(path.join(dataDir,`${id}.tmp`)).catch(()=>{});throw error}
 return NextResponse.json(meta,{status:201});
 }catch{return NextResponse.json({error:'Impossible de publier le document. Vérifiez le fichier et réessayez.'},{status:500})}
}
