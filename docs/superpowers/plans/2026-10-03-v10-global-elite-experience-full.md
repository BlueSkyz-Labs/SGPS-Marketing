# v10: Experience FULL round and Global-Elite elevation (SGPS-Marketing)

**Status:** **APPROVED — ACTIVE (Track A).**

- **Approval source:** Owner delegation of 2026-10-03, 07:50 GMT+7: "Nếu là plan tự duyệt theo mục tiêu dự án" ("plans are self-approved against the project objectives").
- **The delegation covers only:**
  - plan approval;
  - routine reversible work inside this plan and the Agent Safety Envelope.
- **It does not cover:**
  - SGPS governance decisions (for example DEC-025);
  - the `owner-approved` label;
  - production settings (Cloudflare Access, DNS);
  - product facts;
  - human or native-review evidence.

  Those stay Owner-only (§6).
  **Date:** 2026-10-03
  **Baseline:** `main@2cfb15c`. Baseline, target and gap matrix: `docs/evidence/2026-10-03-v10-global-elite-baseline.md`.
  **Relationship to v9:**

- v9 keeps priority until go-live: T1–T3 and the Owner Access lift.
- v10 must not delay go-live. Every v10 PR lands after the v9 T-card it would conflict with.
- **v9 §8 (agent execution contract) applies to v10 unchanged** and stays mandatory. v10 §7 adds rules on top of it.

**Roles:**

- The orchestrator (cloud) owns verification, planning and architecture.
- The local coding agent owns implementation.
- The Owner owns the gates in §6.

> **MANDATORY FOR EVERY AGENT.** Before any action, read v9 §8, then v10 §7, then your card in §8. If they conflict, v9 §8 wins, then v10 §7, then the rest of this file.

## 0. What "Global Elite" means here (read this first)

"Global Elite" is the BlueSkyz **internal composite quality bar** in BPXS 1.4 §6 (`sgps-core` `standards/experience/BLUE_SKYZ_PORTFOLIO_EXPERIENCE_STANDARD.md`). It is **not an external standard or certification**. Never write that the site "is certified", "meets Global Elite" or "is world-class" in a PR, in evidence or on the site.

The bar is scored on BPXS's own instruments:

- the 10 Global-Elite dimensions (§6);
- the experience gates G1 USEFUL … G6 CULTURALLY INTEGRAL (§20);
- the maturity model M0–M6 (§21; M6 must never be self-declared).

**External numeric anchors** are informed-by references only, not compliance claims:

- Core Web Vitals "good" at the 75th percentile: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 (web.dev).
- WCAG 2.2 AA (W3C Recommendation, 5 Oct 2023), including the 2.2 additions 2.4.11 Focus Not Obscured (Minimum) and 2.5.8 Target Size (Minimum).

Visual craft can never offset a blocking safety, security, accessibility or task-success failure (BPXS §6, non-compensatory).

## 1. RESOLVE: SGPS context (exact identity)

- **Published release pin:** SGPS v1.13.0. Unchanged; this plan does not repin.
- **Source overlays discovered at** `sgps-core@24617f7` (2026-10-03). Applicability of decisions newer than the 2026-09-16 reconciliation:

| Decision                                                 | State in sgps-core                                        | Applicability here                                                                                                     | Action in v10                                                                                                                  |
| -------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| BPXS 1.4 / DEC-004, 006, 007, 008, 012                   | LOCK                                                      | APPLICABLE; ADOPTED since 2026-09-22                                                                                   | This round: FULL stages BASELINE → VERIFY → VISUAL_RUNTIME_CONVERGENCE_AUDIT                                                   |
| DEC-019 multilingual baseline and language preference    | LOCK                                                      | APPLICABLE (4 locales, edge locale suggestion)                                                                         | Re-verify the "suggest, never override an explicit choice" guard (`locale-suggestion-contract.test.mjs`); no new code expected |
| DEC-022 evidence convergence and reversible architecture | LOCK                                                      | APPLICABLE only to provider choices (Cloudflare Workers). Every new runtime choice in v10 states adoption **and** exit | Card rule §7.4                                                                                                                 |
| DEC-023 post-design architecture challenge               | VALIDATE (pilots: Sổ Trọ, Sổ Tâm)                         | NOT YET APPLICABLE (not LOCK)                                                                                          | None                                                                                                                           |
| DEC-024 auto-merge merge gate                            | VALIDATE                                                  | ADOPTED earlier                                                                                                        | None                                                                                                                           |
| DEC-025 performance and stability budgets                | **DEFER**, not in force; Marketing is the named web pilot | Candidate only                                                                                                         | Owner decision O-10.1                                                                                                          |
| DEC-026 dashboard federation                             | DEFER                                                     | NOT APPLICABLE                                                                                                         | None                                                                                                                           |
| DEC-027 Turnstile                                        | VALIDATE                                                  | NOT APPLICABLE (no forms)                                                                                              | None                                                                                                                           |

