# Public organization identity on the website

**Status:** approved for autonomous implementation in the 2026-10-07 operating session.
**Authority:** Owner-approved issue #523, portfolio DEC-038 at its pinned revision, and the Owner's confirmation that operations began in 2026.
**Scope:** public identity facts and purpose-specific email projection for the marketing website.

## Goal

Help a person who reaches `blueskyzlabs.com` understand, without running JavaScript, who BlueSkyz Labs is, its mission, when it began operating, which real products it publishes, and where the appropriate contact route lives.

## Design

1. Keep the localized Home, Products, About, and Contact pages. Keep `/` as the lightweight language gateway rather than duplicating the Home page.
2. Extend the existing `SITE` source with the Owner-confirmed `operatingSinceYear: 2026`; continue using `SITE.proposition` for the mission. The gateway and all localized About pages render these same facts.
3. The gateway keeps its four language choices and redirect behavior. Its static, no-JavaScript body gains the BlueSkyz Labs name, mission, year, and a normal link to `/en/about/`.
4. About pages keep their concise layout. Remove duplicated product-name/status claims from the page lede and render the public product registry through `AboutComposition`, including each record's localized status label. Do not render founder biography, location, legal status, or other unconfirmed facts.
5. Keep the operating year as a visible website fact only. Do not map it to Schema.org `foundingDate`, which would make a separate founding claim. Keep the existing stable `@id`, name, URL, logo, and `safeJsonLd`; omit founder, contactPoint, email, location, and `sameAs` unless separately approved and evidenced.
6. Project mailboxes by DEC-038 role: `PUBLIC_CONTACT_EMAIL` is eligible only as `hello@blueskyzlabs.com`; optional `PUBLIC_SUPPORT_EMAIL`, `PUBLIC_PRIVACY_EMAIL`, and `PUBLIC_FOUNDER_EMAIL` are eligible only for their exact roles; `PUBLIC_SECURITY_EMAIL` is eligible only as `security@blueskyzlabs.com`. A wrong role, wrong domain, malformed value, privileged identity, or absent value produces no public link. The founder address is About-only; general, support, privacy, and security addresses stay on their corresponding routes.
7. Do not treat environment configuration as proof of mailbox operation. Leave all new optional role values blank until the independent receive/reply and ownership/recovery evidence required by #281 exists. Never print or link the privileged admin mailbox. The current owner mailbox is not repurposed as general support or security.

## Acceptance

- `/` presents the organization, mission, year, and an ordinary About link with JavaScript disabled; all four language choices, visual scheme, and redirect logic remain intact.
- All four About routes visibly present the same mission and year, and list only products returned by `getPublicProducts()`, with status from each record.
- Organization JSON-LD emits no unapproved contact, founding date, or identity claims.
- Contact, support, privacy, security, and About project only the matching DEC-038 role; wrong-role values fail closed.
- Existing Home, Products, contact/security separation, no-founder, accessibility, privacy, and source-assurance contracts remain valid.

## Limits and follow-up gates

- Owner confirmation of the operating year does not establish a founding date, incorporation, a legal address, a country-level base, trademark ownership, or funding.
- Source changes do not establish live mailbox provisioning or receive/reply. Issue #281 remains the external evidence gate; public deployment is not claimed from a merged source change.
- The upstream SGPS public-brand truth and this repository's local public product registry have a known reconciliation gap. This change consumes the existing local registry and does not silently rewrite upstream truth.
