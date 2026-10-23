/**
 * Audit IX-01: the Journal index and posts end in the shared Next steps band
 * (JourneyBar) instead of a dead end, with labels already approved for other
 * routes' bands (Product status, Verify, Contact) and no new copy.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { getJourneyActions } from "../../src/lib/journey.ts";

const LANGS = ["en", "vi", "zh", "zh-hant"];
const SEGMENTS = ["products", "verify", "contact"];

for (const lang of LANGS) {
  test(`${lang}: journal index and post pages get the Next steps band`, () => {
    for (const path of [`/${lang}/journal/`, `/${lang}/journal/some-post/`]) {
      const actions = getJourneyActions(path, lang);
      assert.deepEqual(
        actions.map((a) => a.href),
        SEGMENTS.map((s) => `/${lang}/${s}/`),
        path,
      );
      // Labels are the ones the other bands already use.
      const known = new Set(
        ["/about/", "/products/", "/contact/", "/support/"].flatMap((tail) =>
          getJourneyActions(`/${lang}${tail}`, lang).map((a) => a.label),
        ),
      );
      for (const action of actions) {
        assert.ok(known.has(action.label), `${lang} ${action.label} is reused`);
      }
    }
  });
}

test("negative proof: a route without a journey entry gets no band", () => {
  assert.deepEqual(getJourneyActions("/en/not-a-route/", "en"), []);
  assert.deepEqual(getJourneyActions("/en/journal/", "vi"), []);
});