## 2. Baseline summary (details in the evidence record)

The site is at **M3 ASSURED** with parts of **M4 HOUSE COHERENT**:

- accessibility, runtime and four-engine evidence are integrated in CI;
- Brand Kit v4 tokens and components are applied.

The **measurable floor is strong**:

- axe: 0 violations in 180 scans;
- four engines green;
- Lighthouse CI mobile LCP inside budget.

**What separates it from the Global-Elite bar is mostly evidence the agents cannot produce:**

- real-user task success (Human E4);
- field Core Web Vitals (no RUM provider approved);
- native zh review;
- brand recognition (E5/E6);
- the product facts and screenshots that the C3-C Living Product System still waits on.

v10 therefore has two tracks:

- **Track A** raises and locks the measurable floor. Agents can do all of it.
- **Track B** turns Owner decisions into the visible elevation. It cannot start without the Owner.

## 3. Gap matrix (material gaps only)

| Gap | Dimension (BPXS §6)                                                                                                                                                                                                    | Evidence                                                               | Track             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------- |
| G1  | Accessibility: no guard for WCAG 2.2 **2.4.11 Focus Not Obscured** under the sticky header (`scroll-margin-top` exists on some anchors; no test)                                                                       | `grep` on `tests/` found 0 guards                                      | A (E2)            |
| G2  | Craft precision: **no visual regression gate**. 0 `toHaveScreenshot` specs, so a token or spacing regression would ship silently                                                                                       | `grep` on `tests/`                                                     | A (E3)            |
| G3  | Trust: Atlas principle links point to a page that no longer explains them (F-11)                                                                                                                                       | v9 T1                                                                  | v9 T1             |
| G4  | Perceived performance: no navigation prefetch. The approved experiment M02 (`2026-09-24-marketing-full-audit…` plan) was never run                                                                                     | plan M02, no prefetch in `astro.config`                                | A (E4)            |
| G5  | Lab-truth: Lighthouse CI SEO = 0.69 on every route because the lab build uses a non-production origin, so `BaseLayout` emits `noindex`. The warning is permanent noise, and a real SEO regression would hide inside it | LH CI job 111062965403 on `2cfb15c`; `src/layouts/BaseLayout.astro:96` | A (E5, protected) |
| G6  | Performance process: budgets are CI assertions but not a declared, per-feature budget file (DEC-025)                                                                                                                   | DEC-025 DEFER                                                          | Owner O-10.1      |
| G7  | Brand distinctiveness: never reviewed against the anti-failure test "could belong to any premium SaaS" with a Beauty-Blind review (BPXS §18)                                                                           | no record                                                              | A (E6)            |
| G8  | Task success and field data: Human E4, RUM, native zh review, E5/E6 recognition                                                                                                                                        | `current-work.json` residuals                                          | B (Owner)         |
| G9  | Product-led spectacle: C3-C (facts and screenshots), C3-F (release source), C3-G spatial halo, C3-E concierge are BLOCKED or PLANNED on Owner inputs                                                                   | `current-work.json`                                                    | B (Owner)         |

**Plan correction (v9):** v9 §3E and F1 said "HSTS without `includeSubDomains`". That is wrong. `includeSubDomains` has been served since #43/#46 (2026-09-04) and is guarded by `tests/architecture/security-headers.test.mjs:14`. Only `preload` is held back (`seo-contract.test.mjs:125`). The §3E smoke checks for `max-age=31536000; includeSubDomains` with **no** `preload`.

## 4. Target

Every BPXS §6 dimension that agents can evidence is **VERIFIED and guarded** on one SHA. Every dimension that agents cannot evidence is an explicit residual boundary (NOT VERIFIED, with its owner and its unlock step). Experience state is **CONVERGED with residual boundaries**, never "CONVERGED" alone.

Numeric targets, lab and CI (field targets wait on RUM):

