import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const browser = await chromium.launch();
try {
  await fs.mkdir('test-results/visual', { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  // Reveal sections as a visitor scrolls, then capture the whole document.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 650) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise(resolve => setTimeout(resolve, 90));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(900);
  const unrevealed = await page.locator('.reveal-ready:not(.revealed)').count();
  if (unrevealed) errors.push(`${unrevealed} sections not revealed after scrolling`);
  await page.screenshot({ path: 'test-results/visual/accueil-desktop.png', fullPage: true });
  await page.goto('http://localhost:3000/formations/developpement-web', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-results/visual/formation-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/visual/formation-mobile.png' });
  await page.goto('http://localhost:3000/?parcours=centre#formations', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('#tab-centre')?.getAttribute('aria-selected') === 'true');
  await page.locator('.visual-courses').scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'test-results/visual/formations-mobile.png' });
  console.log(JSON.stringify({ browserErrors: errors, screenshots: 'test-results/visual/' }));
  if (errors.length) process.exitCode = 1;
} finally {
  await browser.close();
}
