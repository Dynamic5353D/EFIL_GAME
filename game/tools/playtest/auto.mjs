// Autopilot: plays a Venture (or the whole act) by advancing dialogue, answering choices with the first
// option, winning word battles with the answering move, mashing Enter in battles, and teleporting to the
// next actionable thing in the room (trigger, use point, talkative NPC, or an exit when nothing else).
// Guards and chasers are disabled so the flow itself is what gets tested.
// env: STOP_AT = venture number at which to stop (default: the next one), MAX_MIN = minutes.
export default async ({ page, shot, wait }) => {
  const t0 = Date.now();
  const maxMs = (Number(process.env.MAX_MIN) || 12) * 60000;
  const startV = Number(new URL(page.url()).searchParams.get('venture')) || 1;
  const stopAt = Number(process.env.STOP_AT) || startV + 1;
  await page.waitForFunction(() => window.game?.scene.getScene('World')?.ready, null, { timeout: 90000 });
  const log = [];
  let lastText = '', stuck = 0, lastSig = '', shots = 0;
  const press = async (k, ms = 70) => { await page.keyboard.down(k); await wait(ms); await page.keyboard.up(k); };
  while (Date.now() - t0 < maxMs) {
    const s = await page.evaluate(() => {
      const g = window.game; const st = window.__efil_state();
      const active = g.scene.getScenes(true).map((x) => x.sys.settings.key);
      const w = g.scene.getScene('World'); const d = g.scene.getScene('Dialogue');
      // Disable watchers and pursuers: we test the flow, not the stealth.
      if (w && !w.__ap) { w.__ap = true; w.sees = () => false; w.updateChaser = () => {}; }
      const wb = g.scene.getScene('WordBattle');
      let best = -1;
      if (active.includes('WordBattle') && wb.menu && wb.st) {
        const moves = wb.def.moves.map((m) => m.move);
        best = moves.findIndex((m) => window.__efil_word.effectOf(wb.st.stance, m) === 'strong');
        if (best < 0) best = moves.findIndex((m) => window.__efil_word.effectOf(wb.st.stance, m) === 'normal');
        if (best < 0) best = 0;
      }
      return {
        active, venture: st.venture.venture, purpose: st.venture.purpose, room: w?.room?.id, ready: !!w?.ready, busy: !!w?.busy || !!w?.leaving || !!w?.caught,
        dlg: !!d?.resolve, menu: !!d?.menu, text: d?.bodyText?.text ?? '', obj: st.objective?.en ?? '', wbMenu: !!wb?.menu, best,
        x: Math.round(w?.player?.x ?? 0), y: Math.round(w?.player?.y ?? 0),
      };
    }).catch((e) => ({ error: String(e) }));
    if (s.error) { log.push('EVAL ' + s.error); await wait(1000); continue; }
    if (s.purpose === 1 && s.venture >= stopAt) { log.push(`REACHED V${s.venture}`); break; }
    if (s.active.includes('Credits')) { log.push('CREDITS'); break; }
    if (s.active.includes('Title')) { log.push('TITLE'); break; }
    if (s.active.includes('WordBattle')) {
      if (s.wbMenu && s.best >= 0) {
        for (let i = 0; i < s.best; i++) { await press('ArrowDown'); await wait(120); }
        log.push(`WB move ${s.best}`);
      }
      await press('Enter'); await wait(350); continue;
    }
    if (s.active.includes('Battle') || s.active.includes('ChapterCard')) { await press('Enter'); await wait(300); continue; }
    if (s.dlg || s.menu) {
      if (s.menu) log.push('CHOICE');
      if (s.text && s.text !== lastText && !s.text.startsWith(lastText.slice(0, 20))) { log.push(`[${s.room}] ${s.text.slice(0, 90)}`); }
      lastText = s.text;
      await press('Enter'); await wait(250); continue;
    }
    if (!s.ready || s.busy) { await wait(400); continue; }
    // Free roam: go to the next actionable thing.
    const act = await page.evaluate(() => {
      const w = window.game.scene.getScene('World'); const st = window.__efil_state(); const f = st.flags;
      window.__ap_seen = window.__ap_seen || {};
      const ok = (r) => !r || !!f[r]; const not = (u) => !u || !f[u];
      const c = [];
      for (const L of w.live) {
        const d = L.def; if (L.gone) continue;
        const key = `${w.room.id}:${d.type}:${d.id ?? ''}:${L.placed.tx}`;
        if (d.type === 'trigger' && ok(d.requires) && not(d.unless)) c.push({ L, kind: 'trigger', pri: 0 });
        else if (d.type === 'use' && ok(d.requires) && not(d.unless) && d.items.every((i) => st.inventory[i]) && (window.__ap_seen[key] ?? 0) < 3) c.push({ L, kind: 'use', pri: 1, key });
        else if (d.type === 'npc' && d.talk && d.script && ok(d.requires) && !(d.hideIf && f[d.hideIf]) && !(d.once && f[d.once]) && (window.__ap_seen[key] ?? 0) < 1) c.push({ L, kind: 'use', pri: 2, key });
        else if (d.type === 'npc' && !d.talk && d.script && d.radius > 0 && ok(d.requires) && !(d.hideIf && f[d.hideIf]) && !(d.once && f[d.once])) c.push({ L, kind: 'trigger', pri: 0 });
        else if (d.type === 'enemy' && !st.defeated.includes(d.id) && !st.defeatedForever.includes(d.id)) c.push({ L, kind: 'enemy', pri: 1 });
      }
      c.sort((a, b) => a.pri - b.pri || Math.abs(a.L.placed.x - w.player.x) - Math.abs(b.L.placed.x - w.player.x));
      let pick = c[0];
      if (!pick) {
        // Prefer exits that don't lead straight back to the room we just came from.
        const all = w.live.filter((L) => L.def.type === 'exit');
        const fwd = all.filter((L) => L.def.to !== window.__ap_from);
        const exits = fwd.length ? fwd : all;
        window.__ap_exit = (window.__ap_exit ?? 0) + 1;
        const e = exits[window.__ap_exit % Math.max(1, exits.length)];
        if (e) window.__ap_from = w.room.id;
        if (!e) return { none: true };
        pick = { L: e, kind: 'exit' };
      }
      const p = pick.L.placed;
      let x = p.x;
      if (pick.kind === 'exit') x = p.tx <= 0 ? p.x - 10 : p.x + 10;
      if (pick.kind === 'enemy') x = pick.L.objs[0]?.x ?? p.x;
      w.player.teleport(x, p.y);
      if (pick.key) window.__ap_seen[pick.key] = (window.__ap_seen[pick.key] ?? 0) + 1;
      return { kind: pick.kind, what: `${pick.L.def.type}:${pick.L.def.id ?? pick.L.def.label ?? ''}@${p.tx},${p.ty}`, room: w.room.id };
    });
    if (act.none) { log.push('NOTHING TO DO in ' + s.room + ' obj=' + s.obj); stuck++; if (stuck > 5) break; await wait(1500); continue; }
    const sig = `${act.room}:${act.what}`;
    if (sig === lastSig) stuck++; else stuck = 0;
    lastSig = sig;
    log.push(`GO ${act.kind} ${act.what} (obj: ${s.obj})`);
    if (stuck > 14) { log.push('STUCK'); await shot('stuck'); break; }
    await wait(1500);
    if (act.kind === 'use') { await wait(1500); await press('e', 150); await wait(800); }
    if (act.kind === 'enemy') { await press('x', 100); await wait(800); }
    if (shots < 30 && Math.random() < 0.25) { shots++; await shot(`v${s.venture}-${s.room}`); }
  }
  const end = await page.evaluate(() => { const st = window.__efil_state(); return { venture: st.venture, clues: st.clues.length, codex: st.codex.length, flags: Object.keys(st.flags).filter((k) => /^v\d\d_/.test(k)).length }; });
  console.log(log.join('\n'));
  console.log('END', JSON.stringify(end), `${Math.round((Date.now() - t0) / 1000)}s`);
};
