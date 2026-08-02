"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useSubmitScore } from "@/lib/useSubmitScore";
import GameOverlay from "@/components/GameOverlay";

type Difficulty = "easy" | "medium" | "hard";

type Dot = {
  r: number;
  c: number;
  color: string;
};

type LevelDef = {
  size: number;
  dots: Dot[];
  baseScore: number;
};

const LEVELS: Record<Difficulty, LevelDef> = {
  easy: {
    size: 5,
    baseScore: 1000,
    dots: [
      { r: 0, c: 0, color: "#ef4444" }, // Red
      { r: 4, c: 4, color: "#ef4444" },
      { r: 0, c: 4, color: "#3b82f6" }, // Blue
      { r: 4, c: 0, color: "#3b82f6" },
      { r: 1, c: 1, color: "#10b981" }, // Green
      { r: 3, c: 3, color: "#10b981" },
      { r: 1, c: 2, color: "#eab308" }, // Yellow
      { r: 2, c: 3, color: "#eab308" },
    ],
  },
  medium: {
    size: 6,
    baseScore: 2500,
    dots: [
      { r: 0, c: 0, color: "#ef4444" }, // Red
      { r: 2, c: 2, color: "#ef4444" },
      { r: 0, c: 5, color: "#3b82f6" }, // Blue
      { r: 5, c: 0, color: "#3b82f6" },
      { r: 1, c: 1, color: "#10b981" }, // Green
      { r: 4, c: 4, color: "#10b981" },
      { r: 3, c: 0, color: "#eab308" }, // Yellow
      { r: 5, c: 3, color: "#eab308" },
      { r: 2, c: 5, color: "#a855f7" }, // Purple
      { r: 5, c: 5, color: "#a855f7" },
    ],
  },
  hard: {
    size: 7,
    baseScore: 5000,
    dots: [
      { r: 0, c: 0, color: "#ef4444" }, // Red
      { r: 6, c: 6, color: "#ef4444" },
      { r: 0, c: 6, color: "#3b82f6" }, // Blue
      { r: 6, c: 0, color: "#3b82f6" },
      { r: 1, c: 1, color: "#10b981" }, // Green
      { r: 5, c: 5, color: "#10b981" },
      { r: 2, c: 2, color: "#eab308" }, // Yellow
      { r: 4, c: 4, color: "#eab308" },
      { r: 1, c: 3, color: "#a855f7" }, // Purple
      { r: 5, c: 3, color: "#a855f7" },
      { r: 3, c: 1, color: "#06b6d4" }, // Cyan
      { r: 3, c: 5, color: "#06b6d4" },
    ],
  },
};

