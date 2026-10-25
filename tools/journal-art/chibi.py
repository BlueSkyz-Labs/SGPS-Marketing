# Chibi author portrait (Owner choice 2026-10-25, option L): a flat vector
# drawing of the author's recognisable features (soft-rectangle glasses,
# side-parted hair, broad smile, suit and cobalt tie). It uses no photo pixels
# and no model, so it rebuilds byte-for-byte from this file alone.
import sys
from PIL import Image, ImageDraw
out = sys.argv[1]
N = 1024
INK = (11, 16, 32); NAVY = (24, 38, 96); COBALT = (37, 100, 255)
SKY = (132, 166, 255); PALE = (214, 224, 255); POR = (247, 248, 250)
SKIN = (240, 214, 196); SKIN2 = (222, 186, 166); BLUSH = (246, 170, 170)
HAIR_LIGHT = (60, 70, 100); MOUTH = (150, 40, 60); WHITE = (255, 255, 255)


def k(v):
    return int(v * 2)


def P(x, y):
    return (k(N * x), k(N * y))


im = Image.new("RGB", (N * 2, N * 2), POR)
d = ImageDraw.Draw(im)
d.ellipse((*P(.06, .08), *P(.94, .96)), fill=PALE)
d.ellipse((*P(.12, .16), *P(.20, .24)), fill=COBALT)
d.ellipse((*P(.82, .22), *P(.87, .27)), fill=SKY)
# body: suit, shirt V, tie
by = .74
d.rounded_rectangle((*P(.31, by), *P(.69, 1.08)), radius=k(80), fill=NAVY, outline=INK, width=k(8))
d.polygon([P(.44, by), P(.56, by), P(.5, by + .13)], fill=(252, 252, 255), outline=INK)
d.polygon([P(.489, by + .02), P(.511, by + .02), P(.52, by + .11), P(.5, by + .15), P(.48, by + .11)],
          fill=COBALT, outline=INK)
# neck and ears
d.rectangle((*P(.46, .68), k(N * .54), k(N * by) + 4), fill=SKIN2, outline=INK, width=k(6))
for ex in (.215, .785):
    d.ellipse((*P(ex - .045, .42), *P(ex + .045, .53)), fill=SKIN, outline=INK, width=k(7))
# head
d.ellipse((*P(.22, .17), *P(.78, .75)), fill=SKIN, outline=INK, width=k(8))
# hair: volume on top, side part
hair = [(.22, .40), (.21, .30), (.26, .20), (.36, .13), (.50, .10), (.63, .12), (.73, .17), (.79, .27),
        (.79, .40), (.75, .33), (.70, .27), (.60, .25), (.47, .27), (.38, .25), (.31, .29), (.27, .36)]
d.polygon([P(x, y) for x, y in hair], fill=INK)
d.line([P(.47, .13), P(.40, .24)], fill=HAIR_LIGHT, width=k(5))
d.line([P(.60, .14), P(.68, .24)], fill=HAIR_LIGHT, width=k(5))
# glasses: soft rectangles like the real frames
for x0 in (.29, .52):
    d.rounded_rectangle((*P(x0, .40), *P(x0 + .19, .51)), radius=k(26), fill=WHITE, outline=INK, width=k(10))
d.line((*P(.48, .435), *P(.52, .435)), fill=INK, width=k(9))
d.line((*P(.23, .43), *P(.29, .42)), fill=INK, width=k(8))
d.line((*P(.71, .42), *P(.77, .43)), fill=INK, width=k(8))
# smiling eyes, blush, broad smile with teeth
for cx in (.385, .615):
    d.arc((*P(cx - .045, .43), *P(cx + .045, .49)), 200, 340, fill=INK, width=k(9))
for cx in (.31, .69):
    d.ellipse((*P(cx - .045, .54), *P(cx + .045, .58)), fill=BLUSH)
d.chord((*P(.40, .52), *P(.60, .66)), 0, 180, fill=MOUTH, outline=INK, width=k(8))
d.chord((*P(.415, .525), *P(.585, .60)), 0, 180, fill=WHITE)
img = im.resize((N, N), Image.LANCZOS)
# circular crop + thin cobalt ring (same frame as the previous portrait)
big = Image.new("L", (N * 2, N * 2), 0)
ImageDraw.Draw(big).ellipse((0, 0, N * 2 - 1, N * 2 - 1), fill=255)
av = Image.new("RGBA", (N, N), (0, 0, 0, 0))
av.paste(img, (0, 0), big.resize((N, N), Image.LANCZOS))
ring = Image.new("RGBA", (N * 2, N * 2), (0, 0, 0, 0))
ImageDraw.Draw(ring).ellipse((6, 6, N * 2 - 7, N * 2 - 7), outline=COBALT + (255,), width=10)
av = Image.alpha_composite(av, ring.resize((N, N), Image.LANCZOS))
av.save(out + "/chibi-1024.png")
for s in (512, 256, 96):
    r = av.resize((s, s), Image.LANCZOS)
    r.save(f"{out}/tony-nguyen-{s}.png"); r.save(f"{out}/tony-nguyen-{s}.webp", quality=90, method=6)
