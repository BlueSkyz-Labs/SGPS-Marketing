import { expect, test, type Page } from "@playwright/test";

/**
 * UX P2-7 (red-team 2026-10-12): links and actions had four looks. Boxed
 * actions now take one shape, the ButtonLink pill; a boxed link is a card
 * only when it carries a product image (the hero entry card), and then it
 * uses the card radius. Standalone action-colour text links are underlined
 * at rest (one link tier); hover-only underlines are gone.
 */
const PAGES = [
  "/",
  "/products/",
  "/products/sotro/",
  "/products/sotam/",
  "/about/",
  "/contact/",
  "/security/",
  "/verify/",
  "/privacy/",
  "/support/",
];
const LANGS = ["en", "vi", "zh", "zh-hant"] as const;

type Link = {
  boxed: boolean;
  radius: string;
  hasImage: boolean;
  action: boolean;
  underline: boolean;
  label: string;
};

export const boxedOk = (l: Pick<Link, "radius" | "hasImage">, card: string) =>
  l.radius === "999px" || (l.hasImage && l.radius === card);
export const textOk = (l: Pick<Link, "action" | "underline">) =>
  !l.action || l.underline;

test("negative proof: the old looks fail the guards", () => {
  // The old next-step buttons: 20px boxes without an image.
  expect(boxedOk({ radius: "20px", hasImage: false }, "12px")).toBe(false);
  // A card radius on a plain button is not a card.
  expect(boxedOk({ radius: "12px", hasImage: false }, "12px")).toBe(false);
  // The old privacy/support links: action colour, no underline at rest.
  expect(textOk({ action: true, underline: false })).toBe(false);
  expect(boxedOk({ radius: "999px", hasImage: false }, "12px")).toBe(true);
  expect(textOk({ action: true, underline: true })).toBe(true);
});

async function collect(page: Page) {
  return page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.color = "var(--action-primary)";
    probe.style.borderRadius = "var(--radius-card)";
    document.body.append(probe);
    const action = getComputedStyle(probe).color;
    const card = getComputedStyle(probe).borderTopLeftRadius;
    probe.remove();
    const links = [
      ...document.querySelectorAll<HTMLAnchorElement>(
        "main a, [data-journey-bar] a, [data-home-next-steps] a",
      ),
    ]
      .filter((a) => a.getClientRects().length > 0)
      .filter((a) => !a.closest("[data-atlas], nav[aria-label] ol"))
      .map((a) => {
        const s = getComputedStyle(a);
        const boxed =
          ["Top", "Right", "Bottom", "Left"].every(
            (k) =>
              parseFloat(
                s.getPropertyValue(`border-${k.toLowerCase()}-width`),
              ) > 0,
          ) || s.backgroundColor !== "rgba(0, 0, 0, 0)";
        return {
          boxed,
          radius: s.borderTopLeftRadius,
          hasImage: a.querySelector("img") !== null,
          action:
            !boxed &&
            s.color === action &&
            parseFloat(s.fontWeight) >= 600 &&
            !a.classList.contains("btn"),
          underline: s.textDecorationLine.includes("underline"),
          label: a.textContent!.trim().slice(0, 40),
        };
      });
    return { card, links };
  });
}

for (const lang of LANGS) {
  for (const path of PAGES) {
    test(`${lang}${path}: one pill tier and one link tier`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/${lang}${path}`);
      const { card, links } = await collect(page);
      expect(links.length).toBeGreaterThan(0);
      for (const l of links.filter((x) => x.boxed))
        expect(boxedOk(l, card), JSON.stringify(l)).toBe(true);
      for (const l of links.filter((x) => !x.boxed))
        expect(textOk(l), JSON.stringify(l)).toBe(true);
    });
  }
}

test("negative proof: a reverted next-step button fails on the live page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/");
  await page.evaluate(() => {
    const a = document.querySelector<HTMLElement>(
      "[data-home-next-steps] a, [data-journey-bar] a",
    )!;
    a.style.borderRadius = "1.25rem";
  });
  const { card, links } = await collect(page);
  expect(links.filter((x) => x.boxed).some((l) => !boxedOk(l, card))).toBe(
    true,
  );
});
