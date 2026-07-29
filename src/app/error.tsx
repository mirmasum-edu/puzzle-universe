"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this would go to an error reporting service.
    console.error("App error:", error);
  }, [error]);

  return (
    <main className="pu-bg min-h-screen flex items-center justify-center p-6 text-center">
      <div className="glass-strong rounded-3xl p-10 max-w-md animate-fade-up">
        <div className="text-6xl mb-3">😵</div>
        <h1 className="text-2xl font-black">Something went wrong</h1>
        <p className="text-white/60 mt-2">
          An unexpected error occurred. You can try again or head back to safety.
        </p>
        {error.digest && (
          <p className="text-white/30 text-xs mt-2">Error ref: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={reset}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 font-semibold"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="rounded-xl bg-white/10 hover:bg-white/15 px-6 py-3 font-semibold"
          >
            Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
