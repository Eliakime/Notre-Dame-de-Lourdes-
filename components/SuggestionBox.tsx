'use client';

import { useState } from 'react';
import { ArrowUpRight, Lightbulb } from 'lucide-react';

export function SuggestionBox() {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setStatus('');
    try {
      const response = await fetch('/api/suggestions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, name, contact, category }) });
      const body = await response.json().catch(() => ({})); if (!response.ok) throw new Error(body.error || 'Envoi impossible.');
      setMessage(''); setName(''); setContact(''); setCategory(''); setStatus('Merci. Votre suggestion a bien été transmise.');
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Envoi impossible.'); } finally { setBusy(false); }
  }
  return <section className="suggestion-box section wrap" id="suggestions"><div className="suggestion-copy"><div className="eyebrow"><Lightbulb size={15}/> VOTRE VOIX COMPTE</div><h2>Une idée, une remarque,<br/><em>un encouragement ?</em></h2><p>Partagez ce que vous voulez. Vos suggestions aident l’établissement à avancer et restent réservées à l’équipe.</p></div><form className="suggestion-form" onSubmit={submit}><label className="field">Votre message *<textarea required minLength={3} maxLength={4000} rows={4} value={message} onChange={event => setMessage(event.target.value)} placeholder="Une idée pour le site, une question, une remarque…"/></label><div className="field-grid"><label className="field">Votre nom (facultatif)<input maxLength={120} value={name} onChange={event => setName(event.target.value)} placeholder="Anonyme si vous préférez"/></label><label className="field">Contact (facultatif)<input maxLength={160} value={contact} onChange={event => setContact(event.target.value)} placeholder="Email ou téléphone"/></label></div><label className="field">Sujet <select value={category} onChange={event => setCategory(event.target.value)}><option value="">Choisir (facultatif)</option><option>Le site</option><option>Les formations</option><option>La bibliothèque</option><option>La vie de l’établissement</option><option>Autre</option></select></label><button className="button" type="submit" disabled={busy}>{busy ? 'Envoi…' : 'Envoyer ma suggestion'} <ArrowUpRight size={17}/></button>{status && <p className="suggestion-status" role="status">{status}</p>}</form></section>;
}
