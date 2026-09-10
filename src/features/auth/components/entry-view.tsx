import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { useT } from "@/data/translations";
import { Wordmark } from "@/components/shell/wordmark";
import { Flag } from "@/components/ui/flag";
import { GoogleButton } from "./google-button";

/**
 * The door. Two ways in, and the choice is the whole screen.
 *
 * Rendered by AppShell rather than by a route, the same way LoginView and
 * SurveyView already are — the gate is a store question, not a URL, so a deep
 * link to /practice lands here and then continues to /practice once they are
 * through. See the gate in components/shell/app-shell.tsx.
 *
 * Deliberately reuses login-view.tsx's page frame, Wordmark and language
 * toggle: this is the screen immediately before that one, and the two reading
 * as one flow is the point.
 */
export function EntryView() {
  const { lang, setLang, continueAsGuest } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      setLang: s.setLang,
      continueAsGuest: s.continueAsGuest,
    }))
  );
  const t = useT(lang);

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col overflow-y-auto px-4 pt-8 pb-6">
      <div className="mb-8 flex items-center justify-between">
        <Wordmark
          subtitle={
            <div className="text-xs font-bold text-muted">Bac II Quest</div>
          }
        />
        <button
          onClick={() => setLang(lang === "en" ? "km" : "en")}
          className="flex items-center gap-1.5 rounded-full border border-purple/20 bg-purple/8 px-3 py-1.5 text-xs font-extrabold text-purple"
        >
          <Flag code={lang === "en" ? "kh" : "gb"} className="size-3.5" />
          {lang === "en" ? "ខ្មែរ" : "EN"}
        </button>
      </div>

      {/* Centred in whatever height is left, so the two choices sit together in
          the middle of a phone and do not drift to the top of a laptop. */}
      <div className="flex flex-1 flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="mb-3 text-6xl">⚔️</div>
          {/* t.welcome carries its own ⚔️ and the illustration above is the
              same sword, so this uses a plain heading — the same pairing
              login-view.tsx makes with t.createAccount. */}
          <div className="mb-2 font-heading text-xl font-extrabold">
            {t.entryTitle}
          </div>
          <div className="mx-auto max-w-xs text-sm font-bold text-muted">
            {t.entryTagline}
          </div>
        </div>

        <div className="rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel">
          <GoogleButton />
          <p className="mt-2 mb-4 text-center text-xs font-bold text-muted">
            {t.googleNote}
          </p>

          {/* A real second choice, not a dismissal — so it gets a proper
              button rather than the bare text link a "skip" would use. */}
          <button
            onClick={continueAsGuest}
            className="w-full rounded-2xl border border-purple/20 bg-purple/8 px-6 py-3.5 text-sm font-extrabold text-purple transition active:scale-[0.98]"
          >
            {t.continueAsGuest}
          </button>
          <p className="mt-2 text-center text-xs font-bold text-muted">
            {t.guestNote}
          </p>
        </div>
      </div>
    </div>
  );
}
