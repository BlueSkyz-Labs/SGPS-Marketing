# Wave H8 — mobile sweep + independent design review polish

Date: 2026-09-12
Branch: `feat/wave-h8` (base `475ea7b`, squash of wave H6 / #144)
Status: **VERIFYING** — local gates green; awaiting exact-head Source Assurance.

## Findings

1. **No route-wide mobile sweep existed.** Component specs each checked their own
   320px behaviour, but a single route scrolling sideways on a small phone was
   not caught by anything. Added `mobile-overflow.spec.ts`: 18 public routes +
   both 404 surfaces × 320px and 390px = **40 checks**, each naming the widest
   offending element when it fails. Result on the current build: **all green** —
   the value is the durable guard for small Android viewports.
2. **Independent design review of the passport document** (vision pass on the
   rendered page) produced four real polish items and two false positives:
   - real: the "View in context" link floated with no footer cue → hairline
     divider above it;
   - real: the two-column boundary split had no visible divider on the pale
     panel → `md+` divider between columns;
   - real: the keyboard hint assumed Ctrl → now `Ctrl / ⌘K`;
   - real: a printed document kept the context link as a dead affordance →
     hidden in print and asserted in the print spec;
   - false positive: "10px grid misalignment" — measured: header container,
     passport card and footer all align at left 92px / 60px;
   - false positive: "review date is in the future" — `date` confirms today is
     2026-09-12; the date is today's, not a placeholder.

## Evidence (local, exact this branch)

- `pnpm exec playwright test mobile-overflow.spec.ts` → **40/40 pass**
- print surface + mobile sweep together → **43/43 pass**
- `pnpm test:architecture` → **296 pass / 0 fail** · `pnpm lint` / `format:check` clean
- Print emulation screenshot re-reviewed: no chrome, evidence detail expanded,
  no dead navigation links

## Residual risk

- The overflow sweep uses the viewport width only; zoomed/paginated content
  (200% zoom) remains covered by the accessibility suite, not this spec.
- Review-driven copy/design decisions here are agent judgements within the
  approved objective; anything that changes public claims still needs owner
  review (see the open decisions in `docs/current-work.json`).
