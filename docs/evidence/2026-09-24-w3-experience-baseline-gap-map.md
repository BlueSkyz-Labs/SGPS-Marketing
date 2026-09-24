# W3 — Experience baseline, target and gap map

**Recorded:** 2026-09-24 13:47 (Asia/Ho_Chi_Minh, SEAST)
**Program:** Marketing — SGPS FULL Audit and Experience Convergence, wave **W3**
**Local authority:** `docs/superpowers/plans/2026-09-24-marketing-full-audit-experience-convergence.md`
**Measured at:** `BlueSkyz-Labs/SGPS-Marketing@687aa92` (`origin/main`), `pnpm run build` exit 0 in a clean worktree
**Two-axis law inherited from:** `docs/evidence/2026-09-22-sgps-experience-adoption.md`

## Scope and state law

This is a **baseline and gap map**, not a convergence claim. Every number below was produced by running
the repository's own build and enumerating its output; nothing is estimated. Following the two-axis law:

- **Governance state** — whether a durable local mapping and authority boundary exists.
- **Experience state** — what this repository has actually implemented and verified.
- `ADOPTED` is never treated as `CONVERGED`; planned polish is never presented as converged.
- Missing owner or human evidence stays `PENDING_EXTERNAL` / `NOT_VERIFIED`, never PASS.

## Baseline (measured, not asserted)

| Dimension                  | Measured value                                                                                                                         | How it was produced                                        |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Built routes               | **53**                                                                                                                                 | `find dist -name "*.html"` after `pnpm run build` (exit 0) |
| Locale routes per language | **en 15 · vi 15 · zh 15**                                                                                                              | path extraction from `dist`                                |
| Locale parity              | **en == vi true, en == zh true** (sets compared, not counts)                                                                           | set equality over extracted paths                          |
| Non-locale gateway routes  | **8** — `/`, `/404`, `/about/`, `/contact/`, `/privacy/`, `/products/`, `/security/`, `/support/`                                      | same extraction, `^/(en\|vi\|zh)` filter                   |
| Page sources               | **55** files in `src/pages` (incl. `.well-known/sgps.json.ts`, `.well-known/product-trust.json.ts`, `robots.txt.ts`, `sitemap.xml.ts`) | `find src/pages -type f`                                   |
| Components                 | **52** files across **12** families: `brand dossier editorial experience icon integrity layout maison product provenance sections ui`  | `find src/components`                                      |
| Style layers               | **4** — `global.css`, `cinematic-product-house.css`, `c3-craft.css`, `c4-quiet-authority.css`                                          | `find src/styles`                                          |
| Claim fabric               | **3** claims on surfaces `security`, `privacy`, `products` · **7** evidence references · **2** boundaries                              | `src/data/claims.ts`, `src/data/integrity.ts`              |
| Published product slugs    | **0** (`/products/[slug]` builds no instance)                                                                                          | no slug emitted into `dist`                                |
| Public reachability        | every probed route, including `/.well-known/sgps.json`, answers **Cloudflare Access sign-in**                                          | `curl -L` read-back, observed 2026-09-24                   |

## Baseline → target → gap matrix (two axes)

