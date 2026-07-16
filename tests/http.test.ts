import assert from "node:assert/strict";
import test from "node:test";

import { exceedsContentLength, getRequestId, isTrustedMutationRequest, isUuid } from "../lib/http";

test("accepts RFC UUIDs and rejects loose identifiers", () => {
  assert.equal(isUuid("21820ae8-25a8-4d47-9c26-c3c27aaf70ba"), true);
  assert.equal(isUuid("../../21820ae8-25a8-4d47-9c26-c3c27aaf70ba"), false);
  assert.equal(isUuid("not-a-uuid"), false);
});

test("rejects cross-origin mutation requests", () => {
  const sameOrigin = new Request("https://mixd.example/api/designs", {
    method: "POST",
    headers: { origin: "https://mixd.example" },
  });
  const crossOrigin = new Request("https://mixd.example/api/designs", {
    method: "POST",
    headers: { origin: "https://attacker.example" },
  });
  const browserCrossSite = new Request("https://mixd.example/api/designs", {
    method: "POST",
    headers: { "sec-fetch-site": "cross-site" },
  });

  assert.equal(isTrustedMutationRequest(sameOrigin), true);
  assert.equal(isTrustedMutationRequest(crossOrigin), false);
  assert.equal(isTrustedMutationRequest(browserCrossSite), false);
});

test("enforces declared payload limits and sanitizes request IDs", () => {
  const oversized = new Request("https://mixd.example/api/assets", {
    headers: { "content-length": "101", "x-request-id": "request-42" },
  });
  assert.equal(exceedsContentLength(oversized, 100), true);
  assert.equal(getRequestId(oversized), "request-42");

  const invalidRequestId = new Request("https://mixd.example/api/assets", {
    headers: { "x-request-id": "unsafe request id" },
  });
  assert.match(getRequestId(invalidRequestId), /^[0-9a-f-]{36}$/);
});
