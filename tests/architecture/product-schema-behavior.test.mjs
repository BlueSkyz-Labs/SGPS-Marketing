import assert from "node:assert/strict";
import test from "node:test";
import {
  isPublicClaimHttpsUrl,
  productSchema,
} from "../../src/lib/product-schema.ts";
import {
  LIFECYCLE_CTA_VERBS,
  LIFECYCLE_CTA_VERB_LABELS,
  resolveLifecycleCta,
} from "../../src/lib/lifecycle-cta.ts";

function baseProduct(overrides = {}) {
  return {
    slug: "demo-product",
    name: "Demo Product",
    shortDescription: "A truthful demo product entry for schema probes.",
    lifecycle: "active",
    availability: "public",
    publicLabel: "Available",
    audience: ["individual"],
    jobs: ["Understand status"],
    capabilities: ["Shows status", "Links to proof"],
    platforms: ["web"],
    primaryAction: {
      type: "open",
      label: "Open product",
      href: "https://product.blueskyz.labs/",
    },
    proof: {
      publicUrl: "https://product.blueskyz.labs/",
    },
    endorsement: "A BlueSkyz Labs product",
    featuredTier: "featured",
    displayOrder: 1,
    public: true,
    sourceRevision: "abcdef1",
    lastReviewedAt: "2026-09-04",
    ...overrides,
  };
}

test("isPublicClaimHttpsUrl rejects preview and documentation hosts", () => {
  assert.equal(isPublicClaimHttpsUrl("https://product.blueskyz.labs/"), true);
  assert.equal(
    isPublicClaimHttpsUrl("https://blueskyz-web.thinhnguyen-km10.workers.dev/"),
    false,
  );
  assert.equal(isPublicClaimHttpsUrl("https://localhost/app"), false);
  assert.equal(isPublicClaimHttpsUrl("https://127.0.0.1/app"), false);
  assert.equal(isPublicClaimHttpsUrl("https://example.com/app"), false);
  assert.equal(isPublicClaimHttpsUrl("http://product.blueskyz.labs/"), false);
});

test("public product rejects private availability", () => {
  const result = productSchema.safeParse(
    baseProduct({ availability: "private" }),
  );
  assert.equal(result.success, false);
  const messages = result.success
    ? []
    : result.error.issues.map((issue) => issue.message);
  assert.ok(
    messages.some((message) =>
      message.includes("public product cannot have private availability"),
    ),
  );
});

test("non-public draft may use private availability", () => {
  const result = productSchema.safeParse(
    baseProduct({
      public: false,
      availability: "private",
      publicLabel: "In development",
      lifecycle: "development",
      capabilities: undefined,
    }),
  );
  assert.equal(result.success, true);
});

test("public product rejects incoherent publicLabel vs lifecycle", () => {
  const result = productSchema.safeParse(
    baseProduct({
      publicLabel: "Available",
      lifecycle: "concept",
      availability: "public",
    }),
  );
  assert.equal(result.success, false);
  const messages = result.success
    ? []
    : result.error.issues.map((issue) => issue.message);
  assert.ok(
    messages.some((message) =>
      /publicLabel Available is incoherent with lifecycle concept/.test(
        message,
      ),
    ),
  );
});

test("public product rejects workers.dev claim URLs", () => {
  const result = productSchema.safeParse(
    baseProduct({
      primaryAction: {
        type: "open",
        label: "Open product",
        href: "https://demo.workers.dev/",
      },
      proof: {
        publicUrl: "https://demo.workers.dev/",
      },
    }),
  );
  assert.equal(result.success, false);
});

test("coherent public Available product parses", () => {
  const result = productSchema.safeParse(baseProduct());
  assert.equal(result.success, true);
});

test("isPublicClaimHttpsUrl rejects pages.dev and tonydemo staging hosts", () => {
  assert.equal(isPublicClaimHttpsUrl("https://app.pages.dev/"), false);
  assert.equal(isPublicClaimHttpsUrl("https://sotro.tonydemo.com/"), false);
  assert.equal(isPublicClaimHttpsUrl("https://demo.workers.dev./"), false);
});

