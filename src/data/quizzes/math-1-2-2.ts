import type { SectionQuestion, SkillHelp } from "../../types/index.js";

/**
 * MATH · មេរៀនទី 2 ដេរីវេ និងព្រីមីទីវនៃអនុគមន៍ · ផ្នែកទី 2 ព្រីមីទីវនៃអនុគមន៍
 *
 * Ten techniques covering polynomial, power chain, radical, inverse square,
 * trigonometric, exponential, logarithmic primitives, initial condition solving,
 * and partial fraction decomposition from the MoEYS Grade 12 Math Summary book.
 */

export type MathPrimitiveSkillId =
  | "primitive-polynomial"
  | "primitive-power-chain"
  | "primitive-sqrt-chain"
  | "primitive-inverse-square"
  | "primitive-trig-linear"
  | "primitive-tan-squared"
  | "primitive-log-form"
  | "primitive-exp-form"
  | "primitive-initial-condition"
  | "primitive-partial-fractions";

export const MATH_PRIMITIVE_SKILLS: Record<
  MathPrimitiveSkillId,
  Required<SkillHelp>
> = {
  "primitive-polynomial": {
    label: "ព្រីមីទីវនៃអនុគមន៍ពហុធា",
    note: [
      "និយមន័យ៖ $F(x)$ ជាព្រីមីទីវនៃ $f(x)$ លុះត្រាតែ $F'(x) = f(x)$។",
      "រូបមន្តគ្រឹះ៖ ព្រីមីទីវនៃ $x^n$ គឺ $\\frac{x^{n+1}}{n+1} + k$ ($n \\neq -1$) និងនៃចំនួនថេរ $a$ គឺ $ax + k$។",
    ],
    mistake: "ច្រឡំដេរីវេ (ទម្លាក់ស្វ័យគុណ) ជំនួសឱ្យការបូកស្វ័យគុណថែម 1 ហើយចែកនឹងស្វ័យគុណថ្មី។",
    questions: [
      {
        prompt: "រកព្រីមីទីវទូទៅនៃ $f(x) = 4x^3 - 6x + 2$",
        options: ["$x^4 - 3x^2 + 2x + k$", "$12x^2 - 6 + k$", "$4x^4 - 6x^2 + 2x + k$", "$x^4 - 6x^2 + k$"],
        correct: "$x^4 - 3x^2 + 2x + k$",
        explanation: "$F(x) = 4\\left(\\frac{x^4}{4}\\right) - 6\\left(\\frac{x^2}{2}\\right) + 2x + k = x^4 - 3x^2 + 2x + k$",
      },
      {
        prompt: "រកព្រីមីទីវទូទៅនៃ $f(x) = 6x^2 - 2x + 5$",
        options: ["$2x^3 - x^2 + 5x + k$", "$6x^3 - 2x^2 + 5x + k$", "$12x - 2 + k$", "$3x^3 - x^2 + 5 + k$"],
        correct: "$2x^3 - x^2 + 5x + k$",
        explanation: "$F(x) = 6\\left(\\frac{x^3}{3}\\right) - 2\\left(\\frac{x^2}{2}\\right) + 5x + k = 2x^3 - x^2 + 5x + k$",
      },
    ],
    foundation: [
      {
        prompt: "តើព្រីមីទីវនៃ $x^2$ ស្មើនឹងអ្វី?",
        options: ["$\\frac{x^3}{3} + k$", "$2x + k$", "$x^3 + k$", "$\\frac{x^2}{2} + k$"],
        correct: "$\\frac{x^3}{3} + k$",
        explanation: "រូបមន្ត $\\frac{x^{n+1}}{n+1}$ ដោយ $n = 2$ បាន $\\frac{x^3}{3}$។",
      },
      {
        prompt: "តើព្រីមីទីវនៃចំនួនថេរ $a$ ស្មើនឹងអ្វី?",
        options: ["$ax + k$", "$0$", "$a + k$", "$\\frac{a^2}{2} + k$"],
        correct: "$ax + k$",
        explanation: "ដេរីវេនៃ $ax$ គឺ $a$ ដូច្នេះព្រីមីទីវនៃ $a$ គឺ $ax + k$។",
      },
    ],
  },

  "primitive-power-chain": {
    label: "ព្រីមីទីវរាង u^n u'",
    note: [
      "រូបមន្តអនុគមន៍បណ្តាក់៖ ព្រីមីទីវនៃ $u^n u'$ គឺ $\\frac{u^{n+1}}{n+1} + k$ ($n \\neq -1$)។",
      "បើខ្វះមេគុណថេរ យើងគុណនិងចែកមេគុណនោះដើម្បីបង្កើតកត្តា $u'$។",
    ],
    mistake: "ភ្លេចចែកនឹងមេគុណរបស់ $x$ នៅពេលធ្វើព្រីមីទីវលើ $(ax + b)^n$។",
    questions: [
      {
        prompt: "រកព្រីមីទីវទូទៅនៃ $f(x) = (3x + 1)^3$",
        options: ["$\\frac{(3x + 1)^4}{12} + k$", "$\\frac{(3x + 1)^4}{4} + k$", "$3(3x + 1)^4 + k$", "$\\frac{(3x + 1)^3}{3} + k$"],
        correct: "$\\frac{(3x + 1)^4}{12} + k$",
        explanation: "$u = 3x + 1 \\Rightarrow u' = 3$។ $f(x) = \\frac{1}{3}(3)(3x + 1)^3 \\Rightarrow F(x) = \\frac{1}{3}\\frac{(3x + 1)^4}{4} + k = \\frac{(3x + 1)^4}{12} + k$។",
      },
      {
        prompt: "រកព្រីមីទីវទូទៅនៃ $f(x) = 2x(x^2 + 1)^3$",
        options: ["$\\frac{(x^2 + 1)^4}{4} + k$", "$\\frac{(x^2 + 1)^4}{2} + k$", "$(x^2 + 1)^4 + k$", "$\\frac{x^2(x^2 + 1)^4}{4} + k$"],
        correct: "$\\frac{(x^2 + 1)^4}{4} + k$",
        explanation: "តាង $u = x^2 + 1 \\Rightarrow u' = 2x$។ កន្សោមមានរាង $u' u^3$ នាំឱ្យ $F(x) = \\frac{u^4}{4} + k$។",
      },
    ],
    foundation: [
      {
        prompt: "តើដេរីវេនៃ $u = 2x - 3$ ស្មើប៉ុន្មាន?",
        options: ["$2$", "$-3$", "$2x$", "$1$"],
        correct: "$2$",
        explanation: "$(2x - 3)' = 2$។",
      },
      {
        prompt: "តើ $\\frac{1}{2} \\times \\frac{u^5}{5}$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$\\frac{u^5}{10}$", "$\\frac{u^5}{7}$", "$\\frac{u^6}{12}$", "$\\frac{2u^5}{5}$"],
        correct: "$\\frac{u^5}{10}$",
        explanation: "$2 \\times 5 = 10$ នៅភាគបែង។",
      },
    ],
  },

  "primitive-sqrt-chain": {
    label: "ព្រីមីទីវរាង u'/sqrt(u)",
    note: [
      "រូបមន្តគ្រឹះ៖ ព្រីមីទីវនៃ $\\frac{1}{\\sqrt{x}}$ គឺ $2\\sqrt{x} + k$។",
      "រូបមន្តអនុគមន៍បណ្តាក់៖ ព្រីមីទីវនៃ $\\frac{u'}{\\sqrt{u}}$ គឺ $2\\sqrt{u} + k$ ($u > 0$)។",
    ],
    mistake: "ភ្លេចគុណនឹង 2 លើ $\\sqrt{u}$ ឬច្រឡំដាក់ជាលោការីត $\\ln\\sqrt{u}$។",
    questions: [
      {
        prompt: "រកព្រីមីទីវទូទៅនៃ $f(x) = \\frac{1}{\\sqrt{2x + 1}}$",
        options: ["$\\sqrt{2x + 1} + k$", "$2\\sqrt{2x + 1} + k$", "$\\frac{1}{2}\\sqrt{2x + 1} + k$", "$\\ln\\sqrt{2x + 1} + k$"],
        correct: "$\\sqrt{2x + 1} + k$",
        explanation: "$u = 2x + 1 \\Rightarrow u' = 2$។ $f(x) = \\frac{1}{2}\\frac{2}{\\sqrt{2x + 1}} \\Rightarrow F(x) = \\frac{1}{2}(2\\sqrt{2x + 1}) + k = \\sqrt{2x + 1} + k$។",
      },
      {
        prompt: "រកព្រីមីទីវទូទៅនៃ $f(x) = \\frac{2x}{\\sqrt{x^2 + 4}}$",
        options: ["$2\\sqrt{x^2 + 4} + k$", "$\\sqrt{x^2 + 4} + k$", "$\\frac{1}{2}\\sqrt{x^2 + 4} + k$", "$\\ln(x^2 + 4) + k$"],
        correct: "$2\\sqrt{x^2 + 4} + k$",
        explanation: "$u = x^2 + 4 \\Rightarrow u' = 2x$ នាំឱ្យមានរាង $\\frac{u'}{\\sqrt{u}}$ ដូច្នេះ $F(x) = 2\\sqrt{u} + k$។",
      },
    ],
    foundation: [
      {
        prompt: "តើដេរីវេនៃ $2\\sqrt{x}$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$\\frac{1}{\\sqrt{x}}$", "$\\frac{2}{\\sqrt{x}}$", "$\\frac{1}{2\\sqrt{x}}$", "$\\sqrt{x}$"],
        correct: "$\\frac{1}{\\sqrt{x}}$",
        explanation: "$(2\\sqrt{x})' = 2\\left(\\frac{1}{2\\sqrt{x}}\\right) = \\frac{1}{\\sqrt{x}}$។",
      },
      {
        prompt: "តើដេរីវេនៃ $u = x^2 + 1$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$2x$", "$x$", "$2$", "$x^2$"],
        correct: "$2x$",
        explanation: "$(x^2 + 1)' = 2x$។",
      },
    ],
  },

  "primitive-inverse-square": {
    label: "ព្រីមីទីវរាង u'/u^2",
    note: [
      "រូបមន្តគ្រឹះ៖ ព្រីមីទីវនៃ $\\frac{1}{x^2}$ គឺ $-\\frac{1}{x} + k$។",
      "រូបមន្តអនុគមន៍បណ្តាក់៖ ព្រីមីទីវនៃ $\\frac{u'}{u^2}$ គឺ $-\\frac{1}{u} + k$ ($u \\neq 0$)។",
    ],
    mistake: "ភ្លេចសញ្ញាដក ($-$) ក្នុងលទ្ធផល $-\\frac{1}{u} + k$។",
    questions: [
      {
        prompt: "រកព្រីមីទីវទូទៅនៃ $f(x) = \\frac{1}{(2x + 1)^2}$",
        options: ["$-\\frac{1}{2(2x + 1)} + k$", "$-\\frac{1}{2x + 1} + k$", "$\\frac{1}{2(2x + 1)} + k$", "$-\\frac{2}{(2x + 1)^3} + k$"],
        correct: "$-\\frac{1}{2(2x + 1)} + k$",
        explanation: "$u = 2x + 1 \\Rightarrow u' = 2$ នាំឱ្យ $f(x) = \\frac{1}{2}\\frac{2}{(2x + 1)^2} \\Rightarrow F(x) = -\\frac{1}{2(2x + 1)} + k$។",
      },
      {
        prompt: "រកព្រីមីទីវទូទៅនៃ $f(x) = \\frac{2x}{(x^2 + 3)^2}$",
        options: ["$-\\frac{1}{x^2 + 3} + k$", "$\\frac{1}{x^2 + 3} + k$", "$-\\frac{2}{x^2 + 3} + k$", "$\\ln(x^2 + 3) + k$"],
        correct: "$-\\frac{1}{x^2 + 3} + k$",
        explanation: "$u = x^2 + 3 \\Rightarrow u' = 2x$ មានរាង $\\frac{u'}{u^2}$ នាំឱ្យ $F(x) = -\\frac{1}{u} + k$។",
      },
    ],
    foundation: [
      {
        prompt: "តើដេរីវេនៃ $-\\frac{1}{x}$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$\\frac{1}{x^2}$", "$-\\frac{1}{x^2}$", "$\\frac{1}{x}$", "$\\ln x$"],
        correct: "$\\frac{1}{x^2}$",
        explanation: "$\\left(-\\frac{1}{x}\\right)' = -\\left(-\\frac{1}{x^2}\\right) = \\frac{1}{x^2}$ ដូច្នេះព្រីមីទីវត្រូវមានសញ្ញាដក។",
      },
      {
        prompt: "តើ $(x - 2)'$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$1$", "$2$", "$0$", "$-2$"],
        correct: "$1$",
        explanation: "$(x - 2)' = 1 - 0 = 1$។",
      },
    ],
  },

  "primitive-trig-linear": {
    label: "ព្រីមីទីវត្រីកោណមាត្រលីនេអ៊ែរ",
    note: [
      "រូបមន្តគ្រឹះ៖ ព្រីមីទីវនៃ $\\cos x$ គឺ $\\sin x + k$ និងនៃ $\\sin x$ គឺ $-\\cos x + k$។",
      "អនុគមន៍បណ្តាក់លីនេអ៊ែរ៖ ព្រីមីទីវនៃ $\\cos(ax + b)$ គឺ $\\frac{1}{a}\\sin(ax + b) + k$ និងនៃ $\\sin(ax + b)$ គឺ $-\\frac{1}{a}\\cos(ax + b) + k$ ($a \\neq 0$)។",
    ],
    mistake: "ច្រឡំសញ្ញា៖ ព្រីមីទីវនៃ $\\sin$ ត្រូវមានសញ្ញាដក ($-$) ចំណែកព្រីមីទីវនៃ $\\cos$ គឺវិជ្ជមាន។",
    questions: [
      {
        prompt: "រកព្រីមីទីវទូទៅនៃ $f(x) = \\cos(2x - 1)$",
        options: ["$\\frac{1}{2}\\sin(2x - 1) + k$", "$-\\frac{1}{2}\\sin(2x - 1) + k$", "$2\\sin(2x - 1) + k$", "$\\sin(2x - 1) + k$"],
        correct: "$\\frac{1}{2}\\sin(2x - 1) + k$",
        explanation: "ព្រីមីទីវនៃ $\\cos(ax + b)$ គឺ $\\frac{1}{a}\\sin(ax + b) + k$ ដោយ $a = 2$ បាន $\\frac{1}{2}\\sin(2x - 1) + k$។",
      },
      {
        prompt: "រកព្រីមីទីវទូទៅនៃ $f(x) = \\sin(4x)$",
        options: ["$-\\frac{1}{4}\\cos(4x) + k$", "$\\frac{1}{4}\\cos(4x) + k$", "$-4\\cos(4x) + k$", "$4\\cos(4x) + k$"],
        correct: "$-\\frac{1}{4}\\cos(4x) + k$",
        explanation: "ព្រីមីទីវនៃ $\\sin(ax)$ គឺ $-\\frac{1}{a}\\cos(ax) + k$ ដោយ $a = 4$ បាន $-\\frac{1}{4}\\cos(4x) + k$។",
      },
    ],
    foundation: [
      {
        prompt: "តើដេរីវេនៃ $\\sin x$ ស្មើនឹងអ្វី?",
        options: ["$\\cos x$", "$-\\cos x$", "$\\sin x$", "$\\tan x$"],
        correct: "$\\cos x$",
        explanation: "ដេរីវេនៃ $\\sin x$ គឺ $\\cos x$ ដូច្នេះព្រីមីទីវនៃ $\\cos x$ គឺ $\\sin x + k$។",
      },
      {
        prompt: "តើដេរីវេនៃ $-\\cos x$ ស្មើនឹងអ្វី?",
        options: ["$\\sin x$", "$-\\sin x$", "$\\cos x$", "$0$"],
        correct: "$\\sin x$",
        explanation: "$(-\\cos x)' = -(-\\sin x) = \\sin x$ ដូច្នេះព្រីមីទីវនៃ $\\sin x$ គឺ $-\\cos x + k$។",
      },
    ],
  },

  "primitive-tan-squared": {
    label: "ព្រីមីទីវរាង 1 + tan^2 x និង 1 + cot^2 x",
    note: [
      "រូបមន្តគ្រឹះ៖ ព្រីមីទីវនៃ $\\frac{1}{\\cos^2 x} = 1 + \\tan^2 x$ គឺ $\\tan x + k$។",
      "រូបមន្តគ្រឹះ៖ ព្រីមីទីវនៃ $\\frac{1}{\\sin^2 x} = 1 + \\cot^2 x$ គឺ $-\\cot x + k$។",
    ],
    mistake: "ច្រឡំថាព្រីមីទីវនៃ $1 + \\tan^2 x$ ត្រូវគិតតាម $x + \\frac{\\tan^3 x}{3}$ ដែលជារូបមន្តខុស។",
    questions: [
      {
        prompt: "រកព្រីមីទីវទូទៅនៃ $f(x) = \\tan^2 x$",
        options: ["$\\tan x - x + k$", "$\\tan x + k$", "$\\frac{\\tan^3 x}{3} + k$", "$\\tan x + x + k$"],
        correct: "$\\tan x - x + k$",
        explanation: "សរសេរ $\\tan^2 x = (1 + \\tan^2 x) - 1$ នាំឱ្យ $F(x) = \\tan x - x + k$។",
      },
      {
        prompt: "រកព្រីមីទីវទូទៅនៃ $f(x) = 1 + \\cot^2 x$",
        options: ["$-\\cot x + k$", "$\\cot x + k$", "$\\tan x + k$", "$-\\tan x + k$"],
        correct: "$-\\cot x + k$",
        explanation: "ដោយសារ $(-\\cot x)' = \\frac{1}{\\sin^2 x} = 1 + \\cot^2 x$ នាំឱ្យព្រីមីទីវគឺ $-\\cot x + k$។",
      },
    ],
    foundation: [
      {
        prompt: "តើដេរីវេនៃ $\\tan x$ ស្មើនឹងអ្វី?",
        options: ["$1 + \\tan^2 x = \\frac{1}{\\cos^2 x}$", "$\\cos^2 x$", "$\\cot x$", "$1 - \\tan^2 x$"],
        correct: "$1 + \\tan^2 x = \\frac{1}{\\cos^2 x}$",
        explanation: "ដេរីវេនៃតង់សង់គឺ $1 + \\tan^2 x$ ឬ $\\frac{1}{\\cos^2 x}$។",
      },
      {
        prompt: "តើ $1 + \\tan^2 x$ ស្មើនឹងផលធៀបត្រីកោណមាត្រអ្វី?",
        options: ["$\\frac{1}{\\cos^2 x}$", "$\\frac{1}{\\sin^2 x}$", "$\\cos^2 x$", "$\\sin^2 x$"],
        correct: "$\\frac{1}{\\cos^2 x}$",
        explanation: "រូបមន្តត្រីកោណមាត្រគ្រឹះ $1 + \\tan^2 x = \\frac{1}{\\cos^2 x}$។",
      },
    ],
  },

  "primitive-log-form": {
    label: "ព្រីមីទីវរាង u'/u",
    note: [
      "រូបមន្តគ្រឹះ៖ ព្រីមីទីវនៃ $\\frac{1}{x}$ គឺ $\\ln|x| + k$។",
      "រូបមន្តអនុគមន៍បណ្តាក់៖ ព្រីមីទីវនៃ $\\frac{u'}{u}$ គឺ $\\ln|u| + k$ ($u \\neq 0$)។",
    ],
    mistake: "ភ្លេចសញ្ញាតម្លៃដាច់ខាត $|u|$ នៅពេលកន្សោមអាចមានតម្លៃអវិជ្ជមាន។",
    questions: [
      {
        prompt: "រកព្រីមីទីវទូទៅនៃ $f(x) = \\frac{1}{2x - 3}$ ចំពោះ $x > \\frac{3}{2}$",
        options: ["$\\frac{1}{2}\\ln(2x - 3) + k$", "$\\ln(2x - 3) + k$", "$2\\ln(2x - 3) + k$", "$-\\frac{1}{(2x - 3)^2} + k$"],
        correct: "$\\frac{1}{2}\\ln(2x - 3) + k$",
        explanation: "$u = 2x - 3 \\Rightarrow u' = 2$ នាំឱ្យ $f(x) = \\frac{1}{2}\\frac{2}{2x - 3} \\Rightarrow F(x) = \\frac{1}{2}\\ln(2x - 3) + k$។",
      },
      {
        prompt: "រកព្រីមីទីវទូទៅនៃ $f(x) = \\frac{x}{x^2 + 5}$",
        options: ["$\\frac{1}{2}\\ln(x^2 + 5) + k$", "$\\ln(x^2 + 5) + k$", "$\\sqrt{x^2 + 5} + k$", "$\\frac{1}{x^2 + 5} + k$"],
        correct: "$\\frac{1}{2}\\ln(x^2 + 5) + k$",
        explanation: "$u = x^2 + 5 \\Rightarrow u' = 2x$ នាំឱ្យ $f(x) = \\frac{1}{2}\\frac{2x}{x^2 + 5} \\Rightarrow F(x) = \\frac{1}{2}\\ln(x^2 + 5) + k$។",
      },
    ],
    foundation: [
      {
        prompt: "តើដេរីវេនៃ $\\ln|x|$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$\\frac{1}{x}$", "$x$", "$\\frac{1}{|x|}$", "$e^x$"],
        correct: "$\\frac{1}{x}$",
        explanation: "ដេរីវេនៃ $\\ln|x|$ គឺ $\\frac{1}{x}$ ចំពោះគ្រប់ $x \\neq 0$។",
      },
      {
        prompt: "តើដេរីវេនៃ $u = x^2 + x + 1$ ស្មើប៉ុន្មាន?",
        options: ["$2x + 1$", "$2x$", "$x + 1$", "$2$"],
        correct: "$2x + 1$",
        explanation: "$(x^2 + x + 1)' = 2x + 1$។",
      },
    ],
  },

  "primitive-exp-form": {
    label: "ព្រីមីទីវរាង u' e^u",
    note: [
      "រូបមន្តគ្រឹះ៖ ព្រីមីទីវនៃ $e^x$ គឺ $e^x + k$។",
      "រូបមន្តអនុគមន៍បណ្តាក់៖ ព្រីមីទីវនៃ $u' e^u$ គឺ $e^u + k$។",
    ],
    mistake: "ភ្លេចចែកនឹងមេគុណរបស់ $x$ នៅពេលធ្វើព្រីមីទីវលើ $e^{ax + b}$។",
    questions: [
      {
        prompt: "រកព្រីមីទីវទូទៅនៃ $f(x) = e^{3x - 1}$",
        options: ["$\\frac{1}{3}e^{3x - 1} + k$", "$3e^{3x - 1} + k$", "$e^{3x - 1} + k$", "$\\frac{1}{3}e^{3x} + k$"],
        correct: "$\\frac{1}{3}e^{3x - 1} + k$",
        explanation: "$u = 3x - 1 \\Rightarrow u' = 3$ នាំឱ្យ $F(x) = \\frac{1}{3}e^{3x - 1} + k$។",
      },
      {
        prompt: "រកព្រីមីទីវទូទៅនៃ $f(x) = (2x + 1)e^{x^2 + x}$",
        options: ["$e^{x^2 + x} + k$", "$2e^{x^2 + x} + k$", "$\\frac{1}{2}e^{x^2 + x} + k$", "$(x^2 + x)e^{x^2 + x} + k$"],
        correct: "$e^{x^2 + x} + k$",
        explanation: "$u = x^2 + x \\Rightarrow u' = 2x + 1$ មានរាង $u' e^u$ នាំឱ្យ $F(x) = e^{x^2 + x} + k$។",
      },
    ],
    foundation: [
      {
        prompt: "តើដេរីវេនៃ $e^u$ ស្មើនឹងអ្វី?",
        options: ["$u' e^u$", "$e^u$", "$u e^{u-1}$", "$\\frac{e^u}{u'}$"],
        correct: "$u' e^u$",
        explanation: "ដេរីវេនៃ $e^u$ គឺ $u' e^u$ ដូច្នេះព្រីមីទីវនៃ $u' e^u$ គឺ $e^u + k$។",
      },
      {
        prompt: "តើដេរីវេនៃ $u = x^2$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$2x$", "$x$", "$2$", "$x^2$"],
        correct: "$2x$",
        explanation: "$(x^2)' = 2x$។",
      },
    ],
  },

  "primitive-initial-condition": {
    label: "កំណត់ព្រីមីទីវតាមលក្ខខណ្ឌដើម F(x0) = y0",
    note: [
      "ព្រីមីទីវទូទៅ $F(x) + k$ មានចំនួនថេរ $k$។",
      "ដើម្បីរកតម្លៃ $k$ ជាក់លាក់ យើងជំនួសលក្ខខណ្ឌ $F(x_0) = y_0$ រួចដោះស្រាយសមីការរក $k$។",
    ],
    mistake: "គណនា $k$ ខុសសញ្ញាពេលផ្ទេរតួពីអង្គម្ខាងទៅអង្គម្ខាងទៀត។",
    questions: [
      {
        prompt: "រកព្រីមីទីវ $F(x)$ នៃ $f(x) = 4x + 1$ ដោយដឹងថា $F(1) = 6$",
        options: ["$F(x) = 2x^2 + x + 3$", "$F(x) = 2x^2 + x + 6$", "$F(x) = 4x^2 + x + 1$", "$F(x) = 2x^2 + x - 3$"],
        correct: "$F(x) = 2x^2 + x + 3$",
        explanation:
          "$F(x) = 2x^2 + x + k$។ $F(1) = 2(1)^2 + 1 + k = 3 + k = 6 \\Rightarrow k = 3$។ ដូច្នេះ $F(x) = 2x^2 + x + 3$។",
      },
      {
        prompt: "រកព្រីមីទីវ $F(x)$ នៃ $f(x) = 3x^2 - 2x$ ដោយដឹងថា $F(0) = 4$",
        options: ["$F(x) = x^3 - x^2 + 4$", "$F(x) = x^3 - x^2$", "$F(x) = 3x^3 - 2x^2 + 4$", "$F(x) = x^3 - x^2 - 4$"],
        correct: "$F(x) = x^3 - x^2 + 4$",
        explanation: "$F(x) = x^3 - x^2 + k$។ $F(0) = 0 + k = 4 \\Rightarrow k = 4$។ ដូច្នេះ $F(x) = x^3 - x^2 + 4$។",
      },
    ],
    foundation: [
      {
        prompt: "គណនាព្រីមីទីវទូទៅនៃ $f(x) = 2x - 3$",
        options: ["$x^2 - 3x + k$", "$2x^2 - 3x + k$", "$x^2 + 3x + k$", "$x^2 - 3 + k$"],
        correct: "$x^2 - 3x + k$",
        explanation: "$F(x) = 2\\left(\\frac{x^2}{2}\\right) - 3x + k = x^2 - 3x + k$។",
      },
      {
        prompt: "ដោះស្រាយសមីការ $-2 + k = 5$",
        options: ["$k = 7$", "$k = 3$", "$k = -7$", "$k = -3$"],
        correct: "$k = 7$",
        explanation: "$k = 5 + 2 = 7$។",
      },
    ],
  },

  "primitive-partial-fractions": {
    label: "ព្រីមីទីវតាមការបំបែកជាប្រភាគងាយ",
    note: [
      "សម្រាប់អនុគមន៍រាង $\\frac{1}{(x - a)(x - b)}$ ($a \\neq b$)៖",
      "យើងបំបែកជាផលដកនៃប្រភាគងាយ៖ $\\frac{1}{b - a}\\left(\\frac{1}{x - b} - \\frac{1}{x - a}\\right)$។",
      "បន្ទាប់មកធ្វើព្រីមីទីវបានផលដកលោការីត $\\ln|x - b| - \\ln|x - a| = \\ln\\left|\\frac{x - b}{x - a}\\right|$។",
    ],
    mistake: "ច្រឡំធ្វើព្រីមីទីវភាគយកដោយឡែក និងភាគបែងដោយឡែក ដែលជាការខុសធ្ងន់ធ្ងរ។",
    questions: [
      {
        prompt: "រកព្រីមីទីវទូទៅនៃ $f(x) = \\frac{1}{x(x - 1)}$ ចំពោះ $x > 1$",
        options: ["$\\ln\\left(\\frac{x - 1}{x}\\right) + k$", "$\\ln\\left(\\frac{x}{x - 1}\\right) + k$", "$\\ln(x^2 - x) + k$", "$\\frac{1}{2x - 1} + k$"],
        correct: "$\\ln\\left(\\frac{x - 1}{x}\\right) + k$",
        explanation:
          "$\\frac{1}{x(x - 1)} = \\frac{1}{x - 1} - \\frac{1}{x} \\Rightarrow F(x) = \\ln(x - 1) - \\ln x + k = \\ln\\left(\\frac{x - 1}{x}\\right) + k$។",
      },
      {
        prompt: "រកព្រីមីទីវទូទៅនៃ $f(x) = \\frac{1}{x + 1} + \\frac{1}{x + 2}$ ចំពោះ $x > 0$",
        options: ["$\\ln[(x + 1)(x + 2)] + k$", "$\\ln\\left(\\frac{x + 1}{x + 2}\\right) + k$", "$\\frac{1}{(x + 1)(x + 2)} + k$", "$\\ln(2x + 3) + k$"],
        correct: "$\\ln[(x + 1)(x + 2)] + k$",
        explanation: "$\\ln(x + 1) + \\ln(x + 2) + k = \\ln[(x + 1)(x + 2)] + k$ តាមលក្ខណៈលោការីត។",
      },
    ],
    foundation: [
      {
        prompt: "តើ $\\frac{1}{x} - \\frac{1}{x + 1}$ តម្រូវភាគបែងរួមស្មើនឹងអ្វី?",
        options: ["$\\frac{1}{x(x + 1)}$", "$\\frac{2x + 1}{x(x + 1)}$", "$\\frac{x}{x + 1}$", "$0$"],
        correct: "$\\frac{1}{x(x + 1)}$",
        explanation: "$\\frac{(x + 1) - x}{x(x + 1)} = \\frac{1}{x(x + 1)}$។",
      },
      {
        prompt: "តើ $\\ln a - \\ln b$ ស្មើនឹងលក្ខណៈលោការីតអ្វី?",
        options: ["$\\ln\\left(\\frac{a}{b}\\right)$", "$\\ln(ab)$", "$\\ln(a - b)$", "$\\frac{\\ln a}{\\ln b}$"],
        correct: "$\\ln\\left(\\frac{a}{b}\\right)$",
        explanation: "ផលដកលោការីតស្មើនឹងលោការីតនៃផលចែក។",
      },
    ],
  },
};

