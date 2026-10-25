import type { AuditAction } from "@/lib/admin-tools";
import type { ContentKind, Lang } from "@/types";

/**
 * The words of /admin/audit, both languages. Each action is a sentence
 * template: {a} is the admin, {t} the student, {c} the content item and {n} a
 * number. The view swaps them for bold names, so a template never has to know
 * how a name is drawn.
 *
 * These sentences are claims about what the SQL records
 * (supabase/migrations/20261026000001_admin_audit_log.sql). Add an action
 * there, add its sentence here, in both languages; `satisfies` makes a
 * missing one fail to compile.
 */

export type AuditGroup = "students" | "kruai" | "content" | "reports" | "announcements" | "errors";

export const AUDIT_GROUP: Record<AuditAction, AuditGroup> = {
  role_grant: "students",
  role_revoke: "students",
  student_delete: "students",
  kruai_limits: "kruai",
  kruai_pause: "kruai",
  kruai_resume: "kruai",
  announcement_publish: "announcements",
  announcement_end: "announcements",
  photo_kept: "reports",
  photo_deleted: "reports",
  mistake_fixed: "reports",
  mistake_not_mistake: "reports",
  error_fixed: "errors",
  content_publish: "content",
  content_unpublish: "content",
  content_restore: "content",
  content_discard: "content",
  content_import: "content",
};

const en = {
  title: "Audit log",
  kicker: "Administration history",
  blurb: "Review who changed what and when. Every change an admin makes is recorded here; saving a draft is not.",
  ownerOnlyNote: "Changes to who is an admin are shown to the owner only.",
  tool: "Audit log",
  toolBlurb: "Who changed what, and when.",
  groups: {
    all: "All",
    students: "Students",
    kruai: "KruAI",
    content: "Content",
    reports: "Reports",
    announcements: "Announcements",
    errors: "Errors",
  } satisfies Record<AuditGroup | "all", string>,
  today: "Today",
  kinds: {
    deck: "Flashcard deck",
    quiz: "Quiz",
    section: "Lesson section",
    paper: "Past paper",
    game: "Game questions",
  } satisfies Record<ContentKind, string>,
  person: "Who",
  everyone: "Everyone",
  someone: "Someone",
  aStudent: "a student",
  actions: {
    role_grant: "{a} made {t} an admin",
    role_revoke: "{a} removed {t} as an admin",
    student_delete: "{a} deleted the account of {t}",
    kruai_limits: "{a} changed the KruAI daily limits",
    kruai_pause: "{a} paused KruAI for {t}",
    kruai_resume: "{a} turned KruAI back on for {t}",
    announcement_publish: "{a} posted an announcement",
    announcement_end: "{a} ended an announcement",
    photo_kept: "{a} kept a reported photo by {t}",
    photo_deleted: "{a} deleted a reported photo by {t}",
    mistake_fixed: "{a} marked a mistake report fixed",
    mistake_not_mistake: "{a} closed a mistake report as not a mistake",
    error_fixed: "{a} marked an error fixed",
    content_publish: "{a} published {c}, version {n}",
    content_unpublish: "{a} hid {c} from students",
    content_restore: "{a} restored version {n} of {c} as a draft",
    content_discard: "{a} discarded the draft of {c}",
    content_import: "{a} imported a file of {n} items",
  } satisfies Record<AuditAction, string>,
  limits: (u: string, a: string) => `Per student: ${u} · Whole app: ${a}`,
  reason: (r: string) => `Reason: ${r}`,
  reports: (n: number) => `${n} ${n === 1 ? "report" : "reports"}`,
  question: (id: string) => `question ${id}`,
  importPublished: "Items never published before went live straight away.",
  openContent: "Open",
  loadMore: "Show older",
  empty: "Nothing recorded yet. Changes admins make from now on will appear here.",
  emptyFiltered: "Nothing matches these filters in what is loaded. Try Show older.",
  end: "That is everything recorded.",
};

export type AuditCopy = typeof en;

