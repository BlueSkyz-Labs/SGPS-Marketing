import { expect, test } from "@playwright/test";

const ROUTES = ["en", "vi", "zh", "zh-hant"].flatMap((locale) => [
  `/${locale}/`,
  `/${locale}/about/`,
  `/${locale}/products/`,
  `/${locale}/products/sotro/`,
  `/${locale}/products/sotam/`,
  `/${locale}/contact/`,
]);

const POSTURES = [
  {
    name: "book portrait panels",
    viewport: { width: 840, height: 1120 },
    orientation: "vertical" as const,
    offset: 410,
    maskLength: 20,
  },
  {
    name: "compact book portrait panels",
    viewport: { width: 700, height: 1000 },
    orientation: "vertical" as const,
    offset: 340,
    maskLength: 20,
  },
  {
    name: "book landscape panels",
    viewport: { width: 1200, height: 800 },
    orientation: "vertical" as const,
    offset: 590,
    maskLength: 20,
  },
  {
    name: "tabletop panels",
    viewport: { width: 1200, height: 800 },
    orientation: "horizontal" as const,
    offset: 390,
    maskLength: 20,
  },
];

for (const posture of POSTURES) {
  for (const route of ROUTES) {
    test(`${route} keeps reading content clear of ${posture.name}`, async ({
      page,
      browserName,
    }) => {
      test.skip(
        browserName !== "chromium",
        "fold posture is emulated through CDP",
      );

      const { viewport, offset, maskLength, orientation } = posture;
      await page.setViewportSize(viewport);
      const cdp = await page.context().newCDPSession(page);
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        ...viewport,
        deviceScaleFactor: 1,
        mobile: true,
        screenWidth: viewport.width,
        screenHeight: viewport.height,
        displayFeature: { orientation, offset, maskLength },
        devicePosture: { type: "folded" },
      });
      await cdp.send("Emulation.setDisplayFeaturesOverride", {
        features: [{ orientation, offset, maskLength }],
      });
      await cdp.send("Emulation.setDevicePostureOverride", {
        posture: { type: "folded" },
      });

      await page.goto(route);
      const result = await page.evaluate(
        ({ orientation, offset, maskLength }) => {
          const featureQuery =
            orientation === "vertical"
              ? "(horizontal-viewport-segments: 2)"
              : "(vertical-viewport-segments: 2)";
          const featureActive = matchMedia(featureQuery).matches;
          const getWindowSegments = (
            window as Window & { getWindowSegments?: () => DOMRect[] }
          ).getWindowSegments;
          const segments = getWindowSegments?.().map(
            ({ x, y, width, height }) => ({ x, y, width, height }),
          );
          const foldEnd = offset + maskLength;
          const importantSelector = [
            "header a",
            "header button",
            "main h1",
            "main h2",
            "main h3",
            "main p",
            "main a",
            "main button",
            "main li",
            "main input",
            "main select",
            "main textarea",
            "main figure",
            "main img",
            "main video",
            "main canvas",
            "footer .footer-nav-link",
            "footer button",
          ].join(", ");
          const crossing = [
            ...document.querySelectorAll<HTMLElement>(importantSelector),
          ]
            .filter((element) => {
              const style = getComputedStyle(element);
              if (style.display === "none" || style.visibility === "hidden") {
                return false;
              }
              const rect = element.getBoundingClientRect();
              if (!rect.width || !rect.height) return false;
              return orientation === "vertical"
                ? rect.left < foldEnd && rect.right > offset
                : rect.top < foldEnd && rect.bottom > offset;
            })
            .map((element) => ({
              tag: element.tagName.toLowerCase(),
              text: element.textContent?.trim().slice(0, 80),
              className: element.className,
              left: Math.round(element.getBoundingClientRect().left),
              right: Math.round(element.getBoundingClientRect().right),
              top: Math.round(element.getBoundingClientRect().top),
              bottom: Math.round(element.getBoundingClientRect().bottom),
            }));
          const tabletop =
            orientation === "horizontal"
              ? {
                  htmlHeight:
                    document.documentElement.getBoundingClientRect().height,
                  bodyHeight: document.body.clientHeight,
                  bodyScrollHeight: document.body.scrollHeight,
                  bodyOverflowY: getComputedStyle(document.body).overflowY,
                  mainVisibleBelowHinge: [
                    offset + maskLength + 1,
                    window.innerHeight - 1,
                  ].some((y) => {
                    const element = document.elementFromPoint(
                      Math.floor(window.innerWidth / 2),
                      y,
                    );
                    return Boolean(element?.closest("header, main, footer"));
                  }),
                }
              : null;
          return { featureActive, crossing, segments, innerWidth, tabletop };
        },
        { orientation, offset, maskLength },
      );

      expect(result.featureActive, JSON.stringify(result)).toBe(true);
      if (orientation === "vertical") {
        expect(
          result.crossing,
          "reading content must stay inside the leading segment",
        ).toEqual([]);
      } else {
        expect(result.tabletop?.bodyOverflowY).toBe("auto");
        expect(result.tabletop?.bodyScrollHeight).toBeGreaterThan(
          result.tabletop?.bodyHeight ?? 0,
        );
        expect(
          result.tabletop?.htmlHeight,
          "tabletop page scrollport must end before the hinge",
        ).toBeLessThanOrEqual(offset);
        expect(
          result.tabletop?.mainVisibleBelowHinge,
          "the lower segment must not render page content behind the hinge",
        ).toBe(false);
        const footerLink = page.locator("footer .footer-nav-link").first();
        const footerRect = await footerLink.evaluate((element) => {
          const body = document.body;
          body.scrollTop = body.scrollHeight;
          const { top, bottom } = element.getBoundingClientRect();
          return { top, bottom, bodyScrollTop: body.scrollTop };
        });
        expect(footerRect.bodyScrollTop).toBeGreaterThan(0);
        expect(footerRect.top).toBeGreaterThanOrEqual(0);
        expect(footerRect.bottom).toBeLessThanOrEqual(offset);
      }
      await cdp.detach();
    });
  }
}