test("immature lifecycles cannot claim Try on primary or secondary actions", () => {
  for (const lifecycle of ["concept", "prototype", "development"]) {
    const primary = productSchema.safeParse(
      baseProduct({
        public: false,
        lifecycle,
        publicLabel: "In development",
        availability: "waitlist",
        capabilities: undefined,
        primaryAction: {
          type: "try",
          label: "Try",
          href: "https://product.blueskyz.labs/",
        },
      }),
    );
    assert.equal(
      primary.success,
      false,
      `primary try allowed for ${lifecycle}`,
    );

    const secondary = productSchema.safeParse(
      baseProduct({
        public: false,
        lifecycle,
        publicLabel: "In development",
        availability: "waitlist",
        capabilities: undefined,
        primaryAction: {
          type: "waitlist",
          label: "Join waitlist",
          href: "https://product.blueskyz.labs/",
        },
        secondaryAction: {
          type: "try",
          label: "Try",
          href: "https://product.blueskyz.labs/try",
        },
      }),
    );
    assert.equal(
      secondary.success,
      false,
      `secondary try allowed for ${lifecycle}`,
    );
  }
});

test("waitlist availability cannot claim Try", () => {
  const result = productSchema.safeParse(
    baseProduct({
      public: false,
      lifecycle: "beta",
      publicLabel: "Beta",
      availability: "waitlist",
      capabilities: undefined,
      primaryAction: {
        type: "try",
        label: "Try",
        href: "https://product.blueskyz.labs/",
      },
    }),
  );
  assert.equal(result.success, false);
});

// ---------------------------------------------------------------------------
// Plan v5 W3.2 — lifecycle → CTA mapper (fail-closed Try gate)
// ---------------------------------------------------------------------------

/** Minimal mapper input; a mutated product record, never a registry entry. */
function ctaProduct(overrides = {}) {
  return {
    slug: "demo-product",
    lifecycle: "development",
    availability: "preview",
    primaryActionHref: "https://blueskyzlabs.com/en/products/demo-product/",
    ...overrides,
  };
}

const ALL_AVAILABILITIES = [
  "private",
  "waitlist",
  "preview",
  "public",
  "invite-only",
  "unavailable",
];

test("negative proof: a development product can never map to Try", () => {
  // Mutated fixture: the destination *is* an allow-listed first-party product
  // origin, so only the recorded lifecycle/availability can withhold Try.
  for (const lifecycle of ["concept", "prototype", "development"]) {
    for (const availability of ALL_AVAILABILITIES) {
      for (const lang of ["en", "vi", "zh", "zh-hant"]) {
        const cta = resolveLifecycleCta(
          ctaProduct({
            lifecycle,
            availability,
            primaryActionHref: "https://demo-product.blueskyzlabs.com/",
          }),
          lang,
        );
        assert.notEqual(
          cta.verb,
          "try",
          `${lifecycle}/${availability}/${lang} must never render Try`,
        );
        assert.equal(
          cta.href,
          `/${lang}/products/demo-product/`,
          `${lifecycle}/${availability}/${lang} must stay on the recorded status page`,
        );
        assert.equal(cta.external, false);
        assert.notEqual(cta.label, "Try");
      }
    }
  }
});

test("Try requires public availability even on a mature lifecycle", () => {
  for (const lifecycle of ["beta", "active", "maintenance"]) {
    for (const availability of ALL_AVAILABILITIES.filter(
      (value) => value !== "public",
    )) {
      const cta = resolveLifecycleCta(
        ctaProduct({
          lifecycle,
          availability,
          primaryActionHref: "https://demo-product.blueskyzlabs.com/",
        }),
        "en",
      );
      assert.notEqual(
        cta.verb,
        "try",
        `${lifecycle}/${availability} must not render Try`,
      );
      assert.equal(cta.href, "/en/products/demo-product/");
    }
  }

  for (const lifecycle of ["sunset", "archived"]) {
    const cta = resolveLifecycleCta(
      ctaProduct({
        lifecycle,
        availability: "unavailable",
        primaryActionHref: "https://demo-product.blueskyzlabs.com/",
      }),
      "en",
    );
    assert.notEqual(cta.verb, "try", `${lifecycle} must not render Try`);
  }
});

