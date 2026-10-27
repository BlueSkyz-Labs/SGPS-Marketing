import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * PageSpeed 2026-10-26: public assets that keep their file name when their
 * bytes change (/products, /icons, /brand, /images, /social) get one day of
 * freshness plus a week of stale-while-revalidate. They must never be
 * `immutable` or cached for a year: a recaptured screenshot would then stay
 * stale for returning visitors until the cache expires.
 */
const IN_PLACE = [
  "/products/*",
  "/icons/*",
  "/brand/*",
  "/images/*",
  "/social/*",
];

/** Cache-Control value of an exact path block in a _headers file, or null. */
export function cacheControlFor(headers, path) {
  const lines = headers.split(/\r?\n/);
  const start = lines.findIndex((l) => l === path);
  if (start === -1) return null;
  for (const line of lines.slice(start + 1)) {
    if (!/^\s/.test(line)) break;
    const m = /^\s+Cache-Control:\s*(.+?)\s*$/.exec(line);
    if (m) return m[1];
  }
  return null;
}

/** Problems with the cache policy of one in-place asset path. */
export function inPlaceCacheProblems(value) {
  if (!value) return ["no Cache-Control"];
  const problems = [];
  const maxAge = Number(/max-age=(\d+)/.exec(value)?.[1] ?? NaN);
  if (/immutable/.test(value)) problems.push("immutable");
  if (!(maxAge >= 3600 && maxAge <= 86400))
    problems.push(`max-age ${maxAge} outside 1 h..1 day`);
  if (!/stale-while-revalidate=\d+/.test(value))
    problems.push("no stale-while-revalidate");
  return problems;
}

test("in-place public assets: 1 day fresh + stale-while-revalidate, never immutable", () => {
  const headers = readFileSync("public/_headers", "utf8");
  for (const path of IN_PLACE) {
    assert.deepEqual(
      inPlaceCacheProblems(cacheControlFor(headers, path)),
      [],
      path,
    );
  }
});

test("negative proof: immutable, a year, no SWR or a missing block are detected", () => {
  assert.ok(
    inPlaceCacheProblems("public, max-age=31536000, immutable").length >= 2,
  );
  assert.deepEqual(inPlaceCacheProblems("public, max-age=3600"), [
    "no stale-while-revalidate",
  ]);
  assert.deepEqual(inPlaceCacheProblems(null), ["no Cache-Control"]);
  const headers = readFileSync("public/_headers", "utf8");
  assert.equal(
    cacheControlFor(headers.replace("/images/*\n", "/imgs/*\n"), "/images/*"),
    null,
  );
});
