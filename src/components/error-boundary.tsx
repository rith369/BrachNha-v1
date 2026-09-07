import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCw, Trash2 } from "lucide-react";

/**
 * The app's one error boundary, wrapped around <Routes> in app.tsx.
 *
 * ── Why this exists, and why RELOAD IS NOT ENOUGH ─────────────────────────
 *
 * Before this, a throw anywhere in a render blanked the entire app — React
 * unmounts the whole tree when nothing catches. That alone would be survivable
 * if reloading fixed it. It does not: this app persists its state to
 * localStorage["brachnha"] and rehydrates on boot, so if the throw is caused by
 * something IN that state, every reload lands the student back on the same
 * white screen with no way out. A phone has no devtools to clear storage from.
 *
 * So the fallback offers two escapes, in increasing order of cost:
 *
 *  1. Reload — for a transient failure, which is most of them.
 *  2. Clear saved data — for the state-is-the-problem case. DESTRUCTIVE: it
 *     drops the persisted store and returns the student to the Login screen,
 *     losing local progress. Behind a two-tap confirm for that reason, matching
 *     Profile's Logout, which asks the same question about the same data.
 *
 * The auth session (localStorage["brachnha-auth"], a deliberately separate key
 * — see lib/supabase.ts) is left ALONE by the clear. Whatever is in a broken
 * store, the account it belongs to is still good, and keeping the session means
 * the sync layer's empty-store-plus-session path can pull the account straight
 * back down. Wiping it too would turn a recoverable render bug into real,
 * permanent data loss.
 *
 * A class component because React still has no hook equivalent for
 * componentDidCatch. `erasableSyntaxOnly` is on in tsconfig, which bans
 * parameter properties — hence the explicit field declarations rather than a
 * constructor shorthand.
 *
 * BILINGUAL, not Khmer-only. The Khmer-only rule (LESSONS_PAGE_LANG and its
 * siblings) is for screens whose CONTENT is curriculum. This is chrome, and it
 * has to be readable at the one moment the app cannot tell you what language
 * the student chose — the store may be exactly what is broken. So both
 * languages are shown at once rather than picked between.
 */

const STORE_KEY = "brachnha";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  confirmingClear: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, confirmingClear: false };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Nothing collects these yet. Logging the component stack is what makes a
    // student's screenshot of the console actionable, which is the only error
    // reporting this app has.
    console.error("[app] render failed:", error, info.componentStack);
  }

  private reload = () => {
    window.location.reload();
  };

  private clearAndReload = () => {
    try {
      localStorage.removeItem(STORE_KEY);
    } catch {
      // Storage can throw outright in a locked-down browser. Reloading is
      // still worth attempting, and there is nothing else to offer.
    }
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-bg p-6">
        <div className="w-full max-w-md rounded-3xl bg-surface p-6 text-center shadow-panel">
          <AlertTriangle className="mx-auto mb-4 size-12 text-yellow" />

          <h1 className="mb-2 font-heading text-xl font-bold text-text">
            Something went wrong
          </h1>
          <p className="mb-1 font-heading text-lg font-bold text-text">
            មានបញ្ហាបច្ចេកទេស
          </p>

          <p className="mb-6 text-sm text-muted">
            The app hit an unexpected error. Reloading usually fixes it.
            <br />
            សូមព្យាយាមផ្ទុកឡើងវិញ។
          </p>

          <button
            onClick={this.reload}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 font-bold text-white shadow-cta"
          >
            <RotateCw className="size-4" />
            Reload · ផ្ទុកឡើងវិញ
          </button>

          {this.state.confirmingClear ? (
            <div className="rounded-2xl border border-border bg-control p-4">
              <p className="mb-3 text-sm text-muted">
                This deletes your saved progress on this device and returns you
                to the login screen. Your account backup is not touched.
                <br />
                វានឹងលុបវឌ្ឍនភាពក្នុងឧបករណ៍នេះ។
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => this.setState({ confirmingClear: false })}
                  className="flex-1 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text"
                >
                  Cancel · បោះបង់
                </button>
                <button
                  onClick={this.clearAndReload}
                  className="flex-1 rounded-xl bg-destructive px-4 py-2 text-sm font-bold text-white"
                >
                  Clear · លុប
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => this.setState({ confirmingClear: true })}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-muted"
            >
              <Trash2 className="size-4" />
              Still broken? Clear saved data
            </button>
          )}

          {import.meta.env.DEV && (
            <pre className="mt-5 max-h-40 overflow-auto rounded-xl bg-control p-3 text-left text-[11px] whitespace-pre-wrap text-muted">
              {this.state.error.message}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
