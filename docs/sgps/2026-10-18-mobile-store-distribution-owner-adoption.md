# SGPS-DEC-2026-045 — Marketing landing distribution support

**Date:** 2026-10-18 GMT+7
**Authority:** Owner-approved portfolio strategic direction; current Product deployments remain independently gated.
**Status:** LOCAL IMPACT MAPPED / APK DOWNLOAD IMPLEMENTATION NOT VERIFIED.
**References:** sgps-core PR #312; Sổ Trọ PR #1860; sgps-control-plane PR #88; Marketing issue #638.

## Applicability

Marketing is the BlueSkyz public product-house surface, not the SaaS billing ledger, Apple/Google publisher account or signing-key owner. Support Android signed-APK download only when the source product provides a separately approved release artifact and public launch authorization.

The download page must use an official controlled HTTPS host and accurate app identifier, release version/date, verified cryptographic digest and signing certificate fingerprint, transparent install instructions and device-safety warning, privacy/support links, update instructions, and a rollback/takedown/compromise response. Never bundle a debug or test APK, publish an unverified link, fabricate a store badge, or reuse a different product's APK.

Do not copy individual/Organization enrollment claims, approved Store listings, subscription readiness or global marketing metadata unless verified for the exact product/seller/market. Store listings and device-launcher icon have different localization controls.

## Agent routing

Read AGENTS.md, current-work router, live Brand and deployment truth, then this adoption record and the upstream exact decision. Implement source-safe mock components only until signing, account verification and owner public distribution gates pass. Any external download link requires Product-owned immutable artifact and independently verified end-to-end download/update/security controls.

**Status conclusion:** Owner portfolio direction applied to planning; runtime not deployed; Marketing is not authorized to enable app sales or publish APK from this record.
