"use client";

import { BASE_PRICE, CASE_COLORS, CASE_FINISHES, DEVICE_BRANDS, DEVICES, FONT_OPTIONS, STICKERS, formatPrice } from "./catalog";
import type { CaseColor, CaseFinish, DesignLayer, Device, SaveState, ShareDetails } from "./types";

type Props = {
  step: number;
  brand: Device["brand"];
  device: Device;
  color: CaseColor;
  finish: CaseFinish;
  layers: DesignLayer[];
  selectedLayer: DesignLayer | null;
  saveState: SaveState;
  shareFeedback: string | null;
  onBrand: (brand: Device["brand"]) => void;
  onDevice: (device: Device) => void;
  onColor: (color: CaseColor) => void;
  onFinish: (finish: CaseFinish) => void;
  onAddText: (value: string) => void;
  onAddSticker: (value: string) => void;
  onAddImage: (file: File) => void;
  onSelectLayer: (layerId: string) => void;
  onChangeLayer: (layerId: string, patch: Partial<DesignLayer>) => void;
  onDuplicateLayer: (layerId: string) => void;
  onDeleteLayer: (layerId: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSave: (details: ShareDetails) => void;
  onDownload: () => void;
  onCopyShare: () => void;
  onNativeShare: () => void;
  onWhatsAppShare: () => void;
};

function money(value: number) {
  return formatPrice(value);
}

function StepHeading({ kicker, title, copy }: { kicker: string; title: string; copy: string }) {
  return (
    <header className="panel-heading">
      <span>{kicker}</span>
      <h2>{title}</h2>
      <p>{copy}</p>
    </header>
  );
}

function DeviceStep(props: Props) {
  const visibleDevices = DEVICES.filter((item) => item.brand === props.brand);
  return (
    <>
      <StepHeading kicker="01 / Device" title="Pick your fit." copy="Camera cutouts and print dimensions adapt instantly." />
      <div className="segmented-control" role="group" aria-label="Phone brand">
        {DEVICE_BRANDS.map((brand) => (
          <button type="button" className={props.brand === brand.id ? "is-active" : ""} onClick={() => props.onBrand(brand.id)} key={brand.id}>
            {brand.label}
          </button>
        ))}
      </div>
      <div className="device-list">
        {visibleDevices.map((item) => (
          <button
            type="button"
            className={`device-card ${props.device.id === item.id ? "is-active" : ""}`}
            onClick={() => props.onDevice(item)}
            key={item.id}
          >
            <span className={`device-glyph camera-${item.cameraStyle}`} aria-hidden="true"><i /></span>
            <span><b>{item.shortName}</b><small>{item.printWidthMm} × {item.printHeightMm} mm</small></span>
            <em>{props.device.id === item.id ? "Selected" : "Choose"}</em>
          </button>
        ))}
      </div>
      <p className="micro-note"><span>+</span> The catalogue is data-driven—more brands slot in without rebuilding the studio.</p>
    </>
  );
}

function CaseStep(props: Props) {
  return (
    <>
      <StepHeading kicker="02 / Case" title="Set the mood." copy="Choose a base color and the way it catches light." />
      <section className="control-section">
        <div className="section-label"><span>Color</span><b>{props.color.name}</b></div>
        <div className="color-grid">
          {CASE_COLORS.map((item) => (
            <button
              type="button"
              className={props.color.id === item.id ? "is-active" : ""}
              style={{ "--swatch": item.hex } as React.CSSProperties}
              aria-label={item.name}
              aria-pressed={props.color.id === item.id}
              onClick={() => props.onColor(item)}
              key={item.id}
            ><span /></button>
          ))}
        </div>
      </section>
      <section className="control-section">
        <div className="section-label"><span>Finish</span><b>{props.finish.name}</b></div>
        <div className="finish-list">
          {CASE_FINISHES.map((item) => (
            <button
              type="button"
              className={props.finish.id === item.id ? "is-active" : ""}
              onClick={() => props.onFinish(item)}
              key={item.id}
            >
              <span><b>{item.name}</b><small>{item.description}</small></span>
              <em>{item.priceDelta ? `+${money(item.priceDelta)}` : "Included"}</em>
            </button>
          ))}
        </div>
      </section>
      <div className="material-note"><b>2.5 mm</b><span>Shock-proof shell with raised camera lip</span></div>
    </>
  );
}

function DesignStep(props: Props) {
  return (
    <>
      <StepHeading kicker="03 / Design" title="Make it yours." copy="Add, drag and tune every layer directly on the case." />
      <div className="add-tools">
        <form
          className="text-tool"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const value = String(form.get("text") ?? "").trim();
            if (value) props.onAddText(value);
            event.currentTarget.reset();
          }}
        >
          <input name="text" maxLength={36} placeholder="Type something iconic" aria-label="Text to add" />
          <button type="submit">Add text</button>
        </form>
        <label className="upload-tool">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) props.onAddImage(file);
              event.target.value = "";
            }}
          />
          <span>↑</span> Upload artwork <small>PNG, JPG or WebP · 12 MB max</small>
        </label>
      </div>
      <section className="control-section sticker-section">
        <div className="section-label"><span>Sticker drop</span><b>Tap to add</b></div>
        <div className="sticker-grid">
          {STICKERS.map((sticker) => <button type="button" key={sticker} onClick={() => props.onAddSticker(sticker)}>{sticker}</button>)}
        </div>
      </section>
      <section className="control-section layer-section">
        <div className="section-label"><span>Layers</span><b>{props.layers.length}/20</b></div>
        {props.layers.length ? (
          <div className="layer-list">
            {[...props.layers].reverse().map((layer, index) => (
              <button
                type="button"
                className={props.selectedLayer?.id === layer.id ? "is-active" : ""}
                onClick={() => props.onSelectLayer(layer.id)}
                key={layer.id}
              >
                <span>{layer.type === "image" ? "IMG" : layer.type === "text" ? "Aa" : "✦"}</span>
                <b>{layer.sourceName ?? layer.content}</b>
                <em>{props.layers.length - index}</em>
              </button>
            ))}
          </div>
        ) : <div className="empty-layers">Your blank canvas is waiting.</div>}
      </section>
    </>
  );
}

