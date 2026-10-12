# Customer focus: one trust door, no public sign-in (2026-10-12)

**Decision:** Owner, 2026-10-12, from the customer-perspective audit.

1. `/verify` is the one trust door. Collections (`/editions`), Printable summary (`/dossier`) and Compare claims (`/decision-room`) leave the footer and the product "Next steps" row. The pages stay published and stay searchable in the command navigator. The home loses the "Check what we say" claims band.
2. No public page links to a product's app sign-in. The product record keeps `appAccess.signInUrl` as product truth.
3. No new facts were added: no price, launch date or channel.

**Change:** PR #575, squash-merged as `f308909` from head `53f8a74`.

**Guard:** `tests/architecture/customer-focus.test.mjs`. Its negative proofs reject:

- a footer that re-adds a hidden page;
- a footer that drops `/verify`;
- each sign-in link shape.

## Exact-head CI on 53f8a74 (owner-approved label present)

| Check                                                       | Result |
| ----------------------------------------------------------- | ------ |
| Quality Gates                                               | PASS   |
| Browser shards (chromium, firefox, webkit, mobile-chromium) | PASS   |
| Browser Assurance                                           | PASS   |
| Visual regression gate                                      | PASS   |
| Lighthouse CI                                               | PASS   |

Six visual baselines were refreshed for the two views that changed in-viewport: `/en/products/` at 1440 and `/vi/products/sotro/`. The other 18 views matched their committed baselines without change.

## Production read-back (https://blueskyzlabs.com, 2026-10-12)

| Check                                                                                                      | Result                                                                                |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `/en/` claims band (`data-trust-band`)                                                                     | absent                                                                                |
| `/en/about/` footer links                                                                                  | products, about, contact, support, privacy, security, verify (7); no editions/dossier |
| `/en/editions/`, `/en/dossier/`, `/en/decision-room/`                                                      | 200; linked only from the command navigator                                           |
| Sign-in links on `/en/products/sotro/`, `/vi/products/sotam/`, `/en/contact/`, `/en/products/sotro/guide/` | 0                                                                                     |
| `/vi/`, `/zh/`, `/zh-hant/`                                                                                | 200                                                                                   |

**Not verified:** the Cloudflare Worker version ID for this deploy. The connector exposes only the worker name and id (see #375). The read-back is content-based.

## Residual

- Existing Sổ Trọ and Sổ Tâm users no longer have a route from the website to the app sign-in. This is accepted by the Owner.
- The Sổ Tâm profile now has no primary action. No eligible Try destination exists and none was invented.
- The plane branch of `RevealObserver` has no target on the home. It stays within its 2 KB budget; remove it in a later change if no surface reuses it.
