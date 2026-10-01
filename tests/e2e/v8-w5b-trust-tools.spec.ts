import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * v8 W5b - dossier (printable summary), decision room (compare claims),
 * architecture (how this site is built), evidence pages and collections.
 */
const CLAIM = "security-reporting-is-private";

test.describe("printable summary: Present exists only with a selection", () => {
  test("no present control and no deck at 0 selections; both follow the selection", async ({
    page,
  }) => {
    await page.goto("/en/dossier/");
    const present = page.locator("[data-dossier-present]");
    const deck = page.locator("[data-boardroom-deck]");
    await expect(present).toBeHidden();
    await expect(deck).toBeHidden();
    await expect(page.getByRole("button", { name: "Present" })).toHaveCount(0);

    await page.locator(`[data-dossier-item][value="${CLAIM}"]`).click();
    await expect(present).toBeVisible();
    await expect(deck).toBeHidden();
    await present.click();
    await expect(deck).toBeVisible();
    await expect(deck.locator(".c4-boardroom__screen--active")).toHaveCount(1);
    await expect(deck.locator("[data-boardroom-progress-total]")).toHaveText(
      "1",
    );

    // Deselecting while presenting closes the deck: nothing to present.
    await page.locator(`[data-dossier-item][value="${CLAIM}"]`).uncheck();
    await expect(present).toBeHidden();
    await expect(deck).toBeHidden();
  });

  test("a selection restored from the URL shows Present on load", async ({
    page,
  }) => {
    await page.goto(`/en/dossier/?items=${CLAIM}`);
    await expect(page.locator("[data-dossier-present]")).toBeVisible();
    await expect(page.locator("[data-boardroom-deck]")).toBeHidden();
  });

  test("every item is listed once and the old duplicate blocks are gone", async ({
    page,
  }) => {
    await page.goto("/en/dossier/");
    await expect(page.locator("[data-dossier-sources]")).toHaveCount(0);
    const labels = await page
      .locator(".c4-dossier__item-label")
      .allInnerTexts();
    expect(new Set(labels).size).toBe(labels.length);
    await expect(page.locator("main h1")).toHaveText("Printable summary");
  });

  test("checkboxes are 20px with a 44px hit area", async ({ page }) => {
    await page.goto("/en/dossier/");
    const box = await page.locator("[data-dossier-item]").first().boundingBox();
    expect(Math.round(box!.width)).toBe(20);
    const label = await page
      .locator(".c4-dossier__label")
      .first()
      .boundingBox();
    expect(label!.height).toBeGreaterThanOrEqual(44);
  });

  test("composer left, preview right from 1024px", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en/dossier/");
    const form = await page.locator("[data-dossier-form]").boundingBox();
    const preview = await page.locator(".c4-dossier__aside").boundingBox();
    expect(preview!.x).toBeGreaterThan(form!.x + form!.width - 1);
  });
});

test.describe("compare claims", () => {
  test("empty board is one line and adding 4 items shifts nothing (CLS <= 0.02)", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "layout-shift is Chromium-only");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Count every shift, including those right after input.
          (window as unknown as { __cls: number }).__cls += (
            entry as unknown as { value: number }
          ).value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/en/decision-room/");
    await page.waitForLoadState("networkidle");
    const tray = page.locator("[data-decision-tray]");
    const empty = await tray.boundingBox();
    expect(empty!.height, "empty board must be one line").toBeLessThan(48);
    await expect(
      page.getByText("Nothing selected yet. Choose up to four items."),
    ).toBeVisible();

    const before = await page.evaluate(
      () => (window as unknown as { __cls: number }).__cls,
    );
    const adds = page.locator("[data-decision-add]");
    // dispatchEvent keeps the page scrolled to the top: scroll anchoring
    // would otherwise hide a shift from the instrument.
    for (let i = 0; i < 4; i += 1) await adds.nth(i).dispatchEvent("click");
    await page.waitForTimeout(600);
    const after = await page.evaluate(
      () => (window as unknown as { __cls: number }).__cls,
    );
    expect(
      after - before,
      "CLS added by selecting 4 items",
    ).toBeLessThanOrEqual(0.02);

    // Positive control: the instrument must see a real shift (so a passing
    // result above is not a silent measurement failure).
    await page.evaluate(() => {
      const spacer = document.createElement("div");
      spacer.style.height = "400px";
      document.querySelector("main")!.prepend(spacer);
    });
    await page.waitForTimeout(400);
    const controlled = await page.evaluate(
      () => (window as unknown as { __cls: number }).__cls,
    );
    expect(
      controlled - after,
      "instrument sees an injected shift",
    ).toBeGreaterThan(0.02);
  });

  test("no card carries an include checkbox; one board action adds the selection to the summary", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    await expect(page.locator("[data-atelier-item-select]")).toHaveCount(0);
    await expect(page.getByText("Include in a dossier")).toHaveCount(0);
    const link = page.locator("[data-atelier-handoff-link]");
    await expect(link).toBeHidden();
    await page
      .locator('[data-decision-add="claim:security-reporting-is-private"]')
      .click();
    await expect(link).toBeVisible();
    await expect(link).toHaveText("Add selection to summary");
    await expect(
      page.getByRole("link", { name: "Add selection to summary" }),
    ).toHaveCount(1);
    await expect(link).toHaveAttribute(
      "href",
      new RegExp(`/en/dossier/\\?items=${CLAIM}`),
    );
  });
});

