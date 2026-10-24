# Line-engraving ("hedcut") portrait: horizontal ink lines whose width follows
# local tone, gently bent by the image gradient. Deterministic, no model.
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps
from scipy import ndimage as ndi
src, mask_p, out = sys.argv[1], sys.argv[2], sys.argv[3]
N = 1024; SC = 3; W = N*SC
im = Image.open(src).convert("L").resize((N, N), Image.LANCZOS)
mask = np.asarray(Image.open(mask_p).convert("L").resize((N, N))).astype(np.float32)/255
g = np.asarray(ImageOps.autocontrast(im, cutoff=1)).astype(np.float32)/255
g = ndi.gaussian_filter(g, 1.2)
# local contrast boost so features read at small sizes
blur = ndi.gaussian_filter(g, 18)
g = np.clip(0.5 + (g - blur)*1.9 + (blur-0.5)*0.9, 0, 1)
dark = np.clip((1 - g - 0.22) / 0.78, 0, 1) ** 1.1 * mask
edges = ndi.gaussian_gradient_magnitude(ndi.gaussian_filter(g, 2), 2)
dark = np.clip(dark + edges*mask*3.0, 0, 1)
bend = ndi.gaussian_filter(g, 10)     # bends lines over facial volume
canvas = Image.new("L", (W, W), 255); d = ImageDraw.Draw(canvas)
sp = float(sys.argv[4]) if len(sys.argv) > 4 else 7.0  # line spacing in 1024 space
y0 = 0.0
while y0 < N:
    pts_top, pts_bot = [], []
    for x in range(0, N, 2):
        yy = int(min(N-1, max(0, y0)))
        off = (bend[yy, x] - 0.5) * sp * 0.9
        y = y0 + off
        yi = int(min(N-1, max(0, y)))
        t = dark[yi, x] ** 1.15
        hw = 0.5 * sp * t * 0.92
        pts_top.append((x*SC, (y-hw)*SC)); pts_bot.append((x*SC, (y+hw)*SC))
    # split into runs where width is visible
    run_t, run_b = [], []
    for (pt, pb) in zip(pts_top, pts_bot):
        if pb[1]-pt[1] > 0.35*SC:
            run_t.append(pt); run_b.append(pb)
        else:
            if len(run_t) > 1: d.polygon(run_t + run_b[::-1], fill=0)
            run_t, run_b = [], []
    if len(run_t) > 1: d.polygon(run_t + run_b[::-1], fill=0)
    y0 += sp
art = canvas.resize((N, N), Image.LANCZOS)
a = np.asarray(art).astype(np.float32)/255     # 1 paper, 0 ink
ink = np.array([11, 16, 32], np.float32)       # --brand-ink
paper = np.array([238, 242, 255], np.float32)  # porcelain/cobalt tint
rgb = paper*a[..., None] + ink*(1-a[..., None])
img = Image.fromarray(rgb.astype(np.uint8))
# circular crop + thin cobalt ring
big = Image.new("L", (N*2, N*2), 0); ImageDraw.Draw(big).ellipse((0, 0, N*2-1, N*2-1), fill=255)
cm = big.resize((N, N), Image.LANCZOS)
av = Image.new("RGBA", (N, N), (0, 0, 0, 0)); av.paste(img, (0, 0), cm)
ring = Image.new("RGBA", (N*2, N*2), (0, 0, 0, 0))
ImageDraw.Draw(ring).ellipse((6, 6, N*2-7, N*2-7), outline=(37, 100, 255, 255), width=10)
av = Image.alpha_composite(av, ring.resize((N, N), Image.LANCZOS))
av.save(out + "/hedcut-1024.png")
for s in (512, 256, 96):
    r = av.resize((s, s), Image.LANCZOS)
    r.save(f"{out}/tony-nguyen-{s}.png"); r.save(f"{out}/tony-nguyen-{s}.webp", quality=90, method=6)
