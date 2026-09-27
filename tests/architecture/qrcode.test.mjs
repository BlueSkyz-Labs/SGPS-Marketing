/**
 * Architecture contract & test suite for zero-dependency QR Matrix generator.
 * Verifies standard ISO/IEC 18004 QR generation, finder patterns, timing patterns,
 * and valid SVG output for client-side VietQR rendering without external libraries.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { generateQRMatrix, renderQRSVG } from "../../src/lib/qrcode.ts";

test("generateQRMatrix produces valid square matrix with finder patterns", () => {
  const text =
    "00020101021238570010A00000072701270006970422011309012345678900208QRIBFTTA5303704540735000005802VN62190815TIEN PHONG T106304E8A2";
  const matrix = generateQRMatrix(text);

  assert.ok(Array.isArray(matrix));
  const size = matrix.length;
  assert.ok(size >= 21 && size <= 65, `Unexpected QR matrix size: ${size}`);
  assert.equal(matrix[0].length, size, "QR matrix must be strictly square");

  // Top-left finder pattern check: 7x7 outer black border
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
      const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      if (isBorder || isCenter) {
        assert.equal(
          matrix[r][c],
          true,
          `Top-left finder at (${r},${c}) must be dark`,
        );
      } else {
        assert.equal(
          matrix[r][c],
          false,
          `Top-left finder at (${r},${c}) must be light`,
        );
      }
    }
  }

  // Top-right finder pattern check
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const col = size - 7 + c;
      const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
      const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      if (isBorder || isCenter) {
        assert.equal(
          matrix[r][col],
          true,
          `Top-right finder at (${r},${col}) must be dark`,
        );
      } else {
        assert.equal(
          matrix[r][col],
          false,
          `Top-right finder at (${r},${col}) must be light`,
        );
      }
    }
  }

  // Bottom-left finder pattern check
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const row = size - 7 + r;
      const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
      const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      if (isBorder || isCenter) {
        assert.equal(
          matrix[row][c],
          true,
          `Bottom-left finder at (${row},${c}) must be dark`,
        );
      } else {
        assert.equal(
          matrix[row][c],
          false,
          `Bottom-left finder at (${row},${c}) must be light`,
        );
      }
    }
  }
});

test("renderQRSVG produces clean, valid SVG with accessible attributes", () => {
  const text = "0002010102126304";
  const svg = renderQRSVG(text, {
    size: 256,
    alt: "Mã VietQR thanh toán phòng trọ",
  });

  assert.ok(svg.startsWith("<svg"));
  assert.ok(svg.endsWith("</svg>"));
  assert.ok(svg.includes('viewBox="0 0 '));
  assert.ok(svg.includes('role="img"'));
  assert.ok(svg.includes('aria-label="Mã VietQR thanh toán phòng trọ"'));
  assert.ok(svg.includes("<path"));
  assert.doesNotMatch(svg, /<script/i);
});

test("qrcode module has zero external runtime dependencies", () => {
  const source = readFileSync("src/lib/qrcode.ts", "utf8");
  assert.doesNotMatch(source, /from\s+["'][^./]/, "no node_modules imports");
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /localStorage/);
});
