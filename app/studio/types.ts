export type DeviceBrand = string;

export type DeviceBrandOption = {
  id: DeviceBrand;
  label: string;
};

export type CameraStyle = "iphone-triple" | "iphone-dual" | "pixel-bar";

export type Device = {
  id: string;
  brand: DeviceBrand;
  name: string;
  shortName: string;
  cameraStyle: CameraStyle;
  aspectRatio: number;
  printWidthMm: number;
  printHeightMm: number;
};

export type CaseFinish = {
  id: string;
  name: string;
  description: string;
  priceDelta: number;
};

export type CaseColor = {
  id: string;
  name: string;
  hex: string;
  ink: "light" | "dark";
};

export type LayerType = "text" | "sticker" | "image";
export type DesignFontId = "display" | "serif" | "mono" | "impact";

export type DesignLayer = {
  id: string;
  type: LayerType;
  content: string;
  x: number;
  y: number;
  width: number;
  rotation: number;
  color: string;
  font: DesignFontId;
  assetId?: string;
  sourceName?: string;
};

export type StoredDesign = {
  version: 1 | 2;
  deviceId: string;
  colorId: string;
  finishId: string;
  layers: DesignLayer[];
  print: {
    widthPx: number;
    heightPx: number;
    widthMm: number;
    heightMm: number;
    colorSpace?: "sRGB";
    background?: "transparent";
    safeArea?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    cameraStyle?: CameraStyle;
  };
};

export type ShareDetails = {
  customerName: string;
  phoneNumber: string;
};

export type SaveState =
  | { status: "idle" }
  | { status: "saving" }
  | {
      status: "saved";
      designId: string;
      productionRef: string;
      sharePath: string;
      customerName: string;
      phoneNumber: string;
    }
  | { status: "error"; message: string };
