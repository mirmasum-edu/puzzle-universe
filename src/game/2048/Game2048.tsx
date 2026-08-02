"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSubmitScore } from "@/lib/useSubmitScore";
import GameOverlay from "@/components/GameOverlay";

const SIZE = 4;
type Grid = number[][];

const COLORS: Record<number, string> = {
  0: "rgba(255,255,255,0.05)",
  2: "#4c3f6b",
  4: "#5b4b86",
  8: "#7c5cbf",
  16: "#8b5cf6",
  32: "#a855f7",
  64: "#c026d3",
  128: "#db2777",
  256: "#e11d48",
  512: "#f59e0b",
  1024: "#f97316",
  2048: "#10b981",
};

function emptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0));
}

function addRandom(grid: Grid): Grid {
  const empties: [number, number][] = [];
  grid.forEach((row, r) => row.forEach((v, c) => v === 0 && empties.push([r, c])));
  if (empties.length === 0) return grid;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  const g = grid.map((row) => row.slice());
  g[r][c] = Math.random() < 0.9 ? 2 : 4;
  return g;
}

function initGrid(): Grid {
  return addRandom(addRandom(emptyGrid()));
}

// slide + merge one row to the left, returns [newRow, gainedScore]
function slideRow(row: number[]): [number[], number] {
  const nums = row.filter((n) => n !== 0);
  const merged: number[] = [];
  let gained = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i + 1 < nums.length && nums[i] === nums[i + 1]) {
      const val = nums[i] * 2;
      merged.push(val);
      gained += val;
      i++;
    } else {
      merged.push(nums[i]);
    }
  }
  while (merged.length < SIZE) merged.push(0);
  return [merged, gained];
}

function rotateCW(g: Grid): Grid {
  const n = emptyGrid();
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) n[c][SIZE - 1 - r] = g[r][c];
  return n;
}
function rotateCCW(g: Grid): Grid {
  const n = emptyGrid();
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) n[SIZE - 1 - c][r] = g[r][c];
  return n;
}

function move(grid: Grid, dir: "left" | "right" | "up" | "down"): [Grid, number, boolean] {
  let g = grid.map((row) => row.slice());
  if (dir === "up") g = rotateCCW(g);
  if (dir === "down") g = rotateCW(g);
  if (dir === "right") g = g.map((row) => row.slice().reverse());

  let gained = 0;
  const moved = g.map((row) => {
    const [nr, gain] = slideRow(row);
    gained += gain;
    return nr;
  });

  let result = moved;
  if (dir === "right") result = moved.map((row) => row.slice().reverse());
  if (dir === "up") result = rotateCW(moved);
  if (dir === "down") result = rotateCCW(moved);

  const changed = JSON.stringify(result) !== JSON.stringify(grid);
  return [result, gained, changed];
}

function canMove(grid: Grid): boolean {
  for (const d of ["left", "right", "up", "down"] as const) {
    const [, , changed] = move(grid, d);
    if (changed) return true;
  }
  return false;
}

export default function Game2048() {
  const [grid, setGrid] = useState<Grid>(initGrid);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [keepGoing, setKeepGoing] = useState(false);
  const { submit, submitting, saved, reset } = useSubmitScore();
  const submittedRef = useRef(false);

  const newGame = useCallback(() => {
    setGrid(initGrid());
    setScore(0);
    setGameOver(false);
    setWon(false);
    setKeepGoing(false);
    submittedRef.current = false;
    reset();
  }, [reset]);

  const doMove = useCallback(
    (dir: "left" | "right" | "up" | "down") => {
      if (gameOver) return;
      setGrid((cur) => {
        const [next, gained, changed] = move(cur, dir);
        if (!changed) return cur;
        const withNew = addRandom(next);
        setScore((s) => {
          const ns = s + gained;
          setBest((b) => Math.max(b, ns));
          return ns;
        });
        if (!won && !keepGoing && withNew.some((row) => row.includes(2048))) {
          setWon(true);
        }
        if (!canMove(withNew)) {
          setGameOver(true);
        }
        return withNew;
      });
    },
    [gameOver, won, keepGoing]
  );

  // submit score when game ends
  useEffect(() => {
    if (gameOver && !submittedRef.current) {
      submittedRef.current = true;
      submit({ score, combo: 0, mode: "2048" });
    }
  }, [gameOver, score, submit]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, "left" | "right" | "up" | "down"> = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
        a: "left",
        d: "right",
        w: "up",
        s: "down",
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        doMove(dir);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doMove]);

  // touch swipe
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? "right" : "left");
    else doMove(dy > 0 ? "down" : "up");
    touchStart.current = null;
  }

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-4 sm:p-6 max-w-[520px] mx-auto">
        <div className="flex gap-3 mb-4 text-sm">
          <Stat icon="⭐" label="Score" value={score} />
          <Stat icon="🏅" label="Best" value={best} />
          <button
            onClick={newGame}
            className="ml-auto rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-sm font-medium"
          >
            ↻ New Game
          </button>
        </div>

        <div className="relative">
          <div
            className="grid gap-2 sm:gap-3 rounded-xl p-2 sm:p-3 bg-white/[0.03] touch-none select-none"
            style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0,1fr))` }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {grid.flat().map((v, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg flex items-center justify-center font-bold transition-all"
                style={{
                  background: COLORS[v] ?? "#059669",
                  fontSize: v >= 1024 ? "1.1rem" : v >= 128 ? "1.4rem" : "1.7rem",
                  color: v === 0 ? "transparent" : "#fff",
                }}
              >
                {v || ""}
              </div>
            ))}
          </div>

          <GameOverlay
            show={gameOver}
            score={score}
            subtitle="No more moves"
            saving={submitting}
            saved={saved}
            onRestart={newGame}
          />

          {won && !keepGoing && !gameOver && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/75 backdrop-blur-sm animate-fade-up">
              <div className="text-center">
                <div className="text-5xl mb-2">🎉</div>
                <h3 className="text-2xl font-bold">You reached 2048!</h3>
                <div className="flex gap-3 mt-4 justify-center">
                  <button
                    onClick={() => setKeepGoing(true)}
                    className="rounded-xl bg-white/10 px-5 py-2.5 font-semibold"
                  >
                    Keep Going
                  </button>
                  <button
                    onClick={newGame}
                    className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 font-semibold"
                  >
                    New Game
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile arrow controls */}
        <div className="mt-5 grid grid-cols-3 gap-2 max-w-[220px] mx-auto sm:hidden">
          <div />
          <Ctrl label="↑" onClick={() => doMove("up")} />
          <div />
          <Ctrl label="←" onClick={() => doMove("left")} />
          <Ctrl label="↓" onClick={() => doMove("down")} />
          <Ctrl label="→" onClick={() => doMove("right")} />
        </div>
        <p className="text-center text-xs text-white/40 mt-3 hidden sm:block">
          Use arrow keys or WASD · swipe on mobile
        </p>
      </div>
    </div>
  );
}

function Ctrl({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl bg-white/10 hover:bg-white/20 py-3 text-xl font-bold"
    >
      {label}
    </button>
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
