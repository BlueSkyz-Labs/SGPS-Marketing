import { expect, test, type Page } from "@playwright/test";

/**
 * TRU-01 / TRU-08 guards: with JS on, the evidence passport must show its
 * sources without interaction, keep the no-JS link set, and expose styled
 * >=44px step buttons; Decision room source links need unique accessible
 * names and >=44px targets. Each check is a function so a negative proof can
 * run it against deliberately broken DOM/CSS.
 */
const ID = "security-reporting-is-private";
const LANGS = ["vi", "en"] as const;
const VIEWPORTS = [
  { name: "390", width: 390, height: 844 },
  { name: "1440", width: 1440, height: 900 },
];

async function checkExplorer(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const problems: string[] = [];
    const root = document.querySelector("[data-evidence-explorer]");
    if (!root) return ["no explorer"];
    const vh = window.innerHeight;
    const links = [
      ...root.querySelectorAll<HTMLAnchorElement>(
        "[data-evidence-static-sources] a",
      ),
    ];
    const visibleInFold = links.some((a) => {
      const r = a.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top < vh && r.bottom > 0;
    });
    if (!visibleInFold) problems.push("no source link in first viewport");
    const buttons = [
      ...root.querySelectorAll<HTMLElement>(".evidence-explorer__step-btn"),
    ];
    if (buttons.length < 3) problems.push("step buttons missing");
    for (const b of buttons) {
      const r = b.getBoundingClientRect();
      if (r.height < 43.5) problems.push(`button height ${r.height}`);
      const num = b.querySelector(".evidence-explorer__step-num");
      const label = b.querySelector(".evidence-explorer__step-label");
      if (num && label) {
        const n = num.getBoundingClientRect();
        const l = label.getBoundingClientRect();
        if (l.left - n.right < 4) problems.push("no gap num/label");
        if (getComputedStyle(num).borderRadius === "0px")
          problems.push("num not a badge");
      }
    }
    return problems;
  });
}

for (const lang of LANGS) {
  for (const vp of VIEWPORTS) {
    test(`evidence explorer ${lang} @${vp.name}: sources visible, 44px steps, same links as no-JS`, async ({
      browser,
    }) => {
      const url = `/${lang}/evidence/${ID}/`;
      const noJs = await browser.newContext({ javaScriptEnabled: false });
      const p0 = await noJs.newPage();
      await p0.goto(url);
      const expected = await p0
        .locator("[data-evidence-static-sources] li a")
        .count();
      await noJs.close();
      expect(expected).toBeGreaterThan(0);

      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await ctx.newPage();
      await page.goto(url);
      await expect(page.locator("[data-evidence-explorer]")).toHaveAttribute(
        "data-explorer-active",
        "true",
      );
      expect(await checkExplorer(page)).toEqual([]);
      // Link set equals the no-JS page: no duplicated source anchors.
      expect(
        await page
          .locator("[data-evidence-explorer] [data-evidence-static-sources] a")
          .count(),
      ).toBe(expected);
      expect(
        await page
          .locator("[data-evidence-explorer] [id^='evidence-'] a")
          .count(),
      ).toBe(expected);

      // Several panels can be open at once.
      const stateBtn = page.locator(".evidence-explorer__step-btn").nth(2);
      if ((await stateBtn.getAttribute("aria-expanded")) !== "true")
        await stateBtn.click();
      expect(
        await page
          .locator('.evidence-explorer__step-btn[aria-expanded="true"]')
          .count(),
      ).toBeGreaterThanOrEqual(2);
      await ctx.close();

      // Negative proof: strip the step CSS and hide the sources.
      const bad = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const bp = await bad.newPage();
      await bp.goto(url);
      await bp.addStyleTag({
        content: `.evidence-explorer__step-btn,.evidence-explorer__step-btn *{all:unset!important}
          [data-evidence-static-sources]{display:none!important}`,
      });
      expect((await checkExplorer(bp)).length).toBeGreaterThan(0);
      await bad.close();
    });
  }
}

async function checkDecisionLinks(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const problems: string[] = [];
    const links = [
      ...document.querySelectorAll<HTMLAnchorElement>(
        "[data-decision-room] [data-decision-item] a.decision-room__source",
      ),
    ];
    if (links.length < 5) problems.push("too few source links");
    const names = new Map<string, number>();
    for (const a of links) {
      const name = (a.getAttribute("aria-label") ?? a.textContent ?? "").trim();
      names.set(name, (names.get(name) ?? 0) + 1);
      const h = a.getBoundingClientRect().height;
      if (h < 43.5) problems.push(`height ${h}`);
    }
    for (const [name, n] of names)
      if (n > 1) problems.push(`duplicate name "${name}" x${n}`);
    return problems;
  });
}

for (const lang of LANGS) {
  for (const vp of VIEWPORTS) {
    test(`decision room ${lang} @${vp.name}: source links unique names and 44px`, async ({
      browser,
    }) => {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await ctx.newPage();
      await page.goto(`/${lang}/decision-room/`);
      expect(await checkDecisionLinks(page)).toEqual([]);
      // Negative proof: strip aria-labels and shrink targets.
      await page.evaluate(() => {
        for (const a of document.querySelectorAll(".decision-room__source")) {
          a.removeAttribute("aria-label");
          (a as HTMLElement).style.minHeight = "0";
        }
      });
      expect((await checkDecisionLinks(page)).length).toBeGreaterThan(0);
      await ctx.close();
    });
  }
}
