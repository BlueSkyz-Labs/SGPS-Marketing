# Experience Convergence v5 — agent execution pack

**Master plan:** `../2026-09-27-experience-design-convergence-v5.md` (Owner-approved 2026-09-27).  
**Audit baseline:** `docs/evidence/2026-09-27-experience-design-audit-baseline.md`.  
**Done before this pack:** Wave 0 (VietQR removed, OS dark mode, hero bleed, footer switcher, identity stage, hermetic guard test) and the premium Atlas plate, merged via PR #302.

This pack splits the remaining work into task cards an agent can pick up without re-deriving context. Each card is `WORK_READY` only when its **Depends on** items are merged on `main`.

## Agent protocol (every card)

1. Refresh `main`, open PRs/issues, `docs/current-work.json`. If a card's files changed materially since this pack, re-read before editing; do not overwrite newer truth.
2. Bootstrap: Node **24.20.0**, pnpm **11.25.0**, `pnpm install --frozen-lockfile`. If Playwright's pinned browsers are unavailable, launch Chromium via `launchOptions.executablePath` in a local, uncommitted config; never commit that config.
3. One card (or a tightly coupled pair) per PR. Branch → local source gate (the pre-commit hook runs it) → PR → exact-head `Quality Gates` + `Browser Assurance` → squash merge. No direct push to `main`.
4. Every guard ships a **negative proof** (mutation or pre-fix build is RED).
5. Never weaken an existing test, budget or truth gate to get green. If a card conflicts with an existing contract, change the contract deliberately in the same PR with the reason in the test comment.
6. Do not invent product facts, screenshots, translations of claims that do not exist, testimonials or metrics.
7. Update `docs/current-work.json` `nextActionable` and add an evidence note under `docs/evidence/` when a wave closes.
8. Report: exact head SHA, commands run with results, screenshots for visual changes (before/after), residual `NOT VERIFIED` items.

## Wave map

| Wave                             | File               | Depends on              | Owner gate                                                       |
| -------------------------------- | ------------------ | ----------------------- | ---------------------------------------------------------------- |
| W1 Gates that see what users see | `W1-gates.md`      | —                       | none                                                             |
| W2 Design foundation             | `W2-foundation.md` | W1.1 (visual baselines) | D-1/D-2 approved 2026-09-27                                      |
| W3 Product presentation & locale | `W3-product.md`    | W2.1                    | native review is a feedback checkpoint, zh promotion per DEC-019 |
| W4 Homepage narrative & craft    | `W4-homepage.md`   | W2.1                    | none                                                             |
| W5 Share & discovery             | `W5-share.md`      | W3.1                    | none                                                             |
| W6 External & human gates        | `W6-external.md`   | —                       | Owner/provider                                                   |

W3 and W4 can run in parallel after W2.1. W6 never blocks source waves.

## Global acceptance (every PR)

```bash
pnpm test:architecture && pnpm typecheck && pnpm lint && pnpm format:check \
  && pnpm build && pnpm check:client-budget && pnpm check:static-links
pnpm test:e2e   # or the affected specs locally; CI runs the full 4-engine matrix
```

Budgets that must hold: client JS < 120 000 B Brotli (currently ≈ 10.3 KB); 0 sub-44 px targets; no horizontal overflow 320–1440 px and at 200 % text; axe 0 serious/critical; OS dark and light both legible.
