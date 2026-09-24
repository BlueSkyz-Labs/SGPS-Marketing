# W7 follow-up — legacy `tonydemo.com` deployment decommissioned (owner directive)

**Recorded:** 2026-09-24 (Asia/Ho_Chi_Minh, SEAST)
**Supersedes:** the permanent-redirect recommendation in `2026-09-24-w7-public-route-probe.md` (PR #252).
**Owner directive:** _"Bỏ triển khai tonydemo.com đi; tôi đã chuyển sang blueskyzlabs.com rồi."_ —
drop the `tonydemo.com` deployment; the canonical domain is `blueskyzlabs.com`.

## Decision change, and why it matters

The probe recorded that `tonydemo.com` and `www.tonydemo.com` still served the brand site with a
`200` and no redirect, and recommended a **host-scoped permanent redirect**. The owner's directive
replaces that with **decommissioning**: the site should not be served from `tonydemo.com` at all.

This is stricter than the ADR-0006 wording, and it is the correct reading of _retired_: a redirect
implies the legacy host still answers; removing the deployment means it stops answering entirely.
The earlier recommendation is therefore **withdrawn**, not implemented.

## What was actually changed (live infrastructure)

Account `0dd046dab63171c38a6548642bc9f2d4`. Querying the Workers custom-domain list showed **three**
hostnames bound to this project's worker `blueskyz-web`:

| Hostname bound to `blueskyz-web` | Domain ID                                  |
| -------------------------------- | ------------------------------------------ |
| `tonydemo.com`                   | `ed0dbbc7fdf9cd302936b16c55455308a2f14f12` |
| `www.tonydemo.com`               | `da4a244d6f9131b06ca6d550186c340cdb025f9a` |
| `blueskyz.tonydemo.com`          | `307cb379707b25eac559b462819608ed5ba544d0` |

All three were deleted via the Workers custom-domains API. The list was re-read afterwards and no
longer contains any `blueskyz-web` hostname on `tonydemo.com`.

### Why the removal was scoped to those three hostnames and not the zone

The same Cloudflare zone hosts unrelated properties under distinct workers —
`dashboard.tonydemo.com` (`cxo-production`), `v2.apexagent.tonydemo.com` and
`staging.apexagent.tonydemo.com` (`apexagent-*`), `staging.sotro.tonydemo.com` (`sotro-staging`).
A zone-wide redirect or DNS change would have taken those down as collateral. Only this project's
own hostname bindings were touched.

## Verification (external, unauthenticated)

| URL                               | Before                                 | After                                                                |
| --------------------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| `https://tonydemo.com/`           | `200` + brand site                     | **`000` — no route to host**                                         |
| `https://www.tonydemo.com/`       | `200` + `<title>BlueSkyz Labs</title>` | **`522`** — connection to origin failed, **no brand content served** |
| `https://blueskyz.tonydemo.com/`  | `200` (worker)                         | **`522`**                                                            |
| `https://blueskyzlabs.com/`       | `302` → Cloudflare Access              | **`302`** — unchanged, gate intact                                   |
| `https://dashboard.tonydemo.com/` | `302` (unrelated app)                  | **`302`** — unchanged, no collateral damage                          |

The `522` responses are Cloudflare reporting that the hostname no longer resolves to a healthy
origin — i.e. the deployment is gone rather than redirected. The canonical domain's Access gate is
untouched, so the owner-gated public-launch state is unchanged by this work.

## Repository impact

**None, and that is the honest answer.** No deployable configuration in this repository ever
referenced `tonydemo.com`; the 13 in-repo references are historical evidence/spec/plan documents,
and historic records are not rewritten. The binding lived entirely in Cloudflare, which is why source
assurance stayed green while the legacy host was live: the existing
`tests/architecture/public-truth-gate.test.mjs` only forbids _citing_ legacy URLs as production.

## Residual state

- The `tonydemo.com` zone and its DNS records are otherwise untouched; only this project's three
  hostname bindings were removed. Nothing here deletes the zone or affects e-mail/other records.
- If the legacy hostnames are ever re-bound to `blueskyz-web`, the site would reappear publicly,
  bypassing the intended Access gate — treat any future re-binding as a launch decision, not a
  configuration detail.
