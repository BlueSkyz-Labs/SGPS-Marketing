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
    fallback:
      /Security reporting is for suspected\s+vulnerabilities, not routine customer support\./,
    action: /Report a security vulnerability/,
  },
  {
    lang: "vi",
    fallback:
      /Báo cáo bảo mật chỉ dành cho lỗ hổng nghi vấn, không tiếp nhận\s+yêu cầu hỗ trợ thông thường\./,
    action: /Báo cáo lỗ hổng bảo mật/,
  },
  {
    lang: "zh",
    fallback: /安全漏洞报告仅用于疑似安全问题，不接受一般客户支持请求。/,
    action: /报告安全漏洞/,
  },
];

for (const { lang, fallback, action } of routes) {
  test(`${lang}: security disclosure is not general support`, () => {
    const page = readFileSync(`src/pages/${lang}/support.astro`, "utf8");
    assert.match(
      page,
      /const hasBusinessEmail = Boolean\(SITE\.contactEmail\)/,
    );
    assert.match(page, /mailto:\$\{SITE\.contactEmail\}/);
    assert.match(page, fallback);
    assert.match(page, action);
    assert.match(page, new RegExp(`href="/${lang}/security/"`));
    assert.match(page, new RegExp(`href="/${lang}/contact/"`));
    assert.match(page, new RegExp(`href="/${lang}/about/"`));
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
    assert.match(page, /hasBusinessEmail \? \(/);
    assert.match(page, /SITE\.contactEmail/);
    assert.doesNotMatch(
      page,
      /href="mailto:(?:support|security|hello)@blueskyzlabs\.com"/,
    );
  }
});

test("regression guard catches a security-as-support fallback mutation", () => {
  const good = readFileSync("src/pages/en/support.astro", "utf8");
  const bad = good.replace(
    "Security reporting is for suspected",
    "Security reporting is the general support path. It is for suspected",
  );
  assert.match(good, /Security reporting is for suspected/);
  assert.doesNotMatch(bad, /Security reporting is for suspected/);
});
