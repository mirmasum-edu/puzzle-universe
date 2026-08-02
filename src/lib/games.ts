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
  {
    slug: "minesweeper",
    title: "Minesweeper",
    icon: "💣",
    tagline: "Sweep the mines",
    description: "Reveal cells while avoiding hidden mines. Use logic and flags to sweep the field.",
    color: "from-teal-500 to-emerald-600",
    minAge: "8+",
  },
  {
    slug: "word-guess",
    title: "Word Guess",
    icon: "📝",
    tagline: "Find the secret word",
    description: "Crack the secret 5-letter word in 6 attempts. Use the colorful clues to trace letters.",
    color: "from-purple-500 to-indigo-600",
    minAge: "6+",
  },
  {
    slug: "water-sort",
    title: "Water Sort",
    icon: "🧪",
    tagline: "Sort colored liquids",
    description: "Pour and sort different colored liquids in test tubes until each tube is monochromatic.",
    color: "from-blue-500 to-teal-500",
    minAge: "4+",
  },
  {
    slug: "flow-link",
    title: "Flow Link",
    icon: "🔗",
    tagline: "Link identical colors",
    description: "Connect matching colored dots with pipes on a grid. Cover 100% of cells without intersections.",
    color: "from-fuchsia-500 to-rose-500",
    minAge: "5+",
  },
  {
    slug: "nonogram",
    title: "Nonogram Picross",
    icon: "🎨",
    tagline: "Reveal pixel art shapes",
    description: "Fill cells on a grid based on coordinate numbers to unlock beautiful retro silhouettes.",
    color: "from-purple-500 to-pink-500",
    minAge: "6+",
  },
];

export function getGame(slug: string): GameDef | undefined {
  return GAMES.find((g) => g.slug === slug);
}
