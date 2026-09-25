import {
  test,
  expect,
  type Locator,
  type Page,
  type TestInfo,
} from "@playwright/test";
import { startFixtureServer } from "./helpers/parity-fixture";
import { hasPublicProducts } from "./product-helpers.ts";

/**
 * C2 P3 (Task 9) — native product continuity contract (fixture-backed, bilingual).
 *
 * Asserted against the throwaway fixture app (tests/e2e/fixtures/parity-app)
 * because the production product registry is intentionally empty (owner-gated
 * screenshot floor). The fixture carries the real C2 product surfaces with
 * synthetic records; it is never deployed.
 *
 * Convention (one source): src/lib/product-transition.ts
 *   - media -> product-media-<slug> (flagship theatre screenshot)
 *   - card  -> product-card-<slug>  (product name link)
 *
 * Static-first contract: ordinary anchors are the authority for navigation;
 * view-transition names are progressive enhancement that a browser without
 * support simply ignores. Nothing here intercepts clicks or routes client-side.
 */

const PROFILE_HREF = /\/(?:en|vi)\/products\/([a-z0-9-]+)\//;

/**
 * Read the continuity name of one surface. Inline style is the
 * capability-independent evidence; computed style is the fallback. When a
 * browser exposes neither, the absence is annotated instead of silently
 * passing the assertion.
 */
async function continuityName(
  el: Locator,
  testInfo: TestInfo,
): Promise<string> {
  const inline = (await el.getAttribute("style")) ?? "";
  const inlineMatch = inline.match(/view-transition-name:\s*([^;]+)/);
  if (inlineMatch) return inlineMatch[1].trim();

  const computed = await el.evaluate((node) => {
    const value = (
      node as HTMLElement & { style: CSSStyleDeclaration }
    ).style.getPropertyValue("view-transition-name");
    if (value) return value.trim();
    try {
      return (getComputedStyle(node).viewTransitionName || "").trim();
    } catch {
      return "";
    }
  });
  if (computed && computed !== "none") return computed;

  testInfo.annotations.push({
    type: "continuity-unexposed",
    description:
      "this browser exposes neither the inline nor the computed view-transition-name for this element; the name is asserted on the other surfaces",
  });
  return "";
}

/**
 * Click a link that navigates and wait for the destination explicitly.
 *
 * `noWaitAfter: true` is deliberate: WebKit's click action can hang while it
 * tries to observe the post-click navigation, so the navigation is awaited via
 * `waitForURL` on the link's own canonical href instead. Ordinary anchor
 * navigation remains the authority — nothing here intercepts the click.
 */
async function clickThrough(page: Page, link: Locator): Promise<void> {
  const href = (await link.getAttribute("href")) ?? "";
  expect(href, "the product link must carry a canonical href").not.toBe("");
  const target = new RegExp(`${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`);
  await Promise.all([
    page.waitForURL(target, { timeout: 15_000 }),
    link.click({ noWaitAfter: true }),
  ]);
}

test.describe("C2 product continuity — static-first no-JS contract", () => {
  test.use({ javaScriptEnabled: false });

  test("EN product link lands on the canonical localized URL without a client router", async ({
    page,
  }) => {
    const server = await startFixtureServer();
    try {
      await page.goto(`${server.origin}/product-acts/`);
      const link = page.locator('a[data-product-continuity="card"]').first();
      await clickThrough(page, link);
      await expect(page).toHaveURL(/\/en\/products\/fixture-flagship\/$/);
      const title = page.locator("[data-product-profile-title]");
      await expect(title).toBeVisible();
      await expect(title).toContainText("Fixture Flagship");
    } finally {
      await server.close();
    }
  });
});

