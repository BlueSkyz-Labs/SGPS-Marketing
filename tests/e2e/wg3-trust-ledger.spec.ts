import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Wave G3-B: the trust surfaces are hairline rows, not boxes. Computed-style
 * checks on the rendered pages (en + vi, light + dark): no radius, fill or
 * shadow on the touched blocks, a 1px hairline on top, status as quiet text,
 * a quiet 404 numeral, 44px tap targets, no overflow at 320/390, axe clean.
 */
const LANGS = ["en", "vi"] as const;
const THEMES = ["light", "dark"] as const;

async function open(page: Page, path: string, theme: "light" | "dark") {
  await page.addInitScript((mode: string) => {
    try {
      localStorage.setItem("blueskyz-theme", mode);
    } catch {
      /* the data-theme assertion below catches a missing preference */
    }
  }, theme);
  await page.goto(path);
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
}

/** Resolve a CSS custom property as the colour the browser paints. */
async function token(page: Page, name: string, prop: "color" | "borderColor") {
  return page.evaluate(
    ([n, p]) => {
      const probe = document.createElement("span");
      probe.style.setProperty(
        p === "color" ? "color" : "border-color",
        `var(${n})`,
      );
      probe.style.setProperty("border-style", "solid");
      document.body.append(probe);
      const value = getComputedStyle(probe)[p as "color"];
      probe.remove();
      return value;
    },
    [name, prop] as const,
  );
}

interface Box {
  radius: string;
  background: string;
  shadow: string;
  topWidth: string;
  topStyle: string;
  topColor: string;
  sideWidth: string;
}

function boxOf(locator: ReturnType<Page["locator"]>): Promise<Box> {
  return locator.first().evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      radius: cs.borderTopLeftRadius,
      background: cs.backgroundColor,
      shadow: cs.boxShadow,
      topWidth: cs.borderTopWidth,
      topStyle: cs.borderTopStyle,
      topColor: cs.borderTopColor,
      sideWidth: cs.borderLeftWidth,
    };
  });
}

const TRANSPARENT = "rgba(0, 0, 0, 0)";

/** Vietnamese keeps sentence case (cross-subset kerning); other locales uppercase. */
const expectedTransform = (lang: string) =>
  lang === "vi" ? "none" : "uppercase";

async function expectHairlineRow(page: Page, selector: string) {
  const box = await boxOf(page.locator(selector));
  expect(box.radius, `${selector} radius`).toBe("0px");
  expect(box.background, `${selector} background`).toBe(TRANSPARENT);
  expect(box.shadow, `${selector} shadow`).toBe("none");
  expect(box.sideWidth, `${selector} has no side border`).toBe("0px");
  expect(box.topWidth, `${selector} hairline`).toBe("1px");
  expect(box.topStyle).toBe("solid");
  expect(box.topColor).toBe(await token(page, "--c4-hairline", "borderColor"));
}

async function overflow(page: Page) {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
}

