import type { SectionQuestion, SkillHelp } from "../../types/index.js";

/**
 * MATH · មេរៀនទី 1 លីមីតនៃអនុគមន៍ · ផ្នែកទី 1 ប្រមាណវិធីលើលីមីត — the first real
 * quiz in PRACTICE_QUIZZES, and the first content behind a node on the Mimo
 * quiz path (features/practice/quiz-path.ts).
 *
 * Ten techniques, one question each. Every question carries its `help`: the
 * rule, the mistake students actually make, two similar exercises and two
 * foundation exercises. The practice quiz shows all of that after EVERY answer,
 * right or wrong — this is practice, not measurement.
 *
 * ── PROVENANCE ──────────────────────────────────────────────────────────────
 * The techniques, base exercises, worked solutions, notes, mistakes and every
 * exercise PROMPT and ANSWER were supplied by the user. What is written for
 * BrachNha is the THREE WRONG OPTIONS on each of the 50 questions: the content
 * arrived as "compute this, the answer is 4", and a multiple-choice runner needs
 * distractors. They are unverified in exactly the sense data/practice.ts's
 * biology deck and data/papers/english-2025.ts are — fixing one is a plain edit
 * in this file and nothing else in the app has to change.
 *
 * ── DISTRACTOR RULES, and they are rules rather than taste ───────────────────
 * With ~150 wrong options "I'll be careful" is not a method. A distractor that
 * is ALSO correct marks a student wrong forever and looks like nothing.
 *
 *  1. ONE CANONICAL FORM. Fractions are always `\frac{a}{b}`, never a decimal;
 *     a sign always sits in the numerator (`-\frac{1}{4}`). This is what makes
 *     the `\frac{1}{4}` vs `0.25` collision UNWRITEABLE rather than merely
 *     avoided — a decimal is not a legal option string here.
 *  2. DISTINCT VALUES, not just distinct strings. `\frac{2}{4}` may never
 *     appear beside `\frac{1}{2}`. The ក./ខ./គ./ឃ. prefixes make every option
 *     string-distinct for free, which is precisely why this rule has to be
 *     stated: the prefix hides the collision it does not fix.
 *  3. "No limit" has ONE spelling in this file — គ្មានលីមីត — never a second
 *     wording, or two options mean the same thing in one question.
 *  4. EVERY DISTRACTOR TRACES TO THE `mistake` LINE. Write the mistake first,
 *     then derive the wrong options from it. A distractor whose misconception
 *     cannot be named is noise and should be replaced.
 *  5. `correct` is COPIED from its option, never retyped — a stray space marks
 *     every student wrong on that question forever. `npm run check:quiz`
 *     enforces this one mechanically, along with unclosed `$`, Khmer inside
 *     math, and anything KaTeX refuses.
 *
 * ── FORM ────────────────────────────────────────────────────────────────────
 * Maths is LaTeX inside `$…$`, typeset by MathText/KaTeX. KHMER MUST NEVER GO
 * INSIDE THE DELIMITERS — KaTeX substitutes its own fonts, which have no Khmer
 * coverage, so Khmer between two dollars renders as a row of empty boxes. Write
 * `$x = 0$ ជាប់`, never `$\text{ជាប់}$`. Digits are Latin everywhere, including
 * in these comments (see CLAUDE.md, "Digits are Latin everywhere").
 *
 * The ten `SectionQuestion` options carry the ក./ខ./គ./ឃ. prefix, matching
 * data/sections.ts and SectionQuestion's own doc; the forty `DrillQuestion`
 * options are bare, matching data/papers/english-drills.ts. Both are compared by
 * string equality, so a prefix appears byte-for-byte in `correct` too.
 */

/**
 * The ten techniques, as stable ids.
 *
 * A LOCAL union, deliberately not added to `SkillId` in types/index.ts: that one
 * is a total `Record` for the English paper's SKILLS, so widening it would force
 * english-drills.ts to author ten maths entries it has no business having. Its
 * own doc already says a maths paper brings its own ids.
 *
 * The ids exist for the matching system that is NOT built yet. Today each is
 * used exactly once — `help: MATH_LIMIT_SKILLS[id]` on its own question — so the
 * renderer needs no lookup at all. When "give me more of what I got wrong"
 * arrives, these are what it groups on.
 */
export type MathLimitSkillId =
  | "direct-substitution"
  | "difference-of-squares"
  | "trinomial"
  | "rationalization"
  | "one-sided-absolute"
  | "trig-sin-over-x"
  | "infinity-equal-degree"
  | "infinity-bottom-heavy"
  | "trig-one-minus-cos"
  | "euler-number";

/**
 * `Required<SkillHelp>` rather than `SkillHelp`, and this is the highest-value
 * line in the file: `mistake` and `foundation` are optional on the type so the
 * eight English entries stay valid, which means forgetting one of ten here would
 * be silent — no type error, just a missing កំហុសញឹកញាប់ line on question 7.
 * `Required` makes tsc find it instead.
 */
