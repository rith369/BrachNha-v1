import { useState } from "react";
import { Hourglass, Share2 } from "lucide-react";
import { Link } from "react-router";
import { useBrachNhaStore } from "@/lib/store";
import { findSubject } from "@/features/lessons/subjects";
import { SUBJECT_STYLE } from "@/features/lessons/subject-styles";
import { cn } from "@/utils/cn";
import { DIFFICULTIES } from "../game";
import { gameCopy, num, relativeDay } from "../copy";
import { InvitePanel } from "./invite-panel";

/**
 * The competitions this student has POSTED, newest first.
 *
 * It sits where "Challenge Someone 👊" used to be and wears that card's row
 * shape, but it is not that list: the original showed invented classmates with
 * ranks, an Online dot and a Play button that did nothing.
 *
 * TWO THINGS BEHIND A ROW NOW — its review, and its invite — which is why the
 * row is a `<Link>` and the Invite button is its SIBLING rather than a child. A
 * button inside a link is invalid markup, and the invite has to stay
 * independently tappable so a student can hand the link over without first
 * opening the answers. Same split PileList's rows already use for their star.
 *
 * THIS IS WHERE THE INVITE ACTUALLY LIVES. It shipped on the "Competition
 * created!" screen alone, which meant it existed for about ten seconds and was
 * then unreachable forever — and the real moment is not creation, it is later,
 * when the friend is standing there. Two taps from opening the app.
 *
 * DELIBERATELY NOT ONLY ON THE REVIEW PAGE, which would have been the tidier
 * home: that screen asks for a photo of your working before it shows anything,
 * so the one route to the invite would have sat behind a gate that has nothing
 * to do with sending someone a link.
 *
 * The caller renders nothing when the list is empty.
 */
export function MyCompetitions() {
  const lang = useBrachNhaStore((s) => s.lang);
  const competitions = useBrachNhaStore((s) => s.competitions);
  const t = gameCopy(lang);
  const rows = [...competitions].reverse();

  // ONE id rather than a set: two QR codes open at once is two things to scan
  // and no way to tell which is which. Opening one closes the other.
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="font-heading text-sm font-extrabold">
          {t.myCompetitions}
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {rows.map((c) => {
          const subject = findSubject(c.subject);
          const style = subject ? SUBJECT_STYLE[subject.id] : null;
          const difficulty = DIFFICULTIES.find((d) => d.id === c.difficulty);
          const open = openId === c.id;

          return (
            // The CARD is the outer div now, so the expanded panel sits inside
            // the same rounded box as the row that opened it rather than
            // floating beneath it. overflow-hidden keeps the divider from
            // escaping the corners.
            <div
              key={c.id}
              className="overflow-hidden rounded-2xl border border-purple/10 bg-surface shadow-panel-sm"
            >
              <div className="flex items-center gap-2 p-3">
                <Link
                  to={`/game/review/${c.id}`}
                  // The negative margin lets the hover tint have its own rounded
                  // shape inside the card's padding instead of squaring off
                  // against it.
                  className="-m-1 flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 transition hover:bg-purple/5"
                >
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-full border-2",
                      style ? style.card : "border-purple/20 bg-control"
                    )}
                  >
                    <Hourglass
                      className={cn("size-5", style ? style.text : "text-muted")}
                      strokeWidth={2.5}
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-extrabold">
                      {subject?.name ?? ""}
                    </div>
                    <div className="truncate text-[10px] font-bold text-muted">
                      {difficulty?.label[lang]} · {relativeDay(c.createdAt, lang)}
                    </div>
                    {/* THE SHARED STATUS MOVED ONTO THIS LINE, off the right
                        edge where it used to sit. At the 320px floor it was
                        eating ~90px, and with a button now beside it the
                        subject name was left with room for about six
                        characters. It wraps rather than truncating, because
                        "Not shared yet" is the one thing on the row a student
                        must be able to read in full. */}
                    <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] font-extrabold text-muted">
                      <span>
                        ⏱ {num(c.minutes, lang)} {t.minutes}
                      </span>
                      <span>
                        {num(c.questions.length, lang)} {t.questions}
                      </span>
                      {/* A competition that never reached the server is NOT open
                          for joiners — nobody can see it. Saying so is the whole
                          point of Competition.sharedAt; share-pending.ts keeps
                          retrying until this flips. */}
                      <span className="flex items-center gap-1 font-bold">
                        <span
                          className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            c.sharedAt ? "bg-yellow" : "bg-muted/50"
                          )}
                        />
                        {c.sharedAt ? t.openForJoiners : t.notShared}
                      </span>
                    </div>
                  </div>

                  <div className="font-heading shrink-0 text-sm font-extrabold text-purple">
                    {num(c.creatorScore, lang)}/{num(c.total, lang)}
                  </div>
                </Link>

                {/* ABSENT, never disabled, on a competition that never reached
                    the server: its link would land the friend on "no longer
                    available" — a failure that surfaces on the OTHER student's
                    phone, minutes later, with nothing to explain it. Same gate
                    the posted screen applies. */}
                {c.sharedAt && (
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : c.id)}
                    aria-expanded={open}
                    className={cn(
                      "flex shrink-0 items-center gap-1 rounded-xl border px-2 py-1.5 text-[10px] font-extrabold transition",
                      open
                        ? "border-purple/40 bg-purple/15 text-purple"
                        : "border-purple/20 bg-purple/8 text-purple hover:bg-purple/15"
                    )}
                  >
                    <Share2 className="size-3.5 shrink-0" strokeWidth={2.5} />
                    {t.inviteShort}
                  </button>
                )}
              </div>

              {/* Rendered only while open, which is also what keeps the QR
                  encoder off the wire until someone actually asks for it — see
                  the lazy boundary in invite-qr.tsx. */}
              {open && (
                <div className="border-t border-purple/10 p-3">
                  <InvitePanel
                    competitionId={c.id}
                    // The row already IS a card; without this the panel draws a
                    // second one inside it. cn() is twMerge, so these win.
                    className="border-0 bg-transparent p-0 shadow-none"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
