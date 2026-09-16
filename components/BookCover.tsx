'use client';
import { useState } from 'react';
import Image from 'next/image';
import { DEFAULT_COVER } from '../lib/document-covers';

export function BookCover({ src, title, label = 'RESSOURCE PÉDAGOGIQUE' }: { src?: string; title: string; label?: string }) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const custom = Boolean(src && src !== failedSrc);
  return <div className={`book-cover${custom ? ' book-cover-custom' : ''}`}>
    <Image src={custom ? src! : DEFAULT_COVER} alt={custom ? `Couverture : ${title}` : ''} fill unoptimized sizes="(max-width: 600px) 80vw, (max-width: 1000px) 40vw, 25vw" onError={() => { if (custom) setFailedSrc(src); }}/>
    {!custom && <div className="book-cover-type"><span>{label}</span><strong>{title || 'Votre prochain savoir.'}</strong><small>NOTRE DAME DE LOURDES</small></div>}
  </div>;
}
