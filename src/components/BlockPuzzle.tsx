"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/client";
import { useToast } from "@/components/Toast";
import { useUser } from "@/components/UserContext";

const SIZE = 8;

type Cell = string | null; // color or null
type Board = Cell[][];

type Piece = { id: number; cells: [number, number][]; color: string };

const COLORS = [
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#3b82f6",
];

// Piece shapes as coordinate offsets
const SHAPES: [number, number][][] = [
  [[0, 0]],
  [[0, 0], [0, 1]],
  [[0, 0], [1, 0]],
  [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [0, 1], [1, 0], [1, 1]], // square
  [[0, 0], [0, 1], [0, 2], [1, 0]], // L
  [[0, 0], [1, 0], [2, 0], [2, 1]], // L2
  [[0, 0], [0, 1], [1, 1], [1, 2]], // S
  [[0, 1], [1, 0], [1, 1], [1, 2]], // T
  [[0, 0], [0, 1], [0, 2], [0, 3]], // I4 horizontal
  [[0, 0], [1, 0], [2, 0], [3, 0]], // I4 vertical
];

function emptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => null));
}

let pieceIdSeq = 1;
function randomPiece(): Piece {
  const cells = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return { id: pieceIdSeq++, cells, color };
}

function newTray(): Piece[] {
  return [randomPiece(), randomPiece(), randomPiece()];
}

function canPlace(board: Board, piece: Piece, r: number, c: number): boolean {
  return piece.cells.every(([dr, dc]) => {
    const rr = r + dr;
    const cc = c + dc;
    return rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE && board[rr][cc] === null;
  });
}

function anyPlacement(board: Board, pieces: Piece[]): boolean {
  for (const p of pieces) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (canPlace(board, p, r, c)) return true;
      }
    }
  }
  return false;
}

