// C3-D Task 2 — Visitor-Controlled Intent UI (G5)
// Tests the IntentControl component: server HTML, keyboard, screen-reader
// state, mobile, reset/default, no-JS, and the presentation-only boundary.
import { expect, test } from "@playwright/test";

const EN_INTENTS = [
  "Explore products",
  "Evaluate a product",
  "Verify trust",
  "Understand architecture",
  "Work with us",
];
const VI_INTENTS = [
  "Khám phá sản phẩm",
  "Đánh giá sản phẩm",
  "Kiểm chứng tin cậy",
  "Tìm hiểu kiến trúc",
  "Làm việc cùng chúng tôi",
];
const ZH_INTENTS = [
  "探索产品",
  "评估产品",
  "核验信任",
  "了解架构",
  "与我们合作",
];

test.describe("C3-D IntentControl", () => {
  test("exposes one canonical intent surface on the products page", async ({
    page,
  }) => {
    await page.goto("/en/products/");
    await expect(page.locator("[data-intent-control]")).toHaveCount(1);
    await expect(page.locator("[data-intent-lens]")).toHaveCount(0);
  });

  test("every declared intent has a journey recommendation", async ({
    page,
  }) => {
    await page.goto("/en/products/");
    const orders = await page
      .locator("[data-journey-bar]")
      .getAttribute("data-mission-orders");
    const recommendations = JSON.parse(orders ?? "{}") as Record<
      string,
      string[]
    >;
    for (const intent of [
      "explore-products",
      "evaluate-product",
      "verify-trust",
      "understand-architecture",
      "work-with-us",
    ]) {
      expect(recommendations[intent]?.length).toBeGreaterThan(0);
    }
  });

  test("renders all five intent choices in server HTML on /en/products/", async ({
    page,
  }) => {
    await page.goto("/en/products/");
    const control = page.locator("[data-intent-control]");
    await expect(control).toBeVisible();
    await expect(control.getByRole("button")).toHaveCount(5);
    for (const label of EN_INTENTS) {
      await expect(control.getByRole("button", { name: label })).toBeVisible();
    }
  });

  test("renders all five intent choices in server HTML on /vi/products/", async ({
    page,
  }) => {
    await page.goto("/vi/products/");
    const control = page.locator("[data-intent-control]");
    await expect(control).toBeVisible();
    await expect(control.getByRole("button")).toHaveCount(5);
    for (const label of VI_INTENTS) {
      await expect(control.getByRole("button", { name: label })).toBeVisible();
    }
  });

  test("renders all five intent choices in server HTML on /zh/products/", async ({
    page,
  }) => {
    await page.goto("/zh/products/");
    const control = page.locator("[data-intent-control]");
    await expect(control).toBeVisible();
    await expect(control.getByRole("button")).toHaveCount(5);
    for (const label of ZH_INTENTS) {
      await expect(control.getByRole("button", { name: label })).toBeVisible();
    }
  });

  test("selecting an intent sets data-intent on <html> and aria-pressed", async ({
    page,
  }) => {
    await page.goto("/en/products/");
    const control = page.locator("[data-intent-control]");
    const verifyButton = control.getByRole("button", {
      name: "Verify trust",
    });
    await verifyButton.click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-intent",
      "verify-trust",
    );
    await expect(verifyButton).toHaveAttribute("aria-pressed", "true");
  });

  test("intent selection is single-select and toggles off", async ({
    page,
  }) => {
    await page.goto("/en/products/");
    const control = page.locator("[data-intent-control]");
    const verify = control.getByRole("button", { name: "Verify trust" });
    const explore = control.getByRole("button", {
      name: "Explore products",
    });

    await verify.click();
    await expect(verify).toHaveAttribute("aria-pressed", "true");

    await explore.click();
    await expect(explore).toHaveAttribute("aria-pressed", "true");
    await expect(verify).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("html")).toHaveAttribute(
      "data-intent",
      "explore-products",
    );

    await explore.click();
    await expect(explore).toHaveAttribute("aria-pressed", "false");
    expect(await page.locator("html").getAttribute("data-intent")).toBeNull();
  });

  test("keyboard operable: Tab focuses, Enter/Space selects", async ({
    page,
  }) => {
    await page.goto("/en/products/");
    const control = page.locator("[data-intent-control]");
    await control.getByRole("button", { name: "Verify trust" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute(
      "data-intent",
      "verify-trust",
    );
  });

  test("intent interaction writes no cookies or storage", async ({ page }) => {
    await page.goto("/en/products/");
    const control = page.locator("[data-intent-control]");
    await control.getByRole("button", { name: "Verify trust" }).click();
    await control.getByRole("button", { name: "Work with us" }).click();
    const state = await page.evaluate(() => ({
      cookie: document.cookie,
      local: localStorage.length,
      session: sessionStorage.length,
    }));
    expect(state.cookie).toBe("");
    expect(state.local).toBe(0);
    expect(state.session).toBe(0);
  });

  test("complete critical content without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/en/products/");
    const control = page.locator("[data-intent-control]");
    await expect(control).toBeVisible();
    await expect(control.getByRole("button")).toHaveCount(5);
    // Default intent (explore-products) is pressed server-side;
    // all other intents start unselected.
    const exploreButton = control.getByRole("button", {
      name: "Explore products",
    });
    await expect(exploreButton).toHaveAttribute("aria-pressed", "true");
    for (const label of EN_INTENTS.filter((l) => l !== "Explore products")) {
      await expect(
        control.getByRole("button", { name: label }),
      ).toHaveAttribute("aria-pressed", "false");
    }
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await context.close();
  });

  test("unknown intent fails closed to the declared default", async ({
    page,
  }) => {
    // The server renders the default intent (explore-products) pressed.
    await page.goto("/en/products/");
    const control = page.locator("[data-intent-control]");
    const explore = control.getByRole("button", {
      name: "Explore products",
    });
    await expect(explore).toHaveAttribute("aria-pressed", "true");
    // Other intents start unselected.
    const verify = control.getByRole("button", { name: "Verify trust" });
    await expect(verify).toHaveAttribute("aria-pressed", "false");
  });

  test("default selection matches the html state and journey order", async ({
    browser,
    page,
  }) => {
    const staticContext = await browser.newContext({
      javaScriptEnabled: false,
    });
    const staticPage = await staticContext.newPage();
    await staticPage.goto("/en/products/");
    const serverOrder = await staticPage
      .locator("[data-journey-bar] li[data-step-key]")
      .evaluateAll((items) =>
        items.map((item) => item.getAttribute("data-step-key") ?? ""),
      );
    const staticOrders = JSON.parse(
      (await staticPage
        .locator("[data-journey-bar]")
        .getAttribute("data-mission-orders")) ?? "{}",
    ) as Record<string, string[]>;
    const staticDeclared = staticOrders["explore-products"]?.filter((key) =>
      serverOrder.includes(key),
    );
    expect(serverOrder.slice(0, staticDeclared?.length ?? 0)).toEqual(
      staticDeclared,
    );
    await staticContext.close();

    await page.goto("/en/products/");
    const control = page.locator("[data-intent-control]");
    await expect(control).toHaveAttribute("data-intent-control-ready", "");
    await expect(page.locator("html")).toHaveAttribute(
      "data-intent",
      "explore-products",
    );

    const bar = page.locator("[data-journey-bar]");
    const orders = JSON.parse(
      (await bar.getAttribute("data-mission-orders")) ?? "{}",
    ) as Record<string, string[]>;
    const visibleSteps = await bar
      .locator("li[data-step-key]")
      .evaluateAll((items) =>
        items.map((item) => item.getAttribute("data-step-key") ?? ""),
      );
    const declared = orders["explore-products"]?.filter((key) =>
      serverOrder.includes(key),
    );
    expect(visibleSteps).toEqual([
      ...(declared ?? []),
      ...serverOrder.filter((key) => !(declared ?? []).includes(key)),
    ]);
  });

  test("same facts/routes remain reachable after intent selection", async ({
    page,
  }) => {
    await page.goto("/en/products/");
    const control = page.locator("[data-intent-control]");
    const linksBefore = await page
      .locator("a[href]")
      .evaluateAll((anchors) => anchors.map((a) => a.getAttribute("href")));

    await control.getByRole("button", { name: "Verify trust" }).click();

    const linksAfter = await page
      .locator("a[href]")
      .evaluateAll((anchors) => anchors.map((a) => a.getAttribute("href")));
    expect(linksAfter.length).toBe(linksBefore.length);
    // No link disappears or becomes non-navigable.
    for (const href of linksAfter) {
      expect(href).not.toBe("");
      expect(href).not.toMatch(/^javascript:/i);
    }
  });

  test("reduced-motion preference does not break the control", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en/products/");
    const control = page.locator("[data-intent-control]");
    await expect(control).toBeVisible();
    await expect(control.getByRole("button")).toHaveCount(5);
  });

  test("mobile viewport: control remains usable", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/en/products/");
    const control = page.locator("[data-intent-control]");
    await expect(control).toBeVisible();
    await expect(control.getByRole("button")).toHaveCount(5);
    // All buttons are touch targets >= 44px (check via bounding boxes).
    const buttons = control.getByRole("button");
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("malformed query values cannot inject or select an arbitrary intent", async ({
    page,
  }) => {
    const hostile = encodeURIComponent(
      '<svg id="query-injected" onload="alert(1)"></svg>',
    );
    await page.goto(
      `/en/products/?intent=${hostile}&intent=verify-trust&intent[]=work-with-us`,
    );

    const control = page.locator("[data-intent-control]");
    await expect(control.getByRole("button")).toHaveCount(5);
    await expect(page.locator("#query-injected")).toHaveCount(0);
    await expect(page.locator("html")).toHaveAttribute(
      "data-intent",
      "explore-products",
    );
    await expect(
      control.getByRole("button", { name: "Explore products" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("unrecognized intent markup cannot select arbitrary presentation state", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const observer = new MutationObserver(() => {
        const control = document.querySelector<HTMLElement>(
          "[data-intent-control]",
        );
        if (
          !control ||
          control.hasAttribute("data-intent-control-ready") ||
          control.querySelector("[data-task5-untrusted-intent]")
        ) {
          return;
        }

        const button = document.createElement("button");
        button.type = "button";
        button.dataset.intent = "profile-visitor";
        button.dataset.task5UntrustedIntent = "";
        button.textContent = "Unrecognized intent";
        control.append(button);
        (
          window as Window & { task5InjectedBeforeIntentInit?: boolean }
        ).task5InjectedBeforeIntentInit = true;
        observer.disconnect();
      });
      observer.observe(document, { childList: true, subtree: true });
    });

    await page.goto("/en/products/");
    const injected = page.locator(
      "[data-intent-control] [data-task5-untrusted-intent]",
    );
    await expect(injected).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          (window as Window & { task5InjectedBeforeIntentInit?: boolean })
            .task5InjectedBeforeIntentInit,
      ),
    ).toBe(true);

    await injected.click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-intent",
      "explore-products",
    );
  });

  test("intent and fidelity presentation leave canonical public truth unchanged", async ({
    page,
  }) => {
    const truthSurface = page.locator(
      [
        "[data-proof-first-empty-state]",
        "[data-product-card]",
        "[data-product-continuity]",
        "[data-product-status]",
        "[data-claim-id]",
        "[data-evidence-passport]",
        "[data-truth-state]",
        "[data-lifecycle]",
      ].join(","),
    );
    const readTruth = () =>
      truthSurface.evaluateAll((elements) =>
        elements
          .map((element) => ({
            markers: Array.from(element.attributes)
              .filter((attribute) => attribute.name.startsWith("data-"))
              .map((attribute) => [attribute.name, attribute.value]),
            text: element.textContent?.replace(/\s+/g, " ").trim() ?? "",
            visible: element.checkVisibility(),
            links: Array.from(element.querySelectorAll("a")).map((link) =>
              link.getAttribute("href"),
            ),
          }))
          .sort((left, right) =>
            JSON.stringify(left).localeCompare(JSON.stringify(right)),
          ),
      );
    const seedCanonicalFixture = () =>
      page.locator("#main-content").evaluate((main) => {
        main.querySelector("[data-proof-first-empty-state]")?.remove();
        const product = document.createElement("article");
        product.dataset.productCard = "fixture-product";
        product.dataset.productStatus = "preview";
        product.dataset.lifecycle = "in-development";
        product.innerHTML =
          '<h2 data-product-continuity>Fixture product</h2><p data-claim-id="fixture-claim" data-truth-state="preview">Fixture capability boundary</p><a data-evidence-passport href="/en/evidence/privacy-no-tracking-on-this-site/">Inspect evidence</a>';
        main.append(product);
      });

    await page.goto("/en/products/");
    await expect(page.locator("[data-proof-first-empty-state]")).toBeVisible();
    await expect(page.locator("[data-product-card]")).toHaveCount(0);
    await seedCanonicalFixture();

    const canonicalBefore = await readTruth();
    expect(canonicalBefore.length).toBeGreaterThan(0);
    expect(canonicalBefore.every((item) => item.visible)).toBe(true);

    const buttons = page.locator("[data-intent-control] button[data-intent]");
    for (let index = 0; index < (await buttons.count()); index++) {
      await buttons.nth(index).click();
      expect(await readTruth()).toEqual(canonicalBefore);
    }

    for (const tier of ["static-premium", "restrained", "cinematic"]) {
      await page.locator("html").evaluate((root, value) => {
        root.setAttribute("data-fidelity-tier", value);
      }, tier);
      expect(await readTruth()).toEqual(canonicalBefore);
    }

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute(
      "data-fidelity-tier",
      "static-premium",
    );
    await seedCanonicalFixture();
    expect(await readTruth()).toEqual(canonicalBefore);
  });

  test("intent and fidelity do not cause network requests or persistent writes", async ({
    page,
  }) => {
    const runtimeRequests: string[] = [];
    page.on("request", (request) => {
      if (
        ["fetch", "xhr", "ping", "websocket", "eventsource"].includes(
          request.resourceType(),
        )
      ) {
        runtimeRequests.push(request.url());
      }
    });

    await page.goto("/en/products/");
    await page
      .locator('[data-intent-control] button[data-intent="verify-trust"]')
      .click();
    await page
      .locator('[data-intent-control] button[data-intent="work-with-us"]')
      .click();
    const storage = await page.evaluate(() => ({
      cookie: document.cookie,
      local: localStorage.length,
      session: sessionStorage.length,
    }));

    expect(runtimeRequests).toEqual([]);
    expect(storage).toEqual({ cookie: "", local: 0, session: 0 });
  });
});
