/**
 * The level rule: each level costs 20 XP more than the one before it, forever.
 *
 *   level 1 → 2 costs 100 XP, 2 → 3 costs 120, 3 → 4 costs 140, …
 *
 * so reaching level L takes 100(L-1) + 10(L-1)(L-2) XP in total. The user's
 * rule (26 Oct 2026); it replaced a flat 100 XP per level.
 *
 * THE LEVEL IS DERIVED FROM TOTAL XP, NEVER COUNTED UP. The store still keeps a
 * `level` field so every reader keeps reading one plain number, but it is
 * written only from `levelForXp()`: in `award()`, on every hydration (the
 * persist `merge`) and on a pull. That is what moved every existing student
 * onto this rule at once, including the ones it moved DOWN (the user's call),
 * and what fixed the old rule's skip: one award big enough to cross two
 * thresholds used to raise the level by one only.
 */

const FIRST_LEVEL_XP = 100;
const STEP_XP = 20;

/** XP it costs to go from `level` to `level + 1`. */
export function xpForLevel(level: number): number {
  return FIRST_LEVEL_XP + STEP_XP * (Math.max(level, 1) - 1);
}

/** Total XP needed to reach `level` from zero. */
export function xpToReachLevel(level: number): number {
  const n = Math.max(level, 1) - 1;
  return FIRST_LEVEL_XP * n + (STEP_XP / 2) * n * (n - 1);
}

export function levelForXp(xp: number): number {
  const total = Number.isFinite(xp) ? Math.max(xp, 0) : 0;
  let level = 1;
  while (xpToReachLevel(level + 1) <= total) level++;
  return level;
}

/** Where a student stands inside their current level. */
export function levelProgress(xp: number): {
  level: number;
  into: number;
  needed: number;
} {
  const level = levelForXp(xp);
  return {
    level,
    into: Math.max(xp, 0) - xpToReachLevel(level),
    needed: xpForLevel(level),
  };
}
