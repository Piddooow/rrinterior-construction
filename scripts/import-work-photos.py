#!/usr/bin/env python3
"""Impor foto karya terkurasi dari arsip (data-foto/) ke public/work/.

Manifest di bawah = hasil kurasi Tahap 2 (Karya Pilihan): sumber dari
postingan arsip RR yang sudah diverifikasi visual (render vs foto), lalu
disalin sebagai JPEG terkompresi — sisi terpanjang maksimum 1400 px,
kualitas 80, progressive. Tidak pernah memperbesar gambar (no upscale).

Cara pakai (dari akar repo):
    python3 scripts/import-work-photos.py

Idempoten: menjalankan ulang menimpa berkas keluaran yang sama.
Berkas keluaran: public/work/<slug>/01.jpg, 02.jpg, ... (01 = sampul).
"""

from __future__ import annotations

import json
import os
import sys

from PIL import Image, ImageOps

# slug -> [(berkas sumber di data-foto/, crop)] dengan crop "top" opsional
MANIFEST = {
    "modern-house-exterior": [
        ("postingan/095_DajgrebHfg-/01.jpg", None),
        ("postingan/095_DajgrebHfg-/02.jpg", None),
        ("postingan/095_DajgrebHfg-/03.jpg", None),
    ],
    "bedroom-work-space": [
        ("postingan/094_DZuLxq8kesp/01.jpg", None),
        ("postingan/094_DZuLxq8kesp/02.jpg", None),
        ("postingan/094_DZuLxq8kesp/03.jpg", None),
        ("postingan/094_DZuLxq8kesp/04.jpg", None),
    ],
    "office-meeting-room": [
        ("postingan/061_Ce8dCmHvEE5/01.jpg", None),
        ("postingan/061_Ce8dCmHvEE5/02.jpg", None),
    ],
    "house-facade-design": [
        ("postingan/064_Cfnb1Xyvs5w/01.webp", None),
    ],
    "auditorium-design": [
        ("postingan/062_CfCGf3lPv4-/01.jpg", None),
        ("postingan/062_CfCGf3lPv4-/02.jpg", None),
    ],
    "sushi-restaurant-design": [
        ("postingan/023_CRDf_EBnc6E/01.jpg", None),
        ("postingan/023_CRDf_EBnc6E/02.jpg", None),
    ],
    "cake-shop-karawang": [
        ("postingan/016_CJpdsaKHuYm/01.jpg", None),
    ],
    # Unggahan asli memuat dua view bertumpuk dalam satu gambar; sampul
    # memakai view atas agar tidak ada potongan melintang di tengah.
    "restaurant-interior-concept": [
        ("postingan/011_CF1JuSpHz3Y/01.jpg", "top"),
    ],
    "cafe-design-concept": [
        ("postingan/009_CFJGj5dnahN/01.jpg", None),
    ],
    "residential-home-tangerang": [
        ("postingan/007_CCIoNb8nqiZ/01.jpg", None),
    ],
    "warehouse-north-jakarta": [
        ("postingan/002_B_MjQ_rHLUP/01.jpg", None),
    ],
    "compact-kitchen-set": [
        ("postingan/003_B_O1dbSHvsH/01.jpg", None),
    ],
}

MAX_EDGE = 1400
QUALITY = 80


def convert(source: str, crop: str | None) -> Image.Image:
    image = ImageOps.exif_transpose(Image.open(source)).convert("RGB")
    if crop == "top":
        width, height = image.size
        image = image.crop((0, 0, width, height // 2))
    width, height = image.size
    scale = min(1.0, MAX_EDGE / max(width, height))
    if scale < 1.0:
        image = image.resize(
            (round(width * scale), round(height * scale)), Image.LANCZOS
        )
    return image


def main() -> int:
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dims: dict[str, dict[str, list[int]]] = {}
    total_kb = 0
    for slug, sources in MANIFEST.items():
        target_dir = os.path.join(root, "public", "work", slug)
        os.makedirs(target_dir, exist_ok=True)
        dims[slug] = {}
        for index, (relative, crop) in enumerate(sources, start=1):
            source = os.path.join(root, "data-foto", relative)
            if not os.path.exists(source):
                print(f"LEWAT (sumber tidak ada): {relative}", file=sys.stderr)
                continue
            image = convert(source, crop)
            name = f"{index:02d}.jpg"
            out = os.path.join(target_dir, name)
            image.save(out, "JPEG", quality=QUALITY, optimize=True, progressive=True)
            size_kb = os.path.getsize(out) // 1024
            total_kb += size_kb
            dims[slug][name] = [image.width, image.height]
            print(f"{slug}/{name}: {image.width}x{image.height}, {size_kb} KB")
    print("\nDIMENSI JSON:")
    print(json.dumps(dims, indent=2))
    print(f"\nTotal: {total_kb} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
