import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { test } from 'node:test';
import { SourceTextModule, SyntheticModule } from 'node:vm';

async function fixture() {
  const blobs = new Map();
  const cached = new Map();
  let failReads = false;
  const blob = {
    async get(name, options) {
      if (failReads) throw new Error('Storage unavailable');
      const value = (options.useCache === false ? blobs : cached).get(name);
      return value === undefined ? null : { stream: new Response(value).body };
    },
    async put(name, value, options) {
      if (blobs.has(name) && !options.allowOverwrite) throw new Error('Blob already exists');
      blobs.set(name, value);
      if (!cached.has(name)) cached.set(name, value);
    },
  };
  const source = stripTypeScriptTypes(await readFile(new URL('../lib/admin-auth.ts', import.meta.url), 'utf8'));
  const module = new SourceTextModule(source);
  await module.link(async (specifier) => {
    const values = specifier === '@vercel/blob' ? blob
      : specifier === 'next/headers' ? { cookies: async () => ({}) }
      : await import(specifier);
    return new SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    });
  });
  await module.evaluate();
  return { auth: module.namespace, blobs, fail: () => { failReads = true; } };
}

test('Blob admin storage preserves sessions and activity across repeated logins', async () => {
  const previous = { ...process.env };
  Object.assign(process.env, {
    BLOB_STORE_ID: 'test-store', ADMIN_EMAIL: 'admin@example.test',
    ADMIN_PASSWORD: 'test-password-at-least-12', ADMIN_NAME: 'Test Admin',
  });
  try {
    const { auth, blobs, fail } = await fixture();
    const first = await auth.login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
    assert.ok(first);
    await auth.addActivity(first.id, 'First login');
    const second = await auth.login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
    assert.equal(second.id, first.id);
    await auth.addActivity(second.id, 'Second login');
    assert.equal((await auth.adminState()).activity.length, 2);
    assert.equal(await auth.login(process.env.ADMIN_EMAIL, 'wrong-password'), null);
    const beforeFailure = blobs.get('admin/state.json');
    fail();
    await assert.rejects(auth.login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD), /Storage unavailable/);
    assert.equal(blobs.get('admin/state.json'), beforeFailure);
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
  }
});
