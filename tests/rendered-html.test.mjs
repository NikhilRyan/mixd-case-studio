import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function readStyles() {
  const files = ["globals.css", "styles/case-preview.css", "styles/studio.css", "styles/home.css", "styles/shared.css"];
  return (await Promise.all(files.map((file) => readFile(new URL(`../app/${file}`, import.meta.url), "utf8")))).join("\n");
}

test("builds a product homepage and focused INR studio", async () => {
  const [page, homepage, studioPage, studio, catalogue, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/home/HomePage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/studio/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/studio/Studio.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/studio/catalog.ts", import.meta.url), "utf8"),
    readStyles(),
  ]);

  assert.match(page, /<HomePage \/>/);
  assert.match(homepage, /Make your phone/);
  assert.match(homepage, /How it works/);
  assert.match(homepage, /href="\/studio"/);
  assert.match(studioPage, /<Studio \/>/);
  assert.match(studio, /Your case\. Your rules\./);
  assert.match(catalogue, /currency: "INR"/);
  assert.match(catalogue, /BASE_PRICE = 1499/);
  assert.doesNotMatch(studio + catalogue, /currency: "USD"/);
  assert.match(css, /\.home-hero/);
  assert.match(css, /@media \(max-width: 720px\)/);
});

test("supports full-angle orbit and removes the trapping mobile footer", async () => {
  const [preview, css] = await Promise.all([
    readFile(new URL("../app/studio/CasePreview.tsx", import.meta.url), "utf8"),
    readStyles(),
  ]);

  assert.match(preview, /yaw: drag\.yaw/);
  assert.match(preview, /pitch: Math\.max\(-72/);
  assert.match(preview, /Auto orbit/);
  assert.match(preview, /phone-case-inner/);
  assert.match(preview, /case-side-left/);
  assert.match(css, /@keyframes case-auto-orbit/);
  assert.match(css, /\.panel-nav \{ position: static; bottom: auto; \}/);
});

test("stores a universal print package and exact unlisted share route", async () => {
  const [types, print, designRoute, assetRoute, sharedPage, migration] = await Promise.all([
    readFile(new URL("../app/studio/types.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/studio/print-artwork.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/designs/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/assets/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/d/[shareId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0001_curious_blue_shield.sql", import.meta.url), "utf8"),
  ]);

  assert.match(types, /version: 1 \| 2/);
  assert.match(print, /PRINT_WIDTH_PX = 2400/);
  assert.match(print, /PRINT_HEIGHT_PX = 4800/);
  assert.match(print, /background: "transparent"/);
  assert.match(designRoute, /isStoredDesign/);
  assert.match(designRoute, /normalizeIndianPhone/);
  assert.match(designRoute, /sharePath: design\.shareId/);
  assert.doesNotMatch(sharedPage, /phoneNumber|phone_number/);
  assert.match(sharedPage, /hydrateSharedArtwork/);
  assert.match(assetRoute, /ASSET_KEY_PATTERN\.test\(key\)/);
  assert.match(migration, /ADD `share_id`/);
  assert.match(migration, /designs_share_id_unique/);
});

test("keeps starter infrastructure removed", async () => {
  const packageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
  await assert.rejects(access(new URL("../app/_sites-preview/preview.css", import.meta.url)));
  await assert.rejects(access(new URL("../app/chatgpt-auth.ts", import.meta.url)));
  await assert.rejects(access(new URL("../app/studio/CasePreview 2.tsx", import.meta.url)));
  await assert.rejects(access(new URL("../db/schema 2.ts", import.meta.url)));
});
