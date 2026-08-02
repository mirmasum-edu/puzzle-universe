export type Board = number[]; // length 81, 0 = empty

function shuffled<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function isValid(board: Board, idx: number, val: number): boolean {
  const row = Math.floor(idx / 9);
  const col = idx % 9;
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row * 9 + c] === val) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r * 9 + col] === val) return false;
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      const i = r * 9 + c;
      if (i !== idx && board[i] === val) return false;
    }
  }
  return true;
}

function solve(board: Board): boolean {
  const idx = board.indexOf(0);
  if (idx === -1) return true;
  for (const val of shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (isValid(board, idx, val)) {
      board[idx] = val;
      if (solve(board)) return true;
      board[idx] = 0;
    }
  }
  return false;
}

function countSolutions(board: Board, limit = 2): number {
  const idx = board.indexOf(0);
  if (idx === -1) return 1;
  let count = 0;
  for (let val = 1; val <= 9; val++) {
    if (isValid(board, idx, val)) {
      board[idx] = val;
      count += countSolutions(board, limit);
      board[idx] = 0;
      if (count >= limit) break;
    }
  }
  return count;
}

const CLUES = { easy: 42, medium: 34, hard: 28 } as const;
export type Difficulty = keyof typeof CLUES;

export function generate(difficulty: Difficulty): { puzzle: Board; solution: Board } {
  const full: Board = new Array(81).fill(0);
  solve(full);
  const solution = full.slice();

  const puzzle = full.slice();
  const targetClues = CLUES[difficulty];
  const cells = shuffled(Array.from({ length: 81 }, (_, i) => i));
  let clues = 81;

  for (const cell of cells) {
    if (clues <= targetClues) break;
    const backup = puzzle[cell];
    if (backup === 0) continue;
    puzzle[cell] = 0;
    const copy = puzzle.slice();
    if (countSolutions(copy, 2) !== 1) {
      puzzle[cell] = backup; // keep it to preserve uniqueness
    } else {
      clues--;
    }
  }

  return { puzzle, solution };
}
