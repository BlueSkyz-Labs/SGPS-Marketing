# Wave H6 — print surface for evidence passports

Date: 2026-09-12
Branch: `feat/wave-h6` (base `8203ae7`, squash of wave H5 / #143)
Status: **VERIFYING** — local gates green; awaiting exact-head Source Assurance.

## Finding

The evidence passport exists to be _read as a document_, and the stylesheet only
had print rules for the collapsed evidence detail (v3 S+6). Everything else
printed as-is: site header, footer, skip link, journey bar and the command
navigator all landed on paper.

## What changed

- `@media print` now hides `header`, `footer`, `.skip-link`,
  `[data-journey-bar]` and `[data-command-navigator]`; the existing
  evidence-detail expansion (`::details-content { content-visibility: visible }`)
  keeps the collapsed detail readable on paper.
- `tests/e2e/print-surface.spec.ts` proves it with real print emulation:
  chrome hidden on the passport **and** the home page, evidence detail visible
  under `media: print`, and screen media restores the chrome afterwards.

## Evidence (local, exact this branch)

- `pnpm exec playwright test tests/e2e/print-surface.spec.ts --project=chromium --workers=1` → **3/3 pass**
- `pnpm build` → Static export verified; e2e runs against the rebuilt parity fixture
- Router: H5 flipped to MERGED; H6 tracked as the single in-progress wave

## Runtime note (H4 follow-up, verified in production)

`https://blueskyzlabs.com/.well-known/security.txt` is now **live** (HTTP 200,
RFC 9116 fields served) — the H4 artifact was verified against production, not
just against source. The smoke suite already asserts it on every deploy.

## Residual risk

- Print fidelity across engines (Firefox/WebKit paged media) is not asserted by
  the spec; the rule set is conservative (hiding chrome, expanding details) and
  the CI matrix runs the spec on all four browser projects.
- `::details-content` is a newer CSS feature; browsers without it simply keep
  the detail expanded on paper via the pre-existing `display: block !important`
  rule.
