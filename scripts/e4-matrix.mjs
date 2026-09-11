#!/usr/bin/env node
/**
 * S+ E4 automated viewport/interaction matrix (Task 13).
 * Sweeps key routes across engines, viewports, keyboard-only flow, reduced
 * motion, and 200% text zoom. Prints one line per check; exits non-zero on
 * any failure. Human E4 (real-user comprehension) is a separate evidence
 * class and is never produced by this script.
 *
 * Usage: node scripts/e4-matrix.mjs   (expects a server at http://127.0.0.1:3000)
 */
import { chromium, firefox, webkit } from "@playwright/test";

const BASE = process.env.E4_BASE_URL ?? "http://127.0.0.1:3000";
const VIEWPORTS = [320, 360, 390, 393, 430, 1280, 1440, 1920];
const ENGINES = [
  ["chromium", chromium],
  ["firefox", firefox],
  ["webkit", webkit],
];

let failures = 0;
const pass = (name) => console.log(`PASS ${name}`);
const fail = (name, message) => {
  failures += 1;
  console.error(`FAIL ${name}: ${message}`);
};

async function check(name, fn) {
  try {
    await fn();
    pass(name);
  } catch (error) {
    fail(name, error.message);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function noHorizontalOverflow(page) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  assert(!overflow, "horizontal overflow detected");
}

for (const [engineName, engine] of ENGINES) {
  const browser = await engine.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  for (const width of VIEWPORTS) {
    await page.setViewportSize({ width, height: 900 });
    await check(
      `${engineName} ${width}px /en/ renders with no overflow`,
      async () => {
        await page.goto(`${BASE}/en/`, { waitUntil: "networkidle" });
        await noHorizontalOverflow(page);
        assert(
          await page.locator("#hero-title").isVisible(),
          "hero h1 missing",
        );
        assert(
          await page.locator("[data-intent-lens]").isVisible(),
          "intent lens missing",
        );
        assert(
          (await page.locator("[data-principle-matrix]").count()) === 1,
          "principle matrix missing",
        );
        assert(
          (await page.locator("[data-atlas]").count()) === 1,
          "atlas missing",
        );
      },
    );
  }

  await check(
    `${engineName} navigator shortcut + Escape (1440px)`,
    async () => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${BASE}/en/`, { waitUntil: "networkidle" });
      await page.keyboard.press("Control+k");
      const dialog = page.locator("dialog[data-command-navigator]");
      assert(
        (await dialog.getAttribute("open")) !== null,
        "dialog did not open",
      );
      await page.keyboard.press("Escape");
      assert(
        (await dialog.getAttribute("open")) === null,
        "dialog did not close",
      );
    },
  );

  await check(`${engineName} intent lens interaction (1280px)`, async () => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${BASE}/en/`, { waitUntil: "networkidle" });
    await page
      .locator("[data-intent-lens] button[data-intent='verify-trust']")
      .click();
    const intent = await page.evaluate(
      () => document.documentElement.dataset.intent ?? "",
    );
    assert(intent === "verify-trust", `intent state is "${intent}"`);
  });

  await context.close();

  // Reduced motion sweep.
  const rmContext = await browser.newContext({ reducedMotion: "reduce" });
  const rmPage = await rmContext.newPage();
  await check(
    `${engineName} reduced-motion keeps all content visible`,
    async () => {
      await rmPage.goto(`${BASE}/en/`, { waitUntil: "networkidle" });
      await noHorizontalOverflow(rmPage);
      assert(await rmPage.locator("#hero-title").isVisible(), "hero missing");
      assert(
        (await rmPage.locator("[data-trust-ledger]").count()) === 1,
        "trust ledger missing",
      );
      assert(
        (await rmPage.locator("[data-journey-bar]").count()) === 1,
        "journey bar missing",
      );
    },
  );
  await rmContext.close();

  // 200% text zoom proxy (root font-size doubled; layout uses rem units).
  const zoomContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const zoomPage = await zoomContext.newPage();
  await check(`${engineName} 200% text zoom keeps layout intact`, async () => {
    await zoomPage.goto(`${BASE}/en/`, { waitUntil: "networkidle" });
    await zoomPage.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await noHorizontalOverflow(zoomPage);
    assert(await zoomPage.locator("#hero-title").isVisible(), "hero missing");
  });
  await zoomContext.close();

  await browser.close();
}

// Keyboard-only flow (chromium only; keyboard parity is engine-neutral CSS/DOM).
const kbBrowser = await chromium.launch();
const kbContext = await kbBrowser.newContext({
  viewport: { width: 1280, height: 900 },
});
const kbPage = await kbContext.newPage();
await check(
  "keyboard-only: skip link, nav, intent lens reachable",
  async () => {
    await kbPage.goto(`${BASE}/en/`, { waitUntil: "networkidle" });
    const seen = [];
    for (let i = 0; i < 40; i += 1) {
      await kbPage.keyboard.press("Tab");
      const label = await kbPage.evaluate(() => {
        const el = document.activeElement;
        if (!el) return "";
        return `${el.tagName.toLowerCase()}:${(
          el.getAttribute("aria-label") ??
          el.textContent ??
          ""
        )
          .trim()
          .slice(0, 48)}`;
      });
      seen.push(label);
    }
    const joined = seen.join(" | ");
    assert(/a:skip to main content/i.test(joined), "skip link not reachable");
    assert(
      seen.some((entry) =>
        /evaluate a product|verify trust|understand blueskyz/i.test(entry),
      ),
      "intent lens buttons not reachable via keyboard",
    );
    assert(
      seen.some((entry) =>
        /intelligence\.|elevation\.|trust\.|impact\./i.test(entry),
      ),
      "story spine links not reachable via keyboard",
    );
  },
);
await kbContext.close();
await kbBrowser.close();

if (failures > 0) {
  console.error(`${failures} E4 matrix check(s) failed`);
  process.exit(1);
}
console.log("E4 AUTOMATED MATRIX: ALL CHECKS PASS");
