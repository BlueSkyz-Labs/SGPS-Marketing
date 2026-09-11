# S+ Production SEO Baseline + Legacy Redirect Fix — 2026-09-11

**Scope:** S+ Task 12A / issue #98. Verified against the live site and a fresh
exact-SHA local build.

## Findings (DETECTED → REMEDIATED)

### 1. Legacy root routes served duplicate content (FIXED)

- **Detected:** `/about/`, `/contact/`, `/privacy/`, `/security/`,
  `/support/`, `/products/`, and `/` rendered full copies of the localized
  pages with self-referencing canonicals. The source intent (PR #93,
  "legacy redirects") was a redirect, but `Astro.redirect(...)` was called
  **without `return`**, so static builds rendered the fallback template
  instead of a redirect page.
- **Remediated:** all legacy root pages now `return Astro.redirect(...)`
  (static output emits meta-refresh redirect pages), and `public/_redirects`
  adds proper **301s** for Cloudflare Workers Static Assets (the same
  mechanism family as the existing `_headers`, which is honored in
  production).
- **Verified locally:** stub sizes 276–330 bytes with
  `meta refresh → /en/...` targets; seven new contract tests
  (trust-routes.spec.ts) assert the redirect for every legacy route.

### 2. Verified green (no action needed)

- **Titles/descriptions:** unique per route; the EN/VI homes share the
  brand-only title by design (distinct languages + reciprocal hreflang).
- **Canonical/hreflang:** canonical self per localized route; en/vi/x-default
  reciprocal (existing tests).
- **robots/sitemap:** Production: `Allow: /` + sitemap of the 14 canonical
  URLs (7 EN + 7 VI); legacy roots are excluded. Local builds intentionally
  serve `Disallow: /` + an empty sitemap (environment behavior asserted in
  tests). `PUBLIC_STATIC_PATHS` in `src/lib/seo.ts` is the single source for
  both sitemap and canonical route truth.
- **OG/social:** `og-default.png` present in `public/social/`; the live URL
  returns 200.
- **Structured data:** Organization + WebSite JSON-LD built from real public
  facts only (verified live).
- **Production noindex:** none on the custom domain; `workers.dev` and
  versioned preview hosts carry `X-Robots-Tag: noindex` via
  `public/_headers`.

## Verification (exact head, this PR)

- format / typecheck / lint / build PASS; architecture 122/122; static links
  PASS; e2e chromium **106/106** (including 7 new legacy-redirect contract
  tests and the expanded 14-route axe matrix).
- **Post-merge live read-back (required):** `curl -sI` the seven legacy
  routes expecting `301 → /en/...`; `robots.txt` stays `Allow: /`; sitemap
  unchanged at 14 URLs.

## Residuals

- The Astro meta-refresh delay appears only on hosts that ignore
  `_redirects` (local preview); production serves edge 301s.
- Human E4 evidence remains open (Task 13).
