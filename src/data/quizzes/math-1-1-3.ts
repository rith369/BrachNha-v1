import type { SectionQuestion, SkillHelp } from "../../types/index.js";

/**
 * MATH · មេរៀនទី 1 លីមីតនៃអនុគមន៍ · ផ្នែកទី 3 អាស៊ឹមតូត និងភាពជាប់នៃអនុគមន៍
 *
 * Ten techniques covering vertical, horizontal, and oblique asymptotes,
 * and continuity and intermediate value theorem from the MoEYS Grade 12 Math Summary book.
 */

export type MathLimitAsymptoteContinuitySkillId =
  | "asymptote-vertical"
  | "asymptote-horizontal"
  | "asymptote-oblique-division"
  | "asymptote-oblique-limits"
  | "asymptote-relative-position"
  | "continuity-at-point"
  | "continuity-find-parameter"
  | "continuity-interval-boundaries"
  | "intermediate-value-theorem"
  | "asymptote-exponential";

export const MATH_LIMIT_ASYMPTOTE_CONTINUITY_SKILLS: Record<
  MathLimitAsymptoteContinuitySkillId,
  Required<SkillHelp>
> = {
  "asymptote-vertical": {
    label: "អាស៊ឹមតូតឈរ",
    note: [
      "បន្ទាត់ $x = a$ ជាអាស៊ឹមតូតឈរនៃក្រាបតាងអនុគមន៍ $f$ លុះត្រាតែ $\\lim_{x \\to a^+} f(x) = \\pm\\infty$ ឬ $\\lim_{x \\to a^-} f(x) = \\pm\\infty$។",
      "ចំពោះអនុគមន៍សនិទាន $f(x) = \\frac{P(x)}{Q(x)}$ តម្លៃ $x$ ដែលធ្វើឱ្យភាគបែង $Q(x) = 0$ (ហើយភាគយកខុសពី 0) ជាអាស៊ឹមតូតឈរ។",
    ],
    mistake: "ច្រឡំសមីការអាស៊ឹមតូតឈរជា $y = a$ ជំនួសឱ្យ $x = a$។",
    questions: [
      {
        prompt: "រកអាស៊ឹមតូតឈរនៃ $f(x) = \\frac{3x - 1}{x + 2}$",
        options: ["$x = -2$", "$x = 2$", "$y = 3$", "$y = -2$"],
        correct: "$x = -2$",
        explanation: "ភាគបែង $x + 2 = 0 \\Rightarrow x = -2$ ហើយ $\\lim_{x \\to -2} f(x) = \\infty$ ដូច្នេះ $x = -2$ ជាអាស៊ឹមតូតឈរ។",
      },
      {
        prompt: "រកអាស៊ឹមតូតឈរនៃ $f(x) = \\frac{1}{(x - 4)^2}$",
        options: ["$x = 4$", "$x = -4$", "$y = 0$", "$x = 16$"],
        correct: "$x = 4$",
        explanation: "ភាគបែងសូន្យត្រង់ $x = 4$ នាំឱ្យ $\\lim_{x \\to 4} f(x) = +\\infty$ ដូច្នេះ $x = 4$ ជាអាស៊ឹមតូតឈរ។",
      },
    ],
    foundation: [
      {
        prompt: "តើបន្ទាត់ឈរមានសមីការទូទៅយ៉ាងដូចម្តេច?",
        options: ["$x = a$", "$y = b$", "$y = ax + b$", "$x + y = 0$"],
        correct: "$x = a$",
        explanation: "បន្ទាត់ឈរស្របនឹងអ័ក្សអរដោនេមានសមីការរាង $x = a$ (តម្លៃ $x$ ថេរ)។",
      },
      {
        prompt: "តើតម្លៃណាធ្វើឱ្យភាគបែងនៃ $\\frac{2x + 1}{x - 3}$ ស្មើនឹង 0?",
        options: ["$x = 3$", "$x = -3$", "$x = -\\frac{1}{2}$", "$x = 0$"],
        correct: "$x = 3$",
        explanation: "$x - 3 = 0 \\Rightarrow x = 3$។",
      },
    ],
  },

  "asymptote-horizontal": {
    label: "អាស៊ឹមតូតដេក",
    note: [
      "បន្ទាត់ $y = b$ ជាអាស៊ឹមតូតដេកនៃក្រាបតាងអនុគមន៍ $f$ លុះត្រាតែ $\\lim_{x \\to +\\infty} f(x) = b$ ឬ $\\lim_{x \\to -\\infty} f(x) = b$ ($b$ ជាចំនួនពិត)។",
      "ចំពោះអនុគមន៍សនិទាន បើដឺក្រេភាគយកស្មើដឺក្រេភាគបែង អាស៊ឹមតូតដេកស្មើនឹងផលធៀបមេគុណដឺក្រេធំជាងគេ។",
    ],
    mistake: "ច្រឡំសមីការអាស៊ឹមតូតដេកជា $x = b$ ជំនួសឱ្យ $y = b$។",
    questions: [
      {
        prompt: "រកអាស៊ឹមតូតដេកនៃ $f(x) = \\frac{6x + 1}{2x - 3}$",
        options: ["$y = 3$", "$x = \\frac{3}{2}$", "$y = 6$", "$y = -\\frac{1}{3}$"],
        correct: "$y = 3$",
        explanation: "$\\lim_{x \\to \\pm\\infty} \\frac{6x + 1}{2x - 3} = \\frac{6}{2} = 3$ ដូច្នេះ $y = 3$ ជាអាស៊ឹមតូតដេក។",
      },
      {
        prompt: "រកអាស៊ឹមតូតដេកនៃ $f(x) = \\frac{2x - 5}{x^2 + 1}$",
        options: ["$y = 0$", "$y = 2$", "$x = 0$", "គ្មានអាស៊ឹមតូតដេក"],
        correct: "$y = 0$",
        explanation: "ដឺក្រេភាគបែង ($2$) ធំជាងដឺក្រេភាគយក ($1$) ដូច្នេះ $\\lim_{x \\to \\pm\\infty} f(x) = 0$ នាំឱ្យ $y = 0$ ជាអាស៊ឹមតូតដេក។",
      },
    ],
    foundation: [
      {
        prompt: "តើបន្ទាត់ដេកមានសមីការទូទៅយ៉ាងដូចម្តេច?",
        options: ["$y = b$", "$x = a$", "$y = mx$", "$y - x = 0$"],
        correct: "$y = b$",
        explanation: "បន្ទាត់ដេកស្របនឹងអ័ក្សអាប់ស៊ីសមានសមីការរាង $y = b$ (តម្លៃ $y$ ថេរ)។",
      },
      {
        prompt: "គណនា $\\lim_{x \\to +\\infty}\\frac{4x - 5}{2x + 1}$",
        options: ["$2$", "$4$", "$\\frac{5}{2}$", "$0$"],
        correct: "$2$",
        explanation: "ចែកភាគយក និងភាគបែងនឹង $x$ បាន $\\frac{4 - 5/x}{2 + 1/x} \\to \\frac{4}{2} = 2$។",
      },
    ],
  },

  "asymptote-oblique-division": {
    label: "អាស៊ឹមតូតទ្រេតតាមការចែកពហុធា",
    note: [
      "បើអនុគមន៍អាចសរសេរជារាង $f(x) = ax + b + g(x)$ ដែល $\\lim_{x \\to \\pm\\infty} g(x) = 0$ ($a \\neq 0$)",
      "នោះបន្ទាត់ $y = ax + b$ គឺជាអាស៊ឹមតូតទ្រេតនៃក្រាបតាងអនុគមន៍ $f$។",
    ],
    mistake: "ចែកពហុធាខុសសញ្ញា ឬភ្លេចលុបកន្សោមសំណល់ចោលពេលទាញយកសមីការបន្ទាត់។",
    questions: [
      {
        prompt: "រកអាស៊ឹមតូតទ្រេតនៃ $f(x) = \\frac{2x^2 + 3x - 1}{x + 1}$",
        options: ["$y = 2x + 1$", "$y = 2x - 1$", "$y = 2x + 3$", "$y = x + 1$"],
        correct: "$y = 2x + 1$",
        explanation:
          "ចែកពហុធាបាន $f(x) = 2x + 1 - \\frac{2}{x + 1}$។ ដោយ $\\lim_{x \\to \\pm\\infty}\\frac{-2}{x + 1} = 0$ នាំឱ្យ $y = 2x + 1$ ជាអាស៊ឹមតូតទ្រេត។",
      },
      {
        prompt: "រកអាស៊ឹមតូតទ្រេតនៃ $f(x) = x + 3 + \\frac{1}{x^2}$",
        options: ["$y = x + 3$", "$y = x$", "$y = 3$", "គ្មានអាស៊ឹមតូតទ្រេត"],
        correct: "$y = x + 3$",
        explanation: "ដោយសារ $\\lim_{x \\to \\pm\\infty}\\frac{1}{x^2} = 0$ នាំឱ្យបន្ទាត់ $y = x + 3$ ជាអាស៊ឹមតូតទ្រេតភ្លាមៗ។",
      },
    ],
    foundation: [
      {
        prompt: "ពេលចែក $x^2 - 3x + 5$ នឹង $x - 1$ តើផលចែកស្មើនឹងប៉ុន្មាន?",
        options: ["$x - 2$", "$x - 4$", "$x + 2$", "$x + 3$"],
        correct: "$x - 2$",
        explanation: "$x^2 - 3x + 5 = (x - 1)(x - 2) + 3$ ដូច្នេះផលចែកគឺ $x - 2$ និងសំណល់ $3$។",
      },
      {
        prompt: "តើតម្លៃ $\\lim_{x \\to +\\infty}\\frac{3}{x - 1}$ ស្មើប៉ុន្មាន?",
        options: ["$0$", "$3$", "$+\\infty$", "$1$"],
        correct: "$0$",
        explanation: "ភាគបែងកើនគ្មានព្រំដែន នាំឱ្យប្រភាគខិតទៅជិត 0។",
      },
    ],
  },

  "asymptote-oblique-limits": {
    label: "អាស៊ឹមតូតទ្រេតតាមរូបមន្តលីមីត",
    note: [
      "ដើម្បីរកសមីការអាស៊ឹមតូតទ្រេត $y = ax + b$៖",
      "1. រក $a = \\lim_{x \\to \\pm\\infty}\\frac{f(x)}{x}$ ($a \\neq 0$)",
      "2. រក $b = \\lim_{x \\to \\pm\\infty}[f(x) - ax]$",
    ],
    mistake: "ច្រឡំគណនា $b$ ដោយយក $f(x) - a$ ជំនួសឱ្យ $f(x) - ax$។",
    questions: [
      {
        prompt: "បើ $\\lim_{x \\to +\\infty}\\frac{f(x)}{x} = 3$ និង $\\lim_{x \\to +\\infty}[f(x) - 3x] = 4$ តើសមីការអាស៊ឹមតូតទ្រេតជាអ្វី?",
        options: ["$y = 3x + 4$", "$y = 4x + 3$", "$y = 3x - 4$", "$y = 3x$"],
        correct: "$y = 3x + 4$",
        explanation: "$a = 3$ និង $b = 4$ ដូច្នេះសមីការបន្ទាត់គឺ $y = ax + b = 3x + 4$។",
      },
      {
        prompt: "បើ $\\lim_{x \\to -\\infty}\\frac{f(x)}{x} = -1$ និង $\\lim_{x \\to -\\infty}[f(x) + x] = 2$ តើសមីការអាស៊ឹមតូតទ្រេតជាអ្វី?",
        options: ["$y = -x + 2$", "$y = -x - 2$", "$y = x + 2$", "$y = -x$"],
        correct: "$y = -x + 2$",
        explanation: "$a = -1$ និង $b = \\lim[f(x) - (-1)x] = \\lim[f(x) + x] = 2$ នាំឱ្យ $y = -x + 2$។",
      },
    ],
    foundation: [
      {
        prompt: "តើ $a$ ក្នុងសមីការអាស៊ឹមតូតទ្រេត $y = ax + b$ រកតាមរូបមន្តណា?",
        options: [
          "$\\lim_{x \\to \\pm\\infty}\\frac{f(x)}{x}$",
          "$\\lim_{x \\to \\pm\\infty}[f(x) - x]$",
          "$\\lim_{x \\to \\pm\\infty} f(x)$",
          "$\\lim_{x \\to 0} f(x)$",
        ],
        correct: "$\\lim_{x \\to \\pm\\infty}\\frac{f(x)}{x}$",
        explanation: "មេគុណប្រាប់ទិស $a = \\lim_{x \\to \\pm\\infty}\\frac{f(x)}{x}$។",
      },
      {
        prompt: "បើរករកឃើញ $a = 0$ តើបន្ទាត់នោះជាអាស៊ឹមតូតទ្រេតដែរឬទេ?",
        options: ["មិនមែនទេ វាជាអាស៊ឹមតូតដេក $y = b$", "ជាអាស៊ឹមតូតទ្រេតដដែល", "ជាអាស៊ឹមតូតឈរ", "គ្មានន័យ"],
        correct: "មិនមែនទេ វាជាអាស៊ឹមតូតដេក $y = b$",
        explanation: "អាស៊ឹមតូតទ្រេតទាមទារ $a \\neq 0$។ បើ $a = 0$ វាជាបន្ទាត់ដេក។",
      },
    ],
  },

  "asymptote-relative-position": {
    label: "ទីតាំងធៀបរវាងក្រាប និងអាស៊ឹមតូត",
    note: [
      "ដើម្បីសិក្សាទីតាំងធៀបរវាងក្រាប $(C): y = f(x)$ និងអាស៊ឹមតូត $(d): y = ax + b$៖",
      "យើងពិនិត្យសញ្ញានៃផលដក $f(x) - y_{(d)}$៖",
      "- បើ $f(x) - y_{(d)} > 0$ នោះ $(C)$ ស្ថិតនៅពីលើ $(d)$",
      "- បើ $f(x) - y_{(d)} < 0$ នោះ $(C)$ ស្ថិតនៅពីក្រោម $(d)$",
    ],
    mistake: "ច្រឡំថា $f(x) - y > 0$ គឺក្រាបនៅពីក្រោម។",
    questions: [
      {
        prompt: "គេមាន $f(x) - (2x - 1) = -\\frac{3}{x + 1}$។ ចំពោះ $x > -1$ តើក្រាប $(C)$ ស្ថិតនៅទីណាធៀបនឹងអាស៊ឹមតូតទ្រេត?",
        options: ["$(C)$ នៅពីក្រោមអាស៊ឹមតូត", "$(C)$ នៅពីលើអាស៊ឹមតូត", "$(C)$ កាត់អាស៊ឹមតូត", "ត្រួតស៊ីគ្នា"],
        correct: "$(C)$ នៅពីក្រោមអាស៊ឹមតូត",
        explanation: "ចំពោះ $x > -1$ នាំឱ្យ $x + 1 > 0$ ដូច្នេះ $-\\frac{3}{x + 1} < 0$ នាំឱ្យ $(C)$ នៅពីក្រោម។",
      },
      {
        prompt: "គេមាន $f(x) - x = \\frac{1}{x^2}$។ ចំពោះគ្រប់ $x \\neq 0$ តើទីតាំងធៀបនៃ $(C)$ និងអាស៊ឹមតូត $y = x$ យ៉ាងណា?",
        options: ["$(C)$ នៅពីលើអាស៊ឹមតូតជានិច្ច", "$(C)$ នៅពីក្រោមអាស៊ឹមតូត", "$(C)$ កាត់អាស៊ឹមតូត", "អាស្រ័យលើសញ្ញា $x$"],
        correct: "$(C)$ នៅពីលើអាស៊ឹមតូតជានិច្ច",
        explanation: "ដោយសារ $x^2 > 0$ ចំពោះគ្រប់ $x \\neq 0$ នាំឱ្យ $\\frac{1}{x^2} > 0$ ជានិច្ច ដូច្នេះ $(C)$ នៅពីលើ។",
      },
    ],
    foundation: [
      {
        prompt: "បើផលដក $f(x) - y_{(d)} > 0$ តើក្រាប $(C)$ ស្ថិតនៅទីណាធៀបនឹងបន្ទាត់ $(d)$?",
        options: ["នៅពីលើ $(d)$", "នៅពីក្រោម $(d)$", "កាត់ $(d)$", "ស្របនឹង $(d)$"],
        correct: "នៅពីលើ $(d)$",
        explanation: "តម្លៃ $y$ របស់ក្រាបធំជាងតម្លៃ $y$ របស់បន្ទាត់ គឺក្រាបនៅពីលើ។",
      },
      {
        prompt: "ចំពោះ $x > 2$ តើសញ្ញានៃកន្សោម $\\frac{2}{x - 2}$ វិជ្ជមាន ឬអវិជ្ជមាន?",
        options: ["វិជ្ជមាន ($> 0$)", "អវិជ្ជមាន ($< 0$)", "ស្មើ 0", "មិនកំណត់"],
        correct: "វិជ្ជមាន ($> 0$)",
        explanation: "កាលណា $x > 2$ នាំឱ្យ $x - 2 > 0$ ដូច្នេះប្រភាគវិជ្ជមាន។",
      },
    ],
  },

  "continuity-at-point": {
    label: "ភាពជាប់នៃអនុគមន៍ត្រង់ចំណុចមួយ",
    note: [
      "អនុគមន៍ $f$ ជាប់ត្រង់ $x = x_0$ លុះត្រាតែលក្ខខណ្ឌទាំង 3 ផ្ទៀងផ្ទាត់៖",
      "1. $f(x_0)$ មានន័យ (កំណត់)",
      "2. $\\lim_{x \\to x_0} f(x)$ មាន (ពិត)",
      "3. $\\lim_{x \\to x_0} f(x) = f(x_0)$",
    ],
    mistake: "គិតថាឱ្យតែមានលីមីតត្រង់ $x_0$ គឺអនុគមន៍ជាប់ភ្លាម ដោយមិនបានផ្ទៀងផ្ទាត់ថាលីមីតស្មើ $f(x_0)$ ឬអត់។",
    questions: [
      {
        prompt: "តើ $f(x) = \\begin{cases} x + 2 & (x \\neq 3) \\\\ 5 & (x = 3) \\end{cases}$ ជាប់ត្រង់ $x = 3$ ដែរឬទេ?",
        options: ["ជាប់ត្រង់ $x = 3$", "មិនជាប់ត្រង់ $x = 3$", "ជាប់តែខាងស្តាំ", "គ្មានលីមីត"],
        correct: "ជាប់ត្រង់ $x = 3$",
        explanation: "$\\lim_{x \\to 3}(x + 2) = 5 = f(3)$ ដូច្នេះអនុគមន៍ជាប់ត្រង់ $x = 3$។",
      },
      {
        prompt: "គេមាន $f(x) = \\begin{cases} 2x & (x \\neq 1) \\\\ 3 & (x = 1) \\end{cases}$។ តើអនុគមន៍ជាប់ត្រង់ $x = 1$ ដែរឬទេ?",
        options: ["មិនជាប់ត្រង់ $x = 1$", "ជាប់ត្រង់ $x = 1$", "ជាប់គ្រប់តម្លៃ $x$", "គ្មានលីមីត"],
        correct: "មិនជាប់ត្រង់ $x = 1$",
        explanation: "$\\lim_{x \\to 1}(2x) = 2$ ប៉ុន្តែ $f(1) = 3$។ ដោយសារ $\\lim_{x \\to 1} f(x) \\neq f(1)$ នាំឱ្យមិនជាប់។",
      },
    ],
    foundation: [
      {
        prompt: "ដើម្បីឱ្យ $f$ ជាប់ត្រង់ $x_0$ តើ $\\lim_{x \\to x_0} f(x)$ ត្រូវស្មើនឹងអ្វី?",
        options: ["$f(x_0)$", "$0$", "$1$", "$+\\infty$"],
        correct: "$f(x_0)$",
        explanation: "លក្ខខណ្ឌគ្រឹះនៃភាពជាប់គឺ $\\lim_{x \\to x_0} f(x) = f(x_0)$។",
      },
      {
        prompt: "គណនា $\\lim_{x \\to 1}\\frac{x^2 - 1}{x - 1}$",
        options: ["$2$", "$0$", "$1$", "គ្មានលីមីត"],
        correct: "$2$",
        explanation: "$\\frac{(x - 1)(x + 1)}{x - 1} = x + 1 \\to 1 + 1 = 2$។",
      },
    ],
  },

  "continuity-find-parameter": {
    label: "កំណត់ប៉ារ៉ាម៉ែត្រឱ្យអនុគមន៍ជាប់",
    note: [
      "ដើម្បីកំណត់ប៉ារ៉ាម៉ែត្រ $A$ ឬ $m$ ឱ្យអនុគមន៍បែកជាខ្នែងជាប់ត្រង់ $x_0$៖",
      "1. គណនាលីមីតខាងឆ្វេង $\\lim_{x \\to x_0^-} f(x)$",
      "2. គណនាលីមីតខាងស្តាំ $\\lim_{x \\to x_0^+} f(x) = f(x_0)$",
      "3. ឱ្យលីមីតទាំងពីរស្មើគ្នា រួចដោះស្រាយសមីការរកប៉ារ៉ាម៉ែត្រ។",
    ],
    mistake: "ភ្លេចគិតលីមីតម្ខាង ហើយជំនួសលេខចូលតែម្ខាង។",
    questions: [
      {
        prompt: "រក $m$ ដើម្បីឱ្យ $f(x) = \\begin{cases} mx + 1 & (x \\le 2) \\\\ 3x - 1 & (x > 2) \\end{cases}$ ជាប់ត្រង់ $x = 2$",
        options: ["$m = 2$", "$m = 3$", "$m = 1$", "$m = 5$"],
        correct: "$m = 2$",
        explanation:
          "$\\lim_{x \\to 2^+} f(x) = 3(2) - 1 = 5$។ $f(2) = 2m + 1$។ ជាប់ត្រង់ $x = 2 \\Leftrightarrow 2m + 1 = 5 \\Rightarrow m = 2$។",
      },
      {
        prompt: "រក $k$ ដើម្បីឱ្យ $f(x) = \\begin{cases} x^2 + k & (x < 1) \\\\ 4 & (x \\ge 1) \\end{cases}$ ជាប់ត្រង់ $x = 1$",
        options: ["$k = 3$", "$k = 4$", "$k = 5$", "$k = -3$"],
        correct: "$k = 3$",
        explanation:
          "$\\lim_{x \\to 1^-}(x^2 + k) = 1 + k$។ $f(1) = 4$។ ជាប់ត្រង់ $1 \\Leftrightarrow 1 + k = 4 \\Rightarrow k = 3$។",
      },
    ],
    foundation: [
      {
        prompt: "បើ $\\lim_{x \\to x_0^-} f(x) = 5$ និង $f(x_0) = 6 + A$ តើត្រូវដោះស្រាយសមីការអ្វីដើម្បីឱ្យ $f$ ជាប់ត្រង់ $x_0$?",
        options: ["$6 + A = 5$", "$6 + A = 0$", "$A = 5$", "$6 - A = 5$"],
        correct: "$6 + A = 5$",
        explanation: "លីមីតខាងឆ្វេងត្រូវស្មើនឹងតម្លៃអនុគមន៍ត្រង់ចំណុចនោះ។",
      },
      {
        prompt: "ដោះស្រាយសមីការ $6 + A = 5$",
        options: ["$A = -1$", "$A = 1$", "$A = 11$", "$A = -11$"],
        correct: "$A = -1$",
        explanation: "$A = 5 - 6 = -1$។",
      },
    ],
  },

  "continuity-interval-boundaries": {
    label: "ភាពជាប់លើចន្លោះបិទ",
    note: [
      "អនុគមន៍ $f$ ជាប់លើចន្លោះបិទ $[a, b]$ លុះត្រាតែ៖",
      "1. $f$ ជាប់លើចន្លោះបើក $(a, b)$",
      "2. $f$ ជាប់ខាងស្តាំត្រង់ $a$ គឺ $\\lim_{x \\to a^+} f(x) = f(a)$",
      "3. $f$ ជាប់ខាងឆ្វេងត្រង់ $b$ គឺ $\\lim_{x \\to b^-} f(x) = f(b)$",
    ],
    mistake: "ច្រឡំថាត្រង់ស្នូលចុង $a$ ត្រូវគិតលីមីតសងខាង (ទាំងឆ្វេងទាំងស្តាំ) ទោះបីដែនកំណត់មិនមានតម្លៃខាងក្រៅក៏ដោយ។",
    questions: [
      {
        prompt: "អនុគមន៍ $f(x) = \\sqrt{x - 1}$ កំណត់លើ $[1, +\\infty)$។ តើ $f$ ជាប់ត្រង់ $x = 1$ យ៉ាងដូចម្តេច?",
        options: [
          "ជាប់ខាងស្តាំត្រង់ $x = 1$",
          "ជាប់ខាងឆ្វេងត្រង់ $x = 1$",
          "ជាប់សងខាង",
          "មិនជាប់",
        ],
        correct: "ជាប់ខាងស្តាំត្រង់ $x = 1$",
        explanation: "ដែនកំណត់គឺ $x \\ge 1$ ដូច្នេះគិតតែ $\\lim_{x \\to 1^+} f(x) = f(1) = 0$ គឺជាប់ខាងស្តាំ។",
      },
      {
        prompt: "អនុគមន៍ $f(x) = \\sqrt{3 - x}$ កំណត់លើ $(-\\infty, 3]$។ តើ $f$ ជាប់ត្រង់ $x = 3$ យ៉ាងដូចម្តេច?",
        options: [
          "ជាប់ខាងឆ្វេងត្រង់ $x = 3$",
          "ជាប់ខាងស្តាំត្រង់ $x = 3$",
          "មិនជាប់",
          "គ្មានលីមីត",
        ],
        correct: "ជាប់ខាងឆ្វេងត្រង់ $x = 3$",
        explanation: "ដែនកំណត់ $x \\le 3$ ដូច្នេះគិតតែ $\\lim_{x \\to 3^-} f(x) = f(3) = 0$ គឺជាប់ខាងឆ្វេង។",
      },
    ],
    foundation: [
      {
        prompt: "តើអនុគមន៍ $f(x) = \\sqrt{4 - x^2}$ មានដែនកំណត់លើចន្លោះណា?",
        options: ["$[-2, 2]$", "$(-2, 2)$", "$[0, 2]$", "$\\mathbb{R}$"],
        correct: "$[-2, 2]$",
        explanation: "$4 - x^2 \\ge 0 \\Leftrightarrow x^2 \\le 4 \\Leftrightarrow -2 \\le x \\le 2$។",
      },
      {
        prompt: "តើតម្លៃ $f(-2)$ នៃអនុគមន៍ $f(x) = \\sqrt{4 - x^2}$ ស្មើប៉ុន្មាន?",
        options: ["$0$", "$2$", "$4$", "មិនកំណត់"],
        correct: "$0$",
        explanation: "$\\sqrt{4 - (-2)^2} = \\sqrt{4 - 4} = 0$។",
      },
    ],
  },

  "intermediate-value-theorem": {
    label: "ទ្រឹស្តីបទតម្លៃកណ្តាល",
    note: [
      "ទ្រឹស្តីបទតម្លៃកណ្តាល (IVT)៖ បើ $f$ ជាអនុគមន៍ជាប់លើចន្លោះបិទ $[a, b]$",
      "ហើយ $f(a) \\cdot f(b) < 0$ (មានសញ្ញាផ្ទុយគ្នា)",
      "នោះសមីការ $f(x) = 0$ យ៉ាងហោចណាស់មានឫសពិតមួយក្នុងចន្លោះបើក $(a, b)$។",
    ],
    mistake: "ភ្លេចពិនិត្យលក្ខខណ្ឌភាពជាប់នៃអនុគមន៍មុនពេលប្រើទ្រឹស្តីបទតម្លៃកណ្តាល។",
    questions: [
      {
        prompt: "គេមាន $f(x) = x^3 - 3x - 1$ ជាប់លើ $[1, 2]$។ គណនា $f(1)$ និង $f(2)$ រួចទាញរកឫសនៃ $f(x) = 0$។",
        options: [
          "$f(1) = -3 < 0, f(2) = 1 > 0 \\Rightarrow$ មានឫសយ៉ាងតិច 1 ក្នុង $(1, 2)$",
          "$f(1) = 1 > 0, f(2) = 3 > 0 \\Rightarrow$ គ្មានឫស",
          "$f(1) = -1, f(2) = -1 \\Rightarrow$ គ្មានឫស",
          "$f(1) = 0 \\Rightarrow$ ឫសគឺ $x = 1$",
        ],
        correct: "$f(1) = -3 < 0, f(2) = 1 > 0 \\Rightarrow$ មានឫសយ៉ាងតិច 1 ក្នុង $(1, 2)$",
        explanation:
          "$f(1) = 1 - 3 - 1 = -3$ និង $f(2) = 8 - 6 - 1 = 1$។ ដោយ $f(1) \\cdot f(2) < 0$ នាំឱ្យមានឫសក្នុង $(1, 2)$។",
      },
      {
        prompt: "ដើម្បីបង្ហាញថាសមីការ $\\cos x = x$ មានឫសក្នុង $(0, \\frac{\\pi}{2})$ តើយើងតាងអនុគមន៍អ្វី?",
        options: [
          "$f(x) = \\cos x - x$",
          "$f(x) = \\cos x + x$",
          "$f(x) = \\frac{\\cos x}{x}$",
          "$f(x) = x\\cos x$",
        ],
        correct: "$f(x) = \\cos x - x$",
        explanation: "តាង $f(x) = \\cos x - x$ នាំឱ្យសមីការក្លាយជា $f(x) = 0$ ដែលអាចអនុវត្តទ្រឹស្តីបទតម្លៃកណ្តាលបាន។",
      },
    ],
    foundation: [
      {
        prompt: "គណនា $f(0)$ និង $f(1)$ ចំពោះ $f(x) = x^3 + 2x - 1$",
        options: [
          "$f(0) = -1$ និង $f(1) = 2$",
          "$f(0) = 1$ និង $f(1) = 2$",
          "$f(0) = -1$ និង $f(1) = 0$",
          "$f(0) = 0$ និង $f(1) = 1$",
        ],
        correct: "$f(0) = -1$ និង $f(1) = 2$",
        explanation: "$f(0) = 0 + 0 - 1 = -1$ និង $f(1) = 1 + 2 - 1 = 2$។",
      },
      {
        prompt: "តើផលគុណ $(-1) \\times 2$ មានតម្លៃវិជ្ជមាន ឬអវិជ្ជមាន?",
        options: ["អវិជ្ជមាន ($< 0$)", "វិជ្ជមាន ($> 0$)", "ស្មើ 0", "មិនកំណត់"],
        correct: "អវិជ្ជមាន ($< 0$)",
        explanation: "$-1 \\times 2 = -2 < 0$ (សញ្ញាផ្ទុយគ្នា)។",
      },
    ],
  },

  "asymptote-exponential": {
    label: "អាស៊ឹមតូតនៃអនុគមន៍អិចស្ប៉ូណង់ស្យែល",
    note: [
      "អនុគមន៍អិចស្ប៉ូណង់ស្យែលមានលក្ខណៈពិសេសត្រង់លីមីតអនន្ត៖",
      "ដោយសារ $\\lim_{x \\to -\\infty} e^x = 0$ នោះក្រាបតាង $f(x) = c + k e^x$ មានអាស៊ឹមតូតដេក $y = c$ ខាង $-\\infty$។",
      "កាលណា $x \\to +\\infty$ អនុគមន៍កើនឡើងគ្មានព្រំដែន ($+\\infty$) គ្មានអាស៊ឹមតូតដេកខាង $+\\infty$ ឡើយ។",
    ],
    mistake: "ច្រឡំថា $e^x$ មានអាស៊ឹមតូតដេកសងខាង (ទាំងខាង $+\\infty$ ទាំងខាង $-\\infty$) ដូចអនុគមន៍សនិទាន។",
    questions: [
      {
        prompt: "រកអាស៊ឹមតូតដេកខាង $-\\infty$ នៃ $f(x) = 1 - 3e^x$",
        options: ["$y = 1$", "$y = -3$", "$y = 0$", "$x = 1$"],
        correct: "$y = 1$",
        explanation: "$\\lim_{x \\to -\\infty}(1 - 3e^x) = 1 - 3(0) = 1$ ដូច្នេះ $y = 1$ ជាអាស៊ឹមតូតដេកខាង $-\\infty$។",
      },
      {
        prompt: "រកអាស៊ឹមតូតដេកខាង $+\\infty$ នៃ $f(x) = 4 + 2e^{-x}$",
        options: ["$y = 4$", "$y = 2$", "$y = 0$", "$x = 4$"],
        correct: "$y = 4$",
        explanation: "ពេល $x \\to +\\infty$ បាន $e^{-x} \\to 0$ នាំឱ្យ $f(x) \\to 4 + 0 = 4$ ដូច្នេះ $y = 4$ ជាអាស៊ឹមតូតដេក។",
      },
    ],
    foundation: [
      {
        prompt: "តើតម្លៃ $\\lim_{x \\to -\\infty} e^x$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$0$", "$-\\infty$", "$+\\infty$", "$1$"],
        correct: "$0$",
        explanation: "កាលណា $x \\to -\\infty$ អិចស្ប៉ូណង់ស្យែលខិតទៅជិត 0។",
      },
      {
        prompt: "គណនា $3 + 2(0)$",
        options: ["$3$", "$5$", "$0$", "$2$"],
        correct: "$3$",
        explanation: "$3 + 0 = 3$។",
      },
    ],
  },
};

