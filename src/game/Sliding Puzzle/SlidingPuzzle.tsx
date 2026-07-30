"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSubmitScore } from "@/lib/useSubmitScore";
import GameOverlay from "@/components/GameOverlay";

const SIZES = { 3: "3×3 (Easy)", 4: "4×4 (Classic)", 5: "5×5 (Hard)" } as const;
type N = 3 | 4 | 5;

function solved(n: number): number[] {
  return Array.from({ length: n * n }, (_, i) => (i + 1) % (n * n));
}

function isSolved(tiles: number[]): boolean {
  const goal = solved(Math.round(Math.sqrt(tiles.length)));
  return tiles.every((t, i) => t === goal[i]);
}

function shuffle(n: number): number[] {
  // Perform random valid moves from solved state to guarantee solvability
  let tiles = solved(n);
  let blank = tiles.indexOf(0);
  const moves = n * n * 40;
  for (let i = 0; i < moves; i++) {
    const neighbors: number[] = [];
    const r = Math.floor(blank / n);
    const c = blank % n;
    if (r > 0) neighbors.push(blank - n);
    if (r < n - 1) neighbors.push(blank + n);
    if (c > 0) neighbors.push(blank - 1);
    if (c < n - 1) neighbors.push(blank + 1);
    const target = neighbors[Math.floor(Math.random() * neighbors.length)];
    [tiles[blank], tiles[target]] = [tiles[target], tiles[blank]];
    blank = target;
  }
  if (isSolved(tiles)) return shuffle(n);
  return tiles;
}

export default function SlidingPuzzle() {
  const [n, setN] = useState<N>(4);
  const [tiles, setTiles] = useState<number[]>(() => shuffle(4));
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);
  const { submit, submitting, saved, reset } = useSubmitScore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
  }, []);

  const newGame = useCallback(
    (size: N = n) => {
      stopTimer();
      setTiles(shuffle(size));
      setMoves(0);
      setSeconds(0);
      setWon(false);
      reset();
    },
    [n, stopTimer, reset]
  );

  useEffect(() => () => stopTimer(), [stopTimer]);

  const score = useMemo(() => {
    const base = n * n * 250;
    return Math.max(50, base - seconds * 4 - moves * 5);
  }, [n, seconds, moves]);

  function startTimer() {
    if (timerRef.current) return;
    setRunning(true);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }

  function tryMove(index: number) {
    if (won) return;
    const blank = tiles.indexOf(0);
    const r = Math.floor(index / n);
    const c = index % n;
    const br = Math.floor(blank / n);
    const bc = blank % n;
    const adjacent = (Math.abs(r - br) === 1 && c === bc) || (Math.abs(c - bc) === 1 && r === br);
    if (!adjacent) return;
    if (!running) startTimer();
    const next = tiles.slice();
    [next[blank], next[index]] = [next[index], next[blank]];
    setTiles(next);
    setMoves((m) => m + 1);
    if (isSolved(next)) {
      stopTimer();
      setWon(true);
      const finalScore = Math.max(50, n * n * 250 - seconds * 4 - (moves + 1) * 5);
      submit({ score: finalScore, combo: 0, mode: "sliding" });
    }
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(SIZES) as unknown as N[]).map((size) => (
          <button
            key={size}
            onClick={() => {
              setN(Number(size) as N);
              newGame(Number(size) as N);
            }}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              n === Number(size) ? "bg-violet-500" : "bg-white/5 hover:bg-white/10 text-white/70"
            }`}
          >
            {SIZES[size]}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl p-4 sm:p-6 max-w-[520px] mx-auto">
        <div className="flex gap-3 mb-4 text-sm">
          <Stat icon="⏱️" label="Time" value={`${mm}:${ss}`} />
          <Stat icon="🔄" label="Moves" value={moves} />
          <button
            onClick={() => newGame()}
            className="ml-auto rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-sm font-medium"
          >
            ↻ Shuffle
          </button>
        </div>

        <div className="relative">
          <div
            className="grid gap-2 mx-auto"
            style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}
          >
            {tiles.map((t, i) => (
              <button
                key={i}
                onClick={() => tryMove(i)}
                disabled={t === 0}
                className="aspect-square rounded-xl flex items-center justify-center font-bold transition-all"
                style={{
                  background: t === 0 ? "transparent" : "rgba(139,92,246,0.85)",
                  fontSize: n === 5 ? "1.1rem" : "1.6rem",
                  cursor: t === 0 ? "default" : "pointer",
                  boxShadow: t === 0 ? "none" : "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                {t !== 0 && t}
              </button>
            ))}
          </div>

          <GameOverlay
            show={won}
            won
            title="Solved!"
            score={score}
            subtitle={`${moves} moves · ${mm}:${ss}`}
            saving={submitting}
            saved={saved}
            onRestart={() => newGame()}
          />
        </div>
        <p className="text-center text-xs text-white/40 mt-3">
          Tap tiles adjacent to the empty space to slide them into place.
        </p>
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
