import { useState } from "react";
import { LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatPills } from "@/features/home/components/stat-pills";
import { GoogleButton } from "@/features/auth/components/google-button";
import { ProfileIdentity } from "./profile-identity";
import { StudyCalendar } from "./study-calendar";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/hooks/use-auth";
import { useT } from "@/data/translations";
import type { TranslationKey } from "@/data/translations";
import { signOutAccount } from "@/lib/auth";

export function ProfileView() {
  const { lang, userLanguage, userData, setStudyLanguage, logout } =
    useBrachNhaStore(
      useShallow((s) => ({
        lang: s.lang,
        userLanguage: s.userLanguage,
        userData: s.userData,
        setStudyLanguage: s.setStudyLanguage,
        logout: s.logout,
      }))
    );
  const t = useT(lang);
  const { isGuest } = useAuth();
  const [confirming, setConfirming] = useState(false);

  // What the app is ACTUALLY doing, not what was stored. A guest never sets
  // this, and allSubjects() (features/lessons/subjects.ts) falls back to
  // English for "" — so showing neither chip selected would have the control
  // disagree with every subject list in the app.
  const effectiveLanguage = userLanguage || "english";

  /**
   * Ends the Supabase session as well as clearing the store. The two used to be
   * coupled by inference — the sync hook watched for `userName` going empty and
   * concluded a logout had happened — which works only while a session and a
   * name mean the same thing, and stops working the day this app has a real
   * login. See signOutAccount in lib/auth.ts.
   *
   * Not awaited: the store clear is what the student can see, and making them
   * watch a spinner on Cambodian mobile data before their own logout takes
   * effect would be the wrong trade. signOutAccount never throws and signs out
   * LOCALLY, so it needs no network to succeed.
   */
  function confirmLogout() {
    void signOutAccount();
    logout();
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-36 lg:pb-10">
      {/* The title alone carries pr-14 — it shares a row with the floating
          hamburger. The identity row sits below that button, so it gets the
          full width for a long name. */}
      <div className="mb-4 pr-14">
        <div className="font-heading bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent">
          {t.yourProfile} 🎓
        </div>
      </div>

      <div className="mb-5">
        <ProfileIdentity />
      </div>

      <div className="mb-4">
        <StatPills />
      </div>

      <div className="mb-4">
        <StudyCalendar />
      </div>

      <Card className="mb-4">
        <div className="flex items-center justify-between text-sm font-bold">
          <span className="text-muted">
            {lang === "en" ? "Target Grade" : "ពិន្ទុគោលដៅ"}
          </span>
          <span>{userData.grade || "—"}</span>
        </div>
        {/* A SWITCHER, not the read-only row this used to be.
            userLanguage decides whether English or French appears as a subject
            across Study, Practice, the exam tabs and grade prediction, and it
            was only ever settable on the login form. A guest never sees that
            form, so allSubjects() fell back to English for them with no way to
            change it — a French-track student was stuck. Signed-in students get
            the same benefit: a wrong choice at signup is now fixable. */}
        <div className="flex items-center justify-between gap-3 text-sm font-bold">
          <span className="text-muted">{t.studyLanguage}</span>
          <div className="flex gap-1.5">
            {(["english", "french"] as const).map((choice) => (
              <button
                key={choice}
                onClick={() => setStudyLanguage(choice)}
                className={
                  "rounded-full border px-3 py-1 text-xs font-extrabold transition " +
                  (effectiveLanguage === choice
                    ? "border-blue/40 bg-blue/10 text-blue"
                    : "border-purple/10 bg-surface text-muted hover:bg-purple/5")
                }
              >
                {t[choice as TranslationKey]}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* The upgrade path. The login prompt only appears when a guest reaches a
          locked feature, so without this there is no way to sign in from inside
          the app for someone who simply decided they want an account. */}
      {isGuest && (
        <Card className="mb-4">
          <div>
            <div className="mb-0.5 text-sm font-extrabold">
              {t.guestModeLabel}
            </div>
            <div className="text-xs font-bold text-muted">
              {t.guestModeNote}
            </div>
          </div>
          <GoogleButton variant="outline" />
        </Card>
      )}

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-pink/30 bg-pink/8 px-6 py-3.5 text-sm font-extrabold text-pink"
        >
          <LogOut className="size-4" strokeWidth={2.5} />
          {isGuest
            ? t.exitGuestMode
            : lang === "en"
              ? "Logout"
              : "ចាកចេញ"}
        </button>
      ) : (
        <div className="rounded-2xl border border-pink/30 bg-pink/5 p-4 text-center">
          <div className="mb-3 text-sm font-bold">
            {/* The two branches are deliberately unequal. A signed-in student
                gets a plain question: signing back in restores their progress,
                and the old list of everything being cleared from the device
                read as a threat of losing it. (All but the flashcard review
                data, which never leaves the device — see CLAUDE.md. That gap
                is fixed by syncing it, not by warning about it here.) A guest
                keeps the full warning, because for them it is not a threat:
                there is no backup, and this is the last screen that can say so. */}
            {isGuest
              ? t.exitGuestConfirm
              : lang === "en"
                ? "Are you sure you want to log out?"
                : "តើអ្នកប្រាកដថាចង់ចាកចេញមែនទេ?"}
          </div>
          {/* A guest who wants an account can mistake "exit" for the way to
              get one — and it is the one button that destroys the progress
              signing in would have carried over. The Google button sits in
              the guest card directly above, so this points at it rather than
              rendering a second one inside a box already holding two. */}
          {isGuest && (
            <div className="mb-3 text-xs font-bold text-purple">
              {t.exitGuestKeepHint}
            </div>
          )}
          <div className="flex gap-2.5">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-2xl border border-purple/20 bg-surface px-6 py-3 text-sm font-extrabold text-purple"
            >
              {lang === "en" ? "Cancel" : "បោះបង់"}
            </button>
            <button
              onClick={confirmLogout}
              className="flex-1 rounded-2xl bg-pink px-6 py-3 text-sm font-extrabold text-white"
            >
              {lang === "en"
                ? isGuest
                  ? "Yes, reset"
                  : "Yes, log out"
                : "យល់ព្រម"}
            </button>
          </div>
        </div>
      )}

      {/*
        LOAD-BEARING, NOT DECORATION. The subject illustrations in
        public/subjects/ are Freepik free-licence downloads, and that licence
        grants the right to use them ONLY on condition of a visible credit
        naming Freepik and linking to freepik.com. Delete this line and the app
        is using seven images with no licence behind them.

        The string "Designed by Freepik" and the link target are the licence's
        wording, not ours — do not translate or reword them. The small label in
        front of it is ours, so it follows the app's language.

        It can go only if the artwork does: swapping in attribution-free art
        (unDraw, Pixabay, Pexels) or re-downloading these under a Freepik
        premium subscription would both remove the requirement. See
        design/subjects.md.
      */}
      <div className="pt-2 pb-1 text-center text-[10px] font-semibold text-muted">
        {lang === "en" ? "Illustrations: " : "រូបភាព៖ "}
        <a
          href="https://www.freepik.com"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-purple/40 underline-offset-2 hover:text-purple"
        >
          Designed by Freepik
        </a>
      </div>
    </div>
  );
}