export default function FlowLink() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const { size, dots, baseScore } = LEVELS[difficulty];

  // paths: color -> array of grid coordinates [[r, c], [r, c], ...]
  const [paths, setPaths] = useState<Record<string, [number, number][]>>({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeColor, setActiveColor] = useState<string | null>(null);

  const [status, setStatus] = useState<"playing" | "won">("playing");
  const [connections, setConnections] = useState<number>(0);
  const [seconds, setSeconds] = useState(0);

  const { submit, submitting, saved, reset } = useSubmitScore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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
      setPaths({});
      setIsDrawing(false);
      setActiveColor(null);
      setStatus("playing");
      setConnections(0);
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

  // Helper: maps grid coordinate to active color string
  const getCellColor = useCallback(
    (r: number, c: number) => {
      for (const [color, path] of Object.entries(paths)) {
        if (path.some(([pr, pc]) => pr === r && pc === c)) {
          return color;
        }
      }
      return null;
    },
    [paths]
  );

  // Helper: check if a coordinate matches any dot
  const getDotAt = useCallback(
    (r: number, c: number) => {
      return dots.find((d) => d.r === r && d.c === c) || null;
    },
    [dots]
  );

  // Handle click / drag start
  const handleStartDraw = (r: number, c: number) => {
    if (status === "won") return;

    const cellDot = getDotAt(r, c);
    const existingColor = getCellColor(r, c);

    if (cellDot) {
      // Start drawing from a dot
      setIsDrawing(true);
      setActiveColor(cellDot.color);
      setPaths((prev) => ({
        ...prev,
        [cellDot.color]: [[r, c]],
      }));
    } else if (existingColor) {
      // Truncate path if clicking on an existing line
      setIsDrawing(true);
      setActiveColor(existingColor);
      setPaths((prev) => {
        const path = prev[existingColor] || [];
        const idx = path.findIndex(([pr, pc]) => pr === r && pc === c);
        return {
          ...prev,
          [existingColor]: path.slice(0, idx + 1),
        };
      });
    }
  };

  // Handle hover / dragging move
  const handleMouseEnterCell = (r: number, c: number) => {
    if (!isDrawing || !activeColor || status === "won") return;

    const currentPath = paths[activeColor] || [];
    if (currentPath.length === 0) return;

    const [lastR, lastC] = currentPath[currentPath.length - 1];

    // Ensure cell is adjacent to the last path node (no diagonal draws)
    const isAdjacent = Math.abs(r - lastR) + Math.abs(c - lastC) === 1;
    if (!isAdjacent) return;

    // 1. Backtracking check (shorten path if moving backwards)
    if (currentPath.length > 1) {
      const [secondLastR, secondLastC] = currentPath[currentPath.length - 2];
      if (secondLastR === r && secondLastC === c) {
        setPaths((prev) => ({
          ...prev,
          [activeColor]: currentPath.slice(0, -1),
        }));
        return;
      }
    }

    // Check if hovered cell is a dot
    const targetDot = getDotAt(r, c);
    if (targetDot) {
      if (targetDot.color !== activeColor) return; // Cannot connect to a different color dot

      // Complete path connection if connecting matching end dot
      const isStartDot = currentPath[0][0] === r && currentPath[0][1] === c;
      if (!isStartDot) {
        setPaths((prev) => ({
          ...prev,
          [activeColor]: [...currentPath, [r, c]],
        }));
        setIsDrawing(false);
        setActiveColor(null);
        return;
      }
      return;
    }

    // 2. Intersecting with other colored paths (Break other path if drawn over)
    const occupantColor = getCellColor(r, c);
    if (occupantColor && occupantColor !== activeColor) {
      // Break the other path entirely
      setPaths((prev) => ({
        ...prev,
        [occupantColor]: [],
      }));
    }

    // Prevent loop overlays on own path
    const isAlreadyOnPath = currentPath.some(([pr, pc]) => pr === r && pc === c);
    if (isAlreadyOnPath) return;

    // Append cell to path
    setPaths((prev) => ({
      ...prev,
      [activeColor]: [...currentPath, [r, c]],
    }));
  };

  const handleStopDraw = () => {
    setIsDrawing(false);
    setActiveColor(null);
  };

  // Double Check victory conditions
  useEffect(() => {
    if (status === "won" || Object.keys(paths).length === 0) return;

    const totalColors = dots.length / 2;
    let connectedCount = 0;
    let totalCoveredCells = 0;

    for (const [color, path] of Object.entries(paths)) {
      if (path.length < 2) continue;

      // Verify path starts and ends on matching dots
      const [startR, startC] = path[0];
      const [endR, endC] = path[path.length - 1];
      const startDot = getDotAt(startR, startC);
      const endDot = getDotAt(endR, endC);

      if (startDot && endDot && startDot.color === color && endDot.color === color && (startR !== endR || startC !== endC)) {
        connectedCount++;
      }

      totalCoveredCells += path.length;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConnections(connectedCount);

    // Flow Free Winning Criteria: All color paths connected AND 100% of the grid cells are filled!
    if (connectedCount === totalColors && totalCoveredCells === size * size) {
      stopTimer();
      setStatus("won");
      const calculatedScore = Math.max(100, baseScore - seconds * 3);
      submit({ score: calculatedScore, combo: 0, mode: "flow-link" });
    }
  }, [paths, dots, size, status, seconds, baseScore, stopTimer, submit, getDotAt]);

  // SVG lines renderer: Draws scale-independent pipelines using a 100x100 coordinate grid
  // Fully decoupled from physical DOM refs to be render-pure and bypass any React 19 linter ref warnings
  const svgLines = useMemo(() => {
    const cellSize = 100 / size;

    return Object.entries(paths).map(([color, path]) => {
      if (path.length === 0) return null;

      // Draw SVG polyline points centered in matching cells (on 100x100 grid scale)
      const points = path
        .map(([r, c]) => {
          const x = c * cellSize + cellSize / 2;
          const y = r * cellSize + cellSize / 2;
          return `${x},${y}`;
        })
        .join(" ");

      return (
        <polyline
          key={color}
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={cellSize * 0.35} // Perfect thick proportions
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-75"
          style={{
            filter: `drop-shadow(0 0 6px ${color}88)`, // Glistening pipe glow
            opacity: 0.9,
          }}
        />
      );
    });
  }, [paths, size]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const scoreValue = useMemo(() => {
    return Math.max(100, baseScore - seconds * 3);
  }, [baseScore, seconds]);

  const totalColors = dots.length / 2;

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
      <div className="glass rounded-2xl p-4 sm:p-6 max-w-[540px] mx-auto flex flex-col">
        {/* HUD */}
        <div className="flex justify-between items-center mb-4 text-sm">
          <Stat icon="⏱️" label="Time" value={`${mm}:${ss}`} />
          <Stat icon="🔗" label="Linked" value={`${connections}/${totalColors}`} />
          <button
            onClick={() => initGame()}
            className="rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-xs font-semibold"
          >
            ↻ Reset
          </button>
        </div>

        {/* Grid Container */}
        <div
          ref={gridRef}
          onMouseUp={handleStopDraw}
          onMouseLeave={handleStopDraw}
          onTouchEnd={handleStopDraw}
          className="relative aspect-square w-full rounded-xl bg-black/25 overflow-hidden border-2 border-white/10 select-none touch-none"
        >
          {/* Grid Squares background */}
          <div
            className="grid h-full w-full"
            style={{
              gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: size }).map((_, r) =>
              Array.from({ length: size }).map((_, c) => {
                const cellDot = getDotAt(r, c);
                return (
                  <div
                    key={`${r}-${c}`}
                    onMouseDown={() => handleStartDraw(r, c)}
                    onMouseEnter={() => handleMouseEnterCell(r, c)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      handleStartDraw(r, c);
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault();
                      if (!gridRef.current) return;
                      const touch = e.touches[0];
                      const rect = gridRef.current.getBoundingClientRect();
                      const x = touch.clientX - rect.left;
                      const y = touch.clientY - rect.top;
                      const cellW = rect.width / size;
                      const cellH = rect.height / size;
                      const tc = Math.floor(x / cellW);
                      const tr = Math.floor(y / cellH);
                      if (tr >= 0 && tr < size && tc >= 0 && tc < size) {
                        handleMouseEnterCell(tr, tc);
                      }
                    }}
                    className="border border-white/[0.03] flex items-center justify-center relative cursor-crosshair"
                  >
                    {/* Glowing Colored Dots */}
                    {cellDot && (
                      <div
                        style={{
                          background: cellDot.color,
                          boxShadow: `0 0 12px ${cellDot.color}`,
                        }}
                        className="w-5 h-5 sm:w-7 sm:h-7 rounded-full z-20 animate-pulse"
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* SVG Pipes overlay layer */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {svgLines}
          </svg>

          {/* Overlays */}
          <GameOverlay
            show={status === "won"}
            won
            title="Flow Link Master! 🎉"
            score={scoreValue}
            subtitle={`Connections completed: ${connections}/${totalColors} · Time: ${mm}:${ss}`}
            saving={submitting}
            saved={saved}
            onRestart={() => initGame()}
          />
        </div>

        <p className="text-center text-xs text-white/40 mt-4 leading-relaxed">
          Click & Drag (or swipe on mobile) to connect identical colored dots. <br />
          Fill 100% of the grid squares and connect all colors to win!
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
