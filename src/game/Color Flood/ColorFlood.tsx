"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSubmitScore } from "@/lib/useSubmitScore";
import GameOverlay from "@/components/GameOverlay";

const COLORS = ["#8b5cf6", "#06b6d4", "#ec4899", "#f59e0b", "#10b981", "#ef4444"];
const SIZE = 14;

function randomBoard(): number[] {
  return Array.from({ length: SIZE * SIZE }, () => Math.floor(Math.random() * COLORS.length));
}

function maxMoves(): number {
  return 25;
}

export default function ColorFlood() {
  const [board, setBoard] = useState<number[]>(randomBoard);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const { submit, submitting, saved, reset } = useSubmitScore();
  const submittedRef = useRef(false);
  const limit = maxMoves();

  const newGame = useCallback(() => {
    setBoard(randomBoard());
    setMoves(0);
    setWon(false);
    setLost(false);
    submittedRef.current = false;
    reset();
  }, [reset]);

  const flood = useCallback(
    (newColor: number) => {
      if (won || lost) return;
      const startColor = board[0];
      if (startColor === newColor) return;

      const next = board.slice();
      const stack = [0];
      const visited = new Set<number>();
      while (stack.length) {
        const idx = stack.pop()!;
        if (visited.has(idx)) continue;
        visited.add(idx);
        if (next[idx] !== startColor) continue;
        next[idx] = newColor;
        const r = Math.floor(idx / SIZE);
        const c = idx % SIZE;
        if (r > 0) stack.push(idx - SIZE);
        if (r < SIZE - 1) stack.push(idx + SIZE);
        if (c > 0) stack.push(idx - 1);
        if (c < SIZE - 1) stack.push(idx + 1);
      }

      const newMoves = moves + 1;
      setBoard(next);
      setMoves(newMoves);

      const allSame = next.every((c) => c === next[0]);
      if (allSame) {
        setWon(true);
      } else if (newMoves >= limit) {
        setLost(true);
      }
    },
    [board, moves, won, lost, limit]
  );

  const filledPct = Math.round(
    (board.filter((c) => c === board[0]).length / board.length) * 100
  );

  const score = Math.max(100, (limit - moves) * 120 + (won ? 500 : 0));

  useEffect(() => {
    if ((won || lost) && !submittedRef.current) {
      submittedRef.current = true;
      const s = won ? Math.max(100, (limit - moves) * 120 + 500) : Math.max(50, filledPct * 3);
      submit({ score: s, combo: 0, mode: "flood" });
    }
  }, [won, lost, moves, limit, filledPct, submit]);

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-4 sm:p-6 max-w-[520px] mx-auto">
        <div className="flex gap-3 mb-4 text-sm flex-wrap">
          <Stat icon="👣" label="Moves" value={`${moves}/${limit}`} />
          <Stat icon="🎨" label="Filled" value={`${filledPct}%`} />
          <button
            onClick={newGame}
            className="ml-auto rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-sm font-medium"
          >
            ↻ New Game
          </button>
        </div>

        <div className="relative">
          <div
            className="grid mx-auto rounded-lg overflow-hidden"
            style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0,1fr))` }}
          >
            {board.map((c, i) => (
              <div key={i} className="aspect-square" style={{ background: COLORS[c] }} />
            ))}
          </div>

          <GameOverlay
            show={won}
            won
            title="Board Conquered!"
            score={score}
            subtitle={`Solved in ${moves} moves`}
            saving={submitting}
            saved={saved}
            onRestart={newGame}
          />
          <GameOverlay
            show={lost}
            title="Out of Moves"
            score={Math.max(50, filledPct * 3)}
            subtitle={`${filledPct}% filled`}
            saving={submitting}
            saved={saved}
            onRestart={newGame}
          />
        </div>

        <div className="mt-5 flex justify-center gap-2 flex-wrap">
          {COLORS.map((c, i) => (
            <button
              key={i}
              onClick={() => flood(i)}
              className="w-11 h-11 rounded-full transition hover:scale-110 ring-2 ring-white/10"
              style={{ background: c }}
              aria-label={`Flood color ${i + 1}`}
            />
          ))}
        </div>
        <p className="text-center text-xs text-white/40 mt-3">
          Pick a color to flood from the top-left. Fill the whole board within {limit} moves!
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
