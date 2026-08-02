"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useSubmitScore } from "@/lib/useSubmitScore";
import GameOverlay from "@/components/GameOverlay";

type Difficulty = "easy" | "medium" | "hard";

const CONFIGS = {
  easy: { colors: ["#ef4444", "#3b82f6", "#10b981"], filledTubes: 3, emptyTubes: 2, baseScore: 1000 },
  medium: { colors: ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"], filledTubes: 5, emptyTubes: 2, baseScore: 2500 },
  hard: { colors: ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"], filledTubes: 7, emptyTubes: 2, baseScore: 5000 },
};

const TUBE_CAPACITY = 4;

export default function WaterSort() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const { colors, filledTubes, emptyTubes, baseScore } = CONFIGS[difficulty];

  const [tubes, setTubes] = useState<string[][]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [status, setStatus] = useState<"playing" | "won">("playing");
  const [moves, setMoves] = useState(0);
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

  // Generates a 100% solvable scrambled state using a reverse-simulation shuffler
  const generateLevel = useCallback((diff: Difficulty) => {
    const config = CONFIGS[diff];
    const numColors = config.colors.length;

    // 1. Create solved solid tubes
    const initialTubes: string[][] = [];
    for (let i = 0; i < config.filledTubes; i++) {
      initialTubes.push(Array(TUBE_CAPACITY).fill(config.colors[i]));
    }
    for (let i = 0; i < config.emptyTubes; i++) {
      initialTubes.push([]);
    }

    // 2. Perform reverse random pours to guarantee solvability
    const scrambled = initialTubes.map((t) => [...t]);
    let successfulSteps = 0;
    const totalSteps = numColors * 15; // More steps = more mixed

    for (let step = 0; step < totalSteps * 3 && successfulSteps < totalSteps; step++) {
      const fromIdx = Math.floor(Math.random() * scrambled.length);
      const toIdx = Math.floor(Math.random() * scrambled.length);
      if (fromIdx === toIdx) continue;

      const fromTube = scrambled[fromIdx];
      const toTube = scrambled[toIdx];

      // To pour in reverse: take a layer of the top color from 'fromTube' and put in 'toTube'
      if (fromTube.length > 0 && toTube.length < TUBE_CAPACITY) {
        // Only pour if 'toTube' is empty OR matches the color of 'fromTube' top (reversing pouring criteria)
        const colorToMove = fromTube[fromTube.length - 1];
        if (toTube.length === 0 || toTube[toTube.length - 1] === colorToMove) {
          // Count consecutive identical layers to move
          let count = 0;
          for (let i = fromTube.length - 1; i >= 0; i--) {
            if (fromTube[i] === colorToMove) count++;
            else break;
          }
          // Cap count to target tube's remaining capacity
          const finalCount = Math.min(count, TUBE_CAPACITY - toTube.length);
          if (finalCount > 0) {
            // Move colors
            for (let i = 0; i < finalCount; i++) {
              fromTube.pop();
              toTube.push(colorToMove);
            }
            successfulSteps++;
          }
        }
      }
    }

    return scrambled;
  }, []);

  const initGame = useCallback(
    (diff: Difficulty = difficulty) => {
      stopTimer();
      setDifficulty(diff);
      setTubes(generateLevel(diff));
      setSelectedIdx(null);
      setStatus("playing");
      setMoves(0);
      setSeconds(0);
      reset();
      startTimer();
    },
    [difficulty, stopTimer, startTimer, reset, generateLevel]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initGame("easy");
    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validation: Checks if victory conditions are met
  const checkVictory = (currentTubes: string[][]) => {
    return currentTubes.every((tube) => {
      // Each tube must either be completely empty, OR completely filled (4 layers) with a single unique color
      if (tube.length === 0) return true;
      if (tube.length !== TUBE_CAPACITY) return false;
      const firstColor = tube[0];
      return tube.every((color) => color === firstColor);
    });
  };

  const handleTubeClick = (idx: number) => {
    if (status === "won") return;

    if (selectedIdx === null) {
      // Select source tube
      if (tubes[idx].length === 0) return; // Can't pour from empty tube
      setSelectedIdx(idx);
    } else {
      // Pour from source (selectedIdx) to target (idx)
      if (selectedIdx === idx) {
        setSelectedIdx(null); // Cancel selection
        return;
      }

      const sourceTube = tubes[selectedIdx];
      const targetTube = tubes[idx];

      if (targetTube.length >= TUBE_CAPACITY) {
        setSelectedIdx(idx); // Shift selection to target tube
        return;
      }

      const colorToMove = sourceTube[sourceTube.length - 1];

      // Validate pouring eligibility: target is empty OR matches source top color
      if (targetTube.length === 0 || targetTube[targetTube.length - 1] === colorToMove) {
        const nextTubes = tubes.map((t) => [...t]);
        const sTube = nextTubes[selectedIdx];
        const tTube = nextTubes[idx];

        // Determine contiguous units of matching color to pour
        let count = 0;
        for (let i = sTube.length - 1; i >= 0; i--) {
          if (sTube[i] === colorToMove) count++;
          else break;
        }

        // Clip count by target's available capacity
        const transferCount = Math.min(count, TUBE_CAPACITY - tTube.length);

        for (let i = 0; i < transferCount; i++) {
          sTube.pop();
          tTube.push(colorToMove);
        }

        setTubes(nextTubes);
        setMoves((m) => m + 1);
        setSelectedIdx(null);

        // Check if level solved
        if (checkVictory(nextTubes)) {
          stopTimer();
          setStatus("won");
          // Score formula: Base - move penalty - time penalty
          const calculatedScore = Math.max(
            100,
            baseScore - (moves + 1) * 10 - seconds * 2
          );
          submit({ score: calculatedScore, combo: 0, mode: "water-sort" });
        }
      } else {
        // Invalid target: shift selection to clicked tube
        setSelectedIdx(idx);
      }
    }
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const scoreValue = useMemo(() => {
    return Math.max(100, baseScore - moves * 10 - seconds * 2);
  }, [baseScore, moves, seconds]);

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
      <div className="glass rounded-2xl p-4 sm:p-6 max-w-[580px] mx-auto flex flex-col">
        {/* HUD */}
        <div className="flex justify-between items-center mb-6 text-sm">
          <Stat icon="⏱️" label="Time" value={`${mm}:${ss}`} />
          <Stat icon="🔄" label="Moves" value={moves} />
          <button
            onClick={() => initGame()}
            className="rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-xs font-semibold"
          >
            ↻ Reset
          </button>
        </div>

        {/* Liquid Tubes Grid */}
        <div className="flex flex-wrap gap-x-5 gap-y-8 justify-center py-6 select-none">
          {tubes.map((tube, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => handleTubeClick(idx)}
                style={{
                  transform: isSelected ? "translateY(-14px)" : "translateY(0px)",
                  boxShadow: isSelected ? "0 10px 15px -3px rgba(139, 92, 246, 0.3)" : "none",
                  borderColor: isSelected ? "rgba(139, 92, 246, 0.8)" : "rgba(255,255,255,0.12)",
                }}
                className={`w-14 h-44 border-2 rounded-b-2xl rounded-t-lg bg-white/[0.02] flex flex-col justify-end p-0.5 relative transition-all duration-300 overflow-hidden cursor-pointer`}
              >
                {/* Visual Glass highlights */}
                <div className="absolute top-0 left-1 right-1 h-2 border-b border-white/5 bg-white/[0.04]" />
                <div className="absolute top-0 right-1.5 w-1 bottom-0 bg-white/[0.03] rounded-r-xl" />

                {/* Colored Water Layers */}
                <div className="flex flex-col-reverse h-full w-full justify-start rounded-b-xl overflow-hidden">
                  {tube.map((color, layerIdx) => (
                    <div
                      key={layerIdx}
                      style={{
                        background: color,
                        height: "25%",
                        borderTop: "1px solid rgba(255,255,255,0.15)",
                        boxShadow: "inset 0 -4px 6px rgba(0,0,0,0.15)",
                      }}
                      className="w-full transition-all duration-300"
                    />
                  ))}
                  {/* Empty Spacer layers */}
                  {Array.from({ length: TUBE_CAPACITY - tube.length }).map((_, spacerIdx) => (
                    <div key={spacerIdx} className="w-full" style={{ height: "25%" }} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Overlays */}
        <div className="relative">
          <GameOverlay
            show={status === "won"}
            won
            title="Sorted Successfully! 🎉"
            score={scoreValue}
            subtitle={`Solved in ${moves} moves · difficulty: ${difficulty}`}
            saving={submitting}
            saved={saved}
            onRestart={() => initGame()}
          />
        </div>

        <p className="text-center text-xs text-white/40 mt-4 leading-relaxed">
          Select Tube A (it will raise) and click Tube B to pour liquid. <br />
          Pour only into empty tubes or matching top colors!
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