/** ផ្នែកទី 3 · អាស៊ឹមតូត និងភាពជាប់នៃអនុគមន៍ — ten techniques, one question each. */
export const MATH_LIMIT_ASYMPTOTE_CONTINUITY_QUIZ: SectionQuestion[] = [
  {
    q: "រកសមីការអាស៊ឹមតូតឈរនៃក្រាបតាងអនុគមន៍ $f(x) = \\frac{2x + 1}{x - 3}$",
    options: ["ក. $y = 2$", "ខ. $x = 3$", "គ. $x = -3$", "ឃ. $y = 3$"],
    correct: "ខ. $x = 3$",
    explanation:
      "តម្លៃ $x = 3$ ធ្វើឱ្យភាគបែងសូន្យ ហើយ $\\lim_{x \\to 3^\\pm} \\frac{2x + 1}{x - 3} = \\pm\\infty$ ដូច្នេះសមីការអាស៊ឹមតូតឈរគឺ $x = 3$។",
    help: MATH_LIMIT_ASYMPTOTE_CONTINUITY_SKILLS["asymptote-vertical"],
  },
  {
    q: "រកសមីការអាស៊ឹមតូតដេកនៃក្រាបតាងអនុគមន៍ $f(x) = \\frac{4x - 5}{2x + 1}$",
    options: ["ក. $y = 2$", "ខ. $x = -\\frac{1}{2}$", "គ. $y = 4$", "ឃ. $x = 2$"],
    correct: "ក. $y = 2$",
    explanation:
      "$\\lim_{x \\to \\pm\\infty} \\frac{4x - 5}{2x + 1} = \\frac{4}{2} = 2$ ដូច្នេះសមីការអាស៊ឹមតូតដេកគឺ $y = 2$។",
    help: MATH_LIMIT_ASYMPTOTE_CONTINUITY_SKILLS["asymptote-horizontal"],
  },
  {
    q: "រកសមីការអាស៊ឹមតូតទ្រេតនៃក្រាបតាងអនុគមន៍ $f(x) = \\frac{x^2 - 3x + 5}{x - 1}$",
    options: ["ក. $y = x + 2$", "ខ. $y = x - 3$", "គ. $y = x - 2$", "ឃ. $y = -x + 2$"],
    correct: "គ. $y = x - 2$",
    explanation:
      "បំបែកដោយការចែកពហុធាបាន $f(x) = x - 2 + \\frac{3}{x - 1}$។ ដោយ $\\lim_{x \\to \\pm\\infty} \\frac{3}{x - 1} = 0$ នាំឱ្យសមីការអាស៊ឹមតូតទ្រេតគឺ $y = x - 2$។",
    help: MATH_LIMIT_ASYMPTOTE_CONTINUITY_SKILLS["asymptote-oblique-division"],
  },
  {
    q: "បើក្រាបតាងអនុគមន៍ $f(x)$ មាន $\\lim_{x \\to +\\infty}\\frac{f(x)}{x} = 2$ និង $\\lim_{x \\to +\\infty}[f(x) - 2x] = -3$ តើសមីការអាស៊ឹមតូតទ្រេតខាង $+\\infty$ ជាអ្វី?",
    options: ["ក. $y = 2x + 3$", "ខ. $y = -3x + 2$", "គ. $y = 2x$", "ឃ. $y = 2x - 3$"],
    correct: "ឃ. $y = 2x - 3$",
    explanation:
      "តាមរូបមន្ត $y = ax + b$ ដោយ $a = \\lim_{x \\to +\\infty}\\frac{f(x)}{x} = 2$ និង $b = \\lim_{x \\to +\\infty}[f(x) - 2x] = -3$ ដូច្នេះអាស៊ឹមតូតទ្រេតគឺ $y = 2x - 3$។",
    help: MATH_LIMIT_ASYMPTOTE_CONTINUITY_SKILLS["asymptote-oblique-limits"],
  },
  {
    q: "គេមាន $f(x) - (x + 1) = \\frac{2}{x - 2}$។ ចំពោះ $x > 2$ តើទីតាំងធៀបនៃក្រាប $(C)$ និងបន្ទាត់អាស៊ឹមតូត $(d): y = x + 1$ យ៉ាងដូចម្តេច?",
    options: ["ក. $(C)$ នៅពីលើ $(d)$", "ខ. $(C)$ នៅពីក្រោម $(d)$", "គ. $(C)$ កាត់ $(d)$", "ឃ. មិនអាចកំណត់បាន"],
    correct: "ក. $(C)$ នៅពីលើ $(d)$",
    explanation:
      "ចំពោះ $x > 2$ យើងបាន $x - 2 > 0 \\Rightarrow \\frac{2}{x - 2} > 0$ នាំឱ្យផលដក $f(x) - y > 0$ ដូច្នេះក្រាប $(C)$ ស្ថិតនៅពីលើបន្ទាត់ $(d)$។",
    help: MATH_LIMIT_ASYMPTOTE_CONTINUITY_SKILLS["asymptote-relative-position"],
  },
  {
    q: "តើអនុគមន៍ $f(x) = \\begin{cases} \\frac{x^2 - 1}{x - 1} & (x \\neq 1) \\\\ 2 & (x = 1) \\end{cases}$ ជាប់ត្រង់ $x = 1$ ដែរឬទេ?",
    options: ["ក. មិនជាប់ត្រង់ $x = 1$", "ខ. ជាប់តែខាងឆ្វេង", "គ. ជាប់ត្រង់ $x = 1$", "ឃ. គ្មានលីមីតត្រង់ $x = 1$"],
    correct: "គ. ជាប់ត្រង់ $x = 1$",
    explanation:
      "$\\lim_{x \\to 1} \\frac{x^2 - 1}{x - 1} = \\lim_{x \\to 1}(x + 1) = 2 = f(1)$។ ដោយសារលីមីតស្មើនឹងតម្លៃអនុគមន៍ នាំឱ្យអនុគមន៍ជាប់ត្រង់ $x = 1$។",
    help: MATH_LIMIT_ASYMPTOTE_CONTINUITY_SKILLS["continuity-at-point"],
  },
  {
    q: "រកតម្លៃ $A$ ដើម្បីឱ្យ $f(x) = \\begin{cases} 3x + A & (x \\ge 2) \\\\ x^2 + 1 & (x < 2) \\end{cases}$ ជាប់ត្រង់ $x = 2$",
    options: ["ក. $A = 1$", "ខ. $A = -1$", "គ. $A = 5$", "ឃ. $A = -5$"],
    correct: "ខ. $A = -1$",
    explanation:
      "$\\lim_{x \\to 2^-} f(x) = 2^2 + 1 = 5$ និង $f(2) = 3(2) + A = 6 + A$។ ដើម្បីឱ្យជាប់ត្រង់ $x = 2$ ត្រូវតែ $6 + A = 5 \\Rightarrow A = -1$។",
    help: MATH_LIMIT_ASYMPTOTE_CONTINUITY_SKILLS["continuity-find-parameter"],
  },
  {
    q: "គេមាន $f(x) = \\sqrt{4 - x^2}$ កំណត់លើ $[-2, 2]$។ តើ $f(x)$ ជាប់ត្រង់ $x = 2$ និង $x = -2$ យ៉ាងដូចម្តេច?",
    options: [
      "ក. មិនជាប់លើដែនកំណត់",
      "ខ. ជាប់គ្រប់ $x \\in \\mathbb{R}$",
      "គ. ជាប់ខាងឆ្វេងត្រង់ $-2$ និងខាងស្តាំត្រង់ $2$",
      "ឃ. ជាប់ខាងស្តាំត្រង់ $-2$ និងខាងឆ្វេងត្រង់ $2$",
    ],
    correct: "ឃ. ជាប់ខាងស្តាំត្រង់ $-2$ និងខាងឆ្វេងត្រង់ $2$",
    explanation:
      "$\\lim_{x \\to -2^+} f(x) = f(-2) = 0$ (ជាប់ខាងស្តាំត្រង់ $-2$) និង $\\lim_{x \\to 2^-} f(x) = f(2) = 0$ (ជាប់ខាងឆ្វេងត្រង់ $2$) តាមនិយមន័យភាពជាប់លើចន្លោះបិទ។",
    help: MATH_LIMIT_ASYMPTOTE_CONTINUITY_SKILLS["continuity-interval-boundaries"],
  },
  {
    q: "ដើម្បីបង្ហាញថាសមីការ $x^3 + 2x - 1 = 0$ យ៉ាងហោចណាស់មានឫសមួយក្នុងចន្លោះ $(0, 1)$ តើលក្ខខណ្ឌណាបញ្ជាក់ការអះអាងនេះ?",
    options: [
      "ក. $f(0) = f(1)$",
      "ខ. $f(0) + f(1) = 0$",
      "គ. $f(0) \\cdot f(1) < 0$",
      "ឃ. $f'(x) = 0$",
    ],
    correct: "គ. $f(0) \\cdot f(1) < 0$",
    explanation:
      "$f(x) = x^3 + 2x - 1$ ជាអនុគមន៍ពហុធាជាប់លើ $[0, 1]$ មាន $f(0) = -1 < 0$ និង $f(1) = 2 > 0$ នាំឱ្យ $f(0) \\cdot f(1) < 0$ តាមទ្រឹស្តីបទតម្លៃកណ្តាល។",
    help: MATH_LIMIT_ASYMPTOTE_CONTINUITY_SKILLS["intermediate-value-theorem"],
  },
  {
    q: "រកសមីការអាស៊ឹមតូតដេកខាង $-\\infty$ នៃក្រាបតាងអនុគមន៍ $f(x) = 3 + 2e^x$",
    options: ["ក. $y = 3$", "ខ. $y = 5$", "គ. $y = 0$", "ឃ. $x = 3$"],
    correct: "ក. $y = 3$",
    explanation:
      "ដោយសារ $\\lim_{x \\to -\\infty} e^x = 0$ យើងបាន $\\lim_{x \\to -\\infty} (3 + 2e^x) = 3 + 2(0) = 3$ ដូច្នេះអាស៊ឹមតូតដេកខាង $-\\infty$ គឺ $y = 3$។",
    help: MATH_LIMIT_ASYMPTOTE_CONTINUITY_SKILLS["asymptote-exponential"],
  },
];
