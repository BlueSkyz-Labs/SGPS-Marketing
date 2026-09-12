# Wave H13 — text spacing + forced colors guards

Date: 2026-09-13 (Asia/Ho_Chi_Minh)
Branch: `feat/wave-h13` (base `d83711e`, squash of wave H12 / #151)
Status: **VERIFYING** — local gates green; awaiting exact-head Source Assurance.

## Finding

None — and that is the result. Two remaining WCAG text-adaptation dimensions
were probed and came back clean:

- **1.4.12 text spacing** (line-height 1.5, letter-spacing 0.12em, word-spacing
  0.16em, paragraph spacing 2em): no overflow on nine routes.
- **forced colors** (Windows High Contrast emulation): headings, copy and links
  remain rendered on home, security and decision-room.

Per the audit rules a clean probe does not open a rewrite; it earns a guard so
the property is locked rather than re-discovered by the next audit.

## What changed

- `tests/e2e/text-spacing.spec.ts` — 9 routes (EN + VI) with the classic
  spacing overrides applied must not scroll sideways.
- `tests/e2e/forced-colors.spec.ts` — 3 routes under `forcedColors: active`
  must keep their content visible (≥6 visible blocks + a visible h1).

No production markup or styles were touched.

## Evidence (local, exact this branch)

- Probe (pre-guard) → **H13 probe: PASS** (6/6 text-spacing, 2/2 forced-colors)
- `pnpm exec playwright test text-spacing + forced-colors --project=chromium --workers=1` → **12/12 pass**

## Residual risk

- Forced-colors coverage is a visibility sanity check, not a full palette audit
  (non-text contrast in forced mode is provider-owned).
- 1.4.12 coverage uses the canonical override set; other spacing permutations
  are out of scope by the same standard.