test("Try requires an allow-listed first-party HTTPS origin", () => {
  const rejected = [
    "https://blueskyzlabs.com/en/products/demo-product/",
    "https://other-product.blueskyzlabs.com/",
    "http://demo-product.blueskyzlabs.com/",
    "https://demo-product.blueskyzlabs.com.evil.test/",
    "https://demo-product.blueskyzlabs.com@evil.test/",
    "https://visitor@demo-product.blueskyzlabs.com/",
    "https://demo-product.blueskyzlabs.com:444/",
    "https://demo-product.blueskyzlabs.com/?ref=attacker",
    "https://demo-product.blueskyzlabs.com/#session",
    "https://demo-product.workers.dev/",
    "https://demo-product.pages.dev/",
    "https://demo-product.tonydemo.com/",
    "https://demo-product.blueskyzlabs.com/ ",
    "not a URL",
  ];
  for (const href of rejected) {
    const cta = resolveLifecycleCta(
      ctaProduct({
        lifecycle: "active",
        availability: "public",
        primaryActionHref: href,
      }),
      "en",
    );
    assert.notEqual(cta.verb, "try", `Try destination accepted: ${href}`);
    assert.equal(cta.href, "/en/products/demo-product/", href);
    assert.equal(cta.external, false, href);
  }
});

test("positive control: public availability + first-party origin maps to Try", () => {
  const root = resolveLifecycleCta(
    ctaProduct({
      lifecycle: "active",
      availability: "public",
      primaryActionHref: "https://demo-product.blueskyzlabs.com/",
    }),
    "en",
  );
  assert.deepEqual(root, {
    verb: "try",
    label: "Try",
    href: "https://demo-product.blueskyzlabs.com/",
    external: true,
  });

  const withPath = resolveLifecycleCta(
    ctaProduct({
      lifecycle: "beta",
      availability: "public",
      primaryActionHref: "https://demo-product.blueskyzlabs.com/app",
    }),
    "vi",
  );
  assert.equal(withPath.verb, "try");
  assert.equal(withPath.label, "Dùng thử");
  assert.equal(withPath.href, "https://demo-product.blueskyzlabs.com/app");
});

test("an unknown lifecycle value fails closed", () => {
  const cta = resolveLifecycleCta(
    ctaProduct({
      lifecycle: "mystery",
      availability: "public",
      primaryActionHref: "https://demo-product.blueskyzlabs.com/",
    }),
    "en",
  );
  assert.equal(cta.verb, "learn");
  assert.equal(cta.href, "/en/products/demo-product/");
  assert.equal(cta.external, false);
});

test("non-Try destinations stay on the localized recorded-status page", () => {
  const cases = [
    ["development", "public", "https://demo-product.blueskyzlabs.com/"],
    [
      "prototype",
      "preview",
      "https://blueskyzlabs.com/en/products/demo-product/",
    ],
    ["beta", "preview", "https://demo-product.blueskyzlabs.com/"],
    ["beta", "invite-only", "https://demo-product.blueskyzlabs.com/"],
    ["sunset", "unavailable", "https://demo-product.blueskyzlabs.com/"],
    [
      "archived",
      "unavailable",
      "https://blueskyzlabs.com/en/products/demo-product/",
    ],
  ];
  for (const [lifecycle, availability, href] of cases) {
    for (const lang of ["en", "vi", "zh", "zh-hant"]) {
      const cta = resolveLifecycleCta(
        ctaProduct({ lifecycle, availability, primaryActionHref: href }),
        lang,
      );
      assert.notEqual(cta.verb, "try", `${lifecycle}/${availability}/${lang}`);
      assert.equal(cta.href, `/${lang}/products/demo-product/`);
      assert.equal(cta.label, LIFECYCLE_CTA_VERB_LABELS[cta.verb][lang]);
    }
  }
});

test("CTA verb vocabulary is bounded and fully localized", () => {
  assert.deepEqual([...LIFECYCLE_CTA_VERBS].sort(), [
    "learn",
    "try",
    "view-development-status",
  ]);
  for (const verb of LIFECYCLE_CTA_VERBS) {
    const label = LIFECYCLE_CTA_VERB_LABELS[verb];
    for (const lang of ["en", "vi", "zh", "zh-hant"]) {
      assert.ok(label[lang].trim().length > 0, `${verb}/${lang}`);
    }
    assert.notEqual(label.vi, label.en, `${verb} must be translated for vi`);
    assert.notEqual(label.zh, label.en, `${verb} must be translated for zh`);
  }
});

test("applicationCategory is optional and limited to schema.org categories", () => {
  assert.equal(productSchema.safeParse(baseProduct()).success, true);
  assert.equal(
    productSchema.safeParse(
      baseProduct({ applicationCategory: "BusinessApplication" }),
    ).success,
    true,
  );
  // negative proof: an invented or misspelled category is rejected
  for (const value of ["Landlord", "businessapplication", ""]) {
    assert.equal(
      productSchema.safeParse(baseProduct({ applicationCategory: value }))
        .success,
      false,
      value,
    );
  }
});
