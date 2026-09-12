/**
 * Shared fixture-app harness for e2e specs (S+ v2 Task 0.2 / v3 Wave 1).
 * Serves tests/e2e/fixtures/parity-app/dist on an ephemeral port.
 * Build is guaranteed by scripts/build-parity-fixture.mjs (test:e2e prebuild);
 * a tmpdir lock-protected fallback covers bare `playwright test` runs.
 */
import { execSync } from "node:child_process";
import { createServer, type Server } from "node:http";
import {
  existsSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";

const FIXTURE_ROOT = resolve("tests/e2e/fixtures/parity-app");
const FIXTURE_DIST = join(FIXTURE_ROOT, "dist");
const BUILD_LOCK = join(tmpdir(), "sgps-parity-fixture-build.lock");

export const distReady = () => {
  const entry = join(FIXTURE_DIST, "en", "index.html");
  if (!existsSync(entry)) return false;
  return readFileSync(entry, "utf8").includes("</html>");
};

export async function ensureFixtureBuilt(): Promise<void> {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (distReady()) return;
    if (existsSync(BUILD_LOCK)) {
      const age = Date.now() - statSync(BUILD_LOCK).mtimeMs;
      if (age > 120_000) unlinkSync(BUILD_LOCK);
      await new Promise((r) => setTimeout(r, 500));
      continue;
    }
    writeFileSync(BUILD_LOCK, String(process.pid));
    try {
      execSync("pnpm exec astro build --root tests/e2e/fixtures/parity-app", {
        cwd: process.cwd(),
        stdio: "pipe",
      });
    } finally {
      try {
        unlinkSync(BUILD_LOCK);
      } catch {}
    }
  }
  if (!distReady()) throw new Error("parity fixture build did not complete");
}

export async function startFixtureServer(): Promise<{
  origin: string;
  close: () => Promise<void>;
}> {
  await ensureFixtureBuilt();
  const server: Server = createServer((req, res) => {
    const urlPath = (req.url ?? "/").split("?")[0] ?? "/";
    let filePath = join(FIXTURE_DIST, urlPath);
    if (urlPath.endsWith("/")) filePath = join(filePath, "index.html");
    if (!existsSync(filePath) || extname(filePath) === "") {
      filePath = join(filePath, "index.html");
    }
    if (!existsSync(filePath)) {
      res.statusCode = 404;
      res.end("not found");
      return;
    }
    const type = extname(filePath) === ".html" ? "text/html" : "text/plain";
    res.setHeader("content-type", `${type}; charset=utf-8`);
    res.end(readFileSync(filePath));
  });
  await new Promise<void>((ok) => server.listen(0, "127.0.0.1", ok));
  const address = server.address();
  const origin =
    address && typeof address === "object"
      ? `http://127.0.0.1:${address.port}`
      : "";
  return {
    origin,
    close: () => new Promise<void>((ok) => server.close(() => ok())),
  };
}
