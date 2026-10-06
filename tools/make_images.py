#!/usr/bin/env python3
"""Generate the site's static images with Pillow.

Outputs into img/:
  og.png, og-blog.png        1200x630 social previews (no SVG, Telegram needs PNG)
  icon-192/512, apple-touch-icon.png   app icons
  game-slingor/tblocks/dungeon.png    1280x720 cover art for the pages

Run:  python tools/make_images.py
"""
from __future__ import annotations

import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "img"
IMG.mkdir(exist_ok=True)

C_BG = (11, 14, 26)
C_CYAN = (34, 211, 238)
C_VIOLET = (139, 92, 246)
C_MAGENTA = (232, 121, 249)
C_WHITE = (219, 227, 244)
C_DIM = (139, 151, 184)


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    path = Path("C:/Windows/Fonts") / name
    if path.exists():
        return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def f_bold(size: int) -> ImageFont.FreeTypeFont:
    return font("segoeuib.ttf", size)


def f_body(size: int) -> ImageFont.FreeTypeFont:
    return font("segoeui.ttf", size)


def f_mono(size: int) -> ImageFont.FreeTypeFont:
    return font("consolab.ttf", size)


def vgrad(w: int, h: int, c_top, c_bot) -> Image.Image:
    img = Image.new("RGB", (w, h))
    strip = Image.new("RGB", (1, h))
    for y in range(h):
        t = y / (h - 1)
        strip.putpixel(
            (0, y),
            tuple(round(a + (b - a) * t) for a, b in zip(c_top, c_bot)),
        )
    img.paste(strip.resize((w, h)))
    return img


