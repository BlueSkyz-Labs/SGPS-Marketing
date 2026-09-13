import { expect, test } from "@playwright/test";

const MANIFEST = "/.well-known/sgps.json";

test.describe("public SGPS manifest", () => {
  test("serves deterministic JSON with the declared schema", async ({
    request,
  }) => {
    const first = await request.get(MANIFEST);
    expect(first.status()).toBe(200);
    expect(first.headers()["content-type"]).toContain("application/json");

    const body = await first.text();
    const parsed = JSON.parse(body) as {
      schemaVersion: string;
      generatedFrom: string;
      claims: { id: string; urls: { en: string; vi: string } }[];
    };
    expect(parsed.schemaVersion).toBe("1.0");
    expect(parsed.generatedFrom).toBe("public-runtime-data");
    expect(parsed.claims.length).toBe(2);
    const ids = parsed.claims.map((claim) => claim.id);
    expect([...ids].sort()).toEqual(ids);

    const second = await request.get(MANIFEST);
    expect(await second.text()).toBe(body);
  });

  test("every advertised URL resolves to a real public page", async ({
    request,
  }) => {
    const response = await request.get(MANIFEST);
    const parsed = (await response.json()) as {
      claims: { urls: { en: string; vi: string } }[];
    };
    for (const claim of parsed.claims) {
      expect((await request.get(claim.urls.en)).status()).toBe(200);
      expect((await request.get(claim.urls.vi)).status()).toBe(200);
    }
  });

  test("raw output rejects internal and privacy-hostile values", async ({
    request,
  }) => {
    const response = await request.get(MANIFEST);
    const raw = await response.text();
    expect(raw).not.toMatch(/@/);
    expect(raw).not.toMatch(/github\.com|Blueskyz-Labs/i);
    expect(raw).not.toMatch(/\b[0-9a-f]{7,40}\b/i);
    expect(raw).not.toMatch(/workflows?\/|refs\/heads/);
  });

  test("manifest is fetchable without JavaScript and without locale state", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    const response = await page.goto(MANIFEST);
    expect(response?.status()).toBe(200);
    const body = await response?.text();
    expect(body).toContain('"schemaVersion": "1.0"');
    await context.close();
  });
});
