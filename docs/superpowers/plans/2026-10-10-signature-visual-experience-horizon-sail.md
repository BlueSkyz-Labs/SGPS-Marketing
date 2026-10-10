# Horizon / Sail — Signature Visual Experience: vNext execution plan

> **Owner direction:** APPROVED 2026-10-10, [Issue #557](https://github.com/BlueSkyz-Labs/SGPS-Marketing/issues/557).  
> **Current status:** WORK_READY / EARLY IMPLEMENTATION (not design/release certification).  
> **Baseline at planning:** `main@aadb58f656eb641480a03e067e7aa0a4d005fd7c`. Refresh this SHA before every new PR.  
> **ADR:** `docs/decisions/0014-horizon-sail-signature-experience.md` (Owner-approved direction; independent Owner-gated ADR PR, not a merged policy until promoted).  
> **Canonical project truth:** `AGENTS.md`, `docs/current-work.json`, `docs/sgps/EFFECTIVE_SGPS_CONTEXT.md`, current Brand Kit v4 and `docs/sgps/2026-10-09-AI_FACTORY_EXPERIENCE_ADOPTION.md`. Do not repin or treat SGPS Core #293 candidate as adopted.

## 0. Product and visual thesis

**Positioning:** BlueSkyz Labs is a calm, verifiable, product-first software house. Its Ink/Porcelain/Cobalt visual vocabulary, Sail mark, horizon and trustworthy real-app UI are the **distinctive** visual elements. Make one clear scene, with one focal point, one action and an evidence trail.

**Success observable by an ordinary visitor:**
- Within a short first view: what BlueSkyz Labs builds, what Sổ Trọ / Sổ Tâm do, the products' **real** lifecycle and where to click.
- At 390px: meaningful app screenshot/readable crop without pixel-size labels or required zoom, a legible status and tappable CTA.
- A consistent brand signature recognizable without logo lockup, while whitespace, contrast and line breaks remain disciplined.
- Evidence/claim links are transparent and genuinely accessible, not simulated trust badges.
- Interactions feel responsive, do not animate the LCP headline, do not obscure content or request additional third-party scripts.

## 1. Baseline facts and negative controls

**Observed source:** Astro 7 / TS / Tailwind 4, 4 locales, Cloudflare Workers. Home `Hero` → `FlagshipTheatre` → `ProductHouse` → `ProofBand`, with existing `HorizonField`, `SailReveal` and source-backed `FlagshipCapture`.

**Do not repeat closed PR failures:**
- #549–#553: large unreviewed theme overrides, alternative typeface and locale/contrast regressions.
- #554: noncanonical font-size / Vietnamese uppercase contract.
- #545/#548: protected paths without Owner-approved GitHub label.
- #555: unpublished product activation contrary to source-of-truth. This wave cannot publish hidden products.
- #535/#536 merged: reuse their reveal, tactile and evidence systems; no duplicate JS/animations.

**Evidence hygiene:** historical beauty-blind audit from 2026-10-03 is a hypothesis source, not a current screenshot. Repo-source inspection is E1. Current 390/1440 screenshots and independent browser observations = NOT_VERIFIED in this planning session. Do not claim exact deployed Worker SHA.

## 2. Engineering sequence

| Wave | Scope / output | Existing implementation reused | Exit evidence | Promotion |
| --- | --- | --- | --- | --- |
| **W0 Truth** P1 | Freeze `main`, PR, source registry/brand lock; baseline map across 4 locales/2 themes, desktop/mobile; defects ranked by impact | `src/pages/{en,vi,zh,zh-hant}/`, current playwright/visual tests | Screenshot contact sheet with SHA, browser build, route, viewport, theme; Lighthouse/axe baseline | Documentation/QA PR |
| **W1 Signature hero** P1 | Horizon/Sail responsive visual continuity, single focal point and non-LCP decoration; start with low-risk **static mobile horizon seam** using existing markup, no media/network/scripts | `Hero.astro`, `HorizonField`, `SailReveal`, Inter, Brand Kit v4 | Before/after 390px and 1440px, reduced motion, CJK, color modes, no layout jump | Small reversible feature PR |
| **W2 Product theatre** P1 | Mobile-readable source-backed screenshot and clearer 1× focus on user job; remove redundant beats only if baseline proves repetition | `FlagshipTheatre`, `ProductHouse`, `FlagshipCapture`, showcase registry | Visual legibility proof; image bytes, LCP and end-to-end product navigation | Feature PR (no new product claims) |
| **W3 Evidence signature** P2 | Distinctive but restrained claim→source→limit visual trail, fully semantic and functional without JS | `ProofBand`, `EvidenceExplorer`, `TrustLedger` | Link trace, reduced-motion, keyboard, stale/unpublished data negative checks | Separate PR |
| **W4 Editorial consistency** P2 | Harmonize Product/About/Verify/Contact/404 framing, typography rhythm, status and action density | Existing design tokens, `c4-quiet-authority.css`, route-specific components | 4 locales × light/dark × 390/1440 comparisons and native-review residual | Small per-surface PRs |
| **W5 Red-team/release** P1 | Independent beauty-blind and task walkthroughs, perf/a11y/security/truth regression, rollback | Existing Source Assurance + Browser Assurance, Lighthouse, SGPS DEC-028 | Exact-head receipts; production readback separated from source | Never skip protected gates |

## 3. W1 precise change envelope

**Allowed first slice:** CSS-only enhancement on the existing `.hero-stage__horizon` decorative span to show a subdued line on 320–767px, behind the real app capture. Keep the existing desktop 1024px visual intact; no extra image, mark, logo, font, content, JS, animation or new data. Progressive enhancement that does not influence DOM order, focus, LCP headline, intrinsic media size or CTAs.

**Required manual review:** if mobile signature line competes with capture or introduces a cross-screen stripe, revert it. Do not use an isolated source inspection to declare the aesthetic successful. This is a candidate implementation, not a final visual acceptance.

**Out of W1:** copy rewrites, desktop hero structural changes, animation-timeline refactors, glass/perpetual glow, font additions, duplicated H1/product cards, design-token forks.

## 4. QA contract / coverage matrix

### Coverage to capture before accepting design

| Route | Purpose | Required states |
| --- | --- | --- |
| `/<lang>/` | Studio, proposition, flagship + proof | 1440×900 / 390×844; light/dark; no-JS; motion-reduce; screenshot/readability |
| `/<lang>/products/` | Browse published products | 1440/390; real registry, nonpublic products absent, CTA/status |
| `/<lang>/products/sotro/` | Understand main product | desktop/mobile captures + source provenance, label, status, no fabricated UI |
| `/<lang>/verify/` | Trace evidence | keyboard, focus, source/limit, no-JS and reduced-motion |
| `/<lang>/about/` | Recognize studio | 1440/390, decorative founder artwork not presented as photo |
| `/<lang>/contact/` | Meaningful CTA | accurate real email state; no false transactional form |
| `/<lang>/404/` | Clear recovery | semantic heading and genuine routes, compact brand moment |

`<lang>` = `en`, `vi`, `zh`, `zh-hant`. At minimum also capture 320px and text zoom / spacing, CJK wrapping, landscape clipping, forced colors and one keyboard-only flow. Mark native-locale review **NOT_VERIFIED** unless a qualified native reviewer actually signs off.

### Blocking quality and negative tests

- **Architecture:** `pnpm test:architecture` including nine-step font-size, logo fidelity, Product Truth, protected source and S7 hero LCP immobility.
- **Source:** `pnpm typecheck && pnpm lint && pnpm format:check && pnpm build && pnpm check:client-budget && pnpm check:static-links`.
- **Browser:** exact-head four configured projects (Chromium, Firefox, WebKit, mobile Chromium), Playwright visual regression and axe 2.2 AA. Particularly: 390px mobile, 320px CJK, EN/VI/zh/zh-hant, keyboard/focus, no-JS, reduced-motion, forced-color.
- **Performance:** SGPS DEC-028 project lab ceilings LCP <=2500ms, CLS <=0.05, TBT <=200ms; field INP <=200ms only where real field evidence exists; existing route-specific resource ceilings, 0 third-party requests, 0 render-blocking resources, 120kB JS hard budget. Relative W0 performance must not regress beyond measured lab noise; positive aesthetic score does not compensate for a failure.
- **Negative:** no extra font fetched; no hidden product public activation; no extra fake claims/seals; `prefers-reduced-motion` still useful; background decorations `aria-hidden` and pointer-inert; heading never animates; trust/evidence links remain real; no broken `zh-hant` text; no new production config/unsafe deploy.
- **Independent:** another reviewer must judge before/after real render against brand DNA and a brief task-based comprehension test (logo-hidden uniqueness, status/CTA in first view); model self-rating is not Human E4.
- **Merge:** trusted required checks at PR **head**, no stale/skipped PASS, Owner-gated changes isolated from ordinary feature PR. Record actual merge SHA, CI and provider served revision. If no provider readback, deployed status = NOT_VERIFIED.

## 5. Art-direction scorecard (review rubric, no invented score)

| Lens | Weight | Anti-failure |
| --- | ---: | --- |
| Brand recognizability / Sail DNA | 20 | Could be any generic SaaS with logo hidden |
| Hero focal clarity and immediate understanding | 20 | Two competing focal points; hidden real status |
| True product visualization, mobile legibility | 20 | Screenshots unreadable or fabricated |
| Calm optical typography + visual craft | 15 | Additional fonts/palette, inconsistent scale |
| Accessibility + responsive parity | 10 | Locale clipping / nonfunctional keyboard |
| Perf / motion / user control | 10 | Added bytes, looped animation, LCP regression |
| Verifiable trust and honest lifecycle | 5 | Fake signals or claims unsupported by registry |

Never publish self-awarded scores without a capture and reviewer method. Any hard gate FAIL overrides weighted score.

## 6. Handoff and next actions

1. **Owner-approved:** A/Horizon-Sail is the only active art direction; do not ask again to choose A/B/C.
2. **Agent execution:** Implement W1 scoped mobile horizon candidate now; run exact-head tests and browser evidence. Execute W0 full screenshot matrix as soon as a trusted browser/CI runner is available; screenshots must bind to the same commit, not an older doc.
3. W2 next after W1 is green: review true Sổ Trọ screenshots and adapt mobile product theatre without falsifying UI.
4. Keep #556 privacy PR independent, no silent rebase/merge; keep #557 as execution ledger.
5. Protected ADR `docs/decisions/0014-...` follows its own Owner-gated PR, **never** bundled to work around checks.
6. Production deployment/verification belongs to Cloudflare Workers Build and post-deploy readback. This document does not activate a deployment.

**Exit definition:** W0–W5 artifacts, reliable QA and source/prod trace all complete. Until then `IN_PROGRESS / NOT_VERIFIED`, irrespective of code status.
