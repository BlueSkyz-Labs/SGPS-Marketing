/**
 * T3 — product provenance guard contract.
 *
 * The guard must reject the defect class that shipped once: a `repositoryUrl` pointing at a
 * repository that does not exist, a `sourceRevision` that is really a commit of THIS repository,
 * and identity art claimed as a product screenshot. It must also stay fail-closed for missing or
 * malformed provenance and report an empty registry as IDLE rather than as a pass.
 */
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const SCRIPT = "scripts/check-product-provenance.mjs";
/** A real revision of the Sotro product repository — a foreign revision, not one of ours. */
const FOREIGN_REVISION = "b226e491517f34d49286b117e2d2634f7d47e763";
const FAKE_FOREIGN_REVISION = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const FIXTURE_REPOSITORIES = {
  apexagent: "BlueSkyz-Labs/ApexAgent",
  fluentarc: "BlueSkyz-Labs/FluentArc",
  sotam: "BlueSkyz-Labs/sotam",
  sotro: "BlueSkyz-Labs/Sotro",
  vungtaylai: "BlueSkyz-Labs/VungTayLai",
};
const HEAD = execFileSync("git", ["rev-parse", "HEAD"], {
  cwd: ROOT,
  encoding: "utf8",
}).trim();

function run(root) {
  return spawnSync("node", [SCRIPT, "--root", root, "--repo", ROOT], {
    cwd: ROOT,
    encoding: "utf8",
  });
}

function writeQualificationFixture(dir, revision = FOREIGN_REVISION) {
  mkdirSync(join(dir, "docs/evidence"), { recursive: true });
  const products = Object.fromEntries(
    Object.entries(FIXTURE_REPOSITORIES).map(([slug, repository]) => [
      slug,
      {
        repository,
        defaultBranch: "main",
        sourceRevision: revision,
        checkedDefaultHead: revision,
        relationship: "EXACT_DEFAULT_HEAD",
      },
    ]),
  );
  writeFileSync(
    join(dir, "docs/evidence/product-source-qualification.json"),
    JSON.stringify(
      {
        schemaVersion: "1.0",
        evidenceClass: "PROVIDER_REPOSITORY_READBACK",
        verifiedAt: "2026-09-30",
        limitations: ["synthetic architecture-test qualification fixture"],
        products,
      },
      null,
      2,
    ) + "\n",
  );
}

