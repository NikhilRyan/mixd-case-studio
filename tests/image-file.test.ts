import assert from "node:assert/strict";
import test from "node:test";

import { hasValidImageSignature, safeAssetName } from "../lib/image-file";

test("detects the supported image signatures", () => {
  assert.equal(hasValidImageSignature("image/png", new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), true);
  assert.equal(hasValidImageSignature("image/jpeg", new Uint8Array([0xff, 0xd8, 0xff])), true);
  assert.equal(hasValidImageSignature("image/webp", new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])), true);
});

test("rejects spoofed image MIME types", () => {
  const executable = new TextEncoder().encode("#!/bin/sh");
  assert.equal(hasValidImageSignature("image/png", executable), false);
  assert.equal(hasValidImageSignature("image/svg+xml", executable), false);
});

test("normalizes untrusted file names for object metadata", () => {
  assert.equal(safeAssetName("  My Holiday / Photo.PNG  "), "my-holiday-photo.png");
  assert.equal(safeAssetName("🔥🔥🔥"), "artwork");
  assert.equal(safeAssetName("a".repeat(100)).length, 80);
});