function ReviewStep(props: Props) {
  const price = BASE_PRICE + props.finish.priceDelta;
  return (
    <>
      <StepHeading kicker="04 / Share" title="Make it real." copy="Create an unlisted link to this exact design—no account or payment needed." />
      <div className="review-card">
        <div><span>Device</span><b>{props.device.name}</b></div>
        <div><span>Case</span><b>{props.color.name} · {props.finish.name}</b></div>
        <div><span>Artwork</span><b>{props.layers.length} {props.layers.length === 1 ? "layer" : "layers"}</b></div>
        <div className="review-total"><span>Estimated price</span><b>{money(price)}</b></div>
      </div>
      <div className="quality-checks">
        <div><span>✓</span><p><b>Universal print master</b><small>2400 × 4800 transparent PNG</small></p></div>
        <div><span>✓</span><p><b>Originals preserved</b><small>Source artwork saved separately</small></p></div>
        <div><span>✓</span><p><b>Exact placement</b><small>Normalized position, scale and rotation</small></p></div>
      </div>
      {props.saveState.status === "saved" ? (
        <div className="save-success" role="status">
          <span>Production file locked</span>
          <b>{props.saveState.productionRef}</b>
          <small className="share-path">{props.saveState.sharePath}</small>
          <div className="share-actions">
            <button type="button" onClick={props.onCopyShare}>Copy link</button>
            <button type="button" onClick={props.onNativeShare}>Share</button>
            <button type="button" onClick={props.onWhatsAppShare}>WhatsApp</button>
          </div>
          {props.shareFeedback && <em className="share-feedback" role="status">{props.shareFeedback}</em>}
          <button type="button" className="download-proof" onClick={props.onDownload}>Download transparent print master</button>
        </div>
      ) : (
        <form
          className="share-form"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            props.onSave({
              customerName: String(form.get("customerName") ?? ""),
              phoneNumber: String(form.get("phoneNumber") ?? ""),
            });
          }}
        >
          <label><span>Your name</span><input name="customerName" autoComplete="name" minLength={2} maxLength={60} required placeholder="e.g. Riya Sharma" /></label>
          <label><span>Indian mobile number</span><div className="phone-field"><b>+91</b><input name="phoneNumber" autoComplete="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} required placeholder="9876543210" /></div></label>
          <p>Used only to prepare your WhatsApp action in this browser. It is never uploaded or shown in the shared link.</p>
          <button type="submit" className="save-design" disabled={props.saveState.status === "saving"}>
            <span>{props.saveState.status === "saving" ? "Building your print pack…" : "Create shareable design"}</span>
            <em>{money(price)} est. →</em>
          </button>
        </form>
      )}
      {props.saveState.status === "error" && <p className="save-error" role="alert">{props.saveState.message}</p>}
      <p className="checkout-note">This is an estimate only. No payment is collected.</p>
    </>
  );
}

