# Dispatch prompts: Lead Execution Plan v1.1

Companion to `2026-10-16-sgps-marketing-execution-v1-1-lead.md`. Paste one prompt per coding agent.

**Common preamble.** Every prompt below starts with this block. Paste it first, then the lane-specific part.

```text
You are a coding agent on BlueSkyz-Labs/SGPS-Marketing.

BEFORE ANYTHING
- Read AGENTS.md, CLAUDE.md, .claude/AGENT_ROUTING.md.
- Read docs/superpowers/plans/2026-10-16-sgps-marketing-premium-experience-execution-v1.md (v1.0, authority and safety rules).
- Read docs/superpowers/plans/2026-10-16-sgps-marketing-execution-v1-1-lead.md (v1.1: ordering, architecture A1–A6, your work package, §5 file ownership, §6 definition of done).
- Refresh live state: git fetch origin main; list open PRs and their checks; read docs/current-work.json. Plan SHAs are baselines, not permission. If live truth contradicts the plan, stop and report to the LEAD; do not improvise scope.

HARD RULES (never break)
- Never add, remove or ask for the `owner-approved` label. Never enable auto-merge on a PR touching protected paths (scripts/check-merge-policy.mjs PROTECTED_PATHS).
- No force-push, no history rewrite, no --no-verify, no direct push to main.
- Never skip, fixme, weaken or delete a test or gate to get green. Every new blocking guard needs a negative proof (break the invariant, show red, restore).
- Never invent product facts, copy, screenshots, quotes, users or claims. Marketing has no pricing, payment, sign-in or sign-up links (#575, Owner D-0).
- No model names in commits, PRs or code.
- One root cause per PR. Stay inside the files your lane owns (plan §5). If a fix needs a file another lane owns, stop and report.

LOCAL VERIFICATION
- Node >= 24.20 (use the repo's .node-version). pnpm install --frozen-lockfile.
- ALWAYS `pnpm build` before local Playwright (a stale dist/ gives false results).
- Serve with `npx astro preview --port <p> --host 127.0.0.1`. Run Playwright through a temporary local config whose baseURL is that port, and delete it before committing. Do not run `playwright install`; if only Chromium exists locally, Firefox/WebKit evidence is CI-only and stays NOT VERIFIED until CI is green.
- The pre-commit hook runs: test:architecture, typecheck, lint, format:check, build, check:client-budget, check:static-links.

DELIVERY
- Branch `claude/<lane>-<short>-<yyyymmdd>` from current origin/main. Commit with clear messages. Push and open a DRAFT PR.
- PR body: base SHA, root cause, files, tests run (with counts), the negative proof, the NOT VERIFIED list, rollback.
- Drive CI to green on the exact head. On red: root-cause and fix. Not yours → one PR comment saying why.
- Do not merge. Report: DONE / PARTIAL / BLOCKED / NOT VERIFIED, PR URL and exact head SHA. End with "CÒN LÀM TIẾP ĐƯỢC KHÔNG?".
```

---

## Prompt 1: L-PREVIEW: WP-03 + WP-02 (after #622 merges)

```text
[COMMON PREAMBLE]

LANE: L-PREVIEW. Work packages: v1.1 WP-03 then WP-02.
PRECONDITION: PR #622 is MERGED into main. If not, stop and report BLOCKED (do not touch the files #622 changes).

WP-03: bring #624 up to date
- Branch: existing `claude/sotro-preview-status` (PR #624). Merge origin/main into it (merge commit, no rebase). Resolve conflicts keeping BOTH intents: #622 (mobile/foldable/privacy clarity) and #624 (Sổ Trọ preview state derived from the registry via webPreviewOpen). Expected overlap: product-page-copy.ts, Hero.astro, sotro.yaml, home-copy.ts, src/pages/*/products/[slug].astro, src/pages/*/about.astro, global.css.
- Verify locally (after pnpm build): exp-s8-empty-states, w4-products-index, v8-w3-product-pages, product-privacy-scope, foldable-spanning, mobile-overflow, sotro-preview-state, home-c1, wcag22-focus-not-obscured, then the full chromium + mobile-chromium matrix.

WP-02: lifecycle predicates (architecture A1)
- Create src/lib/product-lifecycle.ts exporting webPreviewOpen (moved) and allInDevelopment(products). Keep a re-export from src/components/product/product-page-copy.ts.
- Replace the literal `lifecycle === "development"` comparisons in src/pages/{en,vi,zh,zh-hant}/products/index.astro with allInDevelopment.
- New tests/architecture/lifecycle-predicates.test.mjs: fail if any src/**/*.{astro,ts} outside src/lib/ matches /lifecycle\s*===?\s*"/ or /availability\s*===?\s*"/. Include a negative-proof test that runs the matcher on an injected fixture string and expects a hit.
- Behaviour must be identical; the existing specs prove it.

This PR touches tests/architecture/, so it needs the Owner label. Say so in the PR. Do not re-vendor Sổ Trọ data here (that is WP-04).
STOP when: CI's only red is the merge-policy label step, and that is reported in one PR comment.
```

