import { expect, test } from "@playwright/test";
import { startFixtureServer } from "./helpers/parity-fixture";

const THEATRE = "[data-flagship-theatre]";
const VISUAL = "[data-product-visual]";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, readableFloor: 520 },
  { name: "mobile", width: 390, height: 844, readableFloor: 280 },
] as const;

test.describe("C3 ProductVisual — fixture-backed screenshot truth", () => {
  let origin = "";
  let closeServer = () => Promise.resolve();

  test.beforeAll(async () => {
    const server = await startFixtureServer();
    origin = server.origin;
    closeServer = server.close;
  });

  test.afterAll(async () => {
    await closeServer();
  });

  for (const viewport of VIEWPORTS) {
    test(`${viewport.name}: one intrinsic accessible visual stays readable without overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto(`${origin}/product-acts/`);

      const visual = page.locator(`${THEATRE} ${VISUAL}`);
      await expect(visual).toHaveCount(1);

      const image = visual.locator("img");
      await expect(image).toHaveAttribute(
        "src",
        "/products/fixtures/fixture-flagship.png",
      );
      await expect(image).toHaveAttribute(
        "alt",
        "Fixture flagship product screenshot",
      );
      await expect(image).toHaveAttribute("width", "1280");
      await expect(image).toHaveAttribute("height", "800");
      await expect(image).toHaveAttribute("loading", "lazy");
      await expect(image).toHaveAttribute("decoding", "async");

      const imageBox = await image.boundingBox();
      expect(
        imageBox,
        "product screenshot must be rendered and measurable",
      ).not.toBeNull();
      expect(imageBox!.width).toBeGreaterThanOrEqual(viewport.readableFloor);
      expect(imageBox!.x).toBeGreaterThanOrEqual(0);
      expect(imageBox!.x + imageBox!.width).toBeLessThanOrEqual(
        viewport.width + 1,
      );

      const horizontalOverflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(horizontalOverflow).toBe(false);
    });
  }
});

test("real site fabricates no product visual while screenshot truth is unavailable", async ({
  page,
}) => {
  await page.goto("/en/");
  await expect(page.locator(VISUAL)).toHaveCount(0);
  await expect(page.locator('[data-product-continuity="media"]')).toHaveCount(
    0,
  );
});
