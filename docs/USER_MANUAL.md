# 🎮 PUZZLE UNIVERSE — COMPLETE GAMEPLAY MANUAL & CONTROL GUIDE

Welcome to the **Puzzle Universe User Manual**! This guide is designed to help players easily understand the objective, controls, rules of play, and pro-level strategies for all **eleven fully playable puzzle games** on the platform.

---

## 🧭 QUICK REFERENCE INDEX

| Game | Icon | Recommended Age | Main Controls | Focus |
|---|---|---|---|---|
| [1. Grid Block Puzzle](#1-grid-block-puzzle-) | 🧩 | 4+ | Tap block $\rightarrow$ Tap board | Spatial logic & block packing |
| [2. Memory Match](#2-memory-match-) | 🃏 | 4+ | Click cards | Short-term visual memory |
| [3. 2048](#3-2048-) | 🔢 | 6+ | Arrows / WASD / Mobile Swipe | Merging math grids |
| [4. Sliding Puzzle](#4-sliding-puzzle-) | 🔀 | 5+ | Click adjacent tiles | Re-ordering slides |
| [5. Sudoku](#5-sudoku-) | 9️⃣ | 8+ | Click cell $\rightarrow$ Click numpad | Number grid deduction |
| [6. Color Flood](#6-color-flood-) | 🎨 | 4+ | Click color buttons | DFS-based flood repainting |
| [7. Minesweeper](#7-minesweeper-) | 💣 | 8+ | Left-click (reveal) / Flag Toggle | Probability & mine clearing |
| [8. Word Guess](#8-word-guess-) | 📝 | 6+ | Keyboard / Virtual Keys | Wordle deduction & vocabulary |
| [9. Water Sort](#9-water-sort-) | 🧪 | 4+ | Click Tube A $\rightarrow$ Click Tube B | Scheduling & color sorting |
| [10. Flow Link](#10-flow-link-) | 🔗 | 5+ | Click & Drag dots | Coordinate pipe connections |
| [11. Nonogram Picross](#11-nonogram-picross-) | 🎨 | 6+ | Click grid (Toggle Fill/Cross) | Spatial layout clue decryption |

---

## 🎮 INDIVIDUAL GAME MANUALS

### 1. Grid Block Puzzle 🧩
* **Objective**: Drag and place geometric block shapes from your tray onto an $8 \times 8$ board. Clear complete rows and columns to prevent the board from filling up.
* **Desktop Controls**: 
  * **Select Piece**: Left-click a shape in your bottom tray.
  * **Place Piece**: Move your mouse over the $8 \times 8$ board (a transparent colored hover preview shows placement validity) and **left-click** a grid cell to drop it.
* **Mobile Controls**:
  * **Select & Place**: Tap a shape in your tray (the tray item highlights with a purple border), then tap any cell on the board to place the shape.
* **Rules of Play**:
  1. Shapes cannot overlap existing filled squares.
  2. Completing a full horizontal row or vertical column clears those squares, freeing up space.
  3. Filling multiple rows/columns simultaneously or consecutively triggers a **Combo Multiplier** that drastically boosts points.
  4. If your tray has shapes remaining and none of them can fit on the board, it is **Game Over**.
* **Pro Strategies**:
  * **Avoid Island Gaps**: Try not to leave single isolated empty holes, as very few shapes can fit in a single $1 \times 1$ slot.
  * **Build Combo Pools**: Try setting up multiple columns and rows that are one block away from completion. Clear them in quick succession to generate massive combo scores!

---

### 2. Memory Match 🃏
* **Objective**: Uncover cards in the fewest moves and fastest time possible to find all matching icon pairs.
* **Desktop & Mobile Controls**:
  * **Flip Card**: Click or tap a facedown card to flip it over.
* **Rules of Play**:
  1. Turn over two cards.
  2. If the icons match, they stay face-up and are completed.
  3. If they do not match, they flip back over after a $1.0$-second delay.
  4. Game finishes when all matching pairs are revealed.
* **Pro Strategies**:
  * **Coordinate Grid Scan**: Read cards row-by-row or quadrant-by-quadrant instead of clicking randomly. This makes it easier to memorize positions in your mind.
  * **Anchor card technique**: Always start a turn by clicking a card whose identity is *unknown*, and then click a card whose matching position you already remember.

---

### 3. 2048 🔢
* **Objective**: Merge matching numbered tiles on a grid to reach the coveted $2048$ tile.
* **Desktop Controls**: 
  * Use **Arrow Keys** ($\uparrow, \downarrow, \leftarrow, \rightarrow$) or **WASD** keys to slide the entire board.
* **Mobile Controls**:
  * **Swipe**: Swipe your finger in the direction you want the tiles to slide (Left, Right, Up, Down), or use the on-screen arrows.
* **Rules of Play**:
  1. Sliding slides all tiles in that direction as far as they can go.
  2. If two tiles of the identical value collide, they **merge** into a single tile representing their sum (e.g. $2+2 \rightarrow 4$, $1024+1024 \rightarrow 2048$).
  3. Each slide spawns a new tile (either a $2$ or a $4$) in an empty square.
  4. You win when you form the $2048$ tile (you can select **Keep Going** to play infinitely). You lose if the grid fills up and no legal merges remain.
* **Pro Strategies**:
  * **The Corner Lock**: Keep your highest tile locked in a single corner (e.g. bottom-right) and never press the opposite arrow key ($\uparrow$ in this case). This forces the numbers to flow cleanly into your primary corner.
  * **Ascending Row**: Organize your tiles in descending value lines leading into your corner (e.g., $128 \rightarrow 256 \rightarrow 512 \rightarrow 1024$).

---

### 4. Sliding Puzzle 🔀
* **Objective**: Rearrange scrambled, numbered squares into ascending numerical order, leaving the empty gap in the bottom-right corner.
* **Desktop & Mobile Controls**:
  * Click or tap a numbered tile that is adjacent (top, bottom, left, right) to the empty gap to slide it into the space.
* **Rules of Play**:
  1. Only tiles adjacent to the empty spot can move.
  2. The board sizes are $3 \times 3$ (8 tiles), $4 \times 4$ (15 tiles), or $5 \times 5$ (24 tiles).
  3. You win when all numbers are sorted sequentially ($1$ in top-left, moving horizontally and wrapping down, with the empty spot at the very end).
* **Pro Strategies**:
  * **Solve Row-by-Row**: Focus on solving the top row first, then the left column. This reduces the problem space, turning a $4 \times 4$ puzzle into a simpler $3 \times 3$ puzzle.
  * **The Wrap Loop**: When placing the last two numbers of a row (e.g., $3$ and $4$ on a $4 \times 4$ board), group them together vertically and rotate them into position as a pair.

---

### 5. Sudoku 9️⃣
* **Objective**: Complete a $9 \times 9$ grid so that every row, every column, and each of the nine $3 \times 3$ boxes contain the numbers $1$ through $9$ without repetition.
* **Desktop Controls**:
  * **Select Cell**: Left-click any empty square on the board.
  * **Enter Number**: Press numbers **1–9** on your physical keyboard.
  * **Erase Number**: Press **Backspace**, **Delete**, or **0**.
* **Mobile Controls**:
  * Tap an empty cell, then tap any number on the **bottom number pad** (1–9). Tap **⌫ Erase** to clear.
* **Rules of Play**:
  1. Cells pre-filled in bold white are fixed starting clues and cannot be modified.
  2. Entering a number that violates row, column, or block rules increments your **Mistakes** counter.
  3. Accumulating **3 Mistakes** triggers **Game Over**.
* **Pro Strategies**:
  * **Cross-Hatching**: Scan rows and columns of a specific $3 \times 3$ block to eliminate squares and locate where a missing number must go.
  * **Candidates Elimination**: Look for blocks that are missing only 1 or 2 numbers and calculate which coordinates are forced to take them.

---

### 6. Color Flood 🎨
* **Objective**: Repaint the entire grid into a single solid color within a limited count of color changes.
* **Desktop & Mobile Controls**:
  * Click or tap any of the six colored circles at the bottom of the board to trigger a flood change.
* **Rules of Play**:
  1. You start in control of the top-left square.
  2. Selecting a color floods your current territory with that color, absorbing all adjacent squares of the same color.
  3. You win if you flood 100% of the board before running out of moves.
* **Pro Strategies**:
  * **Max Absorption Path**: Don't just match adjacent squares—calculate which color will merge your current territory with the *largest* cluster of matching tiles nearby.
  * **Prioritize Corners**: Direct your expansion toward the bottom-right quadrant as fast as possible to cover the maximum area.

---

### 7. Minesweeper 💣
* **Objective**: Reveal all safe squares on a grid without triggering any hidden mines.
* **Desktop Controls**:
  * **Reveal cell**: Left-click a covered tile.
  * **Plant Flag**: **Right-click** a tile to mark it with a flag (🚩) as a suspected mine.
* **Mobile Controls**:
  * **Flag Mode Toggle**: Tap the **🚩 Flag Mode** button at the top:
    * When Flag Mode is **OFF**: Tapping a tile reveals it.
    * When Flag Mode is **ON**: Tapping a tile plants/removes a flag.
* **Rules of Play**:
  1. Clicking a mine triggers an immediate explosion and **Game Over**.
  2. Safe squares display a number indicating how many mines are hiding in the adjacent 8 neighboring squares.
  3. Squares with `0` adjacent mines automatically run a cascade reveal.
  4. You win when all safe, non-mine squares are revealed.
* **Pro Strategies**:
  * **The 1-1 Pattern**: If a row of uncovered numbers has `1` next to another `1` bordering a flat wall, you can often deduce safe cells and mine cells based on matching overlaps.
  * **Safe-First Click Guarantee**: Your first click is guaranteed safe and will never hit a mine. Use this starting cluster as your primary analytical base.

---

### 8. Word Guess 📝
* **Objective**: Crack the secret 5-letter word in 6 attempts or fewer.
* **Desktop Controls**:
  * Type letters on your physical keyboard and press **ENTER** to submit, or use **Backspace** to erase.
* **Mobile Controls**:
  * Tap the letters on the on-screen virtual keyboard and tap **ENTER** to submit, or **⌫** to delete.
* **Rules of Play**:
  1. Your guess must be a valid 5-letter word.
  2. After submitting, the tiles flip to reveal clues:
    * **Green (Correct)**: The letter is in the word and in the correct spot.
    * **Yellow (Present)**: The letter is in the word but in the wrong spot.
    * **Gray (Absent)**: The letter is not in the word.
  3. The virtual keyboard keys dynamically update their background colors to track your progress.
* **Pro Strategies**:
  * **Opener Words**: Start with vowels-heavy words containing common letters (e.g. `AUDIO`, `REACT`, `TILES`) to eliminate or lock down multiple vowels in one turn.
  * **Consonant Elimination**: If your first two guesses yield few clues, use your third guess to test completely new, unused letters rather than trying to fit correct letters into different spots.

---

### 9. Water Sort 🧪
* **Objective**: Pour and sort colored liquids between tubes until each tube holds only a single solid color or is empty.
* **Desktop & Mobile Controls**:
  * **Select Source**: Click or tap Tube A (it will raise vertically and glow).
  * **Select Target**: Click or tap Tube B to pour liquid from Tube A into Tube B.
* **Rules of Play**:
  1. You can only pour liquid if the target tube has empty space (each tube holds up to 4 layers).
  2. You can only pour if either the target tube is completely empty, OR its top layer matches the color of the liquid you are pouring.
  3. All contiguous identical colored layers are poured together as a single block if the target tube has sufficient empty space.
  4. You win when every tube is either completely sorted (all 4 layers are a single color) or completely empty.
* **Pro Strategies**:
  * **Clear Tubes First**: Prioritize making one or two tubes completely empty. Empty tubes are highly valuable "buffer slots" that allow you to isolate color layers.
  * **Top-Layer Unification**: Group matching top layers together across multiple tubes. This creates large unified segments that can be moved as a single unit later.

---

### 10. Flow Link 🔗
* **Objective**: Draw lines of pipe on a grid connecting identical color dots. Fill 100% of grid squares without crossing any pipes.
* **Desktop Controls**:
  * **Draw Path**: Click and hold a colored dot (or any segment of that color's line), then drag your mouse across empty grid cells. Release your mouse on the matching colored dot to complete the link.
  * **Shorten/Undo**: Drag your line backwards over your own pipe to shorten or erase it.
* **Mobile Controls**:
  * **Draw Path**: Touch and drag your finger from a colored dot across the grid squares.
* **Rules of Play**:
  1. Pipes of different colors cannot cross or overlap (each cell holds only 1 color).
  2. Drawing your pipe through another color's line automatically breaks/erases their line.
  3. To win, you must connect **all matching color pairs** AND **fill 100% of the grid squares**.
* **Pro Strategies**:
  * **Wall Hugging**: Connect dots that are near the outer edges by wrapping your paths along the grid borders. This keeps the center of the board open for interior connections.
  * **Path-Length matching**: If some dots are close together but others are separated, the shorter path may need to wrap around to let other colors pass.

---

### 11. Nonogram Picross 🎨
* **Objective**: Fill grid cells based on numerical row and column clues to reveal a hidden retro pixel art shape.
* **Desktop & Mobile Controls**:
  * **Toggle Tools**: Click or tap the **⬛ Fill** or **❌ Cross** tool buttons at the top:
    * **Fill Mode**: Clicking/tapping a cell colors it in (indicating a filled pixel).
    * **Cross Mode**: Clicking/tapping a cell places a **✕** marker (indicating an empty space).
* **Rules of Play**:
  1. The numbers next to rows and columns represent consecutive blocks of filled cells.
  2. For example, row clue `[3, 2]` means there is a cluster of 3 filled cells, followed by 1 or more empty cells, followed by a cluster of 2 filled cells.
  3. Making a mistake (e.g. filling a cell that should be empty, or crossing a cell that should be filled) increases your **Mistakes** counter.
  4. You win when all filled squares match the secret solution exactly.
* **Pro Strategies**:
  * **Max Overlaps**: If a row has a length of 10 and the clue is `[8]`, the cells from column index 3 to 8 *must* be filled regardless of where the run starts. Use this overlapping math to get guaranteed starting cells!
  * **Cross Out Early**: As soon as a run is complete, immediately switch to **Cross Mode** and place ✕ markers on the adjacent outer borders. This prevents accidents and clarifies your remaining choices.
