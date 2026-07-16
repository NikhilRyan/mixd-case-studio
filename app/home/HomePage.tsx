const steps = [
  { number: "01", title: "Pick your phone", copy: "Choose an exact iPhone or Pixel fit. More devices drop into the catalogue without changing the studio." },
  { number: "02", title: "Make your mark", copy: "Mix color, text, stickers and your own images on a live, full-angle case preview." },
  { number: "03", title: "Share the vision", copy: "Create an unlisted link to the exact design and send it before anything goes to print." },
];

const gallery = [
  { className: "gallery-red", label: "LOUD MODE", sticker: "☺" },
  { className: "gallery-blue", label: "NO SIGNAL", sticker: "✦" },
  { className: "gallery-lime", label: "LUCKY YOU", sticker: "★" },
  { className: "gallery-ink", label: "404", sticker: "HOT!" },
];

function MiniCamera() {
  return <span className="home-camera" aria-hidden="true"><i /><i /><i /></span>;
}

export function HomePage() {
  return (
    <main className="home-shell">
      <nav className="home-nav" aria-label="Main navigation">
        <a className="brand-mark" href="#top" aria-label="MIXD home">MIXD<span>.</span></a>
        <div className="home-nav-links">
          <a href="#how">How it works</a>
          <a href="#designs">The drop</a>
          <a href="#print">Print ready</a>
        </div>
        <Link className="home-nav-cta" href="/studio">Start designing <span>↗</span></Link>
      </nav>

      <section className="home-hero" id="top">
        <div className="hero-copy">
          <div className="hero-kicker"><span>Custom case studio</span><i /> India · Ships soon</div>
          <h1>Make your phone<br /><em>look like yours.</em></h1>
          <p>Your camera roll, your name, your weird little universe—printed on a case engineered for the phone already in your hand.</p>
          <div className="hero-actions">
            <Link href="/studio">Design yours <span>→</span></Link>
            <div><b>From ₹1,499</b><small>Estimated · no payment now</small></div>
          </div>
          <div className="hero-proof">
            <span><b>360°</b> live preview</span>
            <span><b>300+</b> DPI master</span>
            <span><b>1:1</b> shareable file</span>
          </div>
        </div>

        <div className="hero-art" aria-label="Three colorful custom phone-case concepts">
          <div className="hero-stamp">Made<br />by you</div>
          <div className="hero-case hero-case-back"><MiniCamera /><b>404</b><small>not basic</small></div>
          <div className="hero-case hero-case-front"><MiniCamera /><b>MIX<br />IT UP</b><span>☺</span></div>
          <div className="hero-case hero-case-side"><MiniCamera /><b>LUCKY</b><span>★</span></div>
          <div className="hero-ring ring-a" /><div className="hero-ring ring-b" />
        </div>
      </section>

      <div className="home-marquee" aria-hidden="true">
        <div>YOUR NAME · YOUR ART · YOUR PHONE · YOUR RULES · <span>MIXD.</span> · YOUR NAME · YOUR ART · YOUR PHONE · YOUR RULES · <span>MIXD.</span></div>
      </div>

      <section className="how-section" id="how">
        <header className="home-section-head">
          <span>Three moves. One original.</span>
          <h2>From blank case to<br />“where did you get that?”</h2>
          <p>No design software. No guessing. The studio keeps every move reversible until the design feels exactly right.</p>
        </header>
        <div className="how-grid">
          {steps.map((step) => (
            <article key={step.number}>
              <span>{step.number}</span>
              <div className={`how-visual how-visual-${step.number}`}><i /><b>{step.number === "01" ? "16 PRO" : step.number === "02" ? "MIXD" : "↗"}</b></div>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="orbit-story" id="print">
        <div className="orbit-copy">
          <span>See every side</span>
          <h2>Not a flat mockup.<br /><em>A case you can orbit.</em></h2>
          <p>Spin through every angle, inspect the shell edge and inner surface, then return to the print face without losing your artwork.</p>
          <ul>
            <li><b>01</b> Full 360° mouse and touch orbit</li>
            <li><b>02</b> Device-specific proportions and cutout preview</li>
            <li><b>03</b> Transparent universal print master</li>
          </ul>
          <Link href="/studio">Open the 3D studio <span>→</span></Link>
        </div>
        <div className="orbit-demo" aria-hidden="true">
          <div className="orbit-demo-case"><MiniCamera /><span>TURN<br />ME</span><i>↻</i></div>
          <div className="orbit-axis axis-x" /><div className="orbit-axis axis-y" />
          <small>Drag to rotate · all angles</small>
        </div>
      </section>

      <section className="drop-section" id="designs">
        <header className="home-section-head compact">
          <span>The MIXD drop</span>
          <h2>Steal the energy.<br />Never the design.</h2>
          <Link href="/studio">Start from blank →</Link>
        </header>
        <div className="case-gallery">
          {gallery.map((item, index) => (
            <article key={item.label} className={item.className}>
              <div className="gallery-case"><MiniCamera /><b>{item.label}</b><span>{item.sticker}</span></div>
              <p><span>0{index + 1}</span>{item.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-final-cta">
        <div><span>Your blank case is waiting.</span><h2>Make the one<br />that doesn’t exist yet.</h2></div>
        <Link href="/studio"><span>Start designing</span><b>↗</b></Link>
      </section>

      <footer className="home-footer">
        <a className="brand-mark" href="#top">MIXD<span>.</span></a>
        <p>Made by you.<br />Printed by us.</p>
        <div><a href="#how">How it works</a><a href="#designs">Designs</a><Link href="/studio">Studio</Link></div>
        <small>© 2026 MIXD Studio · India</small>
      </footer>
    </main>
  );
}
import Link from "next/link";
