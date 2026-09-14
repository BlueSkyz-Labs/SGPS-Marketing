import { expect, test, type TestInfo } from "@playwright/test";
import { startFixtureServer } from "./helpers/parity-fixture";

/**
 * C2 P3 (Task 7) — fixture-backed spec for the FlagshipTheatre component.
 *
 * Contract enforced:
 *   - The theatre is truth-driven: consumes exactly one public product record,
 *     never invents facts, and renders NOTHING (not a placeholder shell)
 *     when the record is absent.
 *   - The fixture app at tests/e2e/fixtures/parity-app provides a synthetic
 *     public record (`fixture-flagship`) so product-present behaviour is
 *     testable while the production registry remains intentionally empty.
 *   - Continuity: one `data-product-continuity="media"` element per document
 *     with a unique `view-transition-name` derived from the record slug.
 *   - Vocabulary boundary: no invented assurance language.
 */

const THEATRE = "[data-flagship-theatre]";
const TITLE = "#flagship-theatre-title";
const CONTINUITY = '[data-product-continuity="media"]';
const BANNED_ASSURANCE =
  /\b(certified|audited|guaranteed|trust score|risk score)\b/i;

function annotateAbsent(testInfo: TestInfo, route: string): void {
  testInfo.annotations.push({
    type: "theatre-absent",
    description: `${route} has no flagship theatre — the public product registry is empty, which is the legal (fail-closed) state; no placeholder or fake shell is rendered`,
  });
}

test.describe("C2 Flagship Theatre — fixture-backed (product present)", () => {
  let origin = "";
  let closeServer = () => Promise.resolve();

  test.beforeAll(async () => {
    const server = await startFixtureServer();
    origin = server.origin;
    closeServer = server.close;
  });

  test.afterAll(async () => {
    await closeServer();
  });

  for (const locale of [
    {
      lang: "en",
      path: "/product-acts/",
      profilePath: "/en/products/fixture-flagship/",
    },
    {
      lang: "vi",
      path: "/product-acts-vi/",
      profilePath: "/vi/products/fixture-flagship/",
    },
  ]) {
    test(`${locale.lang}: theatre renders truth-driven from the fixture record`, async ({
      page,
    }) => {
      await page.goto(`${origin}${locale.path}`);

      // Exactly one theatre section.
      await expect(page.locator(THEATRE)).toHaveCount(1);

      // Act title is the record name.
      await expect(page.locator(TITLE)).toHaveText("Fixture Flagship");

      // Status family (subordinate, via ProductStatus) carries the record label.
      const statusLabel = await page
        .locator("section[data-flagship-theatre] span")
        .textContent();
      expect(statusLabel?.trim()).toBe("In development");

      // Short description present.
      await expect(page.locator(THEATRE)).toContainText(
        "Fixture description for the flagship act.",
      );

      // Exactly 3 capability items.
      const caps = page.locator(
        `${THEATRE} li.c2-flagship-theatre__capability`,
      );
      await expect(caps).toHaveCount(3);

      // Primary action uses the record label.
      const primaryHref = await page
        .locator(`${THEATRE} a[href="/en/contact/"]`)
        .getAttribute("href");
      expect(primaryHref).toBe("/en/contact/");
      await expect(
        page.locator(`${THEATRE} a[href="/en/contact/"]`),
      ).toContainText("Contact");

      // Profile anchor links to the canonical localized profile path.
      await expect(
        page.locator(`${THEATRE} a[href="${locale.profilePath}"]`),
      ).toHaveCount(1);

      // Screenshot has intrinsic dimensions and non-empty alt from the record.
      const img = page.locator(`${THEATRE} img`);
      await expect(img).toBeVisible();
      await expect(img).toHaveAttribute(
        "src",
        "/products/fixtures/fixture-flagship.png",
      );
      await expect(img).toHaveAttribute(
        "alt",
        "Fixture flagship product screenshot",
      );
      await expect(img).toHaveAttribute("width", "1280");
      await expect(img).toHaveAttribute("height", "800");
      await expect(img).toHaveAttribute("loading", "lazy");
      await expect(img).toHaveAttribute("decoding", "async");
      // Opacity stays 1 (no fade-in).
      const opacity = await img.evaluate((el) => getComputedStyle(el).opacity);
      expect(opacity).toBe("1");
    });

    test(`${locale.lang}: continuity hook is exactly one unique media name`, async ({
      page,
    }) => {
      await page.goto(`${origin}${locale.path}`);

      // Exactly one continuity element.
      await expect(page.locator(CONTINUITY)).toHaveCount(1);

      // Inline style carries the derived view-transition-name.
      const el = page.locator(CONTINUITY);
      const inlineStyle = (await el.getAttribute("style")) ?? "";
      expect(inlineStyle).toContain(
        "view-transition-name: product-media-fixture-flagship",
      );

      // Uniqueness in document: no other element carries the same name.
      // (Verified via inline-style read; if the environment does not expose
      // viewTransitionName via computed style, we fall back to the inline
      // style attribute as the authoritative source.)
      const allInlineNames = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("[style]"))
          .map((n) => (n as HTMLElement).getAttribute("style") ?? "")
          .filter((s) => s.includes("view-transition-name"));
      });
      const mediaNames = allInlineNames.filter((s) =>
        s.includes("product-media-fixture-flagship"),
      );
      expect(
        mediaNames.length,
        "media continuity name must be unique in document",
      ).toBe(1);
    });
  }
});

