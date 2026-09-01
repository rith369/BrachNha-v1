import { lazy, Suspense, useEffect } from "react";
import { TopBar } from "./top-bar";
import { Drawer } from "./drawer";
import { Sidebar } from "./sidebar-nav";
import { FabChat } from "./fab-chat";
import { StatBar } from "./stat-bar";
import { LoginView } from "@/features/login/components/login-view";
import { SurveyView } from "@/features/survey/components/survey-view";
import { CommitmentOverlay } from "@/features/commitment/components/commitment-overlay";
import { useBrachNhaStore } from "@/lib/store";

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
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden bg-bg md:max-w-3xl lg:max-w-[1600px] lg:flex-row">
      {!userName ? (
        <LoginView />
      ) : !surveyed ? (
        <SurveyView />
      ) : (
        <>
          {/* Hidden below lg by the component itself. hideChrome drops it too,
              so the roadmap's one-way onboarding stays one-way on desktop. */}
          {!hideChrome && <Sidebar />}
          {/* Outer, NOT `relative`. GlobalStatBar sits here, as a normal-flow
              sibling ABOVE the relative wrapper below, so it pushes that
              wrapper's top edge down rather than sitting inside it. That
              matters because TopBar's hamburger is `absolute top-3` measured
              from the relative wrapper's own top edge, which is also where a
              page's `pt-4` header starts (see top-bar.tsx and the header
              convention in CLAUDE.md) — the two stay aligned to each other
              exactly as before, just both shifted down by GlobalStatBar's
              height as one unit. Putting the bar INSIDE the relative wrapper
              instead would not have worked: absolute positioning ignores
              sibling flow, so the hamburger would have stayed pinned to the
              wrapper's original top edge and overlapped it. */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {/* THE GLOBAL STAT BAR. XP/streak/coins are the app's whole
                gamification loop, so this is deliberately not confined to the
                task screens FocusLayout already shows it on (see its
                `showStats` prop) — it is now the first thing on every ordinary
                page. Gated on the SAME `!hideChrome` as Sidebar/TopBar just
                above: focus tasks, the mock exam and placement test (measuring
                rather than teaching — a live counter there turns a test into a
                scoreboard, the reasoning FocusLayout's own showStats already
                encodes) and the roadmap's one-way onboarding lock all correctly
                stay clear of it for the same reasons they already hide the rest
                of the chrome. subject-path-view.tsx's own inline StatBar was
                removed once this landed — this is now the one place that
                renders it for an ordinary page, not a second copy that could
                disagree with it. */}
            {!hideChrome && (
              <div className="shrink-0 flex justify-end px-4 pt-3 md:px-6 md:pt-4">
                <StatBar />
              </div>
            )}
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
              {!hideChrome && <TopBar />}
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
              {chatOpen && !hideMentor && (
                <Suspense fallback={null}>
                  <ChatOverlay />
                </Suspense>
              )}
              {pledgeOpen && <CommitmentOverlay />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
