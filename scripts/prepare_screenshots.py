"""Prepare the submitted screenshots for the README and the market storefront.

Keeps the file sizes reasonable (a 3 MB PNG in a README is a bad default) while
leaving the settings page as PNG so its small Chinese text stays crisp.
"""
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, ".tmp", "shots")
OUT = os.path.join(ROOT, "assets")
os.makedirs(OUT, exist_ok=True)

JOBS = [
    ("shot1.png", "screenshot-1.jpg", 1600, 86),
    ("shot2.png", "screenshot-2.jpg", 1600, 86),
    ("shot3.png", "screenshot-3.png", 1195, 92),
]

for name, target, width, quality in JOBS:
    src = os.path.join(SRC, name)
    image = Image.open(src).convert("RGB")
    if image.width > width:
        height = round(image.height * width / image.width)
        image = image.resize((width, height), Image.LANCZOS)
    path = os.path.join(OUT, target)
    if target.endswith(".jpg"):
        image.save(path, "JPEG", quality=quality, optimize=True, progressive=True)
    else:
        image.save(path, "PNG", optimize=True)
    print(f"{target}: {image.size[0]}x{image.size[1]}  {round(os.path.getsize(path)/1024)} KB")
