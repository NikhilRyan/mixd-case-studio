export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
export const MAX_MULTIPART_BYTES = MAX_UPLOAD_BYTES + 1024 * 1024;

export type SupportedImageType = "image/png" | "image/jpeg" | "image/webp";

export const SUPPORTED_IMAGE_TYPES = new Set<SupportedImageType>([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

function hasBytes(bytes: Uint8Array, offset: number, expected: readonly number[]) {
  return expected.every((value, index) => bytes[offset + index] === value);
}

export function hasValidImageSignature(contentType: string, bytes: Uint8Array) {
  if (contentType === "image/png") {
    return bytes.length >= 8 && hasBytes(bytes, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  }
  if (contentType === "image/jpeg") {
    return bytes.length >= 3 && hasBytes(bytes, 0, [0xff, 0xd8, 0xff]);
  }
  if (contentType === "image/webp") {
    return bytes.length >= 12 && hasBytes(bytes, 0, [0x52, 0x49, 0x46, 0x46]) && hasBytes(bytes, 8, [0x57, 0x45, 0x42, 0x50]);
  }
  return false;
}

export function safeAssetName(name: string) {
  return name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "artwork";
}
