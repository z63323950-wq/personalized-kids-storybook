import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

const output = path.resolve('docs');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' });
try {
  for (const width of [1440, 375]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve('storybook/index.html')).href);
    const result = await page.evaluate(() => ({
      title: document.title,
      scenes: document.querySelectorAll('.spread').length,
      broken: Array.from(document.images).filter(img => !img.complete || img.naturalWidth === 0).length,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    if (result.scenes !== 4 || result.broken !== 0 || result.scrollWidth > width || errors.length) {
      throw new Error(JSON.stringify({ width, ...result, errors }));
    }
    await page.screenshot({ path: path.join(output, `preview-${width}.png`), fullPage: true });
    console.log(JSON.stringify({ width, ...result, errors }));
    await page.close();
  }
} finally { await browser.close(); }
