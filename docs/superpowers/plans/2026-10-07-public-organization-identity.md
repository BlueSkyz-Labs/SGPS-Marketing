# Implementation Plan: Public organization identity

**Design:** `docs/superpowers/specs/2026-10-07-public-organization-identity-design.md`
**Execution:** autonomous, branch → PR → exact-head Source Assurance → merge.
**Method:** TDD; run the smallest relevant tests first, then the repository's source gates required by the PR.
**Review focus:** no hidden or unsupported public facts, role-specific email routing, all four locales, no-JS gateway, and unchanged redirect/accessibility contracts.
**Risk:** public surface; incorrect email routing can expose a mailbox to spam or send security reports to the wrong person. Email remains fail-closed until separately verified.

## Task 1 — Add failing identity and role-mapping tests

**Files:** `tests/architecture/public-organization-identity.test.mjs`, existing About/contact/trust tests, and targeted E2E specs.

- Assert the root gateway contains the organization name, mission, year, and ordinary About link in its static HTML.
- Assert all About locales render the year and mission and derive product names/status from the public product registry.
- Assert the visible operating year is not emitted as a Schema.org `foundingDate`; omit founder/contactPoint/email when no eligible fact is present.
- Exercise role-mailbox matching: accepted role + canonical domain passes; wrong role, privileged role, malformed address, and another domain return no public mailbox.
- Assert DEC-038 mappings are applied at Contact, Support, Privacy, Security, and About.
- Run the new architecture test and targeted E2E tests; confirm they fail before implementation.

## Task 2 — Add the smallest shared public-truth projection

**Files:** `src/data/site.ts`, `src/lib/seo.ts`, `.env.example`.

- Add the owner-confirmed `operatingSinceYear: 2026` to `SITE`.
- Add a small pure email-role projection helper; do not add a second organization registry or accept a role based on the local-part alone.
- Expose only the role-aligned values needed by current public routes. Keep optional values blank in `.env.example` with the #281 verification prerequisite.
- Keep the operating year out of Organization JSON-LD; retain `safeJsonLd` and stable entity identity.
- Re-run Task 1's focused tests and fix only implementation defects.

## Task 3 — Render visible organization facts and registry products

**Files:** `src/pages/index.astro`, the four localized `about.astro` pages, `src/components/empty-state/AboutComposition.astro`, and focused UI tests.

- Add the identity block and About link to the gateway without changing its redirect script, locale tiles, first-paint inline styling, or page role.
- Render the same mission/year in English, Vietnamese, Simplified Chinese, and Traditional Chinese.
- Keep product names, descriptions, and status labels derived from `getPublicProducts()` and existing product-copy/status helpers.
- Keep founder name, location, incorporation, and external-profile claims omitted.

## Task 4 — Enforce purpose-specific public email routing

**Files:** `src/pages/*/contact.astro`, `src/pages/*/support.astro`, `src/pages/privacy.astro`, `src/pages/security.astro`, `src/components/trust/SecurityBody.astro`, `src/components/empty-state/BusinessRouteState.astro`, related trust-ledger data and tests, `.env.example`.

- Contact displays only general/support-role addresses; Support only support; Privacy only privacy; Security only security; About only the owner-confirmed founder/business role when its dedicated verified configuration is present.
- Keep GitHub private-advisory reporting as the fallback security path.
- Ensure the owner mailbox cannot appear as general support or security and that no privileged/admin address is rendered.
- Preserve truthful empty states when no role mailbox is configured.

## Task 5 — Verify, package, and promote

- Run focused architecture tests, typecheck, lint/format checks, production build, targeted gateway/About/contact E2E, and static-link/publishability checks.
- Run architecture-view check if the repository's architecture contracts require it for the final diff.
- Create a PR referencing issue #523; inspect exact-head checks, merge state, required labels, and conversation resolution before merge.
- After merge, read back the merged SHA and status. Keep #281, anonymous production deployment, and upstream truth reconciliation open until their independent evidence exists.
