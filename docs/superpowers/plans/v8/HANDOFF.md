# v8 handoff: website elevation (SGPS-Marketing)

**Status date:** 2026-10-02
**Baseline:** `main@e6e8ca4 (W10 #430 auto-merging; re-bind R1 to the SHA after it lands)`
**Plan:** `docs/superpowers/plans/2026-10-01-website-elevation-v8.md`
**Copy deck:** `docs/superpowers/plans/v8/copy-deck.md`
**Routing:** `.claude/AGENT_ROUTING.md`

## 1. Done (merged)

| Wave                    | PR                               | Notes                                                 |
| ----------------------- | -------------------------------- | ----------------------------------------------------- |
| W0 plan, W0 discovery   | #414, #415                       |                                                       |
| W1 copy foundation      | #420                             |                                                       |
| W2 home                 | #424                             | one focal object; height 3110 → 2362 px               |
| W3 product pages        | #423                             | Availability line; "What it does" list                |
| Hotfix W3               | #426                             | Sổ Trọ LCP + Firefox 44 px                            |
| W4 products index       | #422                             |                                                       |
| W5a, W5b trust cluster  | #418, #419                       |                                                       |
| W6 design system        | #427                             | tokens, buttons, back-to-top outside `<main>`         |
| W7 localization         | #425                             | 你, `formatDate`, VI glossary                         |
| W8 global SEO           | #421                             |                                                       |
| W9 performance          | #429                             | Inter wght-only 88 → 41 KB; local LCP about 1.9–2.0 s |
| W10 gardening           | #430 (auto-merge on, CI running) | 8 components deleted; 1.5 KB gzip CSS saved           |
| W11 phase 1 fixes F2/F6 | #428                             |                                                       |

## 2. Remaining work (executable; hand to a coding agent)

| ID  | Work                                                                                                                                                                                                                                                                                                                                                                  | Owner of decision                   | Files                 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | --------------------- |
| R1  | **W11 phase 2 (independent verification, blocks go-live).** Bind to the merged SHA. Run the full 4-engine e2e and axe on all routes × 2 themes. Run Lighthouse mobile ×3 on the 4 routes. Check page heights, print, keyboard walk, and the VI glossary sweep. Write `docs/evidence/2026-10-xx-experience-v8-verification.md` with strict PASS / FAIL / NOT VERIFIED. | verifier lane (reviewer, opus)      | evidence doc only     |
| R2  | Phase 1 low-level VI calques: `src/pages/vi/contact.astro:46,64`, `src/components/experience/Atlas.astro:52,76`, `src/pages/vi/support.astro:41`. Rewrite per glossary §5.3; list before → after.                                                                                                                                                                     | orchestrator VI review before merge | those files           |
| R3  | Showcase phone rail `tabindex="0"` is static (W6 item 9). It is focusable at ≥64rem where it does not scroll. Fix it without a new script file, or accept and record.                                                                                                                                                                                                 | implementer                         | `ShowcaseGroup.astro` |
| R4  | Native zh / zh-hant review of v8 strings: deck suggestions, palette keywords, "Back to top", "sample data".                                                                                                                                                                                                                                                           | Owner or native reviewer            | —                     |

## 3. Owner gates (not executable by agents)

| Gate           | Decision needed                                                                                                                    | Default if no answer                                           |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| OG-1 / F5      | VI H1 is a calque (Owner-locked mission line)                                                                                      | keep as is                                                     |
| OG-3           | Sổ Tâm art carries "AI Journal for Clarity"                                                                                        | art stays hidden                                               |
| F3             | Product page "Current stage" (`ProductLadder`) repeats the status; deck sro-6/stm-5                                                | keep; it is guarded by `product-lifecycle-ladder.test.mjs`     |
| F4 / abt-2..7  | About page VI pillars ("Một mái nhà"…) are calques; abt-4 needs the Owner                                                          | rewrite in R2 follow-up after Owner reads deck rows            |
| OG-12 / F7     | Legacy `/products/sotro` → `/en/products/` instead of the product page                                                             | needs a `public/_redirects` PR with the `owner-approved` label |
| Go-live        | Lift Cloudflare Access; fix the 2 subdomains returning 502 (blocks HSTS preload); label legacy PRs #405/#367/#368/#371; merge #406 | —                                                              |
| sgps-core #245 | Turnstile decision (DEC-027)                                                                                                       | —                                                              |

## 4. Rules that bit this run (keep)

1. **Keep LCP headroom.** Lighthouse CI runs about 300–400 ms slower than local. Do not auto-merge a PR whose local median LCP on any `lighthouserc.mobile.json` route is above 2200 ms.
2. **Lazy loading does not keep images out of the LCP window.** Images inside Chromium's lazy distance still enter the simulated LCP graph. Prefer `srcset` derivatives and `content-visibility`.
3. **Anything inside `<main>` counts toward page word and action caps.** Shell UI belongs outside `<main>`, in its own landmark.
4. **Never remove a rendered truth disclosure** (stage, availability) without an Owner decision, even if a finding suggests it.
5. **Use the right model per job.** Haiku for verbatim edits only, with a turn cap: it stopped at 30 turns without reporting. Sonnet per wave. Opus for review, VI copy and verification.
6. **Serialize merges.** A branch update cancels the in-flight shards, and the result is a "Browser Assurance failed: cancelled" status. That is not a real failure.

## 5. Environment and test execution

- **Local:**
  - Node 22 (repo wants ≥24; CI uses 24.20) with pnpm.
  - Build: `pnpm install --frozen-lockfile --prefer-offline && pnpm build`.
  - Pre-commit hook = local source gate (architecture, typecheck, lint, format, build, budgets).
- **e2e:**
  - Command: `PLAYWRIGHT_BROWSERS_PATH=<scratch>/pwb PLAYWRIGHT_BASE_URL=http://127.0.0.1:<port> pnpm exec playwright test --project=chromium --project=mobile-chromium`, against `pnpm exec astro preview --port <port>`.
  - Firefox and WebKit run in CI only.
  - Never run `playwright install`.
- **Lighthouse:** `CHROME_PATH=/opt/pw-browsers/chromium pnpm exec lhci collect --config=./lighthouserc.mobile.json` on port 3000. Run `fuser -k 3000/tcp` before and after.
- **Housekeeping:**
  - Delete `dist/` and `.wrangler` before committing.
  - Use one worktree per lane, each with its own ports.
  - Never use `pkill -f`.
