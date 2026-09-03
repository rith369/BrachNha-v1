import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Check,
  Layers,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { FocusLayout, FocusButton } from "@/components/shell/focus-layout";
import { cn } from "@/utils/cn";
import { toKhmerDigits } from "@/utils/khmer-num";
import type { PracticeCard } from "@/types";
import type { PracticeMode } from "../practice";
import {
  cardsFor,
  deckProgress,
  dueCardsFor,
  importantCards,
  notRememberedCards,
  rememberedCards,
  type QueueCard,
} from "../review";
import { averageMockRetention } from "../mock-retention";
import { DeckProgressRing } from "./deck-progress-ring";
import { ReviewSession } from "./review-session";
import { FlashcardForm } from "./flashcard-form";

/** Spelled out per tone rather than assembled from the tone name — Tailwind
 *  cannot see a class built at runtime, the same rule SUBJECT_STYLE and
 *  Callout's TONE both follow. Tinted border + `/8` fill + coloured text, never
 *  a solid fill under white: these take the per-theme `--color-*` scale, so
 *  they are correct in dark with no `dark:` override. */
const PILE_TONE = {
  mint: "border-mint/25 bg-mint/8 text-mint",
  pink: "border-pink/25 bg-pink/8 text-pink",
  yellow: "border-yellow/25 bg-yellow/8 text-yellow",
} as const;

const PILE_HOVER = {
  mint: "hover:bg-mint/15",
  pink: "hover:bg-pink/15",
  yellow: "hover:bg-yellow/15",
} as const;

/** The three piles, as an id — the URL-free equivalent of a route param. One
 *  union rather than three booleans so "which pile is open" can only ever have
 *  one answer. */
type PileId = "remembered" | "notRemembered" | "important";

/**
 * One of the three piles on the intro screen. These REPLACED a due/new/total
 * readout that sat in the same place: three numbers a student could look at and
 * do nothing with. A pile is the way INTO a specific set of cards, which is
 * what this screen is actually for — "let me do the ones I didn't remember"
 * on the student's own initiative rather than only when the scheduler offers
 * them. It is also the other half of the change that stopped "again" requeuing
 * a card inside the same sitting (see AGAIN_INTERVAL_DAYS in
 * utils/spaced-repetition.ts): the card comes back later, and this is the
 * "later" the student controls.
 *
 * TAPPING ONE OPENS ITS LIST, NOT A REVIEW. It used to drop straight into the
 * cards; a student asked to see WHAT is in a pile first and then choose, which
 * is also what makes a single card reachable on its own. See PileList.
 *
 * AN EMPTY PILE IS A DIMMED <div>, NEVER A <button> — subject-card.tsx's
 * zero-lesson tile, the survey's StudiedStep and sidebar-nav.tsx's `href: null`
 * rows all make the same call: a control that answers a tap with silence reads
 * as broken, so it must not look tappable.
 */
function PileButton({
  count,
  label,
  tone,
  icon: Icon,
  onOpen,
}: {
  count: number;
  label: string;
  tone: keyof typeof PILE_TONE;
  icon: LucideIcon;
  onOpen: () => void;
}) {
  const body = (
    <>
      <Icon className="mx-auto mb-0.5 size-4" strokeWidth={2.5} />
      <div className="text-lg font-extrabold">{toKhmerDigits(count)}</div>
      <div className="text-[10px] font-bold text-muted">{label}</div>
    </>
  );
  const base = cn("rounded-xl border p-2.5 text-center", PILE_TONE[tone]);

  if (count === 0) {
    return <div className={cn(base, "opacity-45")}>{body}</div>;
  }
  return (
    <button
      onClick={onOpen}
      className={cn(base, "transition active:scale-[0.97]", PILE_HOVER[tone])}
    >
      {body}
    </button>
  );
}

/**
 * ONE PILE'S QUESTIONS, as a list, sitting between the intro and a review.
 *
 * The three piles used to drop straight into the cards. This screen is what a
 * student asked for instead: open a pile and SEE what is in it, then choose —
 * ចាប់ផ្តើម runs the whole pile in order, or tapping any one question reviews
 * just that card. It replaced the separate កាតសំខាន់ list that used to sit on
 * the intro: that list showed the starred cards but could not open them, and
 * the សំខាន់ pile now does both, so keeping both would have been two places
 * showing one thing.
 *
 * A ROW IS A REAL <button> AND THE STAR IS ITS SIBLING, never nested inside it
 * — a button inside a button is invalid, and the star has to stay independently
 * tappable so a card can be starred or un-starred from the list without opening
 * it. Same split the "your own cards" rows below already use for edit/delete.
 *
 * The X exits the lesson entirely and the ◀ steps back to the intro, which is
 * FocusLayout's own exit-versus-back distinction rather than a new one.
 */
