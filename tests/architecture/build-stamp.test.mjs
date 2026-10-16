import assert from "node:assert/strict";
import test from "node:test";

import { checkStamp } from "../e2e/build-stamp.mjs";

// WP-12 (LSN-marketing-002): the local stale-build guard.

test("a build stamped with HEAD is allowed", () => {
  assert.equal(checkStamp("abc123", "abc123"), null);
});

test("negative proof: a build from another commit is refused", () => {
  assert.match(
    checkStamp("old111", "new222"),
    /made from old111, HEAD is new222/,
  );
});

test("negative proof: a missing stamp is refused", () => {
  assert.match(checkStamp(null, "abc123"), /missing/);
});
