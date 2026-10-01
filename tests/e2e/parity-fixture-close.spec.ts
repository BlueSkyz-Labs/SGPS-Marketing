import { expect, test } from "@playwright/test";
import { connect } from "node:net";
import { startFixtureServer } from "./helpers/parity-fixture";

/**
 * Regression guard for the fixture harness: a browser preconnect socket that
 * never sends a request must not keep `close()` pending past the test budget.
 */
test("fixture server closes promptly with a silent preconnect socket open", async () => {
  const server = await startFixtureServer();
  const { port } = new URL(server.origin);
  const socket = connect(Number(port), "127.0.0.1");
  socket.on("error", () => {});
  await new Promise<void>((ok) => socket.once("connect", () => ok()));
  const started = Date.now();
  await server.close();
  socket.destroy();
  expect(Date.now() - started).toBeLessThan(5_000);
});
