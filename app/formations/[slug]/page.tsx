import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, ArrowRight, Check, MapPin, GraduationCap, BookOpen, Sparkles } from 'lucide-react';
import { Brand } from '../../../components/Brand';
import { Reveal } from '../../../components/Motion';
import { WhatsAppIcon } from '../../../components/WhatsAppIcon';
import { courseDetails, getCourseBySlug, courseHref, courseImage } from '../../../lib/course-details';
import { formations, lycee, whatsapp } from '../../../lib/formations';

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return Object.values(courseDetails).map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = getCourseBySlug((await params).slug);
  if (!course) return { title: 'Formation introuvable — Notre Dame de Lourdes' };
  return { title: `${course.name} (${course.code}) — Notre Dame de Lourdes`, description: course.introduction };
}

export default async function FormationPage({ params }: Props) {
  const course = getCourseBySlug((await params).slug);
  if (!course) notFound();
  const isLycee = lycee.some(item => item.code === course.code);
  const label = isLycee ? 'Lycée technique' : 'Centre de formation';
  const back = `/?parcours=${isLycee ? 'lycee' : 'centre'}#formations`;
  const contact = `${whatsapp}?text=${encodeURIComponent(`Bonjour, je souhaite en savoir plus sur la formation ${course.name} (${course.code}) à Notre Dame de Lourdes. Pouvez-vous me préciser le programme et les conditions d’admission ?`)}`;
  const related = formations.filter(item => item.code !== course.code && lycee.some(f => f.code === item.code) === isLycee).slice(0, 3);
  return <>
    <header><div className="sub-header wrap"><Brand/><Link href={back}><ArrowLeft size={15}/> Toutes les formations</Link></div></header>
    <main className="formation-detail">
      <div className="wrap course-breadcrumb"><Link href="/">Accueil</Link><span>/</span><Link href={back}>{label}</Link><span>/</span><span aria-current="page">{course.code}</span></div>
      <section className="detail-hero wrap">
        <div className="detail-intro"><div className="eyebrow"><span className="dot"/>{label.toUpperCase()} <span className="detail-code">{course.code}</span></div><h1>{course.name}</h1><p className="detail-tagline">{course.tagline}</p><p className="detail-summary">{course.detail}</p><div className="detail-actions"><Link className="button" href={`/inscription?formation=${course.code}`}>Choisir cette formation <ArrowUpRight size={18}/></Link><a className="text-link" href={contact} target="_blank" rel="noreferrer"><WhatsAppIcon size={19}/> Poser une question</a></div><div className="detail-location"><MapPin size={14}/> Notre Dame de Lourdes · Dassa-Zoumè</div></div>
        <figure className="detail-visual"><div className="detail-image"><Image src={courseImage(course.code)} alt={course.imageAlt} fill unoptimized preload sizes="(max-width: 760px) 100vw, 55vw"/></div><figcaption><span>LE MÉTIER EN IMAGES</span>Illustration créée par IA</figcaption></figure>
      </section>
      <div className="wrap"><div className="detail-facts"><div><GraduationCap size={22}/><span>PARCOURS<strong>{label}</strong></span></div><div><BookOpen size={22}/><span>{isLycee ? 'CLASSES' : 'APPROCHE'}<strong>{isLycee ? '2nde · 1ère · Terminale' : 'Formation à un métier'}</strong></span></div><a href="#admission"><span>VOTRE PROCHAINE ÉTAPE<strong>Parlons de votre projet</strong></span><ArrowUpRight size={22}/></a></div></div>
      <div className="detail-content wrap">
        <div className="detail-main">
          <Reveal><section className="detail-section" id="decouvrir"><div className="eyebrow">01 — COMPRENDRE LA FILIÈRE</div><h2>Un univers à <em>explorer.</em></h2><p className="detail-paragraph">{course.introduction}</p><div className="profile-note"><Sparkles size={23}/><div><h3>Cette voie vous ressemble si…</h3><p>{course.profile}</p></div></div></section></Reveal>
          <Reveal><section className="detail-section" id="competences"><div className="eyebrow">02 — LES GESTES ET LES SAVOIRS</div><h2>Au cœur <em>du métier.</em></h2><div className="skills-grid">{course.skills.map((skill, i) => <article className="skill-card" key={skill.title}><span>0{i + 1}</span><h3>{skill.title}</h3><p>{skill.text}</p></article>)}</div><p className="curriculum-note">Ces repères présentent le domaine. Le contenu détaillé de la formation est à confirmer avec l’établissement.</p></section></Reveal>
          <Reveal><section className="project-section"><div className="project-image"><Image src={courseImage(course.code, true)} alt="" fill unoptimized sizes="(max-width: 600px) 100vw, 30vw"/></div><div><div className="eyebrow">POUR SE PROJETER</div><h3>{course.project.title}</h3><p>{course.project.text}</p><span>Un exemple pour découvrir ce domaine.</span></div></section></Reveal>
          <Reveal><section className="detail-section" id="perspectives"><div className="eyebrow">03 — OUVRIR LES POSSIBLES</div><h2>Et demain, <em>quelle voie ?</em></h2><p className="detail-paragraph">Selon votre parcours, les qualifications obtenues et votre expérience, voici des secteurs à explorer.</p><div className="career-list">{course.careers.map(career => <div key={career}><Check size={17}/><span>{career}</span><ArrowUpRight size={17}/></div>)}</div></section></Reveal>
        </div>
        <aside className="admission-aside" id="admission"><div className="eyebrow">ON VOUS ACCOMPAGNE</div><h2>Votre projet<br/>commence <em>ici.</em></h2><p>Un échange avec le secrétariat pour préparer votre entrée en formation.</p><dl><div><dt>Formation</dt><dd>{course.name}</dd></div><div><dt>Lieu</dt><dd>Dassa-Zoumè, Bénin</dd></div><div><dt>Admission, durée et frais</dt><dd>À préciser avec le secrétariat</dd></div></dl><Link className="button" href={`/inscription?formation=${course.code}`}>Me préinscrire <ArrowUpRight size={17}/></Link><a className="button whatsapp-button" href={contact} target="_blank" rel="noreferrer"><WhatsAppIcon size={19}/> Échanger sur WhatsApp</a><p className="admission-note">Une préinscription ouvre la discussion. L’admission est confirmée par l’établissement.</p></aside>
      </div>
      <section className="related-section"><div className="wrap"><Reveal><div className="section-heading"><div><div className="eyebrow">POURSUIVEZ VOTRE EXPLORATION</div><h2>D’autres chemins <em>à découvrir.</em></h2></div><Link className="text-link" href={back}>Toutes les formations <ArrowRight size={17}/></Link></div></Reveal><div className="related-grid">{related.map(item => <Link href={courseHref(item.code)} className="related-card" key={item.code}><div><Image src={courseImage(item.code, true)} alt={courseDetails[item.code].imageAlt} fill unoptimized sizes="(max-width: 600px) 100vw, 33vw"/></div><span>{item.code}<ArrowUpRight size={19}/></span><h3>{item.name}</h3></Link>)}</div></div></section>
    </main>
    <footer className="detail-footer wrap"><Brand/><Link href="/bibliotheque">La bibliothèque</Link><Link href="/confidentialite">Confidentialité</Link></footer>
  </>;
}