const km: AuditCopy = {
  title: "កំណត់ត្រាការកែប្រែ",
  kicker: "ប្រវត្តិរដ្ឋបាល",
  blurb: "មើលថាអ្នកណាបានប្តូរអ្វី និងនៅពេលណា។ រាល់ការកែប្រែរបស់អ្នកគ្រប់គ្រងត្រូវបានកត់ត្រានៅទីនេះ លើកលែងតែការរក្សាទុកសេចក្តីព្រាង។",
  ownerOnlyNote: "ការប្តូរអ្នកគ្រប់គ្រង បង្ហាញតែចំពោះម្ចាស់ប៉ុណ្ណោះ។",
  tool: "កំណត់ត្រាការកែប្រែ",
  toolBlurb: "អ្នកណាបានប្តូរអ្វី និងនៅពេលណា។",
  groups: {
    all: "ទាំងអស់",
    students: "សិស្ស",
    kruai: "KruAI",
    content: "មាតិកា",
    reports: "របាយការណ៍",
    announcements: "សេចក្តីប្រកាស",
    errors: "កំហុសកម្មវិធី",
  },
  today: "ថ្ងៃនេះ",
  kinds: {
    deck: "Flashcard",
    quiz: "Quiz",
    section: "ផ្នែកមេរៀន",
    paper: "វិញ្ញាសារ",
    game: "សំណួរហ្គេម",
  },
  person: "អ្នកណា",
  everyone: "គ្រប់គ្នា",
  someone: "នរណាម្នាក់",
  aStudent: "សិស្សម្នាក់",
  actions: {
    role_grant: "{a} បានតែងតាំង {t} ជាអ្នកគ្រប់គ្រង",
    role_revoke: "{a} បានដក {t} ចេញពីអ្នកគ្រប់គ្រង",
    student_delete: "{a} បានលុបគណនីរបស់ {t}",
    kruai_limits: "{a} បានប្តូរកម្រិតប្រចាំថ្ងៃរបស់ KruAI",
    kruai_pause: "{a} បានផ្អាក KruAI សម្រាប់ {t}",
    kruai_resume: "{a} បានបើក KruAI វិញសម្រាប់ {t}",
    announcement_publish: "{a} បានផ្សាយសេចក្តីប្រកាស",
    announcement_end: "{a} បានបញ្ចប់សេចក្តីប្រកាស",
    photo_kept: "{a} បានរក្សាទុករូបថតរបស់ {t} ដែលត្រូវបានរាយការណ៍",
    photo_deleted: "{a} បានលុបរូបថតរបស់ {t} ដែលត្រូវបានរាយការណ៍",
    mistake_fixed: "{a} បានសម្គាល់របាយការណ៍កំហុសថាបានកែ",
    mistake_not_mistake: "{a} បានបិទរបាយការណ៍កំហុស (មិនមែនកំហុស)",
    error_fixed: "{a} បានសម្គាល់កំហុសកម្មវិធីថាបានកែ",
    content_publish: "{a} បានផ្សាយ {c} កំណែទី {n}",
    content_unpublish: "{a} បានលាក់ {c} ពីសិស្ស",
    content_restore: "{a} បានយកកំណែទី {n} នៃ {c} មកធ្វើជាសេចក្តីព្រាង",
    content_discard: "{a} បានបោះបង់សេចក្តីព្រាងនៃ {c}",
    content_import: "{a} បាននាំចូលឯកសារមាន {n} ធាតុ",
  },
  limits: (u: string, a: string) => `សិស្សម្នាក់៖ ${u} · កម្មវិធីទាំងមូល៖ ${a}`,
  reason: (r: string) => `មូលហេតុ៖ ${r}`,
  reports: (n: number) => `របាយការណ៍ ${n}`,
  question: (id: string) => `សំណួរ ${id}`,
  importPublished: "ធាតុដែលមិនធ្លាប់ផ្សាយ ត្រូវបានផ្សាយភ្លាមៗ។",
  openContent: "បើក",
  loadMore: "បង្ហាញចាស់ជាងនេះ",
  empty: "មិនទាន់មានអ្វីត្រូវបានកត់ត្រាទេ។ ការកែប្រែរបស់អ្នកគ្រប់គ្រងចាប់ពីពេលនេះទៅ នឹងបង្ហាញនៅទីនេះ។",
  emptyFiltered: "គ្មានអ្វីត្រូវនឹងតម្រងទាំងនេះ ក្នុងអ្វីដែលបានទាញយកទេ។ សាកចុច បង្ហាញចាស់ជាងនេះ។",
  end: "នេះជាអ្វីៗទាំងអស់ដែលបានកត់ត្រា។",
};

export const AUDIT_COPY: Record<Lang, AuditCopy> = { en, km };
