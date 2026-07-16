export default function Loading() {
  return (
    <main className="system-state" aria-live="polite" aria-busy="true">
      <div>
        <div className="loading-pulse" aria-hidden="true" />
        <span>Loading MIXD.</span>
      </div>
    </main>
  );
}
