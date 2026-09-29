// Advances a story, screenshotting each new staged line (every Nth), until the World is free or MAXN lines.
export default async ({ page, shot, key, wait }) => {
  await page.waitForFunction(() => window.game?.scene.getScene('World')?.ready, null, { timeout: 120000 });
  const every = Number(process.env.EVERY) || 3, maxn = Number(process.env.MAXN) || 80;
  let n = 0, last = '';
  for (let i = 0; i < 400 && n < maxn; i++) {
    const s = await page.evaluate(() => { const g = window.game; const d = g.scene.getScene('Dialogue'); const w = g.scene.getScene('World'); const act = g.scene.getScenes(true).map((x) => x.sys.settings.key);
      return { r: !!d?.resolve, m: !!d?.menu, t: d?.full ?? '', busy: !!w?.busy, act }; });
    if (s.act.includes('WordBattle') || s.act.includes('Battle') || s.act.includes('ChapterCard')) { await key('Enter'); await wait(400); continue; }
    if (s.m) { await key('Enter'); await wait(300); continue; }
    if (s.r) {
      if (s.t !== last) { last = s.t; n++; if (n % every === 1 || every === 1) { await wait(1500); await shot(`${n}`); } }
      await key('Enter'); await wait(150); await key('Enter'); await wait(200); continue;
    }
    if (!s.busy && i > 5) break;
    await wait(400);
  }
  console.log('lines', n);
};