| Metric                                     | Budget (error) | Target (CI median, mobile) |
| ------------------------------------------ | -------------- | -------------------------- |
| LCP                                        | ≤ 2.5 s        | ≤ 2.2 s                    |
| CLS                                        | ≤ 0.1          | ≤ 0.02                     |
| TBT (lab proxy for INP)                    | ≤ 200 ms       | ≤ 100 ms                   |
| Lighthouse a11y / best-practices           | ≥ 0.95         | 1.00                       |
| Lighthouse SEO (production-origin variant) | ≥ 0.95         | 1.00                       |
| axe (all routes × 2 themes)                | 0 violations   | 0 violations               |

## 5. Track A slices (agents; serial; one PR each)

Order: E1 → E2 → E3 → E4 → E5 → E6 → E7. E1 is verification only and can run in parallel with v9 T1/T2.

| ID  | Slice                                                                                                  | Owner of work                   | Protected?                                      |
| --- | ------------------------------------------------------------------------------------------------------ | ------------------------------- | ----------------------------------------------- |
| E1  | DEC-019 and current-state read-back: confirm the locale-suggestion guard and bind the baseline numbers | orchestrator                    | no                                              |
| E2  | WCAG 2.2 delta guards: 2.4.11 focus not obscured, 2.5.8 audit                                          | local agent                     | no                                              |
| E3  | Visual regression gate for key routes                                                                  | local agent                     | yes (`playwright.config.ts`) → Owner label      |
| E4  | M02 navigation prefetch experiment (zero-JS Speculation Rules, allowlist) with GO/NO-GO                | local agent                     | yes (`public/_headers`) → Owner label           |
| E5  | Lighthouse SEO lab truth: a production-origin build variant for the SEO category                       | local agent                     | yes (`lighthouserc*`, `.github/`) → Owner label |
| E6  | Beauty-Blind UX review (BPXS §18) of 4 key routes, then craft fixes from its findings                  | reviewer lane, then local agent | no                                              |
| E7  | VISUAL_RUNTIME_CONVERGENCE_AUDIT + Experience Convergence Evidence (SGPS template)                     | orchestrator                    | no                                              |

## 6. Owner gates and their dispositions (2026-10-03)

**Kind** says who can close each gate:

- **PLAN**: the orchestrator decided it under the plan delegation.
- **OWNER**: only the Owner can close it.

| ID     | Decision                                     | Kind                                    | Disposition                                                                                                                                                            |
| ------ | -------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| O-10.1 | Approve DEC-025 for the Marketing pilot      | OWNER (SGPS governance, AGENTS rule 17) | **Open.** Until it is approved, E-slices use the plan's own budgets (§4) and v9 F8 stays the CI guard. Nothing in Track A is blocked by it.                            |
| O-10.2 | Label the protected Track A PRs (E3, E4, E5) | OWNER (merge gate)                      | **Open per PR.** The orchestrator reviews each PR first and posts a one-line "ready for label" note.                                                                   |
| O-10.3 | RUM provider or keep it OFF                  | PLAN default + OWNER for any provider   | **Decided by default: stays OFF.** The "no cookies / no analytics" truth is unchanged. Choosing a provider is an Owner privacy decision. Field CWV stays NOT VERIFIED. |
| O-10.4 | Human E4 with real visitors                  | OWNER (human evidence)                  | **Open.** The protocol and templates already exist (`docs/evidence/2026-09-12-v3-human-e4.md`). Run it after go-live. Agents cannot substitute for it.                 |
| O-10.5 | Product facts and screenshots (Sổ Tâm first) | OWNER (Product Truth)                   | **Open: the largest visible elevation.** Agents must not fabricate them.                                                                                               |
| O-10.6 | Native zh / zh-hant reviewer                 | OWNER (human evidence)                  | **Open.** zh stays marked machine-assisted where it is already marked.                                                                                                 |
| O-10.7 | C3-G spatial halo experiment                 | PLAN                                    | **Decided: DEFER** until O-10.5 has landed. Product truth comes before spectacle (C2 doctrine), so it is not run in v10.                                               |

## 7. v10 additions to the agent contract (MANDATORY, on top of v9 §8)

1. **No elite or certification wording.** Never write "Global Elite PASS", "world-class", "certified" or "compliant" in code, copy, PRs or evidence. Report per dimension with PASS / FAIL / NOT VERIFIED / NOT APPLICABLE and cite the BPXS § number.
2. **Measure before and after.** Every Track A PR that touches runtime (CSS, JS, headers, images) states the CI Lighthouse medians (LCP, CLS, TBT) for its 4 routes **before** (main) and **after** (PR head), from completed runs only.
3. **Stay inside budgets.** No new client JS without a measured INP/TBT cost and a client-budget check. No new font, image or CSS above the fold without the LCP cost in the PR body (v9 §6).
4. **Reversible choices (DEC-022).** Any new runtime or browser-feature choice (for example Speculation Rules) states its adoption rule, its exit (how to remove it in one PR) and its behaviour on unsupported browsers (it must degrade to plain links).
5. **No product truth from presentation.** Track A must not add product facts, screenshots, claims, quotes or release stories. Those are Track B and Owner-only.
6. **Experiments may fail.** E4 has an explicit NO-GO outcome. Recording NO-GO with evidence is a successful slice; forcing GO is a contract breach.

