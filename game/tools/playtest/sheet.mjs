// node sheet.mjs <prefix> <out.png> [cols] : contact sheet of shots/<prefix>*.png via headless Chromium.
import { chromium } from 'playwright-core';
import { readdirSync, readFileSync } from 'node:fs';
const [prefix, out, cols = '4'] = process.argv.slice(2);
const files = readdirSync('shots').filter((f) => f.startsWith(prefix) && f.endsWith('.png')).sort().slice(0, 24);
const c = Number(cols), rows = Math.ceil(files.length / c);
const html = `<body style="margin:0;background:#000;display:grid;grid-template-columns:repeat(${c},640px);gap:4px">${files.map((f) => `<div style="position:relative"><img src="data:image/png;base64,${readFileSync('shots/' + f).toString('base64')}" width=640 height=360><span style="position:absolute;left:6px;top:4px;color:#ff0;font:14px sans-serif;background:#000a">${f}</span></div>`).join('')}</body>`;
const b = await chromium.launch({ executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: c * 644, height: rows * 364 } });
await p.setContent(html);
await p.screenshot({ path: out });
await b.close();
console.log(files.length, 'images ->', out);