function LayerInspector(props: Props) {
  const layer = props.selectedLayer;
  if (!layer || props.step !== 3) return null;
  return (
    <aside className="layer-inspector" aria-label="Selected layer controls">
      <div className="inspector-head"><span>Edit layer</span><b>{layer.sourceName ?? layer.content}</b></div>
      <label>Size <output>{Math.round(layer.width)}%</output><input type="range" min="10" max="88" value={layer.width} onChange={(event) => props.onChangeLayer(layer.id, { width: Number(event.target.value) })} /></label>
      <label>Rotate <output>{Math.round(layer.rotation)}°</output><input type="range" min="-180" max="180" value={layer.rotation} onChange={(event) => props.onChangeLayer(layer.id, { rotation: Number(event.target.value) })} /></label>
      <div className="rotation-presets" aria-label="Quick rotation angles">
        <span>Quick angles</span>
        {[0, 90, -90, 180].map((angle) => (
          <button
            type="button"
            key={angle}
            className={Math.round(layer.rotation) === angle ? "is-active" : ""}
            aria-label={`Rotate layer to ${angle} degrees`}
            onClick={() => props.onChangeLayer(layer.id, { rotation: angle })}
          >
            {angle < 0 ? "−" : ""}{Math.abs(angle)}°
          </button>
        ))}
      </div>
      <p className="rotation-help">Drag the ↻ handle on your artwork for free rotation.</p>
      {layer.type !== "image" && (
        <>
          <div className="mini-colors">
            {["#ffffff", "#111111", "#F23A3A", "#B8E25A", "#FFD43B"].map((color) => <button type="button" key={color} style={{ background: color }} className={layer.color === color ? "is-active" : ""} aria-label={`Set layer color ${color}`} onClick={() => props.onChangeLayer(layer.id, { color })} />)}
          </div>
          <div className="font-grid">
            {FONT_OPTIONS.map((font) => <button type="button" key={font.id} className={layer.font === font.id ? "is-active" : ""} onClick={() => props.onChangeLayer(layer.id, { font: font.id })}>{font.name}</button>)}
          </div>
        </>
      )}
      <div className="inspector-actions">
        <button type="button" onClick={() => props.onDuplicateLayer(layer.id)}>Duplicate</button>
        <button type="button" className="danger" onClick={() => props.onDeleteLayer(layer.id)}>Delete</button>
      </div>
    </aside>
  );
}

export function ControlsPanel(props: Props) {
  return (
    <div className="controls-column">
      <div className="controls-scroll">
        {props.step === 1 && <DeviceStep {...props} />}
        {props.step === 2 && <CaseStep {...props} />}
        {props.step === 3 && <DesignStep {...props} />}
        {props.step === 4 && <ReviewStep {...props} />}
        <LayerInspector {...props} />
      </div>
      <div className="panel-nav">
        <button type="button" className="back-button" onClick={props.onBack} disabled={props.step === 1}>← Back</button>
        {props.step < 4 && <button type="button" className="next-button" onClick={props.onNext}>Continue <span>→</span></button>}
      </div>
    </div>
  );
}
