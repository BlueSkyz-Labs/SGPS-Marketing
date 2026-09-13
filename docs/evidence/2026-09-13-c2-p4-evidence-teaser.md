# C2 P4 — compact evidence teaser (homepage trust act)

Date: 2026-09-13
Wave: C2 P4 (design §7 Act IV, plan Task 11)
Status: COMPLETED (agent-side)

## Change

`src/components/integrity/EvidenceTeaser.astro` is now mounted in the homepage
Trust act (`src/components/sections/Trust.astro`, after the Trust Ledger), with
the page's language passed through in both locales.

The component is progressive disclosure only:

- it consumes canonical selectors (`getEvidencePassportIds`, `getEvidencePassport`,
  `getEvidencePassportPath`, the `TruthState` primitive) and authors no claim
  text, evidence reference, review date, or second registry of its own;
- with nothing publishable it renders **nothing** — never an empty shell, never an
  invented placeholder claim;
- it is static-first: a native `details`/`summary` disclosure with no hydration
  directive, no framework island and no script, so the reveal and every deep link
  work with JavaScript disabled;
- its affordance labels are reused verbatim from existing canonical surfaces, so
  no new copy and no new assurance vocabulary enters the public site.

## Evidence

```
pnpm typecheck            → 0 errors / 0 warnings / 0 hints
pnpm lint                 → clean (--max-warnings=0)
pnpm build                → Static export verified
pnpm check:client-budget  → PASS: site-wide 2600 B, worst page 2069 B < 120000 B
pnpm test:architecture    → 306/306
playwright (chromium)
  tests/e2e/c2-evidence-teaser.spec.ts            → 9 passed
  trust-routes + boundary-card + evidence-passport → 32 passed
```

The e2e spec asserts truthfulness in both locales: no empty shell, every
disclosed item links to a canonical deep surface, deep links resolve to the
evidence passport, the disclosure is keyboard-operable, and the rendered text
carries no banned assurance vocabulary.

## Residual

Product-dependent disclosure remains on the owner gate
(`docs/current-work.json` → `screenshot-mandatory-floor`); the teaser shows
published claims only, and a claim becomes publishable solely through the
existing publishability contract — this wave adds no new truth path.