/** ផ្នែកទី 2 · ព្រីមីទីវនៃអនុគមន៍ — ten techniques, one question each. */
export const MATH_PRIMITIVES_QUIZ: SectionQuestion[] = [
  {
    q: "រកព្រីមីទីវទូទៅនៃអនុគមន៍ $f(x) = 3x^2 - 4x + 1$",
    options: [
      "ក. $x^3 - 2x^2 + x + k$",
      "ខ. $3x^3 - 4x^2 + x + k$",
      "គ. $6x - 4 + k$",
      "ឃ. $x^3 - 4x^2 + k$",
    ],
    correct: "ក. $x^3 - 2x^2 + x + k$",
    explanation:
      "តាមរូបមន្តព្រីមីទីវនៃ $x^n$ គឺ $\\frac{x^{n+1}}{n+1}$ យើងបាន $F(x) = 3\\left(\\frac{x^3}{3}\\right) - 4\\left(\\frac{x^2}{2}\\right) + x + k = x^3 - 2x^2 + x + k$។",
    help: MATH_PRIMITIVE_SKILLS["primitive-polynomial"],
  },
  {
    q: "រកព្រីមីទីវទូទៅនៃអនុគមន៍ $f(x) = (2x - 3)^4$",
    options: [
      "ក. $\\frac{(2x - 3)^5}{5} + k$",
      "ខ. $\\frac{(2x - 3)^5}{10} + k$",
      "គ. $8(2x - 3)^3 + k$",
      "ឃ. $\\frac{(2x - 3)^4}{2} + k$",
    ],
    correct: "ខ. $\\frac{(2x - 3)^5}{10} + k$",
    explanation:
      "តាង $u = 2x - 3 \\Rightarrow u' = 2$។ សរសេរ $f(x) = \\frac{1}{2}(2)(2x - 3)^4 = \\frac{1}{2}u' u^4$ នាំឱ្យ $F(x) = \\frac{1}{2}\\frac{(2x - 3)^5}{5} + k = \\frac{(2x - 3)^5}{10} + k$។",
    help: MATH_PRIMITIVE_SKILLS["primitive-power-chain"],
  },
  {
    q: "រកព្រីមីទីវទូទៅនៃអនុគមន៍ $f(x) = \\frac{x}{\\sqrt{x^2 + 1}}$",
    options: [
      "ក. $2\\sqrt{x^2 + 1} + k$",
      "ខ. $\\frac{1}{2}\\sqrt{x^2 + 1} + k$",
      "គ. $\\sqrt{x^2 + 1} + k$",
      "ឃ. $\\ln\\sqrt{x^2 + 1} + k$",
    ],
    correct: "គ. $\\sqrt{x^2 + 1} + k$",
    explanation:
      "តាង $u = x^2 + 1 \\Rightarrow u' = 2x$។ $f(x) = \\frac{1}{2}\\frac{2x}{\\sqrt{x^2 + 1}} = \\frac{1}{2}\\frac{u'}{\\sqrt{u}}$ នាំឱ្យ $F(x) = \\frac{1}{2}(2\\sqrt{u}) + k = \\sqrt{x^2 + 1} + k$។",
    help: MATH_PRIMITIVE_SKILLS["primitive-sqrt-chain"],
  },
  {
    q: "រកព្រីមីទីវទូទៅនៃអនុគមន៍ $f(x) = \\frac{1}{(x - 2)^2}$ ចំពោះ $x \\neq 2$",
    options: [
      "ក. $\\frac{1}{x - 2} + k$",
      "ខ. $\\ln|x - 2| + k$",
      "គ. $-\\frac{2}{(x - 2)^3} + k$",
      "ឃ. $-\\frac{1}{x - 2} + k$",
    ],
    correct: "ឃ. $-\\frac{1}{x - 2} + k$",
    explanation:
      "តាង $u = x - 2 \\Rightarrow u' = 1$។ តាមរូបមន្ត $\\frac{u'}{u^2} \\Rightarrow -\\frac{1}{u} + k$ នាំឱ្យ $F(x) = -\\frac{1}{x - 2} + k$។",
    help: MATH_PRIMITIVE_SKILLS["primitive-inverse-square"],
  },
  {
    q: "រកព្រីមីទីវទូទៅនៃអនុគមន៍ $f(x) = \\sin(3x + 1)$",
    options: [
      "ក. $-\\frac{1}{3}\\cos(3x + 1) + k$",
      "ខ. $3\\cos(3x + 1) + k$",
      "គ. $\\frac{1}{3}\\cos(3x + 1) + k$",
      "ឃ. $-\\cos(3x + 1) + k$",
    ],
    correct: "ក. $-\\frac{1}{3}\\cos(3x + 1) + k$",
    explanation:
      "តាមរូបមន្តព្រីមីទីវនៃ $\\sin(ax + b)$ គឺ $-\\frac{1}{a}\\cos(ax + b) + k$ ដោយ $a = 3$ នាំឱ្យបាន $-\\frac{1}{3}\\cos(3x + 1) + k$។",
    help: MATH_PRIMITIVE_SKILLS["primitive-trig-linear"],
  },
  {
    q: "រកព្រីមីទីវទូទៅនៃអនុគមន៍ $f(x) = 1 + \\tan^2 x$ ចំពោះ $x \\in \\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)$",
    options: [
      "ក. $\\cot x + k$",
      "ខ. $\\tan x + k$",
      "គ. $-\\tan x + k$",
      "ឃ. $\\frac{\\tan^3 x}{3} + k$",
    ],
    correct: "ខ. $\\tan x + k$",
    explanation:
      "ដោយសារ $(\\tan x)' = 1 + \\tan^2 x = \\frac{1}{\\cos^2 x}$ នាំឱ្យព្រីមីទីវនៃ $1 + \\tan^2 x$ គឺ $\\tan x + k$។",
    help: MATH_PRIMITIVE_SKILLS["primitive-tan-squared"],
  },
  {
    q: "រកព្រីមីទីវទូទៅនៃអនុគមន៍ $f(x) = \\frac{2x + 1}{x^2 + x + 1}$",
    options: [
      "ក. $\\frac{1}{(x^2 + x + 1)^2} + k$",
      "ខ. $\\sqrt{x^2 + x + 1} + k$",
      "គ. $\\ln(x^2 + x + 1) + k$",
      "ឃ. $(2x + 1)\\ln(x^2 + x + 1) + k$",
    ],
    correct: "គ. $\\ln(x^2 + x + 1) + k$",
    explanation:
      "តាង $u = x^2 + x + 1 > 0 \\Rightarrow u' = 2x + 1$។ កន្សោមមានរាង $\\frac{u'}{u}$ នាំឱ្យព្រីមីទីវគឺ $F(x) = \\ln(x^2 + x + 1) + k$។",
    help: MATH_PRIMITIVE_SKILLS["primitive-log-form"],
  },
  {
    q: "រកព្រីមីទីវទូទៅនៃអនុគមន៍ $f(x) = x e^{x^2}$",
    options: [
      "ក. $e^{x^2} + k$",
      "ខ. $x^2 e^{x^2} + k$",
      "គ. $\\frac{1}{2}x^2 e^{x^2} + k$",
      "ឃ. $\\frac{1}{2}e^{x^2} + k$",
    ],
    correct: "ឃ. $\\frac{1}{2}e^{x^2} + k$",
    explanation:
      "តាង $u = x^2 \\Rightarrow u' = 2x$។ សរសេរ $f(x) = \\frac{1}{2}(2x e^{x^2}) = \\frac{1}{2}u' e^u$ នាំឱ្យ $F(x) = \\frac{1}{2}e^{x^2} + k$។",
    help: MATH_PRIMITIVE_SKILLS["primitive-exp-form"],
  },
  {
    q: "រកព្រីមីទីវ $F(x)$ នៃ $f(x) = 2x - 3$ ដោយដឹងថា $F(2) = 5$",
    options: [
      "ក. $F(x) = x^2 - 3x + 7$",
      "ខ. $F(x) = x^2 - 3x + 5$",
      "គ. $F(x) = x^2 - 3x + 3$",
      "ឃ. $F(x) = 2x^2 - 3x + 7$",
    ],
    correct: "ក. $F(x) = x^2 - 3x + 7$",
    explanation:
      "$F(x) = x^2 - 3x + k$។ ជំនួសលក្ខខណ្ឌ $F(2) = 2^2 - 3(2) + k = -2 + k = 5 \\Rightarrow k = 7$។ ដូច្នេះ $F(x) = x^2 - 3x + 7$។",
    help: MATH_PRIMITIVE_SKILLS["primitive-initial-condition"],
  },
  {
    q: "រកព្រីមីទីវទូទៅនៃអនុគមន៍ $f(x) = \\frac{1}{x(x + 1)}$ ចំពោះ $x > 0$",
    options: [
      "ក. $\\ln(x^2 + x) + k$",
      "ខ. $\\ln\\left(\\frac{x}{x + 1}\\right) + k$",
      "គ. $\\ln(x + 1) - \\ln x + k$",
      "ឃ. $\\frac{1}{2x + 1} + k$",
    ],
    correct: "ខ. $\\ln\\left(\\frac{x}{x + 1}\\right) + k$",
    explanation:
      "បំបែកជាប្រភាគងាយ $\\frac{1}{x(x + 1)} = \\frac{1}{x} - \\frac{1}{x + 1}$។ ព្រីមីទីវគឺ $F(x) = \\ln x - \\ln(x + 1) + k = \\ln\\left(\\frac{x}{x + 1}\\right) + k$។",
    help: MATH_PRIMITIVE_SKILLS["primitive-partial-fractions"],
  },
];