for (const lang of LANGS) {
  for (const theme of THEMES) {
    test.describe(`${lang} ${theme}`, () => {
      test("verify: claims, ledger rows and the disclosure are hairline rows", async ({
        page,
      }) => {
        await open(page, `/${lang}/verify/`, theme);
        expect(await page.locator(".verify-claim").count()).toBeGreaterThan(0);
        await expectHairlineRow(page, ".verify-claim");
        await expectHairlineRow(
          page,
          "[data-trust-surface] > .trust-ledger-card",
        );
        const layer = await boxOf(page.locator("details[data-verify-layer]"));
        expect(layer.radius).toBe("0px");
        expect(layer.background).toBe(TRANSPARENT);
        expect(layer.topWidth).toBe("0px");
        await expectHairlineRow(page, ".verify-layer__summary");
        const summary = await page
          .locator(".verify-layer__summary")
          .evaluate((el) => ({
            bottom: getComputedStyle(el).borderBottomWidth,
            color: getComputedStyle(el).color,
          }));
        expect(summary.bottom).toBe("1px");
        expect(summary.color).toBe(
          await token(page, "--text-secondary", "color"),
        );
        expect(
          await page
            .locator(".verify-layer__summary")
            .evaluate((el) => getComputedStyle(el).textTransform),
          "summary eyebrow text-transform",
        ).toBe(expectedTransform(lang));
        // Open: the body closes the block, so the summary drops its bottom
        // rule and exactly one rule sits under the summary row.
        await page.locator(".verify-layer__summary").click();
        const openState = await page.evaluate(() => {
          const summary = document.querySelector(".verify-layer__summary")!;
          const body = document.querySelector(".verify-layer__body")!;
          return {
            summaryBottom: getComputedStyle(summary).borderBottomWidth,
            bodyTop: getComputedStyle(body).borderTopWidth,
            bodyBottom: getComputedStyle(body).borderBottomWidth,
          };
        });
        expect(openState).toEqual({
          summaryBottom: "0px",
          bodyTop: "0px",
          bodyBottom: "1px",
        });
      });

      test("verify: the status is quiet text in eyebrow voice", async ({
        page,
      }) => {
        await open(page, `/${lang}/verify/`, theme);
        const status = page.locator("[data-trust-status]");
        expect(await status.count()).toBeGreaterThan(0);
        const box = await boxOf(status);
        expect(box.radius).toBe("0px");
        expect(box.background).toBe(TRANSPARENT);
        expect(box.topWidth).toBe("0px");
        const text = await status.first().evaluate((el) => {
          const cs = getComputedStyle(el);
          return {
            color: cs.color,
            size: cs.fontSize,
            weight: cs.fontWeight,
            transform: cs.textTransform,
          };
        });
        expect(text.color).toBe(await token(page, "--text-secondary", "color"));
        expect(text.size).toBe("14px");
        expect(text.transform, "status text-transform").toBe(
          expectedTransform(lang),
        );
        // Every status keeps its label text (the state is carried by words).
        for (const label of await status.allTextContents()) {
          expect(label.trim().length).toBeGreaterThan(0);
        }
      });

      test("contact: both sections are hairline rows with eyebrow headings", async ({
        page,
      }) => {
        await open(page, `/${lang}/contact/`, theme);
        await expect(page.locator("[data-contact-card]")).toHaveCount(2);
        for (const card of ["business", "security"]) {
          await expectHairlineRow(page, `[data-contact-card="${card}"]`);
          const pad = await page
            .locator(`[data-contact-card="${card}"]`)
            .evaluate((el) => {
              const cs = getComputedStyle(el);
              return [cs.paddingLeft, cs.paddingRight];
            });
          expect(pad).toEqual(["0px", "0px"]);
          const heading = await page
            .locator(`[data-contact-card="${card}"] h2`)
            .evaluate((el) => {
              const cs = getComputedStyle(el);
              return {
                color: cs.color,
                size: cs.fontSize,
                transform: cs.textTransform,
              };
            });
          expect(heading.color).toBe(
            await token(page, "--text-secondary", "color"),
          );
          expect(heading.size).toBe("14px");
          expect(heading.transform, `${card} heading text-transform`).toBe(
            expectedTransform(lang),
          );
        }
      });

      test("404: the numeral is a quiet secondary-ink weight-500 numeral", async ({
        page,
      }) => {
        await open(page, `/${lang}/404/`, theme);
        const numeral = await page
          .locator(".page-header__eyebrow--numeral")
          .evaluate((el) => {
            const cs = getComputedStyle(el);
            return { color: cs.color, weight: cs.fontWeight };
          });
        expect(numeral.color).toBe(
          await token(page, "--text-secondary", "color"),
        );
        expect(numeral.weight).toBe("500");
      });

      for (const route of ["verify", "contact", "404"]) {
        test(`/${lang}/${route}/ has no axe violations`, async ({ page }) => {
          await open(page, `/${lang}/${route}/`, theme);
          if (route === "verify") {
            await page.locator(".verify-layer__summary").click();
          }
          const results = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
            .analyze();
          expect(results.violations).toEqual([]);
        });
      }
    });
  }

  for (const width of [320, 390]) {
    for (const route of ["verify", "contact", "404"]) {
      test(`${lang} /${route}/ at ${width}px: no horizontal overflow, 44px targets`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(`/${lang}/${route}/`);
        if (route === "verify") {
          await page.locator(".verify-layer__summary").click();
        }
        expect(await overflow(page)).toBeLessThanOrEqual(0);
        const short = await page.evaluate(() =>
          Array.from(
            document.querySelectorAll<HTMLElement>("main a, main summary"),
          )
            .map((el) => ({
              text: (el.textContent ?? "").trim().slice(0, 40),
              h: el.getBoundingClientRect().height,
              visible: el.getClientRects().length > 0,
            }))
            .filter((m) => m.visible && m.h < 43.5),
        );
        expect(short).toEqual([]);
      });
    }
  }
}

test("forced colors: the numeral falls back to CanvasText", async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/en/404/");
  const color = await page
    .locator(".page-header__eyebrow--numeral")
    .evaluate((el) => getComputedStyle(el).color);
  const canvasText = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.color = "CanvasText";
    document.body.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  });
  expect(color).toBe(canvasText);
});

test("forced colors: the verify rules stay painted, one under the open summary", async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/en/verify/");
  await page.locator(".verify-layer__summary").click();
  const rules = await page.evaluate(() => {
    const read = (selector: string) => {
      const cs = getComputedStyle(document.querySelector(selector)!);
      return {
        top: [cs.borderTopWidth, cs.borderTopStyle, cs.borderTopColor],
        bottom: [
          cs.borderBottomWidth,
          cs.borderBottomStyle,
          cs.borderBottomColor,
        ],
      };
    };
    return {
      claim: read(".verify-claim"),
      summary: read(".verify-layer__summary"),
      body: read(".verify-layer__body"),
    };
  });
  for (const rule of [rules.claim.top, rules.summary.top, rules.body.bottom]) {
    expect(rule[0]).toBe("1px");
    expect(rule[1]).toBe("solid");
    expect(rule[2]).not.toBe(TRANSPARENT);
  }
  expect(rules.summary.bottom[0]).toBe("0px");
});

test("negative proof: a boxed claim is caught by the same check", async ({
  page,
}) => {
  await open(page, "/en/verify/", "light");
  await page.addStyleTag({
    content:
      ".verify-claim { border-radius: 12px !important; background: #fff !important; }",
  });
  const box = await boxOf(page.locator(".verify-claim"));
  expect(box.radius).not.toBe("0px");
  expect(box.background).not.toBe(TRANSPARENT);
});
