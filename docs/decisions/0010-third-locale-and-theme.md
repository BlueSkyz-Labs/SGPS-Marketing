# ADR 0010 — Third locale (Simplified Chinese, business register) and first-class Light/Dark theming

> **Numbering note.** This decision was originally filed as `0009-…` while another
> `0009` had already been published in the index and referenced by name across
> plans, the decisions README and an adoption evidence file. To resolve the
> collision **without rewriting any published reference**, this unreferenced file
> moved to the next free slot; the decision's own date (2026-09-18) and content
> are unchanged. Numbers follow publication order here; dates stay authoritative.

- **Status:** Accepted (owner directive 2026-09-18)
- **Date:** 2026-09-18
- **Refines:** ADR 0008 (bilingual VI/EN architecture), ADR 0006 (canonical domain), ADR 0004 (Astro 7 static)
- **Extends:** Brand Kit v4 Production (`brand/blueskyz-production-v4`, release 4.0.0) and its dormant `[data-theme="dark"]` semantics
- **Owner directive:** "Bổ sung thêm tiếng trung chuẩn thương mại vào giao diện … nhớ thiết kế nút chuyển đổi ngôn ngữ, và nút đổi Light/Dark MODE PREMIUM cao cấp"

## Context

The site serves Vietnamese and English through subfolder routing with reciprocal hreflang (ADR 0008). The owner now requires Simplified Chinese in a **business register** (商务中文 — professional, commercial, not casual), a premium language switcher, and a premium Light/Dark mode control. The brand kit already ships dark-mode token semantics and a hero gradient, and `src/styles/global.css` already carries a **dormant** `[data-theme="dark"]` block that has never been activated.

Two constraints shape the decision:

1. **Public-truth discipline.** The site's public surfaces may only publish authored truth. A new locale must not silently fall back to English (that would present English text as if it were Chinese), and translations are content, not evidence — they never upgrade a claim's truth state.
2. **Static-first + CSP.** `script-src 'self'` forbids inline executable scripts (`scripts/check-client-budget.mjs` enforces it), and every route has a Brotli client-JS budget. A theme toggle must therefore work **without JavaScript** and enhance with a small same-origin script that cannot cause a flash of the wrong theme.

## Decision

### 1. Simplified Chinese becomes a first-class locale

1. **Routing:** `/zh/` joins `/en/` (default, `x-default`) and `/vi/`. Subfolder routing is unchanged (ADR 0008 §1).
2. **Reciprocal hreflang** across all three locales on every page; `x-default` remains `/en/`.
3. **Register:** Simplified Chinese (`zh-Hans`), business/commercial register, consistent terminology across nav, product and trust surfaces. No traditional-character mixing, no casual slang.
4. **Content parity is enforced, not assumed:** every locale carries its own authored content for each published page. A page that exists in one locale must exist in the others, and a missing translation is a build/test failure — never an English fallback rendered under `/zh/`.
5. **Provenance:** `zh` copy is an authored translation of already-approved EN/VI copy. It adds no product, legal, corporate or assurance claims of its own. Where a term is legally or commercially sensitive, the EN source remains authoritative and the translation is marked for native review in the locale's content file.
6. **Locale ≠ jurisdiction:** language, locale, country, currency, timezone and jurisdiction stay separate concerns (SGPS `PD-2026-009`); a Chinese-language page does not imply a Chinese legal entity, address or currency.

### 2. Light/Dark theming becomes first-class

1. **Activate the dormant dark semantics** already present in `global.css` (`[data-theme="dark"]`) with the brand kit's dark token values; light remains the default.
2. **No-JS baseline:** `prefers-color-scheme: dark` selects the dark palette through CSS only, so the site is correct with JavaScript disabled.
3. **Enhancement:** an explicit user choice (Light / Dark / System) is persisted and applied by a small same-origin script that runs **before first paint** so no wrong-theme flash occurs. It must stay inside the client-JS budget and introduce no inline executable script.
4. **Brand fidelity:** dark surfaces use kit-legal colour pairs only. The kit's contrast matrix is binding: `Cobalt on Ink` (3.92) and `Slate 500 on Porcelain` (4.48) are **not** valid normal-text pairs and must not be used as such on any theme.
5. **Presentation-only:** the theme choice is visitor preference state. It never mutates product, claim, evidence, lifecycle or assurance truth, and it never changes what content is published.

### 3. Premium controls

1. **Language switcher:** a three-way control that preserves the current path, exposes the full language name to assistive technology, marks the active language with `aria-current="page"`, keeps the 44px touch floor, and degrades to plain links without JavaScript.
2. **Theme control:** a Light/Dark/System control with the same accessibility, touch-floor and no-JS contract.
3. Both controls are presentation: they may reorder/reveal/summarize nothing that is not already published in the target locale.

## Consequences

- The `Language` type widens to three members; every `Record<Language, …>` (currently 20 sites across 8 files) must gain a `zh` entry — the type system enumerates the work and prevents a silent half-adoption.
- `SUPPORTED_LANGUAGES`, `getLanguageFromPath`, `getAlternatePath`, `stripLanguagePrefix`, sitemap generation, hreflang emission and the language switcher all extend to three locales.
- Six page content files (`index`, `about`, `contact`, `privacy`, `security`, `support`) need a `zh` counterpart, plus every shared label map.
- Existing i18n/hreflang/bilingual-parity tests extend to trilingual parity; a locale may not be added without the guards that keep it honest.
- Content maintenance becomes 3× text updates (accepted, per ADR 0008 §Consequences at portfolio scale).
- Dark mode adds a small persisted-preference script; the client budget gate is the arbiter, and a violation fails the build rather than silently shipping.
- **Rejected alternatives:** (a) client-side machine translation at runtime — leaks untranslated truth, breaks static-first and adds a third-party surface; (b) English fallback under `/zh/` — presents English as Chinese; (c) theme via inline script — violates CSP; (d) theme as a CSS-only media query with no user override — denies the visitor their choice, which the owner explicitly requested.

## Verification contract

- `tests/architecture/i18n-contract.test.mjs` — three locales, reciprocal alternates, no English fallback path for `zh`.
- `tests/architecture/hreflang-contract.test.mjs` — three-way reciprocity + `x-default` on every page.
- `tests/architecture/theme-contract.test.mjs` — dark semantics present, no inline executable script, contrast pairs legal per the kit matrix.
- `tests/e2e/c3-trilingual-parity.spec.ts` — rendered parity: nav, CTA, footer and page content exist per locale with no missing-translation markers.
- `tests/e2e/c3-theme-toggle.spec.ts` — Light/Dark/System selection, persistence, no-flash behaviour, no-JS dark via `prefers-color-scheme`, focus and touch floor.
- Existing public-truth, static-link, client-budget, axe/Lighthouse and cross-browser gates remain unchanged and must stay green.
