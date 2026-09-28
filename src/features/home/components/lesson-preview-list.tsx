import { Link } from "react-router";
import { ChevronRight, BookOpen, Sparkles, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBrachNhaStore } from "@/lib/store";
import { T } from "@/data/translations";
import { findSubject } from "@/features/lessons/subjects";
import { SUBJECT_STYLE } from "@/features/lessons/subject-styles";
import type { Lang } from "@/types";
import { useStudyFeed } from "../use-study-feed";
import {
  STUDY_FEED_SIZE,
  type RankedItem,
  type StudyReason,
} from "../study-feed";

/**
 * Home's Study card: continue where you left off, or — before anything has
 * been started — a recommendation. What goes in it and in what order is
 * features/home/study-feed.ts; this only draws it.
 *
 * It used to be a hand-written list of the legacy 7-step lessons, which is why
 * it never showed any of the newer sections, decks, quizzes or papers.
 */

const COPY = {
  en: {
    continueTitle: "Continue learning",
    recommendTitle: "Recommended for you",
    recommendNote: "Starting with the subjects you said are hard",
    seeAll: "See all →",
    empty: "You've finished everything written so far. More is coming soon.",
    kind: {
      section: "Lesson",
      flashcards: "Flashcard",
      quiz: "Quiz",
      paper: "Past paper",
    },
    reason: {
      continue: "Continue",
      review: "Review",
      next: "Next",
      recommended: "For you",
    },
  },
  km: {
    continueTitle: "បន្តការសិក្សា",
    recommendTitle: "ណែនាំសម្រាប់អ្នក",
    recommendNote: "ចាប់ផ្តើមពីមុខវិជ្ជាដែលអ្នកថាពិបាក",
    seeAll: "មើលទាំងអស់ →",
    empty: "អ្នកបានបញ្ចប់មាតិកាទាំងអស់ហើយ។ មាតិកាថ្មីនឹងមកដល់ឆាប់ៗ។",
    kind: {
      section: "មេរៀន",
      flashcards: "Flashcard",
      quiz: "Quiz",
      paper: "វិញ្ញាសា",
    },
    reason: {
      continue: "បន្ត",
      review: "រំលឹកឡើងវិញ",
      next: "បន្ទាប់",
      recommended: "ណែនាំ",
    },
  },
} satisfies Record<Lang, unknown>;

/** Chip colour per reason. Per-theme `--color-*` tints — text on a tint, not
 *  white on a fill — so no dark: override is needed. */
const REASON_CHIP: Record<StudyReason, string> = {
  continue: "bg-purple/15 text-purple",
  review: "bg-yellow/15 text-yellow",
  next: "bg-blue/15 text-blue",
  recommended: "bg-pink/15 text-pink",
};

export function LessonPreviewList() {
  const lang = useBrachNhaStore((s) => s.lang);
  const weaknesses = useBrachNhaStore((s) => s.userData.weaknesses);
  const feed = useStudyFeed();
  const c = COPY[lang];
  const items = feed.items.slice(0, STUDY_FEED_SIZE);
  const recommending = feed.mode === "recommend";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="font-heading flex min-w-0 items-center gap-1.5 text-sm font-extrabold">
          {recommending ? (
            <Sparkles className="size-4 shrink-0 text-purple" strokeWidth={2.5} />
          ) : (
            <BookOpen className="size-4 shrink-0 text-purple" strokeWidth={2.5} />
          )}
          <span className="truncate">
            {recommending ? c.recommendTitle : c.continueTitle}
          </span>
        </div>
        <Link to="/lessons" className="shrink-0 text-xs font-extrabold text-purple">
          {c.seeAll}
        </Link>
      </div>
      {recommending && (weaknesses?.length ?? 0) > 0 && (
        <div className="mb-2 text-[11px] font-bold text-muted">{c.recommendNote}</div>
      )}
      {items.length === 0 ? (
        <Card className="p-4 text-center text-xs font-bold text-muted">
          {c.empty}
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <StudyRow key={item.id} item={item} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}

function StudyRow({ item, lang }: { item: RankedItem; lang: Lang }) {
  const c = COPY[lang];
  const subject = findSubject(item.subject);
  const Icon: LucideIcon = subject?.icon ?? BookOpen;
  const style = SUBJECT_STYLE[item.subject];
  const kicker = [T[lang][item.subject], c.kind[item.kind], item.context]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link to={item.href} className="transition-transform active:scale-[0.98]">
      <Card className="flex-row items-center gap-3 p-3">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-full border ${style.card}`}
        >
          <Icon className={`size-4.5 ${style.text}`} strokeWidth={2.25} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[10px] font-bold text-muted">{kicker}</div>
          <div className="truncate text-sm font-extrabold">{item.title}</div>
          {item.progress !== null && item.reason !== "recommended" && (
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-purple/10">
              <div
                className="h-full rounded-full bg-mint"
                style={{ width: `${Math.round(item.progress * 100)}%` }}
              />
            </div>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${REASON_CHIP[item.reason]}`}
        >
          {c.reason[item.reason]}
        </span>
        <ChevronRight className="size-4.5 shrink-0 text-muted" />
      </Card>
    </Link>
  );
}
