"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useSubmitScore } from "@/lib/useSubmitScore";
import GameOverlay from "@/components/GameOverlay";

type Difficulty = "easy" | "medium" | "hard";

type LevelDef = {
  size: number;
  name: string;
  baseScore: number;
  grid: number[][]; // binary pixel art representation (1 = filled, 0 = empty)
};

const LEVELS: Record<Difficulty, LevelDef> = {
  easy: {
    size: 5,
    name: "Pixel Heart ❤️",
    baseScore: 1000,
    grid: [
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ],
  },
  medium: {
    size: 8,
    name: "Space Invader 👾",
    baseScore: 2500,
    grid: [
      [0, 0, 1, 0, 0, 1, 0, 0],
      [0, 1, 0, 1, 1, 0, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 1, 1, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 0, 0, 0, 0, 1, 0],
      [1, 0, 0, 0, 0, 0, 0, 1],
    ],
  },
  hard: {
    size: 10,
    name: "Royal Crown 👑",
    baseScore: 5000,
    grid: [
      [0, 1, 0, 0, 1, 1, 0, 0, 1, 0],
      [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
  },
};

// Pure algorithmic function: compiles consecutive runs of filled (1) cells
// Moved outside component body to satisfy strict React 19 rules (react-hooks/purity)
function computeLineClues(line: number[]): number[] {
  const clues: number[] = [];
  let currentRun = 0;

  for (let i = 0; i < line.length; i++) {
    if (line[i] === 1) {
      currentRun++;
    } else if (currentRun > 0) {
      clues.push(currentRun);
      currentRun = 0;
    }
  }
  if (currentRun > 0) {
    clues.push(currentRun);
  }
  return clues.length === 0 ? [0] : clues;
}

export default function Nonogram() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const { size, name, baseScore, grid: targetGrid } = LEVELS[difficulty];

  // playerGrid: size*size flat array. 0 = empty, 1 = filled, 2 = crossed (X)
  const [playerGrid, setPlayerGrid] = useState<number[]>([]);
  const [toolMode, setToolMode] = useState<"fill" | "cross">("fill"); // Toggle between Fill or 'X' marker

  const [status, setStatus] = useState<"playing" | "won">("playing");
  const [mistakes, setMistakes] = useState(0);
  const [seconds, setSeconds] = useState(0);

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
      const conf = LEVELS[diff];
      setPlayerGrid(Array(conf.size * conf.size).fill(0));
      setToolMode("fill");
      setStatus("playing");
      setMistakes(0);
      setSeconds(0);
      reset();
      startTimer();
    },
    [difficulty, stopTimer, startTimer, reset]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initGame("easy");
    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compiled Row and Column Clues (runs of 1s)
  const rowClues = useMemo(() => {
    return targetGrid.map((row) => computeLineClues(row));
  }, [targetGrid]);

  const colClues = useMemo(() => {
    const cols: number[][] = [];
    for (let c = 0; c < size; c++) {
      const colLine: number[] = [];
      for (let r = 0; r < size; r++) {
        colLine.push(targetGrid[r][c]);
      }
      cols.push(computeLineClues(colLine));
    }
    return cols;
  }, [targetGrid, size]);

  // Handle cell click (supporting fill or crossing)
  const handleCellClick = (r: number, c: number) => {
    if (status === "won") return;

    const idx = r * size + c;
    const targetCellState = targetGrid[r][c]; // 1 = should fill, 0 = empty
    const currentCellState = playerGrid[idx]; // 0 = empty, 1 = filled, 2 = cross

    const nextGrid = [...playerGrid];

    if (toolMode === "fill") {
      if (currentCellState === 1) {
        // Toggle off
        nextGrid[idx] = 0;
      } else {
        // Toggle on
        nextGrid[idx] = 1;
        // Check if filling an incorrect cell (mistake)
        if (targetCellState === 0) {
          setMistakes((prev) => prev + 1);
        }
      }
    } else {
      // Cross mode
      if (currentCellState === 2) {
        // Toggle off
        nextGrid[idx] = 0;
      } else {
        // Toggle on
        nextGrid[idx] = 2;
        // Check if crossing a correct cell (mistake)
        if (targetCellState === 1) {
          setMistakes((prev) => prev + 1);
        }
      }
    }

    setPlayerGrid(nextGrid);

    // Verify victory: All cells in players grid must match target grid perfectly (ignoring crosses/empty discrepancy)
    const solved = nextGrid.every((state, i) => {
      const targetState = targetGrid[Math.floor(i / size)][i % size];
      const playerFilled = state === 1;
      const targetFilled = targetState === 1;
      return playerFilled === targetFilled;
    });

    if (solved) {
      stopTimer();
      setStatus("won");
      // Score formula: Base - mistakes penalty - time decay
      const calculatedScore = Math.max(
        100,
        baseScore - mistakes * 150 - seconds * 2
      );
      submit({ score: calculatedScore, combo: 0, mode: "nonogram" });
    }
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const scoreValue = useMemo(() => {
    return Math.max(100, baseScore - mistakes * 150 - seconds * 2);
  }, [baseScore, mistakes, seconds]);

  // Max clue lengths (useful for layout grids alignment)
  const maxRowClueLength = useMemo(() => {
    return Math.max(...rowClues.map((c) => c.length));
  }, [rowClues]);

  const maxColClueLength = useMemo(() => {
    return Math.max(...colClues.map((c) => c.length));
  }, [colClues]);

  return (
    <div className="space-y-5">
      {/* Difficulties selection */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(LEVELS) as Difficulty[]).map((d) => (
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
      <div className="glass rounded-2xl p-4 sm:p-6 max-w-[620px] mx-auto flex flex-col select-none">
        {/* HUD */}
        <div className="flex justify-between items-center mb-4 text-sm gap-2">
          <Stat icon="⏱️" label="Time" value={`${mm}:${ss}`} />
          <Stat icon="❌" label="Mistakes" value={mistakes} />

          {/* Tool Mode toggle */}
          <div className="flex rounded-xl bg-white/5 p-1 gap-1">
            <button
              onClick={() => setToolMode("fill")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1 transition ${
                toolMode === "fill" ? "bg-violet-500 text-white shadow" : "text-white/60 hover:text-white"
              }`}
            >
              ⬛ Fill
            </button>
            <button
              onClick={() => setToolMode("cross")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1 transition ${
                toolMode === "cross" ? "bg-rose-500/75 text-white shadow" : "text-white/60 hover:text-white"
              }`}
            >
              ❌ Cross
            </button>
          </div>

          <button
            onClick={() => initGame()}
            className="rounded-xl bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-semibold"
          >
            ↻ Reset
          </button>
        </div>

        {/* Dynamic Clues & Grid alignment */}
        <div className="flex flex-col items-center overflow-x-auto py-4">
          <div className="flex flex-col">
            {/* Top Column Clues rows */}
            <div className="flex">
              {/* Spacer matching left clues block */}
              <div
                style={{
                  width: `${maxRowClueLength * 28}px`,
                }}
                className="flex-shrink-0"
              />
              {/* Column Clues */}
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${size}, 32px)`,
                }}
              >
                {colClues.map((clue, colIdx) => (
                  <div
                    key={colIdx}
                    style={{
                      height: `${maxColClueLength * 22}px`,
                    }}
                    className="flex flex-col justify-end items-center gap-0.5 pb-2 text-[10px] font-black text-white/50 border-r border-white/[0.03] last:border-0"
                  >
                    {clue.map((num, i) => (
                      <span key={i}>{num}</span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Row clues + Grid Row block */}
            <div className="flex">
              {/* Left Row Clues */}
              <div
                style={{
                  width: `${maxRowClueLength * 28}px`,
                }}
                className="flex flex-col justify-between pr-2.5 flex-shrink-0"
              >
                {rowClues.map((clue, rowIdx) => (
                  <div
                    key={rowIdx}
                    className="h-8 flex items-center justify-end gap-1.5 text-[10px] font-black text-white/50"
                  >
                    {clue.map((num, i) => (
                      <span key={i}>{num}</span>
                    ))}
                  </div>
                ))}
              </div>

              {/* Main Matrix Grid */}
              <div
                className="grid gap-0.5 bg-white/5 p-1.5 rounded-xl border border-white/10 relative"
                style={{
                  gridTemplateColumns: `repeat(${size}, 32px)`,
                  gridTemplateRows: `repeat(${size}, 32px)`,
                }}
              >
                {playerGrid.map((state, idx) => {
                  const r = Math.floor(idx / size);
                  const c = idx % size;

                  let cellStyle: React.CSSProperties = {
                    background: "rgba(255,255,255,0.02)",
                  };

                  if (state === 1) {
                    cellStyle.background = "linear-gradient(135deg, #a78bfa, #f472b6)"; // Glistening purple/pink jewel
                    cellStyle.boxShadow = "inset 0 0 6px rgba(0,0,0,0.3)";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleCellClick(r, c)}
                      style={cellStyle}
                      className="w-8 h-8 rounded-md flex items-center justify-center border border-white/[0.03] hover:bg-white/[0.08] transition duration-150 relative"
                    >
                      {/* Grid segment line accents (classic Picross 5x5 sub-grid markings) */}
                      {(r + 1) % 5 === 0 && r !== size - 1 && (
                        <div className="absolute bottom-[-1.5px] left-0 right-0 h-[2px] bg-white/15 z-10 pointer-events-none" />
                      )}
                      {(c + 1) % 5 === 0 && c !== size - 1 && (
                        <div className="absolute right-[-1.5px] top-0 bottom-0 w-[2px] bg-white/15 z-10 pointer-events-none" />
                      )}

                      {/* Crossed marker icon */}
                      {state === 2 && (
                        <span className="text-rose-400 font-extrabold text-sm opacity-80 leading-none select-none">
                          ✕
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Overlays */}
        <div className="relative">
          <GameOverlay
            show={status === "won"}
            won
            title={`${name} Revealed! 🎉`}
            score={scoreValue}
            subtitle={`Completed with ${mistakes} mistakes · Time: ${mm}:${ss}`}
            saving={submitting}
            saved={saved}
            onRestart={() => initGame()}
          />
        </div>

        <p className="text-center text-xs text-white/40 mt-4 leading-relaxed">
          Toggle **Fill** to colour cells or **Cross** to place ✕ markers. <br />
          Fill consecutive boxes matching the Row & Column clues to reveal the hidden pixel art!
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
