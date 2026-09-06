# 0005 — Dual-control source assurance

- **Status:** Accepted
- **Date:** 2026-09-07
- **Deciders:** Autonomous global-elite hardening pass under owner-delegated remediation authority
- **Refines:** ADR 0002 Cloudflare-first CI economics

## Context

ADR 0002 correctly centralized preview and production build/deploy authority in Cloudflare Workers Builds, but its blanket avoidance of required GitHub Actions left GitHub with no deterministic status check suitable for a future `main` ruleset. The repository currently reads `rulesets=[]`, and direct pushes have previously bypassed the PR lifecycle.

A source-control gate and a deployment gate address different risks. Conflating them creates a governance gap: Cloudflare can validate/deploy an artifact while GitHub still lacks an immutable, exact-candidate signal to enforce before merge.

## Decision

1. **GitHub Actions owns source assurance only.** `.github/workflows/quality-gates.yml` runs secretless, read-only checks on pull requests and `main`; it never deploys and never receives Cloudflare credentials.
2. **Cloudflare Workers Builds remains authoritative for preview/production build and deployment.** Production truth validation and environment-bound promotion stay in Cloudflare.
3. GitHub source-assurance jobs are named **`Quality Gates`** and **`Browser Assurance`** so a future `main` ruleset can require them.
4. Workflow `GITHUB_TOKEN` permission is limited to `contents: read`; checkout does not persist credentials.
5. External GitHub Actions are pinned to full 40-character commit SHAs.
6. Pull-request verification checks out the exact PR head SHA; `main` push verification checks out the exact push SHA. A synthetic merge ref is not accepted as evidence for the candidate commit.
7. Normal changes use branch → PR → source assurance → merge. Direct-to-`main` is emergency-only until Issue #8 is enforced by an active ruleset and verified by read-back.

## Consequences

- GitHub now produces enforceable source-quality evidence without becoming a deployment control plane.
- Cloudflare credentials and production deployment authority remain outside GitHub Actions.
- The two independent surfaces provide defense in depth rather than duplicate deployment pipelines.
- Issue #8 remains open while repository rulesets are empty; documentation is not treated as enforcement.
- The workflow adds bounded GitHub Actions compute for deterministic assurance, superseding only ADR 0002's blanket avoidance of GitHub Actions workload, not its Cloudflare-first deployment decision.
