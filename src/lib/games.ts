export type GameDef = {
  slug: string;
  title: string;
  icon: string;
  tagline: string;
  description: string;
  color: string; // gradient classes
  minAge: string;
};

export const GAMES: GameDef[] = [
  {
    slug: "block-puzzle",
    title: "Grid Block Puzzle",
    icon: "🧩",
    tagline: "Place & clear lines",
    description: "Drop blocks onto the 8×8 board and clear full rows or columns for combos.",
    color: "from-violet-500 to-fuchsia-500",
    minAge: "4+",
  },
  {
    slug: "memory-match",
    title: "Memory Match",
    icon: "🃏",
    tagline: "Find the pairs",
    description: "Flip cards to find matching pairs. Fewer moves and faster times score higher.",
    color: "from-sky-500 to-cyan-500",
    minAge: "4+",
  },
  {
    slug: "2048",
    title: "2048",
    icon: "🔢",
    tagline: "Merge to 2048",
    description: "Slide tiles to merge matching numbers. Reach the 2048 tile to win.",
    color: "from-amber-500 to-orange-500",
    minAge: "6+",
  },
  {
    slug: "sliding-puzzle",
    title: "Sliding Puzzle",
    icon: "🔀",
    tagline: "Order the tiles",
    description: "Slide numbered tiles into order. Classic 15-puzzle with 3 board sizes.",
    color: "from-emerald-500 to-teal-500",
    minAge: "5+",
  },
  {
    slug: "sudoku",
    title: "Sudoku",
    icon: "9️⃣",
    tagline: "Logic number grid",
    description: "Fill the 9×9 grid so every row, column and box has 1–9. Three difficulties.",
    color: "from-rose-500 to-pink-500",
    minAge: "8+",
  },
  {
    slug: "color-flood",
    title: "Color Flood",
    icon: "🎨",
    tagline: "Conquer the board",
    description: "Flood the board with one color within limited moves. Quick and colorful.",
    color: "from-indigo-500 to-purple-500",
    minAge: "4+",
  },
];

export function getGame(slug: string): GameDef | undefined {
  return GAMES.find((g) => g.slug === slug);
}
