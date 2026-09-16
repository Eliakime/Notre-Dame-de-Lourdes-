import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { addActivity, adminState, clearSession, currentAdmin, login, saveState, setSession, credentials, saveCredentials, hashPassword, type AdminKey, type AdminUser } from '../../../../lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const [section] = (await params).path; const body = await request.json().catch(() => ({}));
  if (section === 'login') { if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) return json({ error: 'Le compte administrateur initial n’est pas configuré sur Vercel.' }, 503); const user = await login(String(body.email || ''), String(body.password || '')); if (!user) return json({ error: 'Identifiants incorrects. Vérifiez l’adresse email et le mot de passe définis dans les variables Production.' }, 401); await setSession(user.id); await addActivity(user.id, 'Connexion à l’espace administrateur'); return json({ user }); }
  if (section === 'logout') { const user = await currentAdmin(); if (user) await addActivity(user.id, 'Déconnexion'); await clearSession(); return json({ ok: true }); }
  const actor = await currentAdmin(); if (!actor) return json({ error: 'Connexion requise.' }, 401);
  const state = await adminState();
  if (section === 'users') {
    const email = String(body.email || '').trim().toLowerCase(), name = String(body.name || '').trim(), password = String(body.password || '');
    if (!email || !name || !email.includes('@') || password.length < 12) return json({ error: 'Nom, email et mot de passe de 12 caractères minimum requis.' }, 400);
    if (state.users.some(u => u.email === email)) return json({ error: 'Cette adresse est déjà utilisée.' }, 409);
    const user: AdminUser = { id: randomUUID(), name, email, role: 'admin', active: true, createdAt: new Date().toISOString() };
    state.users.push(user); await saveState(state); const creds = await credentials(); creds[user.id] = hashPassword(password); await saveCredentials(creds); await addActivity(actor.id, 'Ajout d’un administrateur', user.email); return json({ user }, 201);
  }
  if (section === 'keys') {
    const name = String(body.name || '').trim(); if (!name) return json({ error: 'Nom de clé requis.' }, 400);
    const value = `ndl_${randomBytes(24).toString('hex')}`; const key: AdminKey = { id: randomUUID(), name, hash: createHash('sha256').update(value).digest('hex'), createdAt: new Date().toISOString(), createdBy: actor.id };
    state.keys.push(key); await saveState(state); await addActivity(actor.id, 'Création d’une clé de publication', name); return json({ key: { ...key, hash: undefined }, value }, 201);
  }
  return json({ error: 'Action inconnue.' }, 404);
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const [section] = (await params).path; const actor = await currentAdmin(); if (!actor) return json({ error: 'Connexion requise.' }, 401); const state = await adminState();
  if (section === 'me') return json({ user: actor });
  if (section === 'users') return json({ users: state.users.map(({ id, name, email, role, active, createdAt }) => ({ id, name, email, role, active, createdAt })) });
  if (section === 'keys') return json({ keys: state.keys.map(({ hash, ...key }) => key) });
  if (section === 'activity') { const users = new Map(state.users.map(u => [u.id, u])); return json({ activity: state.activity.map(a => ({ ...a, actor: users.get(a.actorId)?.name || 'Administrateur supprimé' })) }); }
  return json({ error: 'Ressource inconnue.' }, 404);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const [section, id] = (await params).path; const actor = await currentAdmin(); if (!actor) return json({ error: 'Connexion requise.' }, 401); const body = await request.json().catch(() => ({})); const state = await adminState();
  if (section === 'users') { const user = state.users.find(u => u.id === id); if (!user) return json({ error: 'Administrateur introuvable.' }, 404); if (body.name) user.name = String(body.name).trim(); if (typeof body.active === 'boolean' && user.id !== actor.id) user.active = body.active; await saveState(state); await addActivity(actor.id, user.active ? 'Modification d’un administrateur' : 'Révocation d’un administrateur', user.email); return json({ user }); }
  if (section === 'keys') { const key = state.keys.find(k => k.id === id); if (!key) return json({ error: 'Clé introuvable.' }, 404); if (body.name) key.name = String(body.name).trim(); if (body.revoke) key.revokedAt = new Date().toISOString(); await saveState(state); await addActivity(actor.id, body.revoke ? 'Révocation d’une clé' : 'Modification d’une clé', key.name); return json({ key: { ...key, hash: undefined } }); }
  return json({ error: 'Ressource inconnue.' }, 404);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const [section, id] = (await params).path; const actor = await currentAdmin(); if (!actor) return json({ error: 'Connexion requise.' }, 401); const state = await adminState();
  if (section === 'users' && id !== actor.id) { const index = state.users.findIndex(u => u.id === id); if (index < 0) return json({ error: 'Administrateur introuvable.' }, 404); const [user] = state.users.splice(index, 1); await saveState(state); await addActivity(actor.id, 'Suppression d’un administrateur', user.email); return json({ ok: true }); }
  if (section === 'keys') { const index = state.keys.findIndex(k => k.id === id); if (index < 0) return json({ error: 'Clé introuvable.' }, 404); const [key] = state.keys.splice(index, 1); await saveState(state); await addActivity(actor.id, 'Suppression d’une clé', key.name); return json({ ok: true }); }
  return json({ error: 'Suppression non autorisée.' }, 400);
}
