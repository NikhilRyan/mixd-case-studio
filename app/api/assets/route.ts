import { env } from "cloudflare:workers";
import { getDb } from "../../../db";
import { assets } from "../../../db/schema";
import { ensureRuntimeSchema } from "../../../db/runtime-schema";
import { apiJson, exceedsContentLength, getRequestId, isTrustedMutationRequest, logServerError } from "../../../lib/http";
import { hasValidImageSignature, MAX_MULTIPART_BYTES, MAX_UPLOAD_BYTES, safeAssetName, SUPPORTED_IMAGE_TYPES, type SupportedImageType } from "../../../lib/image-file";

const ASSET_KEY_PATTERN = /^(source)\/\d{4}-\d{2}-\d{2}\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-[a-z0-9][a-z0-9._-]{0,79}$/i;

type AssetBucket = {
  put(
    key: string,
    value: ArrayBuffer,
    options: { httpMetadata: { contentType: string }; customMetadata: Record<string, string> },
  ): Promise<unknown>;
  get(key: string): Promise<{
    body: ReadableStream;
    httpEtag: string;
    writeHttpMetadata(headers: Headers): void;
  } | null>;
  delete(key: string): Promise<void>;
};

function getAssetBucket() {
  const bucket = (env as unknown as { CASE_ASSETS?: AssetBucket }).CASE_ASSETS;
  if (!bucket) throw new Error("R2 binding `CASE_ASSETS` is unavailable.");
  return bucket;
}

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  const key = new URL(request.url).searchParams.get("key");
  if (!key || !ASSET_KEY_PATTERN.test(key)) {
    return apiJson({ error: "A valid shared artwork key is required." }, { status: 400, requestId });
  }

  try {
    const object = await getAssetBucket().get(key);
    if (!object) return apiJson({ error: "Artwork not found." }, { status: 404, requestId });
    const headers = new Headers({
      "cache-control": "public, max-age=31536000, immutable",
      "cross-origin-resource-policy": "same-origin",
      etag: object.httpEtag,
      "x-content-type-options": "nosniff",
      "x-request-id": requestId,
    });
    object.writeHttpMetadata(headers);
    return new Response(object.body, { headers });
  } catch (error) {
    logServerError("shared_artwork_retrieval_failed", requestId, error);
    return apiJson({ error: "Artwork could not be loaded." }, { status: 500, requestId });
  }
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  if (!isTrustedMutationRequest(request)) {
    return apiJson({ error: "Cross-site uploads are not allowed." }, { status: 403, requestId });
  }
  if (exceedsContentLength(request, MAX_MULTIPART_BYTES)) {
    return apiJson({ error: "The upload request is too large." }, { status: 413, requestId });
  }

  let storedObjectKey: string | null = null;
  try {
    const form = await request.formData();
    const candidate = form.get("file");
    const purpose = form.get("purpose");

    if (!(candidate instanceof File)) {
      return apiJson({ error: "An artwork file is required." }, { status: 400, requestId });
    }
    if (purpose !== "source" && purpose !== "print") {
      return apiJson({ error: "Invalid artwork purpose." }, { status: 400, requestId });
    }
    if (!SUPPORTED_IMAGE_TYPES.has(candidate.type as SupportedImageType)) {
      return apiJson({ error: "Only PNG, JPG and WebP images are supported." }, { status: 415, requestId });
    }
    if (candidate.size === 0 || candidate.size > MAX_UPLOAD_BYTES) {
      return apiJson({ error: "Artwork must be between 1 byte and 12 MB." }, { status: 413, requestId });
    }

    const bytes = new Uint8Array(await candidate.arrayBuffer());
    if (!hasValidImageSignature(candidate.type, bytes)) {
      return apiJson({ error: "The file contents do not match the selected image type." }, { status: 415, requestId });
    }

    const id = crypto.randomUUID();
    const date = new Date().toISOString().slice(0, 10);
    const sanitizedName = safeAssetName(candidate.name);
    const objectKey = `${purpose}/${date}/${id}-${sanitizedName}`;
    const bucket = getAssetBucket();
    await ensureRuntimeSchema();
    await bucket.put(objectKey, bytes.buffer, {
      httpMetadata: { contentType: candidate.type },
      customMetadata: { originalName: sanitizedName, purpose },
    });
    storedObjectKey = objectKey;

    try {
      await getDb().insert(assets).values({
        id,
        objectKey,
        purpose,
        originalName: sanitizedName,
        contentType: candidate.type,
      });
    } catch (error) {
      await bucket.delete(objectKey).catch((cleanupError) => logServerError("asset_cleanup_failed", requestId, cleanupError));
      storedObjectKey = null;
      throw error;
    }

    return apiJson({ asset: { id, key: objectKey } }, { status: 201, requestId });
  } catch (error) {
    logServerError("asset_persistence_failed", requestId, error);
    if (storedObjectKey) {
      await getAssetBucket().delete(storedObjectKey).catch((cleanupError) => logServerError("asset_cleanup_failed", requestId, cleanupError));
    }
    return apiJson({ error: "Artwork could not be stored. Please try again." }, { status: 500, requestId });
  }
}
