import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Wave G3-A: product surfaces in the quiet-authority grammar.
 * G-04 feature list = hairline rows, no numerals (EX-07).
 * G-05 inspect links = meta voice (secondary at rest, primary on focus).
 * G-06 products index = ledger rows; the home ProductHouse keeps its cards.
 * Computed styles, tap target, no horizontal overflow at 320/390, axe.
 */
const LANGS = ["en", "vi"] as const;
const THEMES = ["light", "dark"] as const;

async function open(page: Page, path: string, theme: (typeof THEMES)[number]) {
  await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
  await page.addInitScript((value: string) => {
    try {
      window.localStorage.setItem("blueskyz-theme", value);
    } catch {
      /* storage can be blocked; emulateMedia still sets the scheme */
    }
  }, theme);
  await page.goto(path);
  await page.addStyleTag({
    content:
      "*,*::before,*::after{content-visibility:visible!important;transition:none!important}",
  });
}

/** Resolve a colour token (or any colour expression) to its computed rgb. */
function resolve(page: Page, expression: string) {
  return page.evaluate((value) => {
    const probe = document.createElement("span");
    probe.style.color = value;
    document.body.append(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    return resolved;
  }, expression);
}

function resolveSize(page: Page, expression: string) {
  return page.evaluate((value) => {
    const probe = document.createElement("span");
    probe.style.fontSize = value;
    document.body.append(probe);
    const resolved = getComputedStyle(probe).fontSize;
    probe.remove();
    return resolved;
  }, expression);
}

type Box = {
  radius: string;
  shadow: string;
  background: string;
  top: string;
  topColor: string;
  other: string[];
};

function box(locator: ReturnType<Page["locator"]>): Promise<Box> {
  return locator.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      radius: cs.borderTopLeftRadius + "/" + cs.borderBottomRightRadius,
      shadow: cs.boxShadow,
      background: cs.backgroundColor,
      top: cs.borderTopWidth,
      topColor: cs.borderTopColor,
      other: [cs.borderRightWidth, cs.borderLeftWidth],
    };
  });
}

async function noOverflow(page: Page) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

async function axe(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual(
    [],
  );
}