def glow(img: Image.Image, center, radius: int, color, alpha=255) -> None:
    """Add a soft radial glow. Safe for RGB and RGBA canvases."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).ellipse(
        (center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius),
        fill=color + (alpha,),
    )
    mask = layer.getchannel("A").filter(ImageFilter.GaussianBlur(radius / 2))
    layer.putalpha(mask)
    if img.mode == "RGBA":
        img.paste(Image.alpha_composite(img, layer), (0, 0))
    else:
        img.paste(Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB"), (0, 0))


def stars(w: int, h: int, n: int, seed: int) -> Image.Image:
    rng = random.Random(seed)
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for _ in range(n):
        x, y = rng.uniform(0, w), rng.uniform(0, h)
        r = rng.uniform(0.6, 1.8)
        a = rng.randint(60, 200)
        col = C_CYAN if rng.random() < 0.15 else C_WHITE
        d.ellipse((x - r, y - r, x + r, y + r), fill=col + (a,))
    return layer


def space_bg(w: int, h: int, seed: int) -> Image.Image:
    img = vgrad(w, h, (13, 17, 34), (5, 7, 16)).convert("RGBA")
    glow(img, (w * 0.18, h * 0.22), w // 6, C_VIOLET, 120)
    glow(img, (w * 0.85, h * 0.75), w // 5, (15, 60, 90), 150)
    return Image.alpha_composite(img, stars(w, h, 260, seed))


def fit(text: str, size: int, max_w: int) -> ImageFont.FreeTypeFont:
    fnt = f_bold(size)
    probe = ImageDraw.Draw(Image.new("RGB", (4, 4)))
    while probe.textlength(text, font=fnt) > max_w and size > 12:
        size -= 2
        fnt = f_bold(size)
    return fnt


def make_og(path: str, headline: str, sub: str, seed: int) -> None:
    W, H = 1200, 630
    img = space_bg(W, H, seed)
    glow(img, (W * 0.5, H * 0.5), W // 6, C_CYAN, 70)
    d = ImageDraw.Draw(img)
    d.line((80, H - 8, W - 80, H - 8), fill=C_VIOLET + (120,), width=3)
    d.text((80, 68), "// инди-студия · vanilla js + python", font=f_mono(26),
           fill=C_DIM + (255,))
    f = fit(headline, 104, W - 320)
    d.text((W / 2, H / 2 - 40), headline, font=f, fill=C_WHITE + (255,), anchor="mm")
    f2 = fit(sub, 34, W - 320)
    # subtitle in light cyan over a dimmed band for readability
    d.text((W / 2, H / 2 + 96), sub, font=f2, fill=C_CYAN + (255,), anchor="mm")
    d.text((W / 2, H / 2 + 156), "krempik.github.io/4ayka-studio", font=f_mono(24),
           fill=C_DIM + (255,), anchor="mm")
    img.convert("RGB").save(IMG / path, "PNG")
    print("img/", path, sep="")


def make_icons() -> None:
    for size in (192, 512):
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        d.rounded_rectangle((0, 0, size - 1, size - 1), int(size * 0.2),
                            fill=C_BG + (255,))
        glow(img, (size / 2, size / 2), size // 3, C_VIOLET, 120)
        glow(img, (size / 2, size / 2), size // 4, C_CYAN, 80)
        d = ImageDraw.Draw(img)
        f = fit("4", int(size * 0.6), size)
        d.text((size / 2, size / 2 + size * 0.02), "4", font=f,
               fill=C_CYAN + (255,), anchor="mm")
        img.convert("RGB").save(IMG / f"icon-{size}.png", "PNG")
        print("img/icon-", size, ".png", sep="")

    size = 180
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, size - 1, size - 1), int(size * 0.2),
                        fill=C_BG + (255,))
    glow(img, (size / 2, size / 2), size // 3, C_CYAN, 90)
    d = ImageDraw.Draw(img)
    d.text((size / 2, size / 2 + 2), "4", font=f_bold(int(size * 0.58)),
           fill=C_CYAN + (255,), anchor="mm")
    img.convert("RGB").save(IMG / "apple-touch-icon.png", "PNG")
    print("img/apple-touch-icon.png")


def game_slingor() -> None:
    W, H = 1280, 720
    img = space_bg(W, H, 7)
    d = ImageDraw.Draw(img)
    glow(img, (W * 0.22, H * 0.38), 260, (251, 191, 36), 130)
    glow(img, (W * 0.22, H * 0.38), 140, (255, 250, 220), 200)
    d = ImageDraw.Draw(img)
    d.ellipse((W * 0.22 - 300, H * 0.38 - 300, W * 0.22 + 300, H * 0.38 + 300),
              outline=C_VIOLET + (150,), width=2)
    d.ellipse((W * 0.22 - 430, H * 0.38 - 430, W * 0.22 + 430, H * 0.38 + 430),
              outline=C_CYAN + (110,), width=2)
    d.ellipse((W * 0.66, H * 0.16, W * 0.66 + 150, H * 0.16 + 150), fill=(124, 58, 237))
    d.ellipse((W * 0.66 + 40, H * 0.16 + 38, W * 0.66 + 108, H * 0.16 + 108), fill=(167, 139, 250))
    d.ellipse((W * 0.60, H * 0.60, W * 0.60 + 92, H * 0.60 + 92), fill=(8, 145, 178))
    d.ellipse((W * 0.60 + 26, H * 0.60 + 22, W * 0.60 + 68, H * 0.60 + 68), fill=(103, 232, 249))
    sx, sy = W * 0.47, H * 0.52
    glow(img, (int(sx), int(sy)), 26, C_CYAN, 160)
    d.polygon([(sx + 16, sy), (sx - 12, sy - 9), (sx - 7, sy + 9)],
              fill=C_WHITE + (255,))
    img.convert("RGB").save(IMG / "game-slingor.png", "PNG")
    print("img/game-slingor.png")


def game_tblocks() -> None:
    W, H = 1280, 720
    img = vgrad(W, H, (18, 24, 46), (8, 11, 24)).convert("RGBA")
    glow(img, (W * 0.5, H * 0.35), 360, C_VIOLET, 90)
    glow(img, (W * 0.5, H * 0.35), 180, C_CYAN, 80)
    d = ImageDraw.Draw(img)
    for x in range(0, W, 64):
        d.line((x, 0, x, H), fill=(24, 31, 58, 255), width=2)
    for y in range(0, H, 64):
        d.line((0, y, W, y), fill=(24, 31, 58, 255), width=2)
    cell = 56
    pieces = [
        ((4, 2), [(0, 0), (1, 0), (0, 1), (1, 1)], C_CYAN),
        ((3, 1), [(0, 1), (1, 1), (2, 1), (2, 0)], C_VIOLET),
        ((8, 1), [(0, 1), (1, 1), (2, 1), (2, 2)], C_MAGENTA),
        ((6, 4), [(0, 0), (1, 0), (2, 0), (1, 1)], (74, 222, 128)),
        ((10, 3), [(0, 1), (1, 0), (1, 1), (2, 1)], (251, 191, 36)),
        ((1, 4), [(0, 1), (0, 2), (1, 2), (2, 2)], (248, 113, 113)),
    ]
    for (col0, row0), cell_list, col in pieces:
        base_x, base_y = col0 * cell, row0 * cell
        for cx, cy in cell_list:
            sx = base_x + cx * cell + 7
            sy = base_y + cy * cell + 9
            d.rounded_rectangle((sx, sy, sx + cell - 5, sy + cell - 5), 8,
                                fill=(0, 0, 0, 140))
        for cx, cy in cell_list:
            x = base_x + cx * cell
            y = base_y + cy * cell
            d.rounded_rectangle((x, y, x + cell - 5, y + cell - 5), 8,
                                fill=col + (255,))
            d.rectangle((x + 6, y + 6, x + cell - 12, y + cell - 12), fill=col + (140,))
    img.convert("RGB").save(IMG / "game-tblocks.png", "PNG")
    print("img/game-tblocks.png")


def game_dungeon() -> None:
    W, H = 1280, 720
    img = vgrad(W, H, (16, 16, 28), (6, 7, 14)).convert("RGBA")
    glow(img, (W * 0.5, H * 0.5), 420, C_VIOLET, 90)
    img = Image.alpha_composite(img, stars(W, H, 200, 3))
    d = ImageDraw.Draw(img)
    brick_h, brick_w = 34, 64
    row = 0
    y = 40
    while y < H - 130:
        row += 1
        x = 0 if row % 2 else -brick_w // 2
        while x < W + brick_w:
            d.rectangle((x, y, x + brick_w - 3, y + brick_h - 3),
                        fill=(34, 34, 52, 255), outline=(22, 22, 38, 255))
            x += brick_w
        y += brick_h
    dw, dh = 240, 340
    cx = W // 2
    for r in range(14, 0, -1):
        a = max(90 - r * 5, 0)
        d.rounded_rectangle((cx - dw / 2 - r, H - dh - 10 - r, cx + dw / 2 + r, H),
                            radius=120, fill=(139, 60, 240, a))
    door = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dd = ImageDraw.Draw(door)
    dd.rounded_rectangle((cx - dw / 2, H - dh - 10, cx + dw / 2, H), radius=90,
                         fill=(16, 14, 34, 255))
    dd.rounded_rectangle((cx - dw / 2 + 14, H - dh + 6, cx + dw / 2 - 14, H),
                         radius=86, fill=(24, 22, 46, 255))
    img = Image.alpha_composite(img, door)
    d = ImageDraw.Draw(img)
    d.arc((cx - dw / 2 - 40, H - dh - 50, cx + dw / 2 + 40, H - dh + 250), 0, 180,
          fill=C_CYAN + (150,), width=3)
    glow(img, (int(cx - dw / 2 - 20), H - 120), 140, C_MAGENTA, 60)
    glow(img, (int(cx + dw / 2 + 20), H - 120), 140, C_MAGENTA, 60)
    img.convert("RGB").save(IMG / "game-dungeon.png", "PNG")
    print("img/game-dungeon.png")


def main() -> None:
    make_og("og.png", "4AYKA STUDIO", "браузерные игры · мультиплеер · рогалики · инструменты", seed=5)
    make_og("og-blog.png", "БЛОГ", "про геймдев, браузерные игры и инструменты разработчика", seed=11)
    make_icons()
    game_slingor()
    game_tblocks()
    game_dungeon()


if __name__ == "__main__":
    main()