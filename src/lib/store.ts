import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Lang,
  UserData,
  Tasks,
  PendingPlacementTest,
  ChatMsg,
  Conversation,
  Commitment,
} from "@/types";
import { makeConversationTitle } from "@/utils/chat-history";

export type {
  Lang,
  UserData,
  Tasks,
  PendingPlacementTest,
  ChatMsg,
  Conversation,
  Commitment,
};

// Conversations are persisted, so both dimensions are capped — otherwise a
// chatty student slowly fills localStorage.
const MAX_CHAT_MSGS = 40; // per conversation
const MAX_CONVERSATIONS = 20; // oldest-updated dropped first

function newId(): string {
  // randomUUID needs a secure context; localhost and https both qualify, but
  // fall back rather than throw on an http:// LAN address during testing.
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export interface ExamResult {
  score: number;
  total: number;
  pct: number;
  date: string;
}

export interface LoginData {
  name: string;
  language: "english" | "french";
  email?: string;
  age?: string;
  location?: string;
}

interface BrachNhaState {
  // ── onboarding / profile ──
  lang: Lang;
  userName: string;
  userEmail: string;
  userAge: string;
  userLocation: string;
  userLanguage: "" | "english" | "french";
  surveyed: boolean;
  userData: UserData;
  pendingPlacementTests: PendingPlacementTest[];
  /** null until the student signs their roadmap pledge. Skippable, so a
   *  surveyed student can stay null indefinitely. */
  commitment: Commitment | null;

  // ── progression (was scattered useState in App() before) ──
  xp: number;
  level: number;
  streak: number;
  tasks: Tasks;
  examResults: ExamResult[];

  // ── ui ──
  chatOpen: boolean;
  drawerOpen: boolean;
  /** The commitment overlay. Lives here (not in RoadmapView's useState) because
   *  AppShell renders the overlay — RoadmapView's own root is a scrolling
   *  container, so an absolute panel inside it would anchor to scrolled
   *  content instead of the app frame. Same reasoning as chatOpen. */
  pledgeOpen: boolean;

  // ── ai mentor chat ──
  // Lives here rather than in ChatOverlay's useState because AppShell unmounts
  // the overlay on close ({chatOpen && <ChatOverlay />}), which used to wipe
  // the conversation every time the student closed the mentor.
  conversations: Conversation[];
  /** null means a blank chat that hasn't been saved yet — addChatMsg creates
   *  the real conversation on the first message. */
  activeConversationId: string | null;

  // ── actions ──
  setLang: (lang: Lang) => void;
  completeLogin: (data: LoginData) => void;
  completeSurvey: (data: UserData) => void;
  schedulePlacementTest: (subject: string, scheduledDate: string) => void;
  resolvePlacementTest: (subject: string, isWeak: boolean) => void;
  signCommitment: (commitment: Commitment) => void;
  addXp: (amount: number) => void;
  completeTask: (task: keyof Tasks) => void;
  addExamResult: (result: ExamResult) => void;
  resetDailyTasks: () => void;
  setChatOpen: (open: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
  setPledgeOpen: (open: boolean) => void;
  addChatMsg: (msg: ChatMsg) => void;
  appendChatChunk: (text: string) => void;
  startNewChat: () => void;
  openConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  logout: () => void;
}

const emptyTasks: Tasks = {
  lesson: false,
  practice: false,
  flashcards: false,
  challenge: false,
};

const emptyUserData: UserData = {
  strengths: [],
  weaknesses: [],
  grade: "",
  months: "",
};

// Named rather than inline so `migrate` can borrow its return type — the two
// have to agree on exactly which keys reach localStorage.
const partializeState = (state: BrachNhaState) => ({
  lang: state.lang,
  userName: state.userName,
  userEmail: state.userEmail,
  userAge: state.userAge,
  userLocation: state.userLocation,
  userLanguage: state.userLanguage,
  surveyed: state.surveyed,
  userData: state.userData,
  pendingPlacementTests: state.pendingPlacementTests,
  commitment: state.commitment,
  xp: state.xp,
  level: state.level,
  streak: state.streak,
  tasks: state.tasks,
  examResults: state.examResults,
  conversations: state.conversations,
  activeConversationId: state.activeConversationId,
  // chatOpen/drawerOpen/pledgeOpen intentionally excluded — UI state
});

type PersistedState = ReturnType<typeof partializeState>;

export const useBrachNhaStore = create<BrachNhaState>()(
  persist(
    (set) => ({
      lang: "en",
      userName: "",
      userEmail: "",
      userAge: "",
      userLocation: "",
      userLanguage: "",
      surveyed: false,
      userData: emptyUserData,
      pendingPlacementTests: [],
      commitment: null,

      xp: 0,
      level: 1,
      streak: 3,
      tasks: emptyTasks,
      examResults: [],

      chatOpen: false,
      drawerOpen: false,
      pledgeOpen: false,
      conversations: [],
      activeConversationId: null,

      setLang: (lang) => set({ lang }),
      completeLogin: (data) =>
        set({
          userName: data.name,
          userLanguage: data.language,
          userEmail: data.email ?? "",
          userAge: data.age ?? "",
          userLocation: data.location ?? "",
        }),

      completeSurvey: (data) =>
        set({ userData: data, surveyed: true }),

      schedulePlacementTest: (subject, scheduledDate) =>
        set((state) => ({
          pendingPlacementTests: [
            ...state.pendingPlacementTests.filter(
              (p) => p.subject !== subject
            ),
            { subject, scheduledDate },
          ],
        })),

      resolvePlacementTest: (subject, isWeak) =>
        set((state) => {
          const weaknesses = isWeak
            ? Array.from(new Set([...state.userData.weaknesses, subject]))
            : state.userData.weaknesses.filter((s) => s !== subject);
          return {
            pendingPlacementTests: state.pendingPlacementTests.filter(
              (p) => p.subject !== subject
            ),
            userData: { ...state.userData, weaknesses },
          };
        }),

      // Re-signing overwrites: there's only ever one live pledge, and the new
      // one re-snapshots whatever the plan says today.
      signCommitment: (commitment) => set({ commitment }),

      addXp: (amount) =>
        set((state) => {
          const nextXp = state.xp + amount;
          const nextLevel =
            nextXp >= state.level * 100 ? state.level + 1 : state.level;
          return { xp: nextXp, level: nextLevel };
        }),

      completeTask: (task) =>
        set((state) => {
          if (state.tasks[task]) return state; // already done, no-op
          const nextXp = state.xp + 20;
          const nextLevel =
            nextXp >= state.level * 100 ? state.level + 1 : state.level;
          return {
            tasks: { ...state.tasks, [task]: true },
            xp: nextXp,
            level: nextLevel,
          };
        }),

      resetDailyTasks: () => set({ tasks: emptyTasks }),

      addExamResult: (result) =>
        set((state) => ({ examResults: [...state.examResults, result] })),

      setChatOpen: (open) => set({ chatOpen: open }),
      setDrawerOpen: (open) => set({ drawerOpen: open }),
      setPledgeOpen: (open) => set({ pledgeOpen: open }),

      // Creates the conversation lazily on the first message, so "New chat"
      // never leaves an empty row in the history list.
      addChatMsg: (msg) =>
        set((state) => {
          const now = new Date().toISOString();
          const active = state.conversations.find(
            (c) => c.id === state.activeConversationId
          );

          if (!active) {
            const created: Conversation = {
              id: newId(),
              title: makeConversationTitle(msg.text),
              msgs: [msg],
              createdAt: now,
              updatedAt: now,
            };
            return {
              conversations: [created, ...state.conversations].slice(
                0,
                MAX_CONVERSATIONS
              ),
              activeConversationId: created.id,
            };
          }

          const updated: Conversation = {
            ...active,
            msgs: [...active.msgs, msg].slice(-MAX_CHAT_MSGS),
            // A conversation that somehow opened with a bot bubble gets titled
            // by the first user message that does arrive.
            title:
              active.title ||
              (msg.role === "user" ? makeConversationTitle(msg.text) : ""),
            updatedAt: now,
          };

          // Move to the front: the array is kept sorted newest-updated-first so
          // the MAX_CONVERSATIONS cap always drops the least recently used one.
          return {
            conversations: [
              updated,
              ...state.conversations.filter((c) => c.id !== active.id),
            ],
          };
        }),

      // Streaming writes here: each chunk off the wire is glued onto the last
      // bot bubble, which addChatMsg pushed empty just before the request.
      appendChatChunk: (text) =>
        set((state) => {
          const active = state.conversations.find(
            (c) => c.id === state.activeConversationId
          );
          const last = active?.msgs[active.msgs.length - 1];
          if (!active || !last || last.role !== "bot") return state;

          return {
            conversations: state.conversations.map((c) =>
              c.id === active.id
                ? {
                    ...c,
                    msgs: [
                      ...c.msgs.slice(0, -1),
                      { ...last, text: last.text + text },
                    ],
                  }
                : c
            ),
          };
        }),

      startNewChat: () => set({ activeConversationId: null }),

      openConversation: (id) => set({ activeConversationId: id }),

      deleteConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          activeConversationId:
            state.activeConversationId === id
              ? null
              : state.activeConversationId,
        })),

      logout: () =>
        set({
          userName: "",
          userEmail: "",
          userAge: "",
          userLocation: "",
          userLanguage: "",
          surveyed: false,
          userData: emptyUserData,
          pendingPlacementTests: [],
          commitment: null,
          xp: 0,
          level: 1,
          streak: 3,
          tasks: emptyTasks,
          examResults: [],
          conversations: [],
          activeConversationId: null,
        }),
    }),
    {
      name: "brachnha", // same localStorage key as the current prototype
      partialize: partializeState,

      // Stamps new writes so a future schema change CAN use `migrate`. Note it
      // does NOT help with the v0 data already in students' browsers — see below.
      version: 1,

      // The legacy conversion lives in `merge`, not `migrate`, on purpose.
      // zustand only calls `migrate` when the stored payload carries a numeric
      // `version` (node_modules/zustand/middleware.js:395), and the previous
      // build set no `version` option — so JSON.stringify omitted the key and
      // `migrate` would never fire for exactly the data it was meant to rescue.
      // `merge` runs on every hydration regardless, so it always sees v0 data.
      merge: (persisted, current) => {
        const { chatMsgs, ...rest } = (persisted ?? {}) as Partial<PersistedState> & {
          chatMsgs?: ChatMsg[];
        };
        const merged = { ...current, ...rest };

        // v0 → v1: one flat `chatMsgs` array becomes a single Conversation, so
        // a student who already had a chat saved doesn't silently lose it.
        if (Array.isArray(chatMsgs) && chatMsgs.length && !merged.conversations.length) {
          const now = new Date().toISOString();
          const firstUserMsg = chatMsgs.find((m) => m.role === "user");
          const restored: Conversation = {
            id: newId(),
            title: makeConversationTitle(firstUserMsg?.text ?? ""),
            msgs: chatMsgs.slice(-MAX_CHAT_MSGS),
            createdAt: now,
            updatedAt: now,
          };
          merged.conversations = [restored];
          merged.activeConversationId = restored.id;
        }

        return merged;
      },
    }
  )
);
