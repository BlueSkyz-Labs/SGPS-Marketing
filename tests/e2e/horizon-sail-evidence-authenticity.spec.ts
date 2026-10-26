import { expect, test } from "@playwright/test";

const ID = "security-reporting-is-private";
const ROUTE = `/en/evidence/${ID}/`;

interface ClientGraph {
  id: string;
  claim: string;
  state: string;
  hasBoundary: boolean;
  evidence: { id: string; label: string; href: string }[];
}

/**
 * Red-team a syntactically valid but untrusted interactive projection.
 * The original server-rendered claim, sources and limits must win.
 */
const forgeries: {
  name: string;
  mutate: (graph: ClientGraph) => void;
}[] = [
  {
    name: "substituted unsafe source URL",
    mutate: (graph) => {
      graph.evidence[0]!.href = "javascript:alert(1)";
    },
  },
  {
    name: "rewritten verification state",
    mutate: (graph) => {
      graph.state = "reviewed";
    },
  },
  {
    name: "suppressed qualification boundary",
    mutate: (graph) => {
      graph.hasBoundary = false;
    },
  },
  {
    name: "forged public claim",
    mutate: (graph) => {
      graph.claim = "This source has been certified";
    },
  },
];

for (const { name, mutate } of forgeries) {
  test(`fail closed for ${name}`, async ({ page }) => {
    await page.route(`**${ROUTE}`, async (route) => {
      const response = await route.fetch();
      const body = await response.text();
      const graphScript =
        /(<script\b[^>]*data-evidence-graph[^>]*>)([\s\S]*?)(<\/script>)/;
      const altered = body.replace(
        graphScript,
        (_whole, open: string, serialized: string, close: string) => {
          const graph = JSON.parse(serialized) as ClientGraph;
          mutate(graph);
          return `${open}${JSON.stringify(graph)}${close}`;
        },
      );
      expect(altered).not.toBe(body);
      await route.fulfill({ response, body: altered });
    });

    await page.goto(ROUTE);
    const passport = page.locator(`[data-evidence-passport="${ID}"]`);
    await expect(passport).toBeVisible();
    await expect(passport).not.toHaveAttribute("data-explorer-active", "true");
    await expect(passport.locator("[data-evidence-chain]")).toBeHidden();
    const source = passport
      .locator("[data-evidence-static-sources]")
      .getByRole("link")
      .first();
    await expect(source).toBeVisible();
    // The canonical first source (TRU-04, Owner 2026-10-20: the Security
    // page) survives the forged graph; the GitHub form stays listed too.
    await expect(source).toHaveAttribute("href", "/en/security/");
    await expect(
      passport
        .locator("[data-evidence-static-sources]")
        .locator(
          'a[href="https://github.com/BlueSkyz-Labs/blueskyz-web/security/advisories/new"]',
        ),
    ).toBeVisible();
    await expect(
      passport.locator("[data-evidence-static-boundary]"),
    ).toBeVisible();
  });
}