## 8. Task cards

### E1: read-back and baseline binding (orchestrator)

- Bind the Lighthouse, axe and CI numbers in the baseline evidence record to `main@<sha at E1 start>`.
- Re-run `locale-suggestion-contract.test.mjs` and record DEC-019 as GUARDED, or as a FAIL with a finding.
- **Done when:** the evidence record shows every §6 dimension with its state.
- **State: DONE** on `main@c39d34b`. `locale-suggestion-contract` + `i18n-contract`: 26/26 pass. They prove that a stored choice wins, that the script never navigates by itself, and they include negative proofs. DEC-019 is **GUARDED**.

### E2: WCAG 2.2 delta guards (local agent)

- **Preconditions:** v9 T1 merged. No open PR touches `src/components/layout/Header*` or `global.css` focus styles.
- **Files:**
  - a new `tests/e2e/wcag22-focus-not-obscured.spec.ts`;
  - the sticky header and `global.css` scroll-margin rules, **only if the test fails**.
- **Test:**
  - On `/en/`, `/vi/`, `/en/products/`, `/vi/products/sotro/` and `/en/verify/`, at 390 and 1440 px, Tab through every focusable element.
  - For each one, assert in-page (`getBoundingClientRect`, not `boundingBox()`, per the v9 §6 rule) that the element is not **entirely** covered by the sticky header or any fixed element. Check the element's area against the union of fixed or sticky boxes.
  - Also assert the 2.5.8 floor: interactive targets are ≥ 24×24 CSS px, or spaced so the 24 px circles do not intersect. The site's own 44 px rule stays the stricter guard.
- **Negative proof:** temporarily set `scroll-margin-top: 0` and give the header a taller fixed height, and show that the test fails. Revert, and record the negative proof in the PR body.
- **Done when:** green on all 4 engines (non-protected path, so normal merge).

### E3: visual regression gate (local agent; protected)

- **Preconditions:** E2 merged.
- **Files:** `playwright.config.ts` (a new `visual` project, chromium only), `.github/workflows/quality-gates.yml` (the visual step plus an artifact upload of the diff images on failure), `tests/visual/*.spec.ts`, and the snapshot baselines. Both config files are protected.
- **Design:**
  - Cover 6 routes: `/en/`, `/vi/`, `/en/products/`, `/vi/products/sotro/`, `/en/about/`, `/en/verify/`.
  - Each route at 390 and 1440 px, in light and dark.
  - Motion is disabled (`reducedMotion: 'reduce'`) and fonts are awaited (`document.fonts.ready`).
  - Pixel threshold ≤ 0.1 %.
  - Baselines are generated **in the CI container** (Linux) and committed, never generated on Windows.
  - The `visual` project runs in its own CI step, and a failure blocks.
- **Negative proof:** change one spacing token by 4 px, and show that the gate fails on the affected routes.
- **Not allowed:** auto-updating snapshots in CI. Snapshot updates need a PR whose body states why the visual change is intended.
- **Done when:** the CI step is green and the Owner has labelled the PR. Merge by hand (v9 §8.2).

### E4: M02 navigation prefetch experiment (local agent; protected)

- **Preconditions:** go-live done, because production data decides GO/NO-GO; E3 merged.
- **Design:**
  - Add a zero-JS `Speculation-Rules` response header in `public/_headers`, pointing to `/speculation-rules.json`.
  - The JSON uses `prefetch` only (**no prerender**), with `eagerness: "moderate"`.
  - Use an explicit `href_matches` allowlist: the locale homes, `/*/products/`, `/*/products/sotro/` and `/*/verify/`.
  - Never cross-origin, never `/dossier/print/`.
  - Inline speculation rules are not allowed: CSP `script-src 'self'` must stay unchanged.
