import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-shell">
      <Link className="brand-mark" href="/">MIXD<span>.</span></Link>
      <div><span>404 / no signal</span><h1>That design<br />isn’t here.</h1><p>The link may be incomplete or the design is no longer available.</p><Link href="/studio">Create a new case →</Link></div>
    </main>
  );
}
