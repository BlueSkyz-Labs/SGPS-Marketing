import { expect, test } from "@playwright/test";
import {
  LEGACY_GATEWAY_ROUTES,
  legacyGatewayTarget,
} from "../../src/lib/legacy-gateway.ts";

/**
 * UX U8 / red-team C-02: unprefixed legacy routes pick the visitor's locale
 * with the same resolution as the root gateway (saved choice > browser
 * language > coarse country hint > English), instead of a fixed 301 to /en/.
 * There is no edge worker, so the decision lives in legacyGatewayTarget.
 */

const STORAGE_KEY = "blueskyz.ui.language";

test.describe("legacyGatewayTarget (unit)", () => {
  for (const route of LEGACY_GATEWAY_ROUTES) {
    test(`${route} resolves vi / zh-TW / en / fallback`, () => {
      const t = (
        languages: string[],
        stored: string | null = null,
        c?: string,
      ) => legacyGatewayTarget({ route, stored, languages, country: c });
      expect(t(["vi-VN"])).toBe(`/vi${route}`);
      expect(t(["zh-TW"])).toBe(`/zh-hant${route}`);
      expect(t(["zh-CN"])).toBe(`/zh${route}`);
      expect(t(["en-US"])).toBe(`/en${route}`);
      // Negative proofs: unsupported language falls to English, not to vi.
      expect(t(["fr-FR"])).toBe(`/en${route}`);
      expect(t([])).toBe(`/en${route}`);
      // Saved choice outranks the browser language.
      expect(t(["vi-VN"], "en")).toBe(`/en${route}`);
      expect(t(["en-US"], "zh-hant")).toBe(`/zh-hant${route}`);
      // Browser language outranks the country hint; country only when no language.
      expect(t(["en-US"], null, "VN")).toBe(`/en${route}`);
      expect(t(["fr-FR"], null, "VN")).toBe(`/vi${route}`);
      expect(t([], null, "DE")).toBe(`/en${route}`);
      // A junk stored value is ignored.
      expect(t(["vi-VN"], "klingon")).toBe(`/vi${route}`);
    });
  }

  test("query and hash are preserved; only well-formed ones", () => {
    expect(
      legacyGatewayTarget({
        route: "/contact/",
        stored: null,
        languages: ["vi"],
        search: "?ref=zalo",
        hash: "#form",
      }),
    ).toBe("/vi/contact/?ref=zalo#form");
    expect(
      legacyGatewayTarget({
        route: "/contact/",
        stored: null,
        languages: ["vi"],
        search: "ref=x",
        hash: "x",
      }),
    ).toBe("/vi/contact/");
  });

  test("unknown or hostile routes fail closed to the locale root (never open-redirect)", () => {
    for (const route of [
      "//evil.example/",
      "https://evil.example/",
      "/nope/",
    ]) {
      const target = legacyGatewayTarget({
        route,
        stored: null,
        languages: ["vi"],
      });
      expect(target).toBe("/vi/");
      expect(target.startsWith("//")).toBe(false);
    }
  });
});

test.describe("rendered gateway", () => {
  for (const route of LEGACY_GATEWAY_ROUTES) {
    for (const [locale, prefix] of [
      ["vi-VN", "vi"],
      ["zh-TW", "zh-hant"],
      ["en-US", "en"],
    ] as const) {
      test(`${route} with ${locale} lands on /${prefix}${route}`, async ({
        browser,
      }) => {
        const context = await browser.newContext({ locale });
        try {
          const page = await context.newPage();
          await page.goto(route);
          await page.waitForURL(`**/${prefix}${route}`);
          expect(new URL(page.url()).pathname).toBe(`/${prefix}${route}`);
          // The page is a real localized page, not a loop.
          await expect(page.locator("h1").first()).toBeVisible();
        } finally {
          await context.close();
        }
      });
    }
  }

  test("saved language choice wins over the browser language", async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: "vi-VN" });
    try {
      await context.addInitScript(
        ([key]) => window.localStorage.setItem(key, "en"),
        [STORAGE_KEY],
      );
      const page = await context.newPage();
      await page.goto("/contact/");
      await page.waitForURL("**/en/contact/");
      expect(new URL(page.url()).pathname).toBe("/en/contact/");
    } finally {
      await context.close();
    }
  });

  test("no cookie is set and JS-off keeps a working English path plus four links", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      locale: "vi-VN",
      javaScriptEnabled: false,
    });
    try {
      const page = await context.newPage();
      await page.goto("/about/");
      // meta refresh (2s): English fallback, the pre-U8 behaviour.
      await page.waitForURL("**/en/about/");
      expect(new URL(page.url()).pathname).toBe("/en/about/");
      expect(await context.cookies()).toEqual([]);
    } finally {
      await context.close();
    }
  });

  test("gateway is canonical to the English page and lists four localized links", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const response = await context.request.get("/support/");
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).toMatch(/rel="canonical" href="[^"]*\/en\/support\/"/);
      for (const code of ["vi", "en", "zh", "zh-hant"]) {
        expect(html).toContain(`href="/${code}/support/"`);
      }
    } finally {
      await context.close();
    }
  });
});

test.describe("gateway indexing and privacy to security link", () => {
  for (const route of LEGACY_GATEWAY_ROUTES) {
    test(`${route} gateway canonicalises to /en${route} and is not a duplicate`, async ({
      browser,
    }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      try {
        const html = await (await context.request.get(route)).text();
        const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
        expect(new URL(canonical!).pathname).toBe(`/en${route}`);
        // Carries no localized content or hreflang cluster, so it cannot
        // compete as a duplicate: canonical to the English page is sufficient.
        expect(html).not.toContain('hreflang="x-default"');
        expect(html).not.toMatch(/<link[^>]+rel="alternate"/);
        expect(html).toContain('data-legacy-route="' + route + '"');
        // Negative: the canonical is never the unprefixed URL itself.
        expect(new URL(canonical!).pathname).not.toBe(route);
      } finally {
        await context.close();
      }
    });
  }

  for (const lang of ["en", "vi", "zh", "zh-hant"]) {
    test(`/${lang}/privacy/ links to /${lang}/security/`, async ({ page }) => {
      await page.goto(`/${lang}/privacy/`);
      await expect(
        page.locator(`a[href="/${lang}/security/"]`).first(),
      ).toHaveCount(1);
      // Negative: a different locale's security URL must not satisfy it.
      await expect(
        page.locator(`a[href="/${lang === "en" ? "vi" : "en"}/security/"]`),
      ).toHaveCount(0);
    });
  }
});
