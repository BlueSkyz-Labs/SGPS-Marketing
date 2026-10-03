# v11: Journal (news + real product updates) with SEO (SGPS-Marketing)

**Status:** **APPROVED — QUEUED.** It starts after v9 go-live.

- **Approval source:** Owner plan-delegation ("Nếu là plan tự duyệt theo mục tiêu dự án"), plus the Owner answers of 2026-10-03, 17:10 GMT+7 recorded in §1.
- **The delegation covers:** plan approval and routine reversible work inside this plan.
- **It does not cover:**
  - publishing any post: every post needs Owner approval (§5);
  - product facts, screenshots and release existence;
  - the `owner-approved` label;
  - Search Console access.

**Date:** 2026-10-03
**Baseline:** `main@5b76df4`.

**Relationship to other plans:**

- v9 keeps priority until go-live, and v10 Track A continues in parallel.
- v11 **unblocks C3-F Living Release Publication** (`docs/superpowers/plans/2026-09-13-c3-f-living-release-publication.md`, state `BLOCKED` on a missing release source, `docs/evidence/2026-09-25-c3f-release-source-blocked.md`). It reuses the merged release-story schema (`src/lib/release-schema.ts`, PR #266) and does not create a second one.
- v9 §8 and v10 §7 apply unchanged and stay mandatory.

> **MANDATORY FOR EVERY AGENT.** Before any action, read v9 §8, then v10 §7, then §7 of this file, then your card in §8. If they conflict, v9 §8 wins, then v10 §7, then v11 §7.

## 1. Owner decisions (2026-10-03)

| Question          | Owner answer                                                                | Consequence                                                                                                                                                                   |
| ----------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Goal              | **Both equally:** marketing/PR (company trust) **and** search traffic (SEO) | Two content streams with equal priority (§2)                                                                                                                                  |
| Who and how often | **The agent drafts, the Owner approves; 2 posts per month**                 | Drafts arrive as PRs. No post merges without the Owner's explicit approval comment. The cadence target is 2 per month, and a missed month is better than a filler post (§7.4) |
| Structure         | **Two branches:** (1) news and updates; (2) real product updates            | Section IA in §3                                                                                                                                                              |
| Languages         | **VI + EN for every post**                                                  | Every post ships as a VI and EN pair with hreflang. zh / zh-Hant are **not** produced, because there is no native reviewer (O-10.6)                                           |

**Open interpretation to confirm:** "Tôi soạn nháp, anh duyệt" was the label of the option "the agent drafts, the Owner approves". This plan assumes that meaning.

## 2. Why it fits, and the boundary (with sources)

**Benefit:**

- Google's ranking systems aim to reward original, helpful, people-first content that shows experience and expertise (E-E-A-T). Sources: [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) and [the helpful content update](https://developers.google.com/search/blog/2022/08/helpful-content-update), retrieved 2026-10.
- Real product work by a Vietnam-first team is that kind of first-hand material.

**Hard boundary:**

- Generating many pages mainly to manipulate rankings is **scaled content abuse**, whether it is made by automation, by people or by both. Using generative AI to make many pages without added value can violate it. Sources: [Spam policies](https://developers.google.com/search/docs/essentials/spam-policies) and [Generative AI content guidance](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content), retrieved 2026-10.
- Hence §7: few posts, real facts and human approval.

**Structured data:**

- Use `BlogPosting` with `datePublished` and `dateModified`.
- The structured dates must match the visible dates.
- Source: [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article), retrieved 2026-10.

**Honest limits:**

- Release notes rarely attract search traffic by themselves. Search traffic comes from topic posts that match what people search.
- **There is no keyword data yet.** The topic list in §4 is a hypothesis until Search Console or keyword research confirms it (O-11.3).
- SEO effects take months.
- The site has no analytics by design (RUM is OFF, v10 O-10.3), so **Search Console is the only measurement**.

## 3. Information architecture

| Branch                                     | VI path                        | EN path                       | Content                                                                                                                                                  | Source of truth                                                                                                                                                     |
| ------------------------------------------ | ------------------------------ | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Section index                              | `/vi/nhat-ky/`                 | `/en/journal/`                | Both branches, newest first, with a filter by branch (static, no JS required)                                                                            | derived                                                                                                                                                             |
| **1. Tin tức & cập nhật** (News)           | `/vi/nhat-ky/tin-tuc/<slug>/`  | `/en/journal/news/<slug>/`    | Company and project news (site launch, milestones, how we build, security and privacy practice) **and** topic posts for landlords and private journaling | Owner-approved facts. Every factual claim links to evidence or a source (the Verify pattern)                                                                        |
| **2. Cập nhật sản phẩm** (Product updates) | `/vi/nhat-ky/san-pham/<slug>/` | `/en/journal/product/<slug>/` | Real releases of Sổ Trọ and Sổ Tâm: version, date, what changed, why it matters, real screenshot                                                         | **The C3-F release-story schema**, fed by an Owner-approved public release record (J2). It never comes from `ai/05_AI_CHANGELOG.md`, which is an internal agent log |

- The slug and the localized path labels are final only after the Owner reviews them in the J1 PR.
- **Header:** add the journal to the primary navigation only after it holds at least 2 approved posts (§7.4). Before that, link it from the footer only.

## 4. Editorial plan (hypothesis; confirm with data at O-11.3)

- **News stream** (trust, PR):
  1. "BlueSkyz Labs ra mắt website" at go-live;
  2. "Cách chúng tôi kiểm chứng mọi tuyên bố" (the Verify and claims model);
  3. "Không cookie, không analytics: vì sao" (privacy choice).
- **Topic stream** (SEO, landlord intent; candidates only):
  - how to compute tiered electricity charges for rooms;
  - tracking unpaid rent;
  - receipts and confirming money received;
  - local-first private journaling.
  - **Each must state only facts the product actually does** (the product registry and showcase) and cite sources for any regulation or tariff. Tariffs change, so each such post carries an "as of" date.
- **Product stream:** one post per real public release that the Owner approves. If no release happens in a month, there is no product post that month.

## 5. Editorial workflow (each post is one PR)

1. **Source pack:**
   - the agent collects the facts with their sources: product registry, showcase, merged product PRs, the approved release record and public references;
   - any claim without a source is cut.
2. **Draft:**
   - the agent writes the VI and EN versions;
   - Vietnamese is the primary voice, and EN is a faithful adaptation, not a literal translation;
   - no invented quotes, metrics, users, prices or dates (AGENTS hard rules).
3. **Checks:**
   - a schema validation test, a public-truth test, link check and SEO lane (E5);
   - copy hygiene, with no elite or certification wording (v10 §7.1).
4. **Owner review:**
   - the PR body lists every factual claim with its source, plus an "AI-assisted draft, reviewed by Owner" disclosure note;
   - the Owner comments "duyệt" (approve) or requests changes;
   - **no approval, no merge.**
5. **Publish:**
   - merge, then Cloudflare Workers Builds deploys;
   - the sitemap, RSS and `dateModified` update automatically.
6. **Distribute (Owner-run, optional):** share to the Owner's channels (Facebook groups, Zalo, LinkedIn). Agents do not post to external services.

## 6. Technical design

- **Content collection** `src/content/journal/` (Markdown or MDX-free Markdown). Frontmatter:
  - `id`, `branch: news|product`, `lang: vi|en`, `translationOf` (pairing);
  - `title`, `description`, `datePublished`, `dateModified`;
  - `sources[]` (public URLs or evidence ids), `ownerApproval` (the PR number of the approval);
  - for `branch: product`: the `releaseStory` reference validated by `parseReleaseStory`.
  - Validation is strict and fails the build when a field is missing or unpaired.
- **Pages:** static Astro routes per branch and language. The index is a server-rendered list with a CSS-only or `<a>`-based branch filter, and **adds 0 KB of client JS**.
- **SEO:**
  - canonical and reciprocal hreflang (VI↔EN only; zh omitted);
  - `BlogPosting` JSON-LD with visible matching dates and `author` = BlueSkyz Labs;
  - breadcrumb, `og:` tags, the existing OG card;
  - sitemap entries with `lastmod` = `dateModified`;
  - `/vi/nhat-ky/rss.xml` and `/en/journal/rss.xml`.
- **Budgets:** journal routes join the DEC-025 performance budget routes and the E5 SEO lane. The E3 visual gate covers the index once it exists.
- **No new third parties:** no comments widget, no newsletter provider, no embeds (CSP unchanged).

## 7. v11 additions to the agent contract (MANDATORY)

1. **Facts only from sources.** Every factual sentence must trace to a source listed in the PR body. If it cannot be traced, cut it.
2. **No release without a record.** A product post requires an approved public release record (J2). An internal changelog, a commit list or a version number in `package.json` is not a release record.
3. **Owner approval is the publish gate.** An agent never merges a journal post without an explicit Owner approval comment on that PR. CI green is not approval.
4. **No filler.** Never pad the cadence with low-value posts. A missed month is acceptable and scaled content is not (§2). Never mass-generate topic pages.
5. **Pairing.** A post merges only with both VI and EN versions, and each must pass the checks.
6. **Dates are real.** `datePublished` is the merge date; `dateModified` changes only for a substantive edit, which is listed in a visible "Updated" note.

## 8. Task cards (serial; one PR each)

| Card   | Goal                                                                                                                                                                                                                                                                                                                                                                              | Owner of work                                                                        | Protected?                                                                                                      | Preconditions                      |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **J0** | Search Console readiness: a checklist for the Owner (DNS TXT verification, sitemap submission). No code.                                                                                                                                                                                                                                                                          | orchestrator → Owner                                                                 | no                                                                                                              | go-live                            |
| **J1** | Journal foundation: collection schema with strict validation, routes, index, RSS, sitemap, hreflang, JSON-LD and footer link. Ships with **0 posts**: empty state, `noindex` on the empty index, not in the sitemap until the first post                                                                                                                                          | orchestrator or local agent                                                          | likely yes (`scripts/` for the RSS or sitemap generator, `package.json` only if a dependency is needed — avoid) | E5 merged (the SEO lane covers it) |
| **J2** | Release record contract (unblocks C3-F Task 2): define the public release record in the **product repo** (for example a `releases/` file per version with date, user-facing changes and screenshot ids) and the adapter in Marketing that maps it through `parseReleaseStory`. Fixture tests plus negative proofs (unknown product, future date, internal path, missing evidence) | orchestrator (Marketing side); Owner approves the record format in the product repos | Marketing: no. Product repos: per their own rules                                                               | J1                                 |
| **J3** | First news post (launch), VI and EN, through §5                                                                                                                                                                                                                                                                                                                                   | orchestrator drafts; Owner approves                                                  | no                                                                                                              | J1, go-live done                   |
| **J4** | First product post: the first approved Sổ Trọ release record (for example 1.1.0, **only if** the Owner confirms that it is a public release and approves its notes)                                                                                                                                                                                                               | orchestrator drafts; Owner approves                                                  | no                                                                                                              | J2, Owner release record           |
| **J5** | First topic post (from §4 once O-11.3 data exists, otherwise the Owner's pick)                                                                                                                                                                                                                                                                                                    | orchestrator drafts; Owner approves                                                  | no                                                                                                              | J1                                 |
| **J6** | After 2 approved posts: header navigation entry, plus a C3-F homepage or product-page "latest update" signal (C3-F Task 4)                                                                                                                                                                                                                                                        | local agent                                                                          | no                                                                                                              | at least 2 posts merged            |
| **J7** | 90-day review: Search Console impressions and clicks per post, keep or adjust the topic list (evidence record)                                                                                                                                                                                                                                                                    | orchestrator with Owner data                                                         | no                                                                                                              | J0 + 90 days                       |

## 9. Owner gates

| ID     | Gate                                                                                                                                          | Type                  |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| O-11.1 | Approve each post (comment "duyệt" on its PR)                                                                                                 | Owner, per post       |
| O-11.2 | Approve the public release record format in the Sotro and sotam repos, and confirm which existing version, if any, counts as a public release | Owner (Product Truth) |
| O-11.3 | Set up Google Search Console (DNS TXT) and share query data monthly (the agent has no GSC tool)                                               | Owner                 |
| O-11.4 | Confirm the VI and EN section names and path slugs (in the J1 PR)                                                                             | Owner                 |

## 10. Red-team of this plan

| Attack                                         | Finding                                                                                | Treatment                                                                                                                  |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| "AI drafts will read generic and rank nothing" | Real risk: the same family of models reviews and drafts.                               | Source pack first; Owner edits voice; no topic without a real product fact; the 90-day J7 data decides                     |
| "Cadence collapses, section looks dead"        | The most likely failure. 2 posts per month at 2 languages is ~4 Owner reviews a month. | Footer-only until 2 posts exist; the index shows dates honestly; a missed month is allowed and no filler is written (§7.4) |
| "Product posts inflate minor changes"          | The C3-F doctrine forbids that.                                                        | The schema's `significance` field comes from the Owner record, never from the agent                                        |
| "EN duplicates VI and dilutes SEO"             | Not with correct hreflang. Each URL is the canonical page for its own language.        | Reciprocal hreflang guard (existing `hreflang-contract`), extended to journal paths                                        |
| "Regulation or tariff facts go stale"          | Electricity tariffs and regulations change.                                            | An "as of" date plus a cited source on every such fact; `dateModified` changes on any correction                           |
| "No measurement without analytics"             | True.                                                                                  | GSC (O-11.3) is required before J7. Without it, SEO impact stays **NOT VERIFIED**                                          |

## 11. Exit

- **Foundation done:** J1 and J2 merged, guards with negative proofs, and C3-F Task 2 is no longer BLOCKED.
- **Running:** at least 2 posts per month for 3 months, or Owner-accepted gaps.
- **Measured:** the J7 review is merged with GSC data.
