# SGPS-DEC-2026-038 — Portfolio Email & Identity: local mapping

**Canonical authority:** `BlueSkyz-Labs/sgps-core@2c39eea2a7370934247131aca286a6c4ca322a0e`, `decisions/SGPS-DEC-2026-038-portfolio-email-identity-operating-standard.md` §11.
**Mapped at:** Marketing `main@6b07adc` (2026-10-18 GMT+7). **Tracking:** #522, #281.
**Lifecycle:** MAPPED. Not `ADOPTED`: five rules are `BLOCKED` on Owner/tenant evidence (§11 requires evidence for every applicable rule).
**SGPS pin:** unchanged.

## What this repository does with email

Marketing is a static Astro site. It sends no mail, has no form backend (`form-action 'self'`, no POST endpoint) and no newsletter. Its only email surface is **published `mailto:` links**, built from `PUBLIC_*_EMAIL` in `.env.production` and filtered through `src/lib/public-mailbox.ts` (exact role-alias allowlist on `@blueskyzlabs.com`).

Published today (production read-back 2026-10-18, `docs/evidence/2026-10-18-open-issue-triage-readback.md`):

| Role                | Address                        | Where                                       | Owner confirmation     |
| ------------------- | ------------------------------ | ------------------------------------------- | ---------------------- |
| contact (temporary) | `tony@blueskyzlabs.com`        | `/*/contact/`                               | 2026-10-08/09, PR #538 |
| support             | `support@blueskyzlabs.com`     | `/*/support/`, `/*/contact/`                | 2026-10-18, audit A-02 |
| security            | none (GitHub private advisory) | `/.well-known/security.txt`, `/*/security/` | —                      |

## EI-01…EI-14

| Rule                                                          | Status                               | Evidence / prerequisite                                                                                                                                                                |
| ------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EI-01 purpose planes separated                                | APPLIES — PASS (source)              | Only the human plane exists here. No transactional or marketing sending code in `src/`.                                                                                                |
| EI-02 founder vs privileged admin separated                   | APPLIES — PASS (source + production) | Allowlist accepts only role aliases; `tests/architecture/public-organization-identity.test.mjs` rejects `ops@`/`admin@`. Production HTML has 0 occurrences of the admin identity.      |
| EI-03 role aliases map to real owners, no catch-all           | BLOCKED                              | Needs M365 tenant read-back of `support@` / `tony@` owners and absence of catch-all (Owner). Public DNS shows MX on Microsoft 365 only.                                                |
| EI-04 shared mailbox: no shared password, delegated MFA       | BLOCKED                              | M365 tenant configuration for `support@` (Owner).                                                                                                                                      |
| EI-05 website exposes only approved contacts                  | APPLIES — PASS (source + production) | Exactly the two Owner-confirmed addresses above are public; `validate-public-truth` and the allowlist fail closed on anything else.                                                    |
| EI-06 transactional From vs MAIL FROM separated               | NOT_APPLICABLE                       | Marketing sends no transactional mail. Sổ Trọ owns `mail.blueskyzlabs.com`.                                                                                                            |
| EI-07 marketing sender lane                                   | NOT_APPLICABLE                       | No email marketing, no newsletter, no list capture (Marketing hard rule: no tracking beyond Cloudflare Web Analytics).                                                                 |
| EI-08 SPF/DKIM/DMARC for sending lanes                        | NOT_APPLICABLE (no sending lane)     | Informational apex DNS read-back 2026-10-18: `v=spf1 include:spf.protection.outlook.com -all`; `_dmarc`: `p=reject; adkim=s; aspf=s`. Header/inbox proof belongs to the sending owner. |
| EI-09 restricted security disclosure + security.txt           | APPLIES — PASS (production)          | `/.well-known/security.txt` (RFC 9116) points to a GitHub private advisory; no public security mailbox.                                                                                |
| EI-10 email never sufficient for privileged action            | NOT_APPLICABLE                       | No accounts, privacy, financial or privileged actions on this site.                                                                                                                    |
| EI-11 no uncontrolled forwarding / AI ingest of security mail | BLOCKED                              | Tenant forwarding/transport rules for `support@` (Owner). Security mail is not routed by email here.                                                                                   |
| EI-12 product-qualified routing, no mailbox sprawl            | APPLIES — PASS (source)              | One `support@` serves Sổ Trọ and Sổ Tâm; no per-product mailboxes.                                                                                                                     |
| EI-13 retention, monitoring, ownership, continuity            | BLOCKED                              | Who reads `support@`, retention and continuity (Owner). The site promises no response time.                                                                                            |
| EI-14 admin recovery with emergency access                    | BLOCKED                              | Tenant break-glass for the admin identity (Owner, M365).                                                                                                                               |

## Negative proof

The allowlist rejects `admin@`, `ops@` and any non-role local part (existing guard in `tests/architecture/public-organization-identity.test.mjs`). Swapping `PUBLIC_SUPPORT_EMAIL` for a non-role address makes `SITE.supportEmail` null, and `/support` falls back to Contact (`tests/e2e/cx1-support-path.spec.ts`).

## To reach ADOPTED

The Owner provides tenant evidence for EI-03, EI-04, EI-11, EI-13 and EI-14 (redacted screenshots or exports), and one send/receive/reply round trip for `support@` and `tony@`. Then mark those rows PASS here and close #522.
