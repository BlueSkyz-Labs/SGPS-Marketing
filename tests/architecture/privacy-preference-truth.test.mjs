import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("public privacy truth acknowledges opt-in language and theme storage", () => {
  for (const path of [
    "src/data/claims.ts",
    "src/data/integrity.ts",
  ]) {
    const source = read(path);
    assert.doesNotMatch(source, /no client storage|不使用客户端存储|không dùng lưu trữ phía trình duyệt/i);
    assert.match(source, /language and theme preferences/);
    assert.match(source, /lựa chọn ngôn ngữ và giao diện/);
    assert.match(source, /选择语言或主题/);
  }
  for (const locale of ["en", "vi", "zh"]) {
    const page = read(`src/pages/${locale}/privacy.astro`);
    const content = read(`src/content/pages/${locale}/privacy.yaml`);
    assert.doesNotMatch(page, /no client storage|不使用客户端存储|không lưu trữ phía trình duyệt/i);
    assert.doesNotMatch(content, /first-party analytics|phân tích bên thứ nhất|第一方分析/i);
  }
});

test("Chinese privacy navigation stays on the matching locale", () => {
  const privacy = read("src/pages/zh/privacy.astro");
  for (const route of ["security", "contact", "about"]) {
    assert.match(privacy, new RegExp(`href="/zh/${route}/"`));
    assert.doesNotMatch(privacy, new RegExp(`href="/en/${route}/"`));
  }
});
