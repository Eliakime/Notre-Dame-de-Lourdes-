import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'msedge' });
try {
  await fs.mkdir('test-results/visual', { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // Preview fixtures are intercepted in this browser only; nothing is published.
  await page.route('**/api/documents', route => route.fulfill({ json: [
    { id: 'preview-1', title: 'Dessiner les espaces de demain', formation: 'F4', niveau: 'Seconde', size: 1548576, createdAt: '2026-09-16T12:00:00.000Z' },
    { id: 'preview-2', title: 'Les bases de la couture', formation: 'MMV', niveau: 'Première', size: 2097152, createdAt: '2026-09-15T12:00:00.000Z' },
    { id: 'preview-3', title: 'Apprendre avec méthode', formation: 'TOUS', niveau: 'Tous niveaux', size: 948576, createdAt: '2026-09-14T12:00:00.000Z' },
  ] }));
  await page.goto('http://localhost:3000/bibliotheque', { waitUntil: 'networkidle' });
  await page.locator('.book-card').first().waitFor();
  await page.screenshot({ path: 'test-results/visual/library-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/visual/library-mobile.png', fullPage: true });
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) errors.push('Mobile library overflows');
  await page.goto('http://localhost:3000/administration', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-results/visual/upload-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.locator('.library-banner').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.locator('.library-banner').screenshot({ path: 'test-results/visual/library-banner.png' });
  console.log(JSON.stringify({ browserErrors: errors, screenshots: 'test-results/visual/' }));
  if (errors.length) process.exitCode = 1;
} finally { await browser.close(); }
