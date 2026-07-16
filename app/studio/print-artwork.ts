import type { DesignFontId, DesignLayer, Device, StoredDesign } from "./types";

export const PRINT_WIDTH_PX = 2400;
export const PRINT_HEIGHT_PX = 4800;

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("One of your images could not be prepared for print."));
    image.src = source;
  });
}

type PrintFontFamilies = Record<DesignFontId, string>;

function resolvePrintFonts(): PrintFontFamilies {
  const styles = getComputedStyle(document.body);
  const sans = styles.getPropertyValue("--font-geist-sans").trim() || 'Arial, sans-serif';
  const mono = styles.getPropertyValue("--font-geist-mono").trim() || '"Courier New", monospace';
  return {
    display: sans,
    serif: 'Georgia, "Times New Roman", serif',
    mono,
    impact: 'Impact, "Arial Narrow", Arial, sans-serif',
  };
}

function layerFont(layer: DesignLayer, size: number, fonts: PrintFontFamilies) {
  return `900 ${size}px ${fonts[layer.font]}`;
}

async function drawLayer(
  context: CanvasRenderingContext2D,
  layer: DesignLayer,
  fonts: PrintFontFamilies,
) {
  const x = (layer.x / 100) * PRINT_WIDTH_PX;
  const y = (layer.y / 100) * PRINT_HEIGHT_PX;
  const width = (layer.width / 100) * PRINT_WIDTH_PX;

  context.save();
  context.translate(x, y);
  context.rotate((layer.rotation * Math.PI) / 180);

  if (layer.type === "image") {
    const image = await loadImage(layer.content);
    const height = width / (image.naturalWidth / image.naturalHeight || 1);
    context.drawImage(image, -width / 2, -height / 2, width, height);
  } else {
    const size = Math.max(44, width * (layer.type === "sticker" ? 0.48 : 0.22));
    context.fillStyle = layer.color;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = layerFont(layer, size, fonts);
    context.fillText(layer.content, 0, 0, width * 1.6);
  }

  context.restore();
}

export async function createPrintBlob(layers: DesignLayer[]) {
  const canvas = document.createElement("canvas");
  canvas.width = PRINT_WIDTH_PX;
  canvas.height = PRINT_HEIGHT_PX;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Your browser could not create the print file.");
  }

  await document.fonts?.ready;
  const fonts = resolvePrintFonts();
  context.clearRect(0, 0, PRINT_WIDTH_PX, PRINT_HEIGHT_PX);
  for (const layer of layers) {
    await drawLayer(context, layer, fonts);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Your browser could not export the print file."));
    }, "image/png");
  });
}

export function buildStoredDesign(
  device: Device,
  colorId: string,
  finishId: string,
  layers: DesignLayer[],
  assetKeys: Map<string, string>,
): StoredDesign {
  return {
    version: 2,
    deviceId: device.id,
    colorId,
    finishId,
    layers: layers.map((layer) => ({
      ...layer,
      content:
        layer.type === "image"
          ? (layer.assetId && assetKeys.get(layer.assetId)) ?? layer.sourceName ?? "uploaded-artwork"
          : layer.content,
    })),
    print: {
      widthPx: PRINT_WIDTH_PX,
      heightPx: PRINT_HEIGHT_PX,
      widthMm: device.printWidthMm,
      heightMm: device.printHeightMm,
      colorSpace: "sRGB",
      background: "transparent",
      safeArea: { top: 0.04, right: 0.05, bottom: 0.04, left: 0.05 },
      cameraStyle: device.cameraStyle,
    },
  };
}
