"use client";

import { useEffect, useRef, useState } from "react";
import { FONT_OPTIONS } from "./catalog";
import type { CaseColor, DesignLayer, Device } from "./types";

type Props = {
  device: Device;
  color: CaseColor;
  finishId: string;
  layers: DesignLayer[];
  selectedLayerId: string | null;
  readOnly?: boolean;
  onSelectLayer: (layerId: string | null) => void;
  onChangeLayer: (layerId: string, patch: Partial<DesignLayer>) => void;
  onDeleteLayer: (layerId: string) => void;
};

type DragState = {
  id: string;
  pointerId: number;
  startX: number;
  startY: number;
  layerX: number;
  layerY: number;
};

type OrbitState = { pitch: number; yaw: number };

type OrbitDrag = OrbitState & {
  pointerId: number;
  startX: number;
  startY: number;
};

type RotationDrag = {
  id: string;
  pointerId: number;
  centerX: number;
  centerY: number;
  startPointerAngle: number;
  startRotation: number;
};

function pointerAngle(centerX: number, centerY: number, pointerX: number, pointerY: number) {
  return (Math.atan2(pointerY - centerY, pointerX - centerX) * 180) / Math.PI;
}

function normalizeRotation(angle: number) {
  return ((angle + 180) % 360 + 360) % 360 - 180;
}

function Camera({ style }: { style: Device["cameraStyle"] }) {
  if (style === "pixel-bar") {
    return <div className="camera-bar" aria-hidden="true"><span /><span /><i /></div>;
  }
  return (
    <div className={`camera-island ${style}`} aria-hidden="true">
      <span /><span />{style === "iphone-triple" && <span />}<i />
    </div>
  );
}

function InnerCameraCutout({ style }: { style: Device["cameraStyle"] }) {
  return <div className={`inner-camera-cutout inner-${style}`} aria-hidden="true"><span /><span /><span /></div>;
}

