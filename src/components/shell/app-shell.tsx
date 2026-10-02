import { track } from "@/lib/telemetry";
import { lazy, Suspense, useEffect, useState } from "react";
import { Drawer } from "./drawer";
import { Sidebar } from "./sidebar-nav";
import { FabChat } from "./fab-chat";
import { AppHeader } from "./app-header";
import { LoginView } from "@/features/login/components/login-view";
import { SurveyView } from "@/features/survey/components/survey-view";
import { CommitmentOverlay } from "@/features/commitment/components/commitment-overlay";
import { AuthSplash } from "@/features/auth/components/auth-splash";
import { AuthPromptOverlay } from "@/features/auth/components/auth-prompt-overlay";
import { AccountConflictView } from "@/features/auth/components/account-conflict-view";
import { InstallPrompt } from "@/features/install/components/install-prompt";
import { hasSeenIntro, markIntroSeen } from "@/lib/intro-seen";
import { useBrachNhaStore } from "@/lib/store";
import { useSupabaseSync } from "@/hooks/use-supabase-sync";
import { useStudyTimer } from "@/hooks/use-study-timer";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useAuth } from "@/hooks/use-auth";

// The mentor pulls in KaTeX and its web fonts for typesetting replies. It is
// only mounted when chatOpen is true, but a static import would still ship all
// of it in the first-paint bundle — a real cost on Cambodian mobile data. This
// way the chunk downloads when the student first taps the chat button.
//
// Was next/dynamic with ssr:false; React.lazy is the direct equivalent here.
// The app is client-rendered, so the ssr flag has nothing left to turn off.
const ChatOverlay = lazy(() =>
  import("./chat-overlay").then((m) => ({ default: m.ChatOverlay }))
);

// The three "why science" screens. A new device sees them once and nobody
// sees them again, so they are split out rather than paid for by every
// student on every load: measured at +8KB gzipped on the entry chunk inline.
// The cost moves to one small fetch on a first visit, behind the same null
// fallback as the mentor.
const IntroView = lazy(() =>
  import("@/features/intro/components/intro-view").then((m) => ({
    default: m.IntroView,
  }))
);

