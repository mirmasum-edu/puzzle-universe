"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { GameDef } from "@/lib/games";
import { SkeletonCard } from "@/components/ui";

const loading = () => <SkeletonCard />;

const BlockPuzzle = dynamic(() => import("@/game/Grid Block Puzzle/BlockPuzzle"), { loading });
const MemoryMatch = dynamic(() => import("@/game/Memory Match/MemoryMatch"), { loading });
const Game2048 = dynamic(() => import("@/game/2048/Game2048"), { loading });
const SlidingPuzzle = dynamic(() => import("@/game/Sliding Puzzle/SlidingPuzzle"), { loading });
const Sudoku = dynamic(() => import("@/game/Sudoku/Sudoku"), { loading });
const ColorFlood = dynamic(() => import("@/game/Color Flood/ColorFlood"), { loading });
const Minesweeper = dynamic(() => import("@/game/Minesweeper/Minesweeper"), { loading });
const WordGuess = dynamic(() => import("@/game/Word Guess/WordGuess"), { loading });
const WaterSort = dynamic(() => import("@/game/Water Sort/WaterSort"), { loading });
const FlowLink = dynamic(() => import("@/game/Flow Link/FlowLink"), { loading });
const Nonogram = dynamic(() => import("@/game/Nonogram Picross/Nonogram"), { loading });

export default function GameRunner({ game }: { game: GameDef }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/play"
          className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/15 flex items-center justify-center"
          aria-label="Back to arcade"
        >
          ←
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{game.icon}</span>
          <div>
            <h1 className="text-xl font-black leading-tight">{game.title}</h1>
            <p className="text-white/50 text-xs">{game.description}</p>
          </div>
        </div>
      </div>

      {game.slug === "block-puzzle" && <BlockPuzzle mode="endless" />}
      {game.slug === "memory-match" && <MemoryMatch />}
      {game.slug === "2048" && <Game2048 />}
      {game.slug === "sliding-puzzle" && <SlidingPuzzle />}
      {game.slug === "sudoku" && <Sudoku />}
      {game.slug === "color-flood" && <ColorFlood />}
      {game.slug === "minesweeper" && <Minesweeper />}
      {game.slug === "word-guess" && <WordGuess />}
      {game.slug === "water-sort" && <WaterSort />}
      {game.slug === "flow-link" && <FlowLink />}
      {game.slug === "nonogram" && <Nonogram />}
    </div>
  );
}