export default function BlockPuzzle({ mode = "endless" }: { mode?: string }) {
  const { push } = useToast();
  const { refresh } = useUser();
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [tray, setTray] = useState<Piece[]>(newTray);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedPiece = useMemo(
    () => tray.find((p) => p.id === selected) || null,
    [tray, selected]
  );

  const resetGame = useCallback(() => {
    setBoard(emptyBoard());
    setTray(newTray());
    setSelected(null);
    setScore(0);
    setLines(0);
    setCombo(0);
    setBestCombo(0);
    setGameOver(false);
    setSaved(false);
    setHover(null);
  }, []);

  const submitScore = useCallback(
    async (finalScore: number, finalLines: number, finalCombo: number) => {
      setSubmitting(true);
      try {
        const res = await api<{ gainedXp: number; gainedCoins: number; newHighScore: boolean }>(
          "/api/scores",
          {
            method: "POST",
            body: JSON.stringify({ score: finalScore, lines: finalLines, combo: finalCombo, mode }),
          }
        );
        push(
          `+${res.gainedXp} XP · +${res.gainedCoins} 🪙${res.newHighScore ? " · New High Score! 🎉" : ""}`,
          "success"
        );
        setSaved(true);
        refresh();
      } catch {
        push("Could not save score", "error");
      } finally {
        setSubmitting(false);
      }
    },
    [mode, push, refresh]
  );

  function place(r: number, c: number) {
    if (!selectedPiece || gameOver) return;
    if (!canPlace(board, selectedPiece, r, c)) {
      push("Can't place there", "error");
      return;
    }
    const nb = board.map((row) => row.slice());
    for (const [dr, dc] of selectedPiece.cells) {
      nb[r + dr][c + dc] = selectedPiece.color;
    }
    let gained = selectedPiece.cells.length; // points for placing

    // Detect full rows/cols
    const fullRows: number[] = [];
    const fullCols: number[] = [];
    for (let i = 0; i < SIZE; i++) {
      if (nb[i].every((x) => x !== null)) fullRows.push(i);
      if (nb.every((row) => row[i] !== null)) fullCols.push(i);
    }
    const cleared = fullRows.length + fullCols.length;

    let newCombo = combo;
    if (cleared > 0) {
      for (const i of fullRows) for (let j = 0; j < SIZE; j++) nb[i][j] = null;
      for (const j of fullCols) for (let i = 0; i < SIZE; i++) nb[i][j] = null;
      newCombo = combo + 1;
      gained += cleared * 100 * newCombo; // combo multiplier
      setLines((l) => l + cleared);
      setBestCombo((b) => Math.max(b, newCombo));
      push(
        `${cleared} line${cleared > 1 ? "s" : ""} cleared! ${newCombo > 1 ? `${newCombo}x combo 🔥` : ""}`,
        "success"
      );
    } else {
      newCombo = 0;
    }
    setCombo(newCombo);

    const newScore = score + gained;
    setScore(newScore);

    // Remove piece from tray
    let newTrayArr = tray.filter((p) => p.id !== selectedPiece.id);
    if (newTrayArr.length === 0) newTrayArr = newTray();
    setBoard(nb);
    setTray(newTrayArr);
    setSelected(null);
    setHover(null);

    // Check game over
    if (!anyPlacement(nb, newTrayArr)) {
      setGameOver(true);
      const fc = Math.max(bestCombo, newCombo);
      submitScore(newScore, lines + cleared, fc);
    }
  }

  // hover preview validity
  const previewCells = useMemo(() => {
    if (!selectedPiece || !hover) return new Set<string>();
    const set = new Set<string>();
    if (canPlace(board, selectedPiece, hover.r, hover.c)) {
      for (const [dr, dc] of selectedPiece.cells) {
        set.add(`${hover.r + dr}-${hover.c + dc}`);
      }
    }
    return set;
  }, [selectedPiece, hover, board]);

  const previewInvalid =
    selectedPiece && hover && !canPlace(board, selectedPiece, hover.r, hover.c);

  return (
    <div className="grid lg:grid-cols-[1fr_260px] gap-6 items-start">
      <div className="glass rounded-2xl p-4 sm:p-6">
        {/* HUD */}
        <div className="flex flex-wrap gap-3 mb-4 text-sm">
          <Stat label="Score" value={score} icon="⭐" />
          <Stat label="Lines" value={lines} icon="🧹" />
          <Stat label="Combo" value={`${combo}x`} icon="⚡" />
          <Stat label="Best Combo" value={`${bestCombo}x`} icon="🔥" />
        </div>

        {/* Board */}
        <div className="relative">
          <div
            className="grid gap-1 mx-auto max-w-[520px] aspect-square"
            style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0,1fr))` }}
            onMouseLeave={() => setHover(null)}
          >
            {board.map((row, r) =>
              row.map((cell, c) => {
                const key = `${r}-${c}`;
                const isPreview = previewCells.has(key);
                return (
                  <button
                    key={key}
                    onMouseEnter={() => setHover({ r, c })}
                    onClick={() => place(r, c)}
                    className="rounded-md transition-colors"
                    style={{
                      background: cell
                        ? cell
                        : isPreview
                        ? selectedPiece?.color + "aa"
                        : "rgba(255,255,255,0.05)",
                      outline:
                        isPreview && previewInvalid ? "2px solid #ef4444" : "none",
                      boxShadow: cell ? "inset 0 0 6px rgba(0,0,0,0.35)" : "none",
                    }}
                  />
                );
              })
            )}
          </div>

          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/70 backdrop-blur-sm animate-fade-up">
              <div className="text-center">
                <div className="text-5xl mb-2">🎮</div>
                <h3 className="text-2xl font-bold">Game Over</h3>
                <p className="text-white/60 mt-1">Score: {score.toLocaleString()}</p>
                <p className="text-white/40 text-sm">
                  {submitting ? "Saving…" : saved ? "Progress saved ✔" : ""}
                </p>
                <button
                  onClick={resetGame}
                  className="mt-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-2.5 font-semibold"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tray */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="font-semibold mb-1">Your Blocks</h3>
          <p className="text-xs text-white/50">
            Tap a block, then tap the board to place it. Clear full rows or columns to score.
          </p>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
          {tray.map((p) => {
            const maxR = Math.max(...p.cells.map((x) => x[0])) + 1;
            const maxC = Math.max(...p.cells.map((x) => x[1])) + 1;
            const set = new Set(p.cells.map(([r, c]) => `${r}-${c}`));
            const active = selected === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(active ? null : p.id)}
                className={`rounded-xl p-3 flex items-center justify-center transition ${
                  active ? "bg-white/15 ring-2 ring-violet-400" : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <div
                  className="grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${maxC}, 18px)` }}
                >
                  {Array.from({ length: maxR }).map((_, r) =>
                    Array.from({ length: maxC }).map((_, c) => (
                      <div
                        key={`${r}-${c}`}
                        className="rounded"
                        style={{
                          width: 18,
                          height: 18,
                          background: set.has(`${r}-${c}`) ? p.color : "transparent",
                        }}
                      />
                    ))
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <button
          onClick={resetGame}
          className="w-full rounded-xl bg-white/10 hover:bg-white/15 py-2.5 text-sm font-medium"
        >
          ↻ Restart
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="rounded-xl bg-white/5 px-4 py-2">
      <div className="text-xs text-white/50">
        {icon} {label}
      </div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}
