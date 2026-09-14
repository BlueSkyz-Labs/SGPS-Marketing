# C2 P1 — six-act homepage recomposition

Date: 2026-09-14
Wave: C2 P1 (plan Tasks 3–4, PR-B)
Status: MERGED

## Outcome

PR #160 merged the approved C2 six-act homepage composition into `main`.

The EN/VI homepage source order is now:

1. Hero
2. Flagship Theatre
3. Product House
4. One House
5. Trust
6. About
7. Next Step

`ExperienceSpine`, `IntentLens`, and `Atlas` no longer lead the homepage.

Their capabilities were re-homed rather than deleted.

With an empty public registry, the homepage invents no flagship or product card.

## Exact-head assurance

- PR: #160
- Tested head: `d2b3927ecf50d0518d357a16eda17c58bda25716`
- Source Assurance run: `34768507706`
- Result: SUCCESS
- Merge commit: `613bcde417771e6a34fe557db3f1eecaf865b441`

The PR recorded architecture, EN/VI browser, empty-registry and overflow evidence.

Exact-head Source Assurance is the promotion evidence for the merged candidate.

## Regression guards

- `tests/architecture/c2-home-composition.test.mjs`
- `tests/e2e/c2-home.spec.ts`
- retargeted spine, intent, atlas, and mission-path contracts

## Residual

P1 does not resolve the owner-gated product screenshot/publication floor.

A real product is still required before the full flagship outcome can be claimed.
