import { expect, test } from "@playwright/test";

const GOALS = [
  "explore",
  "evaluate",
  "verify",
  "architecture",
  "work-with-blueskyz",
];

test.describe("C4-E decision atelier", () => {
  test("controls are hidden without JavaScript and the baseline room is complete", async ({
    request,
  }) => {
    const html = await (await request.get("/en/decision-room/")).text();
    // the baseline list is complete on its own
    expect(html).toContain("data-decision-item=");
    // and the controls are not offered as dead UI
    expect(html).toMatch(/data-atelier-controls[^>]*hidden/);
  });

  test("controls appear with JavaScript, are named, and can be operated by keyboard", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    const controls = page.locator("[data-atelier-controls]");
    await expect(controls).toBeVisible();
    await expect(controls).toHaveAttribute("data-atelier-ready", "");

    const goal = page.locator("[data-atelier-goal]");
    await expect(goal).toHaveAttribute("id", "atelier-goal");
    await expect(page.locator('label[for="atelier-goal"]')).toHaveCount(1);

    for (const value of GOALS) {
      await expect(goal.locator(`option[value="${value}"]`)).toHaveCount(1);
    }

    // keyboard alone: focus the select, choose a goal, and grouping applies
    await goal.focus();
    await goal.selectOption("verify");
    // every grouped item that is still shown carries its group label
    const visibleBadges = page.locator(
      "[data-decision-items] [data-decision-item]:not([hidden]) [data-atelier-group-label]",
    );
    await expect(visibleBadges.first()).toBeVisible();
    const shown = await page
      .locator("[data-decision-items] [data-decision-item]:not([hidden])")
      .count();
    await expect(visibleBadges).toHaveCount(shown);

    const boxes = page.locator("[data-atelier-constraint]");
    await expect(boxes).toHaveCount(3);
    await boxes.first().focus();
    await page.keyboard.press("Space");
    await expect(boxes.first()).toBeChecked();
  });

  test("grouping follows the declared arrangement and reset restores the baseline", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    const items = page.locator("[data-decision-items] [data-decision-item]");
    const before = await items.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-decision-item")),
    );
    expect(before.length).toBeGreaterThan(0);

    await page.locator("[data-atelier-goal]").selectOption("architecture");
    // architecture only publishes trust signals
    const grouped = page.locator('[data-atelier-group="trust-signals"]');
    await expect(grouped.first()).toBeVisible();
    const kinds = await page
      .locator("[data-decision-items] [data-decision-item]:not([hidden])")
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("data-item-kind")),
      );
    expect(kinds.every((kind) => kind === "trust")).toBe(true);

    await page.locator("[data-atelier-reset]").click();
    const after = await items.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-decision-item")),
    );
    expect(after).toEqual(before);
    await expect(page.locator("[data-atelier-group-label]")).toHaveCount(0);
    await expect(page.locator("[data-atelier-goal]")).toHaveValue("");
    const hidden = await items.evaluateAll(
      (nodes) => nodes.filter((n) => n.hasAttribute("hidden")).length,
    );
    expect(hidden).toBe(0);
  });

  // The "no network" half of this invariant is proven deterministically by the
  // architecture contract, which scans the module for network primitives. Here we
  // prove the observable half: nothing is written and nothing survives a reload.
  // (A request-count assertion is not usable on a machine whose browser has an
  // extension injecting its own traffic into every page.)
  test("nothing is persisted: no storage, no cookies, and nothing survives a reload", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    await page.locator("[data-atelier-goal]").selectOption("evaluate");
    await page.locator("[data-atelier-constraint]").first().check();
    await page.locator("[data-atelier-reset]").click();

    const storage = await page.evaluate(() => ({
      local: window.localStorage.length,
      session: window.sessionStorage.length,
      cookies: document.cookie,
    }));
    expect(storage.local).toBe(0);
    expect(storage.session).toBe(0);
    expect(storage.cookies).toBe("");

    // reload: the arrangement must not have survived
    await page.reload();
    await expect(page.locator("[data-atelier-goal]")).toHaveValue("");
  });

  test("URL state is allowlisted and a crafted value changes nothing", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/?goal=verify&constraint=trust");
    await expect(page.locator("[data-atelier-goal]")).toHaveValue("verify");
    await expect(
      page.locator('[data-atelier-constraint="trust"]'),
    ).toBeChecked();

    await page.goto("/en/decision-room/?goal=best-product&constraint=<script>");
    await expect(page.locator("[data-atelier-goal]")).toHaveValue("");
    for (const box of await page.locator("[data-atelier-constraint]").all()) {
      await expect(box).not.toBeChecked();
    }
    await expect(page.locator("[data-atelier-group-label]")).toHaveCount(0);
  });

  test("controls respect touch targets and forced colours", async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/en/decision-room/");
    const heights = await page
      .locator(
        "[data-atelier-goal], [data-atelier-reset], .decision-room__atelier-check",
      )
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getBoundingClientRect().height),
      );
    expect(heights.length).toBeGreaterThan(0);
    for (const height of heights) {
      expect(height).toBeGreaterThanOrEqual(44 - 0.001);
    }
    await expect(page.locator("[data-atelier-controls]")).toBeVisible();
  });

  test("the comparison ceiling is unchanged by the atelier", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    const room = page.locator("[data-decision-room]");
    await expect(room).toHaveAttribute("data-max", "4");
    const buttons = page.locator("[data-decision-add]");
    const count = await buttons.count();
    // adding is still bounded by the existing ceiling, not by the new controls
    const max = Number((await room.getAttribute("data-max")) ?? "4");
    for (let i = 0; i < Math.min(count, max); i += 1) {
      await buttons.nth(i).click();
    }
    const pressed = await buttons.evaluateAll(
      (nodes) =>
        nodes.filter((node) => node.getAttribute("aria-pressed") === "true")
          .length,
    );
    expect(pressed).toBe(4);
  });
});