export function CasePreview({
  device,
  color,
  finishId,
  layers,
  selectedLayerId,
  readOnly = false,
  onSelectLayer,
  onChangeLayer,
  onDeleteLayer,
}: Props) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const rotationDragRef = useRef<RotationDrag | null>(null);
  const orbitDragRef = useRef<OrbitDrag | null>(null);
  const [orbit, setOrbit] = useState<OrbitState>({ pitch: -7, yaw: -16 });
  const [autoRotate, setAutoRotate] = useState(false);

  useEffect(() => {
    if (readOnly) return;
    function onKeyDown(event: KeyboardEvent) {
      if (!selectedLayerId) return;
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select")) return;
      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        onDeleteLayer(selectedLayerId);
        return;
      }
      const delta = event.shiftKey ? 2 : 0.5;
      const selected = layers.find((layer) => layer.id === selectedLayerId);
      if (!selected) return;
      const movement: Record<string, Partial<DesignLayer>> = {
        ArrowLeft: { x: Math.max(3, selected.x - delta) },
        ArrowRight: { x: Math.min(97, selected.x + delta) },
        ArrowUp: { y: Math.max(3, selected.y - delta) },
        ArrowDown: { y: Math.min(97, selected.y + delta) },
      };
      if (movement[event.key]) {
        event.preventDefault();
        onChangeLayer(selectedLayerId, movement[event.key]);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [layers, onChangeLayer, onDeleteLayer, readOnly, selectedLayerId]);

  function beginLayerDrag(event: React.PointerEvent, layer: DesignLayer) {
    if (readOnly) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      id: layer.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      layerX: layer.x,
      layerY: layer.y,
    };
    onSelectLayer(layer.id);
  }

  function moveLayer(event: React.PointerEvent) {
    const drag = dragRef.current;
    const surface = surfaceRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !surface) return;
    const bounds = surface.getBoundingClientRect();
    onChangeLayer(drag.id, {
      x: Math.min(97, Math.max(3, drag.layerX + ((event.clientX - drag.startX) / bounds.width) * 100)),
      y: Math.min(97, Math.max(3, drag.layerY + ((event.clientY - drag.startY) / bounds.height) * 100)),
    });
  }

  function endLayerDrag(event: React.PointerEvent) {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  }

  function beginLayerRotation(event: React.PointerEvent<HTMLElement>, layer: DesignLayer) {
    if (readOnly) return;
    event.preventDefault();
    event.stopPropagation();
    const layerElement = event.currentTarget.closest(".design-layer");
    if (!(layerElement instanceof HTMLElement)) return;
    const bounds = layerElement.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    event.currentTarget.setPointerCapture(event.pointerId);
    rotationDragRef.current = {
      id: layer.id,
      pointerId: event.pointerId,
      centerX,
      centerY,
      startPointerAngle: pointerAngle(centerX, centerY, event.clientX, event.clientY),
      startRotation: layer.rotation,
    };
    onSelectLayer(layer.id);
  }

  function moveLayerRotation(event: React.PointerEvent<HTMLElement>) {
    const drag = rotationDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    const currentPointerAngle = pointerAngle(drag.centerX, drag.centerY, event.clientX, event.clientY);
    const angleDelta = normalizeRotation(currentPointerAngle - drag.startPointerAngle);
    onChangeLayer(drag.id, { rotation: normalizeRotation(drag.startRotation + angleDelta) });
  }

  function endLayerRotation(event: React.PointerEvent<HTMLElement>) {
    if (rotationDragRef.current?.pointerId !== event.pointerId) return;
    event.stopPropagation();
    rotationDragRef.current = null;
  }

  function beginOrbit(event: React.PointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest(".design-layer, .orbit-controls")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    orbitDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      ...orbit,
    };
    setAutoRotate(false);
    if (!readOnly) onSelectLayer(null);
  }

  function moveOrbit(event: React.PointerEvent<HTMLDivElement>) {
    const drag = orbitDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setOrbit({
      yaw: drag.yaw + (event.clientX - drag.startX) * 0.72,
      pitch: Math.max(-72, Math.min(72, drag.pitch - (event.clientY - drag.startY) * 0.45)),
    });
  }

  function endOrbit(event: React.PointerEvent<HTMLDivElement>) {
    if (orbitDragRef.current?.pointerId === event.pointerId) orbitDragRef.current = null;
  }

  return (
    <div
      className={`preview-stage ${readOnly ? "is-read-only" : ""}`}
      onPointerDown={beginOrbit}
      onPointerMove={moveOrbit}
      onPointerUp={endOrbit}
      onPointerCancel={endOrbit}
    >
      <div className="preview-orbit orbit-one" /><div className="preview-orbit orbit-two" />
      <div
        className="phone-case-wrap"
        style={{
          aspectRatio: `${device.aspectRatio} / 1`,
          transform: `rotateX(${orbit.pitch}deg) rotateY(${orbit.yaw}deg) rotateZ(-2deg)`,
        }}
      >
        <div className={`phone-case-spin ${autoRotate ? "is-spinning" : ""}`}>
          <div className="phone-case-3d" style={{ "--case-color": color.hex } as React.CSSProperties}>
            <div className={`phone-case phone-case-back finish-${finishId}`}>
              <div ref={surfaceRef} className="design-surface">
                {layers.map((layer) => {
                  const font = FONT_OPTIONS.find((option) => option.id === layer.font)?.css;
                  return (
                    <button
                      type="button"
                      key={layer.id}
                      tabIndex={readOnly ? -1 : 0}
                      className={`design-layer design-layer-${layer.type} ${selectedLayerId === layer.id ? "is-selected" : ""} ${readOnly ? "is-locked" : ""}`}
                      style={{
                        left: `${layer.x}%`,
                        top: `${layer.y}%`,
                        width: `${layer.width}%`,
                        color: layer.color,
                        fontFamily: font,
                        transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                      }}
                      onPointerDown={readOnly ? undefined : (event) => beginLayerDrag(event, layer)}
                      onPointerMove={readOnly ? undefined : moveLayer}
                      onPointerUp={readOnly ? undefined : endLayerDrag}
                      onPointerCancel={readOnly ? undefined : endLayerDrag}
                      aria-label={readOnly ? `Artwork: ${layer.sourceName ?? layer.content}` : `Move or rotate ${layer.sourceName ?? layer.content}`}
                    >
                      {layer.type === "image" ? (
                        // Shared and local object URLs cannot be processed by the Next image optimizer.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={layer.content} alt="Uploaded artwork" draggable={false} />
                      ) : <span>{layer.content}</span>}
                      {selectedLayerId === layer.id && !readOnly && (
                        <i
                          className="layer-rotation-handle"
                          data-angle={`${Math.round(layer.rotation)}°`}
                          aria-hidden="true"
                          onPointerDown={(event) => beginLayerRotation(event, layer)}
                          onPointerMove={moveLayerRotation}
                          onPointerUp={endLayerRotation}
                          onPointerCancel={endLayerRotation}
                        >
                          ↻
                        </i>
                      )}
                    </button>
                  );
                })}
                <div className="case-grain" aria-hidden="true" /><div className="case-glare" aria-hidden="true" />
              </div>
              <Camera style={device.cameraStyle} /><div className="case-rim" aria-hidden="true" />
            </div>
            <div className="phone-case-inner" aria-hidden="true">
              <div className="inner-screen"><span>MIXD</span></div>
              <InnerCameraCutout style={device.cameraStyle} />
            </div>
            <i className="case-side case-side-left" aria-hidden="true" />
            <i className="case-side case-side-right" aria-hidden="true" />
            <i className="case-side case-side-top" aria-hidden="true" />
            <i className="case-side case-side-bottom" aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className="preview-shadow" aria-hidden="true" />
      <div className="preview-caption"><span className="live-dot" /> {readOnly ? "Exact shared file" : "Live preview"} · {device.shortName}</div>
      <div className="orbit-controls" onPointerDown={(event) => event.stopPropagation()}>
        <button type="button" className={autoRotate ? "is-active" : ""} aria-pressed={autoRotate} onClick={() => setAutoRotate((current) => !current)}>{autoRotate ? "Pause orbit" : "Auto orbit"}</button>
        <button type="button" onClick={() => { setAutoRotate(false); setOrbit({ pitch: -7, yaw: -16 }); }}>Reset view</button>
      </div>
      <div className="orbit-hint">Drag empty space to rotate 360°</div>
    </div>
  );
}
