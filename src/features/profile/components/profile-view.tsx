import { useState } from "react";
import { LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatPills } from "@/features/home/components/stat-pills";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { useT } from "@/data/translations";
import type { TranslationKey } from "@/data/translations";

export function ProfileView() {
  const { lang, userName, userLanguage, userData, logout } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      userName: s.userName,
      userLanguage: s.userLanguage,
      userData: s.userData,
      logout: s.logout,
    }))
  );
  const t = useT(lang);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-36 lg:pb-10">
      <div className="mb-5 pr-14">
        <div className="font-heading bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent">
          {t.yourProfile} 🎓
        </div>
        <div className="text-xs font-bold text-muted">{userName}</div>
      </div>

      <div className="mb-4">
        <StatPills />
      </div>

      <Card className="mb-4">
        <div className="flex items-center justify-between text-sm font-bold">
          <span className="text-muted">
            {lang === "en" ? "Target Grade" : "ពិន្ទុគោលដៅ"}
          </span>
          <span>{userData.grade || "—"}</span>
        </div>
        {userLanguage && (
          <div className="flex items-center justify-between text-sm font-bold">
            <span className="text-muted">
              {lang === "en" ? "Language" : "ភាសា"}
            </span>
            <span>{t[userLanguage as TranslationKey]}</span>
          </div>
        )}
      </Card>

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-pink/30 bg-pink/8 px-6 py-3.5 text-sm font-extrabold text-pink"
        >
          <LogOut className="size-4" strokeWidth={2.5} />
          {lang === "en" ? "Logout" : "ចាកចេញ"}
        </button>
      ) : (
        <div className="rounded-2xl border border-pink/30 bg-pink/5 p-4 text-center">
          <div className="mb-3 text-sm font-bold">
            {lang === "en"
              ? "This resets everything — name, survey, XP, streak, and exam history. Continue?"
              : "សកម្មភាពនេះនឹងលុបទាំងអស់ — ឈ្មោះ សំណួរ XP ជួរ និងប្រវត្តិប្រឡង។ បន្ត?"}
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-2xl border border-purple/20 bg-surface px-6 py-3 text-sm font-extrabold text-purple"
            >
              {lang === "en" ? "Cancel" : "បោះបង់"}
            </button>
            <button
              onClick={logout}
              className="flex-1 rounded-2xl bg-pink px-6 py-3 text-sm font-extrabold text-white"
            >
              {lang === "en" ? "Yes, reset" : "យល់ព្រម"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
