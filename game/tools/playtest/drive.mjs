// Usage: node drive.mjs steps.mjs  — steps module default-exports async ({ page, shot, key, wait }) => {}
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const dir = new URL('./shots/', import.meta.url).pathname;
mkdirSync(dir, { recursive: true });
const steps = (await import(process.argv[2])).default;
const browser = await chromium.launch({
  executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('console', (m) => { if (['error','warning','info'].includes(m.type())) errors.push(`[${m.type()}] ${m.text()}`); });
page.on('response', (r) => { if (r.status() >= 400) errors.push('[http ' + r.status() + '] ' + r.url()); });
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}\n${e.stack}`));
let n = 0;
const tag = process.argv[3] ?? 'run';
const shot = async (name) => { await page.screenshot({ path: `${dir}${tag}-${String(++n).padStart(2, '0')}-${name}.png` }); };
const key = async (k, ms = 80) => { await page.keyboard.down(k); await page.waitForTimeout(ms); await page.keyboard.up(k); };
const wait = (ms) => page.waitForTimeout(ms);
await page.goto('http://localhost:5173/' + (process.argv[4] ?? ''));
try { await steps({ page, shot, key, wait }); } catch (e) { errors.push('[driver] ' + e.stack); }
console.log(errors.length ? errors.join('\n') : 'no console errors');
await browser.close();
