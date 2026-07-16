import { eq, inArray } from "drizzle-orm";
import { getDb } from "../../../db";
import { ensureRuntimeSchema } from "../../../db/runtime-schema";
import { assets, designs } from "../../../db/schema";
import { apiJson, exceedsContentLength, getRequestId, isTrustedMutationRequest, isUuid, logServerError } from "../../../lib/http";
import { designAssetKeys, isStoredDesign, normalizeCustomerName, normalizeIndianPhone } from "../../studio/design-validation";
import type { StoredDesign } from "../../studio/types";

const MAX_DESIGN_REQUEST_BYTES = 128 * 1024;
const PRINT_ASSET_KEY_PATTERN = /^print\/\d{4}-\d{2}-\d{2}\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-[a-z0-9][a-z0-9._-]{0,79}$/i;

type DesignRequest = {
  spec?: unknown;
  printAssetKey?: unknown;
  customerName?: unknown;
  phoneNumber?: unknown;
  submissionId?: unknown;
};

type PersistedDesign = typeof designs.$inferSelect;

function productionReference(id: string) {
  return `MX-${id.replaceAll("-", "").slice(0, 10).toUpperCase()}`;
}

function publicDesign(design: PersistedDesign) {
  return {
    id: design.id,
    productionRef: design.productionRef,
    sharePath: design.shareId ? `/d/${design.shareId}` : null,
    status: design.status,
  };
}

async function verifyDesignAssets(spec: StoredDesign, printAssetKey: string) {
  if (spec.layers.some((layer) => layer.type === "image" && !layer.content.startsWith("source/"))) return false;
  const sourceKeys = designAssetKeys(spec);
  const expectedKeys = [printAssetKey, ...sourceKeys];
  const rows = await getDb()
    .select({ objectKey: assets.objectKey, purpose: assets.purpose })
    .from(assets)
    .where(inArray(assets.objectKey, expectedKeys));
  const purposes = new Map(rows.map((asset) => [asset.objectKey, asset.purpose]));
  return purposes.get(printAssetKey) === "print" && sourceKeys.every((key) => purposes.get(key) === "source");
}

async function findBySubmissionId(submissionId: string) {
  const [design] = await getDb().select().from(designs).where(eq(designs.submissionId, submissionId)).limit(1);
  return design ?? null;
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  if (!isTrustedMutationRequest(request)) {
    return apiJson({ error: "Cross-site design submissions are not allowed." }, { status: 403, requestId });
  }
  if (exceedsContentLength(request, MAX_DESIGN_REQUEST_BYTES)) {
    return apiJson({ error: "The design request is too large." }, { status: 413, requestId });
  }

  let payload: DesignRequest;
  try {
    payload = (await request.json()) as DesignRequest;
  } catch {
    return apiJson({ error: "The design payload must be valid JSON." }, { status: 400, requestId });
  }

  if (!isStoredDesign(payload.spec) || typeof payload.printAssetKey !== "string" || !PRINT_ASSET_KEY_PATTERN.test(payload.printAssetKey)) {
    return apiJson({ error: "The print specification is invalid." }, { status: 400, requestId });
  }
  if (payload.submissionId !== undefined && !isUuid(payload.submissionId)) {
    return apiJson({ error: "The submission identifier is invalid." }, { status: 400, requestId });
  }

  const shareRequested = payload.customerName !== undefined;
  const customerName = shareRequested ? normalizeCustomerName(payload.customerName) : null;
  if (shareRequested && !customerName) {
    return apiJson({ error: "Enter a valid name between 2 and 60 characters." }, { status: 400, requestId });
  }
  // Legacy clients may still send a phone number. Validate it, but deliberately
  // do not persist it; current clients keep phone data in the browser only.
  if (payload.phoneNumber !== undefined && !normalizeIndianPhone(payload.phoneNumber)) {
    return apiJson({ error: "Enter a valid 10-digit Indian mobile number." }, { status: 400, requestId });
  }

  const specJson = JSON.stringify(payload.spec);
  if (specJson.length > 120_000) {
    return apiJson({ error: "The design specification is too large." }, { status: 413, requestId });
  }

  const submissionId = typeof payload.submissionId === "string" ? payload.submissionId : null;
  try {
    await ensureRuntimeSchema();
    if (submissionId) {
      const existing = await findBySubmissionId(submissionId);
      if (existing) return apiJson({ design: publicDesign(existing) }, { requestId });
    }
    if (!await verifyDesignAssets(payload.spec, payload.printAssetKey)) {
      return apiJson({ error: "One or more design assets are unavailable or have the wrong purpose." }, { status: 400, requestId });
    }

    const id = crypto.randomUUID();
    const designValues = {
      id,
      submissionId,
      productionRef: productionReference(id),
      deviceId: payload.spec.deviceId,
      colorId: payload.spec.colorId,
      finishId: payload.spec.finishId,
      shareId: shareRequested ? crypto.randomUUID() : null,
      customerName,
      phoneNumber: null,
      shareCreatedAt: shareRequested ? new Date().toISOString() : null,
      specJson,
      printAssetKey: payload.printAssetKey,
      status: "locked" as const,
    };

    let design: PersistedDesign;
    try {
      [design] = await getDb().insert(designs).values(designValues).returning();
    } catch (error) {
      const existing = submissionId ? await findBySubmissionId(submissionId) : null;
      if (!existing) throw error;
      design = existing;
    }

    return apiJson({ design: publicDesign(design) }, { status: 201, requestId });
  } catch (error) {
    logServerError("design_persistence_failed", requestId, error);
    return apiJson({ error: "The design could not be saved. Please try again." }, { status: 500, requestId });
  }
}

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  const id = new URL(request.url).searchParams.get("id");
  if (!isUuid(id)) {
    return apiJson({ error: "A valid design ID is required." }, { status: 400, requestId });
  }

  try {
    await ensureRuntimeSchema();
    const [design] = await getDb().select().from(designs).where(eq(designs.id, id)).limit(1);
    if (!design) return apiJson({ error: "Design not found." }, { status: 404, requestId });

    const spec: unknown = JSON.parse(design.specJson);
    if (!isStoredDesign(spec)) throw new Error("Stored design specification is invalid.");
    return apiJson({
      design: {
        ...publicDesign(design),
        deviceId: design.deviceId,
        colorId: design.colorId,
        finishId: design.finishId,
        customerName: design.customerName,
        spec,
        printAssetKey: design.printAssetKey,
        createdAt: design.createdAt,
      },
    }, { requestId });
  } catch (error) {
    logServerError("design_retrieval_failed", requestId, error);
    return apiJson({ error: "The design could not be retrieved." }, { status: 500, requestId });
  }
}
