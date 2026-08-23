import { lazy, Suspense, useEffect } from "react";
import { TopBar } from "./top-bar";
import { Drawer } from "./drawer";
import { Sidebar } from "./sidebar-nav";
import { FabChat } from "./fab-chat";
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
// `hideChrome` drops the hamburger and the chat FAB, leaving the page's own CTA
// as the only way forward. ShellLayout decides when (it's the piece that knows
// the route); the default keeps AppShell usable outside a router.
export function AppShell({
  children,
  hideChrome = false,
}: {
  children: React.ReactNode;
  hideChrome?: boolean;
}) {
  const chatOpen = useBrachNhaStore((s) => s.chatOpen);
  const pledgeOpen = useBrachNhaStore((s) => s.pledgeOpen);
  const userName = useBrachNhaStore((s) => s.userName);
  const surveyed = useBrachNhaStore((s) => s.surveyed);
  const lang = useBrachNhaStore((s) => s.lang);
  const theme = useBrachNhaStore((s) => s.theme);

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
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            {!hideChrome && <TopBar />}
            <Drawer />
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            {!chatOpen && !pledgeOpen && !hideChrome && <FabChat />}
            {chatOpen && (
              <Suspense fallback={null}>
                <ChatOverlay />
              </Suspense>
            )}
            {pledgeOpen && <CommitmentOverlay />}
          </div>
        </>
      )}
    </div>
  );
}
