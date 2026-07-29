import Link from "next/link";

export default function NotFound() {
  return (
    <main className="pu-bg min-h-screen flex items-center justify-center p-6 text-center">
      <div className="glass-strong rounded-3xl p-10 max-w-md animate-fade-up">
        <div className="text-6xl mb-3">🧩</div>
        <h1 className="text-3xl font-black">404</h1>
        <p className="text-white/60 mt-2">
          This puzzle piece doesn&apos;t fit anywhere. The page you&apos;re looking for
          could not be found.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 font-semibold"
        >
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