export const MATH_LIMIT_SKILLS: Record<MathLimitSkillId, Required<SkillHelp>> = {
  "direct-substitution": {
    label: "ជំនួសផ្ទាល់",
    note: [
      "អនុគមន៍ពហុធាជាប់លើគ្រប់ចំនួនពិត ដូច្នេះអាចជំនួស $x$ ចូលផ្ទាល់បាន។",
      "ជំនួសតម្លៃ $x$ ចូលជាមុនសិនជានិច្ច ដើម្បីដឹងថាវាជារាងពិត ឬរាងមិនកំណត់។",
      "បើទទួលបានចំនួនពិត នោះនោះហើយជាលីមីត — មិនចាំបាច់ប្រើវិធីផ្សេងទេ។",
    ],
    mistake:
      "ច្រឡំសញ្ញានៅពេលជំនួសចំនួនអវិជ្ជមាន ឧទាហរណ៍ $(-1)^2$ សរសេរច្រឡំជា $-1$ ជំនួសឱ្យ $+1$។",
    questions: [
      {
        prompt: "គណនា $\\lim_{x \\to 2}(3x^2 - 4x + 5)$",
        options: ["$9$", "$25$", "$33$", "$-1$"],
        correct: "$9$",
        explanation: "$3(2)^2 - 4(2) + 5 = 12 - 8 + 5 = 9$",
      },
      {
        prompt: "គណនា $\\lim_{x \\to -1}(x^3 - 2x^2 + 4)$",
        options: ["$1$", "$5$", "$3$", "$7$"],
        correct: "$1$",
        explanation:
          "$(-1)^3 - 2(-1)^2 + 4 = -1 - 2 + 4 = 1$។ ចំណាំថា $(-1)^2 = +1$ មិនមែន $-1$ ទេ។",
      },
    ],
    foundation: [
      {
        prompt: "គណនាតម្លៃអនុគមន៍ $f(x) = 2x^2 - 5x + 1$ ត្រង់ $x = 3$",
        options: ["$4$", "$22$", "$34$", "$-2$"],
        correct: "$4$",
        explanation:
          "$f(3) = 2(3)^2 - 5(3) + 1 = 18 - 15 + 1 = 4$។ ដកសញ្ញា $\\lim$ ចេញ វាគ្រាន់តែជាការគណនាតម្លៃអនុគមន៍ធម្មតា។",
      },
      {
        prompt:
          "តើអនុគមន៍ពហុធាដូចជា $f(x) = 2x^2 - 5x + 1$ ជាប់លើគ្រប់ចំនួនពិតដែរឬទេ?",
        options: [
          "ជាប់",
          "មិនជាប់ត្រង់ $x = 0$",
          "មិនជាប់ត្រង់ $x = 3$",
          "មិនជាប់លើចំនួនអវិជ្ជមាន",
        ],
        correct: "ជាប់",
        explanation:
          "ពហុធាជាប់លើគ្រប់ចំនួនពិត ហើយភាពជាប់នេះហើយជាអ្វីដែលអនុញ្ញាតឱ្យយើងជំនួស $x$ ចូលផ្ទាល់។",
      },
    ],
  },

  "difference-of-squares": {
    label: "ផលគុណកត្តា — ផលដកពីរការេ",
    note: [
      "រូបមន្តផលដកពីរការេ៖ $A^2 - B^2 = (A - B)(A + B)$។",
      "ជំនួសផ្ទាល់ឱ្យរាង $\\frac{0}{0}$ មានន័យថាភាគយក និងភាគបែងមានកត្តារួម។",
      "សម្រួលកត្តារួមចោល រួចទើបជំនួសតម្លៃ $x$ ចូលវិញ។",
    ],
    mistake:
      "សម្រួលរួចហើយ ភ្លេចជំនួសតម្លៃ $x$ ចូលឡើងវិញ ឬលុបសញ្ញា $\\lim$ ចោលមុនពេលជំនួសលេខ។",
    questions: [
      {
        prompt: "គណនា $\\lim_{x \\to 3}\\frac{x^2 - 9}{x - 3}$",
        options: ["$6$", "$0$", "$3$", "គ្មានលីមីត"],
        correct: "$6$",
        explanation:
          "$\\frac{(x - 3)(x + 3)}{x - 3} = x + 3 \\Rightarrow 3 + 3 = 6$",
      },
      {
        prompt: "គណនា $\\lim_{x \\to -5}\\frac{x^2 - 25}{x + 5}$",
        options: ["$-10$", "$10$", "$0$", "គ្មានលីមីត"],
        correct: "$-10$",
        explanation:
          "$\\frac{(x - 5)(x + 5)}{x + 5} = x - 5 \\Rightarrow -5 - 5 = -10$",
      },
    ],
    foundation: [
      {
        prompt: "បំបែកជាផលគុណកត្តា៖ $x^2 - 16$",
        options: ["$(x - 4)(x + 4)$", "$(x - 8)(x + 8)$", "$(x - 4)^2$", "$(x - 16)(x + 1)$"],
        correct: "$(x - 4)(x + 4)$",
        explanation: "$x^2 - 16 = x^2 - 4^2 = (x - 4)(x + 4)$",
      },
      {
        prompt: "សម្រួលកន្សោម $\\frac{(x - 2)(x + 5)}{x - 2}$ ចំពោះ $x \\neq 2$",
        options: ["$x + 5$", "$x - 5$", "$x + 2$", "$5$"],
        correct: "$x + 5$",
        explanation:
          "កត្តា $(x - 2)$ មាននៅទាំងភាគយក និងភាគបែង ដូច្នេះសម្រួលចោលបាន នៅសល់ $x + 5$។",
      },
    ],
  },

  trinomial: {
    label: "បំបែកត្រីធា",
    note: [
      "បំបែក $x^2 + bx + c$ ដោយរកចំនួនពីរដែលផលគុណស្មើ $c$ និងផលបូកស្មើ $b$។",
      "បើ $x \\to a$ ឱ្យរាង $\\frac{0}{0}$ នោះកត្តាដែលត្រូវសម្រួលចោលប្រាកដជា $(x - a)$។",
      "សម្រួលរួច ជំនួសតម្លៃ $x$ ចូលក្នុងកន្សោមដែលនៅសល់។",
    ],
    mistake:
      "ច្រឡំសញ្ញាពេលបំបែកកត្តា ឧទាហរណ៍ $x^2 + 5x + 6$ បំបែកច្រឡំជា $(x - 3)(x - 2)$។",
    questions: [
      {
        prompt: "គណនា $\\lim_{x \\to 2}\\frac{x^2 - 5x + 6}{x - 2}$",
        options: ["$-1$", "$1$", "$5$", "$-5$"],
        correct: "$-1$",
        explanation:
          "$\\frac{(x - 2)(x - 3)}{x - 2} = x - 3 \\Rightarrow 2 - 3 = -1$",
      },
      {
        prompt: "គណនា $\\lim_{x \\to -4}\\frac{x^2 + 3x - 4}{x + 4}$",
        options: ["$-5$", "$5$", "$-3$", "$3$"],
        correct: "$-5$",
        explanation:
          "$\\frac{(x + 4)(x - 1)}{x + 4} = x - 1 \\Rightarrow -4 - 1 = -5$",
      },
    ],
    foundation: [
      {
        prompt: "ដាក់ត្រីធាជាផលគុណកត្តា៖ $x^2 + 5x + 6$",
        options: ["$(x + 3)(x + 2)$", "$(x - 3)(x - 2)$", "$(x + 6)(x + 1)$", "$(x + 5)(x + 1)$"],
        correct: "$(x + 3)(x + 2)$",
        explanation:
          "រក​ចំនួនពីរដែលផលគុណស្មើ $6$ និងផលបូកស្មើ $5$ គឺ $3$ និង $2$ ដូច្នេះ $(x + 3)(x + 2)$។",
      },
      {
        prompt:
          "តើទទួលបានរាងអ្វី ពេលជំនួស $x = -3$ ផ្ទាល់ក្នុង $\\frac{x^2 + 5x + 6}{x + 3}$?",
        options: ["$\\frac{0}{0}$ (រាងមិនកំណត់)", "$0$", "$\\frac{6}{0}$", "$\\frac{0}{6}$"],
        correct: "$\\frac{0}{0}$ (រាងមិនកំណត់)",
        explanation:
          "ភាគយក $(-3)^2 + 5(-3) + 6 = 0$ និងភាគបែង $-3 + 3 = 0$ ដូច្នេះជារាងមិនកំណត់ ដែលជាសញ្ញាថាត្រូវបំបែកកត្តា។",
      },
    ],
  },

  rationalization: {
    label: "គុណនឹងកន្សោមឆ្លាស់",
    note: [
      "កន្សោមឆ្លាស់នៃ $\\sqrt{A} - B$ គឺ $\\sqrt{A} + B$។",
      "គុណទាំងភាគយក និងភាគបែងនឹងកន្សោមឆ្លាស់ ដើម្បីបានជា $(\\sqrt{A})^2 - B^2 = A - B^2$។",
      "ឫសបាត់ពីភាគយក រួចកត្តា $x$ សម្រួលចោលបាន។",
    ],
    mistake:
      "ពេលពន្លាតភាគយក សិស្សច្រើនតែភ្លេចភាគបែង ឬភ្លេចដាក់វង់ក្រចកនៅភាគបែង $x(\\sqrt{x + 4} + 2)$។",
    questions: [
      {
        prompt: "គណនា $\\lim_{x \\to 0}\\frac{\\sqrt{x + 9} - 3}{x}$",
        options: ["$\\frac{1}{6}$", "$\\frac{1}{3}$", "$0$", "$6$"],
        correct: "$\\frac{1}{6}$",
        explanation:
          "គុណនឹងកន្សោមឆ្លាស់ $\\Rightarrow \\frac{x}{x(\\sqrt{x + 9} + 3)} = \\frac{1}{\\sqrt{x + 9} + 3} \\Rightarrow \\frac{1}{3 + 3} = \\frac{1}{6}$",
      },
      {
        prompt: "គណនា $\\lim_{x \\to 0}\\frac{\\sqrt{x + 1} - 1}{x}$",
        options: ["$\\frac{1}{2}$", "$1$", "$0$", "$2$"],
        correct: "$\\frac{1}{2}$",
        explanation:
          "$\\frac{x}{x(\\sqrt{x + 1} + 1)} = \\frac{1}{\\sqrt{x + 1} + 1} \\Rightarrow \\frac{1}{1 + 1} = \\frac{1}{2}$",
      },
    ],
    foundation: [
      {
        prompt: "តើអ្វីជាកន្សោមឆ្លាស់នៃ $\\sqrt{x + 4} - 2$?",
        options: ["$\\sqrt{x + 4} + 2$", "$\\sqrt{x - 4} + 2$", "$-\\sqrt{x + 4} - 2$", "$\\sqrt{x + 4} - 2$"],
        correct: "$\\sqrt{x + 4} + 2$",
        explanation:
          "កន្សោមឆ្លាស់ប្ដូរតែសញ្ញានៅចន្លោះពីរតួ ដូច្នេះ $\\sqrt{x + 4} - 2$ ក្លាយជា $\\sqrt{x + 4} + 2$។",
      },
      {
        prompt: "ពន្លាតផលគុណ៖ $(\\sqrt{A} - B)(\\sqrt{A} + B)$",
        options: ["$A - B^2$", "$A^2 - B^2$", "$A - B$", "$\\sqrt{A} - B^2$"],
        correct: "$A - B^2$",
        explanation:
          "ជារាងផលដកពីរការេ៖ $(\\sqrt{A})^2 - B^2 = A - B^2$។ ឫសការេបាត់ទៅ ដែលជាគោលបំណងទាំងមូល។",
      },
    ],
  },

  "one-sided-absolute": {
    label: "លីមីតខាង និងតម្លៃដាច់ខាត",
    note: [
      "$x \\to a^-$ មានន័យថា $x < a$ ដូច្នេះ $(x - a) < 0$។",
      "ចំពោះ $u < 0$ និយមន័យតម្លៃដាច់ខាតឱ្យ $|u| = -u$។",
      "ដូច្នេះ $x \\to a^-$ ឱ្យ $|x - a| = -(x - a)$ ហើយ $x \\to a^+$ ឱ្យ $|x - a| = x - a$។",
    ],
    mistake:
      "ច្រឡំថា $x \\to 1^-$ មានន័យថា $x$ ជាចំនួនអវិជ្ជមាន ($-1$) ខណៈការពិតវាគ្រាន់តែជាលីមីតខាងឆ្វេងនៃ $1$ ប៉ុណ្ណោះ។",
    questions: [
      {
        prompt: "គណនា $\\lim_{x \\to 3^-}\\frac{|x - 3|}{x - 3}$",
        options: ["$-1$", "$1$", "$0$", "គ្មានលីមីត"],
        correct: "$-1$",
        explanation:
          "ចំពោះ $x < 3$ យើងបាន $|x - 3| = -(x - 3)$ ដូច្នេះផលធៀបស្មើ $-1$។",
      },
      {
        prompt: "គណនា $\\lim_{x \\to 2^+}\\frac{|x - 2|}{x - 2}$",
        options: ["$1$", "$-1$", "$0$", "គ្មានលីមីត"],
        correct: "$1$",
        explanation:
          "ចំពោះ $x > 2$ យើងបាន $|x - 2| = x - 2$ ដូច្នេះផលធៀបស្មើ $1$។ សញ្ញាខាងស្ដាំផ្ទុយពីខាងឆ្វេង។",
      },
    ],
    foundation: [
      {
        prompt: "បើ $x < 1$ តើកន្សោម $(x - 1)$ មានសញ្ញាអ្វី?",
        options: ["អវិជ្ជមាន", "វិជ្ជមាន", "សូន្យ", "អាស្រ័យលើ $x$"],
        correct: "អវិជ្ជមាន",
        explanation:
          "$x < 1$ នាំឱ្យ $x - 1 < 0$។ សញ្ញានេះហើយជាអ្វីដែលកំណត់លទ្ធផលនៃលីមីតខាងឆ្វេង។",
      },
      {
        prompt: "និយមន័យតម្លៃដាច់ខាត៖ បើ $u < 0$ តើ $|u|$ ស្មើនឹងអ្វី?",
        options: ["$-u$", "$u$", "$0$", "$u^2$"],
        correct: "$-u$",
        explanation:
          "តម្លៃដាច់ខាតតែងតែវិជ្ជមាន ដូច្នេះចំពោះ $u$ អវិជ្ជមាន ត្រូវប្ដូរសញ្ញា គឺ $|u| = -u$។",
      },
    ],
  },

  "trig-sin-over-x": {
    label: "លីមីតត្រីកោណមាត្រ",
    note: [
      "រូបមន្តគ្រឹះ៖ $\\lim_{u \\to 0}\\frac{\\sin u}{u} = 1$។",
      "វាទាមទារឱ្យមុំក្នុង $\\sin$ និងភាគបែងដូចគ្នាទាំងស្រុង។",
      "ដូច្នេះត្រូវតម្រូវភាគបែងឱ្យដូចមុំ៖ $\\frac{\\sin 5x}{x} = 5 \\cdot \\frac{\\sin 5x}{5x}$។",
    ],
    mistake:
      "បកលេខចេញពីក្នុង $\\sin$ ដូចជាសរសេរ $\\sin 5x = 5\\sin x$ ដែលជាការខុសឆ្គងធ្ងន់ធ្ងរ។",
    questions: [
      {
        prompt: "គណនា $\\lim_{x \\to 0}\\frac{\\sin 3x}{x}$",
        options: ["$3$", "$1$", "$0$", "$\\frac{1}{3}$"],
        correct: "$3$",
        explanation:
          "$3 \\cdot \\lim_{x \\to 0}\\frac{\\sin 3x}{3x} = 3(1) = 3$",
      },
      {
        prompt: "គណនា $\\lim_{x \\to 0}\\frac{\\sin 7x}{2x}$",
        options: ["$\\frac{7}{2}$", "$7$", "$1$", "$\\frac{2}{7}$"],
        correct: "$\\frac{7}{2}$",
        explanation:
          "$\\frac{7}{2} \\cdot \\lim_{x \\to 0}\\frac{\\sin 7x}{7x} = \\frac{7}{2}(1) = \\frac{7}{2}$",
      },
    ],
    foundation: [
      {
        prompt: "តើលីមីតត្រីកោណមាត្រគ្រឹះ $\\lim_{\\theta \\to 0}\\frac{\\sin\\theta}{\\theta}$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$1$", "$0$", "$\\theta$", "គ្មានលីមីត"],
        correct: "$1$",
        explanation:
          "នេះជាទ្រឹស្តីបទគ្រឹះដែលវិធីសាស្ត្រទាំងមូលផ្អែកលើ៖ តម្លៃរបស់វាគឺ $1$។",
      },
      {
        prompt: "សរសេរ $\\frac{\\sin 5x}{x}$ ឡើងវិញដោយគុណ និងចែកភាគបែងនឹង $5$",
        options: [
          "$5 \\cdot \\frac{\\sin 5x}{5x}$",
          "$\\frac{1}{5} \\cdot \\frac{\\sin 5x}{5x}$",
          "$5 \\cdot \\frac{\\sin x}{x}$",
          "$\\frac{\\sin x}{x}$",
        ],
        correct: "$5 \\cdot \\frac{\\sin 5x}{5x}$",
        explanation:
          "ចែកភាគបែងនឹង $5$ ហើយគុណខាងក្រៅនឹង $5$ តម្លៃមិនប្ដូរ តែឥឡូវមុំ និងភាគបែងដូចគ្នា។",
      },
    ],
  },

  "infinity-equal-degree": {
    label: "លីមីតខិតទៅអនន្ត — ដឺក្រេស្មើគ្នា",
    note: [
      "ចែកភាគយក និងភាគបែងនឹង $x$ ស្វ័យគុណខ្ពស់បំផុត។",
      "គ្រប់តួរាង $\\frac{c}{x^n}$ ខិតទៅ $0$ នៅពេល $x \\to +\\infty$។",
      "បើដឺក្រេភាគយកស្មើដឺក្រេភាគបែង លទ្ធផលគឺផលធៀបមេគុណនៃតួដឺក្រេធំបំផុត។",
    ],
    mistake:
      "យកតួតូចៗ ឬតួថេរមកគណនាដែរ ជំនួសឱ្យការមើលតែតួដែលមានដឺក្រេធំបំផុត។",
    questions: [
      {
        prompt: "គណនា $\\lim_{x \\to +\\infty}\\frac{4x^2 + 1}{2x^2 - 3x}$",
        options: ["$2$", "$\\frac{1}{2}$", "$0$", "$+\\infty$"],
        correct: "$2$",
        explanation: "ផលធៀបមេគុណនៃតួដឺក្រេធំបំផុត៖ $\\frac{4}{2} = 2$",
      },
      {
        prompt: "គណនា $\\lim_{x \\to +\\infty}\\frac{7x^3 - 5x}{2x^3 + 9}$",
        options: ["$\\frac{7}{2}$", "$\\frac{2}{7}$", "$0$", "$+\\infty$"],
        correct: "$\\frac{7}{2}$",
        explanation:
          "ដឺក្រេស្មើគ្នា ($3$ លើ $3$) ដូច្នេះលទ្ធផលគឺ $\\frac{7}{2}$។",
      },
    ],
    foundation: [
      {
        prompt: "តើ $\\lim_{x \\to +\\infty}\\frac{1}{x}$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$0$", "$1$", "$+\\infty$", "គ្មានលីមីត"],
        correct: "$0$",
        explanation:
          "ភាគបែងកាន់តែធំ ប្រភាគកាន់តែតូច ដូច្នេះវាខិតទៅ $0$។ នេះជាមូលដ្ឋាននៃវិធីចែកនឹង $x^n$។",
      },
      {
        prompt: "កំណត់តួដែលមានដឺក្រេធំបំផុតនៃពហុធា $5x^2 + 4x - 7$",
        options: ["$5x^2$", "$4x$", "$-7$", "$5$"],
        correct: "$5x^2$",
        explanation:
          "ដឺក្រេធំបំផុតគឺ $2$ ដូច្នេះតួនោះគឺ $5x^2$ — តួនេះហើយដែលគ្រប់គ្រងឥរិយាបថនៅអនន្ត។",
      },
    ],
  },

  "infinity-bottom-heavy": {
    label: "លីមីតខិតទៅអនន្ត — ភាគបែងដឺក្រេធំជាង",
    note: [
      "បើដឺក្រេភាគបែងធំជាងដឺក្រេភាគយក លីមីតនៅ $+\\infty$ ស្មើ $0$ ជានិច្ច។",
      "ដោយសារភាគបែងកើនលឿនជាងភាគយក ប្រភាគត្រូវបានបង្ហាប់ទៅ $0$។",
      "សរុប៖ ចំនួនថេរ ឬដឺក្រេតូចជាង ចែកនឹងអនន្ត ស្មើ $0$។",
    ],
    mistake:
      "ច្រឡំរវាង $+\\infty$ និង $0$ នៅពេលឃើញដឺក្រេមិនស្មើគ្នា — ភាគបែងធំជាងឱ្យ $0$ រីឯភាគយកធំជាងទើបឱ្យអនន្ត។",
    questions: [
      {
        prompt: "គណនា $\\lim_{x \\to +\\infty}\\frac{2x + 5}{x^2 + 3}$",
        options: ["$0$", "$2$", "$+\\infty$", "$\\frac{1}{2}$"],
        correct: "$0$",
        explanation: "ដឺក្រេ $1$ លើដឺក្រេ $2$ ភាគបែងធំជាង ដូច្នេះលីមីតស្មើ $0$។",
      },
      {
        prompt: "គណនា $\\lim_{x \\to +\\infty}\\frac{6x^2 - 1}{x^3 + 4x^2}$",
        options: ["$0$", "$6$", "$+\\infty$", "$\\frac{3}{2}$"],
        correct: "$0$",
        explanation: "ដឺក្រេ $2$ លើដឺក្រេ $3$ ភាគបែងធំជាង ដូច្នេះលីមីតស្មើ $0$។",
      },
    ],
    foundation: [
      {
        prompt: "តើដឺក្រេនៃភាគយកក្នុង $\\frac{4x^3 + 2}{x^4 - 3x + 1}$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$3$", "$4$", "$2$", "$1$"],
        correct: "$3$",
        explanation:
          "ភាគយកគឺ $4x^3 + 2$ ដែលមានស្វ័យគុណខ្ពស់បំផុតស្មើ $3$។ ភាគបែងមានដឺក្រេ $4$ ធំជាង។",
      },
      {
        prompt: "គណនា $\\lim_{x \\to +\\infty}\\frac{4}{x}$",
        options: ["$0$", "$4$", "$+\\infty$", "$\\frac{1}{4}$"],
        correct: "$0$",
        explanation: "ចំនួនថេរចែកនឹងចំនួនកាន់តែធំឥតកំណត់ ខិតទៅ $0$។",
      },
    ],
  },

  "trig-one-minus-cos": {
    label: "រាងមិនកំណត់ត្រីកោណមាត្រ",
    note: [
      "គុណនឹងកន្សោមឆ្លាស់ $1 + \\cos x$ ដើម្បីប្រើ $1 - \\cos^2 x = \\sin^2 x$។",
      "រូបមន្តគ្រឹះទីមួយ៖ $\\lim_{x \\to 0}\\frac{1 - \\cos x}{x} = 0$។",
      "រូបមន្តគ្រឹះទីពីរ៖ $\\lim_{x \\to 0}\\frac{1 - \\cos x}{x^2} = \\frac{1}{2}$។",
    ],
    mistake:
      "ច្រឡំរវាងភាគបែង $x$ ដែលឱ្យលទ្ធផល $0$ និងភាគបែង $x^2$ ដែលឱ្យលទ្ធផល $\\frac{1}{2}$។",
    questions: [
      {
        prompt: "គណនា $\\lim_{x \\to 0}\\frac{1 - \\cos 2x}{x}$",
        options: ["$0$", "$2$", "$\\frac{1}{2}$", "$1$"],
        correct: "$0$",
        explanation:
          "$2 \\cdot \\lim_{u \\to 0}\\frac{1 - \\cos u}{u} = 2(0) = 0$។ ភាគបែងជា $x$ ដឺក្រេទី $1$ ដូច្នេះលទ្ធផលនៅតែ $0$។",
      },
      {
        prompt: "គណនា $\\lim_{x \\to 0}\\frac{1 - \\cos x}{2x}$",
        options: ["$0$", "$\\frac{1}{2}$", "$\\frac{1}{4}$", "$1$"],
        correct: "$0$",
        explanation:
          "$\\frac{1}{2} \\cdot \\lim_{x \\to 0}\\frac{1 - \\cos x}{x} = \\frac{1}{2}(0) = 0$",
      },
    ],
    foundation: [
      {
        prompt: "តើ $\\cos 0$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$1$", "$0$", "$-1$", "$\\frac{1}{2}$"],
        correct: "$1$",
        explanation:
          "$\\cos 0 = 1$ ដូច្នេះ $1 - \\cos 0 = 0$ ដែលជាមូលហេតុឱ្យកន្សោមនេះជារាងមិនកំណត់។",
      },
      {
        prompt: "ប្រើរូបមន្តអត្តសញ្ញាណត្រីកោណមាត្រ៖ $1 - \\cos^2 x = ?$",
        options: ["$\\sin^2 x$", "$\\cos^2 x$", "$\\sin x$", "$-\\sin^2 x$"],
        correct: "$\\sin^2 x$",
        explanation:
          "ពី $\\sin^2 x + \\cos^2 x = 1$ យើងបាន $1 - \\cos^2 x = \\sin^2 x$។",
      },
    ],
  },

  "euler-number": {
    label: "និយមន័យចំនួន e",
    note: [
      "និយមន័យគ្រឹះ៖ $\\lim_{x \\to +\\infty}\\left(1 + \\frac{1}{x}\\right)^x = e$។",
      "រូបមន្តទូទៅ៖ $\\lim_{x \\to +\\infty}\\left(1 + \\frac{a}{x}\\right)^{bx} = e^{ab}$។",
      "អានតម្លៃ $a$ ចេញពីភាគយកដោយរក្សាសញ្ញារបស់វា។",
    ],
    mistake:
      "ពេលមានសញ្ញាដក ដូចជា $\\left(1 - \\frac{2}{x}\\right)^x$ ភ្លេចយកសញ្ញាដកមកគណនា រួចឆ្លើយ $e^2$ ជំនួសឱ្យ $e^{-2}$។",
    questions: [
      {
        prompt: "គណនា $\\lim_{x \\to +\\infty}\\left(1 + \\frac{5}{x}\\right)^x$",
        options: ["$e^5$", "$e$", "$5e$", "$e^{-5}$"],
        correct: "$e^5$",
        explanation: "ប្រើរូបមន្តផ្ទាល់ដោយ $a = 5$ ដូច្នេះលទ្ធផលគឺ $e^5$។",
      },
      {
        prompt: "គណនា $\\lim_{x \\to +\\infty}\\left(1 - \\frac{2}{x}\\right)^x$",
        options: ["$e^{-2}$", "$e^2$", "$-e^2$", "$e$"],
        correct: "$e^{-2}$",
        explanation:
          "ត្រង់នេះ $a = -2$ ដូច្នេះលទ្ធផលគឺ $e^{-2}$។ សញ្ញាដកត្រូវយកមកជាមួយ។",
      },
    ],
    foundation: [
      {
        prompt: "តើ $\\lim_{x \\to +\\infty}\\left(1 + \\frac{1}{x}\\right)^x$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$e$", "$1$", "$+\\infty$", "$0$"],
        correct: "$e$",
        explanation:
          "នេះជានិយមន័យនៃចំនួន $e$ ខ្លួនឯង ដែលរូបមន្តទាំងអស់ខាងលើសុទ្ធតែផ្អែកលើ។",
      },
      {
        prompt: "សម្រួលកន្សោម $(e^a)^b$ ដោយប្រើវិធានស្វ័យគុណ",
        options: ["$e^{ab}$", "$e^{a + b}$", "$e^{a - b}$", "$abe$"],
        correct: "$e^{ab}$",
        explanation:
          "ស្វ័យគុណជាន់គុណនឹងគ្នា៖ $(e^a)^b = e^{ab}$ ដែលជាមូលហេតុឱ្យរូបមន្តទូទៅឱ្យ $e^{ab}$។",
      },
    ],
  },
};

