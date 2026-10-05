# Pre-go-live redteam v11 — multi-dimensional audit (SGPS-Marketing)

- **Bound to:** `main@c173f169` (source) + the live edge state of 2026-10-04 ~12:30–12:50 (UTC+7),
  pre-Access-lift. **Method:** two read-only subagent audits (runtime/edge on the live host;
  content/truth over repo + a production-origin build) + coordinator probes (supply chain,
  governance, ops, build-origin re-verification). Every claim below carries its raw evidence;
  child misreads are corrected inline and labelled.
- **Verdict rule:** PASS / FAIL / NOT VERIFIED. Pre-lift gating is the _designed_ state, not a
  failure: www 301 → apex 302 (Access) → login is the declared control until the Owner lifts it.

## Dimension 1 — Runtime / edge (live)

| Probe                                                                   | Result                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `www` redirect                                                          | **every probed path 301, single hop, `Location: https://blueskyzlabs.com/<same path>`** (12 paths + browser-UA probe) — RT-01 working                                                                                                                                                                                                                |
| Redirect hop headers                                                    | HSTS `max-age=31536000; includeSubDomains` (no preload) + `X-Content-Type-Options: nosniff`; the full set (CSP incl. `require-trusted-types-for 'script'` + `'inline-speculation-rules'`, COOP/CORP/XFO/RP/PP) lives on content responses — verified on the built artifact (wrangler dev, §3C re-bind) and re-asserted on the clean prod build below |
| Open redirect (4 probes)                                                | **none** — `//evil.com` → path-collapsed `…/evil.com`; `/%2F%2Fevil.com` preserved encoded; all Location hosts = blueskyzlabs.com                                                                                                                                                                                                                    |
| Traversal (3 probes)                                                    | **400** on all                                                                                                                                                                                                                                                                                                                                       |
| Cookies                                                                 | www: **0** across 5 probes; apex: 1× `CF_AppSession` per response (Cloudflare Access's own — expected pre-lift)                                                                                                                                                                                                                                      |
| HTTP→HTTPS / TLS                                                        | port 80 → 301 https on both hosts; TLS 1.3                                                                                                                                                                                                                                                                                                           |
| Edge injection                                                          | 0 `challenge-platform` / `__CF$cv$params` in served bodies (JS Detections off — see #479)                                                                                                                                                                                                                                                            |
| **NEW (LOW)**                                                           | `https://blueskyzlabs.com/cdn-cgi/trace` = **200 while all other apex paths 302** — a Cloudflare platform endpoint that echoes the _caller's own_ request metadata (IP/colo/loc). No site data; optional hardening only (block `/cdn-cgi/*` in the Access app if desired)                                                                            |
| Origin content probes (404 body, assets, cache headers, CSP on content) | **NOT VERIFIABLE pre-lift by design** — covered by the wrangler-dev §3C re-bind (11/11 single-hop 301s, assets 200) and the CI matrix on the exact head                                                                                                                                                                                              |

**Child misread corrected:** the runtime child classified the gated state as "BLOCKING outage" — the brief did not state that the Access gate is intentional. The raw data it collected is valid and confirms the designed pre-lift boundary.

## Dimension 2 — Content / truth (repo + clean production-origin build)

| Check                                   | Result                                                                                                                                                                                                                                        |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Payment markers (Owner D-0)             | **0** product-payment markers in `src/`, `public/`, `dist/`; all 54 dist hits classified benign (screenshot filenames, a _negative_ disclosure, a `Permissions-Policy: payment=()` lockdown, product-domain copy about recording rent states) |
| Tracking / analytics                    | **0** providers/beacons; `src/lib/analytics.ts` = CustomEvent-only, no network path; bundle check: 0 `sendBeacon`/gtag files                                                                                                                  |
| Product registry honesty                | statuses: all 5 `availability: preview` / `In development`; **public: Sổ Trọ + Sổ Tâm only** (94 dist mentions each; the other 3 = 0)                                                                                                         |
| VI glossary                             | all 8 retired terms = **0** across dist (html + all file types); sanctioned `dữ liệu mẫu` = 7                                                                                                                                                 |
| Canonical / hreflang / robots / sitemap | **PASS on the clean prod build**: canonical `https://blueskyzlabs.com/en/`, 0 localhost, robots `Allow: /` + sitemap link, sitemap **77 `<loc>`**, no noindex on content pages, 4 locales + x-default                                         |
| JSON-LD                                 | **250/250 blocks parse**; Organization/WebSite/BreadcrumbList; apex URLs on the clean build                                                                                                                                                   |
| E4 speculation rules (prod shape)       | **present**: `{"prefetch":[{"urls":["/en/products/","/en/about/","/en/contact/"],"eagerness":"moderate"}]}` (+vi), prefetch-only                                                                                                              |
| Journal empty states                    | honest, zero invented posts, 4 locales ("No posts yet" / "Chưa có bài viết" / "暫無文章")                                                                                                                                                     |
| 404                                     | localized + noindex, every locale; no hreflang on 404s                                                                                                                                                                                        |
| Secrets sweep                           | **0** across src/ and dist/; the two fact-gated emails stay empty (never fabricated)                                                                                                                                                          |

**Audit-method note (correcting the child's "BLOCKER"):** the content child initially read a **stale localhost dist** that had been rebuilt by a concurrent lane inside the same worktree — all origin-dependent "failures" (localhost canonicals, `Disallow: /`, 0-loc sitemap, missing rules) reproduced as an artifact of that build, and **vanish on the clean `PUBLIC_SITE_URL` build** (re-verified above, evidence verbatim). The lesson is recorded: audits must pin the exact build command and worktree, because a shared worktree can be rebuilt underneath the auditor.

**Owner-review note:** the EN product pages carry "Already have an account? Sign in" links to the live `sotro./sotam.` apps while the same page says "in development" — not a payment/claim defect (the products genuinely exist), but the Owner may want the copy to reconcile (or accept as-is).

## Dimension 3 — Supply chain / governance / ops (coordinator)

| Check                | Result                                                                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dependency audit     | 1 high advisory — **governed exception** (`GHSA-ch52-4w7c-c8xp`): no patch exists, the vulnerable path is proven unreachable (no remote images), a guard test enforces it, **expires 2026-11-03** |
| Promotion assurance  | `source PASS`, `deployment PASS`, `public-truth BLOCKED_OWNER_FACT` (the two emails — the documented soft-land holds; no FAIL)                                                                    |
| Rollback eligibility | `c173f169` = **ELIGIBLE** (source floors + payment checks; provider mapping/runtime NOT_VERIFIED as documented)                                                                                   |
| CI token boundaries  | `persist-credentials: false` ×4; `contents: read`; **0** cloudflare/wrangler-deploy occurrences in workflows                                                                                      |
| Source assurance     | four-engine + Lighthouse + the new visual gate green on the exact head (`02549214` run = completed success)                                                                                       |

## Dimension 4 — Experience (final head)

- Axe matrix: 89 routes × light/dark = **178 scans, zero violations** (`02549214`).
- Runtime probe: 64 pages (4 locales × 8 routes × 2 viewports) all 200, 0 overflow, 0 console errors, 0 sub-24px targets.
- Visual regression gate live (E3): 24 Linux baselines; every PR's render verified in CI.
- Keyboard / no-JS / reduced-motion / personas: unchanged from RT-10 (preflight) — Human E4 remains the owner's post-go-live protocol.

## Dimension 5 — Pre-lift boundary & go-live readiness

- Public bypass: **closed** (www 301 everywhere; verified with browser-UA too).
- Apex: gated (302 → Access) — the single remaining owner action.
- Only unauthenticated apex 200s: `/cdn-cgi/trace` (platform, LOW) and Access metadata.
- §3E execution runbook: ready; the merged smoke now asserts "www → 301 apex" (regression guard).

## Findings summary

| ID     | Severity      | Finding                                                               | Disposition                                                                       |
| ------ | ------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| v11-F1 | LOW           | `/cdn-cgi/trace` reachable on the gated apex                          | Optional hardening (Access policy for `/cdn-cgi/*`); record as accepted otherwise |
| v11-F2 | OWNER-REVIEW  | Sign-in links on in-development product pages                         | Owner decision (copy reconciliation or accept)                                    |
| v11-F3 | INFO          | x-default on subpages points at the EN subpage (not the root gateway) | Deliberate-looking convention; recorded                                           |
| v11-F4 | INFO (method) | A concurrent lane rebuilt the shared worktree's dist mid-audit        | Re-verified clean on an isolated worktree; audit-method lesson recorded           |
| —      | —             | Everything else                                                       | **PASS** (dimensions 1–5)                                                         |

## Self red-team of this audit

- Live-origin content probes (CSP-on-content, 404 body, asset cache headers) are **NOT VERIFIED pre-lift**; the wrangler-dev + CI evidence stands in and §3E re-runs them at the lift.
- Two children's verdict framings were corrected (gated-state ≠ outage; stale-dist ≠ product defect) — the corrections are documented, not hidden.
- The audit is bound to `c173f169` + the 12:30–12:50 live window; any later merge invalidates the source-side items (re-check on the final head).

**Verdict: PRE-GOLIVE REDTEAM v11 = PASS — with 1 LOW platform note, 1 owner-review copy note, and 2 informational records. No blocking finding. The Access lift may proceed.**
