/**
 * Hand-written mirror of supabase/migrations/*.sql.
 *
 * This is the same shape `supabase gen types typescript` emits, written by hand
 * because the CLI is not installed and the schema is small enough that a
 * generated file would be one more thing to remember to regenerate. If the CLI
 * is ever added, that command should overwrite this file wholesale rather than
 * the two being maintained in parallel.
 *
 * Row / Insert / Update are three different shapes on purpose, and the split is
 * what makes the sync layer typecheck honestly:
 *   Row    — what SELECT gives back. Every column present.
 *   Insert — what INSERT needs. Columns with a database default are optional.
 *   Update — every column optional.
 *
 * `Relationships` is NOT optional decoration, however unused it looks. It is a
 * required member of postgrest-js's GenericTable, and a table missing it fails
 * the GenericSchema constraint — at which point the client silently degrades
 * every query's type to `never` instead of erroring at the definition. The
 * symptom is dozens of "not assignable to parameter of type never[]" errors in
 * the CALLER, pointing at perfectly correct code. Entries here also drive
 * embedded selects: `conversations.select("*, chat_messages(...)")` typechecks
 * only because chat_messages declares a relationship back to conversations.
 */

/** What postgrest gives back for a jsonb column. Only competitions.questions
 *  uses it; the concrete shape is asserted once, at the boundary in
 *  lib/competitions.ts, rather than pretended to here — this file mirrors the
 *  SQL, and the SQL says jsonb. */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ProfileFk<Name extends string> = {
  foreignKeyName: Name;
  columns: ["user_id"];
  isOneToOne: false;
  referencedRelation: "profiles";
  referencedColumns: ["id"];
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          email: string | null;
          age: number | null;
          location: string | null;
          study_language: "english" | "french" | null;
          ui_lang: "en" | "km";
          theme: "light" | "dark";
          xp: number;
          level: number;
          coins: number;
          streak: number;
          surveyed: boolean;
          studied: boolean;
          grade: string;
          strengths: string[];
          weaknesses: string[];
          pledge_seen: boolean;
          active_conversation_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          email?: string | null;
          age?: number | null;
          location?: string | null;
          study_language?: "english" | "french" | null;
          ui_lang?: "en" | "km";
          theme?: "light" | "dark";
          xp?: number;
          level?: number;
          coins?: number;
          streak?: number;
          surveyed?: boolean;
          studied?: boolean;
          grade?: string;
          strengths?: string[];
          weaknesses?: string[];
          pledge_seen?: boolean;
          active_conversation_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        // The only foreign key is id → auth.users, which is outside the public
        // schema and so is never embeddable from here.
        Relationships: [];
      };

      pending_placement_tests: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          scheduled_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          scheduled_date?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["pending_placement_tests"]["Insert"]
        >;
        Relationships: [ProfileFk<"pending_placement_tests_user_id_fkey">];
      };

      commitments: {
        Row: {
          id: string;
          user_id: string;
          kind: "drawn" | "typed";
          signature: string;
          signed_at: string;
          grade: string;
          months: string;
          hours_per_day: number;
          mission_lessons: number;
          mission_practice: number;
          mission_flashcards: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: "drawn" | "typed";
          signature: string;
          signed_at?: string;
          grade?: string;
          months?: string;
          hours_per_day?: number;
          mission_lessons?: number;
          mission_practice?: number;
          mission_flashcards?: number;
        };
        Update: Partial<Database["public"]["Tables"]["commitments"]["Insert"]>;
        Relationships: [ProfileFk<"commitments_user_id_fkey">];
      };

      daily_activity: {
        Row: {
          id: string;
          user_id: string;
          activity_date: string;
          task_lesson: boolean;
          task_practice: boolean;
          task_flashcards: boolean;
          task_challenge: boolean;
          questions_answered: number;
          xp_earned: number;
          study_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_date?: string;
          task_lesson?: boolean;
          task_practice?: boolean;
          task_flashcards?: boolean;
          task_challenge?: boolean;
          questions_answered?: number;
          xp_earned?: number;
          study_minutes?: number;
        };
        Update: Partial<
          Database["public"]["Tables"]["daily_activity"]["Insert"]
        >;
        Relationships: [ProfileFk<"daily_activity_user_id_fkey">];
      };

      /**
       * One row per (student, day, piece of content) — the server copy of the
       * store's `contentLog`, and the only place a scored question is
       * attributed to a subject. See 20260916000001_content_activity.sql.
       *
       * `content_key` is a lesson key ("biology-3-1") or a bare subject id.
       * Deliberately not a foreign key: the content itself lives in src/data/.
       */
      daily_content_activity: {
        Row: {
          id: string;
          user_id: string;
          activity_date: string;
          content_key: string;
          answered: number;
          correct: number;
          reviewed: number;
          sessions: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_date: string;
          content_key: string;
          answered?: number;
          correct?: number;
          reviewed?: number;
          sessions?: number;
        };
        Update: Partial<
          Database["public"]["Tables"]["daily_content_activity"]["Insert"]
        >;
        Relationships: [ProfileFk<"daily_content_activity_user_id_fkey">];
      };

      exam_results: {
        Row: {
          id: string;
          user_id: string;
          kind: ExamResultKind;
          subject: string | null;
          score: number;
          total: number;
          pct: number;
          taken_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind?: ExamResultKind;
          subject?: string | null;
          score: number;
          total: number;
          pct: number;
          taken_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["exam_results"]["Insert"]>;
        Relationships: [ProfileFk<"exam_results_user_id_fkey">];
      };

      completed_sessions: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          completed_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["completed_sessions"]["Insert"]
        >;
        Relationships: [ProfileFk<"completed_sessions_user_id_fkey">];
      };

      // ── competitions (the Game feature) ────────────────────────────────
      // The first cross-user tables in the schema: a competition is readable by
      // every signed-in student. See 20260913000001_competitions.sql for why
      // that is safe and why `creator_name` is denormalised rather than joined.
      competitions: {
        Row: {
          id: string;
          creator_id: string;
          creator_name: string;
          subject: string;
          difficulty: string;
          minutes: number;
          /** The frozen question set. `Json` rather than ExamQuestion[] because
           *  this file mirrors the SQL, and the column is jsonb — the shape is
           *  asserted once, at the boundary in lib/competitions.ts. */
          questions: Json;
          /** Which option the creator picked per question, same jsonb treatment
           *  as `questions` above. Defaults to `[]` on rows written before
           *  20260914000001, which the client reads as "not recorded". */
          creator_answers: Json;
          creator_score: number;
          creator_ms: number;
          total: number;
          created_at: string;
        };
        Insert: {
          id: string;
          creator_id: string;
          creator_name?: string;
          subject: string;
          difficulty?: string;
          minutes: number;
          questions?: Json;
          creator_answers?: Json;
          creator_score: number;
          creator_ms: number;
          total: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["competitions"]["Insert"]>;
        // NOT ProfileFk: that generic hardcodes columns: ["user_id"], and this
        // table's owner column is creator_id.
        Relationships: [
          {
            foreignKeyName: "competitions_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      competition_attempts: {
        Row: {
          id: string;
          competition_id: string;
          user_id: string;
          user_name: string;
          score: number;
          ms: number;
          /** This joiner's picks per question — see competitions.creator_answers. */
          answers: Json;
          played_at: string;
        };
        Insert: {
          id?: string;
          competition_id: string;
          user_id: string;
          user_name?: string;
          score: number;
          ms: number;
          answers?: Json;
          played_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["competition_attempts"]["Insert"]
        >;
        // Two relationships: one to the competition, one to the student. The
        // first is what lets a creator embed attempts on their own competition
        // in a single select.
        Relationships: [
          ProfileFk<"competition_attempts_user_id_fkey">,
          {
            foreignKeyName: "competition_attempts_competition_id_fkey";
            columns: ["competition_id"];
            isOneToOne: false;
            referencedRelation: "competitions";
            referencedColumns: ["id"];
          },
        ];
      };

      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversations"]["Insert"]>;
        Relationships: [ProfileFk<"conversations_user_id_fkey">];
      };

      chat_messages: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string;
          seq: number;
          role: "user" | "bot";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          user_id: string;
          seq: number;
          role: "user" | "bot";
          content?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chat_messages"]["Insert"]>;
        Relationships: [
          {
            // This entry is what makes the one-to-many embed in
            // pullRemoteState resolve. Without it the messages come back
            // untyped.
            foreignKeyName: "chat_messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          ProfileFk<"chat_messages_user_id_fkey">,
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      // supabase/migrations/20260916000004_leaderboard.sql. Returns real
      // students only (never the caller) with public-safe columns.
      leaderboard: {
        Args: { p_today: string };
        Returns: {
          id: string;
          display_name: string;
          xp_week: number;
          xp_month: number;
          xp_all: number;
          minutes_week: number;
          minutes_month: number;
          minutes_all: number;
          streak_now: number;
          streak_month: number;
          streak_all: number;
        }[];
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

/**
 * Which flow an attempt came from.
 *
 * Only 'mock' is replayed into the store's `examResults`. The other two exist
 * so past-paper and placement attempts can be RECORDED without being counted
 * as mock exams — Home's "from mock exams" stat pill, the average KruAI is told
 * about, and the generated-exam tab's "Previous Results" list all read that
 * array and would all become wrong if it were widened. See the exam_results
 * comment in the schema migration.
 */
export type ExamResultKind = "mock" | "past_paper" | "placement";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertOf<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
