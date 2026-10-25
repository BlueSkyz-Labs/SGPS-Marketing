# Public content standard (mandatory)

**Status:** MANDATORY. Owner directive, 2026-10-25 (GMT+7).
**Applies to:** every article on the site (`src/content/journal/`, and
`src/content/blog/` when it exists) and every customer-facing sentence that
ships with one: title, deck, captions, alt text, UI labels, share text.
**Sits beside:** `JOURNAL_PRESS_STANDARD.md` (presentation, art, rights) and
the claim and truth gates. Where they overlap, the stricter rule wins.
**Enforced by:** the checks in `tests/architecture/public-content-standard.test.mjs`
(C3, C5) plus the review record in C8. Rules without an automated check are
still mandatory; the PR that publishes a post carries the evidence.

Owner's words: "các bài viết trên web cần đạt chuẩn marketing global top tier
elite global, chuẩn hóa cao nhất, áp dụng các global best practice hiện đại
mới nhất". And (2026-10-25): every item faces customers and users, so wording
and information are polished before and after publication.

"Top tier" is the bar we hold ourselves to. It is never a word we print about
ourselves (C3).

## C1 — Reader first

1. Each post answers one question a landlord, user or customer actually has,
   and says in the first paragraph what they will get from it.
2. It passes Google's people-first self-assessment: original information or
   analysis, a complete answer, more value than other pages on the topic, and
   careful production. Source: Google Search Central, "Creating helpful,
   reliable, people-first content".
3. No post exists to rank. Generated or templated pages without added value
   are not published (Google Search Central, "guidance on using generative AI
   content").

## C2 — Plain, natural language

1. Follow the plain-language principles of ISO 24495-1:2023: readers find what
   they need, understand it on first read, and can act on it.
2. Vietnamese reads as written by a Vietnamese editor: correct diacritics, no
   word-for-word calques of English (for example "ghi nhận" for "record",
   "bản dựng" for "build"), short sentences, warm and respectful tone.
3. English is plain international English: short sentences, active voice, no
   idioms that do not translate.
4. One term per concept across a post and across languages, matching the
   product pages (for example "chủ trọ", "chưa đóng tiền trọ").
5. Jargon a customer would not know (an internal product word, a form code
   such as C06) is explained in the sentence or removed.

## C3 — Truthful claims only (checked)

1. Every fact, number, date and quote traces to a listed source or to repo
   truth; nothing is added in polishing.
2. No unsupported superlative or self-praise in published text: the banned
   list in the test (for example "tốt nhất", "đơn giản nhất", "hàng đầu",
   "số 1", "the best", "the simplest", "world-class", "top tier", "elite";
   extended by the Owner on 2026-10-25 with "vượt trội", "duy nhất",
   "toàn diện", "cách mạng", "unique", "seamless", "powerful",
   "revolutionary", "cutting-edge").
   A superlative that a source proves is quoted and attributed instead.
3. A source is called "official" (chính thức) only when it is a government or
   issuing-body publication.
4. Preview, in-development and test states are named as such; screenshots
   say what they show (sample data, test build) per the showcase truth rules.

## C4 — VI and EN are one article

Posts ship as a VI + EN pair with the same facts, structure, sources and
claims. Neither language may say more than the other. zh / zh-Hant UI copy is
labelled machine-assisted until a native review.

## C5 — Search and sharing (checked where noted)

1. Title: specific, front-loads the topic, at most 80 characters (checked).
2. Deck (`description`): one or two full sentences, 110 to 170 characters
   (checked). It is also the meta description and share text.
3. Article structured data names the author with a link to the author page,
   and carries `datePublished` and `dateModified` (Google Search Central,
   Article structured data, author best practices).
4. Images have specific alt text; captions say what the image is and when it
   was captured.

## C6 — Accessible and fast

WCAG 2.2 AA on the rendered page, readable at 320 px, and within the existing
performance budget. Neither may be relaxed for a post.

## C7 — AI assistance

AI may help with research and structure. A person checks every fact against
the sources and edits every sentence before publication. `aiAssisted` stays a
truthful record in frontmatter.

## C8 — Review before and after publication

Before: the publishing PR records, for each language, a completed checklist:
C1 to C7 passed, an independent copy review (a reviewer lane or a person who
did not write it) with its findings resolved, and the Owner's approval of the
post.

After: within 24 hours of a deploy, read the live page in both languages as a
customer would (text, images, links, share card) and fix what is wrong in a
follow-up PR. Re-read every post when a cited rule, price, product state or
source changes, and at least every quarter; update `dateModified` only when
the content changes.
