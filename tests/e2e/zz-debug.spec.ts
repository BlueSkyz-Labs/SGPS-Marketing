import { test } from "@playwright/test";

test("debug badge visibility", async ({ page }) => {
  await page.goto("/en/decision-room/");
  await page.waitForSelector("[data-atelier-controls][data-atelier-ready]");
  await page.selectOption("[data-atelier-goal]", "verify");
  await page.waitForTimeout(400);
  const info = await page.evaluate(() => {
    const badges = [...document.querySelectorAll("[data-atelier-group-label]")];
    return badges.slice(0, 3).map((b) => {
      const r = b.getBoundingClientRect();
      const cs = getComputedStyle(b);
      const item = b.closest("[data-decision-item]");
      const ics = item ? getComputedStyle(item) : null;
      return {
        text: b.textContent,
        cls: b.className,
        w: r.width,
        h: r.height,
        display: cs.display,
        visibility: cs.visibility,
        itemHidden: item ? item.hasAttribute("hidden") : null,
        itemDisplay: ics ? ics.display : null,
        itemHeight: item ? item.getBoundingClientRect().height : null,
      };
    });
  });
  console.log("DEBUG " + JSON.stringify(info));
});
