/**
 * The "Hi! What can I help you with?" bubble beside the KruAI button.
 *
 * It exists because a new student does not know what the round bot button in
 * the corner is. It stops for good the moment they have found it (tapped the
 * button or the bubble, or closed the bubble with ×), and otherwise appears on
 * at most MAX_SHOWS app opens, so a student who simply ignores it is not
 * greeted by it forever.
 *
 * A DEVICE fact, not account data, for the same reasons lib/intro-seen.ts and
 * lib/install-prompt.ts give: as a store field it would sync to Supabase and be
 * wiped by logout(). Its own key, every access wrapped, because storage can be
 * missing or throw (private mode), in which case the bubble just shows again.
 */

const STORAGE_KEY = "brachnha-kruai-hint";
const MAX_SHOWS = 3;

interface HintState {
  shows: number;
  done: boolean;
}

/**
 * Module scope, not component state: FabChat unmounts whenever the chat opens
 * or an assessment hides the mentor, and remounting must not greet the student
 * a second time in the same visit.
 */
let shownThisLoad = false;

function read(): HintState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { shows: 0, done: false };
    const parsed = JSON.parse(raw) as Partial<HintState>;
    return {
      shows: typeof parsed.shows === "number" ? parsed.shows : 0,
      done: parsed.done === true,
    };
  } catch {
    return { shows: 0, done: false };
  }
}

function write(state: HintState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Nothing to do: the worst case is the bubble showing again next time.
  }
}

export function shouldShowKruAiHint(): boolean {
  if (shownThisLoad) return false;
  const s = read();
  return !s.done && s.shows < MAX_SHOWS;
}

/** Called when the bubble actually appears, not when it is scheduled. */
export function recordKruAiHintShown(): void {
  shownThisLoad = true;
  const s = read();
  write({ ...s, shows: s.shows + 1 });
}

/** The student has found KruAI; never show the bubble again. */
export function markKruAiFound(): void {
  shownThisLoad = true;
  const s = read();
  if (!s.done) write({ ...s, done: true });
}
