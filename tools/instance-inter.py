#!/usr/bin/env python3
"""Reproducibly derive the site's Inter subsets from the upstream opsz+wght files.

Source: @fontsource-variable/inter@5.3.0 files/inter-{latin,vietnamese}-opsz-normal.woff2
(npm registry tarball; also the bytes committed as public/fonts/inter-*-opsz-v5.3.0.woff2
before v8 W9, see `git show 2e2cfa8:public/fonts/inter-latin-opsz-v5.3.0.woff2`).
Transform: pin opsz=14 (the axis default, i.e. text optical size; display headings use
Plus Jakarta Sans), clamp wght to 400-700 (the weights the site uses), keep cmap and all
layout features, drop hinting/gasp/STAT/MVAR. OFL 1.1 permits modification; the
"Inter" name is not a Reserved Font Name.

  pip install --user fonttools brotli
  python3 tools/instance-inter.py <upstream-opsz.woff2> public/fonts/inter-<subset>-wght-v5.3.0.woff2
"""
import io
import sys
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

src, dst = sys.argv[1:3]
font = instancer.instantiateVariableFont(TTFont(src), {"opsz": 14, "wght": (400, 700)})
opts = subset.Options()
opts.flavor = "woff2"
opts.layout_features = ["*"]
opts.hinting = False
opts.notdef_outline = True
opts.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]
opts.drop_tables += ["gasp", "STAT", "MVAR"]
buf = io.BytesIO()
font.save(buf)  # round-trip so glyph tables are fully loaded before subsetting
buf.seek(0)
font = TTFont(buf)
sub = subset.Subsetter(opts)
sub.populate(unicodes=list(font.getBestCmap().keys()))
sub.subset(font)
font.flavor = "woff2"
font.save(dst)
