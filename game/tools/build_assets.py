#!/usr/bin/env python3
"""EFIL asset pipeline.

Reads the user's art from ../images/ (never modified) and writes game-ready files to public/assets/:

  bg/<slug>.webp          environments, ≤2048 px (the main painted backdrop)
  bg/<slug>_far.webp      blurred, darkened, half-size copy for the slowest parallax layer
  art/<slug>.webp         every non-environment image at ≤1280 px (codex / "Kaviya's Pool" viewer)
  cutouts/<slug>.webp     background removed (rembg, or flood-fill for plain backgrounds), trimmed
  items/<slug>.webp       256 px square icons made from item/orb cut-outs
  portraits/<slug>.webp   384 px square dialogue portraits cropped from character art
  palettes.json           per image: dominant / shadow / highlight / accent / swatches / light direction
  asset-manifest.json     story names -> files, sizes, credits/watermark notes, duplicates

Usage (from game/):
  tools/.venv/bin/python tools/build_assets.py            # incremental
  tools/.venv/bin/python tools/build_assets.py --force    # rebuild everything
  tools/.venv/bin/python tools/build_assets.py --only kin,vale
  tools/.venv/bin/python tools/build_assets.py --no-rembg # flood-fill fallback only

Watermarks and credits are never removed; they are recorded in the manifest so third-party images
can be replaced or licensed before any public release.
"""
from __future__ import annotations

import argparse
import colorsys
import datetime as dt
import json
import os
import sys
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

GAME = Path(__file__).resolve().parent.parent
SRC = GAME.parent / "images"
OUT = GAME / "public" / "assets"
MODELS = Path.home() / ".local" / "share" / "efil-game" / "rembg-models"
PIPELINE_VERSION = 4  # bump to invalidate every cached output


@dataclass
class Entry:
    file: str
    slug: str
    name: str
    kind: str                      # env | char | creature | item | orb | texture
    names: list[str] = field(default_factory=list)   # extra story aliases
    cut: str | None = None         # rembg | flood | darkkey | lightkey | None
    cut_opts: dict = field(default_factory=dict)  # rembg: {"model"}; keys: {"hi","lo"} or {"radius","lo","hi"}
    portrait: tuple[float, float, float] | None = None  # (cx, cy, size) fractions of (w, h, w)
    credit: str | None = None      # visible watermark / signature / generator mark
    duplicate_of: str | None = None
    acts: list[int] = field(default_factory=list)
    note: str = ""


