'use client';

import { useEffect, useState, type KeyboardEvent, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, GraduationCap, Wrench } from 'lucide-react';
import { lycee, centre, whatsapp } from '../lib/formations';
import { courseDetails, courseHref, courseImage } from '../lib/course-details';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Reveal } from './Motion';

export function FormationExplorer() {
  const [tab, setTab] = useState<'lycee' | 'centre'>('lycee');
  useEffect(() => { if (new URLSearchParams(window.location.search).get('parcours') === 'centre') setTab('centre'); }, []);
  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 'lycee' : event.key === 'End' ? 'centre' : tab === 'lycee' ? 'centre' : 'lycee';
    setTab(next);
    document.getElementById(`tab-${next}`)?.focus();
  }
  return <section id="formations" className="formations section"><div className="wrap">
    <Reveal><div className="section-heading"><div><div className="eyebrow">01 — TROUVEZ VOTRE VOIE</div><h2>Plusieurs chemins.<br/>Le même <em>élan.</em></h2></div><p>Vous aimez construire, créer, réparer ou accueillir ?<br/>Entrez dans l’univers du métier qui vous ressemble.</p></div></Reveal>
    <div className="tabs" role="tablist" aria-label="Type de formation">
      <button id="tab-lycee" role="tab" aria-selected={tab === 'lycee'} aria-controls="formation-panel" tabIndex={tab === 'lycee' ? 0 : -1} onKeyDown={navigateTabs} onClick={() => setTab('lycee')}><GraduationCap size={20}/> Le lycée technique <span>05</span></button>
      <button id="tab-centre" role="tab" aria-selected={tab === 'centre'} aria-controls="formation-panel" tabIndex={tab === 'centre' ? 0 : -1} onKeyDown={navigateTabs} onClick={() => setTab('centre')}><Wrench size={19}/> Le centre de formation <span>07</span></button>
    </div>
    <div id="formation-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={0}>
      <div className="course-meta"><span>{tab === 'lycee' ? 'UN PARCOURS SCOLAIRE POUR APPRENDRE UN MÉTIER' : 'DES SAVOIR-FAIRE CONCRETS, DES MÉTIERS À EXERCER'}</span><span>{tab === 'lycee' ? '2nde / 1ère / Terminale' : 'Formation professionnelle'}</span></div>
      <div className="course-grid visual-courses" key={tab}>
        {(tab === 'lycee' ? lycee : centre).map((course, i) => <Link href={courseHref(course.code)} className="course-card visual-course" key={course.code} style={{ '--card-delay': `${i * 65}ms` } as CSSProperties}>
          <div className="course-image"><Image src={courseImage(course.code, true)} alt={courseDetails[course.code].imageAlt} fill unoptimized sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"/><span className="course-code">{course.code}</span><span className="course-image-arrow"><ArrowUpRight size={22}/></span></div>
          <div className="course-card-body"><span className="course-number">0{i + 1} / {tab === 'lycee' ? 'LYCÉE TECHNIQUE' : 'CENTRE DE FORMATION'}</span><h3>{course.name}</h3><p>{course.detail}</p><div className="course-link">Explorer la formation <ArrowUpRight size={18}/></div></div>
        </Link>)}
        <a className="orientation-card" href={`${whatsapp}?text=${encodeURIComponent('Bonjour, je souhaite être accompagné(e) pour choisir une formation à Notre Dame de Lourdes.')}`} target="_blank" rel="noreferrer"><WhatsAppIcon size={33}/><h3>Votre talent cherche<br/>encore sa voie ?</h3><p>Parlons de votre projet.<br/>Nous sommes là pour vous orienter.</p><span>Échangeons sur WhatsApp <ArrowUpRight size={19}/></span></a>
      </div>
      <p className="visual-credit">Illustrations des métiers créées par IA.</p>
    </div>
  </div></section>;
}
