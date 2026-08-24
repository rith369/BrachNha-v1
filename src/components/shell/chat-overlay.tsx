import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { useLocation } from "react-router";
import { motion } from "framer-motion";
import {
  X,
  Bot,
  Send,
  Plus,
  MessageSquareText,
  ArrowLeft,
  Trash2,
  Sigma,
  Keyboard,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { useT } from "@/data/translations";
import { relativeDay } from "@/utils/chat-history";
import { applyInsert, defaultMathLayout } from "@/utils/math-input";
import { daysUntilExam } from "@/utils/exam-date";
import { cn } from "@/utils/cn";
import { MathText } from "./math-text";
import type { ChatProfile } from "@/utils/chat-prompt";
import type { ChatMsg, Conversation } from "@/types";

// MathLive is ~840KB of JS plus its font files. Split off behind React.lazy so
// it downloads the first time a student taps Σ, not when the mentor opens —
// most questions are typed, and this is Cambodian mobile data. See the header
// of math-field-panel.tsx.
const MathFieldPanel = lazy(() =>
  import("./math-field-panel").then((m) => ({ default: m.MathFieldPanel }))
);

// Tappable starter questions, restored from the original prototype. They show
// only on an empty chat, and map onto content the app actually has.
const QUICK_QS = {
  en: [
    "How do I calculate limits?",
    "Explain the human brain parts",
    "How to improve my Bac II score?",
    "What is photosynthesis?",
    "Explain the probability formula",
  ],
  km: [
    "តើគណនាលីមីតយ៉ាងដូចម្តេច?",
    "ពន្យល់ផ្នែកខួរក្បាល",
    "ធ្វើយ៉ាងណាដើម្បីកែពិន្ទុ Bac II?",
    "តើការបំប្លែងពន្លឺជាអ្វី?",
    "ពន្យល់រូបមន្តប្រូបាប",
  ],
} as const;

// Stable reference for "no active conversation" — a fresh `[]` each render
// would make the scroll effect below re-fire forever.
const NO_MSGS: ChatMsg[] = [];

const iconBtn =
  "flex size-8 shrink-0 items-center justify-center rounded-full bg-purple/10 text-purple transition hover:bg-purple/20 disabled:opacity-40";

export function ChatOverlay() {
  const lang = useBrachNhaStore((s) => s.lang);
  const setChatOpen = useBrachNhaStore((s) => s.setChatOpen);
  const conversations = useBrachNhaStore((s) => s.conversations);
  const activeConversationId = useBrachNhaStore((s) => s.activeConversationId);

  // Multi-field selector — must go through useShallow or the new object
  // identity on every render triggers Zustand's infinite re-render loop.
  const {
    addChatMsg,
    appendChatChunk,
    startNewChat,
    openConversation,
    deleteConversation,
    userName,
    userLanguage,
    userData,
    xp,
    level,
    streak,
    examResults,
    pendingPlacementTests,
  } = useBrachNhaStore(
    useShallow((s) => ({
      addChatMsg: s.addChatMsg,
      appendChatChunk: s.appendChatChunk,
      startNewChat: s.startNewChat,
      openConversation: s.openConversation,
      deleteConversation: s.deleteConversation,
      userName: s.userName,
      userLanguage: s.userLanguage,
      userData: s.userData,
      xp: s.xp,
      level: s.level,
      streak: s.streak,
      examResults: s.examResults,
      pendingPlacementTests: s.pendingPlacementTests,
    }))
  );

  const t = useT(lang);
  const { pathname } = useLocation();
  const [view, setView] = useState<"chat" | "history">("chat");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // "math" swaps the OS keyboard out for MathLive's. AppShell unmounts this
  // whole overlay on close, so the lazy initialiser runs once per open — which
  // is exactly when we want to read the page underneath.
  const [mode, setMode] = useState<"text" | "math">("text");
  const [mathLayout] = useState(() => defaultMathLayout(pathname));

  const active = conversations.find((c) => c.id === activeConversationId);
  const msgs = active?.msgs ?? NO_MSGS;

  /** Current selection, falling back to the end of the text. */
  function selection() {
    const el = inputRef.current;
    const start = el?.selectionStart ?? input.length;
    return { start, end: el?.selectionEnd ?? start };
  }

  /**
   * React has to commit the new value before setSelectionRange will stick.
   *
   * `refocus` is false when the caret is being restored after a formula lands
   * from the math panel: focus belongs to the MathLive field then, and stealing
   * it back would trip the input's onFocus below and close the panel the
   * student is still using. setSelectionRange works on an unfocused input, so
   * the caret is waiting in the right place whenever they do come back to it.
   */
  function restoreCaret(caret: number, refocus = true) {
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      if (refocus) el.focus();
      el.setSelectionRange(caret, caret);
    });
  }

  /**
   * Drop a MathLive formula into the message at the cursor.
   *
   * The padding goes OUTSIDE the dollars, never inside. splitMath applies the
   * standard TeX rule that inline math may not be hugged by whitespace, so
   * `$ x^2 $` is not math — it would reach the bubble as literal dollar signs.
   */
  function insertLatex(latex: string) {
    const { start, end } = selection();
    const before = input.slice(0, Math.min(start, end));
    const after = input.slice(Math.max(start, end));
    const lead = before && !/\s$/.test(before) ? " " : "";
    const trail = after && !/^\s/.test(after) ? " " : "";

    const next = applyInsert(input, start, end, `${lead}$${latex}$${trail}`);
    setInput(next.value);
    restoreCaret(next.caret, false);
  }

  /**
   * Swap between the OS keyboard and MathLive's.
   *
   * No `inputMode` juggling: the panel focuses its own field on mount, so the
   * OS keyboard goes away because focus left the input — and the input's
   * onFocus brings it back the same way. One keyboard at a time, enforced by
   * focus rather than by an attribute the OS may or may not honour.
   */
  function toggleMode() {
    const next = mode === "text" ? "math" : "text";
    setMode(next);
    if (next === "text") inputRef.current?.focus();
  }

  useEffect(() => {
    if (view === "chat") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [msgs, loading, view]);

  const greeting =
    lang === "en"
      ? "👋 Hi! I am KruAI, your BrachNha study mentor. Ask me anything about your Bac II subjects!"
      : "👋 សួស្ដី! ខ្ញុំជា KruAI គ្រូជំនួយសិក្សា BrachNha។ សួរខ្ញុំអ្វីក៏បានអំពី Bac II!";

  async function send(question?: string) {
    const text = (question ?? input).trim();
    if (!text || loading) return;

    const profile: ChatProfile = {
      name: userName,
      language: userLanguage,
      grade: userData.grade,
      daysToExam: daysUntilExam(),
      strengths: userData.strengths,
      weaknesses: userData.weaknesses,
      level,
      xp,
      streak,
      avgExamPct: examResults.length
        ? Math.round(
            examResults.reduce((sum, r) => sum + r.pct, 0) / examResults.length
          )
        : null,
      examCount: examResults.length,
      pendingPlacementTests: pendingPlacementTests.map((p) => p.subject),
    };

    // Snapshot before the store updates — this is what gets replayed as context.
    const history = [...msgs, { role: "user" as const, text }];

    addChatMsg({ role: "user", text });
    setInput("");
    setLoading(true);

    // Drop back to text mode so the math panel isn't covering the reply. Only
    // when it was open — sending in text mode keeps the keyboard up, as before.
    if (mode === "math") {
      setMode("text");
      inputRef.current?.blur();
    }

    // Empty bot bubble for the stream to fill in, chunk by chunk.
    addChatMsg({ role: "bot", text: "" });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, lang, profile }),
      });

      if (!res.ok || !res.body) {
        // The route sends readable text for its own error cases (missing key,
        // upstream failure); fall back to a generic line if it sent nothing.
        const detail = res.body ? (await res.text()).trim() : "";
        appendChatChunk(
          detail ||
            (lang === "en"
              ? "⚠️ Sorry, I could not answer that. Try again!"
              : "⚠️ សុំទោស មិនអាចឆ្លើយបានទេ។ សូមព្យាយាមម្ដងទៀត!")
        );
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let received = false;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          received = true;
          appendChatChunk(chunk);
        }
      }

      if (!received) {
        appendChatChunk(
          lang === "en"
            ? "⚠️ Sorry, I could not answer that. Try again!"
            : "⚠️ សុំទោស មិនអាចឆ្លើយបានទេ។ សូមព្យាយាមម្ដងទៀត!"
        );
      }
    } catch {
      appendChatChunk(
        lang === "en"
          ? "⚠️ No connection. Try again later."
          : "⚠️ គ្មានការតភ្ជាប់។ សូមព្យាយាមម្តងទៀត។"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className="absolute inset-0 z-50 flex flex-col bg-bg"
    >
      {/* Header.
          The overlay backdrop covers the whole shell, but the conversation
          itself is capped at max-w-2xl and centred: message bubbles are already
          max-w-[80%], and 80% of a 1024px laptop is an 819px line of text that
          is genuinely hard to read. Header, messages and composer all share the
          same cap so their left edges line up. */}
      <div className="mx-auto flex w-full max-w-2xl shrink-0 items-start justify-between px-5.5 pt-4 pb-3">
        <div>
          <div className="font-heading bg-brand-tri bg-clip-text text-lg font-extrabold text-transparent">
            {/* Brand name — deliberately identical in both languages. */}
            🤖 KruAI
          </div>
          {/* No vendor attribution here by product decision — the model behind
              the mentor is deliberately not named anywhere the student can see.
              This string was the ONLY occurrence of "gemini" in the client
              bundle; keep it that way, and don't reintroduce the provider name
              into anything under src/ that ships to the browser. */}
          <div className="text-xs font-bold text-muted">
            {lang === "en" ? "Ask anything" : "សួរអ្វីក៏បាន"}
          </div>
        </div>
        <div className="mt-0.5 flex shrink-0 items-center gap-2">
          <button
            onClick={() => {
              setMode("text");
              setView("history");
            }}
            disabled={loading}
            aria-label={t.chatHistory}
            className={iconBtn}
          >
            <MessageSquareText className="size-4" strokeWidth={2.5} />
          </button>
          <button
            onClick={() => {
              startNewChat();
              setView("chat");
            }}
            disabled={loading || (!active && msgs.length === 0)}
            aria-label={t.newChat}
            className={iconBtn}
          >
            <Plus className="size-4" strokeWidth={2.75} />
          </button>
          <button
            onClick={() => setChatOpen(false)}
            aria-label={lang === "en" ? "Close" : "បិទ"}
            className={iconBtn}
          >
            <X className="size-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="mx-auto w-full max-w-2xl flex-1 space-y-3 overflow-y-auto px-4 pb-3">
        {msgs.length === 0 && (
          <>
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl border border-purple/10 bg-surface px-4 py-2.5 text-sm font-semibold text-text">
                {greeting}
              </div>
            </div>
            <div className="pt-1">
              <div className="mb-2 text-xs font-bold text-muted">
                {t.commonQuestions}
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_QS[lang].map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-full border border-purple/15 bg-surface px-3 py-1.5 text-left text-xs font-bold text-purple transition hover:bg-purple/10"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {msgs.map((m, i) => {
          // The in-flight bot bubble is empty until the first chunk lands; the
          // typing indicator below stands in for it.
          if (m.role === "bot" && !m.text) return null;
          return (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-semibold whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-brand text-white"
                    : "border border-purple/10 bg-surface text-text"
                }`}
              >
                {/* Both sides carry LaTeX now: the model writes it (see
                    data/bac2-format.ts) and the math panel inserts it. Khmer
                    prose around a formula is safe — splitMath refuses to
                    typeset any $…$ containing Khmer. */}
                <MathText text={m.text} />
              </div>
            </div>
          );
        })}

        {loading && !msgs[msgs.length - 1]?.text && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl border border-purple/10 bg-surface px-4 py-2.5">
              <Bot className="size-3.5 text-purple" />
              <span className="text-xs font-bold text-muted">...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mx-auto flex w-full max-w-2xl shrink-0 items-center gap-2 border-t border-purple/10 p-3">
        <button
          onClick={toggleMode}
          aria-label={mode === "math" ? t.textKeyboard : t.mathKeyboard}
          className={cn(
            iconBtn,
            "size-10",
            mode === "math" &&
              "bg-[var(--brand-purple)] text-on-brand hover:bg-[var(--brand-purple)]"
          )}
        >
          {mode === "math" ? (
            <Keyboard className="size-4.5" strokeWidth={2.25} />
          ) : (
            <Sigma className="size-4.5" strokeWidth={2.5} />
          )}
        </button>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          // Typing prose and building a formula are separate acts; reaching for
          // one puts the other keyboard away.
          onFocus={() => setMode("text")}
          placeholder={t.askQuestion}
          className="min-w-0 flex-1 rounded-full border border-purple/15 bg-surface px-4 py-2.5 text-sm font-semibold outline-none focus:border-purple/40"
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          aria-label={t.send}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-white disabled:opacity-40"
        >
          <Send className="size-4.5" />
        </button>
      </div>

      {mode === "math" && (
        <Suspense
          fallback={
            <div className="mx-auto flex h-[332px] w-full max-w-2xl shrink-0 items-center justify-center border-t border-purple/10 bg-surface text-xs font-bold text-muted">
              {t.mathKeyboard}…
            </div>
          }
        >
          <MathFieldPanel
            lang={lang}
            layout={mathLayout}
            onInsert={insertLatex}
          />
        </Suspense>
      )}

      {view === "history" && (
        <HistoryPanel
          conversations={conversations}
          activeId={activeConversationId}
          onBack={() => setView("chat")}
          onOpen={(id) => {
            openConversation(id);
            setView("chat");
          }}
          onNew={() => {
            startNewChat();
            setView("chat");
          }}
          onDelete={deleteConversation}
        />
      )}
    </motion.div>
  );
}

function HistoryPanel({
  conversations,
  activeId,
  onBack,
  onOpen,
  onNew,
  onDelete,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onBack: () => void;
  onOpen: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = useT(lang);
  // Which row is asking "Delete / Cancel". Deleting is destructive and there's
  // no undo, so it takes two taps — same idea as Profile's Logout confirm.
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // The store keeps conversations newest-updated-first, so no sort needed here;
  // we only insert a heading whenever the day changes.
  let lastHeading = "";

  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
      className="absolute inset-0 z-10 flex flex-col bg-bg"
    >
      <div className="mx-auto flex w-full max-w-2xl shrink-0 items-center justify-between gap-2 border-b border-purple/10 px-4 pt-4 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-full bg-purple/10 px-3 py-1.5 text-xs font-extrabold text-purple transition hover:bg-purple/20"
        >
          <ArrowLeft className="size-3.5" strokeWidth={2.75} />
          {t.back}
        </button>
        <div className="font-heading text-sm font-extrabold text-text">
          {t.chatHistory}
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-extrabold text-white"
        >
          <Plus className="size-3.5" strokeWidth={2.75} />
          {t.newChat}
        </button>
      </div>

      <div className="mx-auto w-full min-h-0 max-w-2xl flex-1 overflow-y-auto p-3">
        {conversations.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm font-bold text-muted">
            {t.noConversations}
          </div>
        ) : (
          conversations.map((c) => {
            const heading = relativeDay(c.updatedAt, lang);
            const showHeading = heading !== lastHeading;
            lastHeading = heading;

            return (
              <div key={c.id}>
                {showHeading && (
                  <div className="px-3 pt-3 pb-1 text-[10px] font-extrabold tracking-widest text-muted uppercase">
                    {heading}
                  </div>
                )}
                <div
                  className={cn(
                    "mb-1 flex items-center gap-3 rounded-2xl px-4 py-3 transition",
                    c.id === activeId
                      ? "border border-purple/20 bg-linear-to-r from-pink/10 to-purple/10"
                      : "hover:bg-purple/8"
                  )}
                >
                  <button
                    onClick={() => onOpen(c.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="truncate text-sm font-extrabold text-text">
                      {c.title}
                    </div>
                    <div className="text-[11px] font-bold text-muted">
                      {c.msgs.length} {t.messagesLabel} · {heading}
                    </div>
                  </button>

                  {confirmingId === c.id ? (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="rounded-full border border-purple/20 bg-surface px-2.5 py-1 text-[11px] font-extrabold text-purple"
                      >
                        {t.cancelDelete}
                      </button>
                      <button
                        onClick={() => {
                          onDelete(c.id);
                          setConfirmingId(null);
                        }}
                        className="rounded-full bg-[var(--brand-pink)] px-2.5 py-1 text-[11px] font-extrabold text-on-brand"
                      >
                        {t.deleteChat}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingId(c.id)}
                      aria-label={t.deleteChat}
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-pink/10 hover:text-pink"
                    >
                      <Trash2 className="size-4" strokeWidth={2.25} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
