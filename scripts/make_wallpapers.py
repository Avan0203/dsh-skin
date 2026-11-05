"""Generate original demo wallpapers for the README screenshots.

Writes gradient/plasma art into .demo/wallpapers so the published screenshots
contain no third-party artwork and no user paths.
"""
import math
import os
import random
from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "wallpapers")
os.makedirs(OUT, exist_ok=True)

W, H = 1920, 1080

PALETTES = [
    (("dusk", (24, 18, 58), (233, 96, 106), (255, 188, 120))),
    (("deepsea", (6, 26, 58), (16, 118, 158), (126, 224, 205))),
    (("moss", (16, 34, 28), (58, 128, 92), (214, 226, 148))),
    (("plum", (40, 12, 52), (142, 58, 138), (255, 168, 160))),
    (("amber", (28, 20, 14), (150, 92, 40), (250, 208, 132))),
    (("ice", (14, 26, 44), (72, 128, 188), (214, 240, 250))),
]


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make(name, low, mid, high, seed):
    rng = random.Random(seed)
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)

    # vertical base gradient
    for y in range(H):
        t = y / (H - 1)
        colour = lerp(low, high, t) if t > 0.55 else lerp(low, mid, t / 0.55)
        draw.line([(0, y), (W, y)], fill=colour)

    # soft blurred blobs for depth
    blobs = Image.new("RGB", (W, H), low)
    bd = ImageDraw.Draw(blobs)
    for _ in range(9):
        r = rng.randint(180, 520)
        cx, cy = rng.randint(-100, W + 100), rng.randint(-100, H + 100)
        bd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=lerp(mid, high, rng.random()))
    blobs = blobs.filter(ImageFilter.GaussianBlur(140))
    img = Image.blend(img, blobs, 0.62)

    draw = ImageDraw.Draw(img)
    # faint concentric rings
    cx, cy = rng.randint(W // 4, 3 * W // 4), rng.randint(H // 4, 3 * H // 4)
    for radius in range(60, 900, 46):
        shade = lerp(mid, high, (radius % 300) / 300)
        draw.ellipse(
            [cx - radius, cy - radius, cx + radius, cy + radius],
            outline=shade,
            width=2,
        )

    # scattered light dots
    for _ in range(220):
        x, y = rng.randint(0, W), rng.randint(0, H)
        s = rng.choice([1, 1, 2, 2, 3])
        draw.ellipse([x - s, y - s, x + s, y + s], fill=lerp(high, (255, 255, 255), 0.35))

    img = img.filter(ImageFilter.GaussianBlur(0.6))
    path = os.path.join(OUT, f"demo-{name}.png")
    img.save(path, optimize=True)
    print(path, os.path.getsize(path))


for index, (name, low, mid, high) in enumerate(PALETTES):
    make(name, low, mid, high, seed=1000 + index)
