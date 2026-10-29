# SEO, ads and marketing readiness — plan

**Status:** ACTIVE (agent-executable rows) + Owner decisions pending.
**Date:** 2026-10-24 (GMT+7)
**Owner request 2026-10-24:** "áp dụng seo hiện đại, mới nhất. Sẵn sàng cho chạy ads, seo, marketing."
**Boundary:** this site is not a payment authority (Owner D-0). Readiness here means the site can receive paid and organic traffic truthfully and measurably. It is never a "paid ready" claim.

## 1. Measured baseline (production, 2026-10-24)

| Area            | State                                                                                                                                       | Evidence                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Crawl           | `robots.txt` allows all, including AI crawlers; sitemap lists every public route; `lastmod` comes from git and is omitted when not accurate | `/robots.txt`, `/sitemap.xml`, `src/pages/sitemap.xml.ts`       |
| Locales         | `canonical`, `hreflang` for en/vi/zh/zh-Hant and `x-default` on every page                                                                  | `src/layouts/BaseLayout.astro`                                  |
| Structured data | Organization, WebSite, WebPage on every page; SoftwareApplication, BreadcrumbList and ImageObject on product pages                          | production HTML                                                 |
| Social          | Per-product Open Graph image for Sổ Trọ and Sổ Tâm; default image elsewhere                                                                 | production HTML                                                 |
| Performance     | Lighthouse and client JS budget run on every PR                                                                                             | Quality Gates                                                   |
| Measurement     | Cloudflare Web Analytics only (aggregate, Owner decision 2026-10-20); first-party event taxonomy exists with transmission OFF               | `src/lib/analytics.ts`, `docs/current-work.json` `rum-provider` |
| Search Console  | Not verified                                                                                                                                | issue #523                                                      |

## 2. Current guidance used (informed-by, not a compliance claim)

- Google treats generative AI search features as part of normal Search; SEO fundamentals still apply. Source: Google Search Central blog, May 2026, <https://developers.google.com/search/blog/2026/05/a-new-resource-for-optimizing>.
- Search Console controls and insights for AI features. Source: Google blog, updated 2026-08-31, <https://blog.google/products-and-platforms/products/search/new-opportunities-control-and-insights-for-website-owners/>.
- `lastmod` must reflect real changes; the sitemaps ping endpoint is gone. Source: <https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping>.
- Image sitemaps: `image:loc` only; caption, title, license and geo tags are deprecated. Source: <https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps?hl=fr>.
- SoftwareApplication rich results need an offer price plus a rating or review. Source: <https://developers.google.com/search/docs/appearance/structured-data/software-app?authuser=4>. This site has no real rating or price, so it does not add them and does not expect that rich result.
- Google Ads destination experience: the landing page must work on common devices and return no errors to AdsBot. Source: <https://support.google.com/adspolicy/answer/6368661>.
- Vietnam Law 91/2025/QH15 on personal data protection is in force from 2026-01-01; Decree 356/2025/ND-CP implements it. Source summaries: <https://kpmg.com/vn/en/home/insights/2025/06/vietnam-new-personal-data-protection-law.html>, <https://ppc.land/vietnam-implements-comprehensive-personal-data-decree-on-final-day-of-2025/>. Legal reading of consent for ad tags is an Owner and counsel decision, not an agent one.

## 3. Agent-executable now

| ID    | Work                                                                                                                                                                             | State                                                                                                                                                                                                                                                             |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEO-1 | SoftwareApplication `screenshot` from real showcase captures; image sitemap entries for product media; dist guard with negative proofs; title/description/OG audit of every page | #687 (screenshot JSON-LD, image sitemap, dist guard): waits for the Owner label. Production audit done 2026-10-24 (79 sitemap URLs): no missing or duplicate title/description/OG/canonical, one H1 per page, valid JSON-LD, reciprocal hreflang                  |
| SEO-2 | Fix audit outliers that need no new copy (duplicate or missing meta derived from existing data)                                                                                  | DONE: #689 (`834dd56`). Indexable `/en/journal/` and `/vi/journal/` no longer list noindex zh/zh-Hant journal indexes in hreflang. One vi description (171 chars, `/vi/evidence/security-reporting-is-private/`) is a copy change and waits for Owner copy review |
| SEO-3 | Vững Tay Lái Open Graph image                                                                                                                                                    | Covered by #681: `/social/products/vungtaylai.jpg` is built from the app icon and carries no tagline                                                                                                                                                              |
| SEO-4 | Story-led product pages (copy candidate in `docs/drafts/2026-10-24-product-storytelling-candidate.md`)                                                                           | BLOCKED on Owner copy approval                                                                                                                                                                                                                                    |
| SEO-5 | Real UI showcase for Sổ Tâm and Vững Tay Lái                                                                                                                                     | Vững Tay Lái: #686 (draft; identity art held, OG-3). Sổ Tâm: HELD — captures show meditation chrome and the art reads "AI Journal for Clarity"                                                                                                                    |

## 4. Owner decisions (ads cannot start well without them)