for (const lang of LANGS) {
  for (const theme of THEMES) {
    test(`${lang} ${theme}: feature list is a hairline list with no numerals`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await open(page, `/${lang}/products/sotro/`, theme);
      const tiles = page.locator("[data-what-it-does] > li");
      const count = await tiles.count();
      expect(count).toBeGreaterThan(0);
      const hairline = await resolve(page, "var(--border-subtle)");
      for (let i = 0; i < count; i += 1) {
        const b = await box(tiles.nth(i));
        expect(b.radius).toBe("0px/0px");
        expect(b.shadow).toBe("none");
        expect(b.background).toBe("rgba(0, 0, 0, 0)");
        expect(b.top).toBe("1px");
        expect(b.topColor).toBe(hairline);
        expect(b.other).toEqual(["0px", "0px"]);
        // EX-07: no numerals in the list; the story chapters carry "01 / 05".
        await expect(tiles.nth(i).locator(".profile-does__index")).toHaveCount(
          0,
        );
        expect((await tiles.nth(i).textContent())?.trim() ?? "").not.toMatch(
          /^0\d\b/,
        );
        // EX-07, generated channel: no pseudo-element content, counters, or
        // any text besides the item string itself (the item may hold digits,
        // e.g. "24/7"; only what is added around it is forbidden).
        const generated = await tiles.nth(i).evaluate((li) => {
          const cs = getComputedStyle(li);
          const text = li.querySelector(".profile-does__text");
          const item = text?.textContent ?? "";
          const rendered = (li as HTMLElement).innerText;
          return {
            before: getComputedStyle(li, "::before").content,
            after: getComputedStyle(li, "::after").content,
            counter: cs.counterIncrement,
            textBefore: getComputedStyle(text!, "::before").content,
            textAfter: getComputedStyle(text!, "::after").content,
            item,
            extra: rendered.replace(item, "").trim(),
            children: li.children.length,
          };
        });
        expect(["none", '""', "normal"]).toContain(generated.before);
        expect(["none", '""', "normal"]).toContain(generated.after);
        expect(["none", '""', "normal"]).toContain(generated.textBefore);
        expect(["none", '""', "normal"]).toContain(generated.textAfter);
        expect(generated.counter).toBe("none");
        expect(generated.item.trim().length).toBeGreaterThan(0);
        expect(generated.children).toBe(1);
        expect(generated.extra).not.toMatch(/\d/);
        expect(generated.extra).toBe("");
      }
    });

    test(`${lang} ${theme}: inspect links are meta voice, 44px tall, primary on focus`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await open(page, `/${lang}/products/sotro/`, theme);
      // The extra screens sit in a closed disclosure until opened.
      await page.evaluate(() =>
        document
          .querySelectorAll<HTMLDetailsElement>("details.showcase__more")
          .forEach((d) => (d.open = true)),
      );
      const secondary = await resolve(page, "var(--text-secondary)");
      const primary = await resolve(page, "var(--text-primary)");
      for (const cls of ["story__inspect", "showcase__inspect"]) {
        const links = page.locator(`a.${cls}[data-capture-inspect]`);
        const count = await links.count();
        expect(count, `${cls} present`).toBeGreaterThan(0);
        // First link a visitor can reach: not hidden, inert or in an
        // aria-hidden cross-fade layer.
        const index = await links.evaluateAll((els) =>
          els.findIndex(
            (el) =>
              el.getClientRects().length > 0 &&
              !el.closest("[inert],[hidden],[aria-hidden='true']"),
          ),
        );
        expect(index, `${cls} has a reachable link`).toBeGreaterThanOrEqual(0);
        const link = links.nth(index);
        await link.scrollIntoViewIfNeeded();
        const rest = await link.evaluate((el) => {
          const cs = getComputedStyle(el);
          return {
            color: cs.color,
            weight: cs.fontWeight,
            size: cs.fontSize,
            line: cs.textDecorationLine,
            height: el.getBoundingClientRect().height,
          };
        });
        expect(rest.color).toBe(secondary);
        expect(rest.weight).toBe("500");
        expect(rest.line).toContain("underline");
        expect(rest.height).toBeGreaterThanOrEqual(44);
        expect(rest.size).toBe(await resolveSize(page, "var(--c4-type-meta)"));
        // Keyboard modality first, so the scripted focus matches :focus-visible.
        await page.keyboard.press("Shift");
        await link.focus();
        await expect(link).toBeFocused();
        expect(await link.evaluate((el) => getComputedStyle(el).color)).toBe(
          primary,
        );
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", /noopener/);
        await expect(link.locator("[aria-hidden='true']")).toHaveCount(1);
      }
    });

    test(`${lang} ${theme}: products index rows are a ledger, not cards`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await open(page, `/${lang}/products/`, theme);
      const cards = page.locator("[data-product-card]");
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
      const hairline = await resolve(page, "var(--border-subtle)");
      for (let i = 0; i < count; i += 1) {
        const card = cards.nth(i);
        await expect(card).toHaveAttribute("data-product-variant", "ledger");
        const b = await box(card);
        expect(b.radius).toBe("0px/0px");
        expect(b.shadow).toBe("none");
        expect(b.background).toBe("rgba(0, 0, 0, 0)");
        expect(b.top).toBe("1px");
        expect(b.topColor).toBe(hairline);
        expect(b.other).toEqual(["0px", "0px"]);
        const pad = await card.evaluate((el) => {
          const cs = getComputedStyle(el);
          return [cs.paddingLeft, cs.paddingRight];
        });
        expect(pad).toEqual(["0px", "0px"]);
      }
      const closing = await page
        .locator(".product-ledger")
        .evaluate((el) => getComputedStyle(el).borderBottomWidth);
      expect(closing).toBe("1px");
      const title = cards.first().locator("[data-product-continuity='card']");
      await title.focus();
      expect(
        await title.evaluate((el) => {
          const cs = getComputedStyle(el);
          return [cs.color, cs.textDecorationLine];
        }),
      ).toEqual([await resolve(page, "var(--text-primary)"), "underline"]);
    });

    test(`${lang} ${theme}: product routes are axe clean`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      for (const path of [`/${lang}/products/sotro/`, `/${lang}/products/`]) {
        await open(page, path, theme);
        await axe(page);
      }
    });
  }

  // The default raised card is not rendered on any built route (the home
  // ProductHouse is compact); the architecture guard pins it in source.

  for (const width of [320, 390]) {
    test(`${lang}: no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      for (const path of [`/${lang}/products/sotro/`, `/${lang}/products/`]) {
        await open(page, path, "light");
        await noOverflow(page);
      }
    });
  }
}
