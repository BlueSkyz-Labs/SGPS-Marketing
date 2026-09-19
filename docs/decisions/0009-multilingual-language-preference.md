# ADR 0009 — Portfolio Multilingual Baseline & Durable Language Preference

- **Status:** Accepted
- **Date:** 2026-09-19
- **Supersedes in part:** ADR 0008 only for language-scope growth and root-entry behavior
- **Authority:** SGPS-DEC-2026-019 / `BlueSkyz-Labs/sgps-core@dda7c21`

## Context

The portfolio now targets Vietnamese, English, Simplified Chinese (`zh-Hans`) and Traditional Chinese (`zh-Hant`). The current public site has production-ready EN/VI content and routes, but Chinese catalogs/content have not completed linguistic, CJK, accessibility and trust-copy review.

The previous root path always redirected to English and v3 prohibited all localStorage personalization. That would cause a returning user who explicitly chose Vietnamese to be sent back to English on a later root visit.

## Decision

1. Keep production localized content routes stable at `/en/...` and `/vi/...` until Chinese content passes first-class gates.
2. Register `zh-Hans` and `zh-Hant` as `ARCHITECTURE_READY`; do not publish empty/partially translated Chinese SEO routes.
3. Serve `/` as a bounded, noindex language gateway rather than a permanent English 301.
4. Resolve the gateway as:
   - explicit saved choice;
   - supported browser/device preference;
   - optional coarse country hint (VN → VI, otherwise EN);
   - English fallback.
5. Persist only the explicit language code in `localStorage:blueskyz.ui.language` when the user uses the language switcher.
6. This key is an explicit exception to the prior blanket no-localStorage rule. Decision Room state, intent state, analytics identity, fingerprinting, visitor profiles and remote personalization remain non-persistent/prohibited.
7. Never redirect an explicit localized URL (`/en/...`, `/vi/...`) based on browser or geography.
8. Country/IP remains a weak first-visit presentation hint. The current static deployment does not collect location or add a network lookup merely for localization; a future edge-supplied country hint may be consumed by the same resolver without changing precedence.
9. Chinese activation later uses self-names `简体中文` / `繁體中文`; language identity never uses country flags.

## Consequences

- Returning users who explicitly switch language keep that preference.
- First-time users with a supported browser language get an appropriate initial route without making localized URLs unstable.
- Exact VN-country routing remains optional until the static deployment has an approved edge country signal; the site does not weaken privacy or add a location service to manufacture it.
- Chinese SEO/content cannot be accidentally published before review.
- Critical content and navigation on localized pages continue to work without JavaScript; only the root preference gateway requires JavaScript for automatic selection and provides explicit no-JS language links.