| ID   | Decision                                                                                                                                                                                                                        | Recommendation                                                                                                                                                                | Why it blocks                                                            |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| AD-1 | **What is the conversion?** Today a visitor cannot sign up (Owner 2026-10-12: no public app sign-in) and there is no waitlist.                                                                                                  | A first-party waitlist per product, or contact-by-email as the interim goal.                                                                                                  | An ad with no action to take only buys page views.                       |
| AD-2 | **Ad measurement model.** Google Ads or Meta tags add third-party scripts and identifiers, which the current privacy notice, CSP and SGPS-DEC-2026-032 aggregate-only rule do not allow.                                        | Start with UTM-tagged landing pages read through the existing aggregate analytics. Add a consented conversion tag only after the privacy notice and legal review are updated. | Adding a tag silently would break the published privacy notice.          |
| AD-3 | **Which product goes first.**                                                                                                                                                                                                   | Sổ Trọ only: it is the one product in preview. Sổ Tâm and Vững Tay Lái stay organic until they can be used.                                                                   | Paying to send people to "In development" pages wastes budget and trust. |
| AD-4 | **Search Console and Bing Webmaster verification** by DNS TXT record.                                                                                                                                                           | Do it now; it is free and needed for every SEO signal.                                                                                                                        | Issue #523. Needs the Owner's DNS access.                                |
| AD-5 | **Social profiles** for `sameAs` and Open Graph attribution.                                                                                                                                                                    | Only once real profiles exist.                                                                                                                                                | No profile facts exist in the repo.                                      |
| AD-6 | **Tagline-free identity lockups.** The locked art reads "AI Driving Coach" (Vững Tay Lái) and "AI Journal for Clarity" (Sổ Tâm); neither product has a runtime AI dependency today. Both are held off the profile pages (OG-3). | A brand-kit lockup with no tagline, same mark and wordmark; the hold is lifted only for that file.                                                                            | The logo is LOCKED; only the Owner or brand kit can supply a new file.   |

### 4.1 Owner decisions recorded 2026-10-26 (GMT+7)

The Owner chose the recommended option on the AD-1 decision card and then said to proceed "theo best practice" (per the recommendations), on 2026-10-26.

| ID   | Outcome                                                                                                                                                                                                                                                     |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AD-1 | **Decided: contact by email.** The conversion is a visitor reaching `/{lang}/contact/` from the Sổ Trọ page and writing to the published business mailbox. No waitlist, no form, no new data store. A first-party waitlist needs its own plan and approval. |
| AD-2 | **Decided: UTM-tagged landing URLs, read through the existing aggregate analytics.** No ad tag, pixel, cookie or identifier is added, so the published privacy notice and CSP stay true.                                                                    |
| AD-3 | **Decided: Sổ Trọ only.** Sổ Tâm and Vững Tay Lái stay organic while they are In development.                                                                                                                                                               |
| AD-4 | **In progress.** The `google-site-verification` TXT record is present in DNS (read 2026-10-26). Whether Search Console has completed verification is an Owner read; Bing is not yet verified by DNS.                                                        |
| AD-5 | Open (no real profiles yet).                                                                                                                                                                                                                                |
| AD-6 | Open (brand kit file needed).                                                                                                                                                                                                                               |

## 5. Not doing

- No fake ratings, reviews, prices, user counts or testimonials in structured data or ads.
- No `llms.txt`-style special AI files beyond the existing one; Google says they are not needed.
- No tracking pixel, fingerprinting or cookie before AD-2 is decided.

## 6. Paid-traffic launch kit (AD-1..AD-3 as decided)

No source change is needed: the path already exists on production (read 2026-10-26). The Sổ Trọ page has one primary action (`#profile-showcase`) and one secondary action, "Liên hệ với chúng tôi" / "Contact us", to `/{lang}/contact/`, which lists the business mailbox. Query strings do not change the canonical (`https://blueskyzlabs.com/vi/products/sotro/`), so tagged URLs do not create duplicate pages for search.

**Landing URLs** (the ad account adds the parameters; the site reads none of them):

- Vietnamese (primary market): `https://blueskyzlabs.com/vi/products/sotro/?utm_source={source}&utm_medium=cpc&utm_campaign=sotro-{yyyymm}&utm_content={ad}`
- English: the same path under `/en/`.
- Keep `utm_*` values lowercase, ASCII and free of personal data.

**What counts, and where to read it**

- Primary signal: visits to `/vi/contact/` and `/en/contact/` whose referrer is the Sổ Trọ page, plus emails to the business mailbox that mention Sổ Trọ. Both are read by the Owner (Cloudflare Web Analytics dashboard, mailbox).
- Whether Cloudflare Web Analytics keeps `utm_*` query strings in its reports is NOT VERIFIED. If it does not, campaign split comes from the ad platform's click counts against the contact-page trend.
- Not measured, by design: mailto clicks, per-visitor journeys, conversions inside the ad platform. Adding any of them is AD-2 territory: privacy notice update and legal review first.

**Before the first ad (Owner)**

1. The ad account and budget are the Owner's; this repository holds no ad credentials or spend.
2. Ad copy follows `docs/editorial/PUBLIC_CONTENT_STANDARD.md`: Sổ Trọ is "Preview" / "Xem trước", the web app is in preview, Android and iOS are in development. No price, rating, user count or "free forever" claim.
3. Google Ads destination checks: the page answers 200 on mobile and desktop, has no interstitial, and `robots.txt` blocks no crawler (AdsBot included).
4. Search Console: on a Domain property, submit the sitemap as the absolute URL `https://blueskyzlabs.com/sitemap.xml` (a bare `sitemap.xml` is refused as an invalid address). A first-day status of "Couldn't fetch" with type "Unknown" is not a diagnosis: run URL Inspection, then Test live URL, on the sitemap URL before changing anything (LSN-marketing-007).
5. Read the served `https://blueskyzlabs.com/robots.txt`, not only `src/pages/robots.txt.ts`: as of 2026-10-29, Cloudflare's managed robots.txt prepends its own group that disallows about 40 AI crawlers, which conflicts with Owner decision D-7 (search=yes, ai-input=yes, ai-train=no). Turning it off is an Owner setting in the Cloudflare dashboard.

**Agent follow-up after launch:** re-read the landing and contact pages live in vi and en after each copy change, and record the first month's contact-page trend from the Owner's dashboard numbers. Numbers are never estimated.
