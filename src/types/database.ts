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

/** The roles user_roles' CHECK allows (20261002000001, owner added by
 *  20261002000002). An owner is an admin everywhere and the only one who can
 *  manage admins; the owner role itself is set in the SQL editor only. A
 *  Teacher role later is one more member here and one wider CHECK there. */
export type AppRole = "admin" | "owner";

/** Which kind of content a row holds (20261003000001; section and paper since
 *  20261003000002; game since 20261007000001). The same union the app uses,
 *  restated so this file keeps importing nothing from the app. */
export type ContentKind = "deck" | "quiz" | "section" | "paper" | "game";

/** announcements.tone (20261002000005): which neo fill the banner wears. */
export type AnnouncementTone = "info" | "success" | "warning";

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

      // supabase/migrations/20260929000001_kruai_usage.sql. KruAI's daily
      // question count per student. Written ONLY by the kruai_take function
      // (no insert/update policy); readable by its owner. Nothing in the
      // client reads it yet. The FK is to auth.users, not profiles, so there is
      // no ProfileFk relationship to declare.
      kruai_usage: {
        Row: {
          user_id: string;
          usage_date: string;
          units: number;
        };
        Insert: {
          user_id: string;
          usage_date: string;
          units?: number;
        };
        Update: Partial<Database["public"]["Tables"]["kruai_usage"]["Insert"]>;
        Relationships: [];
      };

      // supabase/migrations/20261001000001_telemetry.sql. Written ONLY by
      // log_client_error() / log_event() and readable by no client (RLS on, no
      // policies). Declared so the types mirror the SQL; the client never
      // queries either table directly.
      client_errors: {
        Row: {
          id: number;
          user_id: string | null;
          message: string;
          stack: string | null;
          route: string | null;
          app_version: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          message: string;
          stack?: string | null;
          route?: string | null;
          app_version?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["client_errors"]["Insert"]>;
        Relationships: [];
      };
      app_events: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          props: Json;
          event_date: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          props?: Json;
          event_date: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["app_events"]["Insert"]>;
        Relationships: [];
      };

      // supabase/migrations/20261001000002_account_deletion_and_reports.sql.
      // Insert-own (only about a photo in a competition you took part in) and
      // read-own; no update or delete.
      photo_reports: {
        Row: {
          id: number;
          reporter_id: string;
          competition_id: string;
          photo_path: string;
          reason: "inappropriate" | "not_work" | "other";
          created_at: string;
          // 20261001000003_report_review.sql: the team's decision, recorded
          // rather than the row deleted. Null while the report is open.
          resolution: "kept" | "deleted" | null;
          resolved_at: string | null;
          resolved_by: string | null;
        };
        Insert: {
          reporter_id: string;
          competition_id: string;
          photo_path: string;
          reason?: "inappropriate" | "not_work" | "other";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["photo_reports"]["Insert"]>;
        Relationships: [];
      };

      // 20261002000001_roles_and_admin_tools.sql (it replaced app_admins). Who
      // has which role. No client policies: read only through has_role() and
      // the admin_* functions, written by admin_set_role() or the SQL editor.
      user_roles: {
        Row: {
          user_id: string;
          role: AppRole;
          granted_by: string | null;
          granted_at: string;
        };
        Insert: {
          user_id: string;
          role: AppRole;
          granted_by?: string | null;
          granted_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Insert"]>;
        Relationships: [];
      };

      // 20261002000004_kruai_controls.sql. Settings the owner changes from the
      // admin area; today only "kruai_limits" ({ user_daily, app_daily }). No
      // client policies: read inside kruai_take and admin_kruai_overview().
      app_settings: {
        Row: {
          key: string;
          value: Json;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["app_settings"]["Insert"]>;
        Relationships: [];
      };

      // 20261002000004_kruai_controls.sql. Students whose KruAI is paused. No
      // client policies: written by admin_set_kruai_block() only.
      kruai_blocks: {
        Row: {
          user_id: string;
          reason: string | null;
          blocked_by: string | null;
          blocked_at: string;
        };
        Insert: {
          user_id: string;
          reason?: string | null;
          blocked_by?: string | null;
          blocked_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["kruai_blocks"]["Insert"]>;
        Relationships: [];
      };

      // 20261002000005_announcements_and_content_reports.sql. Banners for every
      // student. Anyone (guests too) may read the LIVE ones; nothing is
      // writable from a client: admins publish through admin_publish_announcement().
      announcements: {
        Row: {
          id: number;
          body_km: string;
          body_en: string | null;
          tone: AnnouncementTone;
          link: string | null;
          starts_at: string;
          ends_at: string | null;
          active: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          body_km: string;
          body_en?: string | null;
          tone?: AnnouncementTone;
          link?: string | null;
          starts_at?: string;
          ends_at?: string | null;
          active?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["announcements"]["Insert"]>;
        Relationships: [];
      };

      // 20261002000005. A student's report of a mistake in one question. Read
      // own only; written by report_content() only.
      content_reports: {
        Row: {
          id: number;
          reporter_id: string;
          content_ref: string;
          kind: "wrong_answer" | "typo" | "unclear" | "other";
          note: string | null;
          created_at: string;
          resolution: "fixed" | "not_mistake" | null;
          resolved_at: string | null;
          resolved_by: string | null;
        };
        Insert: {
          reporter_id: string;
          content_ref: string;
          kind: "wrong_answer" | "typo" | "unclear" | "other";
          note?: string | null;
          created_at?: string;
          resolution?: "fixed" | "not_mistake" | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["content_reports"]["Insert"]>;
        Relationships: [];
      };

      // 20261003000001_content_in_database.sql. Flashcard decks and practice
      // quizzes. The PUBLISHED rows of content_items (the manifest) and every
      // content_versions row are readable by anyone, guests too; nothing is
      // writable from a client, and content_drafts is not readable either. The
      // admin_* functions below do every write.
      content_items: {
        Row: {
          kind: ContentKind;
          key: string;
          version: number | null;
          item_count: number;
          item_ids: string[];
          updated_at: string;
        };
        Insert: {
          kind: ContentKind;
          key: string;
          version?: number | null;
          item_count?: number;
          item_ids?: string[];
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["content_items"]["Insert"]>;
        Relationships: [];
      };
      content_versions: {
        Row: {
          kind: ContentKind;
          key: string;
          version: number;
          body: Json;
          published_at: string;
          published_by: string | null;
        };
        Insert: {
          kind: ContentKind;
          key: string;
          version: number;
          body: Json;
          published_at?: string;
          published_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["content_versions"]["Insert"]>;
        Relationships: [];
      };
      content_drafts: {
        Row: {
          kind: ContentKind;
          key: string;
          body: Json;
          base_version: number | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          kind: ContentKind;
          key: string;
          body: Json;
          base_version?: number | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["content_drafts"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      // 20261001000001_telemetry.sql. Anyone (guests included) may report an
      // error; the function caps it per hour.
      log_client_error: {
        Args: {
          p_message: string;
          p_stack: string;
          p_route: string;
          p_version: string;
          p_ua: string;
        };
        Returns: undefined;
      };
      // Signed-in students only; the event name must be on the allow-list.
      log_event: {
        Args: { p_name: string; p_props: Json };
        Returns: undefined;
      };
      // 20261001000002_account_deletion_and_reports.sql. Deletes the CALLER's
      // auth user; every table cascades. Storage is cleared by the client first.
      delete_my_account: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      // 20261001000003_report_review.sql, redefined by 20261002000001 as
      // has_role('admin'). Every admin_* function refuses a non-admin caller.
      is_app_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      // 20261002000001_roles_and_admin_tools.sql. Answers for the CALLER only.
      has_role: {
        Args: { p_role: AppRole };
        Returns: boolean;
      };
      // Owner only (20261002000002), and only the admin role: the owner role is
      // never granted or removed from the app.
      admin_set_role: {
        Args: { p_user: string; p_role: "admin"; p_grant: boolean };
        Returns: undefined;
      };
      admin_students: {
        Args: { p_search: string; p_limit: number };
        Returns: {
          id: string;
          display_name: string;
          email: string;
          joined_at: string;
          last_seen: string | null;
          xp: number;
          level: number;
          streak: number;
          active_days_30: number;
          kruai_today: number;
          kruai_7d: number;
          is_admin: boolean;
          is_owner: boolean;
          // 20261002000004: KruAI is paused for this student.
          kruai_blocked: boolean;
        }[];
      };
      admin_user_competition_ids: {
        Args: { p_user: string };
        Returns: { competition_id: string; created: boolean }[];
      };
      admin_delete_user: {
        Args: { p_user: string };
        Returns: boolean;
      };
      // One jsonb document. Its shape is AdminDashboard in lib/admin-tools.ts,
      // and it is checked there rather than trusted.
      admin_dashboard: {
        Args: Record<string, never>;
        Returns: Json;
      };
      admin_photo_reports: {
        Args: Record<string, never>;
        Returns: {
          photo_path: string;
          competition_id: string;
          owner_id: string | null;
          owner_name: string | null;
          reports: number;
          reasons: string[];
          first_reported: string;
          last_reported: string;
        }[];
      };
      admin_resolve_photo: {
        Args: { p_photo_path: string; p_resolution: "kept" | "deleted" };
        Returns: number;
      };
      // 20260929000001_kruai_usage.sql. Charges the CALLER `p_units` against
      // today's limits and says whether it was allowed. Called by the server
      // (server/kruai-quota.ts) with the student's own token.
      kruai_take: {
        Args: { p_units: number };
        Returns: {
          allowed: boolean;
          user_units: number;
          all_units: number;
          reason: string | null;
          // 20261002000004: the student limit that was enforced. Absent before
          // that migration; server/kruai-quota.ts falls back to 30.
          user_limit?: number;
        }[];
      };
      // 20261002000004_kruai_controls.sql, behind /admin/kruai. One jsonb
      // document; its shape is KruaiOverview in lib/admin-tools.ts, checked
      // there rather than trusted.
      admin_kruai_overview: {
        Args: Record<string, never>;
        Returns: Json;
      };
      // Owner only. Bounded 1 to 200 a student, 1 to 10000 for the whole app.
      admin_set_kruai_limits: {
        Args: { p_user_daily: number; p_app_daily: number };
        Returns: undefined;
      };
      // Any admin. Refuses pausing yourself, the owner or an admin.
      admin_set_kruai_block: {
        Args: { p_user: string; p_blocked: boolean; p_reason: string };
        Returns: undefined;
      };
      // 20261002000005. Every announcement, newest first (admins only).
      admin_announcements: {
        Args: Record<string, never>;
        Returns: {
          id: number;
          body_km: string;
          body_en: string | null;
          tone: AnnouncementTone;
          link: string | null;
          starts_at: string;
          ends_at: string | null;
          active: boolean;
          live: boolean;
          created_at: string;
          created_by_name: string;
        }[];
      };
      // Refusals carry a hint: body, link, ends.
      admin_publish_announcement: {
        Args: {
          p_body_km: string;
          p_body_en: string | null;
          p_tone: AnnouncementTone;
          p_link: string | null;
          p_ends_at: string | null;
        };
        Returns: number;
      };
      admin_end_announcement: {
        Args: { p_id: number };
        Returns: boolean;
      };
      // Signed-in students. True for a new report, false when already open.
      // At most 30 a day (hint too_many).
      report_content: {
        Args: { p_ref: string; p_kind: string; p_note: string };
        Returns: boolean;
      };
      // Open reports grouped by question (admins only).
      admin_content_reports: {
        Args: Record<string, never>;
        Returns: {
          content_ref: string;
          reports: number;
          kinds: string[];
          notes: string[] | null;
          first_reported: string;
          last_reported: string;
        }[];
      };
      admin_resolve_content: {
        Args: { p_ref: string; p_resolution: "fixed" | "not_mistake" };
        Returns: number;
      };
      // 20261003000001. The current body of every published item of one kind
      // (anyone, guests too).
      content_current: {
        Args: { p_kind: ContentKind };
        Returns: { key: string; version: number; body: Json }[];
      };
      // The rest are admins only. Refusals carry a hint: key, shape, stale,
      // missing, owner_only.
      admin_content_list: {
        Args: Record<string, never>;
        Returns: {
          kind: ContentKind;
          key: string;
          published_version: number | null;
          published_count: number | null;
          published_at: string | null;
          draft_updated_at: string | null;
          draft_updated_by: string | null;
          draft_count: number | null;
        }[];
      };
      // { published, draft, used_ids, versions }; shaped at the boundary in
      // lib/admin-content.ts.
      admin_content_get: {
        Args: { p_kind: ContentKind; p_key: string };
        Returns: Json;
      };
      admin_save_content_draft: {
        Args: { p_kind: ContentKind; p_key: string; p_body: Json; p_expected: string | null };
        Returns: string;
      };
      admin_discard_content_draft: {
        Args: { p_kind: ContentKind; p_key: string; p_expected: string | null };
        Returns: boolean;
      };
      admin_restore_content_version: {
        Args: { p_kind: ContentKind; p_key: string; p_version: number; p_expected: string | null };
        Returns: string;
      };
      // Owner only.
      admin_publish_content: {
        Args: { p_kind: ContentKind; p_key: string; p_expected: string | null };
        Returns: number;
      };
      admin_unpublish_content: {
        Args: { p_kind: ContentKind; p_key: string };
        Returns: boolean;
      };
      admin_import_content: {
        Args: { p_items: Json; p_publish: boolean };
        Returns: { item_kind: ContentKind; item_key: string; outcome: "published" | "draft" | "skipped" }[];
      };
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