# ---------------------------------------------------------------- catalogue
# One entry per file in images/. Acts are where the art is first expected to appear (plan.md act table).
CATALOGUE: list[Entry] = [
    # --- environments -----------------------------------------------------------------------------
    Entry("Cascades.png", "cascades", "Cascades", "env", ["Cascades underworld"], acts=[2]),
    Entry("Crimson_Pluffine forest.jpg", "crimson_pluffine_forest", "Crimson Pluffine Forest", "env", acts=[4]),
    Entry("Elliptical Valley.png", "elliptical_valley", "Elliptical Valley", "env", ["Red Lily", "Red Town - Lily"], acts=[2], note="very low resolution (236x413)"),
    Entry("Frozen Pond.jpg", "frozen_pond", "Frozen Pond", "env", ["Rocky Fields"], acts=[2, 4]),
    Entry("Frozen Waterfall.png", "frozen_waterfall", "Frozen Waterfall", "env", acts=[2], note="very low resolution (236x408)"),
    Entry("Ice Cavern.png", "ice_cavern", "Ice Cavern", "env", acts=[2]),
    Entry("Lone White Tree.jpg", "lone_white_tree", "Lone White Tree", "env", acts=[2]),
    Entry("Majestic cave interior.jpg", "majestic_cave_interior", "Majestic Cave (interior)", "env", ["Kaviya's cave"], acts=[3]),
    Entry("Majestic cave.png", "majestic_cave", "Majestic Cave", "env", acts=[3]),
    Entry("Majestic hills Pink Hue Trees.png", "majestic_hills_pink", "Majestic Hills (pink trees)", "env", acts=[3]),
    Entry("Majestic hills.jpg", "majestic_hills", "Majestic Hills", "env", ["The Summit"], acts=[3, 5]),
    Entry("Pink-Glowing Bubbled Flower.jpg", "pink_bubbled_flower", "Pink-Glowing Bubbled Flower", "env", ["giant pink flower chamber"], acts=[2]),
    Entry("Pluffine Forest.png", "pluffine_forest", "Pluffine Forest", "env", acts=[2], credit="signature, bottom right"),
    Entry("Sanctuary Red Path.png", "sanctuary_red_path", "Sanctuary Red Path", "env", ["Neva Sanctuary"], acts=[2], note="very low resolution (236x385)"),
    Entry("Winter Path.png", "winter_path", "Winter Path", "env", acts=[2]),
    Entry("Yellow Tree Bank.jpg", "yellow_tree_bank", "Yellow Tree Bank", "env", acts=[8]),
    Entry("image10.png", "white_tree_pond", "White tree by a frozen pool", "env", note="unnamed in the story (image10)"),
    Entry("image13.png", "sea_cave", "Sea cave", "env", ["Requalam sea cave"], acts=[9]),
    Entry("image19.png", "orb_forest", "Night forest with a glowing orb", "env", note="unnamed in the story (image19)"),
    Entry("image26.png", "bioluminescent_underworld", "Bioluminescent underworld", "env", ["Requalam underworld", "Archive Temple approach"], acts=[9]),
    Entry("image27.png", "starlit_road", "Starlit road", "env", note="unnamed in the story (image27)"),
    Entry("water cliffs canyon.jpeg", "water_cliffs_canyon", "Water Cliffs canyon", "env", ["Water Cliffs"], acts=[3]),
    Entry("snow crabs.jpg", "snow_crabs", "Snow crab shore", "env", ["snow crabs"], acts=[4]),
    # --- characters -------------------------------------------------------------------------------
    Entry("Armored Guy.png", "armored_guy", "Armored Guy", "char", cut="rembg", portrait=(0.55, 0.17, 0.5), acts=[2]),
    Entry("Kanagaraj.png", "kanagaraj", "Kanagaraj", "char", cut="rembg", cut_opts={"model": "u2net"}, portrait=(0.52, 0.2, 0.55), acts=[2]),
    Entry("Majesty Kaviya.png", "majesty_kaviya", "Majesty Kaviya", "char", cut="rembg", portrait=(0.5, 0.25, 0.15), acts=[3], credit="AI-generator sparkle mark, bottom right"),
    Entry("White-dressed girl - Purple Dress.jpg", "jeevitha", "Jeevitha (white-dressed girl)", "char", ["White-dressed girl", "Jeevitha"], cut="rembg", portrait=(0.5, 0.12, 0.4), acts=[2], note="the purple dress is not described in the text"),
    Entry("Zitabye.png", "zitabye", "Zitabye", "char", cut="rembg", portrait=(0.45, 0.16, 0.55), acts=[2]),
    Entry("Gardener's Clothes.jpg", "gardener", "The Gardener", "char", ["Gardie", "Gardener's Clothes"], cut="rembg", portrait=(0.5, 0.2, 0.32), acts=[2], credit="signature, bottom right"),
    Entry("image3.png", "red_throne_woman", "Woman on the red throne", "char", cut="rembg", portrait=(0.5, 0.2, 0.45), credit="small signature, bottom right", note="unnamed in the story (image3)"),
    Entry("image9.png", "white_armor", "White armour", "char", cut="rembg", portrait=(0.5, 0.15, 0.45), note="unnamed in the story (image9)"),
    Entry("image20.png", "black_coat_turnaround", "Black-coat armour turnaround", "char", ["Sleek Black Armor"], cut="rembg", portrait=(0.47, 0.1, 0.2), acts=[10], note="three-view turnaround sheet (image20)"),
    # --- creatures --------------------------------------------------------------------------------
    Entry("Acanus.jpg", "acanus", "Acanus", "creature", cut="rembg", acts=[2], credit="@13033303, bottom right"),
    Entry("download.jpeg", "acanus_dup", "Acanus (duplicate)", "creature", duplicate_of="acanus", credit="@13033303, bottom right", note="same picture as Acanus.jpg"),
    Entry("Cone-hat Creature.png", "cone_hat", "Cone-hat creature", "creature", cut="rembg", acts=[2]),
    Entry("Deer Mount.png", "deer", "Deer mount", "creature", ["Deer Mount"], cut="rembg", acts=[2], credit="(c)2023 Eran Fowler, erenfowler.com, bottom right"),
    Entry("Fluffy Yellow Creature.png", "fluffy_yellow", "Fluffy yellow creature", "creature", cut="rembg", acts=[2], credit="artist text, both bottom corners"),
    Entry("Frozen Phoenix.jpg", "frozen_phoenix", "Frozen Phoenix", "creature", cut="lightkey", cut_opts={"radius": 100, "lo": 25, "hi": 110}, acts=[2, 4], note="luminance-keyed glow; draw with ADD/SCREEN blend"),
    Entry("Ice Butterfly.png", "ice_butterfly", "Ice butterfly", "creature", cut="rembg"),
    Entry("Kin.png", "kin", "Kin", "creature", cut="rembg", portrait=(0.5, 0.42, 0.5), acts=[2]),
    Entry("Large Liquid Shadow.png", "large_liquid_shadow", "Large Liquid Shadow", "creature", cut="rembg", cut_opts={"model": "u2net"}, portrait=(0.5, 0.3, 0.5), acts=[2]),
    Entry("Rami.png", "rami", "Rami", "creature", cut="rembg", portrait=(0.5, 0.25, 0.6), acts=[2]),
    Entry("Vales.png", "vale", "Vale", "creature", ["Vales"], cut="darkkey", cut_opts={"hi": 70, "lo": 30}, acts=[2], credit="(c) signature, bottom right", note="luminance-keyed silhouette; eyes are added in-game (the text says burning blue)"),
    Entry("White Tiger.png", "white_tiger", "White tiger", "creature", cut="rembg", acts=[2]),
    Entry("ZItabye's crow.jpg", "zitabye_crow", "Zitabye's crow", "creature", cut="rembg", credit="AI-generator sparkle mark, bottom right"),
    # --- items ------------------------------------------------------------------------------------
    Entry("Black Rosoar.jpg", "black_rosoar", "Black Rosoar", "item", cut="rembg", acts=[2]),
    Entry("Golden Rosoar.jpg", "golden_rosoar", "Golden Rosoar", "item", cut="rembg", acts=[2]),
    Entry("green rosoar.jpg", "green_rosoar", "Green Rosoar", "item", cut="rembg", acts=[7]),
    Entry("Blue Flower.png", "blue_flower", "Blue Flower", "item", cut="rembg", acts=[2]),
    Entry("Dhanasree's Bracelet.jpg", "dhanasree_bracelet", "Dhanasree's bracelet", "item", cut="rembg", acts=[1]),
    Entry("Dhanasree's weapon.png", "dhanasree_staff", "Dhanasree's staff", "item", ["Dhanasree's weapon"], cut="rembg", acts=[3], credit="'ai' generator badge, bottom right"),
    Entry("Dharshna's locket.jpg", "dharshna_locket", "Dharshna's lotus locket", "item", cut="rembg", acts=[1]),
    Entry("Ice Blade of Shreesha.jpg", "ice_blade", "Ice Blade of Shreesha", "item", cut="rembg", acts=[2], credit="'SUBZERO-ICE DAGGER' signature, bottom right"),
    Entry("Jeevitha's Cart.png", "jeevitha_cart", "Jeevitha's cart", "item", cut="rembg", acts=[2]),
    Entry("Spherical Container.jpg", "spherical_container", "Spherical container", "item", cut="rembg"),
    Entry("Violet Glass Ornament.png", "violet_ornament", "Violet glass ornament", "item", ["Asmitha's device"], cut="rembg", acts=[2]),
    Entry("Zitabye Axe.jpg", "zitabye_axe", "Zitabye's axe", "item", cut="rembg", acts=[2]),
    Entry("Pluffine Wool.jpg", "pluffine_wool", "Pluffine wool", "texture", acts=[2]),
    # --- orbs -------------------------------------------------------------------------------------
    Entry("Pure white orb.jpg", "pure_white_orb", "Pure white orb", "orb", cut="rembg"),
    Entry("RIVA-1.jpg", "riva_1", "RIVA shard I", "orb", cut="rembg"),
    Entry("RIVA-2.jpg", "riva_2", "RIVA shard II", "orb", cut="rembg"),
    Entry("RIVA-3.jpg", "riva_3", "RIVA shard III", "orb", cut="rembg"),
    Entry("RIVA-4.jpg", "riva_4", "RIVA shard IV", "orb", cut="rembg", credit="small text, bottom left"),
    Entry("RIVA-5.jpg", "riva_5", "RIVA shard V", "orb", cut="rembg"),
    Entry("RIVA-6.jpg", "riva_6", "RIVA shard VI", "orb", cut="rembg"),
    Entry("RIVA-7.jpg", "riva_7", "RIVA shard VII", "orb", cut="rembg"),
]


