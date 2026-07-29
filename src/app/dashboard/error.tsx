"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="glass rounded-2xl p-10 text-center animate-fade-up">
      <div className="text-5xl mb-3">⚠️</div>
      <h2 className="text-xl font-bold">This section hit a snag</h2>
      <p className="text-white/60 mt-2 text-sm">
        We couldn&apos;t load this page. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-2.5 font-semibold"
      >
        Retry
      </button>
    </div>
  );
}
