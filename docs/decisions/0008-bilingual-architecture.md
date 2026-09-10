# ADR 0008 — Bilingual Vietnamese/English Architecture

- **Status:** Accepted
- **Date:** 2026-09-10
- **Refines:** ADR 0004 (Astro 7), ADR 0006 (canonical domain)

## Context

V1 spec excluded multilingual CMS. New business requirement: serve content in Vietnamese and English. We need a URL structure, hreflang contract, and content flow that preserves SEO and supports both languages at portfolio scale.

## Decision

1. **Subfolder routing:** `/en/` (default), `/vi/`.
2. **Reciprocal hreflang** on every page.
3. **x-default** → `/en/`.
4. **Content as typed YAML** (no CMS dependency).
5. **Language switcher** component toggles between language subfolders, preserving the current path.

## Consequences

- Shared link equity (same domain).
- Google treats subfolder languages as the recommended pattern.
- Content maintenance = 2x text updates (acceptable at portfolio scale).
- Legacy `/about/`-style URLs redirect to `/en/about/` (301).
