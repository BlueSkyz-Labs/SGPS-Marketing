# BlueSkyz Labs Brand Kit v4 Aesthetic Standardization & Design Excellence Specification

**Document Version:** 1.0.0  
**Specification Date:** 2026-09-27  
**Authority:** Owner Directive (`Bộ branding kit ở đây "C:\00. AI Project\00_BlueSkyzLabs" tham khảo và áp dụng vào dự án, chuẩn hóa nó`); SGPS FULL (Architecture + Experience) Tier S+ × God-Tier.  
**Baseline Git Commit:** `main@4955ba8`  
**Brand Kit Source Authority:** `C:\00. AI Project\00_BlueSkyzLabs\BlueSkyzLabs_Brand_Kit_Production_v4`

---

## 1. Executive Summary & Objective

This design specification establishes the authoritative visual and experiential standard for BlueSkyz Labs Web, harmonizing the project with the authentic **Production Brand Standards v4.0.0** authored in `C:\00. AI Project\00_BlueSkyzLabs`.

### Core Challenge & Diagnosis

Prior engineering waves prioritized extreme epistemic rigor and strict minimal-JS budget constraints at the expense of visual luxury. In doing so, rules such as _"hairline only, no glass, no blur, no decorative gradients"_ inadvertently transformed the public website into an austere, wireframe-like legal disclosure document.

### Target Outcome

Transform BlueSkyz Labs into a world-class **"Digital Maison & Living Product House"** matching the craft benchmarks of Linear, Apple, Stripe, and Teenage Engineering, while preserving **100% of SGPS FULL engineering guarantees**:

- Client JS Brotli budget strictly < 120 KB (currently ~10.2 KB).
- 100% WCAG 2.1 AA accessibility (44px touch targets, zero horizontal overflow at 320px with 200% text zoom).
- 100% trilingual parity across `en`, `vi`, and `zh`.
- Zero content fabrication (all claims and media bound to verified repository truth).

---

## 2. Brand Architecture & Design Tokens (Brand Kit v4 Alignment)

### 2.1 The Obsidian & Liquid Porcelain Palette

The color system strictly reflects `07_DESIGN_TOKENS/tokens.json`:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              BRAND KIT v4 PALETTE MATRIX                               │
├────────────────────┬──────────────┬────────────────────────────────────────────────────┤
│ Token Name         │ Hex Value    │ Semantic Usage & Contrast Rule                     │
├────────────────────┼──────────────┼────────────────────────────────────────────────────┤
│ --bsl-ink          │ #0B1020      │ Deep space background (dark), primary text (light) │
│ --bsl-porcelain    │ #F7F8FA      │ Enamel surface (light), inverse text (dark)        │
│ --bsl-cobalt       │ #2564FF      │ Electric kinetic accent, spotlight glow, badges    │
│ --bsl-slate900     │ #0F172A      │ Secondary dark plane, card background (dark)       │
│ --bsl-slate700     │ #334155      │ Tertiary boundaries, dark mode borders             │
│ --bsl-slate650     │ #475569      │ Preferred supporting body text on Porcelain (AA)   │
│ --bsl-slate500     │ #64748B      │ Large/decorative text ONLY; fails AA on body       │
│ --bsl-slate300     │ #CBD5E1      │ Hairline dividers, light mode borders              │
│ --bsl-slate100     │ #F1F5F9      │ Subtle chip backgrounds on light surfaces          │
│ --bsl-actionDark   │ #1D4ED8      │ High-contrast action link on Porcelain (AA small)  │
│ --bsl-white        │ #FFFFFF      │ Pure specular highlights, dark mode primary text   │
└────────────────────┴──────────────┴────────────────────────────────────────────────────┘
```

### 2.2 Material Layering & Specular Lighting System

1. **Dark Mode Obsidian Atmosphere:**
   - Multi-layer radial mesh gradients radiating from `--bsl-cobalt` at low opacity (8%–14%) on top of `#060810` transitioning to `--bsl-ink` (`#0B1020`).
   - Cards utilize subtle inner bevels (`box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08)`).
2. **Light Mode Porcelain Enamel:**
   - Clean, luminous background (`#F8FAFC`) with subtle specular highlights and soft multi-layer drop shadows (`--bsl-shadow-subtle: 0 8px 28px rgba(11, 16, 32, 0.12)`).