for (const posture of POSTURES) {
  test(`header overlays stay inside the active segment in ${posture.name}`, async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "fold posture is emulated through CDP",
    );

    const { viewport, offset, maskLength, orientation } = posture;
    await page.setViewportSize(viewport);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      ...viewport,
      deviceScaleFactor: 1,
      mobile: true,
      screenWidth: viewport.width,
      screenHeight: viewport.height,
      displayFeature: { orientation, offset, maskLength },
      devicePosture: { type: "folded" },
    });
    await cdp.send("Emulation.setDisplayFeaturesOverride", {
      features: [{ orientation, offset, maskLength }],
    });
    await cdp.send("Emulation.setDevicePostureOverride", {
      posture: { type: "folded" },
    });
    await page.goto("/en/");

    if (viewport.width < 768) {
      const menu = page.locator("header .site-container > details");
      await menu.locator("summary").click();
      const menuPanel = menu.locator(":scope > div");
      const menuBounds = await menuPanel.evaluate((element) => {
        const { left, right } = element.getBoundingClientRect();
        return { left, right };
      });
      expect(menuBounds.left).toBeGreaterThanOrEqual(0);
      expect(menuBounds.right).toBeLessThanOrEqual(offset);
    }

    const dialog = page.locator("[data-command-navigator]");
    await page.locator("[data-command-trigger]:visible").first().click();
    await expect(dialog).toBeVisible();
    const dialogBounds = await dialog.evaluate((element) => {
      const { left, right, top, bottom } = element.getBoundingClientRect();
      return { left, right, top, bottom };
    });
    if (orientation === "vertical") {
      expect(dialogBounds.left).toBeGreaterThanOrEqual(0);
      expect(dialogBounds.right).toBeLessThanOrEqual(offset);
    } else {
      expect(dialogBounds.top).toBeGreaterThanOrEqual(0);
      expect(dialogBounds.bottom).toBeLessThanOrEqual(offset);
    }
    await page.keyboard.press("Escape");

    if (viewport.width < 768) {
      await page.locator("header .site-container > details > summary").click();
    }
    const languageTrigger = page
      .locator("[data-language-trigger]:visible")
      .first();
    await languageTrigger.click();
    const panel = page.locator("[data-language-panel]:visible").first();
    await expect(panel).toBeVisible();
    const panelBounds = await panel.evaluate((element) => {
      const { left, right, top, bottom } = element.getBoundingClientRect();
      return { left, right, top, bottom };
    });
    if (orientation === "vertical") {
      expect(panelBounds.left).toBeGreaterThanOrEqual(0);
      expect(panelBounds.right).toBeLessThanOrEqual(offset);
    } else {
      expect(panelBounds.top).toBeGreaterThanOrEqual(0);
      expect(panelBounds.bottom).toBeLessThanOrEqual(offset);
    }
    await cdp.detach();
  });
}