## Prompt 2: L-PREVIEW: WP-04 + WP-05 (after sotro#1849 merges)

```text
[COMMON PREAMBLE]

LANE: L-PREVIEW. Work packages: v1.1 WP-04 then WP-05. Agent style: exact mechanical edits; no design decisions.
PRECONDITION: BlueSkyz-Labs/sotro PR #1849 is MERGED. Read its merge commit SHA M (40 hex). If not merged, stop: BLOCKED.

WP-04: re-vendor at M, on branch claude/sotro-preview-status (PR #624)
1. Copy sotro repo file docs/product/public-profile.json at M into src/data/upstream/sotro.public-profile.json, byte for byte.
2. src/content/products/sotro.yaml: sourceRevision: M.
3. The README line "Upstream revision" for Sổ Trọ: M.
4. docs/evidence/product-source-qualification.json: the Sổ Trọ entry's revision = M; date = today (ISO).
5. tests/architecture/sotro-public-profile-drift.test.mjs: add an assertion that sourceRevision matches /^[0-9a-f]{40}$/, plus a negative-proof case with a 7-char SHA.
6. Edit the PR #624 description: remove PROVISIONAL and state M.

WP-05: visual baselines
- Only if the Visual regression gate is red on the new head because of the intended copy change. Regenerate exactly the failing baselines with the repo's documented visual-update command (read docs/QA_STRATEGY.md and package.json; do not invent one). In a PR comment, list every baseline file changed with a one-line reason. Never regenerate baselines to hide a layout regression: if a diff shows an unintended change, stop and report it.
```

## Prompt 3: L-A11Y: WP-06 site-wide text-zoom/nowrap guard (after #619 merges)

```text
[COMMON PREAMBLE]

LANE: L-A11Y. Work package: v1.1 WP-06 (architecture A5; lesson LSN-marketing-001 G2→G3).
PRECONDITION: #619 is MERGED (it adds the S06 zoom test and docs/lessons/LSN-marketing-001.json).

Build tests/e2e/a11y-text-zoom-nowrap.spec.ts:
- Routes: / , /products/, /products/sotro/, /products/sotam/, /verify/, /about/, /contact/, /support/, a 404 path, for each locale en, vi, zh, zh-hant.
- Viewport 320x800. Inject CSS: html{font-size:200%!important} *{letter-spacing:.12em!important;word-spacing:.16em!important;line-height:1.5!important}
- Assert A: no element with computed white-space nowrap or pre is wider than its nearest block-level ancestor's clientWidth + 1 (skip ancestors with clientWidth <= 1, i.e. sr-only).
- Assert B: document.documentElement.scrollWidth <= clientWidth.
- Negative-proof test: inject a <span style="white-space:nowrap">AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA</span> into a 200px div; the detector must report it.
Then FIX each real failure at its root cause per A5: px-sized non-text decorations, minmax(0,1fr) text tracks, allowing wraps where nowrap is not needed. One root cause per commit. If a failing file is owned by L-PREVIEW (plan §5: Hero.astro, product-page-copy.ts, [slug].astro, home-copy.ts), stop and report it to the LEAD instead of editing.
Update docs/lessons/LSN-marketing-001.json: add this spec to guard.path, and set level G3 only if the spec covers every critical route in all four CI shards; otherwise keep G2. Validate it with the sgps-core validator (tools/sgps_lessons.py validate) from a trusted sgps-core clone.
Acceptance: green in chromium, firefox, webkit and mobile-chromium. The PR lists en/vi 200%-text results as newly VERIFIED for these routes.
```

## Prompt 4: L-GATES: WP-08 + WP-09 (DEC-034 R4, R1, R8)

