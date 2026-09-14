import { Link } from "react-router";
import { Wordmark } from "@/components/shell/wordmark";

/**
 * The privacy policy, at /privacy.
 *
 * ── Why this route sits OUTSIDE ShellLayout ───────────────────────────────
 *
 * Every other route is nested under it and therefore passes through AppShell's
 * auth gate, which would render the entry screen here instead of the policy.
 * That breaks the two readers who matter most: Google, which checks the URL
 * resolves before it will let the OAuth app be published, and a student
 * deciding whether to sign up at all. A privacy policy you have to log in to
 * read is not a privacy policy.
 *
 * ── Why BOTH languages at once, rather than following the store's `lang` ──
 *
 * Same reasoning as components/error-boundary.tsx. Someone arriving from
 * Google's consent screen may have no stored preference, and a parent checking
 * what their child signed up to is not the person who set the toggle. A
 * document like this has to be readable without knowing who is reading it.
 *
 * ── Keeping it TRUE ───────────────────────────────────────────────────────
 *
 * Every claim below is checkable against the code, and the list was written
 * from it rather than from a template:
 *   collected fields   → partializeState in lib/store.ts
 *   what reaches the DB → profileRow / pushLocalState in lib/supabase-sync.ts
 *   what reaches Gemini → ChatProfile AND ScreenRef in utils/chat-prompt.ts
 *                         (the profile, plus WHICH SCREEN was open — see
 *                          screenRefFor in utils/chat-screen.ts)
 *   guest behaviour     → useSupabaseSync bails without a session
 *   no AI retention     → `store: false` in server/chat-handler.ts
 * If any of those change, this page is part of the change.
 */

