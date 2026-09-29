#!/usr/bin/env python3
"""Extract every Venture .docx to plain text for reference while writing scripts.

Reads  ../Story/PURPOSE N/Venture M.docx  (never modified)
Writes tools/story_raw/pNN/vNNN.txt        (gitignored: the novel is not part of the repo)
and    tools/story_raw/index.json           (word counts per Venture)

Usage (from game/):  python3 tools/extract_story.py [--force]
"""
from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
import zipfile
from xml.etree import ElementTree
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

GAME = Path(__file__).resolve().parent.parent
STORY = GAME.parent / "Story"
OUT = GAME / "tools" / "story_raw"


def venture_files() -> list[tuple[int, int, Path]]:
    found = []
    for pdir in STORY.iterdir():
        m = re.fullmatch(r"PURPOSE (\d+)", pdir.name)
        if not (m and pdir.is_dir()):
            continue
        purpose = int(m.group(1))
        for f in pdir.glob("Venture *.docx"):
            vm = re.fullmatch(r"Venture (\d+)\.docx", f.name)
            if vm:
                found.append((purpose, int(vm.group(1)), f))
    return sorted(found, key=lambda t: t[1])


W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def docx_text(src: Path) -> str:
    """Plain text from a .docx without pandoc: one line per paragraph, tabs and breaks kept."""
    with zipfile.ZipFile(src) as z:
        root = ElementTree.fromstring(z.read("word/document.xml"))
    lines = []
    for p in root.iter(W + "p"):
        parts = []
        for el in p.iter():
            if el.tag == W + "t" and el.text:
                parts.append(el.text)
            elif el.tag == W + "tab":
                parts.append("\t")
            elif el.tag in (W + "br", W + "cr"):
                parts.append("\n")
        lines.append("".join(parts))
    return "\n".join(lines).strip() + "\n"


def to_text(src: Path) -> str:
    if shutil.which("pandoc"):
        return subprocess.run(
            ["pandoc", str(src), "-t", "plain", "--wrap=none"],
            check=True, capture_output=True, text=True,
        ).stdout
    return docx_text(src)


def extract(purpose: int, venture: int, src: Path, force: bool) -> dict:
    dst = OUT / f"p{purpose:02d}" / f"v{venture:03d}.txt"
    dst.parent.mkdir(parents=True, exist_ok=True)
    if force or not dst.exists() or dst.stat().st_mtime < src.stat().st_mtime:
        text = to_text(src)
        dst.write_text(text, encoding="utf-8")
    else:
        text = dst.read_text(encoding="utf-8")
    return {
        "purpose": purpose,
        "venture": venture,
        "file": str(dst.relative_to(OUT)),
        "words": len(text.split()),
    }


def main() -> None:
    force = "--force" in sys.argv
    files = venture_files()
    if len(files) != 120:
        print(f"warning: expected 120 Ventures, found {len(files)}", file=sys.stderr)
    with ThreadPoolExecutor(max_workers=8) as pool:
        rows = list(pool.map(lambda t: extract(*t, force), files))
    rows.sort(key=lambda r: r["venture"])
    (OUT / "index.json").write_text(json.dumps(rows, indent=1), encoding="utf-8")
    total = sum(r["words"] for r in rows)
    print(f"extracted {len(rows)} Ventures, {total:,} words -> {OUT.relative_to(GAME)}")


if __name__ == "__main__":
    main()
