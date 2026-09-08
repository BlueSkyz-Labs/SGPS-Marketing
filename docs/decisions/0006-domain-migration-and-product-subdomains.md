# ADR 0006: Migrate to the BlueSkyz Labs domain and product subdomains

- **Date:** 2026-09-08
- **Status:** Accepted
- **Decision owners:** BlueSkyz Labs

## Context

The project must move its public and operational web surfaces away from temporary
or provider-owned hostnames and establish a stable BlueSkyz Labs domain model.
Product identity must remain readable in the hostname while allowing privileged
product surfaces to be addressed explicitly.

## Decision

Migrate the entire project to `blueskyzlabs.com` as the canonical domain.

Each product receives a product-scoped subdomain using its normalized product
slug:

```text
<product>.blueskyzlabs.com
```

Administrative and superuser surfaces are separate hostnames for the same
product:

```text
admin-<product>.blueskyzlabs.com
super-<product>.blueskyzlabs.com
```

For example, a product named `Atlas` uses:

```text
atlas.blueskyzlabs.com
admin-atlas.blueskyzlabs.com
super-atlas.blueskyzlabs.com
```

The product segment is a lowercase, DNS-safe kebab-case slug. Human-readable
names, spaces, accents, and arbitrary user input must not be used directly in
hostnames.

## Migration requirements

1. Treat `https://blueskyzlabs.com` as the canonical organizational origin.
2. Move every project-owned public route and product surface to the new domain
   model; provider-owned or temporary hostnames are transitional only.
3. Preserve old URLs with permanent redirects where technically possible.
4. Update canonical URLs, Open Graph URLs, JSON-LD, sitemap, robots policy,
   email links, OAuth/callback allowlists, CORS, cookies, and deployment
   configuration together.
5. Keep `admin-<product>` and `super-<product>` as distinct origins and enforce
   authorization server-side; a hostname prefix is not an authentication
   boundary.
6. Do not publish an admin or super hostname until its TLS, access policy,
   monitoring, rollback path, and ownership are verified.
7. Product claims must use the final production hostname only after the product
   has passed the project’s public-truth and evidence gates.

## Cloudflare baseline

The `blueskyzlabs.com` zone is Cloudflare-managed and uses the Workers paid
account. The zone-wide baseline for every product, admin, and super hostname is:

- Cloudflare Managed Free Ruleset enabled in the
  `http_request_firewall_managed` phase.
- Bot Fight Mode enabled with JavaScript detections enabled.
- Verified bots remain allowed; AI/content bot blocking is not enabled by
  default because the public site must remain crawlable and the current zone
  plan does not provide the paid bot-management controls.
- Cloudflare Advanced DDoS mitigation remains enabled by the platform.
- HTTPS-only redirects enabled, TLS minimum set to 1.2, TLS 1.3 enabled, and
  SSL mode set to Full while the Worker custom domains terminate TLS at
  Cloudflare.
- HSTS enabled for one year with `include_subdomains=true`, `nosniff=true`, and
  preload disabled until the domain migration has completed and all subdomains
  have been verified.
- Browser Integrity Check, HTTP/3, and Brotli remain enabled.
- Production Workers use the canonical custom domains with `workers.dev` and
  version-preview routes disabled; Workers Builds remains the deployment
  authority for production promotion.

The Worker paid plan does not automatically upgrade the zone’s website plan;
features unavailable on the current zone plan must be added only after an
explicit plan decision and compatibility review.

## Consequences

This creates a predictable, product-oriented URL contract and separates public,
administrative, and superuser surfaces. It also requires coordinated DNS/TLS,
identity, redirect, security-policy, and deployment changes across the project.

Until migration is complete, temporary `workers.dev`, preview, or staging
URLs remain non-canonical and must not be represented as production identity.
