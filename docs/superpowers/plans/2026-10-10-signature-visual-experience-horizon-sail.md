# Horizon / Sail — Signature Visual Experience vNext

**Status:** Owner-approved direction; implementation in progress. Not certified for release.

**Date:** 2026-10-10 (GMT+7).

**Baseline:** `main@aadb58f656eb641480a03e067e7aa0a4d005fd7c` at initial audit. Refresh before every promotion.

**Owner approval:** [Issue #557](https://github.com/BlueSkyz-Labs/SGPS-Marketing/issues/557).

**Decision record:** `docs/decisions/0014-horizon-sail-signature-experience.md`. This protected ADR has its own PR and remains not promoted until Owner-gated checks succeed.

## Goal

Create a visually distinctive BlueSkyz Labs website built around the existing Sail and Horizon brand language. Make real products and verifiable trust feel beautifully composed without sacrificing speed, responsive clarity or honest product status.

Success means a first-time visitor can understand the studio, identify Sổ Trọ and Sổ Tâm, verify their development status and follow a meaningful CTA. A recognizable Sail/Horizon signature must remain clear with the logo temporarily hidden during review.

## Non-negotiable boundaries

- Preserve the approved Brand Kit v4 logos, Ink/Porcelain/Cobalt palette and Inter Variable font.
- Preserve the canonical product registry, true screenshots, lifecycle and sample-data disclosures.
- Preserve all current SGPS Experience, performance, accessibility, privacy, localization and security invariants.
- Never publish hidden products or invent proof, founder photography, testimonials, numbers or product capabilities.
- Reuse existing `HorizonField`, `SailReveal`, `FlagshipCapture`, `EvidenceExplorer` and `RevealObserver`.
- Do not revive closed PRs #547–#555 or reintroduce the unapproved Fraunces font and broad CSS overrides.
- Treat the SGPS AI Factory candidate as not adopted unless its exact approval and promotion become verifiable.
- Keep `main` protected. No agent applies `owner-approved` or skips trusted checks.

## Workstream W0 — Current visual truth

Rebind main, PR queue, brand sources, design contracts, published registry and production version.

Capture actual built and rendered Home, Products, Sổ Trọ profile, Verify, About, Contact and 404 across EN, VI, ZH and ZH-Hant. Include desktop 1440 × 900 and mobile 390 × 844, light/dark, no-JS and reduced-motion. Add 320px CJK, text zoom, keyboard and forced-colors checks.

Deliver a screenshot matrix with commit SHA and environment, a severity-ranked gap map and a measured Lighthouse baseline. Old screenshots and design descriptions do not count as current rendered proof.

**Exit:** Fresh exact-head visual evidence and prioritized findings.

## Workstream W1 — Signature hero

Bring the existing sail and horizon composition into a more unified, readable product-first hero. The first reversible slice uses the existing decorative horizon span on mobile. It is CSS only and adds no new media, font, JS, motion or external requests.

Verify the real app screenshot stays foregrounded, the H1 never animates and the product status and CTA remain accessible within a comfortable mobile viewport.

**Exit:** Before/after 390px and 1440px captures in both themes, reduced-motion and CJK verification, no performance regression, independent reviewer sign-off.

## Workstream W2 — Product theatre

Improve phone screenshot legibility, avoid duplicated product blocks and give the real product interface a clear focus. Consume only existing showcase and lifecycle data.

Use intrinsic image geometry, responsive variants and honest sample-data labels. No invented app screens or unsupported copy.

**Exit:** Mobile readability evidence, working source-backed CTA and image-byte/LCP comparison.

## Workstream W3 — Evidence signature

Create a restrained, distinctive claim → source → limit journey by reusing existing ProofBand, EvidenceExplorer and published claim fabric.

Keep static HTML, keyboard functionality, and reduced-motion parity. Never create fake trust seals or unsupported claims.

**Exit:** A working evidence trail with negative product-truth and accessibility tests.

## Workstream W4 — Editorial consistency

Unify optical spacing, editorial hierarchy, badges, cards and meaningful motion across Home, Products, About, Verify, Contact and 404.

Use current design tokens and the canonical nine-step scale. No extra display font, token drift or new animation framework.

**Exit:** Four-locale visual comparison for desktop/mobile and both themes. Qualified native language review remains a separate requirement.

## Workstream W5 — Independent QA and controlled release

Run architecture contracts, typecheck, lint, formatting, static build, client budget, static links, product-truth checks and the full trusted browser suite. Include visual regression, axe WCAG 2.2 AA and Lighthouse.

Preserve current mobile lab ceilings: LCP at most 2500ms, CLS at most 0.05 and TBT at most 200ms. Honor all route-specific resource caps, the 120kB JavaScript hard cap and the zero-third-party-request rule. Field INP is not verified without field evidence.

Independent reviewers must compare actual before/after renders with the approved brand baseline and examine a first-time visitor's task flow. Failure of a hard gate always overrides a subjective visual score.

Merge only through normal branch → PR → exact-head required checks → merge → post-merge verification. Keep Cloudflare deployment and served-SHA readback separate from source CI.

**Exit:** Exact-head evidence, safe merge, post-deploy verification and explicit residual risks.

## Execution order and handoff

1. W0 is mandatory before declaring visual success; do not replace real screenshots with an agent description.
2. Start W1 as a small reversible candidate while baseline work proceeds. Do not re-author brand assets.
3. Continue through W2, W3 and W4 in independent PRs only after each predecessor passes the applicable gates.
4. Keep Privacy PR #556 and protected ADR PR independent.
5. Use [Issue #557](https://github.com/BlueSkyz-Labs/SGPS-Marketing/issues/557) as the canonical execution ledger and update it with exact commit and CI evidence.
6. Stop only for real Owner-only authority, safety failure, missing essential evidence or an external blocker.

**Verdict until verified:** IN_PROGRESS / NOT_VERIFIED for released visual experience.
