import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  LOCALIZED_404_LANGS,
  publishLocalizedNotFound,
} from "../../src/integrations/localized-not-found.mjs";

const HTML_LANG = { en: "en", vi: "vi", zh: "zh", "zh-hant": "zh-Hant" };

function fakeDist(langs) {
  const root = mkdtempSync(join(tmpdir(), "dist-404-"));
  for (const lang of langs) {
    mkdirSync(join(root, lang, "404"), { recursive: true });
    writeFileSync(
      join(root, lang, "404", "index.html"),
      `<!DOCTYPE html><html lang="${HTML_LANG[lang]}"></html>`,
    );
  }
  return root;
}

test("every locale publishes <lang>/404.html with its own html lang", () => {
  const root = fakeDist(LOCALIZED_404_LANGS);
  try {
    publishLocalizedNotFound(root);
    for (const lang of LOCALIZED_404_LANGS) {
      const file = join(root, lang, "404.html");
      assert.ok(existsSync(file), `${lang}/404.html emitted`);
      assert.match(
        readFileSync(file, "utf8"),
        new RegExp(`<html lang="${HTML_LANG[lang]}"`),
      );
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("negative proof: a missing localized 404 fails the build", () => {
  const root = fakeDist(["en", "vi", "zh"]);
  try {
    assert.throws(() => publishLocalizedNotFound(root), /missing .*zh-hant/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the integration is registered in astro.config.mjs and covers all locales", () => {
  const config = readFileSync("astro.config.mjs", "utf8");
  assert.match(config, /localizedNotFound\(\)/);
  assert.deepEqual([...LOCALIZED_404_LANGS].sort(), [
    "en",
    "vi",
    "zh",
    "zh-hant",
  ]);
});
