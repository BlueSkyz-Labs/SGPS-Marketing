# SGPS-DEC-2026-019 Adoption — SGPS Marketing

**Original adoption authority:** `BlueSkyz-Labs/sgps-core@dda7c21`  
**Canonical source discovery:** `BlueSkyz-Labs/sgps-core@a850e5cc7f277c4c04c446aee35e7516f798ba53` (2026-09-20 refresh; discovery is NOT an automatic project repin).  
**Local decisions:** `docs/decisions/0009-multilingual-language-preference.md` and `docs/decisions/0010-third-locale-and-theme.md`.  
**Initial record:** 2026-09-19. **Reconciled against:** `main@3c4f846e17841b383b8579fcdf11ae18bb36092b` and merged PR #192.  
**Stage:** production public site; this document describes source/routing evidence, not a release or native-linguistic certification.

## Locale readiness — do not conflate source shipment with full SGPS verification

- `en`: Published first-class source; existing production locale.
- `vi`: Published first-class source; existing production locale.
- `zh-Hans` (runtime `zh`): **PUBLISHED SOURCE + ROUTES; FULL SGPS VERIFICATION PENDING**. PR #192 introduced `/zh/` routes, authored business-register Chinese catalogs, three-way hreflang and trilingual guards. At reconciliation start, exact-main Quality Gates and Browser Assurance were green. Native linguistic/domain review of sensitive claims, complete CJK/IME and all real-user evidence is not established by this record.
- `zh-Hant`: **ARCHITECTURE_READY**. No separate published Traditional Chinese route/catalog and no permission to substitute Simplified Chinese.

The original 2026-09-19 snapshot said both Chinese locales were architecture-ready and all Chinese routes were blocked. That is historical pre-#192 evidence, **not** the current source state. Conversely, shipping `zh` routes does not by itself prove `CANONICAL_EQUIVALENT` translation or full first-class runtime readiness under the canonical SGPS decision.

## Durable preference / privacy contract

The public root is a noindex language gateway. An explicit saved language choice wins; then supported browser/device language; an optional future trusted edge country hint may select VI for VN and EN otherwise; EN is the fallback. No IP lookup or additional visitor profiling is authorized just to select language.

Localized URLs remain stable and are never geo-redirected. The visitor language key `localStorage:blueskyz.ui.language` may be written only after an explicit language switch. It is neither analytics identity nor a visitor profile. Language does not determine country, jurisdiction, currency, market, or residency.

## Remaining acceptance evidence (do not mark as PASS without execution)

- Native/domain review of Chinese trust, security, privacy, legal and product language, with translation-state evidence and no invented claims.
- CJK font/glyph/line-breaking, narrow-viewport and 200% zoom, screen-reader accessible names; IME composition/submit behavior where user input exists.
- Rendered runtime route parity, reciprocal canonical/hreflang/SEO, no misleading English fallback or `zh-Hant` masquerading as `zh-Hans`.
- Product/source owner facts and screenshots remain independently blocked by C2 P0, irrespective of translation readiness.

## Decision and handoff

Maintain honest published `zh-Hans` source state, keep unverified gates visibly unverified, and hold `zh-Hant` as architecture-ready until separately authored and reviewed. The duplicate local ADR number `0009` must be resolved through a separate authority/index reconciliation; do not silently overwrite either approved decision or adopt an old C4 reservation.
