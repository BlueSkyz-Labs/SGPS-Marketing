import { expect, test } from "@playwright/test";

const LANGS = ["en", "vi", "zh", "zh-hant"] as const;
const LENSES = ["system", "data", "trust", "recovery", "evidence"];

test.describe("C4-D architecture salon", () => {
  test("all five lenses are disclosures, closed by default, opened by their summary", async ({
    page,
  }) => {
    await page.goto("/en/architecture/");
    const salon = page.locator("[data-architecture-salon]");
    await expect(salon).toBeVisible();

    for (const lens of LENSES) {
      const section = salon.locator(
        `details[data-architecture-lens="${lens}"]`,
      );
      await expect(section).toHaveCount(1);
      await expect(section).not.toHaveAttribute("open", /.*/);
      await expect(section.locator("summary")).toBeVisible();
    }

    // the one diagram is always visible; lens detail opens on demand
    await expect(
      salon.locator("[data-architecture-diagram] [data-diagram-node]").first(),
    ).toBeVisible();
    const data = salon.locator('details[data-architecture-lens="data"]');
    await data.locator("summary").click();
    await expect(data).toHaveAttribute("open", "");
    await expect(
      data.locator("[data-architecture-node]").first(),
    ).toBeVisible();
  });

  test("a validated lens parameter focuses that lens and an unknown one changes nothing", async ({
    page,
  }) => {
    await page.goto("/en/architecture/?lens=recovery");
    await expect(
      page.locator('[data-architecture-lens="recovery"]'),
    ).toBeFocused();

    await page.goto("/en/architecture/?lens=not-a-lens");
    // safe default: the whole page is still there, nothing is hidden or broken
    for (const lens of LENSES) {
      await expect(
        page.locator(`[data-architecture-lens="${lens}"]`),
      ).toBeAttached();
    }
    await expect(page.locator("body")).not.toHaveAttribute(
      "data-architecture-lens",
      /.*/,
    );
  });

  test("no information is diagram-only and no canvas or WebGL is used", async ({
    page,
  }) => {
    await page.goto("/en/architecture/");
    // every published node and edge is readable as text
    const textNodes = await page.locator("[data-architecture-node]").count();
    const textEdges = await page.locator("[data-architecture-edge]").count();
    expect(textNodes).toBeGreaterThan(0);
    expect(textEdges).toBeGreaterThan(0);
    // the connection diagram is made of labeled text, not an image
    expect(
      await page
        .locator("[data-architecture-diagram] svg, svg.c4-salon__diagram")
        .count(),
    ).toBe(0);
    expect(await page.locator("canvas").count()).toBe(0);
    const html = await page.content();
    expect(html.toLowerCase()).not.toContain("webgl");
  });

  test("reading order stays meaningful and keyboard reaches every lens link", async ({
    page,
  }) => {
    await page.goto("/en/architecture/");
    const order = await page
      .locator("[data-architecture-lens]")
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("data-architecture-lens")),
      );
    expect(order).toEqual(LENSES);

    const reachable = await page.evaluate(() =>
      [...document.querySelectorAll(".c4-salon__lens-summary")].every(
        (summary) => (summary as HTMLElement).tabIndex >= 0,
      ),
    );
    expect(reachable).toBe(true);
  });

  for (const lang of LANGS) {
    test(`/${lang}/architecture/ is complete without JavaScript`, async ({
      request,
    }) => {
      const html = await (await request.get(`/${lang}/architecture/`)).text();
      expect(html).toContain("data-architecture-salon");
      for (const lens of LENSES) {
        expect(html).toContain(`data-architecture-lens="${lens}"`);
      }
      expect(html).toContain("data-architecture-node=");
      expect(html).toContain(`id="lens-${LENSES[0]}"`);
    });
  }

  test("no lens leaks internal topology", async ({ page }) => {
    await page.goto("/en/architecture/");
    // scope to the salon: the site shell legitimately links its own public repo
    const html = await page.locator("[data-architecture-salon]").innerHTML();
    for (const leak of [
      "BlueSkyz-Labs/SGPS-Marketing",
      "sourceEvidence",
      "Quality Gates",
      "revision",
    ]) {
      expect(html, `must not leak ${leak}`).not.toContain(leak);
    }
    expect(html).not.toMatch(/\b[0-9a-f]{40}\b/);
    expect(html).not.toMatch(/\bsrc\//);
  });

  test("the salon stays inside 320px, 390px and 1440px", async ({ page }) => {
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/en/architecture/");
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, `no sideways scroll at ${width}`).toBeLessThanOrEqual(1);
    }
  });
});

/**
 * Explainer contract (V7-D-02 / V7-A-04). The checkers run inside the page so
 * the same function can be pointed at deliberately broken markup (negative
 * proof) and must report a violation there.
 */
const KEBAB = "^[a-z0-9]+(-[a-z0-9]+){1,}$";