```text
[COMMON PREAMBLE]

LANE: L-GATES. Work packages: v1.1 WP-08 then WP-09. Security-adjacent: purely additive; never relax an existing check.

WP-08: same-major downgrade guard
- File: scripts/check-merge-policy.mjs, function that builds package.json risks (DEP_FIELDS loop). Today only a major change (either direction) is flagged; ^19.3.0 -> ^19.2.8 passes silently.
- Add: parse the minimum version of the before and after ranges (support ^, ~, exact, >=; anything unparsable stays flagged as today). If after < before, push `package.json <field>: <name> downgrade <before> -> <after>`.
- Tests: find the existing merge-policy architecture test (grep -rl check-merge-policy tests/architecture) and add cases:
  - ^19.3.0 -> ^19.2.8 flagged;
  - ~5.0.3 -> ~5.0.1 flagged;
  - ^19.2.8 -> ^19.3.0 not flagged;
  - an unparsable spec still flagged.
  Negative proof: show in the PR that removing the comparison turns the downgrade test red.

WP-09: preflight and agent-control negative proofs
- New tests/architecture/preflight-contract.test.mjs:
  (a) .githooks/pre-commit contains `set -eu` and the 7 gate commands (test:architecture, typecheck, lint, format:check, build, check:client-budget, check:static-links), and contains no `|| true` and no `; true`;
  (b) PROTECTED_PATHS exported by scripts/check-merge-policy.mjs still includes AGENTS.md, .claude/, scripts/, .github/, .githooks/, tests/architecture/.
  Each check runs as a pure function over text, with fixtures proving it fails when one gate is removed, `|| true` is added, or a protected path is removed.
- Update docs/sgps/adoption/SGPS_DEC_2026_034_VERIFICATION_THROUGHPUT.md rows R1, R4 and R8 with the evidence (file paths, negative proofs). Do not mark ADOPTED until merged.
This PR touches scripts/ and tests/architecture/, so it needs the Owner label. State it in the PR. Do not touch product or UI files.
```

## Prompt 5: L-GATES: WP-12 local build stamp (LSN-marketing-002)

```text
[COMMON PREAMBLE]

LANE: L-GATES. Work package: v1.1 WP-12 (architecture A6).
- astro.config.*: add a small integration whose astro:build:done hook writes dist/.build-commit containing `git rev-parse HEAD` (if git is unavailable, write "unknown"; never fail the build because of it).
- playwright.config.ts: add a globalSetup used only when !process.env.CI. It reads dist/.build-commit; if it is missing or differs from HEAD, it throws "dist/ was built from <x>, HEAD is <y>: run pnpm build". CI behaviour must be unchanged (prove it: the CI run is green).
- docs/lessons/LSN-marketing-002.json: class local-stale-build-artifact; trigger = 2026-10-16, local e2e falsely red twice on a stale dist/; guard G3 kind preflight; negative proof = build, commit, run local Playwright, refused. Validate it with the sgps-core lesson validator.
astro.config.mjs and playwright.config.ts are not in PROTECTED_PATHS (read back 2026-10-16), so this is D0 unless that list changed; re-check before claiming.
```

## Prompt 6: L-LOCALE: WP-07 locale-suggestion footprint (after WP-06 merges)

```text
[COMMON PREAMBLE]

LANE: L-LOCALE. Work package: v1.1 WP-07 = v1.0 card S05 (now measured: the banner moves the H1 +86px).
- Measure first: H1 top with and without the banner at 320x568 and 390x667 for vi, zh and zh-hant with an en-US browser locale, and en with vi-VN. Record the numbers in the PR.
- Change only LocaleSuggestion.astro, public/locale-suggestion-early.js and its spec: a compact single-line in-flow suggestion with "switch" and "dismiss" actions. Keep: no auto-redirect, no initial focus steal, existing dismiss persistence, no tracking, works with no-JS as today.
- Acceptance:
  - H1 delta <= 48px at both viewports;
  - CLS not worse (Lighthouse CI);
  - passes the WP-06 zoom spec;
  - 44px targets.
- Negative-proof assertions: no navigation occurs on load; document.activeElement stays body after load.
- If pixels change, regenerate only the affected visual baselines in this PR, with reasons (protected path → Owner label).
Rollback: revert the PR (restores the current banner).
```

## Prompt 7: L-DATA: WP-10 + WP-11 (read-only evidence)

```text
[COMMON PREAMBLE]

LANE: L-DATA. Read-only on code. Writes only new docs under docs/sgps/adoption/ and docs/evidence/.

WP-10: DEC-034 R9/R5 baseline
- With the GitHub REST API, take the last 30 merged PRs. For each, take its first head SHA and the check runs on it. Compute:
  - first-pass rate of Quality Gates and Browser Assurance;
  - median and p90 total CI wall time;
  - median duration per browser shard.
- Write the query, the date, the raw counts and the results into docs/sgps/adoption/SGPS_DEC_2026_034_VERIFICATION_THROUGHPUT.md rows R5 and R9. Missing data = NOT VERIFIED; never estimate.

WP-11: DEC-042 edge verify
- From a trusted sgps-core clone at its pinned ref (never a PR checkout), find the DEC-042 edge tool and run ONLY its verify/read-only mode against blueskyzlabs.com. If it needs credentials or write access you do not have, stop and record BLOCKED_OWNER with the exact missing input.
- Record the output in docs/evidence/<date>-dec042-edge-verify.md and propose the context-row update.
```
