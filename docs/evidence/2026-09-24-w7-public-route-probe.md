# W7 public-route probe — production reachability read-back

**Recorded:** 2026-09-24 (Asia/Ho_Chi_Minh, SEAST) · **Wave:** C3-C W7 Convergence Read-Back (evidence step)
**Method:** unauthenticated `curl` from the build host against the canonical domain and its known
neighbours, `-L` following redirects, `--max-time 8..20`. No credentials, no cookies, no authenticated
session — this is exactly what an anonymous visitor gets.

## Why this belongs in read-back

W7 requires checking Cloudflare deployment and _real_ public routes rather than self-certifying from
CI. Source-assurance green proves the repository; it does not prove what the Internet serves.

## Results

| URL                                              | HTTP        | What it actually served                                                                                            |
| ------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `https://blueskyzlabs.com/`                      | 302 → `200` | **Cloudflare Access login page** (`blueskyz869.cloudflareaccess.com/cdn-cgi/access/login/...`), `redirect_url=%2F` |
| `https://blueskyzlabs.com/.well-known/sgps.json` | 302 → `200` | Cloudflare Access login, `redirect_url=%2F.well-known%2Fsgps.json`                                                 |
| `https://blueskyzlabs.com/health`                | 302 → `200` | Cloudflare Access login                                                                                            |
| `https://blueskyzlabs.com/security`              | 302 → `200` | Cloudflare Access login                                                                                            |
| `https://blueskyzlabs.com/about`                 | 302 → `200` | Cloudflare Access login                                                                                            |
| `https://sgps.blueskyzlabs.com/`                 | `000`       | connection failed — no reachable host                                                                              |
| `https://www.tonydemo.com/`                      | **200**     | serves the brand site: `<title>BlueSkyz Labs</title>`, `CF-Cache-Status: HIT`, **no redirect**                     |
| `https://tonydemo.com/`                          | **200**     | same, no redirect                                                                                                  |

The `200` on the canonical domain is the Access login document, **not site content**: every probed
route is intercepted before the origin. The observed `Location` and the `redirect_url` parameter show
the original path was preserved, so behaviour after login is unchanged by this probe.

## Readings

1. **Public launch gate is still active.** Cloudflare Access intercepts `/`, `/health`, `/security`,
   `/about` and even the agent-readable `/.well-known/sgps.json`. That matches the router: public
   launch remains owner-gated with `Access = OFF` as the release condition. Nothing here may be
   reported as "live" — the site is not publicly readable.

2. **`sgps.blueskyzlabs.com` does not resolve/reach** — consistent with the product-subdomain scheme in
   ADR 0006 not being provisioned yet, i.e. migration incomplete.

3. **Finding — the retired legacy domain still serves content.** ADR 0006 requires _"Preserve old URLs
   with permanent redirects where technically possible"_, yet `tonydemo.com` and `www.tonydemo.com`
   return `200` with the brand site and **no 301** to the canonical host. The repository's
   `public/_redirects` only rewrites _paths inside one host_ (`/about/ → /en/about/` etc.); a
   cross-host 301 cannot be expressed there.

   Why this was **not** auto-fixed:
   - `wrangler.toml` describes a **pure static-assets worker** (`[assets] directory = "./dist"`,
     `workers_dev = false`) with **no Worker script** — there is no request-handling code path in this
     repository where a host check could live, so an in-repo fix does not exist.
   - The redirect belongs at the **Cloudflare zone/custom-domain level**, and `portfolio.tonydemo.com`
     shares that zone, so a zone-wide wildcard would redirect unrelated properties. The correct rule is
     host-scoped (`tonydemo.com` + `www` only).

   Existing coverage is source-side only: `tests/architecture/public-truth-gate.test.mjs` asserts
   `isNonProductionSiteUrl("https://tonydemo.com/") === true`, i.e. legacy URLs must never be _cited_
   as production — it does not constrain what the DNS actually serves.

   **Recommendation (owner decision, external):** add host-scoped `301` rules for `tonydemo.com` and
   `www.tonydemo.com` → `https://blueskyzlabs.com/` in the Cloudflare zone (single host, not
   zone-wide), then re-run this exact probe and append the new status codes here. Until that lands,
   treat "legacy domain retired" as **claimed but unverified**.

## What this evidence does not claim

It does not certify human acceptance, accessibility or performance — those remain the E4/RED and
owner-gated lanes. It records only what an unauthenticated request observed, at one point in time.
