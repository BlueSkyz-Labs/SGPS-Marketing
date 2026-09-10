# Bilingual Vietnamese/English Implementation Plan — BlueSkyz Labs Web V1

**Goal:** Thêm hỗ trợ song ngữ Việt/Anh với chuẩn SEO hreflang, canonical URL rõ ràng, và UX chuyển ngôn ngữ liền mạch.

**Architecture:** Subfolder-based routing (`/en/` và `/vi/`) với Astro Content Collections, theo chuẩn Google cho đa ngôn ngữ. Không dùng subdomain (tránh phân tán link equity) hay query param (khó kiểm soát canonical). Mỗi page có `hreflang` reciprocal link. Ngôn ngữ mặc định: English (`/en/`). Tiếng Việt (`/vi/`).

**SEO Subfolder vs Subdomain vs Query:**

| Approach                    | Link Equity          | Implementation     | Google Recommendation    |
| --------------------------- | -------------------- | ------------------ | ------------------------ |
| ✅ Subfolder `/en/`, `/vi/` | Shared (same domain) | Low complexity     | Recommended              |
| ❌ Subdomain `en.`, `vi.`   | Treated separate     | DNS + SSL overhead | Only for distinct brands |
| ❌ Query `?lang=vi`         | Confusing            | Easy               | Not recommended          |

**Tech Stack:** Astro 7 (static output), TypeScript 6, Tailwind CSS 4, Content Collections (typed YAML), Node native tests + Playwright + Lighthouse CI.

**File Structure (target):**

```
src/
├── components/
│   └── layout/
│       ├── Header.astro       # thêm language switcher
│       └── Footer.astro       # thêm language switcher
├── content/
│   ├── products/               # giữ nguyên, content language-agnostic
│   └── pages/
│       ├── en/
│       │   ├── index.yaml
│       │   ├── about.yaml
│       │   ├── contact.yaml
│       │   ├── privacy.yaml
│       │   ├── security.yaml
│       │   └── support.yaml
│       └── vi/
│           ├── index.yaml
│           ├── about.yaml
│           ├── contact.yaml
│           ├── privacy.yaml
│           ├── security.yaml
│           └── support.yaml
├── layouts/
│   └── BaseLayout.astro       # thêm hreflang + lang attribute
├── lib/
│   ├── i18n.ts                # mới — language resolution, translations
│   ├── seo.ts                 # thêm hreflang generation
│   └── truth.ts               # thêm bilingual site URLs
├── pages/
│   ├── en/                    # mới — English routes
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── privacy.astro
│   │   ├── security.astro
│   │   └── support.astro
│   └── vi/                    # mới — Vietnamese routes
│       ├── index.astro
│       ├── about.astro
│       ├── contact.astro
│       ├── privacy.astro
│       ├── security.astro
│       └── support.astro
└── styles/
    └── global.css             # thêm font cho Vietnamese diacritics
```

**ADR mới cần tạo:** `0008-bilingual-architecture.md`

**Key Decisions:**

1. **Default language:** English (`/en/`) — canonical reference
2. **URL structure:** `/en/...` và `/vi/...` (subfolder)
3. **hreflang:** Mỗi page link reciprocal (`<link rel="alternate" hreflang="en" ...>` và `<link rel="alternate" hreflang="vi" ...>`)
4. **x-default:** Trỏ về `/en/` cho user không match ngôn ngữ
5. **Language switcher:** Component riêng, detect từ URL path, toggle giữa `/en/` và `/vi/`
6. **Content:** YAML-based cho static text, không dùng CMS external
7. **Sitemap:** Cập nhật để include cả `/en/` và `/vi/` với hreflang annotations
8. **Font:** Đảm bảo Inter hỗ trợ Vietnamese diacritics (đã có sẵn)

**Migration path:**

- Hiện tại: pages ở root (`/about/`, `/contact/`, v.v.)
- Sau migration: redirect root → `/en/` (301) hoặc tái cấu trúc
- **Khuyến nghị:** Tại mới structure, redirect legacy nếu cần

**Testing:**

- Unit tests cho `i18n.ts` (language resolution)
- Architecture tests cho hreflang contract
- E2E: Playwright verify language switcher, hreflang presence
- Lighthouse: không regression

**Risks:**

- Legacy URL ngoài `workers.dev` và `tonydemo.com` — cần preserve noindex
- SEO crawl budget tăng gấp đôi (2x pages) — acceptable cho portfolio scale
- Content maintenance: mỗi thay đổi phải sync cả 2 ngôn ngữ — acceptable với quy mô 6-8 pages