function PileList({
  cards,
  label,
  tone,
  icon: Icon,
  starredCards,
  onToggleStar,
  onStartAll,
  onOpenCard,
  onBack,
  onExit,
}: {
  cards: QueueCard[];
  label: string;
  tone: keyof typeof PILE_TONE;
  icon: LucideIcon;
  starredCards: string[];
  onToggleStar: (id: string) => void;
  onStartAll: () => void;
  onOpenCard: (card: QueueCard) => void;
  onBack: () => void;
  onExit: () => void;
}) {
  return (
    <FocusLayout
      progressPct={0}
      onExit={onExit}
      onBack={onBack}
      showStats
      footer={
        <FocusButton onClick={onStartAll} disabled={cards.length === 0}>
          ចាប់ផ្តើម ({toKhmerDigits(cards.length)})
        </FocusButton>
      }
    >
      <div className="mb-4 text-center">
        <Icon
          className={cn("mx-auto mb-2 size-9", PILE_TONE[tone].split(" ").at(-1))}
          strokeWidth={2}
        />
        <div className="font-heading text-lg font-extrabold text-text">
          {label}
        </div>
      </div>

      {/* Only reachable by grading a card out of the pile you are standing in —
          an empty pile's tile is a dimmed div and cannot be tapped in the first
          place. Says so plainly rather than showing an empty screen. */}
      {cards.length === 0 && (
        <div className="rounded-xl border border-dashed border-purple/20 p-4 text-center text-xs font-bold text-muted">
          គ្មានកាតនៅក្នុងផ្នែកនេះទេ
        </div>
      )}

      {cards.map((qc) => (
        <div
          key={qc.card.id}
          className={cn(
            "mb-2 flex items-center gap-2 rounded-xl border p-3",
            PILE_TONE[tone]
          )}
        >
          <button
            onClick={() => onOpenCard(qc)}
            className="min-w-0 flex-1 text-left text-xs font-bold text-text transition active:scale-[0.99]"
          >
            {qc.card.front}
          </button>
          <button
            onClick={() => onToggleStar(qc.card.id)}
            aria-label={
              starredCards.includes(qc.card.id)
                ? "លុបចេញពីសំខាន់"
                : "សម្គាល់ថាសំខាន់"
            }
            aria-pressed={starredCards.includes(qc.card.id)}
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-yellow/15 hover:text-yellow"
          >
            <Star
              className={cn(
                "size-3.5",
                starredCards.includes(qc.card.id) && "fill-current text-yellow"
              )}
              strokeWidth={2.5}
            />
          </button>
        </div>
      ))}
    </FocusLayout>
  );
}

/**
 * A lesson's flashcard screen. THREE phases, one component:
 *
 *   "intro"  — the three piles, this student's own cards (add/edit/delete),
 *              a mock retention line, and the Start Review button
 *   "review" — delegates entirely to ReviewSession (shared with Daily Review)
 *   (exit)   — ReviewSession's own "done" screen handles the end
 *
 * DUE-NESS PRIORITISES, IT NEVER GATES. The scheduler still decides what's
 * due, but the Start button is never disabled while there's ANY card in the
 * deck — tapping it reviews the due cards when there are some, and falls back
 * to the WHOLE deck when there aren't, rather than blocking the student until
 * a date arrives. A student who wants to restudy something they already know
 * well should always be able to, the same way nothing else in this app locks
 * a lesson behind a timer. See the `startQueue` comment below for exactly
 * where that fallback happens.
 *
 * FOCUS MODE COMES FROM THE ROUTE, not the store's `focusMode` flag — see
 * utils/focus-routes.ts's isPracticeRunRoute for why: this hides navigation
 * but KEEPS KruAI, the same rule a lesson gets, and removes the cleanup-effect
 * failure mode ExamRunner's own flag needs to guard against.
 *
 * TAKES A deckKey, NOT a `cards` ARRAY. The runner needs to combine the
 * official deck with this student's own cards and pair both with live review
 * state from the store — reading `deckFor()` here directly (via cardsFor in
 * ../review) rather than have the caller assemble that is what keeps
 * pages/practice-run.tsx a thin route resolver instead of duplicating this
 * lookup.
 *
 * KHMER-ONLY. See PRACTICE_PAGE_LANG in ../practice.
 */
