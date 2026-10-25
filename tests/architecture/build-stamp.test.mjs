import assert from "node:assert/strict";
import test from "node:test";

import {
  checkLaneURL,
  checkServedCommit,
  checkStamp,
} from "../e2e/build-stamp.mjs";

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

// 2026-10-24 recurrence: loopback-only lanes and served-build verification.

test("loopback base URLs are accepted", () => {
  for (const url of [
    "http://127.0.0.1:3600",
    "http://localhost:3000/",
    "http://[::1]:3100",
  ]) {
    assert.equal(checkLaneURL(url), null, url);
  }
});

test("negative proof: remote or malformed base URLs are refused", () => {
  for (const url of [
    "https://blueskyzlabs.com",
    "http://127.0.0.1.evil.example",
    "http://192.168.1.5:3000",
    "not a url",
  ]) {
    assert.notEqual(checkLaneURL(url), null, url);
  }
  assert.match(
    checkLaneURL("https://blueskyzlabs.com"),
    /remote base URL is not a local evidence lane/,
  );
});

test("the served build must report HEAD", () => {
  assert.equal(checkServedCommit("abc123", "abc123"), null);
  assert.match(checkServedCommit("old111", "new222"), /another worktree/);
  assert.match(checkServedCommit(null, "abc123"), /does not serve/);
});
