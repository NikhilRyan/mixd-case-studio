const REQUEST_ID_PATTERN = /^[a-zA-Z0-9._:-]{1,80}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function getRequestId(request: Request) {
  const supplied = request.headers.get("x-request-id");
  return supplied && REQUEST_ID_PATTERN.test(supplied) ? supplied : crypto.randomUUID();
}

export function isTrustedMutationRequest(request: Request) {
  if (request.method === "GET" || request.method === "HEAD" || request.method === "OPTIONS") return true;
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;

  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function exceedsContentLength(request: Request, maximumBytes: number) {
  const header = request.headers.get("content-length");
  if (!header) return false;
  const length = Number(header);
  return Number.isFinite(length) && length > maximumBytes;
}

export function apiJson(
  payload: unknown,
  options: { status?: number; requestId: string; headers?: HeadersInit },
) {
  const headers = new Headers(options.headers);
  headers.set("cache-control", "no-store");
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-request-id", options.requestId);
  return Response.json(payload, { status: options.status ?? 200, headers });
}

export function logServerError(event: string, requestId: string, error: unknown) {
  console.error(JSON.stringify({
    level: "error",
    event,
    requestId,
    message: error instanceof Error ? error.message : "unknown error",
  }));
}
