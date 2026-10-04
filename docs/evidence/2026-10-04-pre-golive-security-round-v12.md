# Pre-go-live security round v12 — attack-chain hunt (SGPS Security & Paid Go-Live Assurance v1.4)

- **Bound to:** `main@9dbf91d4` + the live edge window 2026-10-04 ~12:50–13:45 (UTC+7), pre-Access-lift.
- **Mode:** EXECUTE_REMEDIATE. **Method:** coordinator attack-chain hunts (R7–R10), one read-only
  supply-chain child audit, then **independent re-verification of every child claim** (maker ≠ judge).
- **Applicability first:** this repository produces a static marketing site deployed as a
  **Workers static-assets bundle** — there is **no `main` script, no request-handling code, no
  auth, no API, no database, no payments** at this layer. Server-side classes (RCE/SSRF/SQLi/
  tenant/IDOR/webhook/money-integrity) are structurally absent, not merely untested. The material
  attack surface is therefore: the Cloudflare edge boundary, the repository/CI supply chain, and
  the agentic automation layer.

## Findings and dispositions

| ID         | Class                                      | Finding                                                                                                                                                                                                                                                                                                                                                                                       | Disposition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **v12-F1** | **P1, CONFIRMED → FIXED**                  | `tests/architecture/` (189 deterministic guards), `tests/visual/` baselines and `docs/security/` sat **outside** `PROTECTED_PATHS` while the merge policy is the _only_ mechanical enforcement of "never weaken tests": a weakened guard or replaced baseline merges green with no visible failure (S17-class; public repo + auto-merge + agent sessions as the realistic actors).            | **PR #484** — the three prefixes added to `PROTECTED_PATHS`; `tests/e2e/` intentionally stays automatic (high-churn dev loop, loud failures); 2 new policy tests + a blocked-weakening negative proof, suite 9/9.                                                                                                                                                                                                                                                                                                                                       |
| **v12-F2** | **MEDIUM, CONFIRMED → FIXED (time-gated)** | The governed audit exception (`GHSA-ch52-4w7c-c8xp`) **suppressed a still-live advisory** (`http-cache-semantics@4.2.0 <= 4.2.0` vulnerable) — and its own `removeWhen` condition ("a patched version is available; then override or bump and delete this entry") **became satisfiable today**: 4.3.0 published 2026-10-04T02:56Z.                                                            | **Closure prepared** — override `http-cache-semantics: 4.3.0`, `auditConfig.ignoreGhsas` removed, registry entry deleted; guard suite 4/4 (empty ↔ empty). The repository's own 24h `minimumReleaseAge` gate holds the install (`ERR_PNPM_NO_MATURE_MATCHING_VERSION`; cutoff passes the publish time) and `verifyDepsBeforeRun` holds the commit until the lockfile syncs — **two repo gates correctly refusing an immature version**. A scheduled job (2026-10-05 10:45 +07) syncs, commits, opens the closure PR and arms auto-merge after maturity. |
| **v12-F3** | LOW / INFO                                 | `/cdn-cgi/*` family reachable on the gated apex: `trace` (caller's own request metadata), `speculation` (`{}`), `access/logout` (Access error page), `challenge-platform` (platform stub). **Zero site-data leakage**; `/cdn-cgi/image/*` correctly gated (SSRF-class closed).                                                                                                                | Accepted; optional hardening = an Access policy for `/cdn-cgi/*`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **v12-F4** | INFO (hardening)                           | No artifact-identity manifest between build and deploy (repo → provider). Mitigations that already hold: Cloudflare Workers Builds (Git Connect) builds from the commit; the local path `scripts/deploy-workers.mjs` fail-closes without an https `PUBLIC_SITE_URL` and runs `validate:public-truth → build → budget → links → deploy` in one command; CF versions provide rollback identity. | Optional hardening: emit a `sha256` dist manifest in the smoke/rollback runbook. Child claim corrected — see below.                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **v12-F5** | INFO (process)                             | The exception **lifecycle worked as designed**: recorded with a machine-checkable `removeWhen`, and the removal condition fired within ~1 day of a patch appearing.                                                                                                                                                                                                                           | Keep the lifecycle; the closure PR is the worked example.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

## Attack-chain coverage (what was actually tested)

### R7 — Access-bypass / normalization firewall (the highest-value hunt while Access is still on)

- **Normalization, 13 variants** (`%2e%2e`, mixed dots, backslash/Windows, `..;/` path-param,
  `//`, `///`, `/./`, encoded slash, null byte, overlong UTF-8, unicode dot, `EN` case,
  trailing-dot host): **every variant 302 (Access) or 400** — no decode-mismatch bypass.
- **Methods:** OPTIONS 400 · HEAD/POST/PATCH **302 (gated — not just GET)** · TRACE 405.
- **Header trust:** `X-Forwarded-For` / `X-Real-IP` / `Forwarded` spoofs → 302 (not trusted);
  `CF-Connecting-IP` spoof → 403 (rejected).
- **Host confusion:** `BLUESKYZLABS.COM`, `www` + trailing dot → 301/302 (the RT-01 rule covers
  the variants).

### R8 — Subdomain / takeover surface

Corrected evidence (the host's `dig` silently returns nothing — re-verified with a resolver):
only **www, sotro, sotam** resolve (all to Cloudflare anycast); 30 other common names NXDOMAIN;
**no dangling CNAMEs**; no wildcard record (curl-proven NXDOMAIN on a random name).

### R9 — Public-repo history

**2,071 commits** across all branches scanned for credential patterns (AWS/GitHub/OpenAI/
Anthropic/Slack/Google/CF-token/JWT/private keys): **0 matches**; `.env*`/`.dev.vars*` never
existed in history.

### R10 — Pre-lift public surface + runtime conformance

- `.well-known/product-trust.json` + `sgps.json`: public registry data only — no internal paths,
  no emails, no secrets.
- `src/` constant sweep: only design "tokens" and URL-password _guards_; no real keys.
- **CSP ↔ reality:** 926 script tags across all pages, **0 executable inline scripts** →
  `script-src 'self' 'inline-speculation-rules'` is exact; `style-src 'unsafe-inline'` is the
  standard tradeoff for the 2 inline styles.
- **Headers:** wrangler-dev on the production-origin build — all 8 declared headers match the
  served set exactly (CSP incl. Trusted Types + `'inline-speculation-rules'`, COOP, CORP, XFO,
  Referrer-Policy, Permissions-Policy incl. `payment=()`, HSTS, nosniff).
- **Deploy path:** `deploy-workers.mjs` fail-closes on a missing/non-https `PUBLIC_SITE_URL`
  (the exact defect class a stale local build would create), runs 5 gates sequentially,
  `shell:false`. `wrangler.toml` keeps `workers_dev=false` + `preview_urls=false`.
- **Cross-product isolation:** sotro/sotam serve their own distinct workers (different bodies);
  no wildcard DNS; unknown subdomains NXDOMAIN; the repo cannot mutate zone configuration
  (0 cloudflare/wrangler-deploy occurrences in workflows).

### Supply-chain child audit — independent re-verification (maker ≠ judge)

The child's verdict "no material findings" is accepted for chains 1/2/2c/3/6 (lockfile hygiene,
SHA-pinned actions, `contents:read`, no cache/artifact steps, no injection context in `run:`
blocks, gitignore + script-exfiltration surfaces clean) — with **three corrections**:

1. **Chain 2b (install scripts) — REFUTED as already-solved.** The child missed
   `pnpm-workspace.yaml`: `strictDepBuilds: true` + an explicit `allowBuilds` allowlist
   (`esbuild`, `workerd` only) already make "no other lifecycle scripts run" an asserted
   invariant — its suggested fix was already in place.
2. **Chain 5 (audit exception) — re-classified.** The child read `pnpm audit` = 0 advisories as
   "the exception is moot"; the 0 is produced by `auditConfig.ignoreGhsas` (the documented
   suppression mechanism). Independent check: `http-cache-semantics@4.2.0` is still in the tree
   and still inside the vulnerable range — the exception was live, and is now **closed for real**
   by the patch (v12-F2), not by suppression.
3. **Chain 4 (artifact identity) — partially misread.** The child described a Cloudflare **Pages**
   deployment (`pages_build_output_dir`); this repository deploys a **Workers static-assets**
   bundle, and the local deploy path already runs the build itself. The residual hardening idea
   (dist manifest) is recorded as v12-F4/INFO.

## Verdict

**SECURITY / PRE-GO-LIVE = PASS — 0 open material findings.** Two confirmed findings were fixed
in-round (#484 guard-tier protection; the exception closure), three informational notes are
recorded, and every child claim was independently re-verified with three corrections documented
above. The single remaining go-live action is the Owner's Access lift (then §3E-full).
