# Pre-go-live security round v13 — agentic-surface hunt + independent CVE cross-check

- **Bound to:** `main@ecc67e79` (after #482 landed) + the 2026-10-04 ~14:40–15:10 window.
- **Doctrine:** SGPS Security & Paid Go-Live Assurance v1.4 — EXECUTE_REMEDIATE; continue to a new
  surface after each bounded path is exhausted (v12 covered edge/CI/content; this round covers the
  **agentic layer, the URL-input taint surface, and an independent advisory cross-check**).

## v13-F1 — agent-instruction surfaces were outside `PROTECTED_PATHS` (CONFIRMED, S09-class, P1) → FIXED

**Chain:** `CLAUDE.md` (551 B) + `.claude/AGENT_ROUTING.md` + `.claude/agents/{implementer,mechanic,reviewer,scout}.md`
are read by agent sessions as authority (the Claude lane's orchestrator and sub-agents). None was in
`PROTECTED_PATHS`, so a PR could rewrite them, auto-merge without the label, and the **next agent
session would read and obey the planted instructions** — indirect prompt injection into the factory
(negative-acceptance S09: repository content impersonating authority).

**Evidence:** `ls` shows the files; `check-merge-policy.mjs` `isProtected()` returned false for all of
them; the merge-policy test's own "ordinary changes" fixture never covered them. The files' current
content is benign — the finding is the **absent control**, a demonstrated violated invariant
(v1.4 §10: "a demonstrated violated security invariant may justify immediate safe remediation even
when a dangerous live exploit is not performed").

**Remediation (amends PR #484 — same `PROTECTED_PATHS` root cause, one PR per root cause):**
`CLAUDE.md`, `.claude/`, `.cursorrules`, `.cursor/`, `GEMINI.md`, `.gemini/`, `.codex/` added with a
rationale comment. **Proof:** 2 new tests — every surface held, look-alikes (`docs/claude-notes.md`,
`claude.md.bak`) still free, and a **negative proof** that a planted instruction in
`CLAUDE.md`/`.claude/agents/implementer.md` is blocked without the label. Suite 11/11.

**Residual:** the check is filename-based; a future tool with a different instruction-file name
(e.g. a new agent CLI) is not covered until added. Recorded as a revalidation trigger on any new
agent tool adoption.

## v13-F2 — URL-input taint surface (PASS, 0 injection paths)

Every URL-reading surface traced end-to-end (input → validation → sink):

| Surface                                        | Input                                                 | Flow                                                                                               | Sink                                                         | Verdict                                                                                                                                  |
| ---------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `fragment-anchor.ts`                           | `location.hash`                                       | `slice(1)`                                                                                         | `getElementById(id)`                                         | safe (id lookup, no selector parsing)                                                                                                    |
| `DeepLinkOpener.astro`                         | `location.hash`                                       | `decodeURIComponent`                                                                               | `getElementById`                                             | safe; **nit**: a malformed hash (`#%`) throws `URIError` and the enhancement dies for that self-inflicted link (LOW, optional try/catch) |
| `dossier-composer.ts` / `dossier-url-state.ts` | `location.search`                                     | bounded parser (count cap + per-token validation; unknown ids rejected)                            | `input.checked`, `dataset.selectedIds`, `textContent`        | safe                                                                                                                                     |
| `decision-room.ts`                             | `search` (`goal`, `constraint`, compare set)          | same bounded parsers                                                                               | validated selection state; URL updates via `URLSearchParams` | safe                                                                                                                                     |
| `ArchitectureSalon` / `decision-handoff`       | param                                                 | unknown value changes nothing; handoff href built from validated ids                               | static links                                                 | safe                                                                                                                                     |
| **language gateway** `index.astro`             | `localStorage` + `navigator.languages` + country hint | `resolveInitialLanguage` → whitelist (`isActiveLanguage`), mapped browser codes, `VN→vi` else `en` | **`location.replace(\`/${language}/\`)`**                    | **safe — the return type is the 4-code `Language` union, so the template can never be a protocol-relative or injected path**             |

Repository-wide sweep: **zero** `innerHTML`/`insertAdjacentHTML`/`document.write`/`eval`/`location.assign`
with URL-derived data; the only `location.replace` is the whitelist-gated gateway above.

## v13-F3 — independent advisory cross-check via OSV.dev (17 false hits, 1 real = the closing exception)

The lockfile's 686 `name@version` pairs were queried against **OSV.dev** (an independent advisory
source, not pnpm's DB). Raw result: 18 advisory hits across 6 packages. Classified against the
**lockfile** (the CI/production install truth — not the stale local `.pnpm` directory):

| Package                  | OSV hit (stale local dir) | Lockfile (truth)    | Fixed-in        | Verdict                                                   |
| ------------------------ | ------------------------- | ------------------- | --------------- | --------------------------------------------------------- |
| basic-ftp                | 5.3.1                     | **6.2.1**           | 6.2.1           | not affected                                              |
| brace-expansion          | 1.1.18 / 5.0.9            | **1.1.21 / 5.0.12** | 1.1.21 / 5.0.12 | not affected                                              |
| devalue                  | 5.9.2                     | **5.9.4**           | 5.9.3           | not affected                                              |
| fast-uri                 | 3.1.7                     | **3.1.8**           | 3.1.8           | not affected                                              |
| ip-address               | 10.7.0                    | **10.7.2**          | 10.7.1          | not affected                                              |
| **http-cache-semantics** | **4.2.0**                 | **4.2.0**           | 4.3.0           | **the one real hit — closure already scheduled (v12-F2)** |

**Interpretation:** the repository's security-pin discipline (the `overrides` block) is
**independently verified** — every override target sits at/past its fixed version. The 17
"hits" are stale directories left in the local `node_modules/.pnpm` by pre-override installs; they
do not exist in the lockfile and never ship (the artifact is static HTML/CSS/JS). The contrast
`pnpm audit → 0 (suppressed)` vs `OSV → 18 raw` is exactly the doctrine's _SCANNER GREEN != SECURE_,
resolved here by a second source and a per-package classification instead of a suppression.

**Local-hygiene note:** the stale `.pnpm` dirs (basic-ftp@5.3.1, devalue@5.9.2, …) are harmless but
noisy for future audits; a plain `pnpm install` in a quiet window prunes them.

## Round accounting

| Round | Surface                                         | Result                                                                                           |
| ----- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| R11   | Agent-instruction surfaces (agentic layer)      | **F1 CONFIRMED → FIXED** (#484 amended)                                                          |
| R12   | URL-input taint (7 readers + language gateway)  | PASS — 0 injection, 0 open-redirect; 1 LOW robustness nit                                        |
| R13   | Independent CVE cross-check (OSV.dev, 686 pkgs) | 17 stale-local false hits, 1 real (= the closing exception); lockfile verified at/past all fixes |

**Verdict: PASS — 1 P1-class finding fixed in-round, 1 LOW nit recorded, the single real advisory
already being closed by the scheduled exception closure. No open material finding.**
