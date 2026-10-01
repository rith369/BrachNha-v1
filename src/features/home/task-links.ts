import type { Tasks } from "@/types";
import type { RankedItem, StudyKind } from "./study-feed";

/**
 * Where each daily task's link goes. Shared by Home's Missions card and the
 * Streak page's goal card, so the same task never sends a student to two
 * different places: the same next item the Study card shows, falling back to
 * the task's own page when the feed has nothing of that kind left.
 */

/** Which study-feed item a task's link should open, when one exists. */
const TASK_KIND: Partial<Record<keyof Tasks, StudyKind>> = {
  lesson: "section",
  practice: "quiz",
  flashcards: "flashcards",
};

/** Where a task goes when the feed has nothing of that kind left. */
const TASK_FALLBACK: Record<keyof Tasks, string> = {
  lesson: "/lessons",
  practice: "/practice",
  flashcards: "/practice",
  challenge: "/exam",
};

export function taskHref(task: keyof Tasks, items: RankedItem[]): string {
  const kind = TASK_KIND[task];
  const item = kind ? items.find((i) => i.kind === kind) : undefined;
  return item?.href ?? TASK_FALLBACK[task];
}
