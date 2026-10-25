import { defineConfig, devices } from "@playwright/test";

const edgeUserAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0";

const remoteBaseURL = process.env.PLAYWRIGHT_BASE_URL?.trim();
const baseURL = remoteBaseURL || "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : "50%",
  // WP-12: refuse stale dist/ locally; CI builds fresh so this is a no-op there.
  globalSetup: "./tests/e2e/global-setup.mjs",
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ...(process.env.CI
      ? ([["junit", { outputFile: "test-results/junit.xml" }]] as const)
      : []),
  ],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  ...(remoteBaseURL
    ? {}
    : {
        webServer: {
          command: "pnpm start",
          url: "http://127.0.0.1:3000",
          // LSN-marketing-002 recurrence (2026-10-20/21): a server left on
          // port 3000 by another worktree was reused silently and the run
          // tested the wrong build. Never reuse: a busy port fails the run.
          reuseExistingServer: false,
          // LSN-marketing-005: `astro preview` runs in its own process group, so
          // the default SIGKILL of the runner's group left it serving on port
          // 3000 and the next run failed "already used". SIGTERM lets
          // scripts/run-preview.mjs run `astro preview stop` first.
          gracefulShutdown: { signal: "SIGTERM" as const, timeout: 10_000 },
          timeout: 120_000,
          stdout: "pipe" as const,
          stderr: "pipe" as const,
        },
      }),
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "edge-ua",
      use: { ...devices["Desktop Chrome"], userAgent: edgeUserAgent },
    },
    {
      // v10 E3 visual regression gate: chromium only, specs live in
      // tests/visual/ so the sharded e2e matrix (tests/e2e/) is untouched.
      // Baselines are Linux-CI generated and committed; CI never updates.
      name: "visual",
      testDir: "./tests/visual",
      use: {
        ...devices["Desktop Chrome"],
        reducedMotion: "reduce",
      },
    },
  ],
});
