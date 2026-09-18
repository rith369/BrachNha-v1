import { Navigate, useParams } from "react-router";
import { deckFor, quizFor } from "@/data/practice";
import { findSubject } from "@/features/lessons/subjects";
import { chaptersFor, lessonHeading } from "@/features/lessons/sessions";
import { keyFromRef, parseMode } from "@/features/practice/practice";
import { findQuizSection } from "@/features/practice/quiz-path";
import { FlashcardRunner } from "@/features/practice/components/flashcard-runner";
import { QuizScreen } from "@/features/practice/components/quiz-screen";

/**
 * `/practice/:mode/:subjectId/:lessonRef` — the deck or the quiz.
 *
 * FOUR segments, not three, so this cannot collide with the lesson-list route
 * one level up. That is the same ambiguity pages/subject-path.tsx documents for
 * `/lessons/:lessonId` versus a bare `/lessons/:subjectId`: two patterns
 * matching one segment resolve the wrong way sooner or later.
 *
 * A FOCUS ROUTE — utils/focus-routes.ts hides the navigation here — but NOT an
 * assessment route, so KruAI stays reachable. Asking "why is this the answer?"
 * mid-practice is the product working, the same rule a lesson gets. See the
 * header of quiz-runner.tsx for why that is answered by the pathname rather than
 * by the store's `focusMode` flag.
 *
 * NO SCROLLER AND NO BottomNav here, unlike the two pages above: the runners
 * bring FocusLayout's own scroller, and nesting two costs a scroll-chaining
 * resolution on every touch drag before anything moves.
 *
 * Anything malformed — unknown mode, unknown subject, a lessonRef that isn't
 * two numbers, or a lesson with no content written — redirects rather than
 * rendering an empty runner. The content check is the same DERIVED rule the rest
 * of the feature uses: playability is read from the data, never authored.
 */
export default function PracticeRunPage() {
  const { mode, subjectId, lessonRef } = useParams<{
    mode: string;
    subjectId: string;
    lessonRef: string;
  }>();

  const parsed = parseMode(mode);
  const subject = findSubject(subjectId);
  if (!parsed || !subject) return <Navigate to="/practice" replace />;

  const key = keyFromRef(subject.id, lessonRef);
  if (!key) return <Navigate to={`/practice/${parsed}/${subject.id}`} replace />;

  // The name for the completion screen, taken from THE SAME structure the list
  // or path was built from, so the two cannot disagree about what this is
  // called. lessonHeading() prefixes "មេរៀនទី N", matching how the Study path
  // and the lesson list both name a lesson; anything unfound falls back to the
  // bare subject name.
  //
  // TWO SOURCES, and which one is right depends on the SUBJECT, not on the
  // shape of the ref. A subject with a quiz path (math, physics) has its own
  // curriculum in features/practice/quiz-path.ts, and reading chaptersFor() for
  // math returns the FOUNDATION review path instead — which is how a Bac II
  // limits quiz came to be captioned "មេរៀនទី 1 · ប្រមាណវិធីបូក ដក គុណ ចែក".
  // Biology's future lesson quiz has no quiz path and must keep the
  // chaptersFor() lookup, so the branch cannot key on "the ref has three
  // numbers".
  const onQuizPath = parsed === "quiz" ? findQuizSection(subject.id, key) : null;
  const [chapterNo, lessonNo] = lessonRef!.split("-").map(Number);
  const foundLesson = chaptersFor(subject.id)
    .find((c) => c.number === chapterNo)
    ?.lessons.find((l) => l.number === lessonNo);

  const title = onQuizPath
    ? // The SECTION's name when it has one — "មេរៀនទី 1 · ប្រមាណវិធីលើលីមីត"
      // says more than the lesson alone and is what the student just tapped.
      // Three levels deep would not fit the summary screen's text-xs line at
      // 320px, so the section replaces the lesson name rather than following it.
      lessonHeading(
        onQuizPath.lesson.number,
        onQuizPath.section.title || onQuizPath.lesson.title
      )
    : foundLesson
      ? lessonHeading(foundLesson.number, foundLesson.title)
      : subject.name;

  if (parsed === "flashcards") {
    // Gate on the OFFICIAL deck only, matching practiceLessonsFor()'s `count` —
    // the same reason a lesson with nothing official written is a dimmed row,
    // never a <Link>, on the list one level up. A student's own cards live
    // alongside an official deck, not as a substitute for one; FlashcardRunner
    // reads both once it's actually rendered.
    if (deckFor(key).length === 0) {
      return <Navigate to={`/practice/flashcards/${subject.id}`} replace />;
    }
    return (
      <FlashcardRunner
        deckKey={key}
        subjectId={subject.id}
        mode="flashcards"
        title={title}
      />
    );
  }

  const questions = quizFor(key);
  if (questions.length === 0) {
    return <Navigate to={`/practice/quiz/${subject.id}`} replace />;
  }
  // QuizScreen, not QuizRunner: a quiz section is a thing you can attempt more
  // than once, so it opens on its own detail screen — what is in it, how you
  // have done before, and the button that starts it — and ends on a review.
  // All three are one route, the same call PaperScreen makes.
  return (
    <QuizScreen
      questions={questions}
      subjectId={subject.id}
      contentKey={key}
      title={title}
    />
  );
}
