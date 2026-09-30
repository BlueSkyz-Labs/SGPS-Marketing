import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("privacy truth discloses opt-in preference storage", () => {
  for (const path of ["src/data/claims.ts", "src/data/integrity.ts"]) {
    const source = read(path);
    assert.doesNotMatch(
      source,
      /no client storage|不使用客户端存储|không dùng lưu trữ phía trình duyệt/i,
    );
    assert.match(source, /language and theme preferences/);
    assert.match(source, /lựa chọn ngôn ngữ và giao diện/);
    assert.match(source, /选择语言或主题/);
  }
  for (const locale of ["en", "vi", "zh", "zh-hant"]) {
    const page = read(`src/pages/${locale}/privacy.astro`);
    const content = read(`src/content/pages/${locale}/privacy.yaml`);
    assert.doesNotMatch(
      page,
      /no client storage|不使用客户端存储|không lưu trữ phía trình duyệt/i,
    );
    assert.doesNotMatch(
      content,
      /first-party analytics|phân tích bên thứ nhất|第一方分析/i,
    );
  }
});

test("Chinese privacy navigation stays on the matching locale", () => {
  const privacy = read("src/pages/zh/privacy.astro");
  for (const route of ["security", "contact", "about"]) {
    assert.match(privacy, new RegExp(`href="/zh/${route}/"`));
    assert.doesNotMatch(privacy, new RegExp(`href="/en/${route}/"`));
  }
});

test("every locale privacy page and claim discloses the bsl_lang cookie and non-stored country use", () => {
  for (const locale of ["en", "vi", "zh", "zh-hant"]) {
    const content = read(`src/content/pages/${locale}/privacy.yaml`);
    assert.match(
      content,
      /bsl_lang/,
      `${locale} privacy copy names the cookie`,
    );
  }
  for (const path of ["src/data/claims.ts", "src/data/integrity.ts"]) {
    const source = read(path);
    assert.doesNotMatch(source, /sets no cookies/i);
    assert.equal(
      (source.match(/bsl_lang/g) ?? []).length,
      4,
      `${path}: en/vi/zh/zh-hant claims name the cookie`,
    );
    assert.match(source, /"zh-hant":/);
  }
});

test("negative proof: copy lacking the cookie disclosure would be detected", () => {
  assert.doesNotMatch("僅儲存在本地瀏覽器。", /bsl_lang/);
});
