# Branding Kit 0907 → Marketing Integration Design

**Status:** Owner-approved implementation, corrected to the exact Production v4 source of truth on 2026-09-07.

## Canonical source of truth

The only canonical branding source for this workstream is:

- **Kit:** `BlueSkyzLabs_Brand_Kit_Production_v4`
- **Archive:** `BlueSkyzLabs_Brand_Kit_Production_v4.zip`
- **Expected SHA-256:** `9534d34ef91a039f59da916426f4ca465c142d743c0b263671e9d0411693b75d`
- **Status:** FINAL — production-ready
- **Verified audit:** 242 files; 153 raster; 46 SVG; 18 PDF; Guidelines v4 10 pages; 20 dimension checks PASS; ZIP integrity 0 errors; 0 errors / 0 warnings.

`BlueSkyz_Identity_R4d_Production_Master_Candidate_v1.1` is **superseded** by Production v4. R4d may remain in the repository only as a legacy archive or temporary runtime fallback while the exact v4 archive bytes are unavailable. R4d MUST NOT be described, tested, or promoted as the canonical visual source of truth.

The repository records this boundary in `brand/production-v4/STATUS.json`.

## Approved public identity

- Brand: **BlueSkyz Labs**
- Founder: **Tony Nguyen — Founder & CEO**
- Location: **Ho Chi Minh City, Vietnam**
- Public website identity: **https://blueskyzlabs.com**

These facts may be used in public marketing copy, trust surfaces and structured data. No business/security email, legal entity name, trademark status, customer claim, certification, social profile or product claim is inferred from them.

## Production v4 direction

The finalized Production v4 system is an agency-grade production identity for web, social, pitch decks, product UI and merchandise. Its positioning is an AI-native software/product engineering studio with a calm, technical and execution-focused personality. The visual thesis is **“The future is blue, but the system is dark.”** The system uses a deep navy foundation with electric-cyan signal and lavender intelligence accents. The logo symbol is a stylized B/S interlock / BlueSkyz horizon-signal, not a generic chain icon.

Do not mix in R4d palette, typography, logo geometry, gradients or icon rules merely because R4d assets are already present in this repository. The exact Production v4 files/specification remain authoritative whenever a visual value conflicts.

## Architecture

### 1. Identity source of truth

`SITE` centralizes:

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

`SITE.url` remains environment-driven through `PUBLIC_SITE_URL`. This preserves preview/noindex/canonical correctness and does not imply that the current Cloudflare deployment already serves the custom domain.

### 2. Visual asset adapter

Production v4 runtime assets are imported under a dedicated canonical path such as:

`public/brand/blueskyz/v4/`

The runtime may switch logo, symbol, social/OG, icon, banner and token references to v4 **only after** the imported archive matches the expected SHA-256 and the web projection is verified against the Production v4 package.

Until then:

- do not copy R4d assets into a v4 directory;
- do not rename R4d files to look like v4;
- do not synthesize approximate v4 logo geometry or typography from memory;
- do not mark `archive.importedIntoRepository=true`;
- keep any legacy runtime fallback explicitly documented as fallback, not canonical branding.

### 3. BlueSkyz-led brand story

The website remains a **BlueSkyz Labs product house**, not a Tony Nguyen personal portfolio. Founder visibility is a trust signal.

The About/Home/Footer copy may use the approved founder/location/domain identity now. Visual artwork must migrate from legacy R4d artwork to exact Production v4 assets when the archive is available and checksum-verified.

### 4. Structured data

Organization JSON-LD may include:

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

The Organization `url` remains runtime `SITE.url`. Do not add unverified `email`, `sameAs`, legal name, tax identifier, certification or physical street address.

### 5. Social / banner / YouTube assets

Production v4 is the canonical source for web/social/YouTube/banner/mockup deliverables. Existing R4d-derived OG/app icons can remain only as temporary legacy runtime assets. They must be replaced by exact v4 exports when the canonical archive is imported; no approximated replacement is allowed.

## UX, accessibility and performance constraints

- Production v4 visual rules supersede R4d visual rules.
- WCAG 2.2 AA remains mandatory for web usage even if a raw brand color requires an accessible UI derivative.
- No all-caps status-pill proliferation or fake trust badges.
- Decorative artwork uses empty alt text and intrinsic dimensions.
- Founder/location/website information remains readable without motion or JavaScript.
- Mobile layout keeps the existing 320px floor.
- No new runtime dependency, external script or client JavaScript solely for branding.
- Existing client-JS and Lighthouse budgets remain unchanged.

## Security / truth constraints

- Keep public-truth and non-production canonical behavior fail-closed.
- Do not add emails unless separately verified.
- Do not alter CSP/header controls for branding.
- Do not add external analytics/embeds as part of this work.
- No unsupported customer, certification, uptime, security-grade or product-maturity claims.

## Verification contract

Tests/evidence must prove:

1. `BlueSkyzLabs_Brand_Kit_Production_v4` is recorded as canonical and R4d as superseded;
2. expected archive SHA-256 is fixed in-repo;
3. founder/location/public website are centralized in `SITE`;
4. structured data includes founder/locality but no invented email/social/legal fields;
5. no R4d asset is relabeled as a v4 asset;
6. visual runtime promotion to v4 cannot be declared complete until exact archive import + checksum verification;
7. architecture, typecheck, lint, format, build, static-link, client-budget, Playwright/axe and Lighthouse gates remain green after migration.

## Current external dependency

The exact `BlueSkyzLabs_Brand_Kit_Production_v4.zip` binary created in the Branding 0907 session is not mounted in this chat runtime, is not present in the current repository, and is not discoverable in File Library. Therefore binary-level asset migration is blocked in this session by artifact availability only. The website must not pretend otherwise.

## Non-goals

- DNS/Cloudflare custom-domain cutover.
- Adding production contact/security email.
- Rebranding BlueSkyz Labs into a personal portfolio.
- Reconstructing Production v4 visual assets from memory or from R4d.
- Changing product registry/public-product claims.
