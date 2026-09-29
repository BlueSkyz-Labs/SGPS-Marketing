/**
 * C2 P3 — synthetic product records for the throwaway parity fixture app.
 *
 * These records exist only so product-present behaviour can be asserted in
 * e2e while the production registry stays intentionally empty. They are
 * deliberately obvious fixtures ("Fixture …"): they must never read as real
 * BlueSkyz Labs products and are never deployed. Production publication truth
 * remains the owner-gated proof-media floor.
 */
export const FIXTURE_FLAGSHIP_SLUG = "fixture-flagship";

interface FixtureProduct {
  data: {
    slug: string;
    name: string;
    publicLabel: string;
    lifecycle: string;
    availability: string;
    shortDescription: string;
    jobs?: string[];
    platforms: string[];
    capabilities: string[];
    i18n?: {
      vi: {
        shortDescription: string;
        jobs: string[];
        capabilities: string[];
        primaryActionLabel: string;
      };
      zh: {
        shortDescription: string;
        jobs: string[];
        capabilities: string[];
        primaryActionLabel: string;
      };
    };
    primaryAction: { href: string; label: string };
    secondaryAction?: { href: string; label: string };
    proof: {
      media: {
        src: string;
        alt: string;
        width: number;
        height: number;
      };
    };
    endorsement: string;
    featuredTier: "hero" | "featured" | "ecosystem";
    displayOrder: number;
  };
}

export const FIXTURE_FLAGSHIP: FixtureProduct = {
  data: {
    slug: FIXTURE_FLAGSHIP_SLUG,
    public: true,
    name: "Fixture Flagship",
    publicLabel: "In development",
    lifecycle: "development",
    availability: "preview",
    shortDescription: "Fixture description for the flagship act.",
    jobs: ["Fixture job one", "Fixture job two"],
    platforms: ["web"],
    capabilities: [
      "Fixture capability one",
      "Fixture capability two",
      "Fixture capability three",
    ],
    i18n: {
      vi: {
        shortDescription: "Mô tả thử nghiệm cho sản phẩm chủ lực.",
        jobs: ["Công việc thử nghiệm một", "Công việc thử nghiệm hai"],
        capabilities: [
          "Phạm vi thử nghiệm một",
          "Phạm vi thử nghiệm hai",
          "Phạm vi thử nghiệm ba",
        ],
        primaryActionLabel: "Liên hệ thử nghiệm",
      },
      zh: {
        shortDescription: "旗舰产品的测试说明。",
        jobs: ["测试工作一", "测试工作二"],
        capabilities: ["测试范围一", "测试范围二", "测试范围三"],
        primaryActionLabel: "联系演示",
      },
    },
    primaryAction: { href: "/en/contact/", label: "Contact" },
    proof: {
      media: {
        src: "/products/fixtures/fixture-flagship.png",
        alt: "Fixture flagship brand identity artwork",
        width: 1280,
        height: 800,
      },
    },
    endorsement: "A BlueSkyz Labs product",
    featuredTier: "hero",
    displayOrder: 1,
  },
};

export const FIXTURE_SECONDARY: FixtureProduct = {
  data: {
    slug: "fixture-secondary",
    public: true,
    name: "Fixture Secondary",
    publicLabel: "Preview",
    lifecycle: "development",
    availability: "preview",
    shortDescription: "Fixture description for a secondary product.",
    platforms: ["web"],
    capabilities: ["Fixture capability one", "Fixture capability two"],
    // Mutated fixture (W3.2 negative proof): an allow-listed first-party
    // product origin that *would* satisfy the Try destination rule. The
    // recorded `development` lifecycle must still block Try in every locale.
    primaryAction: {
      href: "https://fixture-secondary.blueskyzlabs.com/",
      label: "Contact",
    },
    proof: {
      media: {
        src: "/products/fixtures/fixture-secondary.png",
        alt: "Fixture secondary proof media",
        width: 1280,
        height: 800,
      },
    },
    endorsement: "A BlueSkyz Labs product",
    featuredTier: "featured",
    displayOrder: 2,
  },
};

export const FIXTURE_ECOSYSTEM: FixtureProduct = {
  data: {
    slug: "fixture-ecosystem",
    public: true,
    name: "Fixture Ecosystem",
    publicLabel: "Preview",
    lifecycle: "concept",
    availability: "waitlist",
    shortDescription: "Fixture description for an ecosystem product.",
    platforms: ["web"],
    capabilities: ["Fixture capability one", "Fixture capability two"],
    primaryAction: { href: "/en/contact/", label: "Contact" },
    proof: {
      media: {
        src: "/products/fixtures/fixture-ecosystem.png",
        alt: "Fixture ecosystem proof media",
        width: 1280,
        height: 800,
      },
    },
    endorsement: "A BlueSkyz Labs product",
    featuredTier: "ecosystem",
    displayOrder: 3,
  },
};

export const FIXTURE_PRODUCTS = [
  FIXTURE_FLAGSHIP,
  FIXTURE_SECONDARY,
  FIXTURE_ECOSYSTEM,
];
