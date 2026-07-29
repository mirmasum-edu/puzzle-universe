export default function Loading() {
  return (
    <main className="pu-bg min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-fade-up">
        <div className="text-5xl animate-pop">🧩</div>
        <div className="h-1.5 w-40 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-violet-400 to-fuchsia-400 skeleton" />
        </div>
        <p className="text-white/40 text-sm">Loading Puzzle Universe…</p>
      </div>
    </main>
  );
}
