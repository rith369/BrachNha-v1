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
    Functions: { [_ in never]: never };
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
