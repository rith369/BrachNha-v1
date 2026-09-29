import type { SectionQuestion, SkillHelp } from "../../types/index.js";

/**
 * MATH · មេរៀនទី 2 ដេរីវេ និងព្រីមីទីវនៃអនុគមន៍ · ផ្នែកទី 1 ដេរីវេនៃអនុគមន៍
 *
 * Ten techniques covering polynomial, power, radical, product, quotient,
 * trigonometric, exponential, logarithmic derivatives and kinematic applications
 * from the MoEYS Grade 12 Math Summary book.
 */

export type MathDerivativeSkillId =
  | "derivative-polynomial"
  | "derivative-power-chain"
  | "derivative-sqrt-chain"
  | "derivative-product"
  | "derivative-quotient"
  | "derivative-trig-chain"
  | "derivative-exp-chain"
  | "derivative-ln-chain"
  | "derivative-velocity"
  | "derivative-acceleration";

export const MATH_DERIVATIVE_SKILLS: Record<
  MathDerivativeSkillId,
  Required<SkillHelp>
> = {
  "derivative-polynomial": {
    label: "ដេរីវេនៃអនុគមន៍ពហុធា",
    note: [
      "រូបមន្តគ្រឹះ៖ $(x^n)' = n x^{n-1}$, $(ax)' = a$ និង $(c)' = 0$ ($c$ ជាចំនួនថេរ)។",
      "ដេរីវេនៃផលបូក ដក គឺស្មើនឹងផលបូក ដកនៃដេរីវេនីមួយៗ៖ $(u + v)' = u' + v'$។",
    ],
    mistake: "ភ្លេចថាដេរីវេនៃចំនួនថេរស្មើ 0 ហើយច្រឡំសរសេរថេរទុកដដែល។",
    questions: [
      {
        prompt: "គណនាដេរីវេនៃ $f(x) = 4x^3 - 5x^2 + 7$",
        options: ["$12x^2 - 10x$", "$12x^2 - 10x + 7$", "$4x^2 - 5x$", "$12x^3 - 10x^2$"],
        correct: "$12x^2 - 10x$",
        explanation: "$f'(x) = 4(3x^2) - 5(2x) + 0 = 12x^2 - 10x$",
      },
      {
        prompt: "គណនាដេរីវេនៃ $f(x) = 2x^4 - 3x + 1$",
        options: ["$8x^3 - 3$", "$8x^3 - 3x$", "$8x^3$", "$2x^3 - 3$"],
        correct: "$8x^3 - 3$",
        explanation: "$f'(x) = 2(4x^3) - 3(1) + 0 = 8x^3 - 3$",
      },
    ],
    foundation: [
      {
        prompt: "តើដេរីវេនៃ $x^3$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$3x^2$", "$3x$", "$x^2$", "$\\frac{x^4}{4}$"],
        correct: "$3x^2$",
        explanation: "រូបមន្ត $(x^n)' = n x^{n-1}$ ដោយ $n = 3$ បាន $3x^2$។",
      },
      {
        prompt: "តើដេរីវេនៃចំនួនថេរ $c$ ($c \\in \\mathbb{R}$) ស្មើនឹងប៉ុន្មាន?",
        options: ["$0$", "$1$", "$c$", "$x$"],
        correct: "$0$",
        explanation: "ចំនួនថេរគ្មានអត្រាបម្រែបម្រួលទេ ដូច្នេះដេរីវេស្មើ 0 ជានិច្ច។",
      },
    ],
  },

  "derivative-power-chain": {
    label: "ដេរីវេស្វ័យគុណអនុគមន៍បណ្តាក់ u^n",
    note: [
      "រូបមន្តគ្រឹះ៖ $(u^n)' = n u^{n-1} \\cdot u'$។",
      "កុំភ្លេចគុណនឹង $u'$ (ដេរីវេនៃកន្សោមខាងក្នុង)។",
    ],
    mistake: "ភ្លេចគុណនឹង $u'$ នៅខាងចុង ដោយសរសេរត្រឹមតែ $n u^{n-1}$។",
    questions: [
      {
        prompt: "គណនាដេរីវេនៃ $f(x) = (3x + 1)^4$",
        options: ["$12(3x + 1)^3$", "$4(3x + 1)^3$", "$3(3x + 1)^3$", "$12(3x + 1)^4$"],
        correct: "$12(3x + 1)^3$",
        explanation: "$u = 3x + 1 \\Rightarrow u' = 3$។ $f'(x) = 4(3x + 1)^3 \\cdot 3 = 12(3x + 1)^3$។",
      },
      {
        prompt: "គណនាដេរីវេនៃ $f(x) = (1 - 2x)^3$",
        options: ["$-6(1 - 2x)^2$", "$3(1 - 2x)^2$", "$6(1 - 2x)^2$", "$-2(1 - 2x)^2$"],
        correct: "$-6(1 - 2x)^2$",
        explanation: "$u = 1 - 2x \\Rightarrow u' = -2$ នាំឱ្យ $f'(x) = 3(1 - 2x)^2(-2) = -6(1 - 2x)^2$។",
      },
    ],
    foundation: [
      {
        prompt: "តើដេរីវេនៃ $u = 2x - 1$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$2$", "$1$", "$2x$", "$0$"],
        correct: "$2$",
        explanation: "$(2x - 1)' = 2(1) - 0 = 2$។",
      },
      {
        prompt: "តាមរូបមន្ត $(u^n)'$ តើកន្សោមត្រូវគុណនឹងអ្វីបន្ថែមទៀត?",
        options: ["$u'$", "$u$", "$n$", "$\\frac{1}{u'}$"],
        correct: "$u'$",
        explanation: "វិធានច្រវាក់ (Chain Rule) តម្រូវឱ្យគុណនឹងដេរីវេខាងក្នុង $u'$។",
      },
    ],
  },

  "derivative-sqrt-chain": {
    label: "ដេរីវេនៃកន្សោមរ៉ាឌីកាល់ sqrt(u)",
    note: [
      "រូបមន្តគ្រឹះ៖ $(\\sqrt{x})' = \\frac{1}{2\\sqrt{x}}$ ចំពោះ $x > 0$។",
      "រូបមន្តអនុគមន៍បណ្តាក់៖ $(\\sqrt{u})' = \\frac{u'}{2\\sqrt{u}}$ ចំពោះ $u > 0$។",
    ],
    mistake: "ភ្លេចលេខ 2 នៅភាគបែង ឬភ្លេចដាក់ $u'$ នៅលើភាគយក។",
    questions: [
      {
        prompt: "គណនាដេរីវេនៃ $f(x) = \\sqrt{2x + 3}$",
        options: ["$\\frac{1}{\\sqrt{2x + 3}}$", "$\\frac{2}{\\sqrt{2x + 3}}$", "$\\frac{1}{2\\sqrt{2x + 3}}$", "$\\sqrt{2}$"],
        correct: "$\\frac{1}{\\sqrt{2x + 3}}$",
        explanation: "$u = 2x + 3 \\Rightarrow u' = 2$។ $f'(x) = \\frac{u'}{2\\sqrt{u}} = \\frac{2}{2\\sqrt{2x + 3}} = \\frac{1}{\\sqrt{2x + 3}}$",
      },
      {
        prompt: "គណនាដេរីវេនៃ $f(x) = \\sqrt{x^2 + 4}$",
        options: ["$\\frac{x}{\\sqrt{x^2 + 4}}$", "$\\frac{2x}{\\sqrt{x^2 + 4}}$", "$\\frac{1}{2\\sqrt{x^2 + 4}}$", "$\\frac{1}{\\sqrt{x^2 + 4}}$"],
        correct: "$\\frac{x}{\\sqrt{x^2 + 4}}$",
        explanation: "$u = x^2 + 4 \\Rightarrow u' = 2x$ នាំឱ្យ $f'(x) = \\frac{2x}{2\\sqrt{x^2 + 4}} = \\frac{x}{\\sqrt{x^2 + 4}}$",
      },
    ],
    foundation: [
      {
        prompt: "តើដេរីវេនៃ $u = 1 + x^2$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$2x$", "$x$", "$2$", "$x^2$"],
        correct: "$2x$",
        explanation: "$(1 + x^2)' = 0 + 2x = 2x$។",
      },
      {
        prompt: "តើរូបមន្តដេរីវេនៃ $\\sqrt{u}$ គឺជារូបមន្តណា?",
        options: ["$\\frac{u'}{2\\sqrt{u}}$", "$\\frac{1}{2\\sqrt{u}}$", "$\\frac{u'}{\\sqrt{u}}$", "$2u'\\sqrt{u}$"],
        correct: "$\\frac{u'}{2\\sqrt{u}}$",
        explanation: "រូបមន្តផ្លូវការរបស់ក្រសួងគឺ $(\\sqrt{u})' = \\frac{u'}{2\\sqrt{u}}$។",
      },
    ],
  },

  "derivative-product": {
    label: "ដេរីវេនៃផលគុណអនុគមន៍ uv",
    note: [
      "រូបមន្តគ្រឹះ៖ $(u \\cdot v)' = u'v + uv'$។",
      "កុំច្រឡំថា $(uv)' = u'v'$ ឱ្យសោះ!",
    ],
    mistake: "ដេរីវេតែម្ខាង ឬច្រឡំគុណដេរីវេបញ្ចូលគ្នា $(u'v')$។",
    questions: [
      {
        prompt: "គណនាដេរីវេនៃ $f(x) = x^2 e^x$",
        options: ["$x e^x(x + 2)$", "$2x e^x$", "$x^2 e^x$", "$2x + e^x$"],
        correct: "$x e^x(x + 2)$",
        explanation: "$u = x^2, v = e^x \\Rightarrow f'(x) = 2x e^x + x^2 e^x = x e^x(2 + x)$",
      },
      {
        prompt: "គណនាដេរីវេនៃ $f(x) = x \\ln x$",
        options: ["$\\ln x + 1$", "$\\ln x$", "$1$", "$\\frac{1}{x}$"],
        correct: "$\\ln x + 1$",
        explanation: "$f'(x) = (x)' \\ln x + x(\\ln x)' = 1 \\cdot \\ln x + x \\cdot \\frac{1}{x} = \\ln x + 1$",
      },
    ],
    foundation: [
      {
        prompt: "តើរូបមន្តដេរីវេនៃផលគុណ $(uv)'$ ស្មើនឹងអ្វី?",
        options: ["$u'v + uv'$", "$u'v'$", "$u'v - uv'$", "$\\frac{u'v + uv'}{v^2}$"],
        correct: "$u'v + uv'$",
        explanation: "ដេរីវេផលគុណគឺ $u'v + uv'$។",
      },
      {
        prompt: "តើដេរីវេនៃ $f(x) = \\sin x$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$\\cos x$", "$-\\cos x$", "$\\tan x$", "$0$"],
        correct: "$\\cos x$",
        explanation: "ដេរីវេនៃស៊ីនុសគឺកូស៊ីនុស $(\\sin x)' = \\cos x$។",
      },
    ],
  },

  "derivative-quotient": {
    label: "ដេរីវេនៃផលចែកអនុគមន៍ u/v",
    note: [
      "រូបមន្តគ្រឹះ៖ $\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}$ ($v \\neq 0$)។",
      "ចំណាំ៖ ភាគយកត្រូវមានសញ្ញាដក ($-$) នៅចន្លោះ $u'v$ និង $uv'$។",
    ],
    mistake: "ច្រឡំដាក់សញ្ញាបូកនៅភាគយក ឬច្រឡំយក $uv' - u'v$។",
    questions: [
      {
        prompt: "គណនាដេរីវេនៃ $f(x) = \\frac{x}{x + 1}$",
        options: ["$\\frac{1}{(x + 1)^2}$", "$\\frac{-1}{(x + 1)^2}$", "$\\frac{2x + 1}{(x + 1)^2}$", "$1$"],
        correct: "$\\frac{1}{(x + 1)^2}$",
        explanation: "$f'(x) = \\frac{1(x + 1) - x(1)}{(x + 1)^2} = \\frac{1}{(x + 1)^2}$",
      },
      {
        prompt: "គណនាដេរីវេនៃ $f(x) = \\frac{1}{2x - 1}$",
        options: ["$-\\frac{2}{(2x - 1)^2}$", "$\\frac{2}{(2x - 1)^2}$", "$-\\frac{1}{(2x - 1)^2}$", "$\\frac{1}{2}$"],
        correct: "$-\\frac{2}{(2x - 1)^2}$",
        explanation: "ប្រើរូបមន្ត $\\left(\\frac{1}{v}\\right)' = -\\frac{v'}{v^2}$ បាន $-\\frac{2}{(2x - 1)^2}$។",
      },
    ],
    foundation: [
      {
        prompt: "តើភាគបែងនៃដេរីវេផលចែក $\\left(\\frac{u}{v}\\right)'$ គឺអ្វី?",
        options: ["$v^2$", "$v$", "$v'$", "$u^2$"],
        correct: "$v^2$",
        explanation: "ភាគបែងត្រូវបានលើកជាការេ គឺ $v^2$។",
      },
      {
        prompt: "គណនា $(2x - 1)'(x + 1) - (2x - 1)(x + 1)'$",
        options: ["$3$", "$1$", "$-1$", "$4x$"],
        correct: "$3$",
        explanation: "$2(x + 1) - (2x - 1)(1) = 2x + 2 - 2x + 1 = 3$។",
      },
    ],
  },

  "derivative-trig-chain": {
    label: "ដេរីវេត្រីកោណមាត្រអនុគមន៍បណ្តាក់",
    note: [
      "រូបមន្តគ្រឹះ៖ $(\\sin u)' = u' \\cos u$ និង $(\\cos u)' = -u' \\sin u$។",
      "ចំពោះស្វ័យគុណត្រីកោណមាត្រ $(\\cos^n u)' = n \\cos^{n-1} u \\cdot (\\cos u)'$។",
    ],
    mistake: "ភ្លេចសញ្ញាដក $(-)$ ពេលដេរីវេកូស៊ីនុស $(\\cos u)' = -u'\\sin u$។",
    questions: [
      {
        prompt: "គណនាដេរីវេនៃ $f(x) = \\sin(3x + 1)$",
        options: ["$3\\cos(3x + 1)$", "$\\cos(3x + 1)$", "$-3\\cos(3x + 1)$", "$3\\sin(3x + 1)$"],
        correct: "$3\\cos(3x + 1)$",
        explanation: "$u = 3x + 1 \\Rightarrow u' = 3$ នាំឱ្យ $f'(x) = 3\\cos(3x + 1)$។",
      },
      {
        prompt: "គណនាដេរីវេនៃ $f(x) = \\cos(x^2)$",
        options: ["$-2x\\sin(x^2)$", "$2x\\sin(x^2)$", "$-\\sin(x^2)$", "$-2x\\cos(x^2)$"],
        correct: "$-2x\\sin(x^2)$",
        explanation: "$u = x^2 \\Rightarrow u' = 2x$ នាំឱ្យ $f'(x) = -2x\\sin(x^2)$។",
      },
    ],
    foundation: [
      {
        prompt: "តើដេរីវេនៃ $\\cos x$ ស្មើនឹងអ្វី?",
        options: ["$-\\sin x$", "$\\sin x$", "$-\\cos x$", "$\\tan x$"],
        correct: "$-\\sin x$",
        explanation: "ដេរីវេកូស៊ីនុសមានសញ្ញាដក គឺ $-\\sin x$។",
      },
      {
        prompt: "តើ $2\\sin x \\cos x$ ស្មើនឹងរូបមន្តត្រីកោណមាត្រអ្វី?",
        options: ["$\\sin 2x$", "$\\cos 2x$", "$2\\sin x$", "$\\sin^2 x$"],
        correct: "$\\sin 2x$",
        explanation: "រូបមន្តមុំឌុប $\\sin 2x = 2\\sin x \\cos x$។",
      },
    ],
  },

  "derivative-exp-chain": {
    label: "ដេរីវេអិចស្ប៉ូណង់ស្យែលអនុគមន៍បណ្តាក់ e^u",
    note: [
      "រូបមន្តគ្រឹះ៖ $(e^x)' = e^x$។",
      "រូបមន្តអនុគមន៍បណ្តាក់៖ $(e^u)' = u' e^u$។",
    ],
    mistake: "ច្រឡំថា $(e^u)' = u e^{u-1}$ ដូចអនុគមន៍ស្វ័យគុណ។",
    questions: [
      {
        prompt: "គណនាដេរីវេនៃ $f(x) = e^{x^2}$",
        options: ["$2x e^{x^2}$", "$e^{x^2}$", "$x^2 e^{x^2 - 1}$", "$2 e^{x^2}$"],
        correct: "$2x e^{x^2}$",
        explanation: "$u = x^2 \\Rightarrow u' = 2x$ នាំឱ្យ $f'(x) = 2x e^{x^2}$។",
      },
      {
        prompt: "គណនាដេរីវេនៃ $f(x) = e^{-3x}$",
        options: ["$-3e^{-3x}$", "$3e^{-3x}$", "$e^{-3x}$", "$-\\frac{1}{3}e^{-3x}$"],
        correct: "$-3e^{-3x}$",
        explanation: "$u = -3x \\Rightarrow u' = -3$ នាំឱ្យ $f'(x) = -3e^{-3x}$។",
      },
    ],
    foundation: [
      {
        prompt: "តើដេរីវេនៃ $e^x$ ស្មើនឹងអ្វី?",
        options: ["$e^x$", "$x e^{x-1}$", "$e$", "$1$"],
        correct: "$e^x$",
        explanation: "អនុគមន៍អិចស្ប៉ូណង់ស្យែល $e^x$ មានដេរីវេស្មើនឹងខ្លួនវាជានិច្ច។",
      },
      {
        prompt: "តើដេរីវេនៃ $u = 2x + 1$ ស្មើនឹងប៉ុន្មាន?",
        options: ["$2$", "$1$", "$2x$", "$0$"],
        correct: "$2$",
        explanation: "$(2x + 1)' = 2$។",
      },
    ],
  },

  "derivative-ln-chain": {
    label: "ដេរីវេលោការីតនេពែអនុគមន៍បណ្តាក់ ln u",
    note: [
      "រូបមន្តគ្រឹះ៖ $(\\ln x)' = \\frac{1}{x}$ ចំពោះ $x > 0$។",
      "រូបមន្តអនុគមន៍បណ្តាក់៖ $(\\ln u)' = \\frac{u'}{u}$ ចំពោះ $u > 0$។",
    ],
    mistake: "ភ្លេចដេរីវេ $u'$ នៅលើភាគយក ហើយសរសេរត្រឹម $\\frac{1}{u}$។",
    questions: [
      {
        prompt: "គណនាដេរីវេនៃ $f(x) = \\ln(3x - 1)$ ចំពោះ $x > \\frac{1}{3}$",
        options: ["$\\frac{3}{3x - 1}$", "$\\frac{1}{3x - 1}$", "$\\frac{1}{x}$", "$\\frac{3}{x}$"],
        correct: "$\\frac{3}{3x - 1}$",
        explanation: "$u = 3x - 1 \\Rightarrow u' = 3$ នាំឱ្យ $f'(x) = \\frac{u'}{u} = \\frac{3}{3x - 1}$",
      },
      {
        prompt: "គណនាដេរីវេនៃ $f(x) = \\ln(x^2 + 5)$",
        options: ["$\\frac{2x}{x^2 + 5}$", "$\\frac{1}{x^2 + 5}$", "$\\frac{2}{x^2 + 5}$", "$\\frac{x}{x^2 + 5}$"],
        correct: "$\\frac{2x}{x^2 + 5}$",
        explanation: "$u = x^2 + 5 \\Rightarrow u' = 2x$ នាំឱ្យ $f'(x) = \\frac{2x}{x^2 + 5}$",
      },
    ],
    foundation: [
      {
        prompt: "តើដេរីវេនៃ $\\ln x$ ស្មើនឹងអ្វី?",
        options: ["$\\frac{1}{x}$", "$\\frac{1}{\\ln x}$", "$e^x$", "$1$"],
        correct: "$\\frac{1}{x}$",
        explanation: "ដេរីវេគ្រឹះនៃលោការីតនេពែគឺ $(\\ln x)' = \\frac{1}{x}$។",
      },
      {
        prompt: "តើដេរីវេនៃ $u = x^2 + 1$ ស្មើប៉ុន្មាន?",
        options: ["$2x$", "$x$", "$2$", "$x^2$"],
        correct: "$2x$",
        explanation: "$(x^2 + 1)' = 2x$។",
      },
    ],
  },

  "derivative-velocity": {
    label: "អនុវត្តន៍ដេរីវេ៖ ល្បឿនខណៈ v(t)",
    note: [
      "បើចម្ងាយចរនៃចលនាមួយកំណត់ដោយ $s(t)$ នៅខណៈពេល $t$",
      "នោះល្បឿនខណៈនៅពេល $t$ គឺជាដេរីវេទី 1 នៃចម្ងាយចរ៖ $v(t) = s'(t) = \\frac{ds}{dt}$។",
    ],
    mistake: "ច្រឡំយកចម្ងាយចែកនឹងពេល $s/t$ ជំនួសឱ្យការគណនាដេរីវេ $s'(t)$។",
    questions: [
      {
        prompt: "ចម្ងាយចរនៃចលនាមួយគឺ $s(t) = 2t^2 - 3t + 1$ ($m$)។ រកល្បឿននៅខណៈ $t = 3\\text{ s}$",
        options: ["$9\\text{ m/s}$", "$10\\text{ m/s}$", "$12\\text{ m/s}$", "$6\\text{ m/s}$"],
        correct: "$9\\text{ m/s}$",
        explanation: "$v(t) = s'(t) = 4t - 3$។ នៅ $t = 3$ បាន $v(3) = 4(3) - 3 = 9\\text{ m/s}$។",
      },
      {
        prompt: "ចម្ងាយចរគឺ $s(t) = -5t^2 + 20t$ ($m$)។ រកខណៈពេល $t$ ដែលល្បឿនស្មើ $0$",
        options: ["$t = 2\\text{ s}$", "$t = 4\\text{ s}$", "$t = 1\\text{ s}$", "$t = 0\\text{ s}$"],
        correct: "$t = 2\\text{ s}$",
        explanation: "$v(t) = s'(t) = -10t + 20$។ $v(t) = 0 \\Leftrightarrow -10t + 20 = 0 \\Rightarrow t = 2\\text{ s}$។",
      },
    ],
    foundation: [
      {
        prompt: "តើល្បឿនខណៈ $v(t)$ ទាក់ទងនឹងចម្ងាយចរ $s(t)$ តាមរូបមន្តណា?",
        options: ["$v(t) = s'(t)$", "$v(t) = s''(t)$", "$v(t) = \\frac{s(t)}{t}$", "$v(t) = s(t) \\cdot t$"],
        correct: "$v(t) = s'(t)$",
        explanation: "ល្បឿនខណៈជាដេរីវេទី 1 នៃចម្ងាយចរធៀបនឹងពេល។",
      },
      {
        prompt: "គណនាដេរីវេនៃ $s(t) = t^3 - 3t^2 + 5$",
        options: ["$3t^2 - 6t$", "$3t^2 - 6$", "$t^2 - 6t$", "$3t^2$"],
        correct: "$3t^2 - 6t$",
        explanation: "$s'(t) = 3t^2 - 3(2t) + 0 = 3t^2 - 6t$។",
      },
    ],
  },

  "derivative-acceleration": {
    label: "អនុវត្តន៍ដេរីវេ៖ សំទុះខណៈ a(t)",
    note: [
      "សំទុះខណៈនៅខណៈ $t$ គឺជាដេរីវេនៃល្បឿន ឬជាដេរីវេទី 2 នៃចម្ងាយចរ៖",
      "$$a(t) = v'(t) = s''(t) = \\frac{dv}{dt}$$",
    ],
    mistake: "ច្រឡំសំទុះជាដេរីវេទី 1 នៃចម្ងាយចរជំនួសឱ្យដេរីវេទី 2។",
    questions: [
      {
        prompt: "ចម្ងាយចរគឺ $s(t) = t^3 - 6t^2 + 2$ ($m$)។ រកសំទុះនៅខណៈ $t = 4\\text{ s}$",
        options: ["$12\\text{ m/s}^2$", "$24\\text{ m/s}^2$", "$0\\text{ m/s}^2$", "$6\\text{ m/s}^2$"],
        correct: "$12\\text{ m/s}^2$",
        explanation:
          "$v(t) = s'(t) = 3t^2 - 12t$ នាំឱ្យ $a(t) = v'(t) = 6t - 12$។ នៅ $t = 4$ បាន $a(4) = 6(4) - 12 = 12\\text{ m/s}^2$។",
      },
      {
        prompt: "ល្បឿននៃចលនាមួយគឺ $v(t) = 4t^2 - 2t + 5$ ($m/s$)។ រកសំទុះនៅខណៈ $t = 2\\text{ s}$",
        options: ["$14\\text{ m/s}^2$", "$16\\text{ m/s}^2$", "$10\\text{ m/s}^2$", "$8\\text{ m/s}^2$"],
        correct: "$14\\text{ m/s}^2$",
        explanation: "$a(t) = v'(t) = 8t - 2$។ នៅ $t = 2$ បាន $a(2) = 8(2) - 2 = 14\\text{ m/s}^2$។",
      },
    ],
    foundation: [
      {
        prompt: "តើសំទុះខណៈ $a(t)$ ស្មើនឹងដេរីវេទីប៉ុន្មាននៃចម្ងាយចរ $s(t)$?",
        options: ["ដេរីវេទី 2 ($s''(t)$)", "ដេរីវេទី 1 ($s'(t)$)", "ដេរីវេទី 3 ($s'''(t)$)", "មិនមែនដេរីវេទេ"],
        correct: "ដេរីវេទី 2 ($s''(t)$)",
        explanation: "សំទុះជាដេរីវេទី 2 នៃចម្ងាយចរ ព្រោះវាជាអត្រាបម្រែបម្រួលនៃល្បឿន។",
      },
      {
        prompt: "គណនាដេរីវេនៃ $v(t) = 6t^2 - 4$",
        options: ["$12t$", "$12t - 4$", "$6t$", "$12$"],
        correct: "$12t$",
        explanation: "$v'(t) = 6(2t) - 0 = 12t$។",
      },
    ],
  },
};