test.describe("how this site is built", () => {
  test("each part title appears once outside details, within the word and height budget", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en/architecture/");
    const result = await page.evaluate(() => {
      const main = document.querySelector("main") as HTMLElement;
      const words = main.innerText.split(/\s+/).filter(Boolean).length;
      const outside = [
        ...main.querySelectorAll(
          ".c4-salon__chip, .c4-salon__node-label, .c4-salon__system-label",
        ),
      ]
        .filter((n) => !n.closest("details"))
        .map((n) => (n.textContent ?? "").trim());
      return { words, outside, height: document.documentElement.scrollHeight };
    });
    const counts = new Map<string, number>();
    for (const t of result.outside) counts.set(t, (counts.get(t) ?? 0) + 1);
    for (const [title, n] of counts) {
      expect(
        n,
        `"${title}" appears ${n} times outside <details>`,
      ).toBeLessThanOrEqual(1);
    }
    expect(result.outside.length).toBeGreaterThan(0);
    expect(result.words).toBeLessThanOrEqual(250);
    expect(result.height).toBeLessThanOrEqual(2200);
  });

  test("lens disclosures are closed by default and open from a link", async ({
    page,
  }) => {
    await page.goto("/en/architecture/");
    const lenses = page.locator("details[data-architecture-lens]");
    await expect(lenses).toHaveCount(5);
    for (const open of await lenses.evaluateAll((n) =>
      n.map((d) => (d as HTMLDetailsElement).open),
    )) {
      expect(open).toBe(false);
    }
    await page.goto("/en/architecture/#lens-recovery");
    await expect(
      page.locator('details[data-architecture-lens="recovery"]'),
    ).toHaveJSProperty("open", true);
  });
});

test.describe("evidence pages", () => {
  for (const id of [
    "security-reporting-is-private",
    "privacy-no-tracking-on-this-site",
    "registry-publishes-only-proven-products",
  ]) {
    test(`axe finds 0 violations (incl. heading-order) on /en/evidence/${id}/`, async ({
      page,
    }) => {
      await page.goto(`/en/evidence/${id}/`);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
      const levels = await page
        .locator("main h1, main h2, main h3")
        .evaluateAll((n) => n.map((h) => Number(h.tagName.slice(1))));
      expect(levels[0]).toBe(1);
      for (let i = 1; i < levels.length; i += 1) {
        expect(levels[i]! - levels[i - 1]!).toBeLessThanOrEqual(1);
      }
    });
  }
});

test.describe("collections", () => {
  for (const lang of ["en", "vi", "zh", "zh-hant"]) {
    test(`/${lang}/editions/trust-foundations/ has a BreadcrumbList`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/editions/trust-foundations/`);
      const blocks = await page
        .locator('script[type="application/ld+json"]')
        .allTextContents();
      const crumbs = blocks
        .map((b) => JSON.parse(b))
        .find((j) => j["@type"] === "BreadcrumbList");
      expect(crumbs).toBeTruthy();
      expect(crumbs.itemListElement).toHaveLength(3);
      expect(crumbs.itemListElement[1].item).toContain(`/${lang}/editions/`);
      expect(crumbs.itemListElement[2].item).toContain(
        `/${lang}/editions/trust-foundations/`,
      );
    });
  }
});
