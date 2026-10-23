import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const EXPLORER_COPY = {
  en: {
    claim: "Claim",
    state: "Verification state",
    stateValue: "Source-linked",
  },
  vi: {
    claim: "Tuyên bố",
    state: "Trạng thái xác minh",
    stateValue: "Đã gắn nguồn",
  },
  zh: {
    claim: "声明",
    state: "验证状态",
    stateValue: "已关联来源",
  },
  "zh-hant": {
    claim: "聲明",
    state: "驗證狀態",
    stateValue: "已關聯來源",
  },
} as const;

test.describe("verification deep links", () => {
  test("claim anchor exists on the security surface and lands below the header", async ({
    page,
  }) => {
    await page.goto("/en/security/#claim-security-reporting-is-private");
    const anchor = page.locator("#claim-security-reporting-is-private");
    await expect(anchor).toBeVisible();
    // The anchor is a real entry (not a hidden shim target).
    await expect(anchor).toHaveAttribute("data-integrity-entry");
    const top = await anchor.evaluate(
      (element) => element.getBoundingClientRect().top,
    );
    expect(top).toBeGreaterThanOrEqual(0);
    expect(top).toBeLessThan(140);
  });

  test("evidence anchors deep-link to real evidence steps", async ({
    page,
  }) => {
    // Experience v6 S3: source-to-surface evidence steps live on /verify (the
    // security page keeps the claim anchor and the evidence links).
    await page.goto("/en/verify/#evidence-ev-security-route");
    const evidence = page.locator("#evidence-ev-security-route");
    await expect(evidence).toBeVisible();
    await expect(evidence).toHaveAttribute("data-trace-step", "evidence");
  });

  test("passport heading exposes the same stable claim anchor", async ({
    page,
  }) => {
    await page.goto("/en/evidence/security-reporting-is-private/");
    const heading = page.locator("#claim-security-reporting-is-private");
    await expect(heading).toBeVisible();
    await expect(heading).toHaveRole("heading");
  });

  test("source anchors open the visible sources step", async ({ page }) => {
    await page.goto(
      "/en/evidence/security-reporting-is-private/#evidence-ev-security-advisory",
    );
    await expect(page.locator("#evidence-ev-security-advisory")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sources", exact: true }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  for (const [lang, copy] of Object.entries(EXPLORER_COPY)) {
    test(`/${lang}/evidence/ enhances the localized verification chain`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/evidence/security-reporting-is-private/`);
      const explorer = page.locator("[data-evidence-explorer]");
      await expect(explorer).toHaveAttribute("data-explorer-active", "true");
      const chain = explorer.locator("[data-evidence-chain]");
      await expect(chain).toBeVisible();

      const steps = chain.getByRole("button");
      await expect(steps).toHaveCount(4);
      // WCAG 2.5.3 Label in Name: the accessible name IS the visible label
      // (no aria-label, which axe 4.14 flags because the aria-hidden number
      // and chevron count as visible text). State is aria-expanded only.
      await expect(steps.nth(0)).toHaveAccessibleName(copy.claim);
      const stateStep = steps.nth(2);
      await expect(stateStep).toHaveAccessibleName(copy.state);
      await expect(stateStep).toHaveAttribute("aria-expanded", "false");
      for (const step of await steps.all()) {
        await expect(step).not.toHaveAttribute("aria-label", /.*/);
        await expect(step).toHaveAccessibleName(
          (await step
            .locator(".evidence-explorer__step-label")
            .textContent()) ?? "",
        );
      }
      const labelInName = await new AxeBuilder({ page })
        .include("[data-evidence-chain]")
        .withRules(["label-content-name-mismatch"])
        .analyze();
      expect(labelInName.violations).toEqual([]);
      await stateStep.click();
      await expect(stateStep).toHaveAttribute("aria-expanded", "true");
      await expect(stateStep).toHaveAccessibleName(copy.state);

      const panelId = await stateStep.getAttribute("aria-controls");
      await expect(explorer.locator(`#${panelId}`)).toContainText(
        copy.stateValue,
      );
      await stateStep.press("ArrowDown");
      await expect(steps.nth(3)).toBeFocused();
    });
  }

  test("deep links work with JavaScript disabled", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/en/security/#claim-security-reporting-is-private");
    await expect(
      page.locator("#claim-security-reporting-is-private"),
    ).toBeVisible();
    await page.goto(
      "/en/evidence/security-reporting-is-private/#evidence-ev-security-advisory",
    );
    await expect(page.locator("#evidence-ev-security-advisory")).toBeVisible();
    await context.close();
  });

  test("VI deep links preserve locale and evidence context", async ({
    page,
  }) => {
    await page.goto("/vi/security/#claim-security-reporting-is-private");
    const anchor = page.locator("#claim-security-reporting-is-private");
    await expect(anchor).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
    await page.goto("/vi/verify/#evidence-ev-security-route");
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
    await expect(page.locator("#evidence-ev-security-route")).toBeVisible();
  });

  for (const lang of ["en", "vi", "zh", "zh-hant"]) {
    test(`/${lang}/verify/ evidence deep links resolve once and open their layer`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/verify/#evidence-ev-security-route`);
      await expect(page.locator("#evidence-ev-security-route")).toHaveCount(1);
      await expect(page.locator("#evidence-ev-security-route")).toBeVisible();
      await expect(
        page.locator('#evidence-ev-security-route[data-trace-step="evidence"]'),
      ).toBeVisible();
    });
  }

  test("privacy canvas mirrors the contract", async ({ page }) => {
    await page.goto("/en/privacy/#claim-privacy-no-tracking-on-this-site");
    await expect(
      page.locator("#claim-privacy-no-tracking-on-this-site"),
    ).toBeVisible();
    await expect(page.locator("#evidence-ev-privacy-route")).toBeVisible();
  });

  test("anchor ids are collision-safe and slug-stable", async ({ page }) => {
    await page.goto("/en/security/");
    const ids = await page
      .locator('[id^="claim-"], [id^="evidence-"]')
      .evaluateAll((elements) => elements.map((element) => element.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^(claim|evidence)-[a-z0-9-]+$/);
    }
  });
});
