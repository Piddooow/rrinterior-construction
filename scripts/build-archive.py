#!/usr/bin/env python3
"""Bangun data + sampul untuk halaman Arsip & Galeri dari arsip Instagram.

Sumber: data-foto/index.json (+ caption penuh dari
data-foto/_sumber/detail-postingan-imginn.jsonl).
Keluaran:
  - public/archive/<shortcode>.jpg  (sampul terkompresi, sisi maks 900 px, q76)
  - src/lib/archive-data.ts         (daftar unggahan berfoto, terbaru dulu)

Aturan jujur yang dijaga skrip ini:
  - hanya unggahan yang punya FOTO yang disertakan (video tidak ditanam);
  - keterangan = potongan caption asli (bahasa Indonesia) dengan hashtag dan
    baris promosi dibuang — tidak ada teks karangan;
  - unggahan berketerangan kosong tetap tampil (tanggal + jumlah foto).

Cara pakai (dari akar repo):
    python3 scripts/build-archive.py

Idempoten: menjalankan ulang menimpa berkas keluaran yang sama.
"""

from __future__ import annotations

import json
import os
import re
import sys

from PIL import Image, ImageOps

PHOTO_EXT = {".jpg", ".jpeg", ".png", ".webp"}
MAX_EDGE = 900
QUALITY = 76
EXCERPT_LIMIT = 160


def pick_excerpt(caption: str) -> str:
    """Potongan caption asli: buang hashtag/baris promosi, ambil kalimat awal."""
    if not caption:
        return ""
    kept: list[str] = []
    for raw in caption.splitlines():
        line = raw.strip()
        if not line:
            continue
        low = line.lower()
        if line.startswith("#"):
            continue
        if "✅" in line or "✨" in line:
            continue
        if low.startswith("follow") or "@rrinterior" in low:
            continue
        if low.startswith("- rr") or low.startswith("– rr"):
            continue
        if low.startswith("www") or "wa.me" in low or "ask more" in low:
            continue
        if re.match(r"^\d+[\.\)]\s", line):
            continue
        if "menangani pekerjaan" in low:
            continue
        if low.startswith("rr interior construction"):
            continue
        cleaned = re.sub(r"#\S+", "", line).strip()
        if cleaned:
            kept.append(cleaned)
    text = re.sub(r"\s+", " ", " ".join(kept)).strip()
    if len(text) > EXCERPT_LIMIT:
        cut = text[:EXCERPT_LIMIT]
        text = cut[: cut.rfind(" ")] + "…"
    return text


def main() -> int:
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    index = json.load(open(os.path.join(root, "data-foto", "index.json")))
    posts = index["postingan"]

    captions: dict[str, str] = {}
    detail_path = os.path.join(
        root, "data-foto", "_sumber", "detail-postingan-imginn.jsonl"
    )
    if os.path.exists(detail_path):
        for raw in open(detail_path):
            try:
                row = json.loads(raw)
            except json.JSONDecodeError:
                continue
            if row.get("shortcode"):
                captions[row["shortcode"]] = row.get("caption") or ""

    archive_dir = os.path.join(root, "public", "archive")
    os.makedirs(archive_dir, exist_ok=True)

    entries: list[dict] = []
    video_only = 0
    total_kb = 0
    for post in sorted(posts, key=lambda p: p["tanggal"], reverse=True):
        files = post.get("media_files") or []
        photos = [
            f
            for f in files
            if os.path.splitext(f)[1].lower() in PHOTO_EXT
            and os.path.exists(os.path.join(root, "data-foto", f))
        ]
        if not photos:
            video_only += 1
            continue

        cover_source = os.path.join(root, "data-foto", photos[0])
        image = ImageOps.exif_transpose(Image.open(cover_source)).convert("RGB")
        width, height = image.size
        scale = min(1.0, MAX_EDGE / max(width, height))
        if scale < 1.0:
            image = image.resize(
                (round(width * scale), round(height * scale)), Image.LANCZOS
            )
        target = os.path.join(archive_dir, f'{post["shortcode"]}.jpg')
        image.save(target, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        total_kb += os.path.getsize(target) // 1024

        entries.append(
            {
                "shortcode": post["shortcode"],
                "date": post["tanggal"][:10],
                "year": int(post["tanggal"][:4]),
                "excerpt": pick_excerpt(captions.get(post["shortcode"], "")),
                "photos": len(photos),
                "hasVideo": bool(post.get("berisi_video")),
                "cover": {
                    "src": f'/archive/{post["shortcode"]}.jpg',
                    "width": image.width,
                    "height": image.height,
                },
            }
        )

    header = (
        "/**\n"
        " * Dibuat oleh scripts/build-archive.py dari arsip publik RR\n"
        " * (data-foto/). Jangan sunting manual — jalankan ulang skripnya.\n"
        " *\n"
        " * excerpt = potongan caption asli (bahasa Indonesia) tanpa hashtag\n"
        " * dan baris promosi. Video dari arsip asli tidak ditampilkan.\n"
        " */\n"
    )
    ts = (
        header
        + "export type ArchivePost = {\n"
        + "  shortcode: string;\n"
        + "  /** Tanggal unggahan asli (ISO). */\n"
        + "  date: string;\n"
        + "  year: number;\n"
        + "  /** Potongan caption asli; boleh kosong. */\n"
        + "  excerpt: string;\n"
        + "  photos: number;\n"
        + "  hasVideo: boolean;\n"
        + "  cover: { src: string; width: number; height: number };\n"
        + "};\n\n"
        + f"export const archiveStats = {{\n"
        + f"  total: {len(posts)},\n"
        + f"  withPhotos: {len(entries)},\n"
        + f"  videoOnly: {video_only},\n"
        + "} as const;\n\n"
        + "export const archivePosts: ArchivePost[] = "
        + json.dumps(entries, indent=2, ensure_ascii=False)
        + ";\n"
    )
    out = os.path.join(root, "src", "lib", "archive-data.ts")
    with open(out, "w", encoding="utf-8") as handle:
        handle.write(ts)

    print(
        f"Arsip: {len(entries)} unggahan berfoto, {video_only} video-saja "
        f"tidak ditampilkan. Sampul: {total_kb} KB total."
    )
    samples = [e for e in entries if e["excerpt"]][:5]
    for sample in samples:
        print(f"  {sample['shortcode']}: {sample['excerpt'][:90]}")
    empty = sum(1 for e in entries if not e["excerpt"])
    print(f"  (tanpa keterangan: {empty} unggahan)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
