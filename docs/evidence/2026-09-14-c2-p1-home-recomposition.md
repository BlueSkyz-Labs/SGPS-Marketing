# C2 P1 — six-act homepage recomposition

Date: 2026-09-14
Wave: C2 P1 (plan Tasks 3–4, PR-B)
Status: MERGED

## Outcome

PR #160 (`feat(c2): six-act product house homepage (P1) + red-team closeout`) merged the approved C2 homepage composition into `main`.

The EN/VI homepage source order is now:

1. Hero
2. Flagship Theatre
3. Product House
4. One House
5. Trust
6. About
7. Next Step

The former power-user surfaces `ExperienceSpine`, `IntentLens`, and `Atlas` no longer lead the homepage. Their capabilities were re-homed rather than deleted. Product surfaces remain fail-closed: with an empty public registry, the homepage does not invent a flagship or product card.

## Exact-head assurance

- PR: #160
- Tested PR head: `d2b3927ecf50d0518d357a16eda17c58bda25716`
- Source Assurance run: `34768507706`
- Result: SUCCESS
- Merge commit: `613bcde417771e6a34fe557db3f1eecaf865b441`

The PR evidence recorded architecture contracts, EN/VI desktop/mobile browser coverage, empty-registry honesty, no horizontal overflow, and a client-JS reduction on the homepage. Exact-head Source Assurance is the promotion authority for the merged candidate.

## Regression guards

- `tests/architecture/c2-home-composition.test.mjs`
- `tests/e2e/c2-home.spec.ts`
- retargeted spine/intent/atlas/mission-path contracts retained their coverage after the homepage composition changed.

## Residual

P1 does not resolve the owner-gated product screenshot/publication floor. A real product is still required before the full flagship outcome can be claimed.