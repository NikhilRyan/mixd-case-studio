import type { CaseColor, CaseFinish, DesignFontId, Device, DeviceBrandOption } from "./types";

export const DEVICE_BRANDS: DeviceBrandOption[] = [
  { id: "Apple", label: "iPhone" },
  { id: "Google", label: "Pixel" },
];

export const DEVICES: Device[] = [
  {
    id: "iphone-16-pro-max",
    brand: "Apple",
    name: "iPhone 16 Pro Max",
    shortName: "16 Pro Max",
    cameraStyle: "iphone-triple",
    aspectRatio: 0.48,
    printWidthMm: 80,
    printHeightMm: 166,
  },
  {
    id: "iphone-16-pro",
    brand: "Apple",
    name: "iPhone 16 Pro",
    shortName: "16 Pro",
    cameraStyle: "iphone-triple",
    aspectRatio: 0.49,
    printWidthMm: 75,
    printHeightMm: 154,
  },
  {
    id: "iphone-16",
    brand: "Apple",
    name: "iPhone 16",
    shortName: "16",
    cameraStyle: "iphone-dual",
    aspectRatio: 0.49,
    printWidthMm: 74,
    printHeightMm: 151,
  },
  {
    id: "iphone-15-pro",
    brand: "Apple",
    name: "iPhone 15 Pro",
    shortName: "15 Pro",
    cameraStyle: "iphone-triple",
    aspectRatio: 0.49,
    printWidthMm: 74,
    printHeightMm: 150,
  },
  {
    id: "iphone-15",
    brand: "Apple",
    name: "iPhone 15",
    shortName: "15",
    cameraStyle: "iphone-dual",
    aspectRatio: 0.49,
    printWidthMm: 74,
    printHeightMm: 151,
  },
  {
    id: "pixel-9-pro-xl",
    brand: "Google",
    name: "Pixel 9 Pro XL",
    shortName: "9 Pro XL",
    cameraStyle: "pixel-bar",
    aspectRatio: 0.48,
    printWidthMm: 78,
    printHeightMm: 164,
  },
  {
    id: "pixel-9-pro",
    brand: "Google",
    name: "Pixel 9 Pro",
    shortName: "9 Pro",
    cameraStyle: "pixel-bar",
    aspectRatio: 0.48,
    printWidthMm: 74,
    printHeightMm: 154,
  },
  {
    id: "pixel-9",
    brand: "Google",
    name: "Pixel 9",
    shortName: "9",
    cameraStyle: "pixel-bar",
    aspectRatio: 0.48,
    printWidthMm: 74,
    printHeightMm: 154,
  },
  {
    id: "pixel-8a",
    brand: "Google",
    name: "Pixel 8a",
    shortName: "8a",
    cameraStyle: "pixel-bar",
    aspectRatio: 0.48,
    printWidthMm: 74,
    printHeightMm: 155,
  },
];

export const CASE_COLORS: CaseColor[] = [
  { id: "ink", name: "Ink", hex: "#151515", ink: "light" },
  { id: "milk", name: "Milk", hex: "#F1EEE7", ink: "dark" },
  { id: "cherry", name: "Cherry", hex: "#F23A3A", ink: "light" },
  { id: "cobalt", name: "Cobalt", hex: "#3348E8", ink: "light" },
  { id: "matcha", name: "Matcha", hex: "#B8E25A", ink: "dark" },
  { id: "tangerine", name: "Tangerine", hex: "#FF6B2C", ink: "dark" },
];

export const CASE_FINISHES: CaseFinish[] = [
  {
    id: "soft-touch",
    name: "Soft touch",
    description: "Velvety matte, low glare",
    priceDelta: 0,
  },
  {
    id: "gloss",
    name: "High gloss",
    description: "Deep color, glassy shine",
    priceDelta: 199,
  },
  {
    id: "frosted",
    name: "Frosted",
    description: "Milky, translucent finish",
    priceDelta: 149,
  },
  {
    id: "chrome-edge",
    name: "Chrome edge",
    description: "Mirror rim, matte back",
    priceDelta: 299,
  },
];

export const STICKERS = ["✦", "☺", "NO SIGNAL", "HOT!", "☯", "LUCKY", "★", "404"];

export const FONT_OPTIONS: ReadonlyArray<{ id: DesignFontId; name: string; css: string }> = [
  { id: "display", name: "Space", css: "var(--font-geist-sans)" },
  { id: "serif", name: "Romance", css: "Georgia, serif" },
  { id: "mono", name: "Code", css: "var(--font-geist-mono)" },
  { id: "impact", name: "Shout", css: "Impact, sans-serif" },
];

export const BASE_PRICE = 1499;

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getDevice(deviceId: string) {
  return DEVICES.find((device) => device.id === deviceId) ?? DEVICES[0];
}

export function getColor(colorId: string) {
  return CASE_COLORS.find((color) => color.id === colorId) ?? CASE_COLORS[0];
}

export function getFinish(finishId: string) {
  return CASE_FINISHES.find((finish) => finish.id === finishId) ?? CASE_FINISHES[0];
}
