"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BASE_PRICE, CASE_COLORS, CASE_FINISHES, DEVICE_BRANDS, DEVICES, formatPrice, getColor, getDevice, getFinish } from "./catalog";
import { CasePreview } from "./CasePreview";
import { ControlsPanel } from "./ControlsPanel";
import { buildStoredDesign, createPrintBlob } from "./print-artwork";
import type { DesignLayer, Device, SaveState, ShareDetails } from "./types";
import { mapWithConcurrency } from "../../lib/concurrency";
import { MAX_UPLOAD_BYTES, SUPPORTED_IMAGE_TYPES, type SupportedImageType } from "../../lib/image-file";

const STEPS = ["Device", "Case", "Design", "Share"];

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

async function uploadAsset(file: File | Blob, name: string, purpose: "source" | "print") {
  const form = new FormData();
  form.set("file", file, name);
  form.set("purpose", purpose);
  const response = await fetch("/api/assets", { method: "POST", body: form });
  const body = await response.json().catch(() => ({})) as { asset?: { id: string; key: string }; error?: string };
  if (!response.ok || !body.asset) throw new Error(body.error ?? "Artwork upload failed.");
  return body.asset;
}

export function Studio() {
  const [step, setStep] = useState(1);
  const [brand, setBrand] = useState<Device["brand"]>(DEVICE_BRANDS[0].id);
  const [deviceId, setDeviceId] = useState(DEVICES[0].id);
  const [colorId, setColorId] = useState(CASE_COLORS[1].id);
  const [finishId, setFinishId] = useState(CASE_FINISHES[0].id);
  const [layers, setLayers] = useState<DesignLayer[]>([
    { id: "starter-smile", type: "sticker", content: "☺", x: 68, y: 68, width: 28, rotation: 9, color: "#111111", font: "display" },
    { id: "starter-text", type: "text", content: "MIX IT UP", x: 46, y: 46, width: 56, rotation: -8, color: "#F23A3A", font: "impact" },
  ]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>("starter-text");
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const fileStore = useRef(new Map<string, File>());
  const objectUrls = useRef(new Map<string, string>());
  const uploadedAssetKeys = useRef(new Map<string, string>());
  const submissionId = useRef<string | null>(null);
  const printAsset = useRef<{ submissionId: string; key: string } | null>(null);

  const device = getDevice(deviceId);
  const color = getColor(colorId);
  const finish = getFinish(finishId);
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId) ?? null;
  const price = BASE_PRICE + finish.priceDelta;

  useEffect(() => () => {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrls.current.clear();
  }, []);

  const invalidateDesign = useCallback(() => {
    submissionId.current = null;
    printAsset.current = null;
    setSaveState({ status: "idle" });
  }, []);

  const changeLayer = useCallback((layerId: string, patch: Partial<DesignLayer>) => {
    setLayers((current) => current.map((layer) => layer.id === layerId ? { ...layer, ...patch } : layer));
    invalidateDesign();
  }, [invalidateDesign]);

  const deleteLayer = useCallback((layerId: string) => {
    const removed = layers.find((layer) => layer.id === layerId);
    const nextLayers = layers.filter((layer) => layer.id !== layerId);
    if (removed?.assetId && !nextLayers.some((layer) => layer.assetId === removed.assetId)) {
      const objectUrl = objectUrls.current.get(removed.assetId);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrls.current.delete(removed.assetId);
      fileStore.current.delete(removed.assetId);
      uploadedAssetKeys.current.delete(removed.assetId);
    }
    setLayers(nextLayers);
    setSelectedLayerId((current) => current === layerId ? null : current);
    invalidateDesign();
  }, [invalidateDesign, layers]);

  function addLayer(layer: DesignLayer) {
    if (layers.length >= 20) {
      setUploadError("This design has reached the 20-layer production limit.");
      return false;
    }
    setLayers((current) => [...current, layer]);
    setSelectedLayerId(layer.id);
    invalidateDesign();
    return true;
  }

  function addText(content: string) {
    addLayer({ id: newId("text"), type: "text", content, x: 50, y: 54, width: 54, rotation: -5, color: color.ink === "light" ? "#ffffff" : "#111111", font: "display" });
  }

  function addSticker(content: string) {
    addLayer({ id: newId("sticker"), type: "sticker", content, x: 57, y: 60, width: content.length > 4 ? 52 : 28, rotation: 7, color: color.ink === "light" ? "#ffffff" : "#111111", font: "impact" });
  }

  function addImage(file: File) {
    setUploadError(null);
    if (!SUPPORTED_IMAGE_TYPES.has(file.type as SupportedImageType)) {
      setUploadError("Please choose a PNG, JPG or WebP image.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError("That image is larger than 12 MB.");
      return;
    }
    const assetId = newId("asset");
    const objectUrl = URL.createObjectURL(file);
    fileStore.current.set(assetId, file);
    objectUrls.current.set(assetId, objectUrl);
    if (!addLayer({ id: newId("image"), type: "image", content: objectUrl, x: 52, y: 57, width: 54, rotation: 0, color: "#ffffff", font: "display", assetId, sourceName: file.name })) {
      URL.revokeObjectURL(objectUrl);
      objectUrls.current.delete(assetId);
      fileStore.current.delete(assetId);
    }
  }

  function duplicateLayer(layerId: string) {
    const source = layers.find((layer) => layer.id === layerId);
    if (!source) return;
    addLayer({ ...source, id: newId(source.type), x: Math.min(92, source.x + 5), y: Math.min(92, source.y + 5) });
  }

  function selectBrand(nextBrand: Device["brand"]) {
    setBrand(nextBrand);
    const first = DEVICES.find((item) => item.brand === nextBrand);
    if (first) setDeviceId(first.id);
    invalidateDesign();
  }

  async function saveDesign(details: ShareDetails) {
    setSaveState({ status: "saving" });
    setShareFeedback(null);
    const currentSubmissionId = submissionId.current ?? crypto.randomUUID();
    submissionId.current = currentSubmissionId;
    try {
      const uniqueAssets = [...new Set(layers.flatMap((layer) => layer.assetId ? [layer.assetId] : []))];
      const assetEntries = await mapWithConcurrency(uniqueAssets, 3, async (assetId) => {
        const cachedKey = uploadedAssetKeys.current.get(assetId);
        if (cachedKey) return [assetId, cachedKey] as const;
        const file = fileStore.current.get(assetId);
        if (!file) throw new Error("One uploaded image is no longer available. Please add it again.");
        const asset = await uploadAsset(file, file.name, "source");
        uploadedAssetKeys.current.set(assetId, asset.key);
        return [assetId, asset.key] as const;
      });
      const assetKeys = new Map(assetEntries);

      let printAssetKey = printAsset.current?.submissionId === currentSubmissionId ? printAsset.current.key : null;
      if (!printAssetKey) {
        const printBlob = await createPrintBlob(layers);
        const uploadedPrint = await uploadAsset(printBlob, `${device.id}-universal-master.png`, "print");
        printAssetKey = uploadedPrint.key;
        printAsset.current = { submissionId: currentSubmissionId, key: printAssetKey };
      }
      const spec = buildStoredDesign(device, colorId, finishId, layers, assetKeys);
      const response = await fetch("/api/designs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          spec,
          printAssetKey,
          customerName: details.customerName,
          submissionId: currentSubmissionId,
        }),
      });
      const body = await response.json().catch(() => ({})) as {
        design?: { id: string; productionRef: string; sharePath: string };
        error?: string;
      };
      if (!response.ok || !body.design) throw new Error(body.error ?? "The design could not be saved.");
      setSaveState({
        status: "saved",
        designId: body.design.id,
        productionRef: body.design.productionRef,
        sharePath: body.design.sharePath,
        customerName: details.customerName.trim(),
        phoneNumber: details.phoneNumber,
      });
    } catch (error) {
      setSaveState({ status: "error", message: error instanceof Error ? error.message : "The design could not be saved." });
    }
  }

  function getShareUrl() {
    if (saveState.status !== "saved") return null;
    return new URL(saveState.sharePath, window.location.origin).toString();
  }

  async function copyShareLink() {
    const url = getShareUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setShareFeedback("Link copied");
    } catch {
      setShareFeedback("Copy failed — select the link above");
    }
  }

  async function nativeShare() {
    const url = getShareUrl();
    if (!url) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My MIXD case", text: "Here is my custom MIXD phone case.", url });
        setShareFeedback("Share opened");
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareFeedback("Link copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareFeedback("Sharing is unavailable — copy the link instead");
    }
  }

  function shareOnWhatsApp() {
    if (saveState.status !== "saved") return;
    const url = getShareUrl();
    if (!url) return;
    const phone = saveState.phoneNumber.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
    const message = `Hi ${saveState.customerName}, here is your exact MIXD case design: ${url}`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  async function downloadPrint() {
    try {
      const blob = await createPrintBlob(layers);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${device.id}-mixd-print.png`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "The print file could not be created.");
    }
  }

  const steps = useMemo(() => STEPS.map((label, index) => ({ label, number: index + 1 })), []);

  return (
    <main className="site-shell">
      <nav className="top-nav" aria-label="Main navigation">
        <Link className="brand-mark" href="/" aria-label="MIXD home">MIXD<span>.</span></Link>
        <div className="nav-proof"><span>Made by you</span><i />Printed by us</div>
        <div className="nav-actions"><button type="button" onClick={() => setStep(4)}>My design <span>{layers.length}</span></button><b>Est. {formatPrice(price)}</b></div>
      </nav>

      <section className="studio-shell" id="studio">
        <header className="studio-header">
          <div><span>Design lab</span><h1>Your case. Your rules.</h1></div>
          <ol aria-label="Customizer progress">
            {steps.map((item) => (
              <li className={step === item.number ? "is-active" : step > item.number ? "is-done" : ""} key={item.label}>
                <button type="button" onClick={() => setStep(item.number)} aria-current={step === item.number ? "step" : undefined}><span>{step > item.number ? "✓" : item.number}</span><b>{item.label}</b></button>
              </li>
            ))}
          </ol>
          <div className="studio-badge"><span>Live</span> Print preview</div>
        </header>

        <div className="studio-grid">
          <ControlsPanel
            step={step}
            brand={brand}
            device={device}
            color={color}
            finish={finish}
            layers={layers}
            selectedLayer={selectedLayer}
            saveState={saveState}
            shareFeedback={shareFeedback}
            onBrand={selectBrand}
            onDevice={(next) => { setDeviceId(next.id); invalidateDesign(); }}
            onColor={(next) => { setColorId(next.id); invalidateDesign(); }}
            onFinish={(next) => { setFinishId(next.id); invalidateDesign(); }}
            onAddText={addText}
            onAddSticker={addSticker}
            onAddImage={addImage}
            onSelectLayer={setSelectedLayerId}
            onChangeLayer={changeLayer}
            onDuplicateLayer={duplicateLayer}
            onDeleteLayer={deleteLayer}
            onNext={() => setStep((current) => Math.min(4, current + 1))}
            onBack={() => setStep((current) => Math.max(1, current - 1))}
            onSave={saveDesign}
            onDownload={downloadPrint}
            onCopyShare={copyShareLink}
            onNativeShare={nativeShare}
            onWhatsAppShare={shareOnWhatsApp}
          />
          <section className="preview-column" aria-label="Case preview">
            <CasePreview device={device} color={color} finishId={finishId} layers={layers} selectedLayerId={selectedLayerId} onSelectLayer={setSelectedLayerId} onChangeLayer={changeLayer} onDeleteLayer={deleteLayer} />
            {uploadError && <button type="button" className="upload-toast" aria-live="assertive" onClick={() => setUploadError(null)}>{uploadError}<span aria-hidden="true">×</span></button>}
            <div className="preview-help"><span>Drag layers to move</span><span>Arrow keys for precision</span><span>Drag background to orbit</span></div>
          </section>
        </div>
      </section>

      <footer className="site-footer">
        <p>One-of-one energy.<br /><span>Zero design skills needed.</span></p>
        <div><b>20</b><span>editable layers</span></div>
        <div><b>2400 × 4800</b><span>transparent master</span></div>
        <div><b>3</b><span>supported image formats</span></div>
        <small>© 2026 MIXD Studio · Open-source product prototype</small>
      </footer>
    </main>
  );
}
