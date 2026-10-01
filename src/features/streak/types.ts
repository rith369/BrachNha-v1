/** Shared by both streak screens, Profile's calendar and two Progress charts. */
export type WeekdayId = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/** Sunday first, indexed by `Date.getDay()`. */
export const WEEKDAY_BY_INDEX: readonly WeekdayId[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

export interface StreakDay {
  id: WeekdayId;
  /** Local `YYYY-MM-DD` of this cell. */
  key: string;
  /** Daily goal met — NOT "opened the app". */
  done: boolean;
}

/** The three daily-goal tasks, the store's real `Tasks` keys. */
export type DailyTaskId = "lesson" | "practice" | "flashcards";

export interface DailyTask {
  id: DailyTaskId;
  done: boolean;
}
