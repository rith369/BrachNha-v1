import type { ExamQuestion } from "@/types";

/**
 * Questions for a Game match — one subject per match, keyed by SubjectId
 * ("math", "biology", …), the same keying GENERATED_EXAM_QUESTIONS uses.
 *
 * EMPTY TODAY, AND THAT IS THE NORMAL STATE — the same discipline
 * PAST_PAPERS and PRACTICE_QUIZZES ship with. features/game/game.ts
 * derives one card per subject from the catalog regardless of what is in here,
 * so a subject with no entry below renders ឆាប់ៗនេះ and is not tappable. Adding
 * one entry turns that card on; there is no other code change.
 *
 * An entry here REPLACES the GENERATED_EXAM_QUESTIONS fallback for that subject
 * wholesale — the same rule SUBJECT_SESSIONS follows against chaptersFor()'s
 * derived path. See gameQuestionsFor() for the fallback and why it exists.
 *
 * DON'T author a question count, a duration, or a "playable" flag beside these.
 * The count is questions.length and the clock is one shared constant
 * (SECONDS_PER_QUESTION in features/game/game.ts) — the lessonCountFor() rule
 * that a card's number cannot drift from the content it describes.
 *
 * ExamQuestion rather than a game-specific type, deliberately: it is already
 * exactly {q: {en,km}, options, correct}, and a third question shape would mean
 * authoring the same questions twice. `subj` is left off — a match is ONE
 * subject end to end and carries its label on the match, which is the precise
 * case that field was made optional for. MockExamQuestion would be wrong here:
 * its MockExamSubject union cannot express a Khmer or History match, and the
 * catalog has cards for both.
 *
 * data/ imports nothing from features/, exactly as data/past-papers.ts does; the
 * typed SubjectId lookup lives in features/game/game.ts.
 */
