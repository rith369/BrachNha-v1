import { track } from "@/lib/telemetry";
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
  ImageIcon,
  Lightbulb,
  RotateCcw,
  Square,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { useT } from "@/data/translations";
import { relativeDay } from "@/utils/chat-history";
import { applyInsert, defaultMathLayout } from "@/utils/math-input";
import { daysUntilExam } from "@/utils/exam-date";
import { screenRefFor } from "@/utils/chat-screen";
import { getAccessToken } from "@/lib/auth";
import { imageFor, rememberImage, type ChatImage } from "@/lib/chat-images";
import { blobToBase64, blobToDataUrl, compressImage } from "@/utils/image-compress";
import { cn } from "@/utils/cn";
import { MathText } from "./math-text";
import { AttachmentChip, PhotoButton } from "./chat-attach";
import {
  GUIDE_MARK,
  KRUAI_LEFT_HEADER,
  KRUAI_LIMIT_HEADER,
  SHOW_SOLUTION_KM,
} from "@/data/kruai-phrases";
import { guidedAnchorIndex } from "@/utils/chat-anchor";
import { todayKey } from "@/utils/day";
import type { ChatProfile } from "@/utils/chat-prompt";
import type { ChatMsg, Conversation } from "@/types";

/**
 * KruAI guides an exercise step by step (the Socratic rules in
 * data/bac2-format.ts) and starts every guided reply with GUIDE_MARK. Under the
 * LAST reply carrying it, the overlay offers "show full solution", which sends
 * the exact words the prompt tells the model to answer with the full solution.
 * The mark stays visible in the bubble as the "guided" cue, so nothing is
 * stripped and a mark split across stream chunks cannot glitch.
 */
const SHOW_SOLUTION = {
  en: "Please show the full solution",
  km: SHOW_SOLUTION_KM,
} as const;

/**
 * What the composer is holding. `full` is the ~1400px copy the model reads and
 * `thumb` the ~320px one the history keeps (see ChatMsg.image). Both are made
 * BEFORE Send, so pressing Send never waits on a canvas.
 */
type Attachment =
  | { status: "processing" }
  | { status: "error" }
  | { status: "ready"; full: ChatImage; thumb: string };

/** A photo sent with no words gets this as its text, in the UI language. Stored
 *  as the message's real text, so the conversation title, the sync row and the
 *  replayed history are never empty. */
const PHOTO_QUESTION = {
  en: "Please explain and solve the exercise in this photo.",
  km: "សូមជួយពន្យល់ និងដោះស្រាយលំហាត់ក្នុងរូបភាពនេះ។",
} as const;

/** Photos re-sent with a follow-up, newest first. Mirrors MAX_IMAGES_PER_REQUEST
 *  in server/chat-handler.ts, which refuses more. */
const MAX_PHOTOS_SENT = 2;

/** Only messages this close to the end are forwarded to the model (MAX_HISTORY
 *  in the handler), so a photo further back would be uploaded for nothing. */
const REPLAY_WINDOW = 12;

/** The "questions left today" line shows from here down. Above it the number
 *  is noise; a student with 25 left has nothing to plan around. */
const LOW_LEFT = 10;

/**
 * The last "left today" count the server sent (KRUAI_LEFT_HEADER), and for
 * which day. Module scope, not state: AppShell unmounts the overlay on close,
 * and a student who reopens it should still see the count. Lost on reload until
 * the next question brings a fresh one, which is fine: the server is the one
 * counting, this only remembers what it said.
 */
let knownLeft: { n: number; day: string } | null = null;

function leftToday(): number | null {
  return knownLeft && knownLeft.day === todayKey() ? knownLeft.n : null;
}

/** The line above the composer. The photo note shows only while a photo is
 *  attached, the one moment the 3-for-1 price changes what the student does. */
function leftLine(n: number, photo: boolean, lang: "en" | "km"): string {
  if (n === 0) {
    return lang === "en"
      ? "No questions left today. See you tomorrow!"
      : "ថ្ងៃនេះអស់សំណួរហើយ។ ជួបគ្នាថ្ងៃស្អែក!";
  }
  if (lang === "en") {
    return `${n} question${n === 1 ? "" : "s"} left today` +
      (photo ? " · a photo counts as 3" : "");
  }
  return `នៅសល់ ${n} សំណួរសម្រាប់ថ្ងៃនេះ` + (photo ? " · រូបភាពមួយរាប់ជា 3" : "");
}

/** Past this, decoding the file alone can exhaust a cheap phone's memory. A real
 *  camera photo is 3–5MB; 25MB is a scan or a panorama nobody meant to send. */
