# v9: completion and go-live plan (SGPS-Marketing)

**Status:** Active. This plan supersedes the v8 HANDOFF §2–§3 for the remaining work.
**Date:** 2026-10-02
**Baseline:** `main@cb5f9fe` (v8 W1–W11 merged; W11 evidence in `docs/evidence/2026-10-01-experience-v8-verification.md`)
**Roles:**

- The orchestrator (cloud) owns verification, planning and architecture review.
- The local coding agent owns implementation.
- The Owner owns the gates in §5.
  **Routing:** `.claude/AGENT_ROUTING.md`. **Contract:** v8 plan §5 still applies (copy deck, glossary §5.3, PASS / FAIL / NOT VERIFIED).

## 0. Definition of done

The site is **LIVE** when every item below is true and bound to an exact SHA in a go-live evidence record:

1. Every in-scope PR in §2 is merged or explicitly closed with a reason.
2. `main` is green on the four-engine push matrix and on Lighthouse CI.
3. Cloudflare Access is lifted for public routes, and the production smoke in §3 is PASS against `https://blueskyzlabs.com`.
4. No Owner gate in §5 that blocks go-live is still open.

`PLAN COMPLETE ≠ PROJECT COMPLETE`: §4 lists the post-go-live work that keeps the project open.

## 1. Sequencing

```
A. Land open PRs (serial)  →  B. Owner-decision copy  →  C. Pre-cutover verification
        →  D. Owner cutover (Access, 502s)  →  E. Production smoke + indexing  →  F. Post-go-live
```

**Merge rules:**

- Merge one PR at a time and update branches by merging main (never rebase).
- Protected-path PRs are merged by hand after the Owner adds the label. Never enable auto-merge on them.

## 2. Workstream A: land open PRs (local agent)

| Order | PR                                                                       | Kind                                      | Action                                                                                                                                                 | Acceptance                                                                |
| ----- | ------------------------------------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| A1    | #368 provenance                                                          | protected, labelled                       | CI is re-running after the import fix (87be87c). Merge when green.                                                                                     | 4-engine push run on main green                                           |
| A2    | #367 deploy-evidence binding                                             | protected, labelled                       | Update branch, fix merge drift like A1, merge                                                                                                          | same                                                                      |
| A3    | #371 rollback payment floor                                              | protected, labelled                       | same                                                                                                                                                   | same                                                                      |
| A4    | #405 end PR speed lane                                                   | protected, labelled                       | Merge **after** A1–A3: it makes every later PR run all four engines                                                                                    | the next PR shows 4 real shards                                           |
| A5    | **#440 vs #441** (both fix F-06)                                         | protected                                 | **Dedupe.** Keep #440 (it also carries OG-12 and F-04) and close #441 with a pointer. #440 needs the Owner label.                                      | `E2E_PROJECT=bogus node scripts/run-e2e.mjs` exits 2; redirect test green |
| A6    | owner-decision copy PR (1A–4A, branch `copy/v8-owner-decisions`)         | content                                   | Orchestrator reviews the VI copy, then merges                                                                                                          | see §2.1                                                                  |
| A7    | #364 astro 7.3.5, #365 dev-deps                                          | dependabot (patch/minor)                  | Update branch, merge when green                                                                                                                        | audit clean; Lighthouse CI green                                          |
| A8    | #436 log artifacts, #437 paid go-live hardening, #374 Playwright OCI pin | protected, **not this plan's authorship** | Review only, and report the findings to the Owner. Marketing is not a payment authority (Owner D-0), so #437 must not add payment surface to the site. | Owner decides                                                             |
| A9    | #406 BK-31 raster icons                                                  | protected, unlabelled                     | Owner decision, post-go-live (prior Owner decision)                                                                                                    | —                                                                         |

### 2.1 Acceptance for A6 (Owner decisions 2026-10-02: 1A 2A 3A 4A)

- The VI H1 reads exactly "Chúng tôi xây dựng sản phẩm thông minh, giúp con người làm chủ và nâng tầm cách làm việc." `grep` finds 0 occurrences of the old sentence in `src/` and `dist/`.
- Sổ Tâm: no AI wording, the art stays hidden, and no `audience` appears in the visible page or the JSON-LD. A test guards this, with a negative proof.
- `ProductLadder` shows the current stage only (already true; no change).
- About page: the "One house" block is gone in all four locales, and abt-5 "What you can check" is present. Every listed item links to an existing bound claim, and the publishability gate is green.

## 3. Workstream C+E: verification (orchestrator) and production smoke

### C. Pre-cutover verification

**Status:** PASS on `main@aa5f21a` (`docs/evidence/2026-10-03-golive-precutover.md` and its orchestrator addendum).

Run this after A1–A7 merge, on the merged SHA. It is a W11 phase-3 delta: re-run only what changed since `20ee92be`.