| Surface / boundary                     | Governance state | Experience state                            | Intended target                                                | Implementation evidence                                                                          | Verification evidence                                                                                                                                      | Durable guard                                                                            | Convergence boundary                                                                                    |
| -------------------------------------- | ---------------- | ------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Localized journeys (en/vi/zh)          | MAPPED           | IMPLEMENTED, **CONVERGED for route parity** | identical route set in all three languages                     | 15/15/15 route sets equal                                                                        | set-equality over built `dist` at `687aa92`; `c3-trilingual-parity`, `bilingual-parity`, `language-switching` e2e                                          | `tests/architecture/bilingual-shared-components.test.mjs`, sitemap contract              | parity is route-level; **content-quality parity needs human review (VI cross-check is owner/external)** |
| Design system / tokens                 | MAPPED           | IMPLEMENTED                                 | Brand v4 + C4 role tokens, no new palette or decorative gold   | 4 style layers, 52 components in 12 families                                                     | `brand-token-contract`, `brand-kit-v4-fidelity`, `brand-v4-provenance`, `brand-v4-runtime`, `c4-*` architecture contracts; `c4-quiet-authority` role layer | brand contract tests                                                                     | visual **polish gaps = W4 work**, never claimed converged here                                          |
| Claim / evidence / boundary truth      | MAPPED           | IMPLEMENTED, fail-closed                    | every published claim resolves to independent provenance       | 3 claims, 7 evidence refs, 2 boundaries; self-only guard now compares surface identity (PR #247) | `c4-provenance-lens` (14 tests), `claim-fabric-contract`, `product-truth`, `public-truth-gate`                                                             | `isSelfOnlyChain` refuses self-only; dossier refuses unknown provenance (H-01 / PR #237) | **product activation and screenshots are owner facts** — registry stays honestly empty                  |
| Dossier + print source links           | MAPPED           | IMPLEMENTED (pending merge of PR #248)      | every published item links to its source                       | href now projected from provenance route evidence                                                | `c4-dossier-contract` 10/10, e2e composer+print 19/19 ×2 incl. no-JS `/zh/dossier/`                                                                        | dossier projects one provenance authority (PR #227)                                      | claim refusal vs bounded-statement display is an **owner published-claims decision**                    |
| Decision room / deterministic briefing | MAPPED           | IMPLEMENTED                                 | composable briefings from canonical truth, no model            | `compilePublicBriefing`, refusal reported as `missing`                                           | `c4-briefing-contract` 13/13; arch suite 519/519                                                                                                           | briefings fail closed on refused claims                                                  | **model phase = NO-GO pending ADR 0011 owner approval**                                                 |
| Public launch / origin                 | MAPPED           | **NOT_VERIFIED externally**                 | public anonymous access to routes and `/.well-known` manifests | site builds and exports statically                                                               | production read-back observed **Cloudflare Access login** for every route                                                                                  | `docs/current-work.json` records owner-only allow-list                                   | **public launch authorization is an owner GO gate**                                                     |
| Measurement / RUM                      | MAPPED           | PENDING_EXTERNAL (disabled)                 | truthful measurement after privacy/provider approval           | none enabled                                                                                     | `s-plus-analytics`, privacy boundary contracts                                                                                                             | transmission stays OFF by default                                                        | **RUM provider + privacy = owner decision**                                                             |
| Product truth / screenshots            | MAPPED           | PENDING_EXTERNAL                            | real product registry with authentic screenshots               | empty registry renders honest empty state                                                        | `product-truth`, `public-product-audit`, `product-empty-state`                                                                                             | product truth gate refuses invented facts                                                | **owner facts (screenshots, registry) block C4-A Task 10 and product activation**                       |
| Contact / security channels            | MAPPED           | PENDING_EXTERNAL                            | real contact and security emails                               | soft-land About/Security path, no invented addresses                                             | `public-truth-gate` rejects invented contacts                                                                                                              | `src/lib/act.ts` soft-land                                                               | **real addresses = owner fact**                                                                         |
| Human E4 / VI copy / trademark / legal | MAPPED           | PENDING_EXTERNAL                            | real-user customer-task and brand-interpretation evidence      | —                                                                                                | agent walkthroughs are **preflight only**                                                                                                                  | AGENTS.md hard rules                                                                     | **external; never substituted by automation**                                                           |

## Gap map — classified so nobody mistakes a gate for a bug

### Agent-actionable (feeds W4 / W5 / W6)

1. **W4 polish**: responsive/theme before-after evidence, a11y and print checks on existing C4 components — inside current tokens only.
2. **W5 correctness**: CTA, empty states, selection handoff, resets, navigation, canonical and sitemap audit with no-JS preserved.
3. **W6 hardening**: negative matrix, built-output leakage scan, client/perf gates, documented recovery and rollback; keep RUM/model/private runtime disabled.
4. **Convergence of open PRs** (W2) and router freshness — in flight via live queues.

### Pending external (owner) — must not be worked around

Product truth/screenshots · real contact and security addresses · legal/trademark · human E4 · VI cross-check · RUM/provider privacy · C4-G model GO (ADR 0011) · C4-F threat-model GO · WebGL GO · **public launch authorization (Cloudflare Access)**.

## Minimum implementation slices (risk-sized, no big-bang reskin)

| Slice                                                                 | Wave | Risk sizing                            |
| --------------------------------------------------------------------- | ---- | -------------------------------------- |
| Journey polish per route family with before/after evidence            | W4   | component-local, token-preserving      |
| Locale/SEO/canonical corrections behind existing contracts            | W5   | contract-guarded, no-JS preserved      |
| Negative-fixture hardening + leakage scan                             | W6   | tests only until a real gap proves RED |
| Read-back record separating completed / verified / blocked / external | W7   | documentation of observed states       |

## Reproduction

```bash
pnpm install --frozen-lockfile
pnpm run build                     # exit 0 at the recorded SHA
find dist -name "*.html" | wc -l   # 53
# parity: extract ^/(en|vi|zh) paths from dist and compare the three sets
pnpm test:architecture             # 519/519 at the recorded SHA
```

**Not claimed here:** visual convergence, human acceptance, public reachability, product activation,
model-assisted synthesis, or any owner-gated outcome.
