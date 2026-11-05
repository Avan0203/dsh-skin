"""Rasterize icon.svg into assets/icon-180.png for the plugin-market card.

The market refuses SVG for `icon:`, so this mirrors icon.svg geometry in a
4x supersampled Pillow draw and downscales with LANCZOS.
"""
import os

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "assets")
os.makedirs(OUT_DIR, exist_ok=True)

SIZE = 180
SCALE = 4
CANVAS = SIZE * SCALE
K = CANVAS / 64.0  # icon.svg viewBox is 64x64

DARK = (31, 42, 55, 255)  # #1f2a37
BLUE = (79, 142, 247, 255)  # #4f8ef7
YELLOW = (247, 201, 72, 255)  # #f7c948


def box(x, y, w, h):
    return [x * K, y * K, (x + w) * K, (y + h) * K]


img = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# <rect x=4 y=10 width=56 height=44 rx=8 fill=#1f2a37>
draw.rounded_rectangle(box(4, 10, 56, 44), radius=8 * K, fill=DARK)

# mountains: M8 48 l14-16 10 11 7-7 17 17 H8 z
poly = [(8, 48), (22, 32), (32, 43), (39, 36), (56, 53), (8, 53)]
scaled = [(x * K, y * K) for x, y in poly]
draw.polygon(scaled, fill=(*BLUE[:3], 242))

# sun: circle cx=20 cy=24 r=6
draw.ellipse(box(20 - 6, 24 - 6, 12, 12), fill=YELLOW)

# outline stroke on the rounded rect: 2.5 in a 64 unit box
draw.rounded_rectangle(box(4, 10, 56, 44), radius=8 * K, outline=BLUE, width=round(2.5 * K))
# hairline around the mountain path
draw.line(scaled + [scaled[0]], fill=DARK, width=round(1.5 * K), joint="curve")

out = img.resize((SIZE, SIZE), Image.LANCZOS)
path = os.path.join(OUT_DIR, "icon-180.png")
out.save(path)
print(path, os.path.getsize(path), out.size, out.mode)
