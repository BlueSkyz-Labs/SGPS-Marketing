# Entity verification readiness — evidence (#523)

Date: 2026-10-07
Branch: `feat/verify-entity-523`
Goal: make BlueSkyz Labs independently verifiable (human + automated) for
startup-program review without fabricating anything.

## Owner-confirmed facts (chat, 2026-10-07)

- Founder: **Tony Nguyen**, Founder & CEO
- Operating since: **2026** (the owner-confirmed operating year; no legal
  incorporation date is inferred)
- Location: **Ho Chi Minh City, Vietnam**
- Mailboxes: **tony@blueskyzlabs.com** and **hello@blueskyzlabs.com** are real
  (owner attestation).

These resolve audit E-26: the About page renders founder and location details
from the `pages` collection (`{lang}-about`, `sections.content`). The site-wide
operating year comes from `SITE.operatingSinceYear`. Structured data does not
infer a legal founding date or publish a mailbox.

## What changed in source

- `src/content/pages/{en,vi,zh,zh-hant}/about.yaml`: added localized
  `location`. `founder_name`/`founder_title` were already present; the
  operating year comes from `src/data/site.ts`.
- `src/components/empty-state/AboutComposition.astro`: reads the pages
  collection entry and renders the founder block (name, title, location).
  Absent fields are still omitted, never padded.
- Guards evolved (not weakened): `exp-s8-empty-states.test.mjs`,
  `trust-surfaces.test.mjs` and `tests/e2e/trust-routes.spec.ts` now assert
  the founder block renders from the approved data path and stays
  data-driven (no hardcoded literals elsewhere).

## Mailbox verification status

- Owner attestation: tony@ and hello@ exist — recorded, not independently
  verified.
- DNS (MX/SPF/DMARC): **NOT_VERIFIED** — this environment's resolver refuses
  external queries, so no independent DNS evidence could be collected here.
  Verify via the DNS provider dashboard or a tool like MXToolbox before
  claiming the mailbox as fully verified (#281).
- Publishing remains gated on independent provider receive/reply,
  ownership/recovery, and production build configuration evidence. The site
  renders role-approved addresses from environment variables when configured.

## Still open (not in this PR)

- `#522` SGPS-DEC-2026-038 email/identity standard: full EI-01..EI-14 mapping.
- `#281` mailbox truth: send/receive/reply proof + staffing/ownership record.
- `sameAs` profiles (LinkedIn company page, GitHub org): pending owner URLs.
- Production contact/security mailbox delivery and provider configuration.
