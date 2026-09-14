/**
 * C2 P3 — synthetic product records for the throwaway parity fixture app.
 *
 * These records exist only so product-present behaviour can be asserted in
 * e2e while the production registry stays intentionally empty. They are
 * deliberately obvious fixtures ("Fixture …"): they must never read as real
 * BlueSkyz Labs products and are never deployed. Production publication truth
 * remains the owner-gated screenshot floor.
 */
export const FIXTURE_FLAGSHIP_SLUG = "fixture-flagship";

interface FixtureProduct {
  data: {
    slug: string;
    name: string;
    publicLabel: string;
    shortDescription: string;
    capabilities: string[];
    primaryAction: { href: string; label: string };
    proof: {
      screenshot: {
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
    name: "Fixture Flagship",
    publicLabel: "In development",
    shortDescription: "Fixture description for the flagship act.",
    capabilities: [
      "Fixture capability one",
      "Fixture capability two",
      "Fixture capability three",
    ],
    primaryAction: { href: "/en/contact/", label: "Contact" },
    proof: {
      screenshot: {
        src: "/products/fixtures/fixture-flagship.png",
        alt: "Fixture flagship product screenshot",
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
    name: "Fixture Secondary",
    publicLabel: "Preview",
    shortDescription: "Fixture description for a secondary product.",
    capabilities: ["Fixture capability one", "Fixture capability two"],
    primaryAction: { href: "/en/contact/", label: "Contact" },
    proof: {
      screenshot: {
        src: "/products/fixtures/fixture-secondary.png",
        alt: "Fixture secondary product screenshot",
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
    name: "Fixture Ecosystem",
    publicLabel: "Preview",
    shortDescription: "Fixture description for an ecosystem product.",
    capabilities: ["Fixture capability one", "Fixture capability two"],
    primaryAction: { href: "/en/contact/", label: "Contact" },
    proof: {
      screenshot: {
        src: "/products/fixtures/fixture-ecosystem.png",
        alt: "Fixture ecosystem product screenshot",
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