export function FlashcardRunner({
  deckKey,
  subjectId,
  mode,
  title,
}: {
  deckKey: string;
  subjectId: string;
  /** Carried only so the X returns to the list the student came from. */
  mode: PracticeMode;
  /** The lesson's name, shown on the completion screen. */
  title: string;
}) {
  const navigate = useNavigate();
  const {
    studentCards,
    cardReviews,
    starredCards,
    toggleStarredCard,
    addStudentCard,
    updateStudentCard,
    deleteStudentCard,
  } = useBrachNhaStore(
    useShallow((s) => ({
      studentCards: s.studentCards,
      cardReviews: s.cardReviews,
      starredCards: s.starredCards,
      toggleStarredCard: s.toggleStarredCard,
      addStudentCard: s.addStudentCard,
      updateStudentCard: s.updateStudentCard,
      deleteStudentCard: s.deleteStudentCard,
    }))
  );

  // The queue being reviewed, or null while on the intro. It holds the CARDS
  // rather than a boolean because there are now four ways in — the main Start
  // button and the three piles — and each opens a different set. ReviewSession
  // snapshots whatever it is handed, so passing the array directly is also what
  // keeps the session from resizing under itself as grading rewrites the store.
  const [session, setSession] = useState<QueueCard[] | null>(null);
  // Which pile's list is open, or null on the intro. A separate piece of state
  // from `session` rather than a single "screen" enum, because the two nest:
  // finishing a review that was started FROM a pile returns to that pile's
  // list, not to the intro, which is only expressible if the pile outlives the
  // session.
  const [pile, setPile] = useState<PileId | null>(null);
  // "new" = the add form; a PracticeCard = editing that card; null = closed.
  const [editing, setEditing] = useState<PracticeCard | "new" | null>(null);
  // Two-tap delete, matching Profile's Logout and the chat's delete-conversation.
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function exit() {
    navigate(`/practice/${mode}/${subjectId}`);
  }

  const all = cardsFor(deckKey, studentCards, cardReviews);
  const due = dueCardsFor(deckKey, studentCards, cardReviews);
  const mine = all.filter((qc) => qc.card.source === "student");
  const retention = averageMockRetention(all.map((qc) => qc.state));

  // The three piles the buttons below open. Derived on every render off the
  // same `all` the counts are read from, so a pile's number and the cards its
  // tap actually queues can never be two different things.
  const remembered = rememberedCards(all);
  const notRemembered = notRememberedCards(all);
  const important = importantCards(all, starredCards);

  // THE FALLBACK THAT REMOVES THE GATE. Due cards first when there are any;
  // otherwise the WHOLE deck, so "Start Review" always has something to open
  // rather than sitting disabled until a scheduled date arrives. Grading
  // still updates each card's real due date either way — reviewing early
  // just means it's judged again from wherever it already was, the same as
  // reviewing it any other day.
  const startQueue = due.length > 0 ? due : all;

  const PILES = {
    remembered: { cards: remembered, label: "ចងចាំ", tone: "mint", icon: Check },
    notRemembered: {
      cards: notRemembered,
      label: "មិនទាន់ចងចាំ",
      tone: "pink",
      icon: X,
    },
    important: { cards: important, label: "សំខាន់", tone: "yellow", icon: Star },
  } as const;

  // A review opened FROM a pile returns to that pile's list when it ends,
  // rather than all the way out to the lesson list — the student was working
  // through a pile and that is where the next choice is. The main Start button
  // leaves `pile` null and so still exits the lesson as before.
  if (session) {
    return (
      <ReviewSession
        queue={session}
        title={title}
        // Recomputed on every render from the store, so by the time the
        // summary reads it, it already includes the grades just made.
        progress={deckProgress(all)}
        onExit={pile ? () => setSession(null) : exit}
      />
    );
  }

  if (pile) {
    const p = PILES[pile];
    return (
      <PileList
        cards={p.cards}
        label={p.label}
        tone={p.tone}
        icon={p.icon}
        starredCards={starredCards}
        onToggleStar={toggleStarredCard}
        onStartAll={() => setSession(p.cards)}
        onOpenCard={(qc) => setSession([qc])}
        onBack={() => setPile(null)}
        onExit={exit}
      />
    );
  }

  return (
    <FocusLayout
      progressPct={0}
      onExit={exit}
      showStats
      footer={
        <FocusButton
          onClick={() => setSession(startQueue)}
          disabled={all.length === 0}
        >
          {due.length > 0
            ? `ចាប់ផ្តើមពិនិត្យ (${toKhmerDigits(due.length)})`
            : all.length > 0
              ? `ពិនិត្យម្តងទៀត (${toKhmerDigits(all.length)})`
              : "គ្មានកាតនៅឡើយទេ"}
        </FocusButton>
      }
    >
      <div className="text-center">
        {/* THE RING REPLACES a decorative Layers icon that used to sit here.
            Same position, same job as a visual anchor, except it answers "how
            am I doing on this lesson" instead of just marking the screen as a
            deck. The icon is still the fallback for a deck with no cards,
            where a 0% ring would be measuring nothing. */}
        {all.length > 0 ? (
          <div className="mb-3 flex justify-center">
            <DeckProgressRing progress={deckProgress(all)} legend={false} />
          </div>
        ) : (
          <Layers className="mx-auto mb-3 size-12 text-purple" strokeWidth={2} />
        )}
        <div className="font-heading mb-4 bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent">
          {title}
        </div>

        {/* Three PILES, not the due/new/total readout that used to sit here —
            those were numbers with nothing to do about them. Each of these
            opens the LIST of exactly the cards it counts. See PileButton. */}
        <div className="mx-auto grid max-w-xs grid-cols-3 gap-2">
          <PileButton
            count={remembered.length}
            label="ចងចាំ"
            tone="mint"
            icon={Check}
            onOpen={() => setPile("remembered")}
          />
          <PileButton
            count={notRemembered.length}
            label="មិនទាន់ចងចាំ"
            tone="pink"
            icon={X}
            onOpen={() => setPile("notRemembered")}
          />
          <PileButton
            count={important.length}
            label="សំខាន់"
            tone="yellow"
            icon={Star}
            onOpen={() => setPile("important")}
          />
        </div>

        {/* MOCK — see mock-retention.ts. Labelled "ប្រហាក់ប្រហែល" (approximate)
            so it reads as an estimate, never a fact, and only shown once at
            least one card in this deck has actually been reviewed. */}
        {retention !== null && (
          <div className="mt-3 text-xs font-bold text-muted">
            ប្រូបាបចងចាំប្រហាក់ប្រហែល ~{toKhmerDigits(retention)}%
          </div>
        )}
      </div>

      {/* This student's own cards for this lesson — separate from the official
          deck above, editable/deletable only here. */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-extrabold text-text">កាតរបស់អ្នក</div>
          {editing === null && (
            <button
              onClick={() => setEditing("new")}
              className="flex items-center gap-1 rounded-full border border-purple/20 bg-purple/8 px-2.5 py-1 text-[11px] font-extrabold text-purple"
            >
              <Plus className="size-3.5" strokeWidth={2.5} />
              បន្ថែម
            </button>
          )}
        </div>

        {mine.length === 0 && editing === null && (
          <div className="rounded-xl border border-dashed border-purple/20 p-3 text-center text-xs font-bold text-muted">
            អ្នកមិនទាន់មានកាតផ្ទាល់ខ្លួននៅឡើយទេ
          </div>
        )}

        {mine.map((qc) =>
          confirmDeleteId === qc.card.id ? (
            <div
              key={qc.card.id}
              className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-pink/25 bg-pink/8 p-3"
            >
              <div className="text-xs font-bold text-pink">លុបកាតនេះ?</div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="rounded-lg border border-purple/20 px-2.5 py-1 text-[11px] font-extrabold text-purple"
                >
                  ទេ
                </button>
                <button
                  onClick={() => {
                    deleteStudentCard(deckKey, qc.card.id);
                    setConfirmDeleteId(null);
                  }}
                  className="rounded-lg bg-pink px-2.5 py-1 text-[11px] font-extrabold text-white"
                >
                  លុប
                </button>
              </div>
            </div>
          ) : (
            <div
              key={qc.card.id}
              className="mb-2 flex items-center gap-2 rounded-xl border border-purple/10 bg-surface p-3"
            >
              <div className="min-w-0 flex-1 truncate text-left text-xs font-bold text-text">
                {qc.card.front}
              </div>
              <button
                onClick={() => setEditing(qc.card)}
                aria-label="កែសម្រួល"
                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-purple/8 hover:text-purple"
              >
                <Pencil className="size-3.5" strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setConfirmDeleteId(qc.card.id)}
                aria-label="លុប"
                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-pink/8 hover:text-pink"
              >
                <Trash2 className="size-3.5" strokeWidth={2.5} />
              </button>
            </div>
          )
        )}

        {editing !== null && (
          <FlashcardForm
            card={editing === "new" ? undefined : editing}
            onCancel={() => setEditing(null)}
            onSave={(front, back) => {
              if (editing === "new") {
                addStudentCard(deckKey, front, back);
              } else {
                updateStudentCard(deckKey, editing.id, front, back);
              }
              setEditing(null);
            }}
          />
        )}
      </div>
    </FocusLayout>
  );
}
