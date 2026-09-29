/**
 * Screen effects for `@fx`, on any scene's camera: the World's, or the Stage's while a staged scene
 * is open. Fades are what scripts use to cut between places; `black` is the cut-away for violence.
 */
import type Phaser from 'phaser';
import { audio } from '../core/AudioSynth';
import { settings } from '../core/Settings';

/** The fades, which the World mirrors under an open stage so it is in the same state when the stage closes. */
export const FADES = new Set(['fade_out', 'fade_in', 'black', 'unblack']);

export async function cameraFx(scene: Phaser.Scene, cam: Phaser.Cameras.Scene2D.Camera, name: string, quiet = false): Promise<void> {
  const calm = settings.get('reducedMotion');
  const shake = settings.get('screenShake') && !calm;
  const wait = (ms: number) => new Promise<void>((r) => scene.time.delayedCall(ms, () => r()));
  const sfx: typeof audio.sfx = (...a) => { if (!quiet) audio.sfx(...a); };
  switch (name) {
    case 'shake': if (shake) cam.shake(350, 0.012); return wait(350);
    case 'flash': cam.flash(300, 255, 255, 255); return wait(300);
    case 'red_flash': cam.flash(600, 255, 40, 50); sfx('meld'); return wait(600);
    case 'slap':
      sfx('slap');
      cam.flash(120, 255, 255, 255);
      if (shake) cam.shake(160, 0.01);
      return wait(250);
    case 'tick': {
      sfx('tick');
      const cm = cam.filters.internal.addColorMatrix();
      cm.colorMatrix.desaturate();
      await wait(220);
      cam.filters.internal.remove(cm);
      return;
    }
    case 'migraine': {
      sfx('dread');
      cam.flash(900, 120, 20, 40);
      if (calm) return wait(600);
      const barrel = cam.filters.internal.addBarrel(1);
      await new Promise<void>((r) => scene.tweens.addCounter({
        from: 0, to: 1, duration: 1400, onUpdate: (tw) => { barrel.amount = 1 + Math.sin(tw.getValue()! * Math.PI * 3) * 0.12 * (1 - tw.getValue()!); },
        onComplete: () => r(),
      }));
      cam.filters.internal.remove(barrel);
      return;
    }
    case 'fade_out':
      cam.fadeOut(calm ? 150 : 600, 0, 0, 0);
      return wait(calm ? 150 : 600);
    case 'fade_in':
      cam.fadeIn(calm ? 150 : 600, 0, 0, 0);
      return wait(calm ? 150 : 600);
    case 'black':
      // Cut to black at once (gore and violence cut away at the moment of impact).
      cam.fadeOut(0, 0, 0, 0);
      return wait(60);
    case 'unblack':
      cam.fadeIn(calm ? 150 : 700, 0, 0, 0);
      return wait(calm ? 150 : 700);
    case 'bang':
      sfx('gun');
      cam.flash(90, 255, 255, 255);
      if (shake) cam.shake(200, 0.014);
      await wait(90);
      cam.fadeOut(0, 0, 0, 0);
      return wait(900);
    case 'snap': {
      // Nithish's snap: a red flash and the world freezes grey for a breath.
      sfx('tick');
      sfx('meld');
      cam.flash(500, 255, 30, 40);
      const cm = cam.filters.internal.addColorMatrix();
      cm.colorMatrix.desaturate();
      if (shake) cam.shake(300, 0.01);
      await wait(900);
      cam.filters.internal.remove(cm);
      return;
    }
    case 'dizzy': {
      sfx('dread');
      if (calm) return wait(400);
      const barrel = cam.filters.internal.addBarrel(1);
      const blur = cam.filters.internal.addBlur(0, 2, 2, 1);
      await new Promise<void>((r) => scene.tweens.addCounter({
        from: 0, to: 1, duration: 2200, onUpdate: (tw) => {
          const v = tw.getValue()!;
          barrel.amount = 1 + Math.sin(v * Math.PI * 4) * 0.08 * Math.sin(v * Math.PI);
          blur.strength = Math.sin(v * Math.PI) * 1.4;
        },
        onComplete: () => r(),
      }));
      cam.filters.internal.remove(barrel);
      cam.filters.internal.remove(blur);
      return;
    }
    case 'lightning':
      cam.flash(160, 220, 230, 255);
      scene.time.delayedCall(220, () => cam.flash(90, 200, 210, 255));
      scene.time.delayedCall(500, () => sfx('thunder'));
      return wait(300);
    case 'fire':
      sfx('fire');
      cam.flash(400, 255, 140, 40);
      if (shake) cam.shake(300, 0.008);
      return wait(400);
    case 'heartbeat':
      sfx('heartbeat');
      return wait(900);
    default:
      return;
  }
}
