# Wave H9 — assistive-tech announcement for the command navigator

Date: 2026-09-12
Branch: `feat/wave-h9` (base `3f50746`)
Status: **VERIFYING** — local gates green; awaiting exact-head Source Assurance.

## Finding

An aria-semantics sweep of the interactive surfaces found exactly one
unannounced dynamic region: the **command navigator** filters its list on every
keystroke, but a screen-reader user got no feedback about how many destinations
remain. The Decision Room already had a polite live region
(`[data-decision-live]`); the navigator had none.

## What changed

- `CommandNavigator.astro` renders a `role="status"` / `aria-live="polite"`
  region carrying localized templates (`"%n results"` / `"%n kết quả"`,
  none-case `"No results"` / `"Không có kết quả"`).
- `command-navigator.ts` updates the region inside the existing filter pass —
  the count is announced on open (full list) and after every query, including
  the no-results case.
- `s-plus-command.spec.ts` gains: EN announcement (attribute checks, non-empty,
  count suffix, exact "No results" on a no-match query) and a VI localization
  check.

## Evidence (local, exact this branch)

- `pnpm exec playwright test tests/e2e/s-plus-command.spec.ts --project=chromium --workers=1` → **8/8 pass**
- `pnpm typecheck` → 0 errors; build passes; parity fixture rebuilt before the run

## Residual risk

- Announcements are text-only counts; using `aria-atomic`/debounce tuning for
  very slow screen readers is possible but would need real AT verification,
  which is human E4 territory (still NOT RUN).
- The live region is inside the dialog; AT behaviour for `showModal()` focus
  hand-off is browser-provided and asserted by the existing command specs.
