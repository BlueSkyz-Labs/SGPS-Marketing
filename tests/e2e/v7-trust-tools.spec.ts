import { expect, test } from "@playwright/test";

/**
 * v7 W2 - trust tools: dossier, security components, decision room.
 * B-04 B-05 A-03 B-06 B-07 B-08 B-09 B-10 B-11 D-10.
 */
const CLAIM = "security-reporting-is-private";
const EVIDENCE = "ev-security-advisory";
const ROOM = "[data-decision-room]";

test.describe("v7 dossier and security components use the authored scale", () => {
  test("headings are not browser-default 40px/400 (A-03)", async ({ page }) => {
    for (const path of ["/en/dossier/", "/en/verify/"]) {
      await page.goto(path);
      const sizes = await page
        .locator("main h2, main h3")
        .evaluateAll((nodes) =>
          nodes
            .filter((n) => (n as HTMLElement).offsetParent !== null)
            .map((n) => {
              const cs = getComputedStyle(n);
              return {
                text: (n.textContent ?? "").trim().slice(0, 40),
                size: parseFloat(cs.fontSize),
                weight: Number(cs.fontWeight),
              };
            }),
        );
      expect(sizes.length).toBeGreaterThan(0);
      for (const h of sizes) {
        // Negative proof baked in: the defect was exactly 40px at weight 400.
        expect(h.size, `${path} "${h.text}"`).toBeLessThanOrEqual(30);
        expect(h.weight, `${path} "${h.text}"`).toBeGreaterThanOrEqual(500);
      }
    }
  });

  test("dossier: no duplicate labels, no error heading by default (B-04, B-05)", async ({
    page,
  }) => {
    await page.goto("/en/dossier/");
    await expect(page.locator(".c4-dossier__unknown-heading")).toBeHidden();
    const dupes = await page.locator(".c4-dossier__item").evaluateAll(
      (nodes) =>
        nodes.filter((n) => {
          const label = n.querySelector(".c4-dossier__item-label")?.textContent;
          const a = n.querySelector("a");
          return !!a && (a.textContent ?? "").trim() === (label ?? "").trim();
        }).length,
    );
    expect(dupes).toBe(0);
    const box = await page.locator("[data-dossier-item]").first().boundingBox();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(20);
    // Positive control: the heading does appear when an id is unpublished.
    await page.goto(`/en/dossier/?items=${CLAIM},not-published`);
    await expect(page.locator(".c4-dossier__unknown-heading")).toBeVisible();
  });

  test("dossier: selection is written with replaceState and round-trips (B-06)", async ({
    page,
  }) => {
    await page.goto("/en/dossier/");
    const history = await page.evaluate(() => history.length);
    await page.locator(`[data-dossier-item][value="${CLAIM}"]`).click();
    await page.locator(`[data-dossier-item][value="${EVIDENCE}"]`).click();
    const items = new URL(page.url()).searchParams.get("items");
    expect(items?.split(",").sort()).toEqual([CLAIM, EVIDENCE].sort());
    expect(await page.evaluate(() => history.length)).toBe(history);
    await page.reload();
    await expect(page.locator("[data-dossier-counter]")).toHaveText("2");
    await page.locator(`[data-dossier-item][value="${CLAIM}"]`).click();
    await page.locator(`[data-dossier-item][value="${EVIDENCE}"]`).click();
    expect(new URL(page.url()).search).toBe("");
  });

  test("dossier: an unpublished id is never written back (#378 bounds)", async ({
    page,
  }) => {
    await page.goto(`/en/dossier/?items=${CLAIM},not-published`);
    await page.locator(`[data-dossier-item][value="${EVIDENCE}"]`).click();
    const items = new URL(page.url()).searchParams.get("items") ?? "";
    expect(items).not.toContain("not-published");
    // an oversized request stays rejected and is not echoed
    const oversized = "x".repeat(3000);
    await page.goto(`/en/dossier/?items=${oversized}`);
    await expect(page.locator("[data-dossier-request-rejected]")).toHaveCount(
      1,
    );
  });
});

