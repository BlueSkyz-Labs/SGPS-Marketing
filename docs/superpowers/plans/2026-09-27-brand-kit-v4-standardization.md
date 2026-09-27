# BlueSkyz Labs Brand Kit v4 Standardization & Aesthetic Excellence Master Plan

> **For autonomous agentic workers:** REQUIRED SUB-SKILL: Follow Hermes Long-Running Law (Owner chốt 2026-09-19): When tasks are actionable, execute end-to-end without pausing to ask; open new wave upon completion of current wave; merge safely via `Branch → PR → exact-head CI gate → Merge`. Only stop on genuine blockers or explicit Owner halt.

**Goal:** Elevate BlueSkyz Labs Web from an austere, utilitarian proof catalog into a world-class Living Product House and Digital Maison (Tier S+ × God-Tier) by strictly standardizing and applying the authentic Production Brand Kit v4 from `C:\00. AI Project\00_BlueSkyzLabs`.

**Architecture:** Static-first Astro 7 output on Cloudflare Edge, zero-knowledge client calculations, Brotli client JS < 120 KB, fail-closed Dual-Control source assurance.

**Tech Stack:** Astro 7, TypeScript, Tailwind CSS v4, Playwright E2E matrix, Node architecture test runner, axe core, Lighthouse.

**Spec Reference:** `docs/superpowers/specs/2026-09-27-brand-kit-v4-standardization-design.md`

---

## Global Invariants & Constraints

1. **Dual-Control Merge Discipline:** Direct push to `main` is blocked by ruleset `22500299`. Every wave lands via `Branch → PR → exact-head Quality Gates + Browser Assurance → Squash Merge`.
2. **Zero Fabrication:** Never invent product claims, fake reviews, artificial metrics, or unverified employee quotes.
3. **Client JS Budget Floor:** Total Brotli client script must remain under 120 KB (current: ~10.2 KB site-wide).
4. **Touch & Reflow Ergonomics:** 44px minimum touch target height across all actionable elements; zero horizontal scroll at 320px with 200% text zoom (WCAG 1.4.4).
5. **Fail-Closed Trilingual Parity:** All pages and product profiles maintain complete structural and factual parity across `en`, `vi`, and `zh`.

---

## Wave 1: Design Tokens, Specular Hairline Borders & Sticky Glass Shell

### Task 1.1: Standardize CSS Tokens & Specular Highlights

- **Files to modify:**
  - `src/styles/global.css`
  - `src/styles/tokens.css` (or brand token definitions)
  - `tests/architecture/brand-token-contract.test.mjs`
- **Specifications:**
  - Synchronize CSS root tokens with `07_DESIGN_TOKENS/tokens.json`:
    - `--bsl-shadow-subtle: 0 8px 28px rgba(11, 16, 32, 0.12)`
    - `--bsl-radius-sm: 8px`, `--bsl-radius-md: 12px`, `--bsl-radius-lg: 20px`, `--bsl-radius-xl: 28px`
    - Specular border utility classes: `.border-specular` with subtle top highlight.
  - Pass all architecture checks in `brand-token-contract.test.mjs`.

### Task 1.2: Sticky Frosted Glass Header & Navigation Refinement

- **Files to modify:**
  - `src/components/layout/Header.astro`
  - `src/layouts/BaseLayout.astro`
  - `src/styles/c3-craft.css`
- **Specifications:**
  - Make global header sticky (`sticky top-0 z-50`) with frosted glass blur (`backdrop-blur-md bg-[color-mix(in_srgb,var(--surface-primary)_82%,transparent)]`).
  - Specular bottom border (`border-b border-white/10` dark, `border-b border-slate-200/80` light).
  - Tactile micro-interactions for navigation links and Command Navigator button.

---

## Wave 2: Bento Product Card Rebirth & Flagship Theatre Showroom

### Task 2.1: Re-architect `ProductCard.astro` with Authentic 512px Icons

- **Files to modify:**
  - `src/components/product/ProductCard.astro`
  - `tests/e2e/c2-product-continuity.spec.ts`
- **Specifications:**
  - Embed authentic 512px transparent product icons (`/products/[slug]/icon.png`).
  - Render icon in a refined squircle container with ambient drop-shadow.
  - Horological status badge with subtle live pulse indicator.
  - Bento layout: Icon + Badge header $\rightarrow$ Product Name + Tagline $\rightarrow$ Platform chips (Web, iOS, Android) $\rightarrow$ Micro-tick action links.
  - Hover elevation with subtle color-matched ambient glow.

### Task 2.2: Cinematic Device Frame in `FlagshipTheatre.astro`

- **Files to modify:**
  - `src/components/product/FlagshipTheatre.astro`
  - `src/components/product/ProductVisual.astro`
- **Specifications:**
  - Encase the proof screenshot in a sleek, modern browser/device frame with window controls and titanium chamfer.
  - Soft ambient backlight projecting behind the frame to create 3D visual depth.
  - Transform capability bullets into 3 elegant micro-feature cards.

---

## Wave 3: Product Profile Modernization & Bento Feature Grid

### Task 3.1: Modernize Product Profile Header with Endorsed Lockups

- **Files to modify:**
  - `src/pages/en/products/[slug].astro`
  - `src/pages/vi/products/[slug].astro`
  - `src/pages/zh/products/[slug].astro`
- **Specifications:**
  - Replace plain text header with Endorsed Brand Lockup SVG and 128px icon lockup.
  - Dual action buttons: Primary specular button + Secondary frosted glass button.
  - Status chips reflecting horological precision.

### Task 3.2: Transform Bullet Points into Modern Bento Feature Grid

- **Files to modify:**
  - `src/pages/[lang]/products/[slug].astro`
- **Specifications:**
  - Delete raw `<ul><li>` bullet point lists.
  - Build responsive Bento Grid for "What it's for" (Jobs) and "Main capabilities".
  - Integrate device frame for proof screenshot artifact.

---

## Wave 4: Brand Principles Modernization & Prismatic Hero Elevation

### Task 4.1: Brand Principles Bento Matrix (`OneHouseMatrix.astro`)

- **Files to modify:**
  - `src/components/experience/OneHouseMatrix.astro`
- **Specifications:**
  - Use the 4 official Brand Principle SVGs (`intelligence.svg`, `elevation.svg`, `trust.svg`, `impact.svg`).
  - Upgrade container into 4 distinct luxury cards.
  - Ensure 100% trilingual support (`en`, `vi`, `zh`).

### Task 4.2: Hero Section Prismatic Dimensional Elevation (`Hero.astro`)

- **Files to modify:**
  - `src/components/sections/Hero.astro`
- **Specifications:**
  - Optimize desktop hero visual with dimensional Prismatic R4d Mark.
  - Harmonize typographic tracking and line-height for Vietnamese and English.
  - Ensure zero horizontal overflow at 320px with 200% zoom.

---

## Verification & Promotion Rhythm

For each wave:

1. `pnpm format:check` — 100% Prettier compliance.
2. `pnpm lint` — 0 errors, 0 warnings.
3. `pnpm test:architecture` — 641+ tests green.
4. `pnpm check:client-budget` — Brotli JS < 120 KB.
5. `pnpm check:static-links` — 0 broken links.
6. Push to branch $\rightarrow$ Open PR $\rightarrow$ CI Green (`Quality Gates` + `Browser Assurance`) $\rightarrow$ Squash Merge.