function withFixture(
  lines,
  assertion,
  productFile = "sotro.yaml",
  { qualificationRevision = FOREIGN_REVISION, includeQualification = true } = {},
) {
  const dir = mkdtempSync(join(tmpdir(), "product-provenance-"));
  mkdirSync(join(dir, "src/content/products"), { recursive: true });
  if (includeQualification) {
    writeQualificationFixture(dir, qualificationRevision);
  }
  writeFileSync(
    join(dir, "src/content/products", productFile),
    `${lines.join("\n")}\n`,
  );
  try {
    assertion(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function record(overrides = {}) {
  const {
    slug = "sotro",
    name = "Example",
    repositoryUrl = "https://github.com/BlueSkyz-Labs/Sotro",
    revision = FOREIGN_REVISION,
    media = [
      "media:",
      "  kind: identity-art",
      "  src: /products/sotro/identity.png",
      "  alt: Sotro by BlueSkyz Labs - brand identity artwork",
    ],
    extra = [],
  } = overrides;
  const lines = [`slug: ${slug}`, `name: ${name}`, "proof:"];
  if (repositoryUrl !== null) lines.push(`  repositoryUrl: ${repositoryUrl}`);
  if (revision !== null) lines.push(`sourceRevision: ${revision}`);
  if (media) lines.push(...media);
  lines.push(...extra);
  return lines;
}

test("the real registry satisfies provenance honestly", () => {
  const result = run(ROOT);
  assert.equal(result.status, 0, result.stderr);
  assert.match(
    result.stdout,
    /Product provenance source qualification: QUALIFIED \(5 entries;/,
  );
  assert.match(result.stdout, /capability\/runtime\/payment\/E4 NOT_VERIFIED/);
});

test("an empty registry reports IDLE instead of passing by accident", () => {
  const dir = mkdtempSync(join(tmpdir(), "product-provenance-"));
  try {
    const result = run(dir);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Product provenance source qualification: IDLE/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a well-formed record citing an allow-listed repository passes", () => {
  withFixture(record(), (dir) => {
    const result = run(dir);
    assert.equal(result.status, 0, result.stderr);
    assert.match(
      result.stdout,
      /Product provenance source qualification: QUALIFIED \(1 entries;/,
    );
    assert.match(result.stdout, /capability\/runtime\/payment\/E4 NOT_VERIFIED/);
  });
});

test("a repositoryUrl outside the allow-list fails closed", () => {
  withFixture(
    record({ repositoryUrl: "https://github.com/BlueSkyz-Labs/PRJ-SoTro" }),
    (dir) => {
      const result = run(dir);
      assert.equal(result.status, 1);
      assert.match(
        result.stderr,
        /is not https:\/\/github\.com\/BlueSkyz-Labs\/Sotro/,
      );
    },
  );
});

test("a repositoryUrl on a foreign organisation fails closed", () => {
  withFixture(
    record({ repositoryUrl: "https://github.com/example/Sotro" }),
    (dir) => {
      const result = run(dir);
      assert.equal(result.status, 1);
      assert.match(
        result.stderr,
        /is not https:\/\/github\.com\/BlueSkyz-Labs\/Sotro/,
      );
    },
  );
});

test("a product that is not allow-listed fails closed", () => {
  withFixture(
    record({
      slug: "sotro",
      repositoryUrl: "https://github.com/BlueSkyz-Labs/Other",
    }),
    (dir) => {
      const result = run(dir);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /FAIL .*sotro\.yaml/);
    },
  );
});

test("a sourceRevision that is a commit of THIS repository fails closed", () => {
  withFixture(record({ revision: HEAD }), (dir) => {
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /is a commit of THIS repository/);
  });
});

test("negative proof: an arbitrary foreign-looking 40-hex revision is not qualified", () => {
  withFixture(record({ revision: FAKE_FOREIGN_REVISION }), (dir) => {
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /is not the qualified revision/);
  });
});

test("a product record cannot pass when the qualification registry is missing", () => {
  withFixture(
    record(),
    (dir) => {
      const result = run(dir);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /qualification registry is missing/);
    },
    "sotro.yaml",
    { includeQualification: false },
  );
});

test("a missing sourceRevision fails closed", () => {
  withFixture(record({ revision: null }), (dir) => {
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /no sourceRevision/);
  });
});

test("a revision that is not 40-hex fails closed", () => {
  withFixture(record({ revision: "0123456" }), (dir) => {
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /is not a 40-hex revision/);
  });
});

test("a missing repositoryUrl fails closed", () => {
  withFixture(record({ repositoryUrl: null }), (dir) => {
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /no proof\.repositoryUrl/);
  });
});

test("identity art claimed as a bare screenshot fails closed", () => {
  withFixture(
    record({
      media: ["screenshot:", "  src: /products/sotro/screenshot.png"],
    }),
    (dir) => {
      const result = run(dir);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /bare screenshot claim/);
    },
  );
});

