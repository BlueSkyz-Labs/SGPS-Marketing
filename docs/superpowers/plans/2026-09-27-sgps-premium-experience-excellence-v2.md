# SGPS Premium Experience & Design Excellence v2.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Reconciliation 2026-10-03:** this plan's task text is historical. Phases 1–3 and 5 were delivered or superseded by the v5/v8/v6 programs (`#302`–`#439`); the VietQR engine tasks (Task 4–5) are superseded by the P0 VietQR removal (#302) and the Owner D-0 marketing payment boundary — do not implement them. Evidence: `docs/evidence/2026-10-03-experience-v6-slice-reconciliation.md`; `docs/current-work.json` carries the reconciled status.

**Goal:** Transform the BlueSkyz Labs public web ecosystem into a human-centered, living product experience that people genuinely need, understand, trust, enjoy, and can use successfully in real-world contexts (Vietnam and global).

**Architecture:** Static-first Astro 7 output on Cloudflare Edge, zero-knowledge client computations, local-first storage, strictly bounded client JS (<120 KB Brotli), and fail-closed Dual-Control source assurance.

**Tech Stack:** Astro 7, TypeScript 6, Tailwind CSS v4, Playwright E2E matrix, Node architecture test runner, axe core, Lighthouse.

**Spec Reference:** `docs/superpowers/specs/2026-09-27-sgps-premium-experience-excellence-v2-design.md`

---

## Global Invariants & Constraints

1. **Dual-Control Merge Discipline:** Direct push to `main` is blocked by ruleset `main-promotion-governance` (`22500299`). Every wave executes via `Branch → PR → exact-head Quality Gates + Browser Assurance → Squash Merge`.
2. **Zero Fabrication:** Never invent product claims, fake reviews, artificial metrics, or unverified employee quotes.
3. **Client JS Budget Floor:** Total Brotli client script must remain under 120 KB (current: 9.7 KB site-wide).
4. **Touch & Reflow Ergonomics:** 44px minimum touch target height across all actionable elements; zero horizontal scroll at 320px with 200% text zoom (WCAG 1.4.4).
5. **Fail-Closed Trilingual Parity:** All pages and product profiles maintain complete structural and factual parity across `en`, `vi`, and `zh`.

---

## Phase 1: Unblock & Merge Living Product Maison (PR #269 / C2 P0)

### Task 1: Reconcile Owner-Fact Gate & Update Current Work Router

**Files to modify:**

- `docs/current-work.json`
- `AGENTS.md`
- Create evidence: `docs/evidence/2026-09-27-c2-p0-product-truth-activation.md`

**Steps:**

- [ ] **Step 1:** In `docs/current-work.json`, mark `c2-p0` status as `MERGED` and update `c2-master-plan` to `MERGED`.
- [ ] **Step 2:** Resolve the `screenshot-mandatory-floor` decision in `openOwnerDecisions`, recording Owner approval of the authentic brand/interface assets in `C:\00. AI Project\00_BlueSkyzLabs`.
- [ ] **Step 3:** Record verification evidence in `docs/evidence/2026-09-27-c2-p0-product-truth-activation.md`.

### Task 2: Rebase & Polish `feat/p0-blueskyz-product-house` on `main@204c4bb`

**Branch:** `feat/p0-blueskyz-product-house`  
**PR:** `#269`

**Steps:**

- [ ] **Step 1:** Fetch `origin/main` (`204c4bb`) and rebase `feat/p0-blueskyz-product-house`.
- [ ] **Step 2:** Verify 5 products exist in `src/content/products/*.yaml` with verified slugs (`apexagent`, `sotam`, `sotro`, `fluentarc`, `vungtaylai`).
- [ ] **Step 3:** Convert PR #269 from `DRAFT` to `READY FOR REVIEW`.
- [ ] **Step 4:** Ensure local verification gates pass cleanly (`pnpm test:architecture`, `pnpm check:product-provenance`, `pnpm check:publishability`, `pnpm check:client-budget`, `pnpm check:static-links`).

### Task 3: Dual-Control CI Gate Verification & Squash Merge PR #269

**Steps:**

- [ ] **Step 1:** Monitor remote GitHub Actions CI run on PR #269 (`Quality Gates` and `Browser Assurance`).
- [ ] **Step 2:** Once green, squash merge PR #269 with `--match-head-commit`.
- [ ] **Step 3:** Fast-forward local `main` with `git pull --ff-only origin main`.

---

## Phase 2: Vietnam-Native Workflows & Sổ Trọ VietQR Engine (G02, G07, S06)

### Task 4: Client-Side Deterministic VietQR Generator

**Files to create/modify:**

- Create: `src/lib/vietqr.ts`
- Create: `tests/architecture/vietqr-contract.test.mjs`
- Create: `tests/e2e/vietqr-billing.spec.ts`

**Specifications:**

- Pure client-side generation conforming to EMVCo and NAPAS 247 specifications.
- Input parameters: Bank BIN, Account Number, Amount, Transaction Description.
- Output: Standardized TLV (Tag-Length-Value) QR payload with CRC16-CCITT checksum validation.
- Zero network calls; no financial telemetry transmitted.

**Steps:**

- [ ] **Step 1: Write RED tests** for TLV encoding, CRC16 checksum calculation, and input validation.
- [ ] **Step 2: Implement `generateVietQRPayload()`** in `src/lib/vietqr.ts`.
- [ ] **Step 3: Add architectural guard** proving zero remote fetch or localStorage leakage in `tests/architecture/vietqr-contract.test.mjs`.

### Task 5: Sổ Trọ Billing Affordance & Zalo Direct-Share Card

**Files to create/modify:**

- Create: `src/components/product/VietQRCalculator.astro`
- Modify: `src/pages/vi/products/sotro.astro` (or localized profile route)

**Specifications:**

- Intuitive utility interface: electricity/water meter input $\rightarrow$ automatic bill calculation $\rightarrow$ instant VietQR preview.
- Canvas-rendered shareable receipt image optimized for 1-tap sharing in Zalo in-app browser.
- High-contrast typography with minimum 44px tap targets.

**Steps:**

- [ ] **Step 1:** Build accessible calculation UI with semantic inputs and VND currency formatting.
- [ ] **Step 2:** Wire instant QR code preview using SVG/Canvas.
- [ ] **Step 3:** Add E2E tests validating calculation accuracy, responsive reflow, and keyboard navigation.

### Task 6: Vietnamese Typography & Diacritic Break-Word Tuning

**Files to modify:**

- `src/styles/global.css`
- `src/components/product/ProductCard.astro`
- `src/components/product/FlagshipTheatre.astro`

**Steps:**

- [ ] **Step 1:** Apply `[overflow-wrap:anywhere]` and fine-tune word break rules for compound Vietnamese phrases on narrow 320px screens.
- [ ] **Step 2:** Verify zero horizontal overflow across all Vietnamese routes under 200% text zoom.

---

## Phase 3: Structured SEO & Machine Discoverability (S04, S05)

### Task 7: Schema.org `SoftwareApplication` Structured Data

**Files to modify:**

- `src/layouts/BaseLayout.astro`
- `src/lib/seo.ts`
- Create: `tests/architecture/software-application-schema.test.mjs`

**Specifications:**

- Automatically emit JSON-LD `SoftwareApplication` schema for all product profile routes (`/products/[slug]`).
- Includes fields: `name`, `applicationCategory`, `operatingSystem`, `offers`, `description`, `publisher`.

**Steps:**

- [ ] **Step 1: Write failing architecture test** requiring valid JSON-LD on all product profile pages.
- [ ] **Step 2: Implement schema helper** in `src/lib/seo.ts`.
- [ ] **Step 3: Validate with Google Rich Results criteria** (zero errors, zero missing required fields).

### Task 8: Dynamic OpenGraph Social Cards & Sitemap Enumeration

**Files to modify:**

- `src/pages/sitemap.xml.ts`
- `src/pages/robots.txt.ts`

**Steps:**

- [ ] **Step 1:** Verify `sitemap.xml` enumerates all 5 products across all 3 languages (15 distinct product URLs).
- [ ] **Step 2:** Ensure canonical reciprocal hreflang links exist between `en`, `vi`, and `zh` product URLs.

---

## Phase 4: Horological Precision & Tactile Ergonomics (S01, S02, S03)

### Task 9: Horological Micro-Tick Feedback

**Files to create/modify:**

- `src/styles/cinematic-product-house.css`
- `src/components/ui/ButtonLink.astro`

**Specifications:**

- Mechanical click feedback on button press (60ms subtle transform, instant recovery).
- Strictly disabled under `prefers-reduced-motion: reduce`.

**Steps:**

- [ ] **Step 1:** Add CSS micro-tick active states using standard ease curves.
- [ ] **Step 2:** Add Playwright tests verifying reduced-motion neutrality.

### Task 10: 44px Ergonomic Touch Lattice Audit & Hardening

**Files to check/modify:**

- `tests/e2e/c3-mobile-composition.spec.ts`
- All interactive buttons, links, and accordion summaries site-wide.

**Steps:**

- [ ] **Step 1:** Run mobile composition sweep at 320px and 390px viewports.
- [ ] **Step 2:** Verify zero interactive elements have bounding rect height < 44px.

---

## Phase 5: Sổ Tâm Zero-Knowledge AI & ApexAgent Flight Deck (G03, G05, G06)

### Task 11: Sổ Tâm Zero-Knowledge Client Reflection Scaffold

**Files to create:**

- `src/components/product/SoTamReflectionPreview.astro`
- `src/lib/local-journal.ts`

**Specifications:**

- Private daily reflection intake: prompts structured reflection without sending text to any cloud API.
- Stored exclusively in browser IndexedDB with export/delete controls.

### Task 12: ApexAgent Autonomous Flight Deck & Transparency Console

**Files to create:**

- `src/components/product/ApexAgentFlightDeck.astro`

**Specifications:**

- Visualizes agent step-by-step reasoning (Plan $\rightarrow$ Tool Call $\rightarrow$ Human Verification $\rightarrow$ Execution).
- Prominent Emergency Kill-Switch affordance simulating immediate agent pause.

### Task 13: FluentArc Interactive Skill Frontier Map

**Files to create:**

- `src/components/product/FluentArcSkillTree.astro`

**Specifications:**

- SVG-based interactive tree showing prerequisite knowledge mapping.
- 100% accessible via keyboard and screen reader.

---

## Acceptance Matrix & Quality Gates

Each wave must satisfy:

1. `pnpm format:check` — 100% Prettier compliance.
2. `pnpm lint` — 0 errors, 0 warnings.
3. `pnpm test:architecture` — 575+ tests pass.
4. `pnpm check:product-provenance` — PASS on all public products.
5. `pnpm check:publishability` — PASS (zero broken links, valid schemas).
6. `pnpm check:client-budget` — Total Brotli JS < 120 KB.
7. `pnpm check:static-links` — 0 broken links.
8. Full Playwright E2E matrix across Chromium, Firefox, WebKit, Mobile Chromium.
