# Wave H2b — deployment contract, assurance language, verifiable Trust copy

Date: 2026-09-12
Branch: `feat/wave-h2b` (base `83f5039`, squash of wave H2 / #139)
Status: **VERIFYING** — local gates green; awaiting exact-head Source Assurance.

## Scope

Follow-on to wave H2, closing the remaining plan items that did not need owner
authority: the deployment contract (T5) and the public assurance-language
scanner (T8 remainder), plus the copy defect the scanner immediately found.

| Item          | Artifact                                                            | Status                                 |
| ------------- | ------------------------------------------------------------------- | -------------------------------------- |
| T5            | `tests/architecture/deploy-contract.test.mjs`                       | REMEDIATED                             |
| T8 remainder  | `tests/architecture/public-assurance-language.test.mjs`             | REMEDIATED                             |
| Copy defect   | Trust pillar copy in 6 files (EN + VI)                              | REMEDIATED                             |
| T11 follow-up | navigator must not treat machine-readable artifacts as destinations | MERGED in #139 (`33b719a` → `83f5039`) |

## Findings

1. **Deployment ordering was convention, not contract.** `scripts/deploy-workers.mjs`
   ran `validate:public-truth` before `build` and aborted on any non-zero status,
   but nothing enforced it. The contract now pins the order (public-truth →
   build → publish), bans swallowed failures (`|| true`), bans `shell: true`,
   requires an https `PUBLIC_SITE_URL`, bans literal secrets, and asserts GitHub
   Actions stays source-assurance only (no `wrangler deploy`, no persisted
   credentials, full-history checkout for provenance).
2. **Assurance vocabulary could drift back into copy.** The state-semantics model
   bans over-readings in code (`available ⇏ reviewed`, `source-linked ⇏ certified`)
   but nothing scanned the words that reach a visitor. The scanner derives its
   terms from `NEVER_IMPLIED_BY_ANY_STATE` (plus Vietnamese equivalents) and has a
   non-vacuity proof.
3. **Real over-claim removed.** The scanner failed on the Trust pillar:
   `"Reliable, secure, consistent."` / `"Đáng tin cậy, an toàn, nhất quán."` — an
   assurance claim no public surface can support. Replaced with
   `"Open claims. Verifiable evidence."` /
   `"Tuyên bố mở. Bằng chứng kiểm chứng được."` in `src/data/site.ts`,
   `src/data/experience.ts`, `src/content/pages/{en,vi}/{index,about}.yaml`.
4. **Navigator regression fixed in #139** (kept for the record): adding the
   manifest as product evidence made the command navigator offer a JSON endpoint
   as a navigation result — CI caught it, so machine-readable artifacts are now
   evidence but never command destinations.

## Evidence (local, exact this branch)

- `pnpm test:architecture` → **271 pass / 0 fail**
- `pnpm typecheck` → 0 errors; `pnpm lint` / `pnpm format:check` clean
- e2e chromium (touched surfaces) → 18/18 (`s-plus-command`, `provenance-search`, `integrity-lens`)
- Copy change is EN/VI symmetric; bilingual parity tests unaffected

## Residual risk

- The scanner is a text guard: it cannot judge intent, so an honest use of a
  banned word (e.g. quoting a criticism) needs an explicit exemption with a
  rationale — currently the exemption list holds only the model file and this test.
- The deploy contract reads source, not a live deploy: Cloudflare Workers Builds
  remains the deployment authority, and its own logs are the runtime evidence.
- Vietnamese terms cover the strongest claims only; softer Vietnamese assurance
  phrasings are not yet enumerated.
