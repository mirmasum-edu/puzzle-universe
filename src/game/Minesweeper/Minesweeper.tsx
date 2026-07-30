"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useSubmitScore } from "@/lib/useSubmitScore";
import GameOverlay from "@/components/GameOverlay";

type Cell = {
  r: number;
  c: number;
  isMine: boolean;
  neighborMines: number;
  isRevealed: boolean;
  isFlagged: boolean;
};

type Difficulty = "easy" | "medium" | "hard";

const CONFIGS = {
  easy: { rows: 8, cols: 8, mines: 10, baseScore: 1000 },
  medium: { rows: 10, cols: 10, mines: 20, baseScore: 2500 },
  hard: { rows: 12, cols: 12, mines: 35, baseScore: 5000 },
};

function createEmptyGrid(rows: number, cols: number): Cell[][] {
  const grid: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        r,
        c,
        isMine: false,
        neighborMines: 0,
        isRevealed: false,
        isFlagged: false,
      });
    }
    grid.push(row);
  }
  return grid;
}

// Generate mines after first safe click - moved outside component to satisfy react-hooks/purity
function generateMines(
  currentGrid: Cell[][],
  startR: number,
  startC: number,
  rows: number,
  cols: number,
  mines: number
): Cell[][] {
  const newGrid = currentGrid.map((row) => row.map((cell) => ({ ...cell })));

  // Create list of possible locations excluding starting cell
  const candidates: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === startR && c === startC) continue;
      candidates.push([r, c]);
    }
  }

  // Shuffle and pick mine locations
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const mineLocations = candidates.slice(0, mines);
  mineLocations.forEach(([r, c]) => {
    newGrid[r][c].isMine = true;
  });

  // Calculate neighbors
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newGrid[r][c].isMine) continue;
      let neighbors = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            if (newGrid[nr][nc].isMine) neighbors++;
          }
        }
      }
      newGrid[r][c].neighborMines = neighbors;
    }
  }

  return newGrid;
}

// Reveal empty cells using BFS/DFS - moved outside component
function floodFillReveal(
  currentGrid: Cell[][],
  startR: number,
  startC: number,
  rows: number,
  cols: number
): Cell[][] {
  const newGrid = currentGrid.map((row) => row.map((cell) => ({ ...cell })));
  const queue: [number, number][] = [[startR, startC]];
  const visited = new Set<string>();
  visited.add(`${startR}-${startC}`);

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    newGrid[r][c].isRevealed = true;
    newGrid[r][c].isFlagged = false; // Auto-clear flags on reveal

    if (newGrid[r][c].neighborMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            const key = `${nr}-${nc}`;
            if (!visited.has(key) && !newGrid[nr][nc].isRevealed && !newGrid[nr][nc].isMine) {
              visited.add(key);
              queue.push([nr, nc]);
            }
          }
        }
      }
    }
  }
  return newGrid;
}

// Check if victory criteria met - moved outside component
function checkVictory(currentGrid: Cell[][]): boolean {
  let unrevealedSafeCount = 0;
  currentGrid.forEach((row) =>
    row.forEach((cell) => {
      if (!cell.isMine && !cell.isRevealed) {
        unrevealedSafeCount++;
      }
    })
  );
  return unrevealedSafeCount === 0;
}

