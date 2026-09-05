import assert from "node:assert/strict";
import test from "node:test";
import {
  emptyRegistryPrimaryCta,
  emptyRegistrySecondaryCta,
} from "../../src/lib/act.ts";

test("empty registry primary prefers Contact only when email exists", () => {
  assert.deepEqual(emptyRegistryPrimaryCta("hello@blueskyz.labs"), {
    href: "/contact/",
    label: "Contact us",
  });
  assert.deepEqual(emptyRegistryPrimaryCta(null), {
    href: "/about/",
    label: "About BlueSkyz",
  });
  assert.deepEqual(emptyRegistrySecondaryCta(null), {
    href: "/security/",
    label: "Security",
  });
  assert.deepEqual(emptyRegistrySecondaryCta("hello@blueskyz.labs"), {
    href: "/about/",
    label: "About BlueSkyz",
  });
});
