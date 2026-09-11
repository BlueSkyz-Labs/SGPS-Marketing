import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = "http://127.0.0.1:3000";
const OUT = ".hermes/exp-audit/wave1";
mkdirSync(OUT, { recursive: true });

const targets = [
  { name: "en-home-desktop", url: "/en/", w: 1440, h: 900 },
  { name: "en-home-mobile", url: "/en/", w: 390, h: 844 },
  { name: "vi-home-desktop", url: "/vi/", w: 1440, h: 900 },
  { name: "en-contact-desktop", url: "/en/contact/", w: 1440, h: 900 },
  { name: "vi-contact-desktop", url: "/vi/contact/", w: 1440, h: 900 },
  { name: "en-privacy-desktop", url: "/en/privacy/", w: 1440, h: 900 },
  { name: "vi-support-desktop", url: "/vi/support/", w: 1440, h: 900 },
  { name: "en-404-desktop", url: "/en/404/", w: 1440, h: 900 },
  { name: "en-products-desktop", url: "/en/products/", w: 1440, h: 900 },
];

const browser = await chromium.launch({ channel: "chrome" });
for (const t of targets) {
  const page = await browser.newPage({ viewport: { width: t.w, height: t.h } });
  await page.goto(BASE + t.url, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${OUT}/${t.name}-full.png`, fullPage: true });
  console.log(`captured ${t.name}`);
  await page.close();
}
await browser.close();
console.log("DONE");
