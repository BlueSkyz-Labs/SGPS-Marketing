# Agent model routing (cost-aware)

The orchestrator (the main session) plans, decides and edits Vietnamese. It delegates work by kind:

| Agent         | Model          | Use for                                                                     | Never for                        |
| ------------- | -------------- | --------------------------------------------------------------------------- | -------------------------------- |
| `scout`       | Haiku (latest) | grep, file location, CI log triage, status checks, summaries                | edits                            |
| `mechanic`    | Haiku (latest) | verbatim copy-deck rows, listed renames, listed test pins, listed deletions | design, new logic, VI/zh wording |
| `implementer` | Sonnet         | one v8 wave: components, CSS, behaviour, tests and a PR                     | review of its own PR             |
| `reviewer`    | Opus           | W11 verification, VI review, truth/security review, red team                | implementation                   |

## Token rules

1. Read the smallest slice: plan §4 for your wave and §5. Do not read the whole plan or the deck.
2. Use `file:line` references instead of pasting code. Quote at most 5 lines.
3. Delegate lookups to `scout` instead of reading many files in an expensive context.
4. Run independent tool calls in parallel. Never re-read a file you just edited.
5. Keep reports short: Haiku agents ≤ 10–15 lines, the implementer ≤ 12 lines.
6. Escalate instead of guessing: Haiku agents stop on any ambiguity and hand it back.
7. Independence: the agent that implements a change never verifies it (plan W11, AGENTS rule 29).
