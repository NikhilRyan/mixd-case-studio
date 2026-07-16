"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Application render failed", { digest: error.digest });
  }, [error]);

  return (
    <main className="system-state" role="alert">
      <div>
        <span>Temporary error</span>
        <h1>That didn’t render.</h1>
        <p>Your design is still in this browser. Try the page again without starting over.</p>
        <button type="button" onClick={reset}>Try again</button>
      </div>
    </main>
  );
}
