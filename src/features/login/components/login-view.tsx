import { useState } from "react";
import { Flag } from "@/components/ui/flag";
import { Wordmark } from "@/components/shell/wordmark";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { useT } from "@/data/translations";
import type { TranslationKey } from "@/data/translations";

const PROVINCES = [
  { en: "Phnom Penh", km: "ភ្នំពេញ" },
  { en: "Banteay Meanchey", km: "បន្ទាយមានជ័យ" },
  { en: "Battambang", km: "បាត់ដំបង" },
  { en: "Kampong Cham", km: "កំពង់ចាម" },
  { en: "Kampong Chhnang", km: "កំពង់ឆ្នាំង" },
  { en: "Kampong Speu", km: "កំពង់ស្ពឺ" },
  { en: "Kampong Thom", km: "កំពង់ធំ" },
  { en: "Kampot", km: "កំពត" },
  { en: "Kandal", km: "កណ្តាល" },
  { en: "Kep", km: "កែប" },
  { en: "Koh Kong", km: "កោះកុង" },
  { en: "Kratié", km: "ក្រចេះ" },
  { en: "Mondulkiri", km: "មណ្ឌលគិរី" },
  { en: "Oddar Meanchey", km: "ឧត្តរមានជ័យ" },
  { en: "Pailin", km: "ប៉ៃលិន" },
  { en: "Preah Sihanouk", km: "ព្រះសីហនុ" },
  { en: "Preah Vihear", km: "ព្រះវិហារ" },
  { en: "Prey Veng", km: "ព្រៃវែង" },
  { en: "Pursat", km: "ពោធិ៍សាត់" },
  { en: "Ratanakiri", km: "រតនគិរី" },
  { en: "Siem Reap", km: "សៀមរាប" },
  { en: "Stung Treng", km: "ស្ទឹងត្រែង" },
  { en: "Svay Rieng", km: "ស្វាយរៀង" },
  { en: "Takéo", km: "តាកែវ" },
  { en: "Tboung Khmum", km: "ត្បូងឃ្មុំ" },
] as const;

const OTHER_LOCATION = "__other";

const inputClasses =
  "w-full rounded-xl border border-purple/10 bg-surface px-3.5 py-3 text-sm font-bold text-text outline-none focus:border-purple/40";

export function LoginView() {
  const { lang, setLang, completeLogin } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      setLang: s.setLang,
      completeLogin: s.completeLogin,
    }))
  );
  const t = useT(lang);

  const [name, setName] = useState("");
  const [language, setLanguage] = useState<"" | "english" | "french">("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [province, setProvince] = useState("");
  const [customLocation, setCustomLocation] = useState("");

  const canSubmit = !!name.trim() && !!language;

  function submit() {
    const trimmed = name.trim();
    if (!trimmed || !language) return;
    const location =
      province === OTHER_LOCATION ? customLocation.trim() : province;
    completeLogin({
      name: trimmed,
      language,
      email: email.trim() || undefined,
      age: age.trim() || undefined,
      location: location || undefined,
    });
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col overflow-y-auto px-4 pt-8 pb-6">
      <div className="mb-5 flex items-center justify-between">
        <Wordmark
          subtitle={
            <div className="text-xs font-bold text-muted">Bac II Quest</div>
          }
        />
        <button
          onClick={() => setLang(lang === "en" ? "km" : "en")}
          className="flex items-center gap-1.5 rounded-full border border-purple/20 bg-purple/8 px-3 py-1.5 text-xs font-extrabold text-purple"
        >
          <Flag code={lang === "en" ? "kh" : "gb"} className="size-3.5" />
          {lang === "en" ? "ខ្មែរ" : "EN"}
        </button>
      </div>

      <div className="mb-5 text-center">
        <div className="mb-2 text-5xl">⚔️</div>
        <div className="mb-1 text-lg font-extrabold">{t.createAccount}</div>
        <div className="text-xs font-bold text-muted">
          {t.createAccountSubtitle}
        </div>
      </div>

      <div className="rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel">
        <div className="mb-3">
          <label className="mb-1.5 block text-xs font-extrabold text-muted">
            {t.enterName} *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={t.namePlaceholder}
            autoFocus
            className={inputClasses}
          />
        </div>

        <div className="mb-3">
          <label className="mb-1.5 block text-xs font-extrabold text-muted">
            {t.chooseLanguage} *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["english", "french"] as const).map((choice) => (
              <button
                key={choice}
                onClick={() => setLanguage(choice)}
                className={
                  "rounded-xl border px-3 py-2.5 text-sm font-bold transition " +
                  (language === choice
                    ? "border-blue/40 bg-blue/10 text-blue"
                    : "border-purple/10 bg-surface text-text hover:bg-purple/5")
                }
              >
                {t[choice as TranslationKey]}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="mb-1.5 block text-xs font-extrabold text-muted">
            {t.emailOptional}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClasses}
          />
        </div>

        <div className="mb-3">
          <label className="mb-1.5 block text-xs font-extrabold text-muted">
            {t.age}
          </label>
          <input
            type="number"
            min={1}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="18"
            className={inputClasses}
          />
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-extrabold text-muted">
            {t.whereFrom}
          </label>
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className={inputClasses}
          >
            <option value="">—</option>
            {PROVINCES.map((p) => (
              <option key={p.en} value={p.en}>
                {p[lang]}
              </option>
            ))}
            <option value={OTHER_LOCATION}>{t.otherOption}</option>
          </select>
          {province === OTHER_LOCATION && (
            <input
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder={t.otherLocationPlaceholder}
              className={`${inputClasses} mt-2`}
            />
          )}
        </div>

        <button
          disabled={!canSubmit}
          onClick={submit}
          className="w-full rounded-2xl bg-brand-tri bg-[length:200%_auto] px-6 py-3 text-sm font-extrabold text-white shadow-cta animate-shimmer disabled:opacity-40"
        >
          {lang === "en" ? "Continue →" : "បន្ត →"}
        </button>
      </div>
    </div>
  );
}
