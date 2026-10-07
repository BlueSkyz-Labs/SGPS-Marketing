# Entity verification readiness — evidence (#523)

Date: 2026-10-07
Branch: `feat/verify-entity-523`
Goal: make BlueSkyz Labs independently verifiable (human + automated) for
startup-program review without fabricating anything.

## Owner-confirmed facts (chat, 2026-10-07)

- Founder: **Tony Nguyen**, Founder & CEO
- Founded: **2026**
- Location: **Ho Chi Minh City, Vietnam**
- Mailboxes: **tony@blueskyzlabs.com** and **hello@blueskyzlabs.com** are real
  (owner attestation).

These resolve audit E-26: the About page now renders the founder block from
the `pages` collection (`{lang}-about`, `sections.content`), and the
Organization JSON-LD carries `founder`, `foundingDate`, `address` and `email`.

## What changed in source

- `src/content/pages/{en,vi,zh,zh-hant}/about.yaml`: added `founded_year: 2026`
  and localized `location`. `founder_name`/`founder_title` were already present.
- `src/components/empty-state/AboutComposition.astro`: reads the pages
  collection entry and renders the founder block (name, title, "Founded YEAR ·
  location"). Absent fields are still omitted, never padded.
- `src/data/empty-state-copy.ts`: added the `aboutFounded` label (derived
  translation, flagged for native review).
- `src/lib/seo.ts` (`organizationJsonLd`): added `foundingDate`, `founder`
  (Person), `address` (PostalAddress) and `email`. `sameAs` stays absent —
  no external profiles supplied yet.
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
- Publishing step (owner action): set `PUBLIC_CONTACT_EMAIL=hello@blueskyzlabs.com`
  in the production build environment. The contact page already renders the
  business card from that variable; no source change needed.

## Still open (not in this PR)

- `#522` SGPS-DEC-2026-038 email/identity standard: full EI-01..EI-14 mapping.
- `#281` mailbox truth: send/receive/reply proof + staffing/ownership record.
- `sameAs` profiles (LinkedIn company page, GitHub org): pending owner URLs.
- Native review of the derived `aboutFounded` zh/zh-hant labels.