export const GAME_QUESTIONS: Record<string, ExamQuestion[]> = {
  math: [
    {
      q: {
        en: "Evaluate the limit: $\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$",
        km: "គណនាលីមីត៖ $\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$",
      },
      options: ["ក. $0$", "ខ. $2$", "គ. $4$", "ឃ. គ្មានកំណត់"],
      correct: "គ. $4$",
      difficulty: "easy",
      explanation:
        "បំបែកភាគយកជាផលគុណកត្តា $\\frac{(x - 2)(x + 2)}{x - 2} = x + 2$។ ជំនួស $x = 2$ នាំឱ្យបាន $2 + 2 = 4$។",
    },
    {
      q: {
        en: "Evaluate the limit: $\\lim_{x \\to +\\infty} \\frac{3x^2 - 5x + 1}{2x^2 + 7}$",
        km: "គណនាលីមីត៖ $\\lim_{x \\to +\\infty} \\frac{3x^2 - 5x + 1}{2x^2 + 7}$",
      },
      options: ["ក. $\\frac{3}{2}$", "ខ. $0$", "គ. $+\\infty$", "ឃ. $-\\frac{5}{7}$"],
      correct: "ក. $\\frac{3}{2}$",
      difficulty: "easy",
      explanation:
        "ចំពោះអនុគមន៍សនិទានកាលណា $x \\to +\\infty$ យើងទាញយកតួដឺក្រេខ្ពស់ជាងគេ៖ $\\lim_{x \\to +\\infty} \\frac{3x^2}{2x^2} = \\frac{3}{2}$។",
    },
    {
      q: {
        en: "Given the function $f(x) = x^3 - 4x^2 + 5x - 7$, find the derivative $f'(x)$:",
        km: "គេមានអនុគមន៍ $f(x) = x^3 - 4x^2 + 5x - 7$។ រកកន្សោមដេរីវេ $f'(x)$៖",
      },
      options: [
        "ក. $3x^2 - 8x$",
        "ខ. $3x^2 - 8x + 5$",
        "គ. $x^2 - 8x + 5$",
        "ឃ. $3x^2 - 4x + 5$",
      ],
      correct: "ខ. $3x^2 - 8x + 5$",
      difficulty: "easy",
      explanation:
        "ប្រើរូបមន្ត $(x^n)' = n x^{n-1}$ ទៅលើតួនីមួយៗ យើងបាន $3x^2 - 8x + 5$។",
    },
    {
      q: {
        en: "Find the derivative of the function $g(x) = e^{3x + 1}$:",
        km: "គណនាដេរីវេនៃអនុគមន៍ $g(x) = e^{3x + 1}$៖",
      },
      options: [
        "ក. $e^{3x + 1}$",
        "ខ. $3xe^{3x + 1}$",
        "គ. $3e^{3x + 1}$",
        "ឃ. $\\frac{1}{3}e^{3x + 1}$",
      ],
      correct: "គ. $3e^{3x + 1}$",
      difficulty: "easy",
      explanation:
        "តាមរូបមន្ត $(e^u)' = u' \\cdot e^u$ ដែល $u = 3x + 1$ និង $u' = 3$ នាំឱ្យ $g'(x) = 3e^{3x + 1}$។",
    },
    {
      q: {
        en: "Find the derivative of the function $h(x) = \\ln(2x)$ for all $x > 0$:",
        km: "គណនាដេរីវេនៃអនុគមន៍ $h(x) = \\ln(2x)$ ចំពោះគ្រប់ $x > 0$៖",
      },
      options: ["ក. $\\frac{1}{x}$", "ខ. $\\frac{2}{x}$", "គ. $\\frac{1}{2x}$", "ឃ. $\\ln 2$"],
      correct: "ក. $\\frac{1}{x}$",
      difficulty: "easy",
      explanation:
        "តាមរូបមន្ត $(\\ln u)' = \\frac{u'}{u} = \\frac{2}{2x} = \\frac{1}{x}$ (ឬបំបែក $\\ln(2x) = \\ln 2 + \\ln x$ នោះដេរីវេគឺ $0 + \\frac{1}{x} = \\frac{1}{x}$)។",
    },
    {
      q: {
        en: "Find the general antiderivative $F(x)$ of $f(x) = 6x^2 - 2x$:",
        km: "រកព្រីមីទីវទូទៅ $F(x)$ នៃអនុគមន៍ $f(x) = 6x^2 - 2x$៖",
      },
      options: [
        "ក. $12x - 2 + C$",
        "ខ. $3x^3 - x^2 + C$",
        "គ. $2x^3 - x^2 + C$",
        "ឃ. $2x^3 - 2x^2 + C$",
      ],
      correct: "គ. $2x^3 - x^2 + C$",
      difficulty: "easy",
      explanation:
        "$\\int (6x^2 - 2x)\\,dx = 6 \\cdot \\frac{x^3}{3} - 2 \\cdot \\frac{x^2}{2} + C = 2x^3 - x^2 + C$។",
    },
    {
      q: {
        en: "Calculate the definite integral: $\\int_{0}^{2} (2x + 1)\\,dx$",
        km: "គណនាតម្លៃអាំងតេក្រាល៖ $\\int_{0}^{2} (2x + 1)\\,dx$",
      },
      options: ["ក. $4$", "ខ. $5$", "គ. $8$", "ឃ. $6$"],
      correct: "ឃ. $6$",
      difficulty: "easy",
      explanation:
        "ព្រីមីទីវនៃកន្សោមគឺ $[x^2 + x]_0^2 = (2^2 + 2) - (0^2 + 0) = 4 + 2 = 6$។",
    },
    {
      q: {
        en: "Given the complex number $z = 3 - 4i$, calculate the modulus $|z|$:",
        km: "គេមានចំនួនកុំផ្លិច $z = 3 - 4i$។ គណនាម៉ូឌុល $|z|$៖",
      },
      options: ["ក. $7$", "ខ. $5$", "គ. $\\sqrt{7}$", "ឃ. $-1$"],
      correct: "ខ. $5$",
      difficulty: "easy",
      explanation:
        "រូបមន្តម៉ូឌុល $|z| = \\sqrt{a^2 + b^2} = \\sqrt{3^2 + (-4)^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$។",
    },
    {
      q: {
        en: "If $z = -2 + 5i$, what is the complex conjugate $\\bar{z}$?",
        km: "បើ $z = -2 + 5i$ តើកុំផ្លិចឆ្លាស់ $\\bar{z}$ ស្មើនឹងប៉ុន្មាន?",
      },
      options: ["ក. $2 - 5i$", "ខ. $2 + 5i$", "គ. $-5 + 2i$", "ឃ. $-2 - 5i$"],
      correct: "ឃ. $-2 - 5i$",
      difficulty: "easy",
      explanation:
        "ចំនួនកុំផ្លិចឆ្លាស់នៃ $a + bi$ គឺ $a - bi$ (ដូរតែសញ្ញានៅផ្នែកនិម្មិត) ដូច្នេះ $\\bar{z} = -2 - 5i$។",
    },
    {
      q: {
        en: "A fair six-sided die is rolled once. Find the probability of rolling an even prime number:",
        km: "គេបោះគ្រាប់ឡុកឡាក់មួយគ្រាប់ដែលត្រឹមត្រូវចំនួនមួយដង។ រកប្រូបាបដើម្បីទទួលបានលេខដែលជាចំនួនបឋមគូ៖",
      },
      options: ["ក. $\\frac{1}{6}$", "ខ. $\\frac{1}{3}$", "គ. $\\frac{1}{2}$", "ឃ. $\\frac{2}{3}$"],
      correct: "ក. $\\frac{1}{6}$",
      difficulty: "easy",
      explanation:
        "លទ្ធផលសរុបមាន $6$ ករណី $\\{1, 2, 3, 4, 5, 6\\}$។ ចំនួនដែលជាចំនួនបឋមផង និងជាចំនួនគូផង មានតែលេខ $2$ មួយគត់ (1 ករណីស្រប)។ នាំឱ្យ $P = \\frac{1}{6}$។",
    },

    // ── MEDIUM DIFFICULTY ──
    {
      q: {
        en: "Evaluate the limit: $\\lim_{x \\to 0} \\frac{\\sqrt{x+1} - 1}{x}$",
        km: "គណនាលីមីត៖ $\\lim_{x \\to 0} \\frac{\\sqrt{x+1} - 1}{x}$",
      },
      options: ["ក. $0$", "ខ. $\\frac{1}{2}$", "គ. $1$", "ឃ. $2$"],
      correct: "ខ. $\\frac{1}{2}$",
      difficulty: "medium",
      explanation:
        "គុណកន្សោមឆ្លាស់ $(\\sqrt{x+1}+1)$ ទាំងភាគយក និងភាគបែង៖ $\\frac{(\\sqrt{x+1}-1)(\\sqrt{x+1}+1)}{x(\\sqrt{x+1}+1)} = \\frac{(x+1)-1}{x(\\sqrt{x+1}+1)} = \\frac{x}{x(\\sqrt{x+1}+1)} = \\frac{1}{\\sqrt{x+1}+1}$។ ជំនួស $x = 0$ នាំឱ្យបាន $\\frac{1}{\\sqrt{0+1}+1} = \\frac{1}{2}$។",
    },
    {
      q: {
        en: "Evaluate the limit: $\\lim_{x \\to 0} \\frac{1 - \\cos(2x)}{x^2}$",
        km: "គណនាលីមីត៖ $\\lim_{x \\to 0} \\frac{1 - \\cos(2x)}{x^2}$",
      },
      options: ["ក. $0$", "ខ. $1$", "គ. $2$", "ឃ. $4$"],
      correct: "គ. $2$",
      difficulty: "medium",
      explanation:
        "តាមរូបមន្តត្រីកោណមាត្រ $1 - \\cos(2x) = 2\\sin^2(x)$។ ដូច្នេះ៖ $\\lim_{x \\to 0} \\frac{2\\sin^2(x)}{x^2} = 2 \\left(\\lim_{x \\to 0} \\frac{\\sin x}{x}\\right)^2 = 2(1)^2 = 2$។",
    },
    {
      q: {
        en: "Find the equation of the tangent line to the graph of $f(x) = x^2 - 3x + 2$ at the point with abscissa $x_0 = 2$:",
        km: "រកសមីការបន្ទាត់ប៉ះនឹងក្រាបតាងអនុគមន៍ $f(x) = x^2 - 3x + 2$ ត្រង់ចំណុចដែលមានអាប់ស៊ីស $x_0 = 2$៖",
      },
      options: [
        "ក. $y = x - 2$",
        "ខ. $y = x + 2$",
        "គ. $y = -x + 2$",
        "ឃ. $y = 2x - 4$",
      ],
      correct: "ក. $y = x - 2$",
      difficulty: "medium",
      explanation:
        "តម្លៃ $f(2) = 2^2 - 3(2) + 2 = 0$។ ដេរីវេ $f'(x) = 2x - 3 \\implies f'(2) = 2(2) - 3 = 1$ (មេគុណប្រាប់ទិស)។ សមីការបន្ទាត់ប៉ះ៖ $y = f'(2)(x - 2) + f(2) \\implies y = 1(x - 2) + 0 \\implies y = x - 2$។",
    },
    {
      q: {
        en: "Find the local minimum point of the function $f(x) = x^3 - 3x$:",
        km: "រកចំណុចអប្បបរមាធៀបនៃអនុគមន៍ $f(x) = x^3 - 3x$៖",
      },
      options: ["ក. $x = -1$", "ខ. $x = 0$", "គ. $x = 1$", "ឃ. $x = \\sqrt{3}$"],
      correct: "គ. $x = 1$",
      difficulty: "medium",
      explanation:
        "$f'(x) = 3x^2 - 3 = 3(x-1)(x+1)$។ $f'(x) = 0 \\iff x = 1$ ឬ $x = -1$។ តារាងសញ្ញាបង្ហាញថា $f'(x)$ ប្តូរសញ្ញាពីអវិជ្ជមាន $(-)$ មកវិជ្ជមាន $(+)$ ត្រង់ $x = 1$ ដូច្នេះអនុគមន៍មានអប្បបរមាធៀបត្រង់ $x = 1$ (តម្លៃអប្បបរមា $f(1) = -2$)។",
    },
    {
      q: {
        en: "Calculate the definite integral: $I = \\int_{0}^{1} 2x(x^2 + 1)^3 \\, dx$",
        km: "គណនាតម្លៃអាំងតេក្រាល៖ $I = \\int_{0}^{1} 2x(x^2 + 1)^3 \\, dx$",
      },
      options: ["ក. $\\frac{15}{4}$", "ខ. $\\frac{7}{4}$", "គ. $\\frac{8}{3}$", "ឃ. $4$"],
      correct: "ក. $\\frac{15}{4}$",
      difficulty: "medium",
      explanation:
        "តាង $u = x^2 + 1 \\implies du = 2x\\,dx$។ កាលណា $x = 0 \\implies u = 1$; កាលណា $x = 1 \\implies u = 2$។ អាំងតេក្រាលក្លាយជា៖ $\\int_{1}^{2} u^3 \\, du = \\left[\\frac{u^4}{4}\\right]_1^2 = \\frac{16 - 1}{4} = \\frac{15}{4}$។",
    },
    {
      q: {
        en: "Calculate the integral: $J = \\int_{1}^{e} x \\ln x \\, dx$",
        km: "គណនាអាំងតេក្រាល៖ $J = \\int_{1}^{e} x \\ln x \\, dx$",
      },
      options: [
        "ក. $\\frac{e^2 - 1}{4}$",
        "ខ. $\\frac{e^2}{2}$",
        "គ. $\\frac{2e^2 + 1}{4}$",
        "ឃ. $\\frac{e^2 + 1}{4}$",
      ],
      correct: "ឃ. $\\frac{e^2 + 1}{4}$",
      difficulty: "medium",
      explanation:
        "ប្រើរូបមន្តអាំងតេក្រាលដោយផ្នែក $\\int u \\, dv = uv - \\int v \\, du$៖ តាង $u = \\ln x \\implies du = \\frac{1}{x}dx$, $dv = x\\,dx \\implies v = \\frac{x^2}{2}$។ $J = \\left[\\frac{x^2}{2}\\ln x\\right]_1^e - \\int_1^e \\frac{x}{2}dx = \\left(\\frac{e^2}{2} - 0\\right) - \\left[\\frac{x^2}{4}\\right]_1^e = \\frac{e^2}{2} - \\left(\\frac{e^2 - 1}{4}\\right) = \\frac{e^2 + 1}{4}$។",
    },
    {
      q: {
        en: "Find the trigonometric form of the complex number $z = 1 - i\\sqrt{3}$:",
        km: "រកទម្រង់ត្រីកោណមាត្រនៃចំនួនកុំផ្លិច $z = 1 - i\\sqrt{3}$៖",
      },
      options: [
        "ក. $2\\left(\\cos \\frac{\\pi}{3} + i\\sin \\frac{\\pi}{3}\\right)$",
        "ខ. $2\\left(\\cos\\left(-\\frac{\\pi}{3}\\right) + i\\sin\\left(-\\frac{\\pi}{3}\\right)\\right)$",
        "គ. $\\sqrt{2}\\left(\\cos\\left(-\\frac{\\pi}{3}\\right) + i\\sin\\left(-\\frac{\\pi}{3}\\right)\\right)$",
        "ឃ. $2\\left(\\cos \\frac{2\\pi}{3} + i\\sin \\frac{2\\pi}{3}\\right)$",
      ],
      correct:
        "ខ. $2\\left(\\cos\\left(-\\frac{\\pi}{3}\\right) + i\\sin\\left(-\\frac{\\pi}{3}\\right)\\right)$",
      difficulty: "medium",
      explanation:
        "ម៉ូឌុល $r = \\sqrt{1^2 + (-\\sqrt{3})^2} = \\sqrt{4} = 2$។ អាគុយម៉ង់ $\\cos \\theta = \\frac{1}{2}$ និង $\\sin \\theta = -\\frac{\\sqrt{3}}{2} \\implies \\theta = -\\frac{\\pi}{3}$ (ឬ $\\frac{5\\pi}{3}$)។ ដូច្នេះ $z = 2\\left(\\cos\\left(-\\frac{\\pi}{3}\\right) + i\\sin\\left(-\\frac{\\pi}{3}\\right)\\right)$។",
    },
    {
      q: {
        en: "Find the solution set of the equation $z^2 - 2z + 5 = 0$ in the set of complex numbers $\\mathbb{C}$:",
        km: "រកសំណុំចម្លើយនៃសមីការ $z^2 - 2z + 5 = 0$ ក្នុងសំណុំចំនួនកុំផ្លិច $\\mathbb{C}$៖",
      },
      options: [
        "ក. $\\{1 + 4i, 1 - 4i\\}$",
        "ខ. $\\{-1 + 2i, -1 - 2i\\}$",
        "គ. $\\{1 + 2i, 1 - 2i\\}$",
        "ឃ. $\\{2 + i, 2 - i\\}$",
      ],
      correct: "គ. $\\{1 + 2i, 1 - 2i\\}$",
      difficulty: "medium",
      explanation:
        "ឌីសគ្រីមីណង់សម្រួល $\\Delta' = b'^2 - ac = (-1)^2 - 1(5) = 1 - 5 = -4 = (2i)^2$។ ឬសនៃសមីការគឺ $z = \\frac{-b' \\pm \\sqrt{\\Delta'}}{a} = \\frac{1 \\pm 2i}{1} = 1 \\pm 2i$។",
    },
    {
      q: {
        en: "A box contains 4 red marbles and 6 blue marbles (10 total). Two marbles are drawn simultaneously at random. Find the probability of drawing marbles of the same color:",
        km: "ក្នុងប្រអប់មួយមានឃ្លីក្រហម 4 និងឃ្លីខៀវ 6 (សរុប 10)។ គេចាប់យកឃ្លី 2 ព្រមគ្នាដោយចៃដន្យ។ រកប្រូបាបដែលទទួលបានឃ្លីពណ៌ដូចគ្នា៖",
      },
      options: ["ក. $\\frac{7}{15}$", "ខ. $\\frac{8}{15}$", "គ. $\\frac{1}{3}$", "ឃ. $\\frac{2}{5}$"],
      correct: "ក. $\\frac{7}{15}$",
      difficulty: "medium",
      explanation:
        "ចំនួនករណីអាច $n(S) = C(10, 2) = \\frac{10 \\times 9}{2} = 45$។ ករណីស្រប (ក្រហមទាំង 2 ឬ ខៀវទាំង 2)៖ $n(A) = C(4, 2) + C(6, 2) = \\frac{4 \\times 3}{2} + \\frac{6 \\times 5}{2} = 6 + 15 = 21$។ ប្រូបាប $P(A) = \\frac{21}{45} = \\frac{7}{15}$។",
    },
    {
      q: {
        en: "Find the solution to the differential equation $y' - 2y = 0$ satisfying the initial condition $y(0) = 3$:",
        km: "រកចម្លើយនៃសមីការឌីផេរ៉ង់ស្យែល $y' - 2y = 0$ ដែលផ្ទៀងផ្ទាត់លក្ខខណ្ឌដើម $y(0) = 3$៖",
      },
      options: [
        "ក. $y = 3e^{-2x}$",
        "ខ. $y = 2e^{3x}$",
        "គ. $y = e^{2x} + 2$",
        "ឃ. $y = 3e^{2x}$",
      ],
      correct: "ឃ. $y = 3e^{2x}$",
      difficulty: "medium",
      explanation:
        "សមីការមានទម្រង់ $y' = 2y$ នាំឱ្យចម្លើយទូទៅគឺ $y = Ce^{2x}$។ ដោយ $y(0) = 3 \\implies Ce^0 = 3 \\implies C = 3$ ដូច្នេះចម្លើយជាក់លាក់គឺ $y = 3e^{2x}$។",
    },
  ],
};
