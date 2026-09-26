# C3-D Adaptive Fidelity and Privacy Red-Team Evidence

Observed: 2026-09-26 03:23 UTC. Canonical branch at observation: `main`.

## Task 4 — Adaptive fidelity engine

- PR #274 exact candidate: `06035b1e8cf22078bd3a11b00570bd0b327585ec`.
- Protected merge: `a0d3f7df588f84118c2eada871d1bf6e05d9ff58`.
- Exact-head Quality Gates, Browser Assurance (Playwright/axe and Lighthouse), and Cloudflare Workers Build: PASS.
- Production Workers deployment: version `da9978e4-211f-407c-a850-e26275d028e0`, active at 100% in deployment `12b5246c-4256-497b-8e9a-f7c1ee340d9f`; Cloudflare Build `a41a96dc-f2f5-4026-a5ed-58201c8e4e54` succeeded on the merged main SHA.
- Source assurance on merged main was still running its browser job at observation time; it is not represented here as complete.

## Task 5 — Privacy and abuse red team

Code candidate locally verified at `a42114c643471ac83aa102b3c9695ca5f5dbb62c` before this evidence/router-only change:

- Architecture: 607/607 pass.
- Intent Chromium E2E: 16/16 pass, including malformed query, forged intent markup, network/storage, truth invariance, mobile, reduced motion, and no-JS.
- Typecheck: 0 errors, 0 warnings, 1 existing hint in `ArchitectureLens.astro`.
- Lint and Prettier: pass.
- Static build/export: pass; 56 pages.
- Client budget: 10,714 site-wide Brotli bytes; worst page 8,064, below 120,000.
- Static links: 2,610 checked, 0 broken.
- Local Node was 24.17.0 while the repository requires 24.20.0; these local results are supplemental. Exact PR gates must run on the pinned CI runtime before promotion.
- Task 5 is proposed in PR #276; its exact-head gates were pending at this observation.

The intent boundary accepts only the declared intent enum in the analytics sanitizer. The intent UI ignores unknown DOM intent values. No storage, cookies, or network transfer were introduced. Visitor intent/fidelity remains presentation-only; canonical product/claim/evidence membership is unchanged. Analytics/RUM transmission remains disabled absent the owner privacy/provider decision.

Owner-fact gates remain open: public product activation requires owner-approved product facts and real product UI screenshots; Concierge runtime/provider and WebGL GO remain separately gated.

## Current convergence read-back — 2026-09-26 09:33 UTC

- PR #276 merged at `d894eb1ce071c0f18652614365958df7b251e54b`; exact-head Source Assurance run `36216346386` passed both Quality Gates and Browser Assurance (Playwright/axe and Lighthouse) for candidate `f2f2fd5e466697acd7e9ffc28edea8802794ab12`.
- The three Task 5 steps above are complete from that exact-head evidence; no local-only result is used as promotion proof.
- `main` is now `e3a3c6f5827e56889127eba00b8368654f845f2d`. Main Source Assurance run `36231546326` passed both required jobs. Cloudflare Workers Build `61f7cc0c-a633-45ca-aa09-b58680e07a01` succeeded and provider deployment read-back shows version `8d12ab41-9669-453b-874d-79d417f87bdf` at 100% in deployment `7af4f796-83c5-4fa6-ab75-e543f87a166b`.
- Production public smoke remains unavailable anonymously because the domain is still behind the owner-only Cloudflare Access application; this is not represented as a public E4 pass. No product truth was added by these changes.
