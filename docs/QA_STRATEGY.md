# QA Strategy — BlueSkyz Labs Web (C1.1)

> **Project:** BlueSkyz Labs Web — Astro 7 static, Tailwind CSS 4, TypeScript 6
> **Product/design source of truth:** [`docs/superpowers/specs/2026-09-03-blueskyz-web-v1-c1-1-design.md`](./superpowers/specs/2026-09-03-blueskyz-web-v1-c1-1-design.md)
> **Status:** Living engineering-assurance document for the Astro + Workers Static Assets contract.

---

## 1. Mission

Protect product truth and trust with deterministic, reviewable promotion evidence. A change is not safe because it "looks fine": the exact candidate SHA must satisfy the applicable gates.

Core principles:

- **PR-first promotion.** Develop on a feature branch; promote through a pull request.
- **Exact-head evidence.** A green run belongs to the commit SHA it tested.
- **Do not weaken gates to land a change.** Fix the root cause or escalate a product/risk decision.
- **Static-export truth.** Browser and Lighthouse tests exercise the same `dist/` artifact Workers Static Assets serve.
- **Dual-control remote assurance.** GitHub Actions provides secretless source assurance; Cloudflare Workers Builds remains preview/production build and deploy authority.
- **No deployment authority in GitHub Actions.** Source-assurance workflows must not receive Cloudflare credentials or invoke deployment commands.

---

## 2. Local canonical source gate

`.githooks/pre-commit` runs:

```text
pnpm test:architecture
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm check:client-budget
pnpm check:static-links
```

Full Playwright matrix and Lighthouse are promotion/preview evidence, not every-commit hooks. Install browsers once with `pnpm test:e2e:install` before `pnpm test:e2e`.

### GitHub source assurance

`.github/workflows/quality-gates.yml` emits two exact-SHA checks:

- **Quality Gates** — frozen install, dependency vulnerability audit, architecture, typecheck, lint, format, static build, client-JS budget and static-link validation.
- **Browser Assurance** — the repository E4 Playwright/axe matrix across Chromium, Firefox, WebKit/Safari-class and mobile Chromium, followed by Lighthouse CI after `Quality Gates` succeeds.

The workflow is intentionally secretless and read-only (`contents: read`), checks out the exact PR head or `main` push SHA with `persist-credentials: false`, and pins external actions to full commit SHAs. It is a source-control assurance layer, not a deployment pipeline.

Active ruleset `main-promotion-governance` (`22500299`) protects `main`: a pull request is required; strict `Quality Gates` and `Browser Assurance` must pass; review conversations must be resolved; non-fast-forward updates and deletion are blocked; and no bypass actors are configured. Issue #8 is resolved/closed. Direct-to-`main` is not a fallback.

---

## 3. Client JS budget (G5 replacement)

`pnpm check:client-budget` reads `dist/index.html`, Brotli-compresses referenced local `.js` files, and fails at `>= 120000` bytes. Next.js First Load JS log parsing is retired.

---

## 4. Browser / a11y / perf

- Playwright: Chromium, Firefox, WebKit, mobile Chromium (`pnpm test:e2e`)
- Browser bootstrap: `pnpm test:e2e:install`
- Protected PR/main assurance: installs Chromium + Firefox + WebKit with OS dependencies, then runs `pnpm test:e2e`
- axe tags: WCAG 2.0 / 2.1 / 2.2 A+AA (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22a`, `wcag22aa`)
- Static internal links/assets: `pnpm check:static-links` (after `pnpm build`)
- Optional remote target: `PLAYWRIGHT_BASE_URL`
- Local server: `pnpm start` (Astro preview on `127.0.0.1:3000`)
- Lighthouse CI: three desktop runs against Astro preview; categories ≥0.90; CLS ≤0.05

Automated/browser assurance is necessary but does **not** substitute for the real-user customer-task and brand-interpretation evidence required by the authoritative C1.1 E4 contract. An agent walkthrough is preflight evidence, not human acceptance.

---

## 5. Cloudflare promotion flow

```text
feature branch
  → local source gate
  → PR
  → GitHub Source Assurance (Quality Gates → Browser Assurance)
  → Cloudflare Workers preview (Workers Builds)
  → E4 / preview review
  → merge main
  → production truth gate + build (`validate:public-truth` + build + client budget + static links)
  → post-deploy smoke
```

### Workers Builds (dashboard)

Production:

```text
repo: BlueSkyz-Labs/SGPS-Marketing
branch: main
command: pnpm install --frozen-lockfile && pnpm validate:public-truth && pnpm build && pnpm check:client-budget && pnpm check:static-links
preview branches: enabled
```

Preview builds may omit `validate:public-truth` when production-only email variables are intentionally absent, but must still build and pass static gates (`check:client-budget`, `check:static-links`).

Do not duplicate Cloudflare deployment or environment-bound production truth in `.github/workflows`; GitHub Actions is limited to source assurance.

Legacy Cloudflare Pages project `blueskyz-labs-portfolio` is superseded by Workers Static Assets. On 2026-09-04 Git deployments were disabled via Cloudflare API (`deployments_enabled=false`, preview=`none`), and `destination_dir` was corrected from `.next` → `dist` so an accidental re-enable cannot revive the Next output contract. Canonical host remains Workers (`blueskyz-web`).

---

## 6. Public truth

`pnpm validate:public-truth` requires:

- `PUBLIC_SITE_URL=https://blueskyzlabs.com` — exact canonical organizational origin per ADR 0006; retired `tonydemo.com`, localhost, preview/staging hosts, alternate origins, paths, query strings and non-default ports are rejected
- `PUBLIC_CONTACT_EMAIL` (owner-supplied plausible `local@domain.tld`)
- `PUBLIC_SECURITY_EMAIL` (owner-supplied plausible `local@domain.tld`)

Canonical site identity is decided. Production promotion remains blocked on the two verified owner-supplied email facts; do not invent email fallbacks.
