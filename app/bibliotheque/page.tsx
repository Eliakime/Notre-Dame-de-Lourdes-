'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Download, Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Brand } from '../../components/Brand';
import { BookCover } from '../../components/BookCover';
import { formations, lycee, centre, whatsapp } from '../../lib/formations';
import type { DocumentMeta } from '../../lib/documents';

export default function Bibliotheque() {
  const [docs, setDocs] = useState<DocumentMeta[]>([]);
  const [loading, setLoading] = useState(true), [error, setError] = useState(false);
  const [search, setSearch] = useState(''), [formation, setFormation] = useState(''), [niveau, setNiveau] = useState('');
  async function refresh() {
    setLoading(true); setError(false);
    try {
      const response = await fetch('/api/documents', { cache: 'no-store' });
      if (!response.ok) throw new Error();
      setDocs(await response.json());
    } catch { setError(true); } finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); }, []);
  const filtered = docs.filter(d => (!formation || d.formation === formation || d.formation === 'TOUS') && (!niveau || d.niveau === niveau || d.niveau === 'Tous niveaux') && d.title.toLocaleLowerCase('fr').includes(search.trim().toLocaleLowerCase('fr')));
  const activeFilters = Boolean(search || formation || niveau);
  function reset() { setSearch(''); setFormation(''); setNiveau(''); }
  return <>
    <div className="sub-header wrap"><Brand/><Link href="/"><ArrowLeft size={15}/> Retour à l’accueil</Link></div>
    <main className="wrap library-content">
      <section className="library-hero">
        <Image className="library-hero-image" src="/images/library/library.webp" alt="" fill preload sizes="100vw"/>
        <div className="library-hero-copy"><div className="eyebrow">L’ESPACE DES APPRENANTS</div><h1>Une page ouverte<br/>sur votre <em>avenir.</em></h1><p>Votre bibliothèque de cours, de livres et d’exercices.<br/>Les ressources pour apprendre, comprendre et aller plus loin.</p><a href="#rayonnage" className="button white"><BookOpen size={18}/> Explorer les ressources</a></div>
        <span className="library-art-note">Illustration de bibliothèque</span>
      </section>
      <section id="rayonnage" className="library-shelf" aria-labelledby="library-title">
        <div className="library-heading"><div><div className="eyebrow">À CHAQUE FILIÈRE, SES RESSOURCES</div><h2 id="library-title">Le savoir à portée de main.</h2></div><span className="library-format"><BookOpen size={17}/> À lire à votre rythme</span></div>
        <div className="library-filter-panel">
          <div className="library-filter-title"><SlidersHorizontal size={17}/><span>Trouvez votre prochaine lecture</span>{activeFilters && <button type="button" onClick={reset}><RotateCcw size={13}/> Réinitialiser</button>}</div>
          <div className="filters library-filters">
            <label className="field">Rechercher un document<span className="library-search"><Search size={18}/><input type="search" placeholder="Un titre, un sujet…" value={search} onChange={e => setSearch(e.target.value)}/></span></label>
            <label className="field">Filière<select value={formation} onChange={e => setFormation(e.target.value)}><option value="">Toutes les filières</option><optgroup label="Lycée technique">{lycee.map(f => <option key={f.code} value={f.code}>{f.code} — {f.name}</option>)}</optgroup><optgroup label="Centre de formation">{centre.map(f => <option key={f.code} value={f.code}>{f.code} — {f.name}</option>)}</optgroup></select></label>
            <label className="field">Niveau<select value={niveau} onChange={e => setNiveau(e.target.value)}><option value="">Tous les niveaux</option><option>Seconde</option><option>Première</option><option>Terminale</option><option>Centre de formation</option></select></label>
          </div>
          {formation && <p className="library-filter-hint">Les ressources communes à toutes les filières restent incluses.</p>}
        </div>
        {loading ? <p className="status" role="status">Chargement des documents…</p> : error ? <div className="error" role="alert">La bibliothèque est momentanément indisponible. <button className="button small" onClick={refresh}>Réessayer</button></div> : filtered.length ? <>
          <p className="library-count" role="status"><strong>{filtered.length}</strong> document{filtered.length > 1 ? 's' : ''} à découvrir <span>Les plus récents en premier</span></p>
          <div className="book-grid">{filtered.map(d => <article className="book-card" key={d.id}>
            <div className="book-display"><BookCover src={d.hasCover ? `/api/documents/${d.id}/cover` : undefined} title={d.title} label={d.formation === 'TOUS' ? 'TOUTES LES FILIÈRES' : d.formation}/><span className="book-file-badge">PDF</span></div>
            <div className="book-details"><span className="book-category">{d.formation === 'TOUS' ? 'Toutes les filières' : formations.find(f => f.code === d.formation)?.name || d.formation}</span><h3>{d.title}</h3><p className="book-level">{d.niveau}</p><p className="book-meta"><span>{(d.size / 1024 / 1024).toLocaleString('fr-FR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} Mo</span><time dateTime={d.createdAt}>{new Date(d.createdAt).toLocaleDateString('fr-FR')}</time></p><a className="book-download" href={`/api/documents/${d.id}`} download aria-label={`Télécharger le document : ${d.title}`}><Download size={17}/> Télécharger le document</a></div>
          </article>)}</div>
        </> : <div className="empty library-empty"><BookOpen size={38}/><h2>{docs.length ? 'Aucun document ne correspond.' : 'La bibliothèque se prépare.'}</h2><p>{docs.length ? 'Essayez un autre titre ou élargissez vos filtres.' : 'Les livres et supports de cours apparaîtront ici dès leur publication.'}</p>{activeFilters ? <button className="button small" onClick={reset}>Voir toutes les ressources</button> : <a className="button small" href={`${whatsapp}?text=${encodeURIComponent('Bonjour, je recherche un document pour ma formation. Pouvez-vous m’aider ?')}`} target="_blank" rel="noreferrer">Contacter le secrétariat</a>}</div>}
      </section>
      <Link className="admin-link" href="/partager">Proposer un document →</Link>
    </main>
  </>;
}
