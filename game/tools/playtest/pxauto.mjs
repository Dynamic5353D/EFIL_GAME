// Pixel-game autopilot: walks the grid with real key presses (BFS paths, re-planned when someone is in
// the way), talks to every NPC and looks at everything, answers choices with the first option, takes
// every door, and repeats while the story keeps changing flags. Ends with the quest states.
// env: MAX_MIN = minutes (default 8), GOAL = quest id that must be complete (default: posters).
export default async ({ page, shot, wait }) => {
  const t0 = Date.now();
  const maxMs = (Number(process.env.MAX_MIN) || 8) * 60000;
  const goal = process.env.GOAL || 'posters';
  await page.waitForFunction(() => window.game?.scene.getScene('Overworld')?.player, null, { timeout: 60000 });
  const log = [];
  const press = async (k, ms = 60) => { await page.keyboard.down(k); await wait(ms); await page.keyboard.up(k); };
  const KEY = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };

  const snap = () => page.evaluate(() => {
    const w = window.game.scene.getScene('Overworld');
    const ui = window.game.scene.getScene('Ui');
    const st = window.__efil_state();
    const m = w.map;
    const shown = (r, u) => (!r || !!st.flags[r]) && (!u || !st.flags[u]);
    const targets = [];
    for (const n of w.npcs) targets.push({ key: `${m.def.id}:npc:${n.def.id}`, x: n.w.tx, y: n.w.ty });
    for (const l of m.def.looks ?? []) if (shown(l.requires, l.unless)) targets.push({ key: `${m.def.id}:look:${l.x},${l.y}`, x: l.x, y: l.y });
    const warps = [...m.warps.values()].map((v) => ({ key: `${m.def.id}:warp:${v.x},${v.y}`, x: v.x, y: v.y, dir: v.dir ?? null, to: v.to }));
    const occ = [...w.occupied];
    return {
      map: m.def.id, busy: !!(ui.busy || w.busy || w.director.running || w.stepping), px: w.player.tx, py: w.player.ty, dir: w.player.dir,
      solid: m.solid.map((r) => r.map((b) => (b ? 1 : 0)).join('')), occ, targets, warps,
      flags: JSON.stringify(st.flags), quests: st.quests, menu: window.game.scene.isActive('Menu'),
    };
  });

  const bfs = (s, goals, intoSolid = false) => {
    const H = s.solid.length, W = s.solid[0].length;
    const block = new Set(s.occ); block.delete(`${s.px},${s.py}`);
    const k = (x, y) => `${x},${y}`;
    const prev = new Map([[k(s.px, s.py), null]]);
    const q = [[s.px, s.py]];
    const want = new Set(goals.map(([x, y]) => k(x, y)));
    while (q.length) {
      const [x, y] = q.shift();
      if (want.has(k(x, y))) {
        const path = [];
        let c = k(x, y);
        while (prev.get(c)) { const [p, d] = prev.get(c); path.unshift(d); c = p; }
        return path;
      }
      for (const [d, dx, dy] of [['down', 0, 1], ['up', 0, -1], ['left', -1, 0], ['right', 1, 0]]) {
        const nx = x + dx, ny = y + dy, nk = k(nx, ny);
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || prev.has(nk)) continue;
        if ((s.solid[ny][nx] === '1' && !(intoSolid && want.has(nk))) || block.has(nk)) continue;
        prev.set(nk, [k(x, y), d]);
        q.push([nx, ny]);
      }
    }
    return null;
  };

  // Walk a path: hold each run of the same direction until that many tiles are covered.
  const walk = async (path) => {
    let i = 0;
    while (i < path.length) {
      const d = path[i];
      let n = 1;
      while (path[i + n] === d) n++;
      const before = await snap();
      if (before.dir !== d) { await press(KEY[d], 40); await wait(120); }
      const tx = before.px + (d === 'left' ? -n : d === 'right' ? n : 0);
      const ty = before.py + (d === 'up' ? -n : d === 'down' ? n : 0);
      await page.keyboard.down(KEY[d]);
      const until = Date.now() + n * 320 + 400;
      let s = before;
      while (Date.now() < until) {
        await wait(40);
        s = await snap();
        if ((s.px === tx && s.py === ty) || s.map !== before.map || s.busy) break;
      }
      await page.keyboard.up(KEY[d]);
      await wait(60);
      if (s.map !== before.map || s.busy) return 'interrupted';
      if (s.px !== tx || s.py !== ty) { log.push(`blocked ${d}x${n} from ${before.px},${before.py} at ${s.px},${s.py} (dir ${s.dir})`); return 'blocked'; }
      i += n;
    }
    return 'ok';
  };

  const done = new Set();
  const visitedWarps = new Set();
  let lastFlags = '', idlePasses = 0, blocked = 0, talks = 0;
  while (Date.now() - t0 < maxMs) {
    const s = await snap();
    if (s.menu) { await press('Escape'); continue; }
    if (s.busy) {
      // Dialogue or a choice: the first option is fine.
      await press('KeyZ', 50);
      await wait(120);
      continue;
    }
    if (s.quests[goal]?.done && idlePasses > 0) break;
    const open = s.targets.filter((t) => !done.has(t.key));
    let target = null, path = null;
    for (const t of open) {
      const around = [[t.x, t.y + 1, 'up'], [t.x, t.y - 1, 'down'], [t.x - 1, t.y, 'right'], [t.x + 1, t.y, 'left']];
      const p = bfs(s, around.map(([x, y]) => [x, y]));
      if (p && (!path || p.length < path.length)) { target = t; path = p; }
    }
    if (!target) {
      // Nothing left here: new flags mean another pass; else take a door we haven't used.
      if (s.flags !== lastFlags) {
        lastFlags = s.flags; idlePasses = 0;
        for (const k of [...done]) done.delete(k);
        log.push(`PASS (flags changed) in ${s.map}`);
        continue;
      }
      idlePasses++;
      const w = s.warps.find((v) => !visitedWarps.has(v.key)) ?? s.warps[idlePasses % Math.max(1, s.warps.length)];
      if (!w || idlePasses > 6) { log.push('NOTHING LEFT'); break; }
      visitedWarps.add(w.key);
      const p = bfs(s, [[w.x, w.y]], true);
      log.push(`DOOR ${w.key} -> ${w.to}`);
      if (p) await walk(p);
      await wait(900);
      continue;
    }
    const r = await walk(path);
    if (r === 'blocked') { if (++blocked > 40) { log.push('STUCK'); await shot('stuck'); break; } continue; }
    if (r === 'interrupted') continue;
    // Face the target and press Z.
    const me = await snap();
    const d = target.x < me.px ? 'left' : target.x > me.px ? 'right' : target.y < me.py ? 'up' : 'down';
    if (me.dir !== d) { await press(KEY[d], 40); await wait(150); }
    await press('KeyZ', 50);
    await wait(250);
    done.add(target.key);
    talks++;
    if (talks % 6 === 1) await shot(`talk-${target.key.replace(/[^a-z0-9]+/gi, '_')}`);
  }
  const end = await snap();
  console.log(log.join('\n'));
  console.log('QUESTS', JSON.stringify(end.quests));
  console.log('FLAGS', end.flags);
  console.log(end.quests[goal]?.done ? `GOAL ${goal} DONE` : `GOAL ${goal} NOT DONE`, `${talks} interactions`, `${Math.round((Date.now() - t0) / 1000)}s`);
};