test("positive control: a screenshot-kind record with matching evidence passes", () => {
  withFixture(
    record({
      media: [
        "media:",
        "  kind: ui-screenshot",
        "  src: /products/sotro/screenshot.png",
        "  alt: Screenshot of the running Sotro application",
      ],
    }),
    (dir) => {
      const result = run(dir);
      assert.equal(result.status, 0, result.stderr);
      assert.match(
      result.stdout,
      /Product provenance source qualification: QUALIFIED \(1 entries;/,
    );
    assert.match(result.stdout, /capability\/runtime\/payment\/E4 NOT_VERIFIED/);
    },
  );
});

test("negative proof: ui-screenshot kind with identity-art caption fails closed", () => {
  withFixture(
    record({
      media: [
        "media:",
        "  kind: ui-screenshot",
        "  src: /products/sotro/screenshot.png",
        "  alt: Sotro by BlueSkyz Labs - brand identity artwork",
      ],
    }),
    (dir) => {
      const result = run(dir);
      assert.equal(result.status, 1);
      assert.match(
        result.stderr,
        /ui-screenshot contradicts artwork\/identity wording/,
      );
    },
  );
});

test("negative proof: ui-screenshot kind on an identity asset fails closed", () => {
  withFixture(
    record({
      media: [
        "media:",
        "  kind: ui-screenshot",
        "  src: /products/sotro/identity.png",
        "  alt: Screenshot of the running Sotro application",
      ],
    }),
    (dir) => {
      const result = run(dir);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /contradicts the identity artwork asset/);
    },
  );
});

test("negative proof: identity-art kind claiming a screenshot fails closed", () => {
  withFixture(
    record({
      media: [
        "media:",
        "  kind: identity-art",
        "  src: /products/sotro/screenshot.png",
        "  alt: Screenshot of the running Sotro application",
      ],
    }),
    (dir) => {
      const result = run(dir);
      assert.equal(result.status, 1);
      assert.match(
        result.stderr,
        /identity-art must not claim to be a screenshot/,
      );
      assert.match(
        result.stderr,
        /identity-art must not cite a screenshot asset/,
      );
    },
  );
});

test("a missing media kind fails closed", () => {
  withFixture(
    record({ media: ["media:", "  src: /products/sotro/identity.png"] }),
    (dir) => {
      const result = run(dir);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /must declare kind/);
    },
  );
});

test("an unknown media kind fails closed", () => {
  withFixture(
    record({
      media: [
        "media:",
        "  kind: promo-render",
        "  src: /products/sotro/identity.png",
      ],
    }),
    (dir) => {
      const result = run(dir);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /must be identity-art or ui-screenshot/);
    },
  );
});

test("Sổ Tâm product name cannot be silently changed to Sổ Tằm", () => {
  withFixture(
    record({
      slug: "sotam",
      name: "Sổ Tằm",
      repositoryUrl: "https://github.com/BlueSkyz-Labs/sotam",
    }),
    (dir) => {
      const result = run(dir);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /verified product name/);
    },
    "sotam.yaml",
  );
});

test("Sổ Tâm out-of-scope voice/transcription copy fails independently", () => {
  withFixture(
    record({
      slug: "sotam",
      name: "Sổ Tâm",
      repositoryUrl: "https://github.com/BlueSkyz-Labs/sotam",
      extra: [
        "jobs:",
        "  - Voice-to-reflection synthesis with private transcription",
      ],
    }),
    (dir) => {
      const result = run(dir);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /out-of-scope voice\/audio\/transcription/);
    },
    "sotam.yaml",
  );
});

test("Vững Tay Lái rejects false active-driving safety promises", () => {
  withFixture(
    record({
      slug: "vungtaylai",
      name: "Vững Tay Lái",
      repositoryUrl: "https://github.com/BlueSkyz-Labs/VungTayLai",
      extra: ["capabilities:", "  - Real-time collision warnings"],
    }),
    (dir) => {
      const result = run(dir);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /must not claim live driving/);
    },
    "vungtaylai.yaml",
  );
});

test("Vững Tay Lái V0 rejects invented native Android/iOS platform support", () => {
  withFixture(
    record({
      slug: "vungtaylai",
      name: "Vững Tay Lái",
      repositoryUrl: "https://github.com/BlueSkyz-Labs/VungTayLai",
      extra: ["platforms:", "  - android"],
    }),
    (dir) => {
      const result = run(dir);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /must not claim native Android\/iOS/);
    },
    "vungtaylai.yaml",
  );
});
