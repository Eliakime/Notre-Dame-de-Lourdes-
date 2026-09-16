import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const headers = { Authorization: 'Bearer test-only-0123456789abcdef0123456789abcdef' };
const pdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF');
const base = { title: 'Livre avec couverture', formation: 'MMV', niveau: 'Seconde', file: { name: 'livre.pdf', mimeType: 'application/pdf', buffer: pdf } };

test('homepage banner and pre-registration links open their pages', async ({ page }) => {
  await page.goto('/');
  await page.locator('.library-banner').getByRole('link', { name: 'Explorer la bibliothèque' }).click();
  await expect(page).toHaveURL(/\/bibliotheque$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Une page ouverte');
  await page.getByRole('link', { name: 'Retour à l’accueil' }).click();
  await page.locator('header').getByRole('link', { name: 'Se préinscrire' }).click();
  await expect(page).toHaveURL(/\/inscription$/);
  await expect(page.getByLabel('Nom et prénom')).toBeVisible();
});

test('cover API stores JPEG, PNG and WebP and keeps the PDF intact', async ({ request }) => {
  const covers = [
    { name: 'couverture.jpg', mimeType: 'image/jpeg', buffer: readFileSync('public/images/logo.jpeg') },
    { name: 'couverture.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') },
    { name: 'couverture.webp', mimeType: 'image/webp', buffer: readFileSync('public/images/formations/f4-card.webp') },
  ];
  for (const cover of covers) {
    const uploaded = await request.post('/api/documents', { headers, multipart: { ...base, cover } });
    expect(uploaded.status()).toBe(201);
    const doc = await uploaded.json();
    expect(doc.hasCover).toBe(true);
    const response = await request.get(`/api/documents/${doc.id}/cover`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe(cover.mimeType);
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
    expect(await response.body()).toEqual(cover.buffer);
    expect(await (await request.get(`/api/documents/${doc.id}`)).body()).toEqual(pdf);
    expect((await (await request.get('/api/documents')).json()).find((d: { id: string }) => d.id === doc.id).hasCover).toBe(true);
  }
});

test('cover API handles absent covers and rejects invalid or oversized images before publication', async ({ request }) => {
  const uploaded = await request.post('/api/documents', { headers, multipart: base });
  expect(uploaded.status()).toBe(201);
  const doc = await uploaded.json();
  expect(doc.hasCover).toBe(false);
  expect((await request.get(`/api/documents/${doc.id}/cover`)).status()).toBe(404);
  const before = await (await request.get('/api/documents')).json();
  for (const buffer of [Buffer.from('<svg onload="alert(1)"></svg>'), Buffer.alloc(1024 * 1024 + 1)]) {
    const response = await request.post('/api/documents', { headers, multipart: { ...base, cover: { name: 'fake.png', mimeType: 'image/png', buffer } } });
    expect(response.status()).toBe(400);
  }
  expect((await (await request.get('/api/documents')).json()).length).toBe(before.length);
  expect((await request.get('/api/documents/invalid/cover')).status()).toBe(404);
});

test('library filters by filiere and level, resets and displays fallback covers on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const common = { size: 1024, createdAt: '2026-09-16T12:00:00.000Z', niveau: 'Seconde' };
  await page.route('**/api/documents', route => route.fulfill({ json: [
    { ...common, id: 'mode', title: 'Patrons et textiles', formation: 'MMV' },
    { ...common, id: 'civil', title: 'Plans de construction', formation: 'F4', niveau: 'Terminale' },
    { ...common, id: 'commun', title: 'Méthodes de travail', formation: 'TOUS', niveau: 'Tous niveaux' },
    { ...common, id: 'broken', title: 'Couverture manquante', formation: 'MMV', hasCover: true },
  ] }));
  await page.route('**/api/documents/broken/cover', route => route.fulfill({ status: 404 }));
  await page.goto('/bibliotheque');
  await expect(page.locator('.book-card')).toHaveCount(4);
  await page.getByRole('combobox', { name: 'Filière', exact: true }).selectOption('MMV');
  await expect(page.locator('.book-card')).toHaveCount(3);
  await page.getByRole('combobox', { name: 'Niveau', exact: true }).selectOption('Terminale');
  await expect(page.locator('.book-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Réinitialiser' }).click();
  await expect(page.locator('.book-card')).toHaveCount(4);
  await page.getByLabel('Rechercher un document').fill('  textiles  ');
  await expect(page.locator('.book-card')).toHaveCount(1);
  await expect(page.locator('.book-cover img')).toHaveAttribute('src', /\/images\/library\/default-cover\.webp$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Réinitialiser' }).click();
  const broken = page.locator('.book-card').filter({ has: page.getByRole('heading', { name: 'Couverture manquante', exact: true }) });
  await broken.scrollIntoViewIfNeeded();
  await expect(broken.locator('img')).toHaveAttribute('src', /\/images\/library\/default-cover\.webp$/);
});

test('publication form previews and removes an optional cover', async ({ page }) => {
  await page.goto('/administration');
  await page.getByLabel('Titre du document').fill('Mon livre de couture');
  await page.getByLabel('Couverture (facultative)').setInputFiles('public/images/logo.jpeg');
  await expect(page.locator('.cover-preview img')).toHaveAttribute('src', /^blob:/);
  await page.getByRole('button', { name: 'Retirer la couverture' }).click();
  await expect(page.locator('.cover-preview img')).toHaveAttribute('src', /\/images\/library\/default-cover\.webp$/);
  await page.setViewportSize({ width: 360, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