/** ផ្នែកទី 1 · ដេរីវេនៃអនុគមន៍ — ten techniques, one question each. */
export const MATH_DERIVATIVES_QUIZ: SectionQuestion[] = [
  {
    q: "គណនាដេរីវេនៃអនុគមន៍ $f(x) = 3x^3 - 4x + 2$",
    options: ["ក. $9x^2 - 4$", "ខ. $9x^2$", "គ. $6x - 4$", "ឃ. $3x^2 - 4$"],
    correct: "ក. $9x^2 - 4$",
    explanation:
      "ប្រើរូបមន្ត $(x^n)' = n x^{n-1}$ យើងបាន $f'(x) = 3(3x^2) - 4(1) + 0 = 9x^2 - 4$។",
    help: MATH_DERIVATIVE_SKILLS["derivative-polynomial"],
  },
  {
    q: "គណនាដេរីវេនៃអនុគមន៍ $f(x) = (2x - 1)^5$",
    options: [
      "ក. $5(2x - 1)^4$",
      "ខ. $10(2x - 1)^4$",
      "គ. $10(2x - 1)^5$",
      "ឃ. $2(2x - 1)^4$",
    ],
    correct: "ខ. $10(2x - 1)^4$",
    explanation:
      "តាង $u = 2x - 1 \\Rightarrow u' = 2$។ តាមរូបមន្ត $(u^n)' = n u^{n-1} \\cdot u'$ បាន $f'(x) = 5(2x - 1)^4 \\cdot 2 = 10(2x - 1)^4$។",
    help: MATH_DERIVATIVE_SKILLS["derivative-power-chain"],
  },
  {
    q: "គណនាដេរីវេនៃអនុគមន៍ $f(x) = \\sqrt{1 + x^2}$",
    options: [
      "ក. $\\frac{1}{2\\sqrt{1 + x^2}}$",
      "ខ. $\\frac{2x}{\\sqrt{1 + x^2}}$",
      "គ. $\\frac{x}{\\sqrt{1 + x^2}}$",
      "ឃ. $\\frac{1}{\\sqrt{1 + x^2}}$",
    ],
    correct: "គ. $\\frac{x}{\\sqrt{1 + x^2}}$",
    explanation:
      "តាង $u = 1 + x^2 \\Rightarrow u' = 2x$។ តាមរូបមន្ត $(\\sqrt{u})' = \\frac{u'}{2\\sqrt{u}} = \\frac{2x}{2\\sqrt{1 + x^2}} = \\frac{x}{\\sqrt{1 + x^2}}$។",
    help: MATH_DERIVATIVE_SKILLS["derivative-sqrt-chain"],
  },
  {
    q: "គណនាដេរីវេនៃអនុគមន៍ $f(x) = x^2 \\sin x$",
    options: [
      "ក. $2x\\cos x$",
      "ខ. $x^2\\cos x$",
      "គ. $2x\\sin x - x^2\\cos x$",
      "ឃ. $2x\\sin x + x^2\\cos x$",
    ],
    correct: "ឃ. $2x\\sin x + x^2\\cos x$",
    explanation:
      "ប្រើរូបមន្ត $(uv)' = u'v + uv'$ ដោយ $u = x^2 \\Rightarrow u' = 2x$ និង $v = \\sin x \\Rightarrow v' = \\cos x$ នាំឱ្យ $f'(x) = 2x\\sin x + x^2\\cos x$។",
    help: MATH_DERIVATIVE_SKILLS["derivative-product"],
  },
  {
    q: "គណនាដេរីវេនៃអនុគមន៍ $f(x) = \\frac{2x - 1}{x + 1}$ ចំពោះ $x \\neq -1$",
    options: [
      "ក. $\\frac{3}{(x + 1)^2}$",
      "ខ. $\\frac{1}{(x + 1)^2}$",
      "គ. $\\frac{-3}{(x + 1)^2}$",
      "ឃ. $\\frac{2x + 1}{(x + 1)^2}$",
    ],
    correct: "ក. $\\frac{3}{(x + 1)^2}$",
    explanation:
      "តាមរូបមន្ត $\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}$ បាន $f'(x) = \\frac{2(x + 1) - (2x - 1)(1)}{(x + 1)^2} = \\frac{2x + 2 - 2x + 1}{(x + 1)^2} = \\frac{3}{(x + 1)^2}$។",
    help: MATH_DERIVATIVE_SKILLS["derivative-quotient"],
  },
  {
    q: "គណនាដេរីវេនៃអនុគមន៍ត្រីកោណមាត្រ $f(x) = \\cos^2 x$",
    options: ["ក. $\\sin 2x$", "ខ. $-\\sin 2x$", "គ. $-2\\sin x$", "ឃ. $2\\cos x$"],
    correct: "ខ. $-\\sin 2x$",
    explanation:
      "តាង $u = \\cos x \\Rightarrow u' = -\\sin x$។ តាមរូបមន្ត $(u^2)' = 2u \\cdot u' = 2\\cos x(-\\sin x) = -2\\sin x\\cos x = -\\sin 2x$។",
    help: MATH_DERIVATIVE_SKILLS["derivative-trig-chain"],
  },
  {
    q: "គណនាដេរីវេនៃអនុគមន៍ $f(x) = e^{2x + 1}$",
    options: [
      "ក. $e^{2x + 1}$",
      "ខ. $(2x + 1)e^{2x + 1}$",
      "គ. $2e^{2x + 1}$",
      "ឃ. $2e^x$",
    ],
    correct: "គ. $2e^{2x + 1}$",
    explanation:
      "តាង $u = 2x + 1 \\Rightarrow u' = 2$។ តាមរូបមន្ត $(e^u)' = u' e^u$ នាំឱ្យបាន $f'(x) = 2e^{2x + 1}$។",
    help: MATH_DERIVATIVE_SKILLS["derivative-exp-chain"],
  },
  {
    q: "គណនាដេរីវេនៃអនុគមន៍ $f(x) = \\ln(x^2 + 1)$",
    options: [
      "ក. $\\frac{1}{x^2 + 1}$",
      "ខ. $\\frac{x}{x^2 + 1}$",
      "គ. $\\frac{2}{x^2 + 1}$",
      "ឃ. $\\frac{2x}{x^2 + 1}$",
    ],
    correct: "ឃ. $\\frac{2x}{x^2 + 1}$",
    explanation:
      "តាង $u = x^2 + 1 \\Rightarrow u' = 2x$។ តាមរូបមន្ត $(\\ln u)' = \\frac{u'}{u}$ នាំឱ្យ $f'(x) = \\frac{2x}{x^2 + 1}$។",
    help: MATH_DERIVATIVE_SKILLS["derivative-ln-chain"],
  },
  {
    q: "សមីការចម្ងាយចរនៃចលនាមួយគឺ $s(t) = t^3 - 3t^2 + 5$ ($m$)។ រកល្បឿននៅខណៈ $t = 2\\text{ s}$",
    options: ["ក. $6\\text{ m/s}$", "ខ. $0\\text{ m/s}$", "គ. $12\\text{ m/s}$", "ឃ. $-6\\text{ m/s}$"],
    correct: "ខ. $0\\text{ m/s}$",
    explanation:
      "ល្បឿនខណៈ $v(t) = s'(t) = 3t^2 - 6t$។ នៅខណៈ $t = 2\\text{ s}$ បាន $v(2) = 3(2)^2 - 6(2) = 12 - 12 = 0\\text{ m/s}$ (ចលនាឈប់មួយរំពេច)។",
    help: MATH_DERIVATIVE_SKILLS["derivative-velocity"],
  },
  {
    q: "សមីការចម្ងាយចរនៃចលនាមួយគឺ $s(t) = 2t^3 - 4t + 1$ ($m$)។ រកសំទុះនៅខណៈ $t = 3\\text{ s}$",
    options: [
      "ក. $36\\text{ m/s}^2$",
      "ខ. $12\\text{ m/s}^2$",
      "គ. $50\\text{ m/s}^2$",
      "ឃ. $18\\text{ m/s}^2$",
    ],
    correct: "ក. $36\\text{ m/s}^2$",
    explanation:
      "ល្បឿន $v(t) = s'(t) = 6t^2 - 4$ នាំឱ្យសំទុះ $a(t) = v'(t) = s''(t) = 12t$។ នៅខណៈ $t = 3\\text{ s}$ បាន $a(3) = 12(3) = 36\\text{ m/s}^2$។",
    help: MATH_DERIVATIVE_SKILLS["derivative-acceleration"],
  },
];
