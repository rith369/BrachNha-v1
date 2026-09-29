import type { SectionQuestion, SkillHelp } from "../../types/index.js";

/**
 * MATH · មេរៀនទី 1 លីមីតនៃអនុគមន៍ · ផ្នែកទី 2 លីមីតត្រីកោណមាត្រ និងអិចស្ប៉ូណង់ស្យែល
 *
 * Ten techniques covering trigonometric, exponential, and logarithmic limits
 * from the MoEYS Grade 12 Math Summary book.
 */

export type MathLimitTrigExpSkillId =
  | "trig-sin-ax-over-bx"
  | "trig-tan-over-x"
  | "trig-one-minus-cos-sq"
  | "trig-sin-over-sin"
  | "exp-e-x-minus-1"
  | "exp-growth-power"
  | "exp-negative-infinity"
  | "log-growth-power"
  | "log-ln-1-plus-x"
  | "log-zero-plus";

export const MATH_LIMIT_TRIG_EXP_SKILLS: Record<
  MathLimitTrigExpSkillId,
  Required<SkillHelp>
> = {
  "trig-sin-ax-over-bx": {
    label: "លីមីតរាង sin(ax)/bx",
    note: [
      "រូបមន្តគ្រឹះ៖ $\\lim_{u \\to 0}\\frac{\\sin u}{u} = 1$។",
      "សម្រាប់ $\\lim_{x \\to 0}\\frac{\\sin ax}{bx}$ យើងគុណនិងចែកនឹង $a$ បាន $\\frac{a}{b} \\lim_{ax \\to 0}\\frac{\\sin ax}{ax} = \\frac{a}{b}$។",
    ],
    mistake:
      "ច្រឡំដាក់លទ្ធផលជា $\\frac{b}{a}$ ជំនួសឱ្យ $\\frac{a}{b}$ ឬច្រឡំថា $\\sin ax$ អាចសម្រួល $x$ នឹងភាគបែងបាន។",
    questions: [
      {
        prompt: "គណនា $\\lim_{x \\to 0}\\frac{\\sin 4x}{5x}$",
        options: ["$\\frac{5}{4}$", "$\\frac{4}{5}$", "$0$", "$1$"],
        correct: "$\\frac{4}{5}$",
        explanation:
          "$\\lim_{x \\to 0}\\frac{\\sin 4x}{5x} = \\frac{4}{5}\\lim_{x \\to 0}\\frac{\\sin 4x}{4x} = \\frac{4}{5}(1) = \\frac{4}{5}$",
      },
      {
        prompt: "គណនា $\\lim_{x \\to 0}\\frac{\\sin 7x}{x}$",
        options: ["$\\frac{1}{7}$", "$7$", "$0$", "$1$"],
        correct: "$7$",
        explanation:
          "$\\lim_{x \\to 0}\\frac{\\sin 7x}{x} = 7\\lim_{x \\to 0}\\frac{\\sin 7x}{7x} = 7(1) = 7$",
      },
    ],
    foundation: [
      {
        prompt: "តើតម្លៃ $\\lim_{x \\to 0}\\frac{\\sin x}{x}$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$0$", "$1$", "$+\\infty$", "គ្មានលីមីត"],
        correct: "$1$",
        explanation: "នេះជារូបមន្តគ្រឹះត្រីកោណមាត្រដ៏សំខាន់បំផុតនៃលីមីត។",
      },
      {
        prompt: "តើកន្សោម $\\frac{\\sin 3x}{2x}$ អាចសរសេរជា $\\frac{3}{2} \\cdot \\frac{\\sin 3x}{3x}$ បានដែរឬទេ?",
        options: ["បាន", "មិនបាន", "បានតែពេល $x = 0$", "បានតែពេល $x = 1$"],
        correct: "បាន",
        explanation: "គុណភាគយកនឹង 3 និងភាគបែងនឹង 3 រក្សាតម្លៃដដែល។",
      },
    ],
  },

  "trig-tan-over-x": {
    label: "លីមីតរាង tan(ax)/x",
    note: [
      "ដោយសារ $\\tan u = \\frac{\\sin u}{\\cos u}$ យើងបាន $\\lim_{u \\to 0}\\frac{\\tan u}{u} = \\lim_{u \\to 0}\\left(\\frac{\\sin u}{u} \\cdot \\frac{1}{\\cos u}\\right) = 1 \\cdot 1 = 1$។",
      "រូបមន្តទូទៅ៖ $\\lim_{x \\to 0}\\frac{\\tan ax}{x} = a$។",
    ],
    mistake: "ភ្លេចថា $\\cos 0 = 1$ ហើយគិតថា $\\tan 0$ មិនអាចកំណត់បាន។",
    questions: [
      {
        prompt: "គណនា $\\lim_{x \\to 0}\\frac{\\tan 3x}{x}$",
        options: ["$3$", "$\\frac{1}{3}$", "$0$", "$1$"],
        correct: "$3$",
        explanation:
          "$\\lim_{x \\to 0}\\frac{\\tan 3x}{x} = 3\\lim_{x \\to 0}\\frac{\\tan 3x}{3x} = 3(1) = 3$",
      },
      {
        prompt: "គណនា $\\lim_{x \\to 0}\\frac{\\tan 2x}{5x}$",
        options: ["$\\frac{5}{2}$", "$\\frac{2}{5}$", "$0$", "$1$"],
        correct: "$\\frac{2}{5}$",
        explanation:
          "$\\lim_{x \\to 0}\\frac{\\tan 2x}{5x} = \\frac{2}{5}\\lim_{x \\to 0}\\frac{\\tan 2x}{2x} = \\frac{2}{5}(1) = \\frac{2}{5}$",
      },
    ],
    foundation: [
      {
        prompt: "តើ $\\tan x$ ស្មើនឹងផលធៀបត្រីកោណមាត្រអ្វី?",
        options: [
          "$\\frac{\\sin x}{\\cos x}$",
          "$\\frac{\\cos x}{\\sin x}$",
          "$\\sin x \\cdot \\cos x$",
          "$\\frac{1}{\\sin x}$",
        ],
        correct: "$\\frac{\\sin x}{\\cos x}$",
        explanation: "និយមន័យអនុគមន៍តង់សង់គឺ $\\tan x = \\frac{\\sin x}{\\cos x}$។",
      },
      {
        prompt: "តើតម្លៃ $\\cos 0$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$0$", "$1$", "$-1$", "គ្មានកំណត់"],
        correct: "$1$",
        explanation: "កូស៊ីនុសនៃមុំ 0 រ៉ាដ្យង់ គឺស្មើ 1។",
      },
    ],
  },

  "trig-one-minus-cos-sq": {
    label: "លីមីតរាង (1 - cos ax)/x^2",
    note: [
      "រូបមន្តកន្លះមុំ៖ $1 - \\cos u = 2\\sin^2\\left(\\frac{u}{2}\\right)$។",
      "រូបមន្តលីមីត៖ $\\lim_{x \\to 0}\\frac{1 - \\cos x}{x^2} = \\frac{1}{2}$។",
      "ជាទូទៅ៖ $\\lim_{x \\to 0}\\frac{1 - \\cos ax}{x^2} = \\frac{a^2}{2}$។",
    ],
    mistake:
      "ច្រឡំរូបមន្ត $\\lim_{x \\to 0}\\frac{1 - \\cos x}{x} = 0$ ជាមួយ $\\lim_{x \\to 0}\\frac{1 - \\cos x}{x^2} = \\frac{1}{2}$។",
    questions: [
      {
        prompt: "គណនា $\\lim_{x \\to 0}\\frac{1 - \\cos x}{x^2}$",
        options: ["$0$", "$\\frac{1}{2}$", "$1$", "$2$"],
        correct: "$\\frac{1}{2}$",
        explanation:
          "$\\lim_{x \\to 0}\\frac{1 - \\cos x}{x^2} = \\lim_{x \\to 0}\\frac{2\\sin^2(x/2)}{x^2} = 2\\left(\\frac{1}{2}\\right)^2 = \\frac{1}{2}$",
      },
      {
        prompt: "គណនា $\\lim_{x \\to 0}\\frac{1 - \\cos 4x}{x^2}$",
        options: ["$4$", "$8$", "$16$", "$2$"],
        correct: "$8$",
        explanation:
          "ប្រើរូបមន្តទូទៅ $\\frac{a^2}{2}$ ដោយ $a = 4$ នាំឱ្យបាន $\\frac{4^2}{2} = \\frac{16}{2} = 8$។",
      },
    ],
    foundation: [
      {
        prompt: "តើ $1 - \\cos 2a$ ស្មើនឹងរូបមន្តត្រីកោណមាត្រអ្វី?",
        options: ["$2\\sin^2 a$", "$2\\cos^2 a$", "$\\sin 2a$", "$\\cos^2 a - \\sin^2 a$"],
        correct: "$2\\sin^2 a$",
        explanation: "រូបមន្តមុំឌុប $\\cos 2a = 1 - 2\\sin^2 a \\Rightarrow 1 - \\cos 2a = 2\\sin^2 a$។",
      },
      {
        prompt: "តើតម្លៃ $\\lim_{x \\to 0}\\frac{1 - \\cos x}{x}$ ស្មើប៉ុន្មាន?",
        options: ["$0$", "$1$", "$\\frac{1}{2}$", "គ្មានលីមីត"],
        correct: "$0$",
        explanation: "កាលណាភាគបែងមានដឺក្រេ 1 លីមីតស្មើ 0។",
      },
    ],
  },

  "trig-sin-over-sin": {
    label: "លីមីតផលធៀបស៊ីនុស sin(ax)/sin(bx)",
    note: [
      "ចែកទាំងភាគយក និងភាគបែងនឹង $x$៖ $\\frac{\\sin ax}{\\sin bx} = \\frac{\\frac{\\sin ax}{x}}{\\frac{\\sin bx}{x}}$។",
      "លទ្ធផល៖ $\\frac{\\lim_{x \\to 0}\\frac{\\sin ax}{x}}{\\lim_{x \\to 0}\\frac{\\sin bx}{x}} = \\frac{a}{b}$។",
    ],
    mistake: "ច្រឡំគិតថាស៊ីនុសសម្រួលនឹងស៊ីនុសបាន $\\frac{a}{b}$ ដោយមិនឆ្លងកាត់ការចែកនឹង $x$។",
    questions: [
      {
        prompt: "គណនា $\\lim_{x \\to 0}\\frac{\\sin 3x}{\\sin 4x}$",
        options: ["$\\frac{4}{3}$", "$\\frac{3}{4}$", "$0$", "$1$"],
        correct: "$\\frac{3}{4}$",
        explanation:
          "$\\frac{\\sin 3x}{\\sin 4x} = \\frac{\\frac{\\sin 3x}{x}}{\\frac{\\sin 4x}{x}} \\to \\frac{3}{4}$",
      },
      {
        prompt: "គណនា $\\lim_{x \\to 0}\\frac{\\sin 6x}{\\sin 2x}$",
        options: ["$3$", "$\\frac{1}{3}$", "$0$", "$12$"],
        correct: "$3$",
        explanation:
          "$\\frac{\\sin 6x}{\\sin 2x} = \\frac{6}{2} = 3$",
      },
    ],
    foundation: [
      {
        prompt: "ដើម្បីគណនា $\\lim_{x \\to 0}\\frac{\\sin ax}{\\sin bx}$ តើយើងត្រូវចែកភាគយក និងភាគបែងនឹងអ្វី?",
        options: ["ចែកនឹង $x$", "ចែកនឹង $\\sin x$", "គុណនឹង $x$", "ជំនួស $x = 0$ ភ្លាម"],
        correct: "ចែកនឹង $x$",
        explanation: "ចែកនឹង $x$ ដើម្បីទាញចូលរូបមន្តគ្រឹះ $\\frac{\\sin u}{u}$។",
      },
      {
        prompt: "តើ $\\lim_{x \\to 0}\\sin 0$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$0$", "$1$", "$-1$", "គ្មានកំណត់"],
        correct: "$0$",
        explanation: "ស៊ីនុសនៃមុំ 0 ស្មើ 0។",
      },
    ],
  },

  "exp-e-x-minus-1": {
    label: "លីមីតរាង (e^u - 1)/u",
    note: [
      "រូបមន្តគ្រឹះ៖ $\\lim_{u \\to 0}\\frac{e^u - 1}{u} = 1$។",
      "រូបមន្តទូទៅ៖ $\\lim_{x \\to 0}\\frac{e^{ax} - 1}{x} = a$។",
    ],
    mistake: "ច្រឡំថា $e^0 = 0$ ជំនួសឱ្យ $e^0 = 1$ ដែលនាំឱ្យគិតខុសលើរាង $\\frac{0}{0}$។",
    questions: [
      {
        prompt: "គណនា $\\lim_{x \\to 0}\\frac{e^{2x} - 1}{x}$",
        options: ["$1$", "$2$", "$0$", "$e^2$"],
        correct: "$2$",
        explanation:
          "$\\lim_{x \\to 0}\\frac{e^{2x} - 1}{x} = 2\\lim_{x \\to 0}\\frac{e^{2x} - 1}{2x} = 2(1) = 2$",
      },
      {
        prompt: "គណនា $\\lim_{x \\to 0}\\frac{e^{5x} - 1}{2x}$",
        options: ["$\\frac{2}{5}$", "$\\frac{5}{2}$", "$1$", "$0$"],
        correct: "$\\frac{5}{2}$",
        explanation:
          "$\\lim_{x \\to 0}\\frac{e^{5x} - 1}{2x} = \\frac{5}{2}\\lim_{x \\to 0}\\frac{e^{5x} - 1}{5x} = \\frac{5}{2}(1) = \\frac{5}{2}$",
      },
    ],
    foundation: [
      {
        prompt: "តើតម្លៃ $e^0$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$0$", "$1$", "$e$", "មិនកំណត់"],
        correct: "$1$",
        explanation: "គ្រប់ចំនួនពិតមិនសូន្យលើកជាស្វ័យគុណ 0 ស្មើ 1 ជានិច្ច។",
      },
      {
        prompt: "តើ $\\lim_{x \\to 0}\\frac{e^x - 1}{x}$ ជារាងមិនកំណត់អ្វី?",
        options: ["$\\frac{0}{0}$", "$\\frac{\\infty}{\\infty}$", "$\\infty - \\infty$", "$0 \\times \\infty$"],
        correct: "$\\frac{0}{0}$",
        explanation: "ពេល $x \\to 0$ បាន $e^0 - 1 = 1 - 1 = 0$ និងភាគបែង $0$ គឺរាង $\\frac{0}{0}$។",
      },
    ],
  },

  "exp-growth-power": {
    label: "លីមីតកំណើនអិចស្ប៉ូណង់ស្យែលធៀបនឹងស្វ័យគុណ",
    note: [
      "កាលណា $x \\to +\\infty$ អនុគមន៍អិចស្ប៉ូណង់ស្យែល $e^x$ កើនលឿនជាងពហុធា $x^n$ ($n > 0$) ឆ្ងាយណាស់។",
      "រូបមន្តគ្រឹះ៖ $\\lim_{x \\to +\\infty}\\frac{e^x}{x^n} = +\\infty$ និង $\\lim_{x \\to +\\infty}\\frac{x^n}{e^x} = 0$។",
    ],
    mistake: "ច្រឡំថារាង $\\frac{+\\infty}{+\\infty}$ ត្រូវតែស្មើ 1 ឬអត់ដឹងថាខាងណាមានឥទ្ធិពលជាង។",
    questions: [
      {
        prompt: "គណនា $\\lim_{x \\to +\\infty}\\frac{e^x}{x^3}$",
        options: ["$0$", "$1$", "$+\\infty$", "គ្មានលីមីត"],
        correct: "$+\\infty$",
        explanation:
          "អនុគមន៍អិចស្ប៉ូណង់ស្យែល $e^x$ មានកំណើនលឿនជាងស្វ័យគុណ $x^3$ ដូច្នេះលីមីតខិតទៅ $+\\infty$។",
      },
      {
        prompt: "គណនា $\\lim_{x \\to +\\infty}\\frac{x^5}{e^x}$",
        options: ["$0$", "$+\\infty$", "$5$", "$1$"],
        correct: "$0$",
        explanation:
          "ភាគបែង $e^x$ កើនលឿនជាងភាគយក $x^5$ ដូច្នេះប្រភាគខិតទៅ $0$។",
      },
    ],
    foundation: [
      {
        prompt: "កាលណា $x \\to +\\infty$ តើអនុគមន៍ណាមានល្បឿនកំណើនលឿនជាងគេ?",
        options: ["$e^x$", "$x^2$", "$x^{10}$", "$\\ln x$"],
        correct: "$e^x$",
        explanation: "អិចស្ប៉ូណង់ស្យែលកើនលឿនជាងពហុធា និងលោការីតទាំងអស់។",
      },
      {
        prompt: "តើតម្លៃ $\\lim_{x \\to +\\infty} e^x$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$+\\infty$", "$0$", "$1$", "គ្មានកំណត់"],
        correct: "$+\\infty$",
        explanation: "កាលណា $x$ កើនគ្មានព្រំដែន $e^x$ ក៏កើនគ្មានព្រំដែនដែរ។",
      },
    ],
  },

  "exp-negative-infinity": {
    label: "លីមីតអិចស្ប៉ូណង់ស្យែលត្រង់ -អនន្ត",
    note: [
      "រូបមន្តគ្រឹះ៖ $\\lim_{x \\to -\\infty} e^x = 0$។",
      "រូបមន្តទូទៅ៖ $\\lim_{x \\to -\\infty} x^n e^x = 0$ ចំពោះគ្រប់ $n \\in \\mathbb{N}$។",
    ],
    mistake: "ច្រឡំថា $e^{-\\infty} = -\\infty$ ដោយភ្លេចថា $e^{-\\infty} = \\frac{1}{e^{+\\infty}} = 0$។",
    questions: [
      {
        prompt: "គណនា $\\lim_{x \\to -\\infty}(x^2 e^x)$",
        options: ["$0$", "$+\\infty$", "$-\\infty$", "$1$"],
        correct: "$0$",
        explanation:
          "តាមរូបមន្តកំណើនប្រៀបធៀបត្រង់ $-\\infty$ យើងបាន $\\lim_{x \\to -\\infty} x^n e^x = 0$។",
      },
      {
        prompt: "គណនា $\\lim_{x \\to -\\infty}(2x + 1)e^x$",
        options: ["$0$", "$-\\infty$", "$1$", "$2$"],
        correct: "$0$",
        explanation:
          "$\\lim_{x \\to -\\infty}(2x e^x + e^x) = 2(0) + 0 = 0$",
      },
    ],
    foundation: [
      {
        prompt: "តើតម្លៃ $\\lim_{x \\to -\\infty} e^x$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$0$", "$-\\infty$", "$+\\infty$", "$1$"],
        correct: "$0$",
        explanation: "$e^x = \\frac{1}{e^{-x}} \\to \\frac{1}{+\\infty} = 0$ កាលណា $x \\to -\\infty$។",
      },
      {
        prompt: "តើ $e^x$ អាចមានតម្លៃអវិជ្ជមានដែរឬទេ ចំពោះ $x \\in \\mathbb{R}$?",
        options: ["មិនអាចទេ គឺធំជាង 0 ជានិច្ច", "អាចមានពេល $x < 0$", "អាចមានពេល $x = -1$", "អាចមានពេល $x \\to -\\infty$"],
        correct: "មិនអាចទេ គឺធំជាង 0 ជានិច្ច",
        explanation: "អនុគមន៍អិចស្ប៉ូណង់ស្យែល $e^x > 0$ ជានិច្ចចំពោះគ្រប់ចំនួនពិត $x$។",
      },
    ],
  },

  "log-growth-power": {
    label: "លីមីតកំណើនលោការីតធៀបនឹងស្វ័យគុណ",
    note: [
      "កាលណា $x \\to +\\infty$ អនុគមន៍លោការីត $\\ln x$ កើនយឺតជាងពហុធា $x^n$ ($n > 0$) ឆ្ងាយណាស់។",
      "រូបមន្តគ្រឹះ៖ $\\lim_{x \\to +\\infty}\\frac{\\ln x}{x^n} = 0$ និង $\\lim_{x \\to +\\infty}\\frac{x^n}{\\ln x} = +\\infty$។",
    ],
    mistake: "ច្រឡំថារាង $\\frac{\\infty}{\\infty}$ មានតម្លៃស្មើ 1 ឬមិនស្គាល់ល្បឿនកំណើនរបស់លោការីត។",
    questions: [
      {
        prompt: "គណនា $\\lim_{x \\to +\\infty}\\frac{\\ln x}{x^2}$",
        options: ["$0$", "$+\\infty$", "$1$", "$\\frac{1}{2}$"],
        correct: "$0$",
        explanation:
          "ស្វ័យគុណ $x^2$ កើនលឿនជាង $\\ln x$ ដាច់ ដូច្នេះផលធៀបខិតទៅ $0$។",
      },
      {
        prompt: "គណនា $\\lim_{x \\to +\\infty}\\frac{3x}{\\ln x}$",
        options: ["$+\\infty$", "$0$", "$3$", "$1$"],
        correct: "$+\\infty$",
        explanation:
          "ភាគយក $3x$ កើនលឿនជាងភាគបែង $\\ln x$ ដូច្នេះលីមីតស្មើ $+\\infty$។",
      },
    ],
    foundation: [
      {
        prompt: "កាលណា $x \\to +\\infty$ តើអនុគមន៍ណាមានល្បឿនកំណើនយឺតជាងគេ?",
        options: ["$\\ln x$", "$x$", "$x^2$", "$e^x$"],
        correct: "$\\ln x$",
        explanation: "អនុគមន៍លោការីត $\\ln x$ កើនយឺតបំផុតក្នុងចំណោមអនុគមន៍គ្រឹះទាំងអស់។",
      },
      {
        prompt: "តើដែនកំណត់នៃអនុគមន៍ $f(x) = \\ln x$ គឺអ្វី?",
        options: ["$(0, +\\infty)$", "$[0, +\\infty)$", "$\\mathbb{R}$", "$\\mathbb{R}^*$"],
        correct: "$(0, +\\infty)$",
        explanation: "កន្សោមក្នុងលោការីតត្រូវតែវិជ្ជមានដាច់ខាត គឺ $x > 0$។",
      },
    ],
  },

  "log-ln-1-plus-x": {
    label: "លីមីតរាង ln(1 + u)/u",
    note: [
      "រូបមន្តគ្រឹះ៖ $\\lim_{u \\to 0}\\frac{\\ln(1 + u)}{u} = 1$។",
      "រូបមន្តទូទៅ៖ $\\lim_{x \\to 0}\\frac{\\ln(1 + ax)}{x} = a$។",
    ],
    mistake: "ភ្លេចថា $\\ln 1 = 0$ ហើយច្រឡំថាកន្សោមនេះមិនមែនជារាង $\\frac{0}{0}$។",
    questions: [
      {
        prompt: "គណនា $\\lim_{x \\to 0}\\frac{\\ln(1 + 3x)}{x}$",
        options: ["$1$", "$3$", "$0$", "$\\frac{1}{3}$"],
        correct: "$3$",
        explanation:
          "$\\lim_{x \\to 0}\\frac{\\ln(1 + 3x)}{x} = 3\\lim_{x \\to 0}\\frac{\\ln(1 + 3x)}{3x} = 3(1) = 3$",
      },
      {
        prompt: "គណនា $\\lim_{x \\to 0}\\frac{\\ln(1 + 2x)}{5x}$",
        options: ["$\\frac{5}{2}$", "$\\frac{2}{5}$", "$1$", "$0$"],
        correct: "$\\frac{2}{5}$",
        explanation:
          "$\\lim_{x \\to 0}\\frac{\\ln(1 + 2x)}{5x} = \\frac{2}{5}\\lim_{x \\to 0}\\frac{\\ln(1 + 2x)}{2x} = \\frac{2}{5}(1) = \\frac{2}{5}$",
      },
    ],
    foundation: [
      {
        prompt: "តើតម្លៃ $\\ln 1$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$0$", "$1$", "$e$", "មិនកំណត់"],
        correct: "$0$",
        explanation: "លោការីតនៃ 1 ស្មើ 0 ជានិច្ច ពីព្រោះ $e^0 = 1$។",
      },
      {
        prompt: "តើ $\\lim_{x \\to 0}\\frac{\\ln(1 + x)}{x}$ ជារាងមិនកំណត់អ្វី?",
        options: ["$\\frac{0}{0}$", "$\\frac{\\infty}{\\infty}$", "$0 \\times \\infty$", "$\\infty - \\infty$"],
        correct: "$\\frac{0}{0}$",
        explanation: "ពេល $x \\to 0$ បាន $\\ln(1 + 0) = \\ln 1 = 0$ លើ $0$ ជារាង $\\frac{0}{0}$។",
      },
    ],
  },

  "log-zero-plus": {
    label: "លីមីតលោការីតត្រង់ 0 ខាងស្តាំ",
    note: [
      "រូបមន្តគ្រឹះ៖ $\\lim_{x \\to 0^+} \\ln x = -\\infty$។",
      "រូបមន្តទូទៅ៖ $\\lim_{x \\to 0^+} x^n \\ln x = 0$ ចំពោះគ្រប់ $n > 0$។",
    ],
    mistake: "ច្រឡំថា $0 \\times (-\\infty)$ ស្មើ $0$ ដោយផ្ទាល់ ដោយមិនដឹងថាវាជារាងមិនកំណត់ដែលត្រូវការទ្រឹស្តីបទ។",
    questions: [
      {
        prompt: "គណនា $\\lim_{x \\to 0^+}(x^2 \\ln x)$",
        options: ["$0$", "$-\\infty$", "$+\\infty$", "$-1$"],
        correct: "$0$",
        explanation:
          "តាមរូបមន្តកំណើនប្រៀបធៀបត្រង់ $0^+$ យើងបាន $\\lim_{x \\to 0^+} x^n \\ln x = 0$ ជានិច្ច។",
      },
      {
        prompt: "គណនា $\\lim_{x \\to 0^+}\\sqrt{x}\\ln x$",
        options: ["$0$", "$-\\infty$", "$1$", "គ្មានលីមីត"],
        correct: "$0$",
        explanation:
          "$\\sqrt{x} = x^{1/2}$ ដោយ $n = 1/2 > 0$ នាំឱ្យលីមីតស្មើ $0$។",
      },
    ],
    foundation: [
      {
        prompt: "តើតម្លៃ $\\lim_{x \\to 0^+} \\ln x$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$-\\infty$", "$0$", "$+\\infty$", "$-1$"],
        correct: "$-\\infty$",
        explanation: "កាលណា $x$ ខិតទៅជិត 0 ពីខាងស្តាំ តម្លៃ $\\ln x$ ថយចុះគ្មានព្រំដែនទៅ $-\\infty$។",
      },
      {
        prompt: "ហេតុអ្វីបានជាលីមីតនៃ $\\ln x$ គិតតែត្រង់ $x \\to 0^+$ មិនគិតត្រង់ $x \\to 0^-$?",
        options: [
          "ព្រោះ $\\ln x$ កំណត់តែចំពោះ $x > 0$",
          "ព្រោះ $0^-$ គ្មានន័យក្នុងគណិតវិទ្យា",
          "ព្រោះលទ្ធផលស្មើគ្នា",
          "ព្រោះជាទម្លាប់",
        ],
        correct: "ព្រោះ $\\ln x$ កំណត់តែចំពោះ $x > 0$",
        explanation: "ដែនកំណត់នៃ $\\ln x$ គឺ $(0, +\\infty)$ ដូច្នេះមិនអាចខិតជិតពីខាងឆ្វេង ($x < 0$) បានឡើយ។",
      },
    ],
  },
};

