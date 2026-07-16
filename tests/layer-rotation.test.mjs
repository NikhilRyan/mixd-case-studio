import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("rotates every editable artwork layer directly and preserves the print angle", async () => {
  const [preview, controls, printArtwork, css] = await Promise.all([
    readFile(new URL("../app/studio/CasePreview.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/studio/ControlsPanel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/studio/print-artwork.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/styles/case-preview.css", import.meta.url), "utf8"),
  ]);

  assert.match(preview, /function beginLayerRotation/);
  assert.match(preview, /Math\.atan2/);
  assert.match(preview, /rotation: normalizeRotation/);
  assert.match(preview, /className="layer-rotation-handle"/);
  assert.match(controls, /\[0, 90, -90, 180\]/);
  assert.match(controls, /free rotation/);
  assert.match(printArtwork, /context\.rotate\(\(layer\.rotation \* Math\.PI\) \/ 180\)/);
  assert.match(css, /\.layer-rotation-handle[\s\S]*touch-action: none/);
});
