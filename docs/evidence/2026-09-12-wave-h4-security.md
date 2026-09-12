# Wave H4 — machine-readable security surface

Date: 2026-09-12
Branch: `feat/wave-h4` (base `caf0719`, squash of wave H2b / #140)
Status: **VERIFYING** — local gates green; awaiting exact-head Source Assurance.

## Scope

Security-domain hardening for a production static site: publish the
machine-readable vulnerability-reporting policy, and pin the edge header set as
a contract instead of an assumption. No owner facts invented: the reporting
channel is the advisory URL the site already declares in its integrity data.

| Item | Artifact | Status |
| --- | --- | --- |
| Security policy | `public/.well-known/security.txt` (RFC 9116) | REMEDIATED |
| Header contract | `tests/architecture/security-surface.test.mjs` | GUARDED |
| Runtime read-back | `scripts/smoke-production.mjs` (+1 check) | REMEDIATED |

## What changed

1. **`/.well-known/security.txt`** with `Contact` = the GitHub security-advisory
   channel already published in `src/data/integrity.ts`
   (`security-private-reporting`), `Preferred-Languages: en, vi`,
   `Canonical`, and an explicit `Expires`. The contract test fails if the expiry
   is under 90 days away, so the file cannot silently go stale.
2. **Edge header contract.** The guard asserts the protective header set from
   `public/_headers` (nosniff, DENY framing, HSTS, Referrer-Policy,
   Permissions-Policy, CSP), that CSP keeps `script-src 'self'` with **no**
   `unsafe-inline`/`unsafe-eval`, `base-uri 'self'`, `object-src 'none'`,
   `frame-ancestors 'none'`, that preview hosts stay `noindex`, and that the
   built output ships both `security.txt` and `_headers`.
3. **Production runtime read-back (this wave).** Live `https://blueskyzlabs.com/en/`
   already serves the full header set (HSTS `max-age=31536000; includeSubDomains`,
   CSP with `frame-ancestors 'none'`, Permissions-Policy, Referrer-Policy,
   nosniff, DENY) — verified by response headers, not by source. The new smoke
   check will verify `/.well-known/security.txt` at the next deployment.
4. **Supply chain re-checked.** `pnpm audit` (full and `--prod`): **no known
   vulnerabilities** at this head.

## Evidence (local, exact this branch)

- `pnpm test:architecture` → **277 pass / 0 fail** (H4 branch base; the merged
  main after #141 carries 279 + 6 security tests)
- `pnpm build` → `dist/.well-known/security.txt` and `dist/.well-known/sgps.json` present
- `pnpm check:client-budget` → site-wide 2 567 B, worst page 2 036 B (< 120 000)
- Runtime: response headers read back from the live host (see item 3)

## Residual risk

- `security.txt` always needs a human-timed renewal eventually; the guard only
  buys a 90-day warning window.
- Edge header enforcement is verified by response read-back on the live host;
  if Cloudflare changes header propagation, the contract test (source) will
  still pass while the runtime differs — the smoke read-back is the runtime
  counterweight.
- The advisory channel is GitHub; if the advisory surface moves, both the
  integrity data and `security.txt` must change together (the test enforces
  that they match).
