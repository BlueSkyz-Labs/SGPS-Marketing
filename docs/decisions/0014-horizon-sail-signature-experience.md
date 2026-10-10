# ADR 0014: Horizon / Sail signature experience

**Status:** Owner approved on 2026-10-10; merge is subject to repository gates.

**Decision owner:** BlueSkyz Labs.

**Evidence:** [Issue #557](https://github.com/BlueSkyz-Labs/SGPS-Marketing/issues/557).

**Plan:** [Horizon / Sail W0-W5](../superpowers/plans/2026-10-10-signature-visual-experience-horizon-sail.md).

## Context

The website already uses Brand Kit v4, Ink, Porcelain, Cobalt, Inter Variable,
HorizonField, SailReveal and real product captures. This decision refines that
identity; it does not replace it. ADR 0001 is superseded. Closed PRs #547-#555
are historical experiments, not approved implementation branches.

## Decision

Adopt **Horizon / Sail: A Verifiable Product House** as the signature visual
direction for BlueSkyz Labs.

The design emphasizes a calm, recognizable sail and horizon; one clear hero
promise and product action; readable real-app screens; explicit development
status; and a crafted path from public claims to their sources and limits.

Product Truth is a prerequisite for visual spectacle. Do not fabricate
screenshots, testimonials, statistics, brands, capabilities, verification seals
or availability. Source-backed real screenshots retain their sample-data
disclosure.

Reuse the canonical Brand Kit v4 logo, palette, tokens and Inter Variable font.
Do not add serif fonts, duplicate stylesheets, uncontrolled parallax, WebGL,
autoplay video, perpetual decoration or unneeded JavaScript. Motion must respect
reduced-motion preferences, keyboard operation and static content.

Support English, Vietnamese, simplified Chinese and traditional Chinese, in
light/dark modes and mobile/desktop layouts.

## Scope and sequencing

- W0: Capture exact-head visual, performance and truth baselines.
- W1: Improve the existing signature hero without changing product truth.
- W2: Make real product captures and product theatre legible on mobile.
- W3: Craft an accessible evidence path, without unsupported assurances.
- W4: Unify the editorial experience across public pages and four locales.
- W5: Run independent browser, a11y, performance, security and user review.

Use independent small PRs with reversible changes. Recheck `main`, open PRs,
current-work status and source evidence before every wave. The project SGPS
experience contract and current brand/security rules retain precedence.

## Release criteria

- A meaningful product CTA and honest lifecycle status remain visible.
- The LCP heading never animates; no new third-party requests or extra fonts.
- Lab LCP is at most 2500ms, CLS at most 0.05 and TBT at most 200ms.
- Existing route budgets, the JavaScript cap and WCAG 2.2 AA remain enforced.
- Browser, Lighthouse, visual, source truth and architecture gates pass at
  the exact PR head. Skipped or stale checks are not a PASS.
- Independent reviewer examines real desktop and mobile renders.
- Provider served revision and real-user E4 are verified separately.

## Authority and risks

Conversation approval confirms the art direction, not permission to bypass
the `owner-approved` GitHub label on protected paths. Agents do not apply
that label or relax branch policies. Merge and deployment remain separate
controlled acts.

A visually stronger hero may compete with product comprehension. A mobile
screenshot may remain too small despite correct CSS. Revert a wave when
readability, trust, responsiveness or performance regresses. Record a new ADR
when this direction must change; do not silently revise this decision.