const MAX_PHOTO_FILE_BYTES = 25 * 1024 * 1024;

/**
 * The request's `messages`: text for every message, the full photo for at most
 * MAX_PHOTOS_SENT recent ones still held in memory, and `hadImage` for a photo
 * that is gone (after a reload) so the model is told rather than left to guess.
 * Thumbs and ids are NOT sent — the server has no use for either, and thumbs
 * would add tens of KB per photo to every request.
 *
 * Failed bubbles (ChatMsg.failed) are left out: they are our words, an error or
 * a refusal, and replayed they would reach the model as if KruAI had said them.
 *
 * The exercise being guided keeps its photo even once it is older than the
 * window, because the server sends that message ahead of the window (see
 * utils/chat-anchor.ts) and the exercise is often nothing BUT the photo. It
 * takes one of the two photo slots first; newer photos share what is left.
 */
function wireMessages(history: ChatMsg[]) {
  const kept = history.filter((m) => !(m.role === "bot" && m.failed));
  const firstInWindow = kept.length - REPLAY_WINDOW;
  const anchor = guidedAnchorIndex(kept);
  const anchorPhoto =
    anchor >= 0 && anchor < firstInWindow && kept[anchor].image
      ? imageFor(kept[anchor].id)
      : undefined;

  const out: {
    role: ChatMsg["role"];
    text: string;
    image?: ChatImage;
    hadImage?: true;
  }[] = [];
  let budget = MAX_PHOTOS_SENT - (anchorPhoto ? 1 : 0);
  // Newest first, so the photo budget goes to the most recent photos.
  for (let i = kept.length - 1; i >= 0; i--) {
    const m = kept[i];
    const base = { role: m.role, text: m.text };
    if (m.role !== "user" || !m.image) {
      out.push(base);
      continue;
    }
    if (i === anchor && anchorPhoto) {
      out.push({ ...base, image: anchorPhoto });
      continue;
    }
    const full = imageFor(m.id);
    if (full && i >= firstInWindow && budget > 0) {
      budget--;
      out.push({ ...base, image: full });
    } else {
      out.push({ ...base, hadImage: true });
    }
  }
  return out.reverse();
}

// MathLive is ~840KB of JS plus its font files. Split off behind React.lazy so
// it downloads the first time a student taps Σ, not when the mentor opens —
// most questions are typed, and this is Cambodian mobile data. See the header
// of math-field-panel.tsx.
const MathFieldPanel = lazy(() =>
  import("./math-field-panel").then((m) => ({ default: m.MathFieldPanel }))
);