/** ផ្នែកទី 1 · ប្រមាណវិធីលើលីមីត — ten techniques, one question each. */
export const MATH_LIMIT_OPERATIONS_QUIZ: SectionQuestion[] = [
  {
    q: "គណនា $\\lim_{x \\to 3}(2x^2 - 5x + 1)$",
    options: ["ក. $4$", "ខ. $22$", "គ. $34$", "ឃ. $-2$"],
    correct: "ក. $4$",
    explanation: "$2(3)^2 - 5(3) + 1 = 18 - 15 + 1 = 4$",
    help: MATH_LIMIT_SKILLS["direct-substitution"],
  },
  {
    q: "គណនា $\\lim_{x \\to 2}\\frac{x^2 - 4}{x - 2}$",
    options: ["ក. $4$", "ខ. $0$", "គ. $2$", "ឃ. គ្មានលីមីត"],
    correct: "ក. $4$",
    explanation:
      "ជំនួសផ្ទាល់ឱ្យរាង $\\frac{0}{0}$ ដូច្នេះបំបែកកត្តា៖ $\\frac{(x - 2)(x + 2)}{x - 2} = x + 2 \\Rightarrow 2 + 2 = 4$",
    help: MATH_LIMIT_SKILLS["difference-of-squares"],
  },
  {
    q: "គណនា $\\lim_{x \\to -3}\\frac{x^2 + 5x + 6}{x + 3}$",
    options: ["ក. $-1$", "ខ. $1$", "គ. $5$", "ឃ. $-5$"],
    correct: "ក. $-1$",
    explanation:
      "$\\frac{(x + 3)(x + 2)}{x + 3} = x + 2 \\Rightarrow -3 + 2 = -1$",
    help: MATH_LIMIT_SKILLS.trinomial,
  },
  {
    q: "គណនា $\\lim_{x \\to 0}\\frac{\\sqrt{x + 4} - 2}{x}$",
    options: ["ក. $\\frac{1}{4}$", "ខ. $\\frac{1}{2}$", "គ. $0$", "ឃ. $4$"],
    correct: "ក. $\\frac{1}{4}$",
    explanation:
      "គុណនឹង $\\frac{\\sqrt{x + 4} + 2}{\\sqrt{x + 4} + 2} \\Rightarrow \\frac{x}{x(\\sqrt{x + 4} + 2)} = \\frac{1}{\\sqrt{x + 4} + 2} \\Rightarrow \\frac{1}{2 + 2} = \\frac{1}{4}$",
    help: MATH_LIMIT_SKILLS.rationalization,
  },
  {
    q: "គណនា $\\lim_{x \\to 1^-}\\frac{|x - 1|}{x - 1}$",
    options: ["ក. $-1$", "ខ. $1$", "គ. $0$", "ឃ. គ្មានលីមីត"],
    correct: "ក. $-1$",
    explanation:
      "ដោយសារ $x \\to 1^-$ គឺ $x < 1$ យើងបាន $|x - 1| = -(x - 1)$ ដូច្នេះ $\\frac{-(x - 1)}{x - 1} = -1$",
    help: MATH_LIMIT_SKILLS["one-sided-absolute"],
  },
  {
    q: "គណនា $\\lim_{x \\to 0}\\frac{\\sin 5x}{x}$",
    options: ["ក. $5$", "ខ. $1$", "គ. $0$", "ឃ. $\\frac{1}{5}$"],
    correct: "ក. $5$",
    explanation:
      "$\\lim_{x \\to 0} 5 \\cdot \\frac{\\sin 5x}{5x} = 5(1) = 5$",
    help: MATH_LIMIT_SKILLS["trig-sin-over-x"],
  },
  {
    q: "គណនា $\\lim_{x \\to +\\infty}\\frac{3x^2 - 2x + 1}{5x^2 + 4x - 7}$",
    options: ["ក. $\\frac{3}{5}$", "ខ. $0$", "គ. $+\\infty$", "ឃ. $\\frac{5}{3}$"],
    correct: "ក. $\\frac{3}{5}$",
    explanation:
      "ចែកភាគយក និងភាគបែងនឹង $x^2 \\Rightarrow \\frac{3 - \\frac{2}{x} + \\frac{1}{x^2}}{5 + \\frac{4}{x} - \\frac{7}{x^2}} \\Rightarrow \\frac{3}{5}$",
    help: MATH_LIMIT_SKILLS["infinity-equal-degree"],
  },
  {
    q: "គណនា $\\lim_{x \\to +\\infty}\\frac{4x^3 + 2}{x^4 - 3x + 1}$",
    options: ["ក. $0$", "ខ. $+\\infty$", "គ. $4$", "ឃ. $\\frac{1}{4}$"],
    correct: "ក. $0$",
    explanation:
      "ដឺក្រេភាគបែង ($4$) ធំជាងដឺក្រេភាគយក ($3$) ដូច្នេះលីមីតខិតទៅ $0$។",
    help: MATH_LIMIT_SKILLS["infinity-bottom-heavy"],
  },
  {
    q: "គណនា $\\lim_{x \\to 0}\\frac{1 - \\cos x}{x}$",
    options: ["ក. $0$", "ខ. $\\frac{1}{2}$", "គ. $1$", "ឃ. គ្មានលីមីត"],
    correct: "ក. $0$",
    explanation:
      "$\\frac{(1 - \\cos x)(1 + \\cos x)}{x(1 + \\cos x)} = \\frac{\\sin^2 x}{x(1 + \\cos x)} = \\frac{\\sin x}{x} \\cdot \\frac{\\sin x}{1 + \\cos x} \\Rightarrow 1 \\cdot \\frac{0}{2} = 0$",
    help: MATH_LIMIT_SKILLS["trig-one-minus-cos"],
  },
  {
    q: "គណនា $\\lim_{x \\to +\\infty}\\left(1 + \\frac{3}{x}\\right)^x$",
    options: ["ក. $e^3$", "ខ. $e$", "គ. $3e$", "ឃ. $e^{-3}$"],
    correct: "ក. $e^3$",
    explanation:
      "រូបមន្តនិយមន័យគ្រឹះ $\\lim_{k \\to +\\infty}\\left(1 + \\frac{a}{k}\\right)^k = e^a$ ដោយ $a = 3$ ដូច្នេះលទ្ធផលគឺ $e^3$។",
    help: MATH_LIMIT_SKILLS["euler-number"],
  },
];
