import assert from "node:assert/strict";
import test from "node:test";

import { designAssetKeys, isStoredDesign, normalizeCustomerName, normalizeIndianPhone } from "../app/studio/design-validation";
import { DEVICES } from "../app/studio/catalog";
import type { StoredDesign } from "../app/studio/types";

const device = DEVICES[0];

function makeDesign(): StoredDesign {
  return {
    version: 2,
    deviceId: device.id,
    colorId: "ink",
    finishId: "soft-touch",
    layers: [{
      id: "layer-1",
      type: "image",
      content: "source/21820ae8-25a8-4d47-9c26-c3c27aaf70ba.png",
      x: 50,
      y: 50,
      width: 40,
      rotation: 90,
      color: "#ffffff",
      font: "display",
    }],
    print: {
      widthPx: 2400,
      heightPx: 4800,
      widthMm: device.printWidthMm,
      heightMm: device.printHeightMm,
      colorSpace: "sRGB",
      background: "transparent",
      safeArea: { top: 0.06, right: 0.06, bottom: 0.06, left: 0.06 },
      cameraStyle: device.cameraStyle,
    },
  };
}

test("accepts a bounded production design and extracts unique source assets", () => {
  const design = makeDesign();
  design.layers.push({ ...design.layers[0], id: "layer-2" });
  assert.equal(isStoredDesign(design), true);
  assert.deepEqual(designAssetKeys(design), [design.layers[0].content]);
});

test("rejects invalid geometry, print dimensions, and unsafe numeric values", () => {
  const invalidRotation = makeDesign();
  invalidRotation.layers[0].rotation = Number.NaN;
  assert.equal(isStoredDesign(invalidRotation), false);

  const wrongPrintSize = makeDesign();
  wrongPrintSize.print.widthPx = 1500;
  assert.equal(isStoredDesign(wrongPrintSize), false);

  const oversizedSafeArea = makeDesign();
  oversizedSafeArea.print.safeArea!.top = 0.5;
  assert.equal(isStoredDesign(oversizedSafeArea), false);
});

test("normalizes names and validates legacy Indian phone input", () => {
  assert.equal(normalizeCustomerName("  Nikhil   Kumar "), "Nikhil Kumar");
  assert.equal(normalizeCustomerName("<script>"), null);
  assert.equal(normalizeIndianPhone("+91 98765 43210"), "+919876543210");
  assert.equal(normalizeIndianPhone("12345"), null);
});
