import { Link } from "react-router";
import { Gauge } from "lucide-react";
import type { Lang } from "@/types";
import { READY_ANSWERS } from "../real-prediction";

/**
 * What the page shows before there is enough work to predict from. It replaced
 * a fixed demo student, so a brand-new student now sees how far they are from a
 * real prediction instead of somebody else's grade.
 */
export function PredictionEmpty({
  lang,
  answered,
  missing,
  href,
}: {
  lang: Lang;
  answered: number;
  missing: number;
  href: string;
}) {
  const pct = Math.min(100, Math.round((answered / READY_ANSWERS) * 100));
  return (
    <div className="rounded-2xl border border-purple/10 bg-surface p-5 text-center shadow-panel">
      <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-linear-to-br from-pink/15 via-purple/15 to-blue/15">
        <Gauge className="size-7 text-purple" strokeWidth={2.5} />
      </div>
      <div className="font-heading text-lg font-extrabold">
        {lang === "en" ? "Not enough data yet" : "ទិន្នន័យមិនទាន់គ្រប់គ្រាន់"}
      </div>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed font-semibold text-muted">
        {lang === "en"
          ? `Answer ${missing} more questions, or sit one mock exam, and BrachNha will predict your grade from your own results.`
          : `ឆ្លើយសំណួរ ${missing} ទៀត ឬធ្វើប្រឡងសាកល្បងមួយ ហើយ BrachNha នឹងព្យាករណ៍និទ្ទេសរបស់អ្នកពីលទ្ធផលផ្ទាល់ខ្លួន។`}
      </p>
      <div className="mx-auto mt-4 max-w-xs">
        <div className="mb-1 flex justify-between text-[11px] font-extrabold text-muted">
          <span>{lang === "en" ? "Questions answered" : "សំណួរបានឆ្លើយ"}</span>
          <span>
            {answered}/{READY_ANSWERS}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-purple/8">
          <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <Link
        to={href}
        className="mt-5 inline-flex items-center justify-center rounded-xl bg-brand px-5 py-2.5 text-sm font-extrabold text-white shadow-cta transition-transform active:scale-[0.97]"
      >
        {lang === "en" ? "Start studying" : "ចាប់ផ្តើមរៀន"}
      </Link>
    </div>
  );
}
