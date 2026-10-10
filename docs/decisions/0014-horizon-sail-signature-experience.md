# 0014 — Approve Horizon / Sail as BlueSkyz Labs' signature visual experience

- **Status:** Accepted by Owner on 2026-10-10 (design direction); **source/promotion adoption PENDING protected PR merge**.
- **Date:** 2026-10-10 (GMT+7).
- **Decision owner:** BlueSkyz Labs.
- **Approval evidence:** [Issue #557, Owner approval recorded](https://github.com/BlueSkyz-Labs/SGPS-Marketing/issues/557).
- **Implementation authority:** existing approved Brand Kit v4, current SGPS Experience contract, Product Truth, and protected merge rules outrank this ADR on all security/identity/publication questions.
- **Implementation plan:** [2026-10-10 signature visual experience](../superpowers/plans/2026-10-10-signature-visual-experience-horizon-sail.md).

## Context

The website already ships an Ink/Porcelain/Cobalt visual system, Inter Variable, Brand Kit v4, HorizonField, SailReveal, real product captures and trust/evidence interfaces. Its remaining opportunity is recognizable visual craft without diluting product comprehension. Earlier 2026-10-09/10 styling PRs (#547–#555) were closed without merge due to source contracts, inconsistent typography/locale behavior, owner-gated files or Product Truth. Reopening them wholesale is a NO-GO. In particular ADR 0001 is superseded history, not a mandate to reintroduce gold/serif/dark-only styling.

## Decision

**APPROVE A: HORIZON / SAIL — A VERIFIABLE PRODUCT HOUSE.**

Design the site as one restrained, distinguished, trustworthy product house:

1. **Recognizable identity:** approved sail/horizon brand language and *unchanged* production logo/mark. Ink / Porcelain / Cobalt semantic color system, existing Inter Variable typography, standard scale/tokens. The visual signature is composition, lighting, clean optical rhythm and truth-linked graphics, not an accumulation of decorative gradients.
2. **One decisive hero:** one clear studio promise, one genuine flagship screenshot and action, clear status; avoid repeated competing product visual blocks. Preserve the current owner-approved source copy unless a separately approved copy decision changes it.
3. **Product theatre:** source-backed screenshots with readable phone presentation, intrinsic image geometry, progressive images and honest development/sample-data disclosure. If assets are unavailable, render a truthful non-media state rather than invented mockups.
4. **Verifiable beauty:** show the claim → source → qualification journey as a crafted UI pattern, without fabricated counts, awards, seals, logos, availability or unsupported statements.
5. **Calm responsive motion:** prioritize one-shot affordance, purposeful hover/press/focus transitions and motion-off parity. No scroll-jacking, forced video autoplay, gratuitous 3D, perpetual ambient loops, or new JS packages for purely decorative effects.
6. **Four-locale parity:** EN / VI / zh-Hans / zh-Hant and light/dark, 390px/320px, keyboard/screen-reader, no-JS and reduced-motion must remain fully legible and useful.

**Alternatives considered:** B (bright editorial gallery) is visually quieter but less intrinsically recognizable; C (cinematic ink theatre) is visually dramatic but introduces performance and distraction risk. A is approved. B/C may inform measured prototypes only, not unauthorized parallel redesigns.

## Invariants / non-goals

- No rebrand, logo redraw, palette replacement, added remote fonts or webfont-byte expansion; do not import Fraunces/serif from closed PR #553.
- No wholesale CSS override stacks; improvements should be token-native, scoped, reversible, and tested.
- No product activation, paid promises, third-party trackers, legal claims, or real-looking fictitious UI.
- No loosening architecture, a11y, typography, field/CI performance, CSP, privacy, product truth or source assurance.
- No automatic merge of protected ADR, brand, CI, scripts, gated paths without **independent, trusted exact-head checks and required Owner label** under current ruleset. An Owner's conversational design approval is not a GitHub `owner-approved` label and the agent must not self-apply that label.
- This approval is to start implementation, not to assert finished visual design, Human E4 or production promotion.

## Acceptance gates

- Before major visual modification: bind actual current main; capture rendered desktop/mobile baselines and compare to hash-stable Brand Kit v4 references, with reviewer independence recorded.
- Critical journeys: understand company, recognize product and lifecycle, inspect actual product UI, verify claims, contact; provide transparent empty/error states.
- Project SGPS DEC-028 lab budgets: LCP <=2.5s; CLS <=0.05; TBT <=200ms; obey per-route resource budgets and zero third-party policy. Treat field INP as NOT_VERIFIED until legitimate field data.
- Cross-browser visual/regression/a11y/perf and source-truth gates at exact PR SHA; do not label skipped checks as PASS.
- Post-merge/source-readback is not equivalent to provider served-SHA or real-device evidence. Record missing evidence as explicit blocked residual.

## Implementation routing

- **D0 independent:** safe reversible composition/micro-interaction changes using existing styles and source-backed content; ordinary PRs allowed, **after** exact-head checks.
- **D1 guarded:** build or package changes only if justified and independently verified.
- **D2 Owner/protected:** this ADR/index, governance, brand assets, CI / test contract changes; held at Owner gate where required.
- **D3 go-live:** separate security/provider deployment/rollback and customer experience certification.

## Consequences

**Positive:** a single public creative direction; less design fragmentation and fewer contradictory AI-agent CSS passes; signature brand DNA, trust and speed reinforced together.

**Risks:** atmosphere can crowd already-long home content, mobile product imagery can be unreadable, motion can impair performance/accessibility, and first-class global/localized content can diverge.

**Mitigations:** visual budget and single focal point; mobile-first real screenshots; progressive enhancement; source-owned localization; independent comparison with exact-head build; rollback per small PR.

## Revisit if

Quantified user comprehension/readability/performance regresses; Brand Kit approval changes; new verified product screenshots or a revised Owner-facing value proposition materially alters the hero; or independent evaluation shows the signature harms business-critical journeys. Record another ADR instead of silently editing this one.
