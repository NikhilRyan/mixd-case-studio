import { CASE_COLORS, CASE_FINISHES, DEVICES } from "./catalog";
import type { DesignLayer, StoredDesign } from "./types";

const LAYER_TYPES = new Set(["text", "sticker", "image"]);
const FONT_IDS = new Set(["display", "serif", "mono", "impact"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isDesignLayer(value: unknown): value is DesignLayer {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" && value.id.length >= 1 && value.id.length <= 80 &&
    typeof value.type === "string" && LAYER_TYPES.has(value.type) &&
    typeof value.content === "string" && value.content.length >= 1 && value.content.length <= 240 &&
    isFiniteNumber(value.x) && value.x >= 0 && value.x <= 100 &&
    isFiniteNumber(value.y) && value.y >= 0 && value.y <= 100 &&
    isFiniteNumber(value.width) && value.width >= 1 && value.width <= 100 &&
    isFiniteNumber(value.rotation) && value.rotation >= -360 && value.rotation <= 360 &&
    typeof value.color === "string" && /^#[0-9a-f]{6}$/i.test(value.color) &&
    typeof value.font === "string" && FONT_IDS.has(value.font) &&
    (value.assetId === undefined || typeof value.assetId === "string") &&
    (value.sourceName === undefined || (typeof value.sourceName === "string" && value.sourceName.length <= 160))
  );
}

export function isStoredDesign(value: unknown): value is StoredDesign {
  if (!isRecord(value) || ![1, 2].includes(Number(value.version)) || !Array.isArray(value.layers) || !isRecord(value.print)) return false;
  const device = typeof value.deviceId === "string" ? DEVICES.find((item) => item.id === value.deviceId) : null;
  if (!device) return false;
  if (typeof value.colorId !== "string" || !CASE_COLORS.some((color) => color.id === value.colorId)) return false;
  if (typeof value.finishId !== "string" || !CASE_FINISHES.some((finish) => finish.id === value.finishId)) return false;
  if (value.layers.length > 20 || !value.layers.every(isDesignLayer)) return false;

  const validLegacySize = value.version === 1 && value.print.widthPx === 1500 && value.print.heightPx === 3000;
  const validUniversalSize = value.version === 2 && value.print.widthPx === 2400 && value.print.heightPx === 4800;
  if (!validLegacySize && !validUniversalSize) return false;
  if (!isFiniteNumber(value.print.widthMm) || !isFiniteNumber(value.print.heightMm)) return false;
  if (value.print.widthMm !== device.printWidthMm || value.print.heightMm !== device.printHeightMm) return false;

  if (value.version === 2) {
    if (value.print.colorSpace !== "sRGB" || value.print.background !== "transparent") return false;
    if (value.print.cameraStyle !== device.cameraStyle || !isRecord(value.print.safeArea)) return false;
    const safeArea = value.print.safeArea;
    if (![safeArea.top, safeArea.right, safeArea.bottom, safeArea.left].every((side) => isFiniteNumber(side) && side >= 0 && side <= 0.25)) return false;
  }
  return true;
}

export function normalizeCustomerName(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length < 2 || normalized.length > 60) return null;
  return /^[\p{L}\p{M}][\p{L}\p{M} .'-]+$/u.test(normalized) ? normalized : null;
}

export function normalizeIndianPhone(value: unknown) {
  if (typeof value !== "string") return null;
  const digits = value.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
}

export function designAssetKeys(spec: StoredDesign) {
  return [...new Set(spec.layers.flatMap((layer) => layer.type === "image" && layer.content.startsWith("source/") ? [layer.content] : []))];
}
