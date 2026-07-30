"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSubmitScore } from "@/lib/useSubmitScore";
import GameOverlay from "@/components/GameOverlay";

const EMOJIS = ["🍎", "🍌", "🍇", "🍉", "🍓", "🍒", "🥝", "🍍", "🥥", "🍑", "🫐", "🥭"];

type Card = { id: number; emoji: string; flipped: boolean; matched: boolean };

const DIFFICULTIES = {
  easy: { pairs: 6, cols: 4, label: "Easy (6 pairs)" },
  medium: { pairs: 8, cols: 4, label: "Medium (8 pairs)" },
  hard: { pairs: 12, cols: 6, label: "Hard (12 pairs)" },
} as const;

type Diff = keyof typeof DIFFICULTIES;

function buildDeck(pairs: number): Card[] {
  const chosen = EMOJIS.slice(0, pairs);
  const deck = [...chosen, ...chosen]
    .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5)
    .map((c, i) => ({ ...c, id: i }));
  return deck;
}

export default function MemoryMatch() {
  const [diff, setDiff] = useState<Diff>("medium");
  const [cards, setCards] = useState<Card[]>(() => buildDeck(DIFFICULTIES.medium.pairs));
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [lock, setLock] = useState(false);
  const { submit, submitting, saved, reset } = useSubmitScore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const config = DIFFICULTIES[diff];

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    setRunning(true);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
  }, []);

  const newGame = useCallback(
    (d: Diff = diff) => {
      stopTimer();
      setCards(buildDeck(DIFFICULTIES[d].pairs));
      setSelected([]);
      setMoves(0);
      setMatches(0);
      setSeconds(0);
      setGameOver(false);
      setLock(false);
      reset();
    },
    [diff, stopTimer, reset]
  );

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const finalScore = useMemo(() => {
    const base = config.pairs * 200;
    const timePenalty = seconds * 3;
    const movePenalty = Math.max(0, moves - config.pairs) * 8;
    return Math.max(50, base - timePenalty - movePenalty);
  }, [config.pairs, seconds, moves]);

  function flip(index: number) {
    if (lock || gameOver) return;
    const card = cards[index];
    if (card.flipped || card.matched) return;
    if (!running) startTimer();

    const next = cards.map((c, i) => (i === index ? { ...c, flipped: true } : c));
    const newSelected = [...selected, index];
    setCards(next);
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newSelected;
      if (next[a].emoji === next[b].emoji) {
        // match
        const matched = next.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c));
        setCards(matched);
        setSelected([]);
        const newMatches = matches + 1;
        setMatches(newMatches);
        if (newMatches === config.pairs) {
          stopTimer();
          setGameOver(true);
          const score =
            Math.max(50, config.pairs * 200 - seconds * 3 - Math.max(0, moves + 1 - config.pairs) * 8);
          submit({ score, lines: config.pairs, combo: newMatches, mode: "memory" });
        }
      } else {
        setLock(true);
        setTimeout(() => {
          setCards((cur) => cur.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c)));
          setSelected([]);
          setLock(false);
        }, 800);
      }
    }
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(DIFFICULTIES) as Diff[]).map((d) => (
          <button
            key={d}
            onClick={() => {
              setDiff(d);
              newGame(d);
            }}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              diff === d ? "bg-violet-500" : "bg-white/5 hover:bg-white/10 text-white/70"
            }`}
          >
            {DIFFICULTIES[d].label}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl p-4 sm:p-6">
        <div className="flex flex-wrap gap-3 mb-4 text-sm">
          <Stat icon="⏱️" label="Time" value={`${mm}:${ss}`} />
          <Stat icon="🔄" label="Moves" value={moves} />
          <Stat icon="✨" label="Matches" value={`${matches}/${config.pairs}`} />
          <Stat icon="⭐" label="Est. Score" value={gameOver ? finalScore : "—"} />
          <button
            onClick={() => newGame()}
            className="ml-auto rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-sm font-medium"
          >
            ↻ Restart
          </button>
        </div>

        <div className="relative">
          <div
            className="grid gap-2 sm:gap-3 mx-auto max-w-[560px]"
            style={{ gridTemplateColumns: `repeat(${config.cols}, minmax(0,1fr))` }}
          >
            {cards.map((card, i) => {
              const revealed = card.flipped || card.matched;
              return (
                <button
                  key={card.id}
                  onClick={() => flip(i)}
                  className="aspect-square rounded-xl text-2xl sm:text-3xl flex items-center justify-center transition-all duration-200"
                  style={{
                    background: card.matched
                      ? "rgba(16,185,129,0.25)"
                      : revealed
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(255,255,255,0.05)",
                    transform: revealed ? "rotateY(0deg)" : "rotateY(0deg)",
                    boxShadow: card.matched ? "0 0 0 2px rgba(16,185,129,0.5) inset" : "none",
                  }}
                >
                  {revealed ? card.emoji : "❓"}
                </button>
              );
            })}
          </div>

          <GameOverlay
            show={gameOver}
            won
            title="Well Played!"
            score={finalScore}
            subtitle={`${moves} moves · ${mm}:${ss}`}
            saving={submitting}
            saved={saved}
            onRestart={() => newGame()}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white/5 px-4 py-2">
      <div className="text-xs text-white/50">
        {icon} {label}
      </div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}
