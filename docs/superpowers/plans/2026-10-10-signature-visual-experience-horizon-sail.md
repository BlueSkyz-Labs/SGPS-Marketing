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

**W0 — Truth (P1):** Freeze `main`, PR queue, source registry and Brand Kit v4. Capture baseline at 1440 × 900 / 390 × 844, light/dark and all four locales. Deliver screenshots (SHA, route, viewport, theme), Lighthouse/axe baseline, defect/risk map. Reuse existing Playwright and visual tests. Promotion: documentation/QA PR.

**W1 — Signature hero (P1):** Preserve one dominant focal point. Reuse `Hero.astro`, `HorizonField`, `SailReveal`, Inter and Brand Kit v4. First reversible slice: a static mobile horizon seam behind actual app capture with no added media/network/scripts. Deliver before/after screenshot evidence at 390px/1440px, reduced motion, CJK, both themes. Promotion: small feature PR.

**W2 — Product theatre (P1):** Make real product media readable on phones and avoid duplicated user-job stories where fresh renders show them. Reuse `FlagshipTheatre`, `ProductHouse`, `FlagshipCapture` and the showcase registry. Deliver legibility proof, asset bytes, LCP and end-to-end navigation. No new product claims. Promotion: feature PR.

**W3 — Evidence signature (P2):** Create a cohesive source-linked claim → source → limit visual journey, semantic even without JS. Reuse `ProofBand`, `EvidenceExplorer`, `TrustLedger`; verify keyboard, negative truth cases and reduced motion. Promotion: separate PR.

**W4 — Editorial consistency (P2):** Improve Products, About, Verify, Contact and 404 using existing tokens and `c4-quiet-authority.css`. Verify EN/VI/zh/zh-hant × light/dark × 390/1440 and separate native-review residual. Promotion: small per-surface PRs.

**W5 — Red-team/release (P1):** Independent beauty-blind and task walkthroughs, exact-head Source Assurance, Browser Assurance, Lighthouse, WCAG 2.2 AA and product/privacy gates. Reconcile GitHub merge SHA with Cloudflare provider served revision. Missing evidence is NOT_VERIFIED; never skip protected gates.

## 3. W1 precise change envelope

**Allowed first slice:** CSS-only enhancement on the existing `.hero-stage__horizon` decorative span to show a subdued line on 320–767px, behind the real app capture. Keep the existing desktop 1024px visual intact; no extra image, mark, logo, font, content, JS, animation or new data. Progressive enhancement that does not influence DOM order, focus, LCP headline, intrinsic media size or CTAs.

**Required manual review:** if mobile signature line competes with capture or introduces a cross-screen stripe, revert it. Do not use an isolated source inspection to declare the aesthetic successful. This is a candidate implementation, not a final visual acceptance.

**Out of W1:** copy rewrites, desktop hero structural changes, animation-timeline refactors, glass/perpetual glow, font additions, duplicated H1/product cards, design-token forks.

## 4. QA contract / coverage matrix

### Coverage to capture before accepting design

- **Home `/<lang>/`:** Studio proposition, flagship and proof. 1440 × 900 / 390 × 844; light/dark, no-JS, reduced-motion, screenshot readability.
- **Products `/<lang>/products/`:** Browse published products, check truthful registry and lifecycle CTA/status; 1440/390.
- **Flagship `/<lang>/products/sotro/`:** Desktop/mobile real captures, provenance, sample-data label and status.
- **Verify `/<lang>/verify/`:** Accessible focus/keyboard flow, evidence source and limits, no-JS and reduced-motion.
- **About `/<lang>/about/`:** Accurate studio identity; decorative founder illustration must not be presented as photography.
- **Contact `/<lang>/contact/`:** Correct public email identity, useful recovery, no fake sent/received behavior.
- **404 `/<lang>/404/`:** Semantic recovery headline, real destinations and a calm brand moment.

`<lang>` means `en`, `vi`, `zh`, `zh-hant`. Also capture 320px, text zoom and spacing, CJK wrapping, landscape clipping, forced colors and a keyboard-only flow. Native-locale review is **NOT_VERIFIED** until a qualified reviewer actually signs off.

### Blocking quality and negative tests

- **Architecture:** `pnpm test:architecture` including nine-step font-size, logo fidelity, Product Truth, protected source and S7 hero LCP immobility.
- **Source:** `pnpm typecheck && pnpm lint && pnpm format:check && pnpm build && pnpm check:client-budget && pnpm check:static-links`.
- **Browser:** exact-head four configured projects (Chromium, Firefox, WebKit, mobile Chromium), Playwright visual regression and axe 2.2 AA. Particularly: 390px mobile, 320px CJK, EN/VI/zh/zh-hant, keyboard/focus, no-JS, reduced-motion, forced-color.
- **Performance:** SGPS DEC-028 project lab ceilings LCP <=2500ms, CLS <=0.05, TBT <=200ms; field INP <=200ms only where real field evidence exists; existing route-specific resource ceilings, 0 third-party requests, 0 render-blocking resources, 120kB JS hard budget. Relative W0 performance must not regress beyond measured lab noise; positive aesthetic score does not compensate for a failure.
- **Negative:** no extra font fetched; no hidden product public activation; no extra fake claims/seals; `prefers-reduced-motion` still useful; background decorations `aria-hidden` and pointer-inert; heading never animates; trust/evidence links remain real; no broken `zh-hant` text; no new production config/unsafe deploy.
- **Independent:** another reviewer must judge before/after real render against brand DNA and a brief task-based comprehension test (logo-hidden uniqueness, status/CTA in first view); model self-rating is not Human E4.
- **Merge:** trusted required checks at PR **head**, no stale/skipped PASS, Owner-gated changes isolated from ordinary feature PR. Record actual merge SHA, CI and provider served revision. If no provider readback, deployed status = NOT_VERIFIED.

## 5. Art-direction scorecard (review rubric, no invented score)

- **Brand recognizability / Sail DNA — 20%:** Is it generic SaaS when the logo is hidden?
- **Hero focal clarity and immediate comprehension — 20%:** Competing focal points or invisible status fail.
- **Real mobile-legible product visualization — 20%:** Tiny or invented captures fail.
- **Calm optical typography / craft — 15%:** Added fonts, token forks and inconsistent scale fail.
- **Accessibility and responsive parity — 10%:** CJK overflow and keyboard loss fail.
- **Performance / motion / control — 10%:** Regression, perpetual loops or new unneeded bytes fail.
- **Verifiable trust and lifecycle truth — 5%:** Invented assurance claims or fake status fail.

Never publish self-awarded scores without a capture and reviewer method. Any hard gate FAIL overrides weighted score.

## 6. Handoff and next actions

1. **Owner-approved:** A/Horizon-Sail is the only active art direction; do not ask again to choose A/B/C.
2. **Agent execution:** Implement W1 scoped mobile horizon candidate now; run exact-head tests and browser evidence. Execute W0 full screenshot matrix as soon as a trusted browser/CI runner is available; screenshots must bind to the same commit, not an older doc.
3. W2 next after W1 is green: review true Sổ Trọ screenshots and adapt mobile product theatre without falsifying UI.
4. Keep #556 privacy PR independent, no silent rebase/merge; keep #557 as execution ledger.
5. Protected ADR `docs/decisions/0014-...` follows its own Owner-gated PR, **never** bundled to work around checks.
6. Production deployment/verification belongs to Cloudflare Workers Build and post-deploy readback. This document does not activate a deployment.

**Exit definition:** W0–W5 artifacts, reliable QA and source/prod trace all complete. Until then `IN_PROGRESS / NOT_VERIFIED`, irrespective of code status.