export default function Minesweeper() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const { rows, cols, mines, baseScore } = CONFIGS[difficulty];

  const [grid, setGrid] = useState<Cell[][]>(() => createEmptyGrid(8, 8));
  const [status, setStatus] = useState<"idle" | "playing" | "won" | "lost">("idle");
  const [seconds, setSeconds] = useState(0);
  const [flagMode, setFlagMode] = useState(false); // Mobile-friendly toggle

  const { submit, submitting, saved, reset } = useSubmitScore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  }, [stopTimer]);

  const initGame = useCallback(
    (diff: Difficulty = difficulty) => {
      stopTimer();
      setDifficulty(diff);
      const conf = CONFIGS[diff];
      setGrid(createEmptyGrid(conf.rows, conf.cols));
      setStatus("idle");
      setSeconds(0);
      setFlagMode(false);
      reset();
    },
    [difficulty, stopTimer, reset]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initGame("easy");
    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate remaining flags count vs total mines
  const flaggedCount = useMemo(() => {
    let count = 0;
    grid.forEach((row) =>
      row.forEach((cell) => {
        if (cell.isFlagged) count++;
      })
    );
    return count;
  }, [grid]);

  // Click handler
  const handleCellClick = (r: number, c: number) => {
    if (status === "won" || status === "lost") return;

    let currentGrid = grid;

    // First safe click logic
    if (status === "idle") {
      currentGrid = generateMines(grid, r, c, rows, cols, mines);
      setStatus("playing");
      startTimer();
    }

    const cell = currentGrid[r][c];
    if (cell.isRevealed) return;

    if (flagMode) {
      // Toggle flag mode click
      handleCellRightClick(null, r, c);
      return;
    }

    if (cell.isFlagged) return;

    if (cell.isMine) {
      // Lose
      stopTimer();
      setStatus("lost");
      const revealedGrid = currentGrid.map((row) =>
        row.map((cl) => {
          if (cl.isMine) return { ...cl, isRevealed: true };
          return cl;
        })
      );
      setGrid(revealedGrid);
      return;
    }

    // Reveal and fill
    let nextGrid = floodFillReveal(currentGrid, r, c, rows, cols);

    if (checkVictory(nextGrid)) {
      stopTimer();
      setStatus("won");
      // Flag all remaining mines
      nextGrid = nextGrid.map((row) =>
        row.map((cl) => (cl.isMine ? { ...cl, isFlagged: true } : cl))
      );
      setGrid(nextGrid);
      // Calculate score and submit
      const scoreValue = Math.max(100, baseScore - seconds * 3);
      submit({ score: scoreValue, combo: 0, mode: "minesweeper" });
    } else {
      setGrid(nextGrid);
    }
  };

  // Flag handler
  const handleCellRightClick = (e: React.MouseEvent | null, r: number, c: number) => {
    if (e) e.preventDefault();
    if (status === "won" || status === "lost") return;

    const nextGrid = grid.map((row) =>
      row.map((cell) => {
        if (cell.r === r && cell.c === c && !cell.isRevealed) {
          return { ...cell, isFlagged: !cell.isFlagged };
        }
        return cell;
      })
    );
    setGrid(nextGrid);
  };

  const scoreValue = useMemo(() => {
    return Math.max(100, baseScore - seconds * 3);
  }, [baseScore, seconds]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="space-y-5">
      {/* Difficulties selection */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CONFIGS) as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => initGame(d)}
            className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition ${
              difficulty === d ? "bg-violet-500 text-white" : "bg-white/5 hover:bg-white/10 text-white/70"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Main Board Box */}
      <div className="glass rounded-2xl p-4 sm:p-6 max-w-[560px] mx-auto">
        <div className="flex items-center gap-3 mb-4 text-sm justify-between">
          <Stat icon="⏱️" label="Time" value={`${mm}:${ss}`} />
          <Stat icon="💣" label="Mines Left" value={Math.max(0, mines - flaggedCount)} />
          
          <button
            onClick={() => setFlagMode((prev) => !prev)}
            className={`rounded-xl px-3 py-2 text-sm font-medium border flex items-center gap-1.5 transition ${
              flagMode
                ? "bg-rose-500/35 border-rose-400 text-white"
                : "bg-white/10 border-white/5 hover:bg-white/15 text-white/80"
            }`}
          >
            🚩 Flag mode {flagMode ? "ON" : "OFF"}
          </button>

          <button
            onClick={() => initGame()}
            className="rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-sm font-medium"
          >
            ↻ New
          </button>
        </div>

        <div className="relative">
          <div
            className="grid gap-1 mx-auto aspect-square rounded-lg overflow-hidden border-2 border-white/10 p-1 bg-black/10"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            }}
          >
            {grid.flat().map((cell) => {
              const { r, c, isMine, neighborMines, isRevealed, isFlagged } = cell;

              let cellStyle: React.CSSProperties = {
                background: isRevealed
                  ? isMine
                    ? "rgba(239, 68, 68, 0.4)" // Red for mine
                    : "rgba(255, 255, 255, 0.08)" // Revealed empty
                  : "rgba(255, 255, 255, 0.03)", // Hidden
              };

              let content = "";
              let numColor = "#fff";

              if (isRevealed) {
                if (isMine) {
                  content = "💣";
                } else if (neighborMines > 0) {
                  content = String(neighborMines);
                  // Standard Minesweeper colors
                  const colors = [
                    "",
                    "#60a5fa", // 1 - Light Blue
                    "#34d399", // 2 - Green
                    "#f87171", // 3 - Red
                    "#c084fc", // 4 - Purple
                    "#fbbf24", // 5 - Yellow
                    "#22d3ee", // 6 - Teal
                    "#ec4899", // 7 - Magenta
                    "#a7f3d0", // 8 - Mint
                  ];
                  numColor = colors[neighborMines] || "#fff";
                }
              } else if (isFlagged) {
                content = "🚩";
              }

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  onContextMenu={(e) => handleCellRightClick(e, r, c)}
                  className={`aspect-square flex items-center justify-center font-bold text-xs sm:text-base border border-white/5 rounded-md transition duration-150 ${
                    !isRevealed ? "hover:bg-white/10" : ""
                  }`}
                  style={cellStyle}
                >
                  <span style={{ color: numColor }}>{content}</span>
                </button>
              );
            })}
          </div>

          <GameOverlay
            show={status === "won"}
            won
            title="Victory!"
            score={scoreValue}
            subtitle={`${mm}:${ss} · difficulty: ${difficulty}`}
            saving={submitting}
            saved={saved}
            onRestart={() => initGame()}
          />

          <GameOverlay
            show={status === "lost"}
            title="Blew Up! 💥"
            score={0}
            subtitle="Hit a mine. Try again!"
            onRestart={() => initGame()}
          />
        </div>

        <p className="text-center text-xs text-white/40 mt-4">
          Click cell to reveal · Right-click (or toggle Flag Mode) to plant 🚩
        </p>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white/5 px-3 py-1.5 flex flex-col justify-center">
      <div className="text-[10px] text-white/50 leading-none mb-1">
        {icon} {label}
      </div>
      <div className="text-sm font-bold leading-none">{value}</div>
    </div>
  );
}