---

## Tasks Overview

### Phase 1: Foundation

- **Task 1:** Create ADR `0008-bilingual-architecture.md`
- **Task 2:** Create `src/lib/i18n.ts` — language detection + URL helpers
- **Task 3:** Create `src/content.config.ts` — page collections (en + vi)
- **Task 4:** Update `src/lib/seo.ts` — add hreflang generation

### Phase 2: Content

- **Task 5:** Create English content files (`src/content/pages/en/*.yaml`)
- **Task 6:** Create Vietnamese content files (`src/content/pages/vi/*.yaml`)

### Phase 3: Pages & Layouts

- **Task 7:** Create `src/pages/en/*.astro` — English routes
- **Task 8:** Create `src/pages/vi/*.astro` — Vietnamese routes
- **Task 9:** Update `src/layouts/BaseLayout.astro` — hreflang + lang attribute
- **Task 10:** Update `src/components/layout/Header.astro` — language switcher
- **Task 11:** Update `src/components/layout/Footer.astro` — language switcher

### Phase 4: Integration & QA

- **Task 12:** Update `src/pages/sitemap.xml.ts` — include both languages
- **Task 13:** Update `src/pages/robots.txt.ts` — preserve noindex
- **Task 14:** Architecture tests — hreflang contract, language resolution
- **Task 15:** E2E tests — language switcher, hreflang presence
- **Task 16:** Final verification — full gate run

---

## Detailed Steps

### Task 1: ADR `0008-bilingual-architecture.md`

**File:** `docs/decisions/0008-bilingual-architecture.md`

```markdown
# ADR 0008 — Bilingual Vietnamese/English Architecture

- **Status:** Proposed
- **Date:** 2026-09-10
- **Refines:** ADR 0004 (Astro 7), ADR 0006 (canonical domain)

## Context

V1 spec excluded multilingual CMS. Business requirement added: serve content in Vietnamese and English. Need URL structure, hreflang contract, and content flow that preserves SEO while supporting both languages.

## Decision

1. Subfolder routing: `/en/` (default), `/vi/`
2. Reciprocal hreflang on every page
3. x-default → `/en/`
4. Content as typed YAML (not CMS)
5. Language switcher component toggles between language subfolders

## Consequences

- Shared link equity (same domain)
- Google treats subfolder languages as recommended pattern
- Content maintenance = 2x text updates (acceptable at portfolio scale)
- Legacy `/about/` style URLs redirect to `/en/about/` (301)
```

---

### Task 2: `src/lib/i18n.ts`

```typescript
export const SUPPORTED_LANGUAGES = ["en", "vi"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "en";

export interface LanguageConfig {
  code: Language;
  label: string; // native name
  hreflang: string; // "en", "vi"
}

export const LANGUAGES: Record<Language, LanguageConfig> = {
  en: { code: "en", label: "English", hreflang: "en" },
  vi: { code: "vi", label: "Tiếng Việt", hreflang: "vi" },
};

export function getLanguageFromPath(pathname: string): Language {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (segment === "vi") return "vi";
  return "en"; // default
}

export function getAlternatePath(
  pathname: string,
  targetLang: Language,
): string {
  const currentLang = getLanguageFromPath(pathname);
  const rest = pathname.replace(/^\/(en|vi)/, "") || "/";
  return `/${targetLang}${rest}`;
}

export function stripLanguagePrefix(pathname: string): string {
  return pathname.replace(/^\/(en|vi)/, "") || "/";
}
```

---

### Task 3: Content Collections

**File:** `src/content.config.ts`

Add `pages` collection alongside existing `products`:

```typescript
const pages = defineCollection({
  loader: glob({
    pattern: "**/*.yaml",
    base: "./src/content/pages",
  }),
  schema: z.object({
    lang: z.enum(["en", "vi"]),
    title: z.string(),
    description: z.string(),
    sections: z.record(z.string(), z.unknown()).optional(),
  }),
});
```

---

### Task 4: Hreflang in SEO

**File:** `src/lib/seo.ts`

Add:

```typescript
export function hreflangLinks(
  path: string,
  siteUrl: string,
): { hreflang: string; href: string }[] {
  return SUPPORTED_LANGUAGES.map((lang) => ({
    hreflang: LANGUAGES[lang].hreflang,
    href: canonicalForPath(getAlternatePath(path, lang), siteUrl),
  }));
}
```

---

### Task 5-6: Content Files

**Format:** `src/content/pages/en/index.yaml`

