# Transitive `ip-address` advisory remediation

**Date:** 2026-10-23. **Scope:** lockfile-only dependency resolution.
**Baseline:** `main@76cbc5095029720402f758605b448e10ac5fe577`.

## Finding

PR #664 Quality Gates run `39945131440` failed at its mandatory
`pnpm audit --audit-level=moderate` step on `ip-address@10.7.2`, advisory
GHSA-rxp7-6hxx-x8q5. The advisory affects `ip-address` through `10.7.3`; the
patched range begins at `10.7.4`. The dependency came through
`@lhci/cli@0.15.1` → Lighthouse/Puppeteer proxy dependencies →
`socks@2.8.10` → `ip-address`. `socks@2.8.10` declares the compatible range
`^10.1.1`.

## Change

Ran `pnpm update ip-address --lockfile-only`. With the current registry version
`10.7.4` and parent range `^10.1.1`, pnpm resolved the smallest patched
satisfying release, `10.7.4`. The only changed file is `pnpm-lock.yaml`; the
change updates the package resolution, snapshot key and `socks` reference.
`package.json` is unchanged from `main`. No audit exemption, override, policy,
workflow or dependency declaration was added.

## Verification

- Node `v24.20.0`, pnpm `11.25.0`; `pnpm install --frozen-lockfile` — PASS,
  lockfile supply-chain policy passed for 807 entries.
- `pnpm audit --audit-level=moderate` — PASS, “No known vulnerabilities
  found”.
- `pnpm why ip-address` — resolves only `10.7.4` through the same Lighthouse
  proxy dependency paths.
- Exact-head CI failure was observed on PR #664 before this lockfile update;
  the CI job API identified the audit step. GitHub's job log endpoint returned
  HTTP 403 in this environment.

This establishes the lockfile-level advisory fix and local audit result. It does
not establish green CI for this remediation commit; that requires an independent
exact-head run after PR integration.
