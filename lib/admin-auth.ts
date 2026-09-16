import { cookies } from 'next/headers';
import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { get, put } from '@vercel/blob';

export type AdminUser = { id: string; name: string; email: string; role: 'owner' | 'admin'; active: boolean; createdAt: string };
export type AdminKey = { id: string; name: string; hash: string; lastUsedAt?: string; revokedAt?: string; createdAt: string; createdBy: string };
export type AdminActivity = { id: string; actorId: string; action: string; target?: string; createdAt: string; ip?: string };
type AdminState = { users: AdminUser[]; keys: AdminKey[]; activity: AdminActivity[] };

const dir = path.join(process.cwd(), 'data', 'admin');
const statePath = path.join(dir, 'state.json');
const sessionCookie = 'ndl_admin_session';
const secret = () => process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_UPLOAD_TOKEN || '';
const blobStore = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
const hashPassword = (value: string, salt = randomBytes(16).toString('hex')) => `${salt}:${scryptSync(value, salt, 32).toString('hex')}`;
const validPassword = (value: string, encoded: string) => { const [salt, digest] = encoded.split(':'); if (!salt || !digest) return false; const actual = scryptSync(value, salt, 32); const expected = Buffer.from(digest, 'hex'); return expected.length === actual.length && timingSafeEqual(actual, expected); };
const sign = (value: string) => createHmac('sha256', secret()).update(value).digest('hex');
const makeSession = (id: string) => `${id}.${sign(id)}`;
const sessionId = (value?: string | null) => { if (!value || !secret()) return null; const [id, signature] = value.split('.'); const expected = id ? sign(id) : ''; return id && signature && signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) ? id : null; };

async function readStored(name: string) { if (blobStore()) { try { const item = await get(`admin/${name}`, { access: 'private' }); return item?.stream ? await new Response(item.stream).text() : null; } catch { return null; } } try { return await readFile(path.join(dir, name), 'utf8'); } catch { return null; } }
async function writeStored(name: string, value: string) { if (blobStore()) { await put(`admin/${name}`, value, { access: 'private', contentType: 'application/json', addRandomSuffix: false }); return; } await mkdir(dir, { recursive: true }); await writeFile(path.join(dir, name), value, 'utf8'); }
async function readState(): Promise<AdminState> { try { const raw = await readStored('state.json'); return raw ? JSON.parse(raw) as AdminState : { users: [], keys: [], activity: [] }; } catch { return { users: [], keys: [], activity: [] }; } }
async function saveState(state: AdminState) { await writeStored('state.json', JSON.stringify(state, null, 2)); }
export async function ensureOwner() { return readState(); }
// Password hashes are kept separately from the public user record for compatibility with the existing state file.
const credentialPath = path.join(dir, 'credentials.json');
async function credentials() { try { const raw = await readStored('credentials.json'); return raw ? JSON.parse(raw) as Record<string, string> : {}; } catch { return {}; } }
async function saveCredentials(value: Record<string, string>) { await writeStored('credentials.json', JSON.stringify(value)); }
export async function login(email: string, password: string) {
  const state = await ensureOwner(); const creds = await credentials();
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase(); const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!state.users.length && configuredEmail && configuredPassword) {
    const owner: AdminUser = { id: randomUUID(), name: process.env.ADMIN_NAME?.trim() || 'Administrateur principal', email: configuredEmail, role: 'owner', active: true, createdAt: new Date().toISOString() };
    state.users.push(owner); creds[owner.id] = hashPassword(configuredPassword); await saveState(state); await saveCredentials(creds);
  }
  // Recover a state created by an interrupted first login or an older deployment.
  const owner = state.users.find(item => item.role === 'owner');
  if (owner && !creds[owner.id] && configuredPassword) {
    if (configuredEmail && owner.email !== configuredEmail) owner.email = configuredEmail;
    creds[owner.id] = hashPassword(configuredPassword); await saveState(state); await saveCredentials(creds);
  }
  const user = state.users.find(u => u.active && u.email === email.trim().toLowerCase());
  if (!user || !creds[user.id] || !validPassword(password, creds[user.id])) return null;
  return user;
}
export async function currentAdmin() { const id = sessionId((await cookies()).get(sessionCookie)?.value); if (!id) return null; const state = await ensureOwner(); return state.users.find(u => u.id === id && u.active) || null; }
export async function setSession(id: string) { (await cookies()).set(sessionCookie, makeSession(id), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 8 }); }
export async function clearSession() { (await cookies()).delete(sessionCookie); }
export async function addActivity(actorId: string, action: string, target?: string) { const state = await readState(); state.activity.unshift({ id: randomUUID(), actorId, action, target, createdAt: new Date().toISOString() }); state.activity = state.activity.slice(0, 500); await saveState(state); }
export async function adminState() { return readState(); }
export { hashPassword, readState, saveState, credentials, saveCredentials };
