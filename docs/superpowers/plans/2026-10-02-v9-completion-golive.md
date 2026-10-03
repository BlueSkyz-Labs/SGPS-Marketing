# v9: completion and go-live plan (SGPS-Marketing)

**Status:** Active. This plan supersedes the v8 HANDOFF §2–§3 for the remaining work.

> **MANDATORY FOR EVERY AGENT.** Read §8 (the agent execution contract) and your task card in §9 before you run any command. You must follow §8. If §8 conflicts with anything else in this plan, §8 wins. An agent that has not read §8 must not push, merge or write evidence.
> **Date:** 2026-10-02
> **Baseline:** `main@cb5f9fe` (v8 W1–W11 merged; W11 evidence in `docs/evidence/2026-10-01-experience-v8-verification.md`)
> **Roles:**

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
5. **Experience Performance & Friction gate (SGPS-DEC-2026-025 / Experience 1.5, issue #449).** The Owner LOCKed it on 2026-10-03 in sgps-core #256. Once #256 merges, this gate is non-compensatory for go-live: PASS, or an Owner-authorized bounded deviation. The contract is prepared in `docs/performance/experience-performance-friction-contract.md`, and the work is in v10 card E0.

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

### 2.0 Status at `main@2cfb15c` (2026-10-03 06:10 GMT+7, orchestrator)

| Item          | State                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1–A4, A6, A7 | **Merged** (#368, #367, #371, #405, #443, #364, #365)                                                                                                                                                                                                                                                                                                                                                                                                    |
| A5 #440       | Open. Quality Gates fails **only** on the missing `owner-approved` label (protected: `public/_redirects`, `scripts/e4-matrix.mjs`, `scripts/run-e2e.mjs`). The branch is 78 commits behind main. #441 is closed as a duplicate. → task **T2**                                                                                                                                                                                                            |
| A8 #436       | Review done: removes 5 committed local logs, adds a `.gitignore` rule and a hygiene test. Every check is green, no protected path, no served-route change. **Recommendation: merge.** → Owner decision O-2                                                                                                                                                                                                                                               |
| A8 #437       | Review done (local-agent note, orchestrator concurs): no payment surface added (D-0 respected). Most of it is now a duplicate of #367/#368/#371/#405. Remaining unique deltas: static-link executable-scheme rejection, critical-verifier trust inventory, and no-payment scan coverage of `public/`. The OCI pin is also in #374. **Recommendation: close with a pointer, and re-cut the unique deltas as one small protected PR after go-live.** → O-3 |
| A8 #374       | Review done: pins the Playwright runtime by OCI digest. It is protected (`.github/`), so Quality Gates fails on the missing label. **Recommendation: keep #374 as the single home of the OCI pin; label it after go-live.** → O-3                                                                                                                                                                                                                        |
| A9 #406       | Post-go-live (unchanged)                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| §3C           | **PASS** on `aa5f21a` (#445 plus addendum #446)                                                                                                                                                                                                                                                                                                                                                                                                          |

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

## 8. Agent execution contract (MANDATORY: read before acting; it overrides other sections)

Every agent working on this plan (orchestrator, local coding agent, subagent) must follow these rules. Breaking any of them invalidates the work: the orchestrator reverts it or rewrites the evidence.

### 8.1 Before you start

1. Refresh live state: `git fetch origin main`, the open PRs, and the latest main push run. A SHA in this plan is a baseline, not permission to skip the refresh.
2. Read in this order: `AGENTS.md` → this §8 → your task card in §9 → only the files your card names. Do not read the whole plan or the copy deck unless your card says so.
3. Confirm that your card's **Preconditions** hold. If one fails, stop and report `BLOCKED: <precondition>`. Do not improvise around it.

### 8.2 While you work

1. **Scope.** Change only the files your card lists. If you need another file, stop and report. Never widen a PR.
2. **Protected paths** (`scripts/check-merge-policy.mjs` `PROTECTED_PATHS`):
   - Never add, remove or ask for the `owner-approved` label.
   - Never enable auto-merge on a protected PR.
   - Merge a protected PR by hand, only after the Owner has labelled it and its exact head is green.
3. **Git.** Update a branch by merging main into it. Never rebase, amend or force-push a pushed branch. One PR per card.
4. **Tests.**
   - Never weaken, skip or delete a test to get green.
   - When behaviour changes on purpose, replace the old assertion with one that is at least as strong, and say so in the PR body.
   - Every new guard needs a negative proof: break the invariant and show that the test fails.
5. **Truth.** Never invent copy, claims, screenshots, emails or facts. VI copy changes need orchestrator review before merge (§7).
6. **Duplicates.** Before opening a PR, search the open PRs for the same fix. If one exists, extend it or stop. Do not open a second one (the #440/#441 lesson).

### 8.3 Evidence rules (zero tolerance)

1. **Vocabulary:** PASS / FAIL / NOT VERIFIED / NOT APPLICABLE only.
2. **CI counts only when completed.** A CI result is PASS only when the run is `completed` with conclusion `success` on the exact SHA you cite. Cite it as: run id, SHA, `conclusion`.
   - A run that is `in_progress` or `queued` is **NOT VERIFIED**.
   - A run that is `cancelled` or `skipped` is **NOT VERIFIED**. If the required check then reads `failure`, report **FAIL**.
   - Never write "PASS (in progress)" (the #445 lesson).
3. **Check against the Owner decision, not current behaviour.** When an Owner decision sets the expected value (for example OG-12 = `/vi/products/sotro/`), compare against that decision. Report current behaviour that differs as FAIL or as "pending <PR>". Never call it "expected".
4. **Name the scope.** Every sweep states what it covered (`dist/` HTML only, `public/`, `src/`). A 0-hit claim is valid only within the stated scope.
5. **Bind every evidence record** to one SHA and to the environment (OS, Node, browser).

### 8.4 Stop and report

- Stop when your card's **Done when** is met.
- Also stop at any `BLOCKED` condition, or when you would need to touch a protected label, a production setting, Cloudflare or DNS.
- Report to the orchestrator in this format:

```
CARD: T<n>   STATE: DONE | BLOCKED | PARTIAL
PR: #<n> @ <head sha>   CI: run <id> <conclusion> (completed)
GATES: <gate>=PASS|FAIL|NOT VERIFIED ...
CHANGED: <files>
OPEN: <anything left, with reason>
```

## 9. Task cards (next work, in order)

### T1: F9, fix the Atlas principle links (local coding agent)

- **Why:** the Atlas principle nodes link to `/{lang}/about/`, and since abt-4 = A no page renders `PRINCIPLE_MATRIX`. `tests/e2e/s-plus-atlas.spec.ts:83–95` pins that link, and its comment cites a check in `v7-truth-content.spec.ts` that does not exist.
- **Preconditions:** main is green, and no open PR touches `src/lib/atlas.ts`.
- **Files:**
  - `src/lib/atlas.ts`
  - `src/components/experience/Atlas.astro`
  - `tests/e2e/s-plus-atlas.spec.ts`
  - one architecture test (new file, or an existing atlas/truth test)
- **Change (smallest truthful fix):**
  - Make `AtlasNode.href` optional, and give principle nodes no `href`.
  - In `Atlas.astro`, render a node without `href` as a plain `<span class="atlas-row__label">`, not as `<a>`.
  - Keep the count of 4 principle nodes and the other node kinds unchanged.
- **Tests:**
  - Replace the e2e assertion: principle rows contain **no** `<a>` and still show their 4 labels.
  - Add an architecture test asserting that every Atlas node with an `href` points to a route that exists in the built page list.
  - Negative proof: give one principle node `href: "/en/nope/"` and show that the test fails.
- **Not allowed:** re-adding the principles to About (that is Owner copy, abt-4), or deleting the principle nodes.
- **Done when:** the PR is green on all 4 engines and Lighthouse CI, and `Quality Gates` passes. This is not a protected path, so normal merge is allowed. Report per §8.4.

### T2: A5, bring #440 up to date (local coding agent)

- **Preconditions:** #440 is open, and T1 has merged or is not touching `tests/architecture/browser-assurance-matrix.test.mjs`.
- **Steps:**
  1. Merge `origin/main` into `fix/v8-owner-gated-tooling` (78 commits behind) and resolve the conflicts.
  2. Run the local source gate and `E2E_PROJECT=bogus node scripts/run-e2e.mjs`, which must exit 2.
  3. Run the redirect asset-safety test, then push.
- **Done when:** every check is green **except** `Quality Gates`, which fails only on the label message. Then **stop**: the Owner labels #440, and after that you merge it by hand on a green exact head.

### T3: E, production smoke (orchestrator)

- **Preconditions:** the Owner has lifted Cloudflare Access. Check: `curl -sI https://blueskyzlabs.com/` returns 200, not 302.
- **Steps:** run every check in §3 E against production.
- **Done when:** `docs/evidence/2026-10-xx-golive-production-smoke.md` is merged and `docs/current-work.json` is updated.

### T4: Owner decisions (Owner only; agents never act on them unasked)

| ID  | Decision                                      | Recommendation                                      |
| --- | --------------------------------------------- | --------------------------------------------------- |
| O-1 | Lift Cloudflare Access                        | Yes. §3C is PASS. This is the only go-live blocker. |
| O-2 | #436 (remove local logs)                      | Merge                                               |
| O-3 | #437 close + re-cut; #374 label after go-live | Close #437 with a pointer. Keep #374.               |
| O-4 | Label #440 (OG-12, F-04, F-06)                | Label (not a go-live blocker)                       |
| O-5 | Fix or remove the 2 subdomains returning 502  | Needed only for HSTS preload (F1)                   |

### T5: post-go-live (after T3 PASS)

Run F-items in this order: F9 (if T1 is not done yet) → F8 → F1 → F7 → F6. F2–F5 wait on the Owner or native reviewers. Each F-item gets a §9-style card from the orchestrator before any agent starts it.