async function installCheckers(page: import("@playwright/test").Page) {
  await page.evaluate((kebab) => {
    const re = new RegExp(kebab);
    const visibleLeaves = () =>
      [...document.body.querySelectorAll<HTMLElement>("*")].filter((el) => {
        if (el.closest("[data-architecture-technical]")) return false;
        if (["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"].includes(el.tagName))
          return false;
        if (!el.checkVisibility()) return false;
        return [...el.childNodes].some(
          (n) => n.nodeType === 3 && (n.textContent ?? "").trim() !== "",
        );
      });
    const own = (el: HTMLElement) =>
      [...el.childNodes]
        .filter((n) => n.nodeType === 3)
        .map((n) => (n.textContent ?? "").trim())
        .join(" ")
        .trim();
    (window as unknown as Record<string, unknown>).__arch = {
      slugs: () =>
        visibleLeaves()
          .map(own)
          .filter((t) => re.test(t)),
      sgps: () => visibleLeaves().map(own).join(" ").split(/sgps/i).length - 1,
      unlabeled: () =>
        [
          ...document.querySelectorAll<HTMLElement>("[data-diagram-node]"),
        ].filter((el) => !el.checkVisibility() || !el.textContent?.trim())
          .length,
    };
  }, KEBAB);
}

type Checkers = { slugs(): string[]; sgps(): number; unlabeled(): number };
const run = <T>(
  page: import("@playwright/test").Page,
  fn: (c: Checkers) => T,
) => page.evaluate(`(${fn.toString()})(window.__arch)`) as Promise<T>;

for (const lang of LANGS) {
  test.describe(`/${lang}/architecture/ plain-language contract`, () => {
    test("no visible kebab-case slug outside the technical-names disclosure", async ({
      page,
    }) => {
      await page.goto(`/${lang}/architecture/`);
      await installCheckers(page);
      expect(await run(page, (c) => c.slugs())).toEqual([]);

      // the slugs are still there for verifiers, inside the closed disclosure
      const details = page.locator("[data-architecture-technical]");
      expect(await details.count()).toBeGreaterThan(0);
      await expect(details.first()).not.toHaveAttribute("open", /.*/);
      expect(
        await details.first().evaluate((el) => el.textContent ?? ""),
      ).toContain("system.sgps-marketing");

      // negative proof: a visible slug is caught
      await page.evaluate(() => {
        const p = document.createElement("p");
        p.id = "neg-slug";
        p.textContent = "github-actions-read-only";
        document.querySelector("[data-architecture-salon]")!.append(p);
      });
      expect(await run(page, (c) => c.slugs())).toEqual([
        "github-actions-read-only",
      ]);
      // ...and the same slug inside the disclosure is exempt
      await page.evaluate(() => {
        const p = document.getElementById("neg-slug")!;
        document.querySelector("[data-architecture-technical]")!.append(p);
        document
          .querySelector("[data-architecture-technical]")!
          .setAttribute("open", "");
      });
      expect(await run(page, (c) => c.slugs())).toEqual([]);
    });

    test("SGPS is visible at most twice", async ({ page }) => {
      await page.goto(`/${lang}/architecture/`);
      await installCheckers(page);
      expect(await run(page, (c) => c.sgps())).toBeLessThanOrEqual(2);

      // negative proof: the counter really counts
      await page.evaluate(() => {
        for (let i = 0; i < 3; i += 1) {
          const p = document.createElement("p");
          p.textContent = "SGPS";
          document.querySelector("[data-architecture-salon]")!.append(p);
        }
      });
      expect(await run(page, (c) => c.sgps())).toBeGreaterThan(2);
    });

    test("every diagram node has a visible label", async ({ page }) => {
      await page.goto(`/${lang}/architecture/`);
      await installCheckers(page);
      expect(await page.locator("[data-diagram-node]").count()).toBeGreaterThan(
        0,
      );
      expect(await run(page, (c) => c.unlabeled())).toBe(0);

      // negative proof: an empty node is caught
      await page.evaluate(() => {
        const span = document.createElement("span");
        span.setAttribute("data-diagram-node", "");
        document.querySelector("[data-architecture-diagram]")!.append(span);
      });
      expect(await run(page, (c) => c.unlabeled())).toBe(1);
    });
  });
}

test("all four locales render the same number of sections", async ({
  request,
}) => {
  const counts: number[] = [];
  for (const lang of LANGS) {
    const html = await (await request.get(`/${lang}/architecture/`)).text();
    counts.push((html.match(/data-architecture-lens="/g) ?? []).length);
  }
  expect(counts[0]).toBe(LENSES.length);
  expect(new Set(counts).size).toBe(1);
  // negative proof: a locale missing a section would make the set differ
  expect(new Set([...counts.slice(0, 3), counts[3]! - 1]).size).toBe(2);
});
