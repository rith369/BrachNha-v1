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

  // Prefilled from the Google account when there is one.
  //
  // PRIMITIVE selectors, not the AuthUser object. Reading `authUser` and then
  // `user.name` inside a handler is the React Compiler hazard documented in
  // hooks/use-auth.ts — the compiler narrows the memo dependency to the
  // property path and checks it where the closure is built, above any guard.
  // Selecting the strings sidesteps the question entirely, and they are stable
  // by value so the selector's reference check is happy.
  const googleName = useBrachNhaStore((s) => s.authUser?.name ?? "");
  const googleEmail = useBrachNhaStore((s) => s.authUser?.email ?? "");

  // Name is an initial value only — the student can still edit it. Google hands
  // over a full legal name and a student may well want "Panha" rather than "Keo
  // Panharith". useState's initial argument is read on the first render, which
  // is the one where the session is already resolved: AppShell does not render
  // this branch until it is.
  const [name, setName] = useState(googleName);
  const [language, setLanguage] = useState<"" | "english" | "french">("");
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
      // Taken from the SESSION, never from an input.
      //
      // There used to be an editable "email (optional)" field here, prefilled
      // from Google — which put the same address on screen twice (the chip
      // below says it too) and, worse, let a student type a different one. Its
      // only consumer is `profiles.email` via supabase-sync.ts, so an edited
      // value would silently overwrite the verified address with an unverified
      // one on every push, and `profiles.email` has no unique constraint to
      // catch it. Everyone who reaches this screen is signed in, so there was
      // never a case where the input was the only source.
      //
      // A parent's or school contact address, if that is ever wanted, is a
      // different field with a different label — not this one.
      email: googleEmail || undefined,
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
        {/* Signed in already — this screen is now about the details Google does
            not know, chiefly the study language, which decides whether English
            or French appears as a subject throughout the app. */}
        {googleEmail && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-purple/8 px-3 py-1 text-xs font-extrabold text-purple">
            {t.signedInAs} {googleEmail}
          </div>
        )}
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

        {/* No email field. The signed-in address is shown as a chip above and
            written straight from the session — see submit(). */}

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