test.describe("C2 product continuity — fixture-backed", () => {
  let origin = "";
  let closeServer: () => Promise<void>;

  test.beforeAll(async () => {
    const server = await startFixtureServer();
    origin = server.origin;
    closeServer = server.close;
  }, 30_000);

  test.afterAll(async () => {
    await closeServer();
  });

  for (const locale of [
    {
      lang: "en",
      home: "/product-acts/",
      profile: "/en/products/fixture-flagship/",
    },
    {
      lang: "vi",
      home: "/product-acts-vi/",
      profile: "/vi/products/fixture-flagship/",
    },
  ] as const) {
    test(`${locale.lang}: product navigation reaches the canonical localized profile with reduced motion`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`${origin}${locale.home}`);
      const link = page.locator(`a[href="${locale.profile}"]`).first();
      await clickThrough(page, link);
      await expect(page).toHaveURL(new RegExp(`${locale.profile}$`));
      const title = page.locator("[data-product-profile-title]");
      await expect(title).toBeVisible();
      await expect(title).toContainText("Fixture Flagship");
    });

    test(`${locale.lang}: continuity names are slug-derived, well-formed and unique`, async ({
      page,
    }, testInfo) => {
      await page.goto(`${origin}${locale.home}`);

      // The theatre's own canonical link is the slug source for the media name.
      const theatreProfileHref =
        (await page
          .locator(`[data-flagship-theatre] a[href="${locale.profile}"]`)
          .first()
          .getAttribute("href")) ?? "";
      const mediaSlug = theatreProfileHref.match(PROFILE_HREF)?.[1] ?? "";
      expect(
        mediaSlug,
        "the theatre must link to its own canonical localized profile",
      ).toBe("fixture-flagship");

      const elements = await page.locator("[data-product-continuity]").all();
      expect(
        elements.length,
        "the fixture product-act page must render product surfaces",
      ).toBeGreaterThan(1);

      const names = new Set<string>();
      let mediaCount = 0;

      for (const el of elements) {
        const kind = (await el.getAttribute("data-product-continuity")) ?? "";
        expect(
          ["media", "card"],
          `unexpected continuity kind: ${kind}`,
        ).toContain(kind);

        const href =
          kind === "card"
            ? ((await el.getAttribute("href")) ?? "")
            : theatreProfileHref;
        const slug = href.match(PROFILE_HREF)?.[1] ?? "";
        expect(
          slug,
          `${kind} surface must resolve to a canonical product profile slug`,
        ).toMatch(/^[a-z0-9-]+$/);

        const name = await continuityName(el, testInfo);
        if (!name) continue;

        expect(
          name,
          `${kind} name must derive from the record slug, not be authored`,
        ).toBe(`product-${kind}-${slug}`);
        expect(
          names.has(name),
          `duplicate continuity name ${name} breaks navigation`,
        ).toBe(false);
        names.add(name);
        if (kind === "media") mediaCount += 1;
      }

      expect(
        mediaCount,
        "the theatre screenshot must expose exactly one media continuity name",
      ).toBe(1);
    });
  }

  test("EN: the destination title carries the same card name as its source", async ({
    page,
  }, testInfo) => {
    await page.goto(`${origin}/product-acts/`);
    const source = page.locator('a[data-product-continuity="card"]').first();
    const sourceSlug =
      ((await source.getAttribute("href")) ?? "").match(PROFILE_HREF)?.[1] ??
      "";
    const sourceName = await continuityName(source, testInfo);
    expect(sourceName).toBe(`product-card-${sourceSlug}`);

    await page.goto(`${origin}/en/products/fixture-flagship/`);
    const title = page.locator("[data-product-profile-title]");
    await expect(title).toBeVisible();
    const destName = await continuityName(title, testInfo);
    expect(destName).toBe(sourceName);
  });
});

test.describe("C2 product continuity — real-site honesty (empty registry)", () => {
  for (const lang of ["en", "vi"] as const) {
    test(`/${lang}/ publishes no continuity names while the registry is empty`, async ({
      page,
    }, testInfo) => {
      test.skip(
        hasPublicProducts,
        "Public products are published; empty registry contract only applies when registry is empty",
      );
      await page.goto(`/${lang}/`);
      expect(await page.locator("[data-product-continuity]").count()).toBe(0);
      testInfo.annotations.push({
        type: "empty-registry-legal",
        description: `/${lang}/ publishes no [data-product-continuity] elements: the production registry is empty (owner-gated screenshot floor), which is the legal state, not a missing feature`,
      });
    });
  }
});
