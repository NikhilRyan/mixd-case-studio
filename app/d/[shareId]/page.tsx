import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { ensureRuntimeSchema } from "../../../db/runtime-schema";
import { designs } from "../../../db/schema";
import { isUuid } from "../../../lib/http";
import { isStoredDesign } from "../../studio/design-validation";
import type { StoredDesign } from "../../studio/types";
import { SharedDesign } from "./SharedDesign";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "A custom MIXD case",
  description: "Open an exact, shareable custom phone-case design.",
  robots: { index: false, follow: false },
};

function hydrateSharedArtwork(spec: StoredDesign): StoredDesign {
  return {
    ...spec,
    layers: spec.layers.map((layer) => ({
      ...layer,
      content:
        layer.type === "image" && layer.content.startsWith("source/")
          ? `/api/assets?key=${encodeURIComponent(layer.content)}`
          : layer.content,
    })),
  };
}

export default async function SharedDesignPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  if (!isUuid(shareId)) notFound();

  await ensureRuntimeSchema();
  const [design] = await getDb().select().from(designs).where(eq(designs.shareId, shareId)).limit(1);
  if (!design?.shareId || !design.customerName) notFound();

  let spec: StoredDesign;
  try {
    const storedSpec: unknown = JSON.parse(design.specJson);
    if (!isStoredDesign(storedSpec)) notFound();
    spec = hydrateSharedArtwork(storedSpec);
  } catch {
    notFound();
  }

  const createdLabel = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(design.shareCreatedAt ?? design.createdAt));

  return (
    <SharedDesign
      customerName={design.customerName}
      productionRef={design.productionRef}
      createdLabel={createdLabel}
      spec={spec}
    />
  );
}
