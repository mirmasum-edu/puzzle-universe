"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generate, Difficulty, Board } from "./generator";
import { useSubmitScore } from "@/lib/useSubmitScore";
import GameOverlay from "@/components/GameOverlay";

const DIFFS: Difficulty[] = ["easy", "medium", "hard"];

export default function Sudoku() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [puzzle, setPuzzle] = useState<Board>([]);
  const [solution, setSolution] = useState<Board>([]);
  const [board, setBoard] = useState<Board>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [loading, setLoading] = useState(true);
  const { submit, submitting, saved, reset } = useSubmitScore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const newGame = useCallback(
    (d: Difficulty = difficulty) => {
      stopTimer();
      setLoading(true);
      // defer generation so the loading UI can paint
      setTimeout(() => {
        const { puzzle: p, solution: s } = generate(d);
        setPuzzle(p);
        setSolution(s);
        setBoard(p.slice());
        setSelected(null);
        setMistakes(0);
        setSeconds(0);
        setWon(false);
        setLost(false);
        reset();
        setLoading(false);
        timerRef.current = setInterval(() => setSeconds((x) => x + 1), 1000);
      }, 30);
    },
    [difficulty, stopTimer, reset]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    newGame("easy");
    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const score = useMemo(() => {
    const base = { easy: 800, medium: 1500, hard: 2500 }[difficulty];
    return Math.max(100, base - seconds * 2 - mistakes * 100);
  }, [difficulty, seconds, mistakes]);

  const finish = useCallback(
    (finalMistakes: number) => {
      stopTimer();
      setWon(true);
      const base = { easy: 800, medium: 1500, hard: 2500 }[difficulty];
      const finalScore = Math.max(100, base - seconds * 2 - finalMistakes * 100);
      submit({ score: finalScore, combo: 0, mode: "sudoku" });
    },
    [difficulty, seconds, stopTimer, submit]
  );

  function place(val: number) {
    if (selected === null || won || lost) return;
    if (puzzle[selected] !== 0) return; // fixed cell
    const next = board.slice();
    next[selected] = val;
    setBoard(next);

    if (val !== 0 && val !== solution[selected]) {
      const m = mistakes + 1;
      setMistakes(m);
      if (m >= 3) {
        stopTimer();
        setLost(true);
      }
      return;
    }
    // check win
    if (val !== 0 && next.every((c, i) => c === solution[i])) {
      finish(mistakes);
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (selected === null) return;
      if (e.key >= "1" && e.key <= "9") place(Number(e.key));
      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") place(0);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, board, mistakes, won, lost]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const selectedVal = selected !== null ? board[selected] : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {DIFFS.map((d) => (
          <button
            key={d}
            onClick={() => {
              setDifficulty(d);
              newGame(d);
            }}
            className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition ${
              difficulty === d ? "bg-violet-500" : "bg-white/5 hover:bg-white/10 text-white/70"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl p-4 sm:p-6 max-w-[560px] mx-auto">
        <div className="flex gap-3 mb-4 text-sm">
          <Stat icon="⏱️" label="Time" value={`${mm}:${ss}`} />
          <Stat icon="❌" label="Mistakes" value={`${mistakes}/3`} />
          <button
            onClick={() => newGame()}
            className="ml-auto rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-sm font-medium"
          >
            ↻ New
          </button>
        </div>

        <div className="relative">
          {loading ? (
            <div className="aspect-square flex items-center justify-center text-white/50">
              Generating puzzle…
            </div>
          ) : (
            <div className="grid grid-cols-9 mx-auto aspect-square rounded-lg overflow-hidden border-2 border-white/20">
              {board.map((val, i) => {
                const row = Math.floor(i / 9);
                const col = i % 9;
                const fixed = puzzle[i] !== 0;
                const isSel = selected === i;
                const sameVal = selectedVal !== 0 && val === selectedVal;
                const wrong = val !== 0 && !fixed && val !== solution[i];
                const highlight =
                  selected !== null &&
                  (Math.floor(selected / 9) === row ||
                    selected % 9 === col ||
                    (Math.floor(row / 3) === Math.floor(Math.floor(selected / 9) / 3) &&
                      Math.floor(col / 3) === Math.floor((selected % 9) / 3)));
                return (
                  <button
                    key={i}
                    onClick={() => setSelected(i)}
                    className="aspect-square flex items-center justify-center text-sm sm:text-base font-semibold"
                    style={{
                      background: isSel
                        ? "rgba(139,92,246,0.55)"
                        : sameVal
                        ? "rgba(139,92,246,0.25)"
                        : highlight
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(255,255,255,0.02)",
                      color: wrong ? "#f87171" : fixed ? "#fff" : "#a5b4fc",
                      borderRight: (col + 1) % 3 === 0 && col !== 8 ? "2px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.06)",
                      borderBottom: (row + 1) % 3 === 0 && row !== 8 ? "2px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {val !== 0 ? val : ""}
                  </button>
                );
              })}
            </div>
          )}

          <GameOverlay
            show={won}
            won
            title="Solved!"
            score={score}
            subtitle={`${mm}:${ss} · ${mistakes} mistakes`}
            saving={submitting}
            saved={saved}
            onRestart={() => newGame()}
          />
          <GameOverlay
            show={lost}
            title="Game Over"
            score={0}
            subtitle="3 mistakes reached"
            onRestart={() => newGame()}
          />
        </div>

        {/* Number pad */}
        <div className="mt-4 grid grid-cols-9 gap-1.5 max-w-[440px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => place(n)}
              className="rounded-lg bg-white/10 hover:bg-violet-500/60 py-2.5 font-bold"
            >
              {n}
            </button>
          ))}
        </div>
        <button
          onClick={() => place(0)}
          className="mt-2 w-full max-w-[440px] mx-auto block rounded-lg bg-white/10 hover:bg-white/15 py-2 text-sm font-medium"
        >
          ⌫ Erase
        </button>
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
