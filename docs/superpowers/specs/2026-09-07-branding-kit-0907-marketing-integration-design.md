# Branding Kit 0907 → Marketing Integration Design

**Status:** Approved for implementation by owner on 2026-09-07.

## Intent

Integrate the approved Branding Kit 0907 public identity into the BlueSkyz Labs marketing site without weakening the existing C1.1 product-house architecture, public-truth controls, R4d provenance, accessibility, performance or deployment boundaries.

## Approved public identity facts

- Brand: **BlueSkyz Labs**
- Founder: **Tony Nguyen — Founder & CEO**
- Location: **Ho Chi Minh City, Vietnam**
- Public website identity: **https://blueskyzlabs.com**

These facts may be used in public marketing copy, trust surfaces and structured data. No business/security email, legal entity name, trademark status, customer claim, certification, social profile or product claim is inferred from them.

## Provenance boundary

The repository already contains and verifies `BlueSkyz_Identity_R4d_Production_Master_Candidate_v1.1`, including outlined vector lockups, symbol/micro mark, material-expression symbol, raster assets, web icons, tokens, guidelines and SHA-256 provenance. That package remains the visual runtime core.

The exact Branding Kit 0907 archive is not present as a checksum-verifiable repository package in the current source tree. Therefore this integration MUST NOT:

- relabel R4d v1.1 as an exact 0907 package;
- change `canonicalMasterbrandPromoted` from `false`;
- change `IDENTITY_PROTOTYPE_READY` / `DESIGN_FREEZE_CANDIDATE` provenance state without a new verified package;
- fabricate missing banner, badge, social, photography or mockup files.

Approved 0907 **content/identity** is integrated now; future exact 0907 binary assets can be imported as a separate provenance-controlled change.

## Architecture

### 1. Site identity source of truth

Extend `SITE` with explicit public identity fields:

```ts
publicWebsite: "https://blueskyzlabs.com";
founder: {
  name: "Tony Nguyen";
  role: "Founder & CEO";
}
location: {
  locality: "Ho Chi Minh City";
  country: "Vietnam";
}
```

`SITE.url` remains environment-driven through `PUBLIC_SITE_URL`. This preserves correct preview/canonical/noindex behavior and avoids claiming that DNS/Cloudflare already serves `blueskyzlabs.com`.

`SITE.publicWebsite` is approved brand identity content, not the build-time canonical override.

### 2. BlueSkyz-led brand story

The site remains a **BlueSkyz Labs product house**, not a personal portfolio. Founder visibility is a trust signal.

Replace the placeholder About biography with concise approved brand narrative:

- BlueSkyz Labs is a product house based in Ho Chi Minh City.
- It builds intelligent digital products around clarity, trust and useful impact.
- Tony Nguyen is shown as founder, without an invented personal biography or résumé.
- Brand principles remain Intelligence, Elevation, Trust and Impact.

Add a static brand-story composition that uses the already-verified R4d `symbol_material_expression.svg` and the existing `BRAND_PRINCIPLES`. It must use semantic HTML, intrinsic image sizing, no client JavaScript and no fake certification/status badges.

### 3. Homepage and footer integration

Homepage About surface should expose the founder/location trust signal and link to `/about/` for the full story.

Footer should carry a restrained brand signature:

`Tony Nguyen · Ho Chi Minh City · blueskyzlabs.com`

The website link may point to `https://blueskyzlabs.com` as an owner-approved public identity fact. It is not evidence that the current Cloudflare deployment has moved there.

### 4. Structured data

Extend `organizationJsonLd` so Organization JSON-LD can include:

```json
{
  "founder": { "@type": "Person", "name": "Tony Nguyen" },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Ho Chi Minh City",
    "addressCountry": "VN"
  }
}
```

The Organization `url` remains the runtime `SITE.url`, because previews must describe their actual canonical identity. No `email`, `sameAs`, legal name, tax identifier, certification or physical street address is added.

### 5. Social / banner assets

Existing `public/social/og-default.png` and verified app/web icons remain active. Do not invent or synthesize platform banners merely to claim kit completeness. Exact 0907 YouTube/social/banner assets require a future checksum-verifiable asset import before runtime promotion.

## UX and accessibility constraints

- Preserve Porcelain / Ink / Cobalt R4d palette and existing contrast decisions.
- New content must remain WCAG 2.2 AA-compatible.
- No all-caps status-pill proliferation or fake trust badges.
- Decorative brand artwork uses empty alt text and intrinsic dimensions.
- Founder/location/website information must remain readable without motion or JavaScript.
- Mobile layout must stack cleanly at the existing 320px floor.

## Performance constraints

- No new runtime dependency.
- No new client JavaScript.
- Reuse existing verified SVG assets instead of adding heavyweight screenshots to runtime.
- Existing client-JS and Lighthouse budgets remain unchanged.

## Security / truth constraints

- Keep public-truth and non-production canonical behavior fail-closed.
- Do not add emails unless verified values are provided separately.
- Do not alter CSP/header controls.
- Do not add external scripts, analytics or third-party embeds.
- No unsupported customer, certification, uptime, security-grade or product-maturity claims.

## Verification contract

TDD architecture tests must prove:

1. approved founder/location/public website are centralized in `SITE`;
2. About no longer contains the placeholder approval text;
3. About uses verified R4d material-expression artwork and the existing four principles;
4. homepage/footer consume centralized identity instead of duplicating divergent literals;
5. structured data includes founder/locality but no invented email/social/legal fields;
6. R4d provenance state remains unpromoted;
7. existing architecture, typecheck, lint, format, build, static-link, client-budget, Playwright/axe and Lighthouse gates remain green.

## Non-goals

- DNS or Cloudflare custom-domain cutover to `blueskyzlabs.com`.
- Adding production contact/security email.
- Rebranding BlueSkyz Labs into Tony Nguyen's personal portfolio.
- Importing or fabricating missing exact 0907 binary assets.
- Changing product registry/public-product claims.