// Tappable starter questions. They show only on an empty chat, and each one is
// a short tour of something KruAI does (the user's choice, 29 Sep 2026):
//   1. an EXERCISE, so the student meets the Socratic style (🧭, one question,
//      the "show full solution" button) on their very first tap;
//   2. a biology COMPARISON, to show the similarities + differences table;
//   3. getting a grade A, and 4. understanding lessons: study advice.
// 2 and 3 are worded to hit a curated answer in server/chat-cache.ts EXACTLY,
// so they arrive instantly and cost no daily quota. Reword them only together
// with that file's patterns, or they silently fall through to the model.
const QUICK_QS = {
  en: [
    "Calculate $\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}$",
    "Compare monocots and dicots",
    "How to get grade A?",
    "How can I understand lessons easily?",
  ],
  km: [
    "គណនា $\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}$",
    "ប្រៀបធៀបម៉ូណូកូទីលេដូន និងឌីកូទីលេដូន",
    "ធ្វើដូចម្តេចដើម្បីបាននិទ្ទេស A?",
    "តើធ្វើដូចម្តេចទើបយល់មេរៀនបានងាយ?",
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
    failLastBotMsg,
    dropFailedBotMsg,
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
      failLastBotMsg: s.failLastBotMsg,
      dropFailedBotMsg: s.dropFailedBotMsg,
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
  // Read once per open; a fresh count arrives with each answer.
  const [left, setLeft] = useState<number | null>(leftToday);
  // The answer in flight, so Stop can cut it off. The server notices the
  // reader going away and stops the model too (cancel() in chat-handler.ts).
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // "math" swaps the OS keyboard out for MathLive's. AppShell unmounts this
  // whole overlay on close, so the lazy initialiser runs once per open — which
  // is exactly when we want to read the page underneath.
  const [mode, setMode] = useState<"text" | "math">("text");
  const [mathLayout] = useState(() => defaultMathLayout(pathname));

  const [attachment, setAttachment] = useState<Attachment | null>(null);
  // The photo on screen full-size, or null. A src, not a message id, so the
  // viewer needs no lookup and cannot point at a message that has since scrolled
  // out of the 40-message cap.
  const [viewing, setViewing] = useState<string | null>(null);
  // Bumped on every pick and every removal. A slow compression that finishes
  // after the student removed it or picked another photo must not land.
  const pickToken = useRef(0);

  async function attachPhoto(file: File) {
    const token = ++pickToken.current;
    if (file.size > MAX_PHOTO_FILE_BYTES) {
      setAttachment({ status: "error" });
      return;
    }
    setAttachment({ status: "processing" });
    try {
      const full = await compressImage(file);
      // The thumb is made from the already-shrunk copy, so the second decode is
      // of a ~300KB JPEG rather than the original 5MB photo.
      const thumb = await compressImage(full.blob, { maxEdge: 320, quality: 0.6 });
      const [data, thumbUrl] = await Promise.all([
        blobToBase64(full.blob),
        blobToDataUrl(thumb.blob),
      ]);
      if (token !== pickToken.current) return;
      setAttachment({
        status: "ready",
        full: { data, mimeType: full.contentType },
        thumb: thumbUrl,
      });
    } catch {
      if (token !== pickToken.current) return;
      setAttachment({ status: "error" });
    }
  }

  function removePhoto() {
    pickToken.current++;
    setAttachment(null);
  }

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
   * standard TeX rule that inline math may not be hugged by whitespace. It now
   * forgives padding around unmistakable TeX (`$ x^2 $` renders — the model
   * pads constantly, see looksLikeMath), but a padded `$ x $` is still refused,
   * so inserting inside the dollars would silently break the simplest formulas.
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
    const typed = (question ?? input).trim();
    // A starter question tapped from the empty chat is its own message; only
    // the composer's Send carries the attached photo.
    const photo =
      question === undefined && attachment?.status === "ready" ? attachment : null;
    if (loading || attachment?.status === "processing") return;
    if (!typed && !photo) return;
    const text = typed || PHOTO_QUESTION[lang];

    addChatMsg({ role: "user", text, ...(photo && { image: { thumb: photo.thumb } }) });
    track("kruai_question", { photo: Boolean(photo) });

    // Read the message back to get the id the store minted — the full photo is
    // held against it (lib/chat-images.ts). Same read-back the game uses before
    // publishing a competition, so the two copies share one identity.
    const after = useBrachNhaStore.getState();
    const sentId = after.conversations
      .find((c) => c.id === after.activeConversationId)
      ?.msgs.at(-1)?.id;
    if (photo && sentId) rememberImage(sentId, photo.full);

    setInput("");
    if (photo) setAttachment(null);
    await ask();
  }

  /** "Try again" under a failed bubble: drop it and ask the same question, so
   *  the new answer takes its place. A photo goes again too, while this page
   *  load still holds it. */
  async function retry() {
    if (loading) return;
    dropFailedBotMsg();
    await ask();
  }

  function stop() {
    abortRef.current?.abort();
  }

  /**
   * Asks KruAI about the conversation as it stands in the store, which ends
   * with the student's question, and streams the answer into a new bot bubble.
   */
  async function ask() {
    const now = useBrachNhaStore.getState();
    const history =
      now.conversations.find((c) => c.id === now.activeConversationId)?.msgs ?? [];

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

    setLoading(true);

    // Drop back to text mode so the math panel isn't covering the reply. Only
    // when it was open — sending in text mode keeps the keyboard up, as before.
    if (mode === "math") {
      setMode("text");
      inputRef.current?.blur();
    }

    // Empty bot bubble for the stream to fill in, chunk by chunk.
    addChatMsg({ role: "bot", text: "" });

    const controller = new AbortController();
    abortRef.current = controller;
    // Whether any of KruAI's own words reached the bubble, and, if the bubble
    // ends up holding our words instead, whether trying again can help.
    let received = false;
    let failed: "retry" | "final" | null = null;

    try {
      // Read at send time, never held in state: getSession() refreshes an
      // expired token on the spot, and the store is persisted — a token parked
      // in it would be written to localStorage on every unrelated update.
      //
      // A null token is not short-circuited here. The endpoint answers 401 with
      // a readable sentence, which the branch below renders, so the student
      // gets the same explanation whether their session was missing or merely
      // stale. The server is the gate; this is just how the key gets to it.
      const token = await getAccessToken();

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        // `screen` is read HERE, at send time, not when the overlay mounted.
        // ChatOverlay is global and survives navigation — that is what `chatOpen`
        // being a store field buys — so a student can open the mentor on a
        // section, navigate behind it and then ask. Where they are now is the
        // answer. The endpoint uses it to quote the app's own text back; see
        // pinnedContextFor in utils/chat-prompt.ts.
        body: JSON.stringify({
          messages: wireMessages(history),
          lang,
          profile,
          screen: screenRefFor(pathname),
        }),
        signal: controller.signal,
      });

      const leftHeader = res.headers.get(KRUAI_LEFT_HEADER);
      if (leftHeader !== null && Number.isFinite(Number(leftHeader))) {
        knownLeft = { n: Number(leftHeader), day: todayKey() };
        setLeft(knownLeft.n);
      }

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
        // Busy (429 with no daily limit named) and server-side failures can
        // pass on a second try. A daily limit, signing in and a refused photo
        // (4xx) cannot.
        const atLimit = res.headers.get(KRUAI_LIMIT_HEADER) !== null;
        failed = res.status >= 500 || (res.status === 429 && !atLimit) ? "retry" : "final";
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

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
        failed = "retry";
      }
    } catch {
      if (controller.signal.aborted) {
        // Stopped by the student. Words already on screen stay as they are:
        // they are KruAI's, if short. With nothing yet, a note says what
        // happened, and Try again is there if it was a slip.
        if (!received) {
          appendChatChunk(
            lang === "en" ? "⏹️ Stopped." : "⏹️ បានបញ្ឈប់។"
          );
          failed = "retry";
        }
      } else {
        // The connection dropped, before or during the answer. Half an answer
        // is not worth keeping in the history the model sees, so the whole
        // bubble counts as failed and Try again asks afresh.
        appendChatChunk(
          (received ? "\n" : "") +
            (lang === "en"
              ? "⚠️ No connection. Try again later."
              : "⚠️ គ្មានការតភ្ជាប់។ សូមព្យាយាមម្តងទៀត។")
        );
        failed = "retry";
      }
    } finally {
      abortRef.current = null;
      if (failed) failLastBotMsg(failed);
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
              <div className="max-w-[80%] rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text">
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
                    className="rounded-full border border-border bg-surface px-3 py-1.5 text-left text-xs font-bold text-purple transition hover:bg-purple/10"
                  >
                    {/* The exercise chip is LaTeX, so it typesets here exactly as
                        it will in the student's bubble once sent. Plain chips
                        pass through MathText untouched. */}
                    <MathText text={q} />
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
              // `m.id`, not the index. A conversation is capped with
              // `slice(-40)`, which drops from the FRONT, so past 40 messages
              // every index shifts and an index key has React reuse one
              // bubble's DOM node for a different message. Messages persisted
              // before ids existed have none and keep the index — correct for
              // history that has already settled and cannot move again.
              key={m.id ?? i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-semibold whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-brand text-white"
                    : "border border-border bg-surface text-text"
                }`}
              >
                {m.image && (
                  <PhotoInBubble
                    lang={lang}
                    msg={m}
                    onOpen={(src) => setViewing(src)}
                  />
                )}
                {/* Both sides carry LaTeX now: the model writes it (see
                    data/bac2-format.ts) and the math panel inserts it. Khmer
                    prose around a formula is safe — splitMath refuses to
                    typeset any $…$ containing Khmer. */}
                <MathText text={m.text} />
              </div>
            </div>
          );
        })}

        {/* Only under the LAST reply, and only once it has finished: an older
            guided reply is a step the student has already moved past, and a
            button under a reply still streaming would ask before it asked. */}
        {!loading &&
          msgs[msgs.length - 1]?.role === "bot" &&
          msgs[msgs.length - 1].text.trimStart().startsWith(GUIDE_MARK) && (
            <div className="flex justify-start">
              <button
                onClick={() => send(SHOW_SOLUTION[lang])}
                className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-extrabold text-purple transition hover:bg-purple/10"
              >
                <Lightbulb className="size-3.5" strokeWidth={2.5} />
                {lang === "en" ? "Show full solution" : "បង្ហាញដំណោះស្រាយពេញ"}
              </button>
            </div>
          )}

        {/* Only under the LAST bubble: an older failure was followed by a
            conversation that moved on. Not under "final" ones (the daily
            limit, signing in), where a second try cannot help. */}
        {!loading && msgs[msgs.length - 1]?.failed === "retry" && (
          <div className="flex justify-start">
            <button
              onClick={() => void retry()}
              className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-extrabold text-purple transition hover:bg-purple/10"
            >
              <RotateCcw className="size-3.5" strokeWidth={2.5} />
              {lang === "en" ? "Try again" : "ព្យាយាមម្តងទៀត"}
            </button>
          </div>
        )}

        {loading && !msgs[msgs.length - 1]?.text && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-surface px-4 py-2.5">
              <Bot className="size-3.5 text-purple" />
              <span className="text-xs font-bold text-muted">...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mx-auto w-full max-w-2xl shrink-0 border-t border-border p-3">
        {left !== null && left <= LOW_LEFT && (
          <div
            className={cn(
              "mb-2 px-1 text-xs font-bold",
              left === 0 ? "text-pink" : "text-muted"
            )}
          >
            {leftLine(left, attachment?.status === "ready", lang)}
          </div>
        )}
        {attachment && (
          <AttachmentChip
            lang={lang}
            status={attachment.status}
            thumb={attachment.status === "ready" ? attachment.thumb : undefined}
            onRemove={removePhoto}
          />
        )}
        <div className="flex items-center gap-2">
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
          <PhotoButton
            lang={lang}
            disabled={loading}
            className={cn(iconBtn, "size-10")}
            // The menu opens upward over the math keyboard's space; put that
            // keyboard away rather than stack the two.
            onOpen={() => setMode("text")}
            onPick={attachPhoto}
          />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            // Typing prose and building a formula are separate acts; reaching for
            // one puts the other keyboard away.
            onFocus={() => setMode("text")}
            placeholder={
              attachment?.status === "ready"
                ? lang === "en"
                  ? "Ask about this photo..."
                  : "សួរអំពីរូបភាពនេះ..."
                : t.askQuestion
            }
            className="min-w-0 flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-semibold outline-none focus:border-purple"
          />
          {/* While an answer is coming, Send becomes Stop: a long answer to the
              wrong question should not have to be sat through. */}
          {loading ? (
            <button
              onClick={stop}
              aria-label={lang === "en" ? "Stop" : "បញ្ឈប់"}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-white"
            >
              <Square className="size-3.5 fill-current" strokeWidth={2.5} />
            </button>
          ) : (
            <button
              onClick={() => send()}
              disabled={
                attachment?.status === "processing" ||
                (!input.trim() && attachment?.status !== "ready")
              }
              aria-label={t.send}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-white disabled:opacity-40"
            >
              <Send className="size-4.5" />
            </button>
          )}
        </div>
      </div>

      {mode === "math" && (
        <Suspense
          fallback={
            <div className="mx-auto flex h-[332px] w-full max-w-2xl shrink-0 items-center justify-center border-t border-border bg-surface text-xs font-bold text-muted">
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

      {viewing && (
        <PhotoViewer lang={lang} src={viewing} onClose={() => setViewing(null)} />
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

/**
 * A photo inside the student's own bubble. The full copy while this page load
 * still holds it (sharper, and what the model actually read); the persisted
 * thumb after a reload; and a plain "photo" chip once even the thumb was
 * trimmed by MAX_CHAT_THUMBS, so the bubble still says a photo was there.
 */
function PhotoInBubble({
  lang,
  msg,
  onOpen,
}: {
  lang: "en" | "km";
  msg: ChatMsg;
  onOpen: (src: string) => void;
}) {
  const full = imageFor(msg.id);
  const src = full ? `data:${full.mimeType};base64,${full.data}` : msg.image?.thumb;
  const label = lang === "en" ? "Photo" : "រូបភាព";

  if (!src) {
    return (
      <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold">
        <ImageIcon className="size-3.5" strokeWidth={2.5} />
        {label}
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onOpen(src)}
      aria-label={lang === "en" ? "Open photo" : "បើករូបភាព"}
      className="mb-2 block overflow-hidden rounded-xl bg-white/10"
    >
      <img
        src={src}
        alt={label}
        className="block max-h-60 w-auto max-w-full object-contain"
      />
    </button>
  );
}

/**
 * The photo full-screen, INSIDE the overlay (`absolute inset-0`), not portalled
 * to body — the same reason HistoryPanel is not a ui/sheet: a portal escapes the
 * shell's max-width frame. Tap anywhere or Escape to close.
 */
function PhotoViewer({
  lang,
  src,
  onClose,
}: {
  lang: "en" | "km";
  src: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={lang === "en" ? "Photo" : "រូបភាព"}
      onClick={onClose}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/90 p-4"
    >
      <img src={src} alt="" className="max-h-full max-w-full object-contain" />
      <button
        type="button"
        onClick={onClose}
        aria-label={lang === "en" ? "Close" : "បិទ"}
        className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/15 text-white"
      >
        <X className="size-5" strokeWidth={2.5} />
      </button>
    </div>
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
      <div className="mx-auto flex w-full max-w-2xl shrink-0 items-center justify-between gap-2 border-b border-border px-4 pt-4 pb-3">
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
                      ? "border border-border bg-secondary"
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
                        className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-extrabold text-purple"
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
