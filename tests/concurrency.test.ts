import assert from "node:assert/strict";
import test from "node:test";

import { mapWithConcurrency } from "../lib/concurrency";

test("bounds work while preserving input order", async () => {
  let active = 0;
  let maximumActive = 0;
  let releaseGate!: () => void;
  const gate = new Promise<void>((resolve) => { releaseGate = resolve; });

  const resultPromise = mapWithConcurrency([3, 1, 2], 2, async (value) => {
    active += 1;
    maximumActive = Math.max(maximumActive, active);
    if (value !== 2) await gate;
    active -= 1;
    return value * 2;
  });

  await Promise.resolve();
  assert.equal(maximumActive, 2);
  releaseGate();
  assert.deepEqual(await resultPromise, [6, 2, 4]);
  assert.equal(maximumActive, 2);
});

test("rejects invalid concurrency values", async () => {
  await assert.rejects(mapWithConcurrency([1], 0, async (value) => value), /positive integer/);
});