# ---------------------------------------------------------------- helpers
def hexc(rgb) -> str:
    r, g, b = (int(max(0, min(255, round(c)))) for c in rgb[:3])
    return f"#{r:02x}{g:02x}{b:02x}"


def luma(rgb) -> float:
    r, g, b = rgb[:3]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def fit(im: Image.Image, max_side: int) -> Image.Image:
    w, h = im.size
    s = min(1.0, max_side / max(w, h))
    if s >= 1.0:
        return im.copy()
    return im.resize((max(1, round(w * s)), max(1, round(h * s))), Image.Resampling.LANCZOS)


def save_webp(im: Image.Image, path: Path, quality: int = 88) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    kw = {"quality": quality, "method": 6}
    if im.mode == "RGBA":
        kw["exact"] = False
        kw["alpha_quality"] = 90
    im.save(path, "WEBP", **kw)


def rel(p: Path) -> str:
    return p.relative_to(OUT.parent).as_posix()   # "assets/..."


def palette_of(im: Image.Image, alpha: np.ndarray | None = None) -> dict:
    """Dominant / shadow / highlight / accent colours plus 8 swatches and a light direction."""
    small = fit(im.convert("RGB"), 160)
    arr = np.asarray(small).reshape(-1, 3).astype(np.float32)
    if alpha is not None:
        a = np.asarray(Image.fromarray(alpha).resize(small.size)).reshape(-1)
        arr = arr[a > 128]
    if len(arr) < 16:
        arr = np.asarray(small).reshape(-1, 3).astype(np.float32)
    q_src = Image.fromarray(arr.reshape(1, -1, 3).astype(np.uint8))
    q = q_src.quantize(colors=8, method=Image.Quantize.MEDIANCUT, kmeans=4)
    pal = np.array(q.getpalette()[: 8 * 3], dtype=np.float32).reshape(-1, 3)
    counts = np.bincount(np.asarray(q).reshape(-1), minlength=8)[: len(pal)]
    total = counts.sum()
    sw = sorted(
        [(pal[i], counts[i] / total) for i in range(len(pal)) if counts[i] > 0],
        key=lambda t: -t[1],
    )
    significant = [s for s in sw if s[1] >= 0.03] or sw
    dominant = sw[0][0]
    shadow = min(significant, key=lambda s: luma(s[0]))[0]
    highlight = max(significant, key=lambda s: luma(s[0]))[0]

    def sat(c):
        h, l, s = colorsys.rgb_to_hls(*(c / 255.0))
        return s * (1 - abs(l - 0.5) * 1.6)

    accent = max(sw, key=lambda s: sat(s[0]))[0]

    # Light direction: centroid of the brightest 4% of pixels relative to the centre.
    g = np.asarray(small.convert("L"), dtype=np.float32)
    h, w = g.shape
    thr = np.percentile(g, 96)
    ys, xs = np.nonzero(g >= thr)
    lx = float((xs.mean() / w) - 0.5) * 2 if len(xs) else 0.0
    ly = float((ys.mean() / h) - 0.5) * 2 if len(ys) else -1.0
    top = np.asarray(small)[: max(1, h // 5)].reshape(-1, 3).mean(axis=0)
    bottom = np.asarray(small)[-max(1, h // 5):].reshape(-1, 3).mean(axis=0)
    return {
        "dominant": hexc(dominant),
        "shadow": hexc(shadow),
        "highlight": hexc(highlight),
        "accent": hexc(accent),
        "top": hexc(top),
        "bottom": hexc(bottom),
        "swatches": [{"c": hexc(c), "w": round(float(wt), 3)} for c, wt in sw],
        "light": {"x": round(lx, 3), "y": round(ly, 3)},
        "luma": round(float(g.mean()) / 255.0, 3),
    }


# ---------------------------------------------------------------- background removal
_sessions: dict = {}


def rembg_cut(im: Image.Image, model: str = "isnet-general-use") -> Image.Image | None:
    try:
        from rembg import new_session, remove  # type: ignore
    except Exception:
        return None
    if model not in _sessions:
        MODELS.mkdir(parents=True, exist_ok=True)
        os.environ.setdefault("U2NET_HOME", str(MODELS))
        _sessions[model] = new_session(model)
    return remove(im.convert("RGB"), session=_sessions[model], post_process_mask=True)


def luma_key(im: Image.Image, mode: str, opts: dict) -> Image.Image:
    """Key a subject by brightness. 'dark': a dark silhouette on a lighter backdrop (absolute threshold,
    faded at the bottom and left/right edges). 'light': a glowing subject brighter than its local surroundings."""
    from scipy import ndimage

    rgb = np.asarray(im.convert("RGB")).astype(np.float32)
    L = rgb @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    h, w = L.shape
    if mode == "dark":
        hi, lo = opts.get("hi", 70), opts.get("lo", 30)
        a = np.clip((hi - L) / (hi - lo), 0, 1)
        a = a * a * (3 - 2 * a)
        a *= np.clip((h * 0.97 - np.arange(h)) / (h * 0.25), 0, 1)[:, None]
        edge = np.clip(np.minimum(np.arange(w), w - 1 - np.arange(w)) / (w * 0.05), 0, 1)[None, :]
        a *= edge
        rgb = rgb * 0.85
    else:
        r = max(1, int(opts.get("radius", 100) * 0.25))
        small = ndimage.zoom(L, 0.25, order=1)
        bg = ndimage.gaussian_filter(ndimage.minimum_filter(small, size=2 * r + 1), r * 0.6)
        bg = ndimage.zoom(bg, (h / bg.shape[0], w / bg.shape[1]), order=1)
        lo, hi = opts.get("lo", 25), opts.get("hi", 110)
        a = np.clip((L - bg - lo) / (hi - lo), 0, 1)
        a = a * a * (3 - 2 * a)
    a = ndimage.gaussian_filter(a, 0.7)
    return Image.fromarray(np.dstack([rgb, a * 255]).astype(np.uint8), "RGBA")


def flood_cut(im: Image.Image, tol: float = 28.0) -> Image.Image:
    """Remove a plain background connected to the image border (fallback when rembg is absent)."""
    from scipy import ndimage  # installed alongside rembg; only needed for the fallback

    rgb = np.asarray(im.convert("RGB")).astype(np.float32)
    h, w, _ = rgb.shape
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    bg = np.median(border, axis=0)
    dist = np.sqrt(((rgb - bg) ** 2).sum(axis=2))
    near = dist < tol
    labels, _ = ndimage.label(near)
    edge_labels = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    edge_labels = edge_labels[edge_labels > 0]
    bgmask = np.isin(labels, edge_labels)
    soft = np.clip((dist - tol * 0.5) / (tol * 0.8), 0, 1)
    alpha = np.where(bgmask, 0.0, 1.0)
    alpha = np.maximum(alpha, np.where(bgmask, 0, soft))
    alpha = ndimage.gaussian_filter(alpha, 0.8)
    out = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def trim(im: Image.Image, pad: int = 6) -> Image.Image:
    a = np.asarray(im.getchannel("A"))
    ys, xs = np.nonzero(a > 12)
    if not len(xs):
        return im
    x0, x1 = max(0, xs.min() - pad), min(im.width, xs.max() + pad + 1)
    y0, y1 = max(0, ys.min() - pad), min(im.height, ys.max() + pad + 1)
    return im.crop((x0, y0, x1, y1))


def square_icon(cut: Image.Image, size: int = 256) -> Image.Image:
    c = cut.copy()
    c.thumbnail((int(size * 0.9), int(size * 0.9)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(c, ((size - c.width) // 2, (size - c.height) // 2), c)
    return canvas


def portrait_crop(im: Image.Image, spec: tuple[float, float, float], size: int = 384) -> Image.Image:
    cx, cy, s = spec
    w, h = im.size
    side = min(s * w, w, h)
    x0 = min(max(0, cx * w - side / 2), w - side)
    y0 = min(max(0, cy * h - side / 2), h - side)
    return im.crop((round(x0), round(y0), round(x0 + side), round(y0 + side))).resize(
        (size, size), Image.Resampling.LANCZOS
    ).convert("RGB")


def far_layer(im: Image.Image) -> Image.Image:
    half = fit(im, max(im.size) // 2)
    blurred = half.filter(ImageFilter.GaussianBlur(radius=max(3, max(half.size) / 110)))
    blurred = ImageEnhance.Brightness(blurred).enhance(0.62)
    return ImageEnhance.Color(blurred).enhance(0.85)


# ---------------------------------------------------------------- build
def stale(outputs: list[Path], src: Path, force: bool, cache: dict, slug: str) -> bool:
    if force or cache.get(slug) != PIPELINE_VERSION:
        return True
    return any((not p.exists()) or p.stat().st_mtime < src.stat().st_mtime for p in outputs)


def build(entry: Entry, force: bool, use_rembg: bool, cache: dict) -> tuple[dict, dict | None]:
    src = SRC / entry.file
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    rec: dict = {
        "name": entry.name,
        "names": entry.names,
        "kind": entry.kind,
        "source": entry.file,
        "size": list(im.size),
        "acts": entry.acts,
        "files": {},
    }
    if entry.credit:
        rec["credit"] = entry.credit
    if entry.note:
        rec["note"] = entry.note
    if entry.duplicate_of:
        rec["duplicate_of"] = entry.duplicate_of
        return rec, None

    outputs: dict[str, Path] = {}
    if entry.kind == "env":
        outputs["bg"] = OUT / "bg" / f"{entry.slug}.webp"
        outputs["far"] = OUT / "bg" / f"{entry.slug}_far.webp"
        outputs["art"] = outputs["bg"]
    else:
        outputs["art"] = OUT / "art" / f"{entry.slug}.webp"
    if entry.cut:
        outputs["cutout"] = OUT / "cutouts" / f"{entry.slug}.webp"
    if entry.kind in ("item", "orb", "texture"):
        outputs["icon"] = OUT / "items" / f"{entry.slug}.webp"
    if entry.portrait:
        outputs["portrait"] = OUT / "portraits" / f"{entry.slug}.webp"

    cut_img: Image.Image | None = None
    if stale(list(set(outputs.values())), src, force, cache, entry.slug):
        if entry.kind == "env":
            save_webp(fit(im, 2048), outputs["bg"], 90)
            save_webp(far_layer(fit(im, 2048)), outputs["far"], 80)
        else:
            save_webp(fit(im, 1280), outputs["art"], 86)
        if entry.cut:
            method = entry.cut
            if method in ("darkkey", "lightkey"):
                cut_img = luma_key(im, method[:-3], entry.cut_opts)
            else:
                model = entry.cut_opts.get("model", "isnet-general-use")
                cut_img = rembg_cut(im, model) if (method == "rembg" and use_rembg) else None
                if cut_img is None:
                    method = "flood"
                    cut_img = flood_cut(im)
                elif model != "isnet-general-use":
                    method = f"rembg:{model}"
            cut_img = trim(fit(cut_img, 1280))
            save_webp(cut_img, outputs["cutout"], 90)
            rec["cut_method"] = method
        if "icon" in outputs:
            src_icon = cut_img if cut_img is not None else fit(im, 512).convert("RGBA")
            if entry.kind == "texture":
                side = min(im.size)
                src_icon = im.crop((0, 0, side, side)).convert("RGBA")
            save_webp(square_icon(src_icon), outputs["icon"], 90)
        if entry.portrait:
            save_webp(portrait_crop(im, entry.portrait), outputs["portrait"], 88)
        cache[entry.slug] = PIPELINE_VERSION
        print(f"  built  {entry.slug}")
    else:
        if "cutout" in outputs and outputs["cutout"].exists():
            cut_img = Image.open(outputs["cutout"]).convert("RGBA")
        print(f"  cached {entry.slug}")

    for k, p in outputs.items():
        rec["files"][k] = rel(p)
        if k == "cutout":
            with Image.open(p) as c:
                rec["cutout_size"] = list(c.size)

    alpha = np.asarray(cut_img.getchannel("A")) if cut_img is not None else None
    pal_src = cut_img.convert("RGB") if cut_img is not None else im
    pal = palette_of(pal_src, alpha)
    return rec, pal


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--only", default="")
    ap.add_argument("--no-rembg", action="store_true")
    args = ap.parse_args()

    files = {p.name for p in SRC.iterdir() if p.is_file()}
    known = {e.file for e in CATALOGUE}
    missing = sorted(files - known)
    gone = sorted(known - files)
    if missing:
        print("warning: images not in the catalogue:", ", ".join(missing), file=sys.stderr)
    if gone:
        print("warning: catalogue entries with no image:", ", ".join(gone), file=sys.stderr)

    cache_path = GAME / "tools" / ".asset-cache.json"
    try:
        cache = json.loads(cache_path.read_text())
    except Exception:
        cache = {}

    manifest_path = OUT / "asset-manifest.json"
    palettes_path = OUT / "palettes.json"
    try:
        old_manifest = json.loads(manifest_path.read_text())["images"]
        old_palettes = json.loads(palettes_path.read_text())
    except Exception:
        old_manifest, old_palettes = {}, {}

    only = {s.strip() for s in args.only.split(",") if s.strip()}
    images: dict = {}
    palettes: dict = {}
    for e in CATALOGUE:
        if e.file not in files:
            continue
        if only and e.slug not in only:
            if e.slug in old_manifest:
                images[e.slug] = old_manifest[e.slug]
            if e.slug in old_palettes:
                palettes[e.slug] = old_palettes[e.slug]
            continue
        rec, pal = build(e, args.force, not args.no_rembg, cache)
        images[e.slug] = rec
        if pal:
            palettes[e.slug] = pal
            rec["palette"] = e.slug

    aliases: dict[str, str] = {}
    for slug, rec in images.items():
        if rec.get("duplicate_of"):
            continue
        for n in [rec["name"], *rec.get("names", [])]:
            aliases[n.lower()] = slug

    manifest = {
        "version": PIPELINE_VERSION,
        "generated": dt.datetime.now().isoformat(timespec="seconds"),
        "source_dir": "../images (read-only)",
        "licensing": "Several images carry third-party watermarks, signatures or generator marks (see 'credit'). "
                     "They are fine for a private build but must be replaced or licensed before any public release. "
                     "Watermarks are never removed.",
        "images": images,
        "aliases": dict(sorted(aliases.items())),
    }
    OUT.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, indent=1, ensure_ascii=False))
    palettes_path.write_text(json.dumps(palettes, indent=1))
    cache_path.write_text(json.dumps(cache, indent=1))
    credited = [s for s, r in images.items() if r.get("credit")]
    print(f"{len(images)} images -> {rel(manifest_path)}; {len(credited)} carry credits/watermarks")


if __name__ == "__main__":
    main()
