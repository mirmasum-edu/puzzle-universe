export function levelFromXp(xp: number): number {
  // Each level requires progressively more XP. Level n needs n*500 total steps.
  let level = 1;
  let needed = 500;
  let remaining = xp;
  while (remaining >= needed) {
    remaining -= needed;
    level += 1;
    needed = level * 500;
  }
  return level;
}

export function xpProgress(xp: number): { level: number; into: number; needed: number } {
  let level = 1;
  let needed = 500;
  let remaining = xp;
  while (remaining >= needed) {
    remaining -= needed;
    level += 1;
    needed = level * 500;
  }
  return { level, into: remaining, needed };
}
