import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const cases = [
  { lang: "en", boundary: "not business or general enquiries" },
  { lang: "vi", boundary: "không phải kênh liên hệ kinh doanh" },
  { lang: "zh", boundary: "不是商务或一般咨询通道" },
];

for (const { lang, boundary } of cases) {
  test(`${lang}: business and security remain separate`, () => {
    const page = readFileSync(`src/pages/${lang}/contact.astro`, "utf8");
    assert.match(page, /hasBusinessEmail = Boolean\(SITE\.contactEmail\)/);
    assert.match(page, /mailto:\$\{SITE\.contactEmail\}/);
    assert.match(page, /SECURITY_ADVISORY_URL/);
    assert.ok(page.includes(boundary));
    assert.doesNotMatch(
      page,
      /support@blueskyzlabs\.com|security@blueskyzlabs\.com/,
    );
  });
}

test("mutated security fallback fails", () => {
  const source = readFileSync("src/pages/en/contact.astro", "utf8");
  const altered = source.replace(
    "not business or general enquiries",
    "for business and general enquiries",
  );
  assert.ok(source.includes(cases[0].boundary));
  assert.ok(!altered.includes(cases[0].boundary));
});
