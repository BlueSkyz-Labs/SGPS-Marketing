# W6 — External & human gates (non-blocking for W1–W5)

These are not agent-completable; agents prepare evidence templates and read-backs only.

| Gate                                    | Who                         | What the agent may do                                                                                                  |
| --------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Human E4 (Owner self-tests)             | Owner                       | Keep protocol `docs/evidence/2026-09-12-v3-human-e4.md` current with the v5 surfaces (Atlas, dark mode, product cards) |
| Native VI/ZH review of W3.4 strings     | Owner cross-check           | Export the string table per PR                                                                                         |
| Real UI screenshots per product         | Product owners              | Keep `kind: ui-screenshot` path ready; never substitute art                                                            |
| VietQR / payment capability             | Sổ Trọ repository           | Hand over reference `4ac2e80` with the D-0 rationale; nothing in Marketing                                             |
| #281 corporate/security mailboxes       | Owner/provider              | None beyond copy guards                                                                                                |
| Served-SHA & anonymous access read-back | Owner (Cloudflare Access)   | Record Workers version ↔ main SHA after each merge                                                                     |
| Control plane reconciliation (F-16)     | control-plane single writer | Provide the project evidence link; do not write central state from this repo                                           |
