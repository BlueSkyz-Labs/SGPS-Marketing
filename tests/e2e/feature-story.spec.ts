import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * v12 S1 Feature Story, measured in the rendered pages.
 *
 * - Chapters render in the registry order, each a section named by its heading.
 * - Without JS (CSS only) and under reduced motion the story is a plain
 *   vertical sequence: every chapter shows its own screen, fully opaque.
 * - Where the sticky stage runs, the stage is never empty and every chapter's
 *   screen takes the stage in order.
 * - No horizontal overflow; axe (WCAG 2.2 AA) clean in light and dark.
 * The pure predicates are proven to fail on a broken input first.
 */
const CHAPTERS = ["today", "utilities", "collect", "rooms", "candlelight"];
const HEADINGS: Record<string, string[]> = {
  en: ["Today", "Meter readings", "Collect rent", "Rooms", "Night mode"],
  vi: ["Hôm nay", "Điện nước", "Thu tiền", "Phòng", "Chế độ ban đêm"],
};

/** Stage samples: opacities of the stacked screens at successive scroll steps. */
export const stageNeverEmpty = (samples: number[][]) =>
  samples.length > 0 &&
  samples.every((ops) => ops.reduce((sum, o) => sum + o, 0) >= 0.99);
/** Index of the first sample where each screen is fully on stage, in order. */
export const takesStageInOrder = (samples: number[][], count: number) => {
  const firsts = Array.from({ length: count }, (_, i) =>
    samples.findIndex((ops) => (ops[i] ?? 0) >= 0.99),
  );
  return (
    firsts.every((index) => index >= 0) &&
    firsts.every((index, i) => i === 0 || index > firsts[i - 1]!)
  );
};
export const noOverflow = (scrollWidth: number, clientWidth: number) =>
  scrollWidth <= clientWidth;

test("negative proof: the stage and overflow predicates can fail", () => {
  expect(
    stageNeverEmpty([
      [1, 0],
      [0.4, 0.3],
    ]),
  ).toBe(false);
  expect(stageNeverEmpty([])).toBe(false);
  expect(
    takesStageInOrder(
      [
        [1, 0],
        [0, 1],
      ],
      2,
    ),
  ).toBe(true);
  expect(
    takesStageInOrder(
      [
        [0, 1],
        [1, 0],
      ],
      2,
    ),
  ).toBe(false);
  expect(takesStageInOrder([[1, 0]], 2)).toBe(false);
  expect(noOverflow(1441, 1440)).toBe(false);
});

/** Scroll the story through so content-visibility renders it. Driven from
 * the test side (synchronous page calls only) so it also works with page
 * JavaScript disabled, where timers do not run. */
async function renderStory(page: Page) {
  const { top, height } = await page
    .locator("[data-feature-story]")
    .evaluate((el) => ({
      top: el.getBoundingClientRect().top + window.scrollY,
      height: (el as HTMLElement).offsetHeight,
    }));
  for (let y = top - 900; y < top + height + 900; y += 400) {
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await page.waitForTimeout(30);
  }
}

for (const lang of ["en", "vi"]) {
  test(`${lang}: chapters follow the registry order, each named by its heading`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/products/sotro/`);
    const chapters = page.locator("[data-story-chapter]");
    await expect(chapters).toHaveCount(CHAPTERS.length);
    for (const [index, id] of CHAPTERS.entries()) {
      const section = chapters.nth(index);
      await expect(section).toHaveAttribute("data-story-chapter", id);
      await expect(
        page.getByRole("region", { name: HEADINGS[lang]![index]! }).first(),
      ).toHaveAttribute("data-story-chapter", id);
      await expect(section.locator("h3")).toHaveText(HEADINGS[lang]![index]!);
      await expect(section.locator("img")).toHaveCount(1);
    }
    await expect(page.locator("[data-story-coda] h3")).toHaveCount(1);
    // Facts come from the record: Today, Meter readings and Collect rent
    // carry one; Rooms and Night mode none.
    await expect(page.locator("[data-story-fact]")).toHaveCount(3);
  });
}

export const allUnique = (names: string[]) =>
  names.length > 0 &&
  names.every((name) => name.trim().length > 0) &&
  new Set(names).size === names.length;

test("negative proof: duplicate section names are caught", () => {
  expect(allUnique(["Thu tiền", "Thu tiền"])).toBe(false);
  expect(allUnique([""])).toBe(false);
  expect(allUnique(["Thu tiền", "Trên máy tính của chủ trọ: Thu tiền"])).toBe(
    true,
  );
});

for (const lang of ["en", "vi", "zh", "zh-hant"]) {
  test(`${lang}: chapter and coda sections have unique accessible names`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/products/sotro/`);
    const sections = page.locator("[data-story-chapter], [data-story-coda]");
    await expect(sections).toHaveCount(CHAPTERS.length + 1);
    const names = await sections.evaluateAll((els) =>
      els.map((el) => {
        const ids = (el.getAttribute("aria-labelledby") ?? "").split(/\s+/);
        return ids
          .map((id) => document.getElementById(id)?.textContent ?? "")
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
      }),
    );
    expect(allUnique(names), JSON.stringify(names)).toBe(true);
    const headings = await page
      .locator("[data-feature-story] h3")
      .evaluateAll((els) =>
        els.map((el) => (el.textContent ?? "").replace(/\s+/g, " ").trim()),
      );
    expect(allUnique(headings), JSON.stringify(headings)).toBe(true);
  });
}

