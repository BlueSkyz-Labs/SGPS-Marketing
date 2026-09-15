# C2 P5 — Human trust layer, closing signature, and secondary surfaces

Date: 2026-09-15
Wave: C2 P5 (plan Tasks 12–13, PR-F)
Status: MERGED

## Scope

P5 completes the human trust moment, final invitation, closing decorative signature, and secondary surfaces audit:

1. **Task 12 — Human layer + closing Horizon signature**: Merged through PR #170 (`d5bca7d`) and PR #171 (`028b1dd`).
   - `AboutBlueSkyz.astro`: Added `data-about-blueskyz` testability attribute; factual founder attribution ("Tony Nguyen — Founder & CEO" / "Tony Nguyen — Nhà sáng lập & Giám đốc điều hành"); strict EN/VI parity using `SITE` data; no fabricated biography, customer counts, or office locations.
   - `NextStep.astro`: Added `data-final-action` attribute; strictly bounded CTA count (max 2); full compliance with `act.ts` empty-registry routing (primary CTA to About/Contact, secondary CTA to Security).
   - `HorizonField.astro`: Extended with `{...rest}` spread to forward arbitrary attributes (`data-closing-horizon`, etc.).
   - Homepage composition: Added decorative closing signature `<HorizonField class="c2-closing-signature" data-closing-horizon aria-hidden="true" />` after NextStep in both `src/pages/en/index.astro` and `src/pages/vi/index.astro`.
   - Styles (`cinematic-product-house.css`): Added `.c2-closing-signature` rules (muted opacity, pointer-events off, reduced-motion safe).
   - Test suite: Activated `tests/e2e/c2-p5-human-layer.spec.ts` (10 tests asserting factual content, CTA count, internal destinations, aria-hidden signature, and 390px mobile viewport). Disambiguated `tests/e2e/s-plus-horizon.spec.ts` using `.first()` to resolve multi-horizon strict mode ambiguity.

2. **Task 13 — Secondary surfaces audit**: Completed.
   - Audited all 9 primary secondary routes across both locales:
     - `/en/about` and `/vi/about`
     - `/en/security` and `/vi/security`
     - `/en/privacy` and `/vi/privacy`
     - `/en/contact` and `/vi/contact`
     - `/en/support` and `/vi/support`
     - `/en/products/index` and `/vi/products/index`
     - `404` (root, `/en/404`, `/vi/404`)
     - `/en/decision-room` and `/vi/decision-room`
     - `/en/evidence/[id]` and `/vi/evidence/[id]`
   - Audit categories: Heading hierarchy (H), Accessibility (A), Mobile overflow (M), Bilingual parity (B), Template copy (T), CTA correctness (C), Spacing (S).
   - Result: 0 HIGH-severity defects. Surfaces meet WCAG 2.1 AA, have touch targets >= 44px, zero horizontal overflow at 390px, 1:1 EN/VI parity, clean static link paths, and maintain calm, readable trust ergonomics. No runtime changes needed.

## Evidence summary

- PR #170: Commit `d5bca7d`
  - Quality Gates: PASS
  - Browser Assurance: PASS
  - Workers Builds: PASS
- PR #171: Commit `028b1dd`
  - Quality Gates: PASS (46s)
  - Browser Assurance: PASS (15m50s)
  - Workers Builds: PASS

## Current truth

- Homepage composition: Hero → FlagshipTheatre → ProductHouse → OneHouse → Trust → AboutBlueSkyz → NextStep → HorizonField (closing signature).
- No animations or heavy cinematics added to trust or legal pages.
- Empty public registry safely routed via `act.ts`.
- Zero broken links (1008 checked).