- **Measure:** a navigation-timing proxy (Lighthouse user-flow from `/en/` to `/en/products/`, 5 runs each) for 3 states: before, after, and after with data-saver.
- **GO if:** the median next-page LCP improves by ≥ 20 %, extra requests are ≤ 4 per page view, and there is no regression on the 4 Lighthouse routes.
- **NO-GO otherwise:** close the PR and record the numbers.
- **Exit (DEC-022):** delete the header and the JSON file. Unsupported browsers ignore the header.
- **Done when:** a GO or NO-GO record is in `docs/evidence/`.

### E5: Lighthouse SEO lab truth (local agent; protected)

- **Preconditions:** none beyond v9 §8.
- **Design:** add a second Lighthouse CI collection for **SEO only**, against a build with `PUBLIC_SITE_URL=https://blueskyzlabs.com` served locally. That build emits no `noindex`, and canonical and hreflang are production-shaped. Assert `categories:seo ≥ 0.95` as an **error**. The existing performance lane is unchanged.
- **Negative proof:** remove one `hreflang` alternate, and show that the SEO assertion fails.
- **Done when:** the CI SEO lane is green and the Owner has labelled the PR.

### E6: Beauty-Blind review and craft fixes (reviewer lane, then local agent)

- **Reviewer:**
  - Apply BPXS §18 to `/en/`, `/vi/`, `/vi/products/sotro/` and `/en/about/` at 390 and 1440 px, in both themes. In the first pass, judge structure, hierarchy and task clarity with styling ignored.
  - Then apply the anti-failure tests: could this belong to any premium SaaS? Is anything decorative without function (BPXS §7.3)?
  - Output a findings list with severity in `docs/evidence/2026-10-xx-v10-beauty-blind-review.md`.
- **Local agent:**
  - Fix the findings rated high or medium that need no Owner copy.
  - Findings that need copy, imagery or brand changes go to the Owner as decisions.
- **Done when:** the review record is merged, and the fixes are merged or explicitly moved to the Owner.

### E7: visual-runtime convergence audit (orchestrator)

- **Preconditions:** E2–E6 closed (merged, or recorded as NO-GO).
- Fill in the SGPS `EXPERIENCE_CONVERGENCE_EVIDENCE` template for this round, bound to one SHA.
- **Done when:**
  - every BPXS §6 dimension has a state;
  - the residual boundaries name their Owner gate;
  - `docs/current-work.json` shows `experience-full-v10` as CONVERGED_WITH_RESIDUALS.

## 9. Red-team of this plan (orchestrator; RED_TEAM stage)

| Attack                                             | Finding                                                                                                                  | Treatment                                                                                                      |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| "Track A does not visibly elevate the site"        | True. Track A raises and locks the measurable floor. The visible leap depends on O-10.5 (product facts and screenshots). | Stated in §2 and §6. O-10.5 is ranked as the largest visible elevation.                                        |
| "Elite = more effects"                             | That inference is forbidden by BPXS §7.3.                                                                                | §7.1 bans elite wording. E6 uses the anti-failure tests. No new decorative motion is planned.                  |
| "E3 snapshots will be flaky across engines and OS" | Real risk.                                                                                                               | Chromium only, Linux CI baselines, motion off, fonts awaited, threshold ≤ 0.1 %, no CI auto-update.            |
| "E4 GO threshold (≥ 20 %) is arbitrary"            | It is a hypothesis threshold, not a standard.                                                                            | Recorded as such. NO-GO is a valid result. The threshold may only be changed before measuring, in the PR body. |
| "E5 duplicates CI time"                            | It adds one SEO-only collection (3 runs × 4 routes).                                                                     | Accepted. The alternative, a permanent warning, hides regressions.                                             |
| "Prefetch leaks private routes or costs data"      | Covered by M02 constraints.                                                                                              | Allowlist only, no prerender, no cross-origin, data-saver measured.                                            |
| "Agents will claim CONVERGED"                      | This is a known pattern (#445).                                                                                          | v9 §8.3 plus v10 §7.1: the state is always "CONVERGED with residual boundaries".                               |
| "Field data could contradict the lab"              | Lab is not field (web.dev).                                                                                              | Field stays NOT VERIFIED until O-10.3.                                                                         |

## 10. Exit

- **Track A done:** E1–E7 closed, main green, governance **ADOPTED**, experience **CONVERGED with residual boundaries** (G8/G9 listed).
- **Track B:** each Owner decision in §6 opens its own card from the orchestrator; no agent starts B work from this file alone.
- `PLAN COMPLETE ≠ PROJECT COMPLETE`: after Track A, the next coherent successor is whatever Owner gates have opened, starting with O-10.5 (the product facts behind the largest visible elevation).
