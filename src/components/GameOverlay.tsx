"use client";

type Props = {
  show: boolean;
  won?: boolean;
  title?: string;
  score: number;
  subtitle?: string;
  saving?: boolean;
  saved?: boolean;
  onRestart: () => void;
};

export default function GameOverlay({
  show,
  won,
  title,
  score,
  subtitle,
  saving,
  saved,
  onRestart,
}: Props) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/75 backdrop-blur-sm animate-fade-up">
      <div className="text-center px-6">
        <div className="text-5xl mb-2">{won ? "🏆" : "🎮"}</div>
        <h3 className="text-2xl font-bold">{title ?? (won ? "You Win!" : "Game Over")}</h3>
        <p className="text-white/70 mt-1">Score: {score.toLocaleString()}</p>
        {subtitle && <p className="text-white/50 text-sm mt-0.5">{subtitle}</p>}
        <p className="text-white/40 text-xs mt-1 h-4">
          {saving ? "Saving…" : saved ? "Progress saved ✔" : ""}
        </p>
        <button
          onClick={onRestart}
          className="mt-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-2.5 font-semibold"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
