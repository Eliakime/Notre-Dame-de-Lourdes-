'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ImagePlus, Upload } from 'lucide-react';
import { Brand } from '../../components/Brand';
import { BookCover } from '../../components/BookCover';
import { formations } from '../../lib/formations';
import { MAX_COVER_SIZE } from '../../lib/document-covers';

export default function Administration() {
  const [status, setStatus] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(false);
  const [title, setTitle] = useState(''), [cover, setCover] = useState<File>(), [preview, setPreview] = useState<string>();
  useEffect(() => {
    if (!cover) { setPreview(undefined); return; }
    const url = URL.createObjectURL(cover); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [cover]);
  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget, data = new FormData(form);
    const token = String(data.get('token')).trim(); data.delete('token');
    setBusy(true); setStatus(''); setError(false);
    try {
      const result = await fetch('/api/documents', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: data });
      const body = await result.json().catch(() => null);
      if (!result.ok) throw new Error(body?.error || (result.status === 413 ? 'Le PDF et sa couverture doivent faire moins de 4 Mo au total sur Vercel.' : 'Le dépôt a échoué. Réessayez dans un instant.'));
      setStatus('Document publié. Il est maintenant disponible dans la bibliothèque.');
      form.reset(); setTitle(''); setCover(undefined);
    } catch (e) { setError(true); setStatus(e instanceof Error ? e.message : 'Le dépôt a échoué.'); }
    finally { setBusy(false); }
  }
  return <><div className="sub-header wrap"><Brand/><Link href="/bibliotheque"><ArrowLeft size={15}/> Bibliothèque</Link></div><main className="wrap upload-wrap"><div className="page-intro"><div className="eyebrow">ESPACE DE PARTAGE</div><h1>Partager un document.</h1><p>Proposez un support de cours, un exercice ou un document utile aux apprenants. Les fichiers publiés sont accessibles aux visiteurs de la bibliothèque.</p></div>
    <form className="form-card" onSubmit={upload}>
      <label className="field">Clé de publication *<input type="password" name="token" autoComplete="off" required maxLength={200}/></label>
      <label className="field">Titre du document *<input name="title" required maxLength={140} placeholder="Ex. : Exercices d’électricité — chapitre 1" value={title} onChange={e => setTitle(e.target.value)}/></label>
      <div className="field-grid"><label className="field">Filière *<select name="formation" required><option value="TOUS">Toutes les filières</option>{formations.map(f => <option key={f.code} value={f.code}>{f.code} — {f.name}</option>)}</select></label><label className="field">Niveau *<select name="niveau" required><option>Tous niveaux</option><option>Seconde</option><option>Première</option><option>Terminale</option><option>Centre de formation</option></select></label></div>
      <label className="field" style={{ marginTop: 20 }}>Fichier PDF *<input type="file" name="file" accept="application/pdf,.pdf" required/></label>
      <div className="cover-upload"><div className="cover-preview"><BookCover src={preview} title={title}/><span>Aperçu de la couverture</span></div><div className="cover-upload-fields"><ImagePlus size={24}/><h2>Donnez un visage à votre livre.</h2><p>Ajoutez une image de couverture, ou conservez celle de la bibliothèque.</p><label className="field">Couverture (facultative)<input type="file" name="cover" accept="image/jpeg,image/png,image/webp" aria-describedby="cover-help" onChange={e => {
        const selected = e.target.files?.[0];
        if (selected && (selected.size > MAX_COVER_SIZE || !['image/jpeg', 'image/png', 'image/webp'].includes(selected.type))) { e.target.value = ''; setCover(undefined); setError(true); setStatus('Choisissez une image JPEG, PNG ou WebP de 1 Mo maximum.'); return; }
        setCover(selected); setStatus(''); setError(false);
      }}/></label><p id="cover-help" className="form-note">JPEG, PNG ou WebP · 1 Mo maximum. Format portrait conseillé. Une image par défaut sera affichée si aucune couverture n’est ajoutée.</p>{cover && <button className="cover-remove" type="button" onClick={e => { const input = e.currentTarget.form?.elements.namedItem('cover') as HTMLInputElement; if (input) input.value = ''; setCover(undefined); }}>Retirer la couverture</button>}</div></div>
      <p className="form-note">Sur Vercel : 4 Mo maximum pour le PDF et sa couverture réunis. N’incluez pas de coordonnées d’élèves ni de données confidentielles.</p>
      <button className="button" type="submit" disabled={busy}><Upload size={17}/>{busy ? 'Publication en cours…' : 'Publier le document'}</button>
      {status && <p role={error ? 'alert' : 'status'} className={error ? 'error' : 'success'}>{status}</p>}
    </form></main></>;
}