```yaml
lang: en
title: BlueSkyz Labs
description: We build intelligent products that empower people and elevate the way work gets done.
sections:
  hero:
    heading: Intelligence. Elevated. Impact.
    subheading: We build intelligent products...
    primaryCta: About BlueSkyz
    secondaryCta: Security
```

**Format:** `src/content/pages/vi/index.yaml`

```yaml
lang: vi
title: BlueSkyz Labs
description: Chúng tôi xây dựng những sản phẩm thông minh để trao quyền cho con người và nâng tầm cách công việc được thực hiện.
sections:
  hero:
    heading: Trí tuệ. Nâng tầm. Tác động.
    subheading: Chúng tôi xây dựng những sản phẩm thông minh...
    primaryCta: Về BlueSkyz
    secondaryCta: Bảo mật
```

---

### Task 7-8: Route Pages

**Pattern:** `src/pages/en/about.astro`

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "@/layouts/BaseLayout.astro";
import { getLanguageFromPath } from "@/lib/i18n";

const pages = await getCollection("pages", ({ data }) => data.lang === "en");
const page = pages.find((p) => p.data.sections?.slug === "about");
---

<BaseLayout title={page.data.title} description={page.data.description}>
  <!-- render page sections -->
</BaseLayout>
```

Similar for `src/pages/vi/about.astro` with `data.lang === "vi"`.

---

### Task 9: BaseLayout Update

Add `lang` attribute dynamically:

```astro
<html lang={currentLang}></html>
```

Add hreflang links in `<head>`:

```astro
{
  hreflangLinks(path, SITE.url).map((link) => (
    <link rel="alternate" hreflang={link.hreflang} href={link.href} />
  ))
}
<link
  rel="alternate"
  hreflang="x-default"
  href={canonicalForPath(getAlternatePath(path, "en"), SITE.url)}
/>
```

---

### Task 10-11: Language Switcher

**Component:** `src/components/layout/LanguageSwitcher.astro`

```astro
---
import { SUPPORTED_LANGUAGES, LANGUAGES, getAlternatePath } from "@/lib/i18n";

const currentPath = Astro.url.pathname;
---

<div class="flex items-center gap-1" role="navigation" aria-label="Language">
  {
    SUPPORTED_LANGUAGES.map((lang) => (
      <a
        href={getAlternatePath(currentPath, lang)}
        hreflang={LANGUAGES[lang].hreflang}
        aria-current={
          getLanguageFromPath(currentPath) === lang ? "page" : undefined
        }
        class="..."
      >
        {LANGUAGES[lang].label}
      </a>
    ))
  }
</div>
```

Embed in Header + Footer.

---

### Task 12: Sitemap

Update `src/pages/sitemap.xml.ts`:

```typescript
// Include both /en/ and /vi/ routes with hreflang annotations
```

---

### Task 13: Robots.txt

Keep noindex for `workers.dev` and `tonydemo.com`. No change for production domain.

---

### Task 14-15: Tests

**Architecture test:** `tests/architecture/hreflang-contract.test.mjs`

- Every page has reciprocal hreflang
- x-default present
- hreflang values are valid BCP 47

**E2E test:** `tests/e2e/language-switching.spec.ts`

- Clicking language switcher navigates to correct URL
- hreflang link tags present on all pages

---

### Task 16: Final Gate

```bash
pnpm test:architecture
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm check:client-budget
pnpm check:static-links
```

---

## Verification Checklist

- [ ] `https://blueskyzlabs.com/en/` renders English
- [ ] `https://blueskyzlabs.com/vi/` renders Vietnamese
- [ ] Every page has `<link rel="alternate" hreflang="en">` and `hreflang="vi"`
- [ ] x-default present pointing to `/en/`
- [ ] Language switcher toggles correctly
- [ ] Sitemap includes both languages
- [ ] No regression in Lighthouse scores
- [ ] Workers.dev / tonydemo.com remain noindex
- [ ] `pnpm audit` clean

---

## Open Questions

1. **Legacy URL handling:** Should `/about/` 301 redirect to `/en/about/`, or keep root pages until full migration? → Recommend 301 redirect for clean canonical signal.
2. **Content sync:** Acceptable to require manual sync between EN/VI YAML files? → Yes at portfolio scale (6-8 pages). CMS only justified at 50+ pages.
3. **Vietnamese translation:** Owner provides final copy, or draft by agent for review? → Recommend agent drafts EN content first, owner reviews VI translation.

---

**Plan scope:** 16 tasks, ~3-4 hours estimated. No new dependencies required (all native Astro features).
