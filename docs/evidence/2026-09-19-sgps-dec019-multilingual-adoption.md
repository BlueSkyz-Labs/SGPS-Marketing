# SGPS-DEC-2026-019 Adoption — SGPS Marketing

**Authority:** `BlueSkyz-Labs/sgps-core@dda7c21`  
**Local decision:** ADR 0009  
**Date:** 2026-09-19

- `en`: FIRST_CLASS
- `vi`: FIRST_CLASS
- `zh-Hans`: ARCHITECTURE_READY
- `zh-Hant`: ARCHITECTURE_READY

The public root is a noindex language gateway. Explicit saved choice wins; then supported browser/device language; an optional future edge country hint may select VI for VN and EN elsewhere; EN is the fallback.

Localized URLs remain stable and are never geo-redirected. The only persistent visitor-side state introduced is `localStorage:blueskyz.ui.language`, written after an explicit language switch. It is not analytics identity, fingerprinting or a visitor profile.

Chinese public routes remain blocked until real translated main content, metadata, accessibility copy, assurance vocabulary review, CJK typography/runtime QA and reciprocal hreflang/canonical evidence are complete.
