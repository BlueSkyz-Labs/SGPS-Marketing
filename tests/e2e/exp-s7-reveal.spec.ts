import { expect, test, type Page } from "@playwright/test";

/**
 * Experience v6 S7 — "Reveal" (VALIDATE prototype). Three states (motion,
 * reduced motion, no-JS) each satisfy the content/action contract, the hero
 * headline (LCP) never animates, and motion adds no layout shift.
 */
const ALLOWED = new Set([
  "transform",
  "opacity",
  "strokeDashoffset",
  "clipPath",
]);

async function animationReport(page: Page) {
  return page.evaluate(() => {
    const svg = document.querySelector("svg.sail-reveal");
    const anims = svg ? svg.getAnimations({ subtree: true }) : [];
    return {
      count: anims.length,
      props: [
        ...new Set(
          anims.flatMap((a) =>
            (a.effect as KeyframeEffect)
              .getKeyframes()
              .flatMap((k) =>
                Object.keys(k).filter(
                  (p) =>
                    ![
                      "offset",
                      "easing",
                      "composite",
                      "computedOffset",
                    ].includes(p),
                ),
              ),
          ),
        ),
      ],
      infinite: anims.some(
        (a) => a.effect?.getComputedTiming().iterations === Infinity,
      ),
    };
  });
}

async function isDesktopMark(page: Page) {
  return page.evaluate(
    () =>
      getComputedStyle(document.querySelector(".hero-visual")!).display !==
      "none",
  );
}

test("one signature appearance per composition; mark is decorative", async ({
  page,
}) => {
  await page.goto("/en/");
  await expect(page.locator('[data-reveal="signature"]')).toHaveCount(1);
  await expect(page.locator("svg.sail-reveal")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
});

test("hero H1 has no animation or transition in any motion state", async ({
  browser,
}) => {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    const context = await browser.newContext({ reducedMotion });
    const page = await context.newPage();
    await page.goto("/en/");
    const h1 = page.locator("h1#hero-title");
    await expect(h1).toBeVisible();
    const state = await h1.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        animationName: cs.animationName,
        transitionProperty: cs.transitionProperty,
        transitionDuration: cs.transitionDuration,
        opacity: cs.opacity,
        visibility: cs.visibility,
        running: el.getAnimations({ subtree: true }).length,
      };
    });
    expect(state.animationName).toBe("none");
    const durations = state.transitionDuration
      .split(",")
      .map((d) => Number.parseFloat(d));
    const gated = state.transitionProperty
      .split(",")
      .map((p) => p.trim())
      .filter(
        (p, i) =>
          ["all", "opacity", "transform", "visibility"].includes(p) &&
          (durations[i % durations.length] ?? 0) > 0.0001,
      );
    // The LCP never transitions opacity/transform/visibility. A 0 s default or
    // the global reduced-motion 0.01 ms floor is not motion.
    expect(gated, state.transitionProperty).toEqual([]);
    expect(state.opacity).toBe("1");
    expect(state.visibility).toBe("visible");
    expect(state.running).toBe(0);
    await context.close();
  }
});

test("reduced motion renders the final state at t=0", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/en/", { waitUntil: "commit" });
  await page.waitForLoadState("domcontentloaded");
  await expect(page.locator("html")).not.toHaveAttribute("data-motion", "on");
  expect((await animationReport(page)).count).toBe(0);
  const band = page.locator("[data-trust-band]");
  await expect(band).toHaveCount(1);
  await expect(band).not.toHaveAttribute("data-revealed", /.*/);
  expect(
    await band.evaluate((el) => {
      const cs = getComputedStyle(el);
      return [cs.opacity, cs.clipPath];
    }),
  ).toEqual([
    "1",
    expect.stringMatching(/^(none|inset\(0(px)?( 0(px)?){0,3}\))$/),
  ]);
  if (await isDesktopMark(page)) {
    // Hand-off overlay rests transparent: the static mark is the final state.
    expect(
      await page
        .locator("svg.sail-reveal")
        .evaluate((el) => getComputedStyle(el).opacity),
    ).toBe("0");
    expect(
      await page
        .locator("svg.sail-reveal .sail-stroke")
        .first()
        .evaluate((el) => getComputedStyle(el).strokeDashoffset),
    ).toBe("0px");
  }
  await context.close();
});

test("no-JS renders the final state with the same content and actions", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/en/");
  await expect(page.locator("h1#hero-title")).toBeVisible();
  await expect(page.locator("[data-hero-primary]")).toBeVisible();
  await expect(page.locator("html")).not.toHaveAttribute("data-motion", "on");
  expect((await animationReport(page)).count).toBe(0);
  const band = page.locator("[data-trust-band]");
  expect(
    await band.evaluate((el) => {
      const cs = getComputedStyle(el);
      return [cs.opacity, cs.clipPath];
    }),
  ).toEqual([
    "1",
    expect.stringMatching(/^(none|inset\(0(px)?( 0(px)?){0,3}\))$/),
  ]);
  await context.close();
});

test("motion draws the mark with allowed properties only, then below-fold planes reveal once", async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: "no-preference" });
  const page = await context.newPage();
  await page.goto("/en/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
  const band = page.locator("[data-trust-band]");
  if (await isDesktopMark(page)) {
    const report = await animationReport(page);
    // Negative proof for the reduced/no-JS tests above: here motion IS active,
    // so "no animations at t=0" is a real discriminator, not a tautology.
    expect(report.count).toBeGreaterThan(0);
    expect(report.infinite).toBe(false);
    for (const prop of report.props) expect(ALLOWED.has(prop), prop).toBe(true);
    expect(report.props).toContain("strokeDashoffset");
  }
  await expect(band).toHaveAttribute("data-revealed", "false");
  await band.scrollIntoViewIfNeeded();
  await expect(band).toHaveAttribute("data-revealed", "true");
  await expect
    .poll(() => band.evaluate((el) => getComputedStyle(el).opacity))
    .toBe("1");
  // Once per page load: scrolling away never re-arms it.
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(band).toHaveAttribute("data-revealed", "true");
  await context.close();
});

test("motion adds no layout shift", async ({ browser }) => {
  const measure = async (reducedMotion: "no-preference" | "reduce") => {
    const context = await browser.newContext({ reducedMotion });
    const page = await context.newPage();
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as {
          value: number;
          hadRecentInput: boolean;
        }[]) {
          if (!entry.hadRecentInput)
            (window as unknown as { __cls: number }).__cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/en/");
    await page.waitForTimeout(1600);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(900);
    const cls = await page.evaluate(
      () => (window as unknown as { __cls: number }).__cls,
    );
    await context.close();
    return cls;
  };
  const withMotion = await measure("no-preference");
  const withoutMotion = await measure("reduce");
  expect(withMotion).toBeLessThanOrEqual(0.05);
  expect(withMotion).toBeLessThanOrEqual(withoutMotion + 0.005);
});
