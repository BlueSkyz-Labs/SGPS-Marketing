# SGPS Premium Experience & Design Excellence v2.0 Design Specification

**Status:** Owner-approved directive (`SGPS PREMIUM EXPERIENCE & DESIGN EXCELLENCE v2.0 FULL`); active execution specification.  
**Date:** 2026-09-27  
**Baseline:** `main@204c4bb`. Every agent execution session MUST refresh live `main`, open PRs/issues, `AGENTS.md`, `docs/current-work.json`, applicable SGPS decisions, provider state, and newer approved specs before editing.

---

## 1. Purpose & Master Directive

This specification elevates the BlueSkyz Labs public web ecosystem from an epistemic proof-and-architecture showcase into a **human-centered, battle-tested, living product experience (Tier S+ × God-Tier)**.

The objective is not merely aesthetic luxury; it is to create a digital maison that people genuinely need, understand, trust, enjoy, and can operate successfully in their real-life circumstances—spanning enterprise tech evaluators globally and pragmatic real-world users in Vietnam.

This system adopts **SGPS FULL — Architecture + Experience** as an inviolable baseline:

- **Architecture Truth:** Canonical model in `architecture/sgps-model.json`, zero mutable server state on public edge, fail-closed security.
- **Experience Truth:** Product truth is prerequisite for product spectacle; zero fabricated claims, fake metrics, or artificial persona quotes.
- **Vietnam-Native Realism:** Deeply contextualized for Vietnamese device diversity (mid-range Android, 320px screens), network conditions (flaky 4G), administrative realities, VietQR NAPAS 247 banking standards, and Zalo in-app browser interactions.

---

## 2. Core Pillars & Design North Star

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                             SGPS v2.0 EXPERIENCE PILLARS                                    │
├─────────────────────────┬─────────────────────────┬─────────────────────────────────────────┤
│ 1. Living Product       │ 2. Vietnam-Native       │ 3. Horological Precision &              │
│    Maison (C2/P0)       │    Workflows            │    Quiet Luxury                         │
│ • 5 Verified AI Products│ • VietQR NAPAS 247      │ • Mechanical tick feedback              │
│ • Trilingual Parity     │ • Zalo In-App Sharing   │ • 44px thumb-reachable target floor    │
│ • Local Verified Media  │ • Natural Vietnamese    │ • Zero-CLS asset rendering              │
├─────────────────────────┼─────────────────────────┼─────────────────────────────────────────┤
│ 4. Structured SEO &     │ 5. Adversarial Red-Team │ 6. Zero-Knowledge Local AI              │
│    Discoverability      │    Security             │    Telemetry                            │
│ • SoftwareApplication LD│ • Anti-Tampering QR     │ • Sổ Tâm client-side private journaling │
│ • Complete Sitemap XML  │ • Local-First Storage   │ • ApexAgent flight-deck kill switch     │
│ • Masterbrand OG Cards  │ • CSP Edge Hardening    │ • FluentArc interactive skill tree      │
└─────────────────────────┴─────────────────────────┴─────────────────────────────────────────┘
```

### 2.1 Living Product Maison (G01)

- The public product registry is activated from verified assets in `C:\00. AI Project\00_BlueSkyzLabs`.
- Resolves the historical `screenshot-mandatory-floor` gate by binding authentic 512px transparent PNG app icons and verified interface preview renders.
- 5 Purpose-Built AI Products:
  1. **ApexAgent:** Autonomous AI agent orchestrator with human-in-the-loop oversight (`featuredTier: "hero"`).
  2. **Sổ Tâm:** Contemplative AI journal distilling daily reflections into structured life insights (`featuredTier: "featured"`).
  3. **Sổ Trọ:** Streamlined rental property operations, digital contracts, and tenant workflows (`featuredTier: "featured"`).
  4. **FluentArc:** Adaptive learning copilot mapping knowledge frontiers and accelerating skill mastery (`featuredTier: "ecosystem"`).
  5. **Vững Tay Lái:** Real-time situational awareness and computer vision coaching for road safety (`featuredTier: "ecosystem"`).

### 2.2 Vietnam-Native Workflows (G02, G07, S06)

- **VietQR NAPAS 247 Local-First Generator:** Pure client-side generation of EMVCo/NAPAS dynamic QR codes for rental billing in Sổ Trọ. No financial data or account numbers transmitted to remote servers.
- **Zalo In-App Browser Direct-Share Hub:** High-contrast HTML/Canvas card export allowing landlords and tenants to share receipts via 1-tap image copy without relying on native PDF downloads that Zalo frequently suppresses.
- **Vietnamese Typography & Diacritic Tuning:** Optical kerning and break-safe wrapping (`[overflow-wrap:anywhere]`, `hyphens:auto`) preventing compound word truncation on narrow 320px mobile screens.

### 2.3 Horological Precision & Tactile Ergonomics (S01, S02, S03)

- **Horological Micro-Tick:** Subtle visual and micro-tactile state confirmations mirroring the precision of fine Swiss chronometers at critical verification moments.
- **44px Ergonomic Touch Lattice:** Every actionable link, button, and summary element strictly enforces a 44px minimum touch target height across all viewports (`320px`, `390px`, `768px`, `1280px`).
- **Adaptive Contrast Glass:** Depth achieved through tone, line, and opacity rather than heavy blur shaders, ensuring 60fps rendering on budget devices.

### 2.4 Structured SEO & Machine Discoverability (S04, S05)

- **Schema.org `SoftwareApplication` JSON-LD:** Structured metadata on every product profile page declaring application category, operating systems, and verified capabilities.
- **Deterministic Sitemap & Robots Enumeration:** All product routes across `en`, `vi`, and `zh` are statically enumerated with canonical reciprocal hreflang tags.
- **Dynamic OpenGraph Masterbrand Cards:** Pre-rendered social sharing cards with high-fidelity branding.

---

## 3. Architecture & Security Invariants

1. **Astro 7 Static Authority:** Public critical paths remain statically pre-rendered (`output: "static"`). No dynamic server dependencies or node containers required at edge.
2. **Client JS Budget Floor:** Total Brotli JavaScript must not exceed **120 KB** (current site-wide footprint is 9.7 KB).
3. **Dual-Control Source Assurance:** Direct push to `main` is blocked by ruleset `22500299`. All changes land via `Branch → PR → exact-head Quality Gates + Browser Assurance → Squash Merge`.
4. **Zero-Knowledge Privacy:** No user input, reflection text, tenant ledger, or financial parameter is sent to unvetted cloud endpoints.
5. **Fail-Closed Dual Verification:** When client-side scripts are disabled, all content, navigation, and product details remain 100% accessible via semantic HTML.

---

## 4. Acceptance Criteria

- [ ] All 5 products render seamlessly on `/en/products/[slug]`, `/vi/products/[slug]`, and `/zh/products/[slug]`.
- [ ] 100% compliance with WCAG 2.1 AA (200% text zoom, 44px touch targets, color contrast $\ge 4.5:1$, zero horizontal scroll at 320px).
- [ ] Architecture contract suite passes (575/575 tests green).
- [ ] Playwright E2E matrix passes across Chromium, Firefox, WebKit, and Mobile Chromium.
- [ ] Lighthouse score $\ge 98$ on Performance, Accessibility, Best Practices, and SEO.