test.describe("C4-E atelier reasons", () => {
  const BANNED = [
    "best",
    "score",
    "rank",
    "recommend",
    "certified",
    "audited",
    "guaranteed",
    "compliant",
    "superior",
  ];

  test("every shown grouped item explains the dimension that matched", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    await page.locator("[data-atelier-goal]").selectOption("evaluate");

    const shown = page.locator(
      "[data-decision-items] [data-decision-item]:not([hidden])",
    );
    const reasons = page.locator(
      "[data-decision-items] [data-decision-item]:not([hidden]) [data-atelier-reason-text]",
    );
    await expect(reasons.first()).toBeVisible();
    // an item can match more than one group but still explains itself once
    await expect(reasons).toHaveCount(await shown.count());

    const texts = await reasons.evaluateAll((nodes) =>
      nodes.map((node) => (node.textContent ?? "").trim()),
    );
    for (const text of texts) {
      expect(text.length).toBeGreaterThan(0);
      for (const word of BANNED) {
        expect(
          text.toLowerCase(),
          `reason must not claim "${word}"`,
        ).not.toContain(word);
      }
    }
  });

  test("reasons are localized and reset removes them", async ({ page }) => {
    const texts: Record<string, string> = {};
    for (const lang of ["en", "vi", "zh"]) {
      await page.goto(`/${lang}/decision-room/`);
      await page.locator("[data-atelier-goal]").selectOption("verify");
      const first = page.locator("[data-atelier-reason-text]").first();
      await expect(first).toBeVisible();
      texts[lang] = (await first.textContent()) ?? "";
      await page.locator("[data-atelier-reset]").click();
      await expect(page.locator("[data-atelier-reason-text]")).toHaveCount(0);
    }
    expect(new Set(Object.values(texts)).size).toBe(3);
  });

  test("a reason states the matching dimension, not the item's merits", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    // the same goal always yields the same reason key, whatever the items are
    await page.locator("[data-atelier-goal]").selectOption("architecture");
    const keys = await page
      .locator(
        "[data-decision-items] [data-decision-item]:not([hidden]) [data-atelier-reason-text]",
      )
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("data-atelier-reason-text")),
      );
    expect(new Set(keys).size).toBe(1);
    expect(keys[0]).toBe("trust-surface");
  });

  test("reason templates are not published as page content", async ({
    request,
  }) => {
    const html = await (await request.get("/en/decision-room/")).text();
    expect(html).toContain("data-atelier-reason=");
    // templates are inert until the visitor opts into a goal
    expect(html).not.toMatch(/<p[^>]*data-atelier-reason-text/);
  });
});