3. **Specular Hairline Borders:**
   - Replacing flat 1px solid gray borders with semi-transparent borders: `border border-white/10` in dark mode, and `border-slate-200` in light mode, with gradient sheen transitions on hover.
4. **Frosted Glass Shell:**
   - Sticky header with `backdrop-filter: blur(12px)` and `background: color-mix(in srgb, var(--surface-primary) 82%, transparent)`.

---

## 3. Product Presentation & Living Maison (Showcase Architecture)

### 3.1 `ProductCard.astro` — Bento Rebirth

Every product card is transformed from an unstyled white box into an exquisite Bento Card:

1. **Authentic 512px App Icon Integration:**
   - Embeds the official high-resolution transparent icon (`/products/[slug]/icon.png` / `/brand/blueskyz/v4/products/[slug].svg`).
   - Rendered inside a 48px–56px squircle container with a subtle ambient glow matched to the product's signature color.
2. **Horological Status Badge:**
   - Clean mechanical chip showing `publicLabel` (e.g., "In development", "Preview") with a subtle glowing pulse indicator.
3. **Editorial Typography:**
   - Product name with negative optical tracking (`-0.02em`), tight line-height, and refined description in `--bsl-slate650`.
4. **Platform Badges & Tactile CTAs:**
   - Micro-tags for supported platforms (Web, iOS, Android).
   - Horological micro-tick button (`active:scale-[0.98]` with mechanical recovery).

### 3.2 `FlagshipTheatre.astro` — Cinematic Showroom

1. **Minimalist Device Frame:**
   - Proof screenshot framed within a sleek titanium bezel with browser window indicators or subtle edge chamfer.
2. **Backlight Projection:**
   - Soft directional luminescence radiating from behind the proof image to create perceived three-dimensional depth.
3. **Bento Micro-Cards for Capabilities:**
   - Capabilities converted from plain bullet points into 3 distinct interactive cards with vector icons.

### 3.3 Product Profile (`/products/[slug].astro`)

1. **Hero Stage:**
   - Official Endorsed Lockup SVG (`06_PRODUCT_BRANDS/01_LOCKUPS_SVG/[slug]_endorsed_lockup_*.svg`) combined with high-res 128px icon.
2. **Feature Bento Grid:**
   - Completely replaces `<ul><li>` bullets with a responsive Bento Grid of features, jobs-to-be-done, and platform capabilities.
3. **Interactive Affordance Module:**
   - Dedicated slots for real-world utilities (e.g. Sổ Trọ VietQR billing engine, Sổ Tằm Zen reflection preview).

---

## 4. Brand Principles & Hero Experience

### 4.1 Canonical Principles (`OneHouseMatrix.astro`)

- Integrates the 4 authentic Brand Principle SVGs from `03_ICONS/02_BRAND_PRINCIPLES`:
  - `intelligence.svg`
  - `elevation.svg`
  - `trust.svg`
  - `impact.svg`
- Modernizes the container into 4 distinct luxury cards with full trilingual support (`en`, `vi`, `zh`).

### 4.2 Hero Section (`Hero.astro`)

- Aligns copy with `BRAND_COPY_LIBRARY.md`:
  - Lead: **"Intelligence. Elevated."**
  - Accent: **"Impact."**
  - Supporting: _"A higher perspective builds a brighter tomorrow."_
- Desktop hero centerpiece integrates the dimensional **Prismatic R4d Mark** (`blueskyzlabs_prismatic_r4d_mark_transparent.png`) with ambient cobalt halo.

---

## 5. Non-Negotiable Invariants

1. **Dual-Control Verification:** Every pull request must pass exact-head `Quality Gates` and `Browser Assurance` (2,478+ browser tests).
2. **Zero Fabrication:** Only verified brand assets, products, and repository claims are displayed.
3. **Performance Floor:** Client JavaScript strictly < 120 KB Brotli. Zero heavy 3D WebGL runtime libraries.
4. **Accessibility:** 100% WCAG 2.1 AA compliance, 44px minimum touch targets, zero horizontal scroll at 320px with 200% zoom.
