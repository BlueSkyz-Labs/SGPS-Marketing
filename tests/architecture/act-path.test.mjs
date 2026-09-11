import assert from "node:assert/strict";
import test from "node:test";
import {
  emptyRegistryPrimaryCta,
  emptyRegistrySecondaryCta,
} from "../../src/lib/act.ts";

test("empty registry primary prefers Contact only when email exists", () => {
  assert.deepEqual(emptyRegistryPrimaryCta("hello@blueskyz.labs", "en"), {
    href: "/en/contact/",
    label: "Contact us",
  });
  assert.deepEqual(emptyRegistryPrimaryCta(null, "en"), {
    href: "/en/about/",
    label: "About BlueSkyz",
  });
  assert.deepEqual(emptyRegistrySecondaryCta(null, "en"), {
    href: "/en/security/",
    label: "Security",
  });
  assert.deepEqual(emptyRegistrySecondaryCta("hello@blueskyz.labs", "en"), {
    href: "/en/about/",
    label: "About BlueSkyz",
  });
});

test("empty registry CTA paths and labels are locale-aware", () => {
  assert.deepEqual(emptyRegistryPrimaryCta(null, "vi"), {
    href: "/vi/about/",
    label: "Về BlueSkyz",
  });
  assert.deepEqual(emptyRegistrySecondaryCta(null, "vi"), {
    href: "/vi/security/",
    label: "Bảo mật",
  });
  assert.deepEqual(emptyRegistryPrimaryCta("hello@blueskyz.labs", "vi"), {
    href: "/vi/contact/",
    label: "Liên hệ",
  });
});