// Not a phone mockup — no frame, notch, or status bar. This is just the app's
// outer container: full-bleed on a phone, then widening in steps so a laptop
// gets a real layout instead of a 512px ribbon down the middle of the screen.
//
// The ladder is max-w-lg (phone) → md:max-w-3xl (tablet) → lg:max-w-5xl
// (laptop). Everything inside is mobile-first, so a page only opts into the
// extra width where a wider layout actually reads better — see the page-level
// card grids. Widening here alone would just stretch cards, not improve them.
//
// `hideChrome` drops the hamburger and the Sidebar, leaving the page's own CTA
// as the only way forward. `hideMentor` drops the chat FAB. They are two props
// rather than one because a lesson wants them to disagree: no navigation, but
// the mentor still one tap away. ShellLayout decides both (it's the piece that
// knows the route); the defaults keep AppShell usable outside a router.
export function AppShell({
  children,
  hideChrome = false,
  hideMentor = false,
}: {
  children: React.ReactNode;
  hideChrome?: boolean;
  hideMentor?: boolean;
}) {
  const chatOpen = useBrachNhaStore((s) => s.chatOpen);
  const setChatOpen = useBrachNhaStore((s) => s.setChatOpen);
  const pledgeOpen = useBrachNhaStore((s) => s.pledgeOpen);
  const userName = useBrachNhaStore((s) => s.userName);
  const surveyed = useBrachNhaStore((s) => s.surveyed);
  const lang = useBrachNhaStore((s) => s.lang);
  const theme = useBrachNhaStore((s) => s.theme);
  const rolloverDailyTasks = useBrachNhaStore((s) => s.rolloverDailyTasks);
  const authPrompt = useBrachNhaStore((s) => s.authPrompt);
  const accountConflict = useBrachNhaStore((s) => s.accountConflict);

  // Resolves who is signed in. The ONLY onAuthStateChange subscriber in the
  // app, and mounted before the sync hook because the sync hook reads the
  // identity it publishes.
  useAuthSession();
  const { status, isAuthenticated, hasFullAccess } = useAuth();

  // The three "why science" screens. Read once from this device's own key (see
  // lib/intro-seen.ts), then held in state so finishing moves on at once.
  const [introSeen, setIntroSeen] = useState(hasSeenIntro);
  const finishIntro = () => {
    markIntroSeen();
    setIntroSeen(true);
  };

  // Keeps a signed-in student's store backed up to Supabase. Renders nothing
  // and returns nothing — mounted here rather than in a page because it has to
  // outlive every navigation, the same reason the chat conversation lives in
  // the store. A guest, an unconfigured project or an unreachable one all make
  // it a no-op, and the app stays entirely local: the supported state, not a
  // degraded one.
  useSupabaseSync();

  // Counts ACTIVE study minutes. Mounted here for the same reason the sync hook
  // is — it has to outlive every navigation, and a student moving between two
  // short sections would otherwise lose the part-minute each time. It is a
  // no-op on every screen that is not a study screen, which is most of them.
  useStudyTimer();

  // `tasks` is TODAY's checklist, and something has to be the thing that says
  // so. Mounted here rather than on Home because the daily rows are read from
  // three screens (Home's checklist, Roadmap's Daily Mission, the streak
  // pages) and a student can land on any of them first.
  //
  // On mount AND on every visibilitychange: a phone left open overnight never
  // remounts, so waking the tab is the only moment it gets to notice the date
  // changed. The action is a no-op when the day has not moved, so this costs
  // one string compare per wake and publishes no store update.
  useEffect(() => {
    rolloverDailyTasks();
    const onVisible = () => {
      if (document.visibilityState === "visible") rolloverDailyTasks();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [rolloverDailyTasks]);

  // One "app_open" per signed-in student per day (log_event() drops the
  // repeats, StrictMode's second pass included). Its daily count is the
  // app's daily active users, and day-7 return is read from it.
  useEffect(() => {
    if (isAuthenticated) track("app_open");
  }, [isAuthenticated]);

  // Hiding the FAB is not enough on its own. `chatOpen` is global and survives
  // navigation, so a student could open the mentor on the exam INTRO screen and
  // still have it sitting there once they tap Start. Close it as soon as the
  // mentor becomes off-limits.
  useEffect(() => {
    if (hideMentor && chatOpen) setChatOpen(false);
  }, [hideMentor, chatOpen, setChatOpen]);

  // index.html ships lang="en" because `lang` lives in the persisted store and
  // isn't known until React mounts; we correct the attribute here. Both "en"
  // and "km" are valid BCP-47 tags. (Under Next this same effect corrected the
  // server-rendered <html lang>; the reason changed, the fix didn't.)
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Same idea for the theme: index.html's inline script sets this class before
  // first paint from localStorage, and this effect keeps it in sync afterwards
  // when the student toggles. classList.toggle rather than className — <html>
  // also carries h-full and antialiased.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    // Keep the mobile browser chrome in step with the page it frames.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#100e18" : "#faf5ff");
  }, [theme]);

  return (
    // Phone and tablet stack vertically inside a centred column. From lg the
    // shell becomes a ROW — permanent sidebar beside the content — and drops the
    // narrow cap so the content actually fills a laptop. The 1600px ceiling
    // keeps an ultra-wide monitor from stretching cards to absurd widths, and
    // mx-auto centres what's left beyond it.
    <div className="relative mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden bg-bg md:max-w-3xl lg:max-w-[1600px] lg:flex-row">
      {/* ── The gate ───────────────────────────────────────────────────────
          A ternary chain, in strict priority order. Kept as JSX rather than
          early returns so nothing above it closes over a possibly-null
          `authUser` — see the React Compiler note in hooks/use-auth.ts.

          `hasFullAccess` is true when Supabase is unconfigured, which is what
          skips this whole chain for `npm run preview`, a fresh fork and
          scripts/shots.mjs: with no project there is no account to have, and
          the app behaves exactly as it did before auth existed.

          The last two conditions apply to AUTHENTICATED students only. A
          signed-out student is a guest and falls straight through to the app
          with no name and no survey, which is the point — and because their
          `surveyed` was never faked, signing in later walks them through it. */}
      {/* The splash covers the moment an OAuth callback is being resolved, so
         a student coming back from Google does not see Home flash before
         LoginView. With no auth traces the session settles in the mount
         effect, so for an ordinary guest this lasts one frame. A returning
         student with a name skips it: they render the app at once and only
         the locked features wait on the session. */
      status === "loading" && !hasFullAccess && !userName ? (
        <AuthSplash />
      ) : accountConflict ? (
        <AccountConflictView />
      ) : /* ── The intro ─────────────────────────────────────────────────────
             Once per device, then straight to Home as a guest. There is no
             entry screen: every signed-out student IS a guest, and signing in
             is offered where an account is needed (KruAI, Roadmap, Battle,
             Profile). Only someone who has not started yet sees the intro: no
             name, not signed in. That keeps every existing student, an OAuth
             callback and the screenshot harness's seeded profile clear of it
             with no extra condition. */
      !introSeen && !userName && !isAuthenticated ? (
        <Suspense fallback={null}>
          <IntroView onDone={finishIntro} />
        </Suspense>
      ) : hasFullAccess && !userName ? (
        <LoginView />
      ) : hasFullAccess && !surveyed ? (
        <SurveyView />
      ) : (
        <>
          {/* Hidden below lg by the component itself. hideChrome drops it too,
              so the roadmap's one-way onboarding stays one-way on desktop. */}
          {!hideChrome && <Sidebar />}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {/* THE APP BAR: level ring with XP progress, streak, coins and the
                menu button in one row (see app-header.tsx). XP/streak/coins are
                the app's gamification loop, so it is on every ordinary page.
                Gated on `!hideChrome` like the Sidebar: focus tasks, the mock
                exam and placement test (a live counter there turns a test into
                a scoreboard; FocusLayout's own `showStats` covers the lessons)
                and the roadmap's one-way onboarding lock all stay clear of it.
                It is in normal flow, ABOVE the relative wrapper below, so the
                page content starts under it and no page reserves room for a
                floating menu button any more. */}
            {!hideChrome && <AppHeader />}
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
              <Drawer />
              {/* overflow-HIDDEN, not auto. Every page already owns its own
                  scroll container — they have to, because the ones rendering
                  BottomNav need it pinned below a scrolling body (`flex h-full
                  flex-col` + `min-h-0 flex-1 overflow-y-auto` + <BottomNav />),
                  and the focus screens get theirs from FocusLayout. A scroller
                  here as well made two nested ones on every single screen, so
                  every touch drag cost the browser a scroll-chaining resolution
                  before it could move anything — which is felt as lag.

                  min-h-0 flex-1 stays: that is what gives this box a definite
                  height for the pages' `h-full` to resolve against. The three
                  routes with no scroller of their own (not-found, and the two
                  focus routes that delegate to FocusLayout) are all either short
                  enough not to need one or bring their own. */}
              <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
              {!chatOpen && !pledgeOpen && !hideMentor && <FabChat />}
              {/* !hideMentor here too, not just on the FAB: the effect above
                  closes an open chat, but this makes the overlay unrenderable
                  during an assessment rather than relying on that to have run. */}
              {chatOpen && !hideMentor && hasFullAccess && (
                <Suspense fallback={null}>
                  <ChatOverlay />
                </Suspense>
              )}
              {pledgeOpen && <CommitmentOverlay />}
            </div>
          </div>
          {/* A level ABOVE the relative wrapper, unlike CommitmentOverlay.
              This one is a translucent scrim rather than an opaque panel, so
              rendering it inside that wrapper left the app bar undimmed
              along the top edge — visibly a modal sitting "inside" the page.
              Anchors to the shell root, which carries `relative` for this.

              Rendered conditionally rather than self-hiding, so the component
              never sees a null feature and needs no internal guard — which
              keeps the React Compiler's early-return hazard out of it. */}
          {authPrompt && <AuthPromptOverlay />}
          {/* "Add to home screen". Shell-root level for the same scrim reason
              as the login prompt above, and held back while anything else owns
              the screen — hideChrome covers a lesson, an exam and the roadmap
              lock, so it never interrupts a task. When and how often it shows
              lives in lib/install-prompt.ts. */}
          <InstallPrompt
            suppressed={hideChrome || chatOpen || pledgeOpen || !!authPrompt}
          />
        </>
      )}
    </div>
  );
}
