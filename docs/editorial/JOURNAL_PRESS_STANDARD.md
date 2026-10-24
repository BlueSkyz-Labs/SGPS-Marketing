# Journal press standard (mandatory)

**Status:** MANDATORY. Owner directive, 2026-10-24 (GMT+7).
**Applies to:** every published post in `src/content/journal/` (Journey) and,
when it exists, `src/content/blog/`.
**Enforced by:** the journal content schema (`src/lib/journal-schema.ts`), the
art manifest guard (`tests/architecture/journal-press-standard.test.mjs`) and
the rendered-page check (`tests/e2e/journal-press-standard.spec.ts`). A post
that breaks a rule below does not build or does not pass CI.

Owner's words: "trong bài viết cần trình bày chuẩn như 1 tờ báo top tier elite,
có hình minh họa, infographic cuối bài tóm tắt, đóng dấu logo và bản quyền đặc
trưng của Blueskyzlabs, không chôm chỉa và dễ xóa logo, bản quyền". The avatar
is art, not the original photograph. The visible "Drafted with AI assistance"
line is not shown.

## R1 — Presentation: a top-tier newspaper page

1. Kicker (branch), headline, deck (the `description`), then a byline block:
   the dateline and the author's engraved portrait and name. The role and bio
   sit in the author card at the end.
2. A lead illustration directly under the byline, full reading width, with a
   caption and a credit line.
3. The first paragraph opens with a drop cap. Section heads are short and set
   in the display weight, separated by hairline rules.
4. An end-of-article summary infographic sits after the body and before the
   sources. Its content is a summary of the article only.
5. Sources, the author card and a copyright line (`© <year> BlueSkyz Labs`)
   close the article.

## R2 — Illustrations

1. Every published post has at least one lead illustration (`hero`) and one
   summary infographic (`infographic`) in its frontmatter.
2. Allowed: original art made by BlueSkyz Labs, diagrams and charts drawn from
   the article's own facts, and real product screenshots already published on
   the product page (their capture date stays in the caption).
3. Not allowed: stock or third-party images without a written licence,
   generated photographs of people or places presented as real, and any number,
   date or claim in an image that is not in the article text.
4. Every image has `alt` text in the post's language. Every fact an
   infographic shows also appears in the article text, so nothing is
   image-only; its alt text summarises those facts.

## R3 — Brand stamp and copyright, baked in

Every journal image is produced by `tools/journal-art/render.mjs` from a
template in `tools/journal-art/figures/`. The tool:

1. draws the BlueSkyz Labs logo **inside the artwork** (not as a CSS overlay),
   on the composition itself, so cropping a corner does not remove it;
2. lays a faint, repeated "© BlueSkyz Labs" micro-pattern across the whole
   image, so the mark cannot be removed by cropping or by a single clone patch;
3. prints a visible copyright line in the image;
4. writes XMP rights metadata: `dc:rights` (copyright notice), `dc:creator`,
   `photoshop:Credit`, `xmpRights:Marked=True` and `xmpRights:WebStatement`
   pointing at the post URL;
5. records each output's SHA-256 in `src/data/journal-art.json`.

The guard rejects a post whose `hero` or `infographic` (or their 1200 px and
share variants) is not in the manifest, a file whose hash differs from the
manifest or that lacks the rights metadata, and any file under
`public/images/journal/` that the manifest does not list. Hand-edited or
unstamped images fail. The hero's share render is the post's `og:image` and
the BlogPosting `image`; `copyrightHolder` is the BlueSkyz Labs organisation.

**Limit, stated honestly:** nothing on the public web prevents copying. The
stamp makes removal costly and proves origin; metadata can be stripped by
re-encoding, which is why the visible mark is the primary control.

## R4 — Originality ("không chôm chỉa")

1. Text is written for the post and cites its sources; no copied paragraphs.
2. Images follow R2. A screenshot of a third-party site is not used as art.
3. Quotes are short, attributed and linked.

## R5 — Author and AI

1. The byline names a registered author (`src/data/authors.ts`). The portrait is
   an engraving derived from a photo the Owner supplied, not the photo itself
   (`tools/journal-art/hedcut.py`, deterministic, no generative model). The
   portrait files carry no metadata at all: the author-photo privacy rule (no
   EXIF, XMP or ICC chunk) stays stricter than R3.
2. `aiAssisted` stays in frontmatter as a truthful internal record. It is not
   rendered on the page (Owner, 2026-10-24). Every fact is still human-checked
   against the listed sources before publication.

## R6 — Unchanged rules

Owner approval per post, VI + EN pairing, the claim gate, `NOT VERIFIED` for
anything unproven and the existing journal schema rules all still apply.