test.describe("C2 Flagship Theatre — no JavaScript (static-first)", () => {
  let origin = "";
  let closeServer = () => Promise.resolve();

  test.beforeAll(async () => {
    const server = await startFixtureServer();
    origin = server.origin;
    closeServer = server.close;
  });

  test.afterAll(async () => {
    await closeServer();
  });

  test.use({ javaScriptEnabled: false });

  test("fixture theatre content and actions render without JavaScript", async ({
    page,
  }) => {
    await page.goto(`${origin}/product-acts/`);
    await expect(page.locator("[data-flagship-theatre]")).toHaveCount(1);
    await expect(page.locator("#flagship-theatre-title")).toHaveText(
      "Fixture Flagship",
    );
    // Both actions render and profile link is usable.
    await expect(
      page.locator(`${THEATRE} a[href='/en/products/fixture-flagship/']`),
    ).toHaveCount(1);
    await expect(page.locator(`${THEATRE} a[href='/en/contact/']`)).toHaveCount(
      1,
    );
  });
});

test.describe("C2 Flagship Theatre — real-site absence (honesty)", () => {
  for (const locale of [
    { lang: "en", home: "/en/" },
    { lang: "vi", home: "/vi/" },
  ]) {
    test(`${locale.home} empty registry: no theatre, no media continuity, clean vocabulary`, async ({
      page,
    }, testInfo) => {
      // The REAL site (baseURL), not the fixture app: the production registry is
      // empty, so the act must be absent rather than filled with a shell.
      await page.goto(locale.home);

      await expect(page.locator("[data-flagship-theatre]")).toHaveCount(0);
      await expect(
        page.locator('[data-product-continuity="media"]'),
      ).toHaveCount(0);
      annotateAbsent(testInfo, locale.home);

      // No photo slot, app shell or fake product CTA may stand in for it.
      await expect(page.locator("[data-flagship-proof]")).toHaveCount(0);

      const bodyText = await page.locator("body").textContent();
      expect(bodyText ?? "").not.toMatch(BANNED_ASSURANCE);
    });
  }

  test("fixture theatre renders no invented assurance vocabulary", async ({
    page,
  }) => {
    const server = await startFixtureServer();
    try {
      await page.goto(`${server.origin}/product-acts/`);
      const theatre = page.locator("[data-flagship-theatre]");
      await expect(theatre).toHaveCount(1);
      const text = (await theatre.textContent()) ?? "";
      // The act's copy comes only from the record plus canonical labels.
      expect(text).not.toMatch(BANNED_ASSURANCE);
      expect(text).toContain("In development");
    } finally {
      await server.close();
    }
  });
});
