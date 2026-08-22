import { lazy, Suspense, useEffect } from "react";
import { TopBar } from "./top-bar";
import { Drawer } from "./drawer";
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
// outer container: centred on desktop at max-w-lg, full-bleed on a phone.
export function AppShell({ children }: { children: React.ReactNode }) {
  const chatOpen = useBrachNhaStore((s) => s.chatOpen);
  const pledgeOpen = useBrachNhaStore((s) => s.pledgeOpen);
  const userName = useBrachNhaStore((s) => s.userName);
  const surveyed = useBrachNhaStore((s) => s.surveyed);
  const lang = useBrachNhaStore((s) => s.lang);

  // index.html ships lang="en" because `lang` lives in the persisted store and
  // isn't known until React mounts; we correct the attribute here. Both "en"
  // and "km" are valid BCP-47 tags. (Under Next this same effect corrected the
  // server-rendered <html lang>; the reason changed, the fix didn't.)
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden bg-bg">
      {!userName ? (
        <LoginView />
      ) : !surveyed ? (
        <SurveyView />
      ) : (
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <TopBar />
          <Drawer />
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {!chatOpen && !pledgeOpen && <FabChat />}
          {chatOpen && (
            <Suspense fallback={null}>
              <ChatOverlay />
            </Suspense>
          )}
          {pledgeOpen && <CommitmentOverlay />}
        </div>
      )}
    </div>
  );
}
