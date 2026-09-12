import { test, expect } from "@playwright/test";
import { execSync } from "node:child_process";
import { createServer, type Server } from "node:http";
import {
  readFileSync,
  existsSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";

const FIXTURE_ROOT = resolve("tests/e2e/fixtures/parity-app");
const FIXTURE_DIST = join(FIXTURE_ROOT, "dist");

/** Real-site EN/VI parity while the production registry is intentionally empty. */
test.describe("bilingual parity — live routes (empty registry)", () => {
  const EN_LEAKS = [
    "Featured products",
    "Explore all products",
    "View profile",
    "Contact us",
    "Search pages",
    "Verified public artifact",
  ];

  test("Vietnamese pages never leak English shared-component copy", async ({
    page,
  }) => {
    for (const route of ["/vi/", "/vi/products/", "/vi/about/"]) {
      await page.goto(route);
      const body = await page.locator("body").innerText();
      for (const leak of EN_LEAKS) {
        expect(body, `${route} must not leak "${leak}"`).not.toContain(leak);
      }
    }
  });

  test("header CTA is locale-correct on both locales (empty registry)", async ({
    page,
  }) => {
    await page.goto("/vi/");
    const viCta = page.locator('header nav[aria-label="Primary"] a').last();
    await expect(viCta).toHaveAttribute("href", /^\/vi\//);

    await page.goto("/en/");
    const enCta = page.locator('header nav[aria-label="Primary"] a').last();
    await expect(enCta).toHaveAttribute("href", /^\/en\//);
  });

  test("primary and footer links on /vi/ stay in the vi locale", async ({
    page,
  }) => {
    await page.goto("/vi/");
    const hrefs = await page
      .locator(
        'header nav[aria-label="Primary"] a:not([hreflang]), footer a:not([hreflang])',
      )
      .evaluateAll((els) =>
        els.map((el) => el.getAttribute("href") ?? "").filter(Boolean),
      );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const isInternal = href.startsWith("/");
      if (!isInternal) continue;
      expect(href, `internal link ${href} must stay in /vi/`).toMatch(
        /^\/vi\//,
      );
    }
  });
});

/** Product-present parity via the throwaway fixture app (real components). */
test.describe("bilingual parity — product-present fixture", () => {
  let server: Server;
  let origin = "";

  const distReady = () => {
    const entry = join(FIXTURE_DIST, "en", "index.html");
    if (!existsSync(entry)) return false;
    return readFileSync(entry, "utf8").includes("</html>");
  };

  const BUILD_LOCK = join(tmpdir(), "sgps-parity-fixture-build.lock");

  /** Build once even when several Playwright workers race on first use. */
  const ensureFixtureBuilt = async () => {
    const deadline = Date.now() + 120_000;
    while (Date.now() < deadline) {
      if (distReady()) return;
      if (existsSync(BUILD_LOCK)) {
        const age = Date.now() - statSync(BUILD_LOCK).mtimeMs;
        if (age > 120_000) unlinkSync(BUILD_LOCK);
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
      writeFileSync(BUILD_LOCK, String(process.pid));
      try {
        execSync("pnpm exec astro build --root tests/e2e/fixtures/parity-app", {
          cwd: process.cwd(),
          stdio: "pipe",
        });
      } finally {
        try {
          unlinkSync(BUILD_LOCK);
        } catch {}
      }
    }
    if (!distReady()) throw new Error("parity fixture build did not complete");
  };

  test.beforeAll(async () => {
    await ensureFixtureBuilt();
    server = createServer((req, res) => {
      const urlPath = (req.url ?? "/").split("?")[0] ?? "/";
      let filePath = join(FIXTURE_DIST, urlPath);
      if (urlPath.endsWith("/")) filePath = join(filePath, "index.html");
      if (!existsSync(filePath) || extname(filePath) === "") {
        filePath = join(filePath, "index.html");
      }
      if (!existsSync(filePath)) {
        res.statusCode = 404;
        res.end("not found");
        return;
      }
      const type = extname(filePath) === ".html" ? "text/html" : "text/plain";
      res.setHeader("content-type", `${type}; charset=utf-8`);
      res.end(readFileSync(filePath));
    });
    await new Promise<void>((ok) => server.listen(0, "127.0.0.1", ok));
    const address = server.address();
    if (address && typeof address === "object") {
      origin = `http://127.0.0.1:${address.port}`;
    }
  });

  test.afterAll(async () => {
    await new Promise<void>((ok) => server?.close(() => ok()));
  });

  test("fixture EN renders localized product UI with en-prefixed paths", async ({
    page,
  }) => {
    await page.goto(`${origin}/en/`);
    await expect(page.getByText("Featured products").first()).toBeVisible();
    await expect(
      page.getByText("Explore all products").first(),
    ).toHaveAttribute("href", "/en/products/");
    const profileLinks = page.getByText("View profile");
    await expect(profileLinks.first()).toHaveAttribute(
      "href",
      "/en/products/fixture-product/",
    );
    await page
      .locator(".evidence-details__more")
      .first()
      .evaluate((el) => {
        (el as HTMLDetailsElement).open = true;
      });
    await expect(
      page.getByText("Verified public artifact — not a concept mock.").first(),
    ).toBeVisible();
  });

  test("fixture VI renders localized product UI with vi-prefixed paths", async ({
    page,
  }) => {
    await page.goto(`${origin}/vi/`);
    await expect(page.getByText("Sản phẩm nổi bật").first()).toBeVisible();
    await expect(
      page.getByText("Khám phá tất cả sản phẩm").first(),
    ).toHaveAttribute("href", "/vi/products/");
    await expect(page.getByText("Xem hồ sơ").first()).toHaveAttribute(
      "href",
      "/vi/products/fixture-product/",
    );
    await page
      .locator(".evidence-details__more")
      .first()
      .evaluate((el) => {
        (el as HTMLDetailsElement).open = true;
      });
    await expect(
      page
        .getByText(
          "Bằng chứng công khai đã xác minh — không phải bản mô phỏng ý tưởng.",
        )
        .first(),
    ).toBeVisible();
  });

  test("fixture pages never emit bare /products/ product links", async ({
    page,
  }) => {
    for (const route of ["en", "vi"]) {
      await page.goto(`${origin}/${route}/`);
      const hrefs = await page
        .locator("a")
        .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
      for (const href of hrefs) {
        expect(href, `bare /products/ link on /${route}/`).not.toBe(
          "/products/",
        );
        expect(href).not.toMatch(/^\/products\//);
      }
    }
  });
});