/** Each chapter's screen is opaque and sits within its own chapter, in order. */
async function sequenceProblems(page: Page) {
  return page.evaluate(() => {
    const problems: string[] = [];
    let lastBottom = -Infinity;
    for (const section of document.querySelectorAll("[data-story-chapter]")) {
      const heading = section.querySelector("h3")!.getBoundingClientRect();
      const img = section.querySelector("img")!;
      const box = img.getBoundingClientRect();
      const opacity = Number(
        getComputedStyle(section.querySelector("figure")!).opacity,
      );
      if (opacity < 0.99) problems.push(`${section.id || "chapter"} faded`);
      if (box.height < 100) problems.push("screen not laid out");
      if (heading.top < lastBottom - 1) problems.push("chapters overlap");
      lastBottom = Math.max(box.bottom, heading.bottom);
      if (
        getComputedStyle(section.querySelector("figure")!).position === "sticky"
      )
        problems.push("stage engaged");
    }
    return problems;
  });
}

for (const width of [390, 1440]) {
  test(`no JS, reduced motion, ${width}: the story is a readable sequence`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      reducedMotion: "reduce",
      viewport: { width, height: 900 },
    });
    const page = await context.newPage();
    await page.goto("/vi/products/sotro/");
    await renderStory(page);
    expect(await sequenceProblems(page)).toEqual([]);
    await context.close();
  });
}

test("no JS, 390, motion allowed: phones keep the vertical sequence", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/vi/products/sotro/");
  await renderStory(page);
  // The rise has finished once each chapter has scrolled past.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  expect(await sequenceProblems(page)).toEqual([]);
  await context.close();
});

test("reduced motion at 1440 shows the final state: every screen opaque, no stage", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/products/sotro/");
  await renderStory(page);
  expect(await sequenceProblems(page)).toEqual([]);
  const animated = await page
    .locator("[data-feature-story] *")
    .evaluateAll(
      (els) =>
        els.filter((el) => getComputedStyle(el).animationName !== "none")
          .length,
    );
  expect(animated).toBe(0);
});

test("1440, motion allowed: the sticky stage is never empty and each screen takes it in order", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/vi/products/sotro/");
  const engaged = await page
    .locator("[data-story-screen]")
    .first()
    .evaluate((el) => getComputedStyle(el).position === "sticky");
  test.skip(!engaged, "engine without scroll-driven animations: sequence only");
  const samples = await page.evaluate(async () => {
    const grid = document.querySelector<HTMLElement>(".story__chapters")!;
    grid.scrollIntoView();
    const top = grid.getBoundingClientRect().top + scrollY;
    const out: number[][] = [];
    for (
      let y = top - 200;
      y < top + grid.offsetHeight - innerHeight;
      y += 50
    ) {
      window.scrollTo(0, y);
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r)),
      );
      out.push(
        [...grid.querySelectorAll<HTMLElement>(".story__screen")].map((el) =>
          Number(getComputedStyle(el).opacity),
        ),
      );
    }
    return out;
  });
  expect(stageNeverEmpty(samples), JSON.stringify(samples)).toBe(true);
  expect(takesStageInOrder(samples, CHAPTERS.length)).toBe(true);
});

for (const route of ["/vi/products/sotro/", "/vi/", "/en/"]) {
  for (const width of [320, 390, 768, 1024, 1440]) {
    test(`${route} ${width}: no horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      if (route.includes("products")) await renderStory(page);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(noOverflow(scrollWidth, clientWidth), `${scrollWidth}`).toBe(true);
    });
  }
}

for (const route of [
  "/vi/products/sotro/",
  "/en/products/sotro/",
  "/zh/products/sotro/",
  "/zh-hant/products/sotro/",
]) {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`axe ${colorScheme} ${route} with the story rendered`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      await page.goto(route, { waitUntil: "networkidle" });
      await renderStory(page);
      const results = await new AxeBuilder({ page })
        .include("[data-product-showcase]")
        .withTags([
          "wcag2a",
          "wcag2aa",
          "wcag21a",
          "wcag21aa",
          "wcag22a",
          "wcag22aa",
        ])
        .analyze();
      expect(
        results.violations.map((v) => `${v.id} (${v.nodes.length})`),
      ).toEqual([]);
    });
  }
}
