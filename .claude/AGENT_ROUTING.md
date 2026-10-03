# Agent model routing (cost-aware)

The orchestrator (the main session) plans, decides and edits Vietnamese. It delegates work by kind:

| Agent         | Model          | Use for                                                                     | Never for                        |
| ------------- | -------------- | --------------------------------------------------------------------------- | -------------------------------- |
| `scout`       | Haiku (latest) | grep, file location, CI log triage, status checks, summaries                | edits                            |
| `mechanic`    | Haiku (latest) | verbatim copy-deck rows, listed renames, listed test pins, listed deletions | design, new logic, VI/zh wording |
| `implementer` | Sonnet         | one v8 wave: components, CSS, behaviour, tests and a PR                     | review of its own PR             |
| `reviewer`    | Opus           | W11 verification, VI review, truth/security review, red team                | implementation                   |

## Token rules

1. **Mandatory first read:** active plan `docs/superpowers/plans/2026-10-02-v9-completion-golive.md` §8 (agent execution contract) and your §9 task card. Then read only the files your card names. v8 plan §5 still supplies ports, the glossary (§5.3) and PR conventions. Do not read the whole plan or the deck.
2. Use `file:line` references instead of pasting code. Quote at most 5 lines.
3. Delegate lookups to `scout` instead of reading many files in an expensive context.
4. Run independent tool calls in parallel. Never re-read a file you just edited.
5. Keep reports short: Haiku agents ≤ 10–15 lines, the implementer ≤ 12 lines.
6. Escalate instead of guessing: Haiku agents stop on any ambiguity and hand it back.
7. Independence: the agent that implements a change never verifies it (plan W11, AGENTS rule 29).