test.describe("v7 decision room", () => {
  test("one name: H1 and title are 'Compare claims' in four locales (D-10, v8 dec-1)", async ({
    page,
  }) => {
    for (const [lang, name] of [
      ["en", "Compare claims"],
      ["vi", "So sánh tuyên bố"],
      ["zh", "比较声明"],
      ["zh-hant", "比較聲明"],
    ] as const) {
      await page.goto(`/${lang}/decision-room/`);
      await expect(page).toHaveTitle(new RegExp(name));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);
      const visible = await page
        .locator("main h2, main h3")
        .evaluateAll(
          (nodes, n) =>
            nodes.filter(
              (x) =>
                (x as HTMLElement).offsetParent !== null &&
                (x.textContent ?? "").trim() === n,
            ).length,
          name,
        );
      expect(visible, `${lang} repeats the page name`).toBe(0);
    }
  });

  test("buttons carry the item name, pressed is visible, the 4/4 limit is explained (B-08, B-09)", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    const room = page.locator(ROOM);
    const adds = room.locator("[data-decision-add]");
    const label = await room
      .locator("[data-decision-item]")
      .first()
      .locator(".decision-room__label")
      .innerText();
    await expect(adds.first()).toHaveAttribute(
      "aria-label",
      `Compare: ${label}`,
    );
    await expect(room.locator("[data-decision-limit]")).toBeHidden();
    const before = await adds
      .first()
      .evaluate((n) => getComputedStyle(n, "::before").content);
    await adds.first().click();
    const after = await adds
      .first()
      .evaluate((n) => getComputedStyle(n, "::before").content);
    expect(before).toBe("none");
    expect(after).not.toBe("none");
    await expect(
      room.locator("[data-decision-remove]").filter({ visible: true }).first(),
    ).toHaveAttribute("aria-label", `Remove: ${label}`);
    for (let i = 1; i < 4; i += 1) await adds.nth(i).click();
    await expect(room.locator("[data-decision-limit]")).toBeVisible();
    await expect(adds.nth(4)).toBeDisabled();
    await expect(adds.nth(4)).toHaveAttribute(
      "aria-describedby",
      "decision-room-limit",
    );
    await adds.nth(3).click();
    await expect(room.locator("[data-decision-limit]")).toBeHidden();
    await expect(adds.nth(4)).toBeEnabled();
  });

  test("the comparison is truly side by side at 1024px and up (B-07)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/en/decision-room/");
    const room = page.locator(ROOM);
    const adds = room.locator("[data-decision-add]");
    for (let i = 0; i < 3; i += 1) await adds.nth(i).click();
    const tops = await room
      .locator("[data-decision-row]:not([hidden])")
      .evaluateAll((n) =>
        n.map((x) => Math.round(x.getBoundingClientRect().top)),
      );
    expect(tops).toHaveLength(3);
    expect(new Set(tops).size, "all rows share one top edge").toBe(1);
    const lefts = await room
      .locator("[data-decision-row]:not([hidden])")
      .evaluateAll((n) =>
        n.map((x) => Math.round(x.getBoundingClientRect().left)),
      );
    expect(new Set(lefts).size).toBe(3);
    // Negative proof: below 1024px the same rows stack.
    await page.setViewportSize({ width: 800, height: 900 });
    const stacked = await room
      .locator("[data-decision-row]:not([hidden])")
      .evaluateAll(
        (n) =>
          new Set(n.map((x) => Math.round(x.getBoundingClientRect().top))).size,
      );
    expect(stacked).toBe(3);
  });

  test("no contradicting empty-state while items are compared (B-07)", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    const room = page.locator(ROOM);
    await expect(room.locator("[data-decision-empty-state]")).toBeVisible();
    await room.locator("[data-decision-add]").first().click();
    await expect(room.locator("[data-decision-empty-state]")).toBeHidden();
    // v8: there is one empty message and no second "dossier" empty line
    await expect(room.locator("[data-atelier-handoff-empty]")).toHaveCount(0);
  });

  test("comparison is written to the URL, bounded and allowlisted (B-06)", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    const room = page.locator(ROOM);
    const ids: string[] = [];
    for (let i = 0; i < 2; i += 1) {
      const add = room.locator("[data-decision-add]").nth(i);
      ids.push((await add.getAttribute("data-decision-add")) ?? "");
      await add.click();
    }
    const carried = new URL(page.url()).searchParams.get("compare");
    expect(carried?.split(",")).toEqual(ids);
    await page.reload();
    await expect(room.locator("[data-decision-row]:not([hidden])")).toHaveCount(
      2,
    );
    // Negative proof: unknown ids and anything beyond four are ignored.
    await page.goto(
      "/en/decision-room/?compare=bogus," +
        (
          await room
            .locator("[data-decision-add]")
            .evaluateAll((n) =>
              n.slice(0, 6).map((x) => x.getAttribute("data-decision-add")),
            )
        ).join(","),
    );
    await expect(room.locator("[data-decision-row]:not([hidden])")).toHaveCount(
      4,
    );
  });

  test("adding items does not shift the page on desktop (B-11)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          (window as unknown as { __cls: number }).__cls += (
            e as unknown as { value: number }
          ).value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/en/decision-room/");
    await page.waitForLoadState("networkidle");
    const base = await page.evaluate(
      () => (window as unknown as { __cls: number }).__cls,
    );
    const adds = page.locator(`${ROOM} [data-decision-add]`);
    for (let i = 0; i < 4; i += 1) {
      await adds.nth(i).click();
      await page.waitForTimeout(150);
    }
    const total = await page.evaluate(
      () => (window as unknown as { __cls: number }).__cls,
    );
    expect(total - base).toBeLessThan(0.01);
  });

  test("without JavaScript the tray collapses and sources stay reachable", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/en/decision-room/");
    await expect(page.locator("[data-decision-add]").first()).toBeHidden();
    await expect(page.locator("[data-decision-empty-state]")).toBeVisible();
    const h = await page
      .locator("[data-decision-tray]")
      .evaluate((n) => n.getBoundingClientRect().height);
    expect(h).toBeLessThan(120);
    await context.close();
  });
});
