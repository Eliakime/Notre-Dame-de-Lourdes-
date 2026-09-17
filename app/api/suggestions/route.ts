import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { currentAdmin } from '../../../lib/admin-auth';
import { deleteSuggestion, listSuggestions, saveSuggestion, type Suggestion } from '../../../lib/suggestions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const validId = (id: string) => /^[a-f0-9-]{36}$/.test(id);

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = String(body.message || '').trim();
    const name = String(body.name || '').trim();
    const contact = String(body.contact || '').trim();
    const category = String(body.category || '').trim();
    if (message.length < 3) return json({ error: 'Écrivez au moins quelques mots.' }, 400);
    if (message.length > 4000 || name.length > 120 || contact.length > 160 || category.length > 80) return json({ error: 'Votre message est trop long.' }, 400);
    const suggestion: Suggestion = { id: randomUUID(), message, ...(name && { name }), ...(contact && { contact }), ...(category && { category }), createdAt: new Date().toISOString(), status: 'new' };
    await saveSuggestion(suggestion);
    return json({ ok: true }, 201);
  } catch (error) { console.error('[suggestions:create]', error instanceof Error ? error.message : error); return json({ error: 'La suggestion n’a pas pu être envoyée.' }, 500); }
}

export async function GET() {
  if (!(await currentAdmin())) return json({ error: 'Connexion administrateur requise.' }, 401);
  try { return json({ suggestions: await listSuggestions() }); } catch (error) { console.error('[suggestions:list]', error instanceof Error ? error.message : error); return json({ error: 'Suggestions indisponibles.' }, 503); }
}

export async function PATCH(request: Request) {
  if (!(await currentAdmin())) return json({ error: 'Connexion administrateur requise.' }, 401);
  const body = await request.json().catch(() => ({})); const id = String(body.id || '');
  if (!validId(id)) return json({ error: 'Suggestion introuvable.' }, 404);
  const suggestion = (await listSuggestions()).find(item => item.id === id);
  if (!suggestion) return json({ error: 'Suggestion introuvable.' }, 404);
  suggestion.status = body.status === 'new' ? 'new' : 'read'; await saveSuggestion(suggestion); return json({ suggestion });
}

export async function DELETE(request: Request) {
  if (!(await currentAdmin())) return json({ error: 'Connexion administrateur requise.' }, 401);
  const body = await request.json().catch(() => ({})); const id = String(body.id || '');
  if (!validId(id)) return json({ error: 'Suggestion introuvable.' }, 404);
  await deleteSuggestion(id); return json({ ok: true });
}
