import assert from "node:assert/strict";
import test from "node:test";

import { DEVICE_BRANDS, DEVICES } from "../app/studio/catalog";

test("keeps the extensible device catalogue internally consistent", () => {
  const brandIds = new Set(DEVICE_BRANDS.map((brand) => brand.id));
  const deviceIds = DEVICES.map((device) => device.id);

  assert.equal(new Set(deviceIds).size, deviceIds.length);
  assert.equal(DEVICES.every((device) => brandIds.has(device.brand)), true);
  for (const brand of brandIds) {
    assert.equal(DEVICES.some((device) => device.brand === brand), true);
  }
});
