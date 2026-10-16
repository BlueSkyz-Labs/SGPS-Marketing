# SGPS Marketing: Lead Execution Plan v1.1 (strategy, architecture, work packages, dispatch)

- **Date:** 2026-10-16 (Asia/Ho_Chi_Minh).
- **Role:** this plan is written by the LEAD lane, which covers strategy, planning, architecture and review. Coding is done by dispatched agents.
- **Relationship to other plans:**
  - This plan **succeeds and extends** `2026-10-16-sgps-marketing-premium-experience-execution-v1.md` (v1.0, Owner-approved direction, #616). It does not replace v1.0.
  - v1.0 cards S01–S10 and G01–G10 keep their IDs and content. This plan adds:
    - live-state binding;
    - strategy priorities;
    - architecture decisions A1–A6;
    - new work packages WP-01…WP-14;
    - a file-ownership map for parallel agents;
    - copy-paste dispatch prompts.
  - Where the two plans conflict, v1.0's safety and authority rules win, and this plan's ordering wins.
- **Authority:**
  - No production release authority.
  - No `owner-approved` self-application.
  - No auto-merge on protected paths.
  - D0–D3 lanes as defined in v1.0.
- **Baseline read back:** `main@099fd32a5758169fac25fc4530afb8859aad127f`, sgps-core `origin/main@2fa8e40`. The published SGPS release pin stays `v1.13.0`; it is still the latest published release, and DEC-033…043 are `Unreleased` overlays.

A SHA in this plan is a handoff baseline, not permission to ignore newer truth. **Every agent re-reads live `main`, open PRs and `docs/current-work.json` before acting.**

---

## 1. Live state (read back 2026-10-16 ~06:30 UTC)

| PR                                                                             | Lane       | Head        | Checks                                                                     | Blocker                                                                  |
| ------------------------------------------------------------------------------ | ---------- | ----------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| #619 S06 CJK heading breaks + LSN-marketing-001                                | claude     | `b5d3954`   | Quality Gates and visual: success; shards re-running after the base update | Owner merge after 8/8                                                    |
| #623 CX journey polish (F2, F5–F8)                                             | claude     | `3271fa7`   | Quality Gates and visual: success; shards re-running                       | Owner merge after 8/8                                                    |
| #622 mobile, foldable, product privacy clarity                                 | codex      | `8443a24`   | 7/8; **Visual regression gate: failure**                                   | Codex lane: visual baselines                                             |
| #624 Sổ Trọ web preview (registry-driven)                                      | claude     | `71af497`   | Merge policy: needs `owner-approved`; shards skipped                       | sotro#1849 merge, re-vendor, Owner decisions, **file overlap with #622** |
| #625 DEC-039 Part B guard, context 033–043, DEC-034 mapping, DEC-041 reference | claude     | latest push | Merge policy: needs `owner-approved`                                       | Owner label                                                              |
| #615 dev-dependency group bump                                                 | dependabot | `ed36e66`   | Merge policy: needs `owner-approved`                                       | Owner label                                                              |
| sotro#1849 public profile beta/Preview                                         | claude     | `0f267aa6`  | —                                                                          | Owner merge command ("stop at PR")                                       |

Facts measured this session that this plan relies on:

- Render audit 2026-10-16: 240 pages, 0 overflow, 0 axe issues, 0 small targets.
  - **Banner shift:** the locale-suggestion banner moves the H1 down **+86px** (vi, zh and zh-hant visitors on an en-US browser; en visitors on vi-VN).
- 200% text plus WCAG 1.4.12 spacing at 320px:
  - the home product row squeezed the name column to 46px (fixed in #619 for zh/zh-hant);
  - **en/vi at 200% text are NOT VERIFIED.**
- `src/pages/{en,vi,zh,zh-hant}/products/index.astro` compare `lifecycle === "development"` directly. These are the only 4 such comparisons outside `src/lib/`.
- `scripts/check-merge-policy.mjs` flags major changes in either direction. A **downgrade inside the same major** (`^19.3.0 → ^19.2.8`) passes silently.
- A stale `dist/` made local e2e falsely red twice this session.

## 2. Strategy

### 2.1 North star (customer-centric, DEC-041)

> A first-time visitor understands, in 30 seconds and in their language, what BlueSkyz builds, that **Sổ Trọ is open as a web preview** and Sổ Tâm is still in development, and takes one honest next step. Every claim they see has a limit and a source.

CC-1: judge the whole journey first. CC-2: name any degradation. CC-3: never above security, privacy or legal. CC-5: conflicts go to the Owner.

### 2.2 Strategic bets, in priority order

1. **Land what is built (P0).** Four green or near-green PRs carry customer value. Unmerged work has zero customer value and decays through merge conflicts. The queue gets drained before new scope starts.
2. **Sổ Trọ Preview is the launch moment (P1).** This is the first time a BlueSkyz product is open. The whole site must say so consistently, derived from the registry, and must never claim GO or production. Marketing still has no sign-in, no sign-up, no pricing and no payment (#575, D-0).
3. **The accessibility floor is a product feature (P1).** Text zoom, reflow and focus visibility protect real users: older landlords, phones, in-app browsers. A guard is fixed for the fault class, not one instance (LSN-marketing-001 escalation).
4. **Truth architecture over copy patches (P1).** Lifecycle presentation flows through one set of predicates. A new product state must be a registry change, not a 15-file copy hunt. The Preview work showed that it currently is a hunt.
5. **SGPS gaps closed with executable guards (P2).**
   - DEC-034 R4: downgrade guard.
   - DEC-034 R9: flow metrics.
   - DEC-035: lessons.
   - DEC-042: edge verify.
   - DEC-043: staging parity.

   Documentation alone does not close a gap.

6. **v1.0 W2/W3 cards after the above (P3).** These are S05 (banner footprint, now measured), S04, S07 and S09. The G-pilots wait for real participants.

### 2.3 Explicit non-goals for this plan

- No new product admission.
- No pricing, payment, auth or sign-up links.
- No remote AI or Concierge provider.
- No WebGL.
- No new fonts.
- No analytics beyond the approved RUM decision.
- No customer quotes, testimonials or case studies.
- No release or production claim.

### 2.4 Weakest point of this strategy (stated up front)

Bets 1 and 2 depend on Owner actions: merges, labels, sotro#1849, the "beta" decision. If the Owner is unavailable, agents can only prepare. The plan handles this by making every P1/P2 package independently mergeable and by giving parallel lanes disjoint file sets (§5), so prepared work does not rot. Even so, **the time-to-customer is Owner-bound and this plan cannot change that.**

## 3. Architecture decisions

### A1: Lifecycle presentation goes only through predicates

The truth flow is:

1. `src/content/products/*.yaml` (+ `src/data/upstream/*.public-profile.json`)
2. → `src/lib/product-schema.ts` (Zod + DEC-039 Part B refinement)
3. → predicates
4. → surfaces

The predicates are: `webPreviewOpen` (today in `src/components/product/product-page-copy.ts`), `resolveLifecycleCta` (`src/lib/lifecycle-cta.ts`), `act.ts` and `publishability.ts`.

**Decision:**

- Move `webPreviewOpen` into `src/lib/product-lifecycle.ts`, keeping a re-export at the old path so open PRs keep compiling.
- Add `allInDevelopment(products)` there.
- No `.astro` or component file may compare `lifecycle` or `availability` to a string literal.

**Guard:** an architecture test greps `src/**/*.{astro,ts}` outside `src/lib/` for `lifecycle\s*===?\s*"` and `availability\s*===?\s*"` and fails. Negative proof: re-insert one comparison and the test goes red.

**Why:** the Preview change touched about 15 files. One registry flip should change every surface.

### A2: Upstream product truth is vendored only at a merged SHA

`src/data/upstream/sotro.public-profile.json` is a copy of a file from the Sotro repository.

**Decision:** the vendored copy, `sotro.yaml` `sourceRevision`, the README "Upstream revision" line and `docs/evidence/product-source-qualification.json` must all name **one merged upstream SHA**. A provisional copy may exist only on a draft PR whose description says PROVISIONAL.

The existing `sotro-public-profile-drift` architecture test is the guard. WP-04 adds an assertion that `sourceRevision` is 40-hex.

### A3: Promotion lanes (unchanged from v1.0)

- **D0** source-safe UX/copy/test: agent PR.
- **D1** protected paths (`scripts/`, `tests/architecture/`, `tests/visual/`, `AGENTS.md`, `.claude/`, …): Owner label.
- **D2** claims, provider, privacy: Owner/provider.
- **D3** production: separate authority.

**One root cause per PR.** Visual baselines are regenerated only in the PR that changes the pixels.

### A4: Guards and lessons

- Lessons: `docs/lessons/LSN-marketing-<nnn>.json`, validated with sgps-core `tools/sgps_lessons.py validate`.
- A recurrence raises the guard one level in the same fix PR (DEC-035).
- Every blocking guard ships with a negative proof (AGENTS rule 15).

### A5: Text-resize resilience is a layout rule

- Non-text decorations inside text rows (icons, avatars, badges' padding) are sized in `px`, not `rem`. They must not shrink text columns under text zoom.
- Any `white-space: nowrap` run must sit inside a container proven to fit at 320px with 200% text and 1.4.12 spacing.
- WP-06 makes this a site-wide check (G2 → G3 for LSN-marketing-001).

### A6: Local verification hygiene

Local Playwright runs against `astro preview` of a `dist/` built from the current HEAD. WP-12 adds a build stamp (`dist/.build-commit`, written at build) and a local-only Playwright `globalSetup` check that refuses to run when the stamp differs from `git rev-parse HEAD`. CI is unaffected because it builds fresh. This is D0: `astro.config.mjs` and `playwright.config.ts` are not in `PROTECTED_PATHS` (read back 2026-10-16).

## 4. Work packages

Each card lists: goal · files · steps · tests and negative proof · acceptance · lane/gate · depends on · conflicts · agent.

### P0: Land the queue (Owner plus LEAD; no coding agent)

**WP-00 Merge order:**

1. #619, then #623 (both D0, pinned merge after 8/8 on their current heads).
2. #622 (codex lane fixes its visual gate first).
3. #625 (Owner label).
4. #615 (Owner label).
5. sotro#1849 (Owner command).
6. #624 last, after rebase onto #622 and re-vendor (WP-04).

After each merge, the remaining PRs are updated with `main` (update-branch; no rebase or force-push on shared branches).

### P1: Sổ Trọ Preview launch path

**WP-01 Owner decision record: "beta" vs DEC-039 Part B (D2, Owner).**

- Goal: settle the CC-5 conflict.
- LEAD drafts one comment on #624 giving the options:
  - (a) keep `lifecycle: beta` + `availability: preview`. This is allowed: DEC-039 Part B gates only live lifecycles (`active`, `maintenance`), and the #625 guard encodes exactly that.
  - (b) keep `development` + `preview`.
- Recommendation: (a). Weakest point: "beta" may read as more mature than the bounded payOS canary supports. The public label stays "Preview" in every locale.
- Acceptance: an Owner answer is recorded on #624.

**WP-02 Lifecycle predicates (A1) (D1, because of the architecture test).**

- Files:
  - new `src/lib/product-lifecycle.ts`;
  - `src/components/product/product-page-copy.ts` (re-export);
  - `src/pages/{en,vi,zh,zh-hant}/products/index.astro`;
  - new `tests/architecture/lifecycle-predicates.test.mjs`.
- Steps:
  1. Move `webPreviewOpen` and add `allInDevelopment`.
  2. Replace the 4 literal comparisons.
  3. Add the grep guard and its negative-proof test.
- Tests: `pnpm test:architecture`, `typecheck`, `lint`, `build`, `tests/e2e/w4-products-index.spec.ts`, `tests/e2e/sotro-preview-state.spec.ts` (on #624).
- Acceptance: zero literal comparisons outside `src/lib/`; behaviour identical on `main` (all products development).
- Depends on: #622 merged (it touches `product-page-copy.ts`).
- Conflicts: #624 owns the same files, so **land WP-02 inside #624 or immediately after it, not in parallel.**
- Agent: implementer.

**WP-03 Rebase #624 onto #622 (D1).**

- Merge `main` (with #622) into `claude/sotro-preview-status` and resolve the overlaps in:
  - `product-page-copy.ts`
  - `Hero.astro`
  - `sotro.yaml`
  - `home-copy.ts`
  - `[slug].astro` ×4
  - `about.astro` ×4
  - `global.css`
- **Keep both intents.** #622 brings privacy/foldable clarity; #624 brings the registry-driven preview state.
- Run:
  - the full local Chromium-class matrix, after building first;
  - the specs both PRs touch: `exp-s8-empty-states`, `w4-products-index`, `v8-w3-product-pages`, `product-privacy-scope`, `foldable-spanning`, `mobile-overflow`, `sotro-preview-state`, `home-c1`, `wcag22-focus-not-obscured`.
- Acceptance: all green locally; CI waits on the label.
- Agent: implementer.

**WP-04 Re-vendor Sổ Trọ at the merged SHA (D1).**

- Precondition: sotro#1849 merged. Record `M=<merge sha>`.
- Steps:
  1. Copy `docs/product/public-profile.json` at `M` to `src/data/upstream/sotro.public-profile.json`.
  2. Set `sotro.yaml` `sourceRevision: M`, the README "Upstream revision: M" and `product-source-qualification.json` to `M` with today's date.
  3. Add a 40-hex assertion to `tests/architecture/sotro-public-profile-drift.test.mjs`.
  4. Remove "PROVISIONAL" from the #624 description.
- Negative proof: a short SHA or mismatched copy fails the drift test.
- Agent: mechanic (exact spec).

**WP-05 Visual baselines for #624 (D1).**

- Only after WP-03/04. Regenerate the baselines that the copy change legitimately moves.
- The PR comment lists each changed baseline and its reason (copy change, not a layout regression).
- Agent: mechanic plus the reviewer lane for semantic diff.

### P1: Accessibility floor

**WP-06 Site-wide nowrap/text-zoom guard (A5; G2 → G3 for LSN-marketing-001) (D0).**

- Files:
  - new `tests/e2e/a11y-text-zoom-nowrap.spec.ts`;
  - fixes wherever it fails;
  - `docs/lessons/LSN-marketing-001.json` (`guard.level: G3` only if implemented as a site-wide gate; otherwise keep G2 and add the spec path).
- Steps:
  1. For the 9 critical routes × 4 locales at 320px, inject `html{font-size:200%}` + 1.4.12 spacing.
  2. Assert: no element whose computed `white-space` is `nowrap`/`pre` is wider than its nearest block container (skip `clientWidth<=1`, sr-only); and no document horizontal overflow.
  3. Fix real failures at their root cause (A5): px decorations, `minmax(0,1fr)`, wrapping.
- Negative proof: inject a `nowrap` 40-char string into a 200px box and the spec reports it.
- Acceptance: green in all four CI shards; en/vi 200% text becomes VERIFIED for these routes.
- Depends on: #619 merged.
- Agent: implementer.

**WP-07 Locale-suggestion footprint (v1.0 S05, now measured +86px) (D0, visual baseline D1 if pixels change).**

- Files: `src/components/**/LocaleSuggestion.astro`, `public/locale-suggestion-early.js`, its spec.
- Hypothesis: the banner pushes the H1 86px down on short viewports.
- Steps:
  1. Measure the H1 top at 320×568 and 390×667, with and without the banner.
  2. Pilot a compact single-line in-flow suggestion (dismiss + switch, no auto-redirect, no focus steal, no tracking).
- Acceptance:
  - delta ≤ 48px;
  - CLS unchanged;
  - text zoom OK;
  - dismiss persists (existing mechanism);
  - no-JS unchanged.
- Negative proof: an auto-redirect or focus-steal assertion fails if introduced.
- Rollback: restore the current banner.
- Agent: implementer.

### P2: SGPS gaps with executable guards

**WP-08 DEC-034 R4: same-major downgrade guard (D1, security-adjacent).**

- Files: `scripts/check-merge-policy.mjs` and its existing architecture test (locate it with `grep -rl check-merge-policy tests/architecture`).
- Steps:
  1. Parse the minimum version of each range.
  2. If `after < before` on any dependency, push the risk `package.json <field>: <name> downgrade <before> -> <after>`.
- Tests:
  - `^19.3.0 → ^19.2.8` flagged;
  - `^19.2.8 → ^19.3.0` not flagged;
  - unparsable spec still flagged.
- Negative proof: remove the comparison and the downgrade test fails.
- Acceptance: the mapping row R4 changes to `ADOPTED` in `docs/sgps/adoption/SGPS_DEC_2026_034_VERIFICATION_THROUGHPUT.md`.
- Agent: implementer. Owner approval is required; the change touches the merge gate.

**WP-09 DEC-034 R1/R8 negative proofs (D1).**

- Add `tests/architecture/preflight-contract.test.mjs`.
- It reads `.githooks/pre-commit` and asserts that the 7 gate commands are present, that `set -eu` is set, and that no `|| true` swallows an exit code.
- Negative-proof fixtures: a hook text with one gate removed, and one with `|| true`.
- R8: assert that `scripts/check-merge-policy.mjs` `PROTECTED_PATHS` still contains `AGENTS.md`, `.claude/`, `scripts/` and `.github/`, with a removal fixture as its negative proof.
- Agent: implementer.

**WP-10 DEC-034 R9: flow-metric baseline (D0, docs).**

- Use `gh api` to list the last 30 closed PRs and their check runs.
- Compute:
  - first-pass rate of `Quality Gates` and `Browser Assurance` on the first head;
  - median CI wall time;
  - shard durations (this also supplies R5 CI data).
- Write the results with their query and date into the DEC-034 mapping. Unknown values stay NOT VERIFIED.
- Agent: scout (read-only data), then mechanic for the doc.

**WP-11 DEC-042 edge baseline: verify (D2 read-only).**

- Run the sgps-core edge tool in **verify/read-only mode** against `blueskyzlabs.com` from a trusted sgps-core clone at its pinned ref (never from a PR checkout).
- Record the output in `docs/evidence/2026-10-xx-dec042-edge-verify.md` and update the context row.
- No write to the provider.
- Agent: scout plus the reviewer lane. If the tool needs credentials the session does not have, record BLOCKED_OWNER and stop.

**WP-12 Local build stamp (A6; LSN-marketing-002) (D0; configs are not protected paths).**

- Files:
  - `astro.config.*` (`astro:build:done` writes `dist/.build-commit`);
  - `playwright.config.ts` (`globalSetup` only when `!process.env.CI`);
  - new lesson `docs/lessons/LSN-marketing-002.json`.
- Negative proof: build, make a commit, run `npx playwright test` locally, and it refuses with a clear message.
- Agent: implementer.

**WP-13 DEC-043 staging-parity mapping (D0 docs + D1 if a guard is added).**

- Map Cloudflare Workers Builds preview vs production config (`wrangler.toml` read-only).
- Add one parity guard: an architecture test asserting that preview and production share the same `compatibility_date` and flags, or whatever the file actually contains.
- Agent: implementer.

### P3: v1.0 cards, in this order, after P1

- **WP-14** = v1.0 S04 (capture viewer devices), then S07 (keyboard), then S09 (recovery).
  - Each needs a reproduced failure first; otherwise record "no defect reproduced" and stop.
  - The G01/G05/G10 pilots wait for real participants. Missing participants stay NOT VERIFIED; agents never simulate them.

## 5. Parallel-safe file ownership

| Lane                       | Owns (exclusive while open)                                                                                                                                               | Must not touch                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| L-PREVIEW (WP-02/03/04/05) | `product-page-copy.ts`, `src/lib/product-lifecycle.ts`, `products/index.astro` ×4, `[slug].astro` ×4, `Hero.astro`, `home-copy.ts`, `sotro*.{yaml,json}`, `tests/visual/` | `scripts/`, `.githooks/`, `LocaleSuggestion*` |
| L-A11Y (WP-06)             | new zoom spec + the CSS it proves wrong, **except** files owned by L-PREVIEW (report those to the LEAD)                                                                   | `tests/visual/`, `scripts/`                   |
| L-LOCALE (WP-07)           | `LocaleSuggestion.astro`, `locale-suggestion-early.js`, its spec                                                                                                          | `Hero.astro` (coordinate through the LEAD)    |
| L-GATES (WP-08/09/12/13)   | `scripts/check-merge-policy.mjs`, `tests/architecture/{merge-policy,preflight-contract,…}`, `astro.config.*`, `playwright.config.ts`, `docs/lessons/`                     | product and UI files                          |
| L-DATA (WP-10/11)          | `docs/sgps/adoption/*`, `docs/evidence/*` (new files only)                                                                                                                | code                                          |

Run at most **3 coding lanes at once**: L-PREVIEW (Owner-bound), L-A11Y and L-GATES. L-LOCALE starts after L-A11Y merges, because both may move the hero.

## 6. Definition of done (per PR)

- **Before pushing:** live `main` refreshed; one root cause; `pnpm build` first, then the affected specs on Chromium locally.
- **Fast gates:** `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test:architecture`, `pnpm check:client-budget`, `pnpm check:static-links`. The pre-commit hook runs these.
- **Guards:** every new guard has a negative proof shown in the PR body.
- **PR body:** base SHA, files, tests run, NOT VERIFIED list, rollback. Draft until 8/8 green on the exact head.
- **Red CI:** the PR author fixes it at the root cause. Never skip, retry-until-green or weaken.
- **Merge:** pinned to the green SHA (`gh api -X PUT …/pulls/N/merge -f sha=<head> -f merge_method=squash`) only by an authorized lane. Protected paths need the Owner's label first.
- **Reporting:** report DONE / PARTIAL / BLOCKED / NOT VERIFIED and end with "CÒN LÀM TIẾP ĐƯỢC KHÔNG?".

## 7. Red-team of this plan

| Risk                                               | Mitigation in plan                                                                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| WP-02 refactor collides with #622/#624             | Sequenced after #622; same lane as #624                                                                                        |
| WP-06 finds many failures and grows into a mega-PR | One root cause per PR. Skipping or `fixme` is forbidden: land fixes first on the smallest route set, then widen the route list |
| WP-08 weakens the merge gate by mistake            | Pure addition of a risk; existing tests unchanged; Owner label; reviewer lane                                                  |
| WP-11 needs credentials                            | Read-only; BLOCKED_OWNER instead of a workaround                                                                               |
| Agents "verify" with simulated users               | Forbidden; Human E4 stays NOT VERIFIED                                                                                         |
| Plan text drifts from repo truth                   | Every agent re-reads live state; this plan's SHAs are baselines only                                                           |

## 8. Owner actions (the critical path)

1. Merge #619 and #623 once 8/8 green.
2. Codex lane: fix the #622 visual gate, then merge.
3. Apply `owner-approved` to #625 and #615 (review first), then merge.
4. Decide WP-01 (beta vs development) and confirm the #575 no-sign-up stance.
5. Merge sotro#1849, which unblocks WP-04.
6. Optional: point `CLAUDE.md` "Active plan" at v1.0 + this v1.1. `CLAUDE.md` is a protected path, so this is the Owner's change.

## 9. Dispatch prompts

Copy-paste prompts for each coding lane are in `2026-10-16-sgps-marketing-execution-v1-1-dispatch-prompts.md` next to this file. Each prompt is self-contained and names the plan section, owned files, forbidden files, commands, the negative proof required and the stop conditions.
