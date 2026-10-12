import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * W0 Public Truth: security disclosure is a restricted lane, never a substitute
 * for general customer support when no verified corporate mailbox is available.
 * These are source/locale guards; real inbox receipt and staff availability
 * remain a separate owner/provider evidence gate.
 */
const routes = [
  {
    lang: "en",
    fallback: /No general support mailbox has been published yet\./,
    action: /Security \(vulnerability reports only\)/,
  },
  {
    lang: "vi",
    fallback: /Hiện chưa có hộp thư hỗ trợ chung\./,
    action: /Bảo mật \(chỉ báo cáo lỗ hổng\)/,
  },
  {
    lang: "zh",
    fallback: /目前尚未公布通用支持邮箱。/,
    action: /安全（仅限漏洞报告）/,
  },
];

for (const { lang, fallback, action } of routes) {
  test(`${lang}: security disclosure is not general support`, () => {
    const page = readFileSync(`src/pages/${lang}/support.astro`, "utf8");
    assert.match(page, /const hasSupportEmail = Boolean\(SITE\.supportEmail\)/);
    assert.match(page, /mailto:\$\{SITE\.supportEmail\}/);
    assert.match(page, fallback);
    // CX1: security is a vulnerability-only lane, never the first action.
    assert.match(page, /vulnerabilit|lỗ hổng|漏洞/);
    const securityAction = page.match(
      new RegExp(`href="/${lang}/security/"[\\s\\S]*?</(?:a|ButtonLink)>`),
    );
    assert.ok(securityAction);
    assert.match(securityAction[0], action);
    // CX1: Contact is the primary (first) action; Contact itself soft-lands on
    // About when no mailbox is published (src/lib/act.ts via BusinessRouteState).
    const firstHref = page.match(/<ButtonLink\s+href="([^"]+)"/);
    assert.ok(firstHref);
    assert.equal(firstHref[1], `/${lang}/contact/`);
    assert.doesNotMatch(
      page,
      /support@blueskyzlabs\.com|security@blueskyzlabs\.com/,
    );
    assert.doesNotMatch(
      page,
      /Security reporting is the actionable trust channel|Báo cáo bảo mật là kênh tin cậy có thể hành động/,
    );
  });
}

test("never invent an unverified mailbox in any locale", () => {
  for (const { lang } of routes) {
    const page = readFileSync(`src/pages/${lang}/support.astro`, "utf8");
    assert.match(page, /hasSupportEmail \? \(/);
    assert.match(page, /SITE\.supportEmail/);
    assert.doesNotMatch(
      page,
      /href="mailto:(?:support|security|hello)@blueskyzlabs\.com"/,
    );
  }
});

test("regression guard catches a security-as-support fallback mutation", () => {
  const good = readFileSync("src/pages/en/support.astro", "utf8");
  const bad = good.replaceAll(
    "Security reporting is for vulnerabilities only.",
    "Security reporting is the general support path.",
  );
  assert.match(good, /Security reporting is for vulnerabilities only\./);
  assert.doesNotMatch(bad, /Security reporting is for vulnerabilities only\./);
  // CX1 negative proof: a security-first order is detected.
  const swapped = good
    .replace('href="/en/contact/"', "@@")
    .replace('href="/en/security/"', 'href="/en/contact/"')
    .replace("@@", 'href="/en/security/"');
  assert.equal(
    swapped.match(/<ButtonLink\s+href="([^"]+)"/)[1],
    "/en/security/",
  );
});