/** ផ្នែកទី 2 · លីមីតត្រីកោណមាត្រ និងអិចស្ប៉ូណង់ស្យែល — ten techniques, one question each. */
export const MATH_LIMIT_TRIG_EXP_QUIZ: SectionQuestion[] = [
  {
    q: "គណនា $\\lim_{x \\to 0}\\frac{\\sin 3x}{2x}$",
    options: ["ក. $\\frac{2}{3}$", "ខ. $\\frac{3}{2}$", "គ. $0$", "ឃ. $1$"],
    correct: "ខ. $\\frac{3}{2}$",
    explanation:
      "$\\lim_{x \\to 0}\\frac{\\sin 3x}{2x} = \\frac{3}{2}\\lim_{x \\to 0}\\frac{\\sin 3x}{3x} = \\frac{3}{2}(1) = \\frac{3}{2}$",
    help: MATH_LIMIT_TRIG_EXP_SKILLS["trig-sin-ax-over-bx"],
  },
  {
    q: "គណនា $\\lim_{x \\to 0}\\frac{\\tan 4x}{x}$",
    options: ["ក. $4$", "ខ. $\\frac{1}{4}$", "គ. $0$", "ឃ. $1$"],
    correct: "ក. $4$",
    explanation:
      "$\\lim_{x \\to 0}\\frac{\\tan 4x}{x} = 4\\lim_{x \\to 0}\\frac{\\tan 4x}{4x} = 4(1) = 4$",
    help: MATH_LIMIT_TRIG_EXP_SKILLS["trig-tan-over-x"],
  },
  {
    q: "គណនា $\\lim_{x \\to 0}\\frac{1 - \\cos 2x}{x^2}$",
    options: ["ក. $1$", "ខ. $0$", "គ. $4$", "ឃ. $2$"],
    correct: "ឃ. $2$",
    explanation:
      "ប្រើរូបមន្តទូទៅ $\\lim_{x \\to 0}\\frac{1 - \\cos ax}{x^2} = \\frac{a^2}{2}$ ដោយ $a = 2$ បាន $\\frac{2^2}{2} = 2$។",
    help: MATH_LIMIT_TRIG_EXP_SKILLS["trig-one-minus-cos-sq"],
  },
  {
    q: "គណនា $\\lim_{x \\to 0}\\frac{\\sin 5x}{\\sin 2x}$",
    options: ["ក. $\\frac{2}{5}$", "ខ. $1$", "គ. $\\frac{5}{2}$", "ឃ. $0$"],
    correct: "គ. $\\frac{5}{2}$",
    explanation:
      "ចែកភាគយក និងភាគបែងនឹង $x$ បាន $\\frac{\\frac{\\sin 5x}{x}}{\\frac{\\sin 2x}{x}} \\to \\frac{5}{2}$។",
    help: MATH_LIMIT_TRIG_EXP_SKILLS["trig-sin-over-sin"],
  },
  {
    q: "គណនា $\\lim_{x \\to 0}\\frac{e^{3x} - 1}{x}$",
    options: ["ក. $1$", "ខ. $3$", "គ. $0$", "ឃ. $e^3$"],
    correct: "ខ. $3$",
    explanation:
      "$\\lim_{x \\to 0}\\frac{e^{3x} - 1}{x} = 3\\lim_{x \\to 0}\\frac{e^{3x} - 1}{3x} = 3(1) = 3$",
    help: MATH_LIMIT_TRIG_EXP_SKILLS["exp-e-x-minus-1"],
  },
  {
    q: "គណនា $\\lim_{x \\to +\\infty}\\frac{e^x}{x^2}$",
    options: ["ក. $0$", "ខ. $1$", "គ. $+\\infty$", "ឃ. គ្មានលីមីត"],
    correct: "គ. $+\\infty$",
    explanation:
      "កាលណា $x \\to +\\infty$ អនុគមន៍អិចស្ប៉ូណង់ស្យែល $e^x$ កើនលឿនជាងស្វ័យគុណ $x^2$ ដូច្នេះលីមីតស្មើ $+\\infty$។",
    help: MATH_LIMIT_TRIG_EXP_SKILLS["exp-growth-power"],
  },
  {
    q: "គណនា $\\lim_{x \\to -\\infty} x e^x$",
    options: ["ក. $0$", "ខ. $-\\infty$", "គ. $-1$", "ឃ. $+\\infty$"],
    correct: "ក. $0$",
    explanation:
      "តាមរូបមន្តកំណើនប្រៀបធៀបត្រង់ $-\\infty$ យើងបាន $\\lim_{x \\to -\\infty} x^n e^x = 0$ ចំពោះគ្រប់ $n \\in \\mathbb{N}$។",
    help: MATH_LIMIT_TRIG_EXP_SKILLS["exp-negative-infinity"],
  },
  {
    q: "គណនា $\\lim_{x \\to +\\infty}\\frac{\\ln x}{x}$",
    options: ["ក. $1$", "ខ. $+\\infty$", "គ. $e$", "ឃ. $0$"],
    correct: "ឃ. $0$",
    explanation:
      "កាលណា $x \\to +\\infty$ ស្វ័យគុណ $x$ កើនលឿនជាង $\\ln x$ ដូច្នេះផលធៀបខិតទៅ $0$។",
    help: MATH_LIMIT_TRIG_EXP_SKILLS["log-growth-power"],
  },
  {
    q: "គណនា $\\lim_{x \\to 0}\\frac{\\ln(1 + 4x)}{x}$",
    options: ["ក. $\\frac{1}{4}$", "ខ. $1$", "គ. $4$", "ឃ. $0$"],
    correct: "គ. $4$",
    explanation:
      "$\\lim_{x \\to 0}\\frac{\\ln(1 + 4x)}{x} = 4\\lim_{x \\to 0}\\frac{\\ln(1 + 4x)}{4x} = 4(1) = 4$",
    help: MATH_LIMIT_TRIG_EXP_SKILLS["log-ln-1-plus-x"],
  },
  {
    q: "គណនា $\\lim_{x \\to 0^+} x \\ln x$",
    options: ["ក. $-\\infty$", "ខ. $0$", "គ. $1$", "ឃ. $-1$"],
    correct: "ខ. $0$",
    explanation:
      "តាមរូបមន្តកំណើនប្រៀបធៀបត្រង់ $0^+$ យើងបាន $\\lim_{x \\to 0^+} x^n \\ln x = 0$ ជានិច្ច។",
    help: MATH_LIMIT_TRIG_EXP_SKILLS["log-zero-plus"],
  },
];
