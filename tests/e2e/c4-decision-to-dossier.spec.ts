import { expect, test } from "@playwright/test";

/**
 * C4-E Task 5 — Decision Room to dossier handoff.
 *
 * The visitor's own ticks are the only input: nothing is selected for them,
 * nothing is remembered, and the destination is an ordinary same-origin link.
 */
test.describe("C4-E decision to dossier handoff", () => {
  test("nothing is selected on load and there is no destination yet", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    const boxes = page.locator("[data-atelier-item-select]");
    expect(await boxes.count()).toBeGreaterThan(0);
    await expect(
      page.locator("[data-atelier-item-select]:checked"),
    ).toHaveCount(0);
    await expect(page.locator("[data-atelier-handoff-link]")).toBeHidden();
    await expect(page.locator("[data-atelier-handoff-empty]")).toBeVisible();
  });

  test("only the items the visitor ticks appear in the destination", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    const first = page.locator("[data-atelier-item-select]").first();
    const id = await first.getAttribute("value");
    await first.check();

    const link = page.locator("[data-atelier-handoff-link]");
    await expect(link).toBeVisible();
    const href = (await link.getAttribute("href")) ?? "";
    expect(href).toContain("items=");
    const carried =
      new URLSearchParams(href.split("?")[1]).get("items")?.split(",") ?? [];
    expect(carried).toEqual([(id ?? "").replace(/^claim:/, "")]);
    await expect(page.locator("[data-atelier-handoff-empty]")).toBeHidden();
    // and it is an ordinary same-origin link
    expect(href.startsWith("/en/dossier/?")).toBe(true);
  });

  test("unticking removes the item and the destination disappears again", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    const first = page.locator("[data-atelier-item-select]").first();
    await first.check();
    await expect(page.locator("[data-atelier-handoff-link]")).toBeVisible();
    await first.uncheck();
    await expect(page.locator("[data-atelier-handoff-link]")).toBeHidden();
    await expect(page.locator("[data-atelier-handoff-empty]")).toBeVisible();
  });

  test("ticking does not navigate and nothing survives a reload", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    const before = page.url();
    await page.locator("[data-atelier-item-select]").first().check();
    expect(page.url()).toBe(before);

    await page.reload();
    await expect(
      page.locator("[data-atelier-item-select]:checked"),
    ).toHaveCount(0);
    await expect(page.locator("[data-atelier-handoff-link]")).toBeHidden();
  });

  test("the destination follows catalog order, not the order they were ticked", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    const boxes = page.locator("[data-atelier-item-select]");
    const total = await boxes.count();
    test.skip(total < 2, "needs at least two composable claims");
    await boxes.nth(1).check();
    await boxes.nth(0).check();
    const href =
      (await page
        .locator("[data-atelier-handoff-link]")
        .getAttribute("href")) ?? "";
    const carried =
      new URLSearchParams(href.split("?")[1]).get("items")?.split(",") ?? [];
    expect(carried.length).toBe(2);
    // catalog order: the first item in source order comes first in the link
    const values = await boxes.evaluateAll((nodes) =>
      nodes.map((node) =>
        (node as HTMLInputElement).value.replace(/^claim:/, ""),
      ),
    );
    expect(carried).toEqual(values.filter((value) => carried.includes(value)));
  });

  test("the include control is labelled and meets the touch target minimum", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    const label = page.locator(".decision-room__select").first();
    const box = await label.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(43.999);
    // the control is a real label wrapping the input, so it is named by its text
    const text = (await label.textContent())?.trim() ?? "";
    expect(text.length).toBeGreaterThan(0);
  });

  test("the handoff copy is localized", async ({ page }) => {
    const texts: Record<string, string> = {};
    for (const lang of ["en", "vi", "zh"]) {
      await page.goto(`/${lang}/decision-room/`);
      texts[lang] =
        (await page.locator("[data-atelier-handoff-empty]").textContent()) ??
        "";
    }
    expect(new Set(Object.values(texts)).size).toBe(3);
  });
});
