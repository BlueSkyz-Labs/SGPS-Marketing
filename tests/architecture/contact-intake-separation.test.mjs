import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const cases = [
  { lang: "en", boundary: "is only for suspected vulnerabilities" },
  { lang: "vi", boundary: "không dùng cho hợp tác hay hỗ trợ thông thường" },
  { lang: "zh", boundary: "不接收商务或一般咨询" },
  { lang: "zh-hant", boundary: "不受理商務或一般諮詢" },
];

for (const { lang, boundary } of cases) {
  test(`${lang}: business and security remain separate`, () => {
    const page = readFileSync(`src/pages/${lang}/contact.astro`, "utf8");
    assert.match(page, /<PublicContactEmails/);
    assert.match(page, /SECURITY_ADVISORY_URL/);
    assert.match(page, /boundary="private-reporting"/);
    assert.ok(page.includes(boundary));
    assert.doesNotMatch(page, /SITE\.securityEmail/);
  });
}

test("mailbox roles on Contact are filtered before rendering", () => {
  const component = readFileSync(
    "src/components/empty-state/PublicContactEmails.astro",
    "utf8",
  );
  assert.match(component, /SITE\.contactEmail/);
  assert.match(component, /SITE\.supportEmail/);
  assert.doesNotMatch(component, /SITE\.securityEmail|SITE\.privacyEmail/);
});

test("mutated security fallback fails", () => {
  const source = readFileSync("src/pages/en/contact.astro", "utf8");
  const altered = source.replace(
    "is only for suspected vulnerabilities",
    "is for business and general enquiries",
  );
  assert.ok(source.includes(cases[0].boundary));
  assert.ok(!altered.includes(cases[0].boundary));
});
