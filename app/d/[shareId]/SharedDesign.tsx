"use client";

import Link from "next/link";
import { BASE_PRICE, formatPrice, getColor, getDevice, getFinish } from "../../studio/catalog";
import { CasePreview } from "../../studio/CasePreview";
import type { StoredDesign } from "../../studio/types";

type Props = {
  customerName: string;
  productionRef: string;
  createdLabel: string;
  spec: StoredDesign;
};

const noChange = () => undefined;

export function SharedDesign({ customerName, productionRef, createdLabel, spec }: Props) {
  const device = getDevice(spec.deviceId);
  const color = getColor(spec.colorId);
  const finish = getFinish(spec.finishId);

  return (
    <main className="shared-shell">
      <nav className="shared-nav">
        <Link className="brand-mark" href="/">MIXD<span>.</span></Link>
        <span>Shared design · read only</span>
        <Link href="/studio">Create yours ↗</Link>
      </nav>
      <section className="shared-grid">
        <div className="shared-story">
          <span className="shared-kicker">An original by {customerName}</span>
          <h1>This is the<br /><em>exact one.</em></h1>
          <p>Rotate the case through every angle. The color, finish, artwork, scale and placement are loaded from the locked production file.</p>
          <dl>
            <div><dt>Device</dt><dd>{device.name}</dd></div>
            <div><dt>Case</dt><dd>{color.name} · {finish.name}</dd></div>
            <div><dt>Layers</dt><dd>{spec.layers.length}</dd></div>
            <div><dt>Estimate</dt><dd>{formatPrice(BASE_PRICE + finish.priceDelta)}</dd></div>
          </dl>
          <div className="shared-ref"><span>Production reference</span><b>{productionRef}</b><small>Locked {createdLabel}</small></div>
          <Link className="shared-cta" href="/studio">Make your own <span>→</span></Link>
        </div>
        <div className="shared-preview">
          <CasePreview
            device={device}
            color={color}
            finishId={finish.id}
            layers={spec.layers}
            selectedLayerId={null}
            readOnly
            onSelectLayer={noChange}
            onChangeLayer={noChange}
            onDeleteLayer={noChange}
          />
        </div>
      </section>
    </main>
  );
}
