import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("keeps every Studio control above the bottom navigation frame", async () => {
  const [controls, css] = await Promise.all([
    readFile(new URL("../app/studio/ControlsPanel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/styles/studio.css", import.meta.url), "utf8"),
  ]);

  assert.match(
    controls,
    /<div className="controls-scroll">[\s\S]*<LayerInspector \{\.\.\.props\} \/>[\s\S]*<\/div>\s*<div className="panel-nav">/,
  );
  assert.match(css, /grid-template-rows: minmax\(0, 1fr\) auto;/);
  assert.match(css, /\.controls-scroll \{[\s\S]*?min-height: 0;[\s\S]*?overflow-y: auto;/);
  assert.match(css, /\.controls-scroll > \.layer-inspector/);
});