- axe on the routes touched by #438, A6 and #440, in both themes.
- The VI glossary sweep on `dist/`.
- 4-engine CI (real shards once #405 is in) and Lighthouse CI.
- The redirect matrix: every `public/_redirects` rule checked with the built worker (`wrangler dev` or a local Workers preview), including the asset-safety negatives.
- Evidence goes in `docs/evidence/2026-10-xx-golive-precutover.md`.

### E. Production smoke (after the Owner lifts Access)

Run against `https://blueskyzlabs.com`:

- HTTP 200 on every sitemap URL.
- Headers match `public/_headers`: CSP, HSTS without `includeSubDomains` until the 502s are fixed, COOP/CORP, `X-Content-Type-Options`.
- 301 matrix for the legacy and locale-root routes.
- `robots.txt` and the sitemap are reachable, and `noindex` is removed from the production build.
- No 4xx/5xx for assets on the 4 Lighthouse routes.
- One production Lighthouse mobile run per route (field-like; PASS needs LCP ≤ 2.5 s).

Then:

- Request indexing (Owner's Search Console).
- Write `docs/evidence/2026-10-xx-golive-production-smoke.md`.
- Update `docs/current-work.json`.

**Before cutover**, every production item is `NOT VERIFIED`.

## 4. Workstream F: post-go-live (keeps the project open)

| ID  | Work                                                                                                                                                                                                                                                                                          | Owner of decision                 | Notes                                                       |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------- |
| F1  | HSTS `includeSubDomains` + preload, after every subdomain under the zone serves valid HTTPS                                                                                                                                                                                                   | Owner (DNS)                       | SGPS lesson L15                                             |
| F2  | Native zh / zh-hant review of the v8 strings (deck suggestions, palette keywords, "Back to top", "sample data")                                                                                                                                                                               | Owner / native reviewer           | NOT VERIFIED today                                          |
| F3  | Human E4: 3–5 real visitors per primary task (understand the studio, find Sổ Trọ status, verify a claim), recorded per the experience contract                                                                                                                                                | Owner                             | Agent walkthroughs are preflight only                       |
| F4  | Field CWV: CrUX/RUM once traffic exists; the RUM privacy decision is pending in `current-work.json`                                                                                                                                                                                           | Owner                             | The "no cookies" claim must stay true                       |
| F5  | Discovery packets P1 (legal identity facts), P2 (printable sheet pilot), P4 (Decree 133 research), P6 (consolidate trust tools)                                                                                                                                                               | Owner                             | from #415                                                   |
| F6  | Sổ Tâm art without the AI tagline (brand kit edit) → re-show the art                                                                                                                                                                                                                          | Owner + brand kit                 | OG-3 = A                                                    |
| F7  | BK-31 raster icons #406                                                                                                                                                                                                                                                                       | Owner label                       |                                                             |
| F8  | The CSS headroom guard (the ≤2200 ms local LCP rule) is unbindable on contended hosts (W11 F-07). Replace it with a CI-relative guard: the PR's Lighthouse CI median ≤ 2300 ms, read from the lhci artifact.                                                                                  | orchestrator design → local agent | Needs a protected `.github/` change, so the Owner labels it |
| F9  | Atlas principle nodes link to `/{lang}/about/`, which no longer explains the principles (precutover F-11). Smallest truthful fix: render principle nodes without a link, or link to a page that renders `PRINCIPLE_MATRIX`. Add a test that every Atlas `href` target renders its node label. | orchestrator design → local agent | Not protected; not a go-live blocker                        |

## 5. Owner gates

| Gate                                         | Blocks go-live?                     | Status                       |
| -------------------------------------------- | ----------------------------------- | ---------------------------- |
| Labels on #440 (OG-12, F-04, F-06)           | No (OG-12 is UX)                    | open                         |
| Fix or delete the 2 subdomains returning 502 | Blocks HSTS preload only            | open                         |
| Lift Cloudflare Access                       | **Yes**                             | open; only after §3C is PASS |
| sgps-core #245 (Turnstile)                   | No (Marketing is NOT_APPLICABLE)    | open                         |
| #436 / #437 / #374 review outcome            | No, unless they touch served routes | open                         |

## 6. Architecture notes (for the local agent)

- **Static-first stays.** Astro 7 static output plus Cloudflare Workers assets. Do not add runtime code paths for anything in this plan.
- **Truth flows one way.** Content copy may only consume:
  - registry yaml (`src/content/products/*`),
  - bound claims (`src/data/claims.ts`),
  - the deck.

  `home-copy.ts` and `product-page-copy.ts` are presentation-only. Do not let them restate a registry field that the registry already holds (W10 deduped this).

- **Performance budget model.**
  - Mobile LCP budget: 2.5 s, error-level in Lighthouse CI.
  - Target: CI median ≤ 2.2 s.
  - Lab margin today is about 0.5 s, after the W9 font cut.
  - Any new above-the-fold font, image or CSS must state its LCP cost in the PR, with before/after CI medians.
- **Shell UI lives outside `<main>`.** It sits in its own landmark, so page word and action caps measure content only (W6 lesson).
- **Tests.** Every guard has a negative proof. Engine-measured geometry uses in-page measurement, not `boundingBox()` rounding (W11 F-01).

## 7. Reporting

Every PR body must include:

- the plan item ID;
- PASS / FAIL / NOT VERIFIED per gate;
- for copy changes, the VI before → after.

The local agent reports back to the orchestrator for:

- verification of each workstream boundary (A done, C done, E done);
- VI review before any copy merge.