function Section({
  title,
  km,
  children,
}: {
  title: string;
  km: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-7">
      <h2 className="font-heading mb-1 text-base font-extrabold text-text">
        {title}
      </h2>
      <p className="mb-3 text-sm font-bold text-muted">{km}</p>
      <div className="space-y-2 text-sm font-semibold text-text/85">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto w-full max-w-2xl px-5 py-8">
        <Link to="/" className="mb-6 inline-block">
          <Wordmark
            subtitle={
              <div className="text-xs font-bold text-muted">Bac II Quest</div>
            }
          />
        </Link>

        <h1 className="font-heading mb-1 text-2xl font-extrabold text-text">
          Privacy Policy
        </h1>
        <p className="mb-1 font-heading text-lg font-bold text-text">
          គោលការណ៍ឯកជនភាព
        </p>
        <p className="mb-8 text-xs font-bold text-muted">
          Last updated 10 September 2026 · ធ្វើបច្ចុប្បន្នភាព ១០ កញ្ញា ២០២៦
        </p>

        <Section
          title="Who we are"
          km="យើងជានរណា"
        >
          <p>
            BrachNha is a study app for Cambodian Grade 12 students preparing
            for the Bac II exam. It is run by a small independent team, not by a
            school or the Ministry of Education.
          </p>
          <p>
            BrachNha គឺជាកម្មវិធីសិក្សាសម្រាប់សិស្សថ្នាក់ទី១២
            ដែលត្រៀមប្រឡងបាក់ឌុប។ វាដំណើរការដោយក្រុមឯករាជ្យតូចមួយ
            មិនមែនដោយសាលារៀន ឬក្រសួងអប់រំទេ។
          </p>
        </Section>

        <Section
          title="You can use BrachNha without an account"
          km="អ្នកអាចប្រើ BrachNha ដោយមិនចាំបាច់មានគណនី"
        >
          <p>
            Choosing <strong>Continue as Guest</strong> creates no account and
            sends us nothing. Your lessons, practice and progress are saved only
            in your own browser, on your own device. We cannot see them.
          </p>
          <p>
            Clearing your browser data deletes that work permanently, because we
            have no copy of it.
          </p>
          <p>
            ការជ្រើសរើស <strong>បន្តជាភ្ញៀវ</strong> មិនបង្កើតគណនី
            ហើយមិនផ្ញើអ្វីមកយើងទេ។ មេរៀន លំហាត់
            និងវឌ្ឍនភាពរបស់អ្នករក្សាទុកតែក្នុងកម្មវិធីរុករករបស់អ្នកប៉ុណ្ណោះ។
            យើងមើលមិនឃើញទេ។
          </p>
        </Section>

        <Section
          title="What we collect when you sign in with Google"
          km="អ្វីដែលយើងប្រមូល នៅពេលអ្នកចូលដោយប្រើ Google"
        >
          <p>From your Google account, we receive only:</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>your email address</li>
            <li>your name and profile picture</li>
          </ul>
          <p>
            We do not receive your password, and we cannot read your Gmail,
            Drive, Contacts or anything else in your Google account.
          </p>
          <p>From your use of the app, we store:</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>the name, age, province and study language you enter</li>
            <li>
              your survey answers — subjects you find strong or weak, and your
              target grade
            </li>
            <li>
              your progress — XP, level, coins, streak, lessons finished, and
              mock exam scores
            </li>
            <li>your conversations with KruAI</li>
          </ul>
          <p>
            ពី Google យើងទទួលបានតែអ៊ីមែល ឈ្មោះ និងរូបភាពប្រវត្តិរូបប៉ុណ្ណោះ។
            យើងមិនទទួលបានពាក្យសម្ងាត់របស់អ្នកទេ
            ហើយមិនអាចអានGmail Drive ឬទិន្នន័យផ្សេងទៀតក្នុងគណនី Google
            របស់អ្នកបានទេ។ ក្រៅពីនេះ យើងរក្សាទុកព័ត៌មានដែលអ្នកបញ្ចូល
            ចម្លើយកម្រងសំណួរ វឌ្ឍនភាពសិក្សា និងការសន្ទនាជាមួយ KruAI។
          </p>
        </Section>

        <Section
          title="Why we collect it"
          km="ហេតុអ្វីយើងប្រមូល"
        >
          <p>
            To save your progress so it is still there tomorrow and on your
            other devices, and to build a study plan that matches the subjects
            you said you find hard. We do not sell your data, we do not use it
            for advertising, and we do not share it with other students.
          </p>
          <p>
            ដើម្បីរក្សាទុកវឌ្ឍនភាពរបស់អ្នក
            និងបង្កើតផែនការសិក្សាសមស្របនឹងមុខវិជ្ជាដែលអ្នកពិបាក។
            យើងមិនលក់ទិន្នន័យរបស់អ្នក មិនប្រើសម្រាប់ការផ្សាយពាណិជ្ជកម្ម
            និងមិនចែករំលែកជាមួយសិស្សដទៃទេ។
          </p>
        </Section>

        <Section
          title="Who else sees it"
          km="អ្នកណាទៀតដែលឃើញ"
        >
          <p>Three services, each for one specific job:</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <strong>Google</strong> — sign-in only. Google tells us who you
              are; we tell Google nothing about your studies.
            </li>
            <li>
              <strong>Supabase</strong> — the database that stores your account.
              Security rules mean each student can read and write only their own
              rows.
            </li>
            <li>
              <strong>Google Gemini</strong> — the AI behind KruAI. When you ask
              a question we send that question, the recent conversation, a short
              summary of your profile (name, target grade, subjects you find
              weak, level and streak), and <strong>which lesson page you had
              open</strong>, so KruAI can answer from the lesson you are
              actually reading. We ask Google <strong>not to keep</strong> these
              conversations.
            </li>
          </ul>
          <p>
            If you never open KruAI, nothing is ever sent to the AI. Guests
            cannot open it at all.
          </p>
          <p>
            សេវាកម្មបីៈ Google សម្រាប់ការចូលគណនី, Supabase
            សម្រាប់រក្សាទុកទិន្នន័យ, និង Google Gemini សម្រាប់ KruAI។
            បើអ្នកមិនប្រើ KruAI ទេ គ្មានអ្វីផ្ញើទៅ AI ឡើយ។
          </p>
        </Section>

        <Section
          title="Students under 18"
          km="សិស្សអាយុក្រោម ១៨ ឆ្នាំ"
        >
          <p>
            BrachNha is made for Grade 12 students, and some are under 18. If
            you are, please read this page with a parent or guardian before
            signing in. You can use the whole app as a guest without giving us
            anything at all.
          </p>
          <p>
            បើអ្នកមានអាយុក្រោម ១៨ ឆ្នាំ
            សូមអានទំព័រនេះជាមួយឪពុកម្តាយ ឬអាណាព្យាបាលមុននឹងចូលគណនី។
            អ្នកអាចប្រើកម្មវិធីទាំងមូលជាភ្ញៀវ ដោយមិនផ្តល់អ្វីមកយើងទេ។
          </p>
        </Section>

        <Section
          title="Deleting your data"
          km="ការលុបទិន្នន័យរបស់អ្នក"
        >
          <p>
            <strong>On your device:</strong> Profile → Logout clears everything
            saved in that browser.
          </p>
          <p>
            <strong>Your account:</strong> email us at the address below and we
            will delete your account and everything attached to it. We will not
            ask you why.
          </p>
          <p>
            <strong>ក្នុងឧបករណ៍ៈ</strong> ប្រវត្តិរូប → ចាកចេញ។{" "}
            <strong>គណនីៈ</strong> ផ្ញើអ៊ីមែលមកយើង
            នោះយើងនឹងលុបគណនីនិងទិន្នន័យទាំងអស់។
          </p>
        </Section>

        <Section title="Contact" km="ទំនាក់ទំនង">
          <p>
            Questions, or a deletion request:{" "}
            <a
              href="mailto:brachnha.skillwork@gmail.com"
              className="font-extrabold text-purple underline underline-offset-2"
            >
              brachnha.skillwork@gmail.com
            </a>
          </p>
        </Section>

        <div className="mt-10 border-t border-border pt-5">
          <Link
            to="/"
            className="text-sm font-extrabold text-purple underline underline-offset-2"
          >
            ← Back to BrachNha · ត្រឡប់ទៅ BrachNha
          </Link>
        </div>
      </div>
    </div>
  );
}
