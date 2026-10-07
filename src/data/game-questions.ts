import type { ExamQuestion } from "@/types";

/**
 * Questions for a Game match — one subject per match, keyed by SubjectId
 * ("math", "biology", …), the same keying GENERATED_EXAM_QUESTIONS uses.
 *
 * EMPTY TODAY, AND THAT IS THE NORMAL STATE — the same discipline the past
 * papers and practice quizzes shipped with before they moved into the database. features/game/game.ts
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

    // ── HARD DIFFICULTY ──
    {
      q: {
        en: "Evaluate the limit: $\\lim_{x \\to 0} (1 + 2x)^{\\frac{3}{x}}$",
        km: "គណនាលីមីត៖ $\\lim_{x \\to 0} (1 + 2x)^{\\frac{3}{x}}$",
      },
      options: ["ក. $e^2$", "ខ. $e^3$", "គ. $e^6$", "ឃ. $1$"],
      correct: "គ. $e^6$",
      difficulty: "hard",
      explanation:
        "លីមីតមានរាង $1^\\infty$។ យើងប្តូរជាទម្រង់អិចស្ប៉ូណង់ស្យែល៖ $\\lim_{x \\to 0} (1 + 2x)^{\\frac{3}{x}} = \\lim_{x \\to 0} e^{\\frac{3}{x} \\ln(1 + 2x)} = e^{\\lim_{x \\to 0} \\frac{3 \\ln(1 + 2x)}{x}}$។ ដោយសារ $\\lim_{x \\to 0} \\frac{\\ln(1+u)}{u} = 1$ (ដែល $u = 2x$) នាំឱ្យ $\\lim_{x \\to 0} \\frac{3 \\ln(1 + 2x)}{x} = \\lim_{x \\to 0} 3 \\cdot 2 \\cdot \\frac{\\ln(1 + 2x)}{2x} = 6 \\times 1 = 6$ ដូច្នេះលីមីតស្មើ $e^6$។",
    },
    {
      q: {
        en: "Find the oblique asymptote of the graph of $f(x) = \\sqrt{x^2 - 4x + 5}$ as $x \\to +\\infty$:",
        km: "រកសមីការអាស៊ីមតូតទ្រេតនៃក្រាបតាងអនុគមន៍ $f(x) = \\sqrt{x^2 - 4x + 5}$ កាលណា $x \\to +\\infty$៖",
      },
      options: [
        "ក. $y = x - 2$",
        "ខ. $y = x + 2$",
        "គ. $y = -x + 2$",
        "ឃ. $y = x - 4$",
      ],
      correct: "ក. $y = x - 2$",
      difficulty: "hard",
      explanation:
        "$a = \\lim_{x \\to +\\infty} \\frac{f(x)}{x} = \\lim_{x \\to +\\infty} \\frac{\\sqrt{x^2(1 - \\frac{4}{x} + \\frac{5}{x^2})}}{x} = 1$។ $b = \\lim_{x \\to +\\infty} [f(x) - x] = \\lim_{x \\to +\\infty} (\\sqrt{x^2 - 4x + 5} - x)$។ គុណកន្សោមឆ្លាស់៖ $\\lim_{x \\to +\\infty} \\frac{(x^2 - 4x + 5) - x^2}{\\sqrt{x^2 - 4x + 5} + x} = \\lim_{x \\to +\\infty} \\frac{-4x + 5}{x\\sqrt{1 - \\frac{4}{x} + \\frac{5}{x^2}} + x} = \\frac{-4}{1 + 1} = -2$ នាំឱ្យសមីការអាស៊ីមតូតទ្រេតគឺ $y = x - 2$។",
    },
    {
      q: {
        en: "Given the strictly increasing function $f(x) = x^3 + 3x - 2$ on $\\mathbb{R}$ with inverse $f^{-1}$, calculate the derivative $(f^{-1})'(2)$:",
        km: "គេមានអនុគមន៍ $f(x) = x^3 + 3x - 2$ ជាអនុគមន៍កើនដាច់ខាតលើ $\\mathbb{R}$ និងមានអនុគមន៍ច្រាស $f^{-1}$។ គណនាតម្លៃនៃដេរីវេ $(f^{-1})'(2)$៖",
      },
      options: ["ក. $\\frac{1}{3}$", "ខ. $\\frac{1}{6}$", "គ. $6$", "ឃ. $\\frac{1}{15}$"],
      correct: "ខ. $\\frac{1}{6}$",
      difficulty: "hard",
      explanation:
        "តាមរូបមន្តដេរីវេនៃអនុគមន៍ច្រាស៖ $(f^{-1})'(y_0) = \\frac{1}{f'(x_0)}$ ដែល $f(x_0) = y_0$។ រក $x_0$ ដែលនាំឱ្យ $f(x_0) = 2$៖ $x^3 + 3x - 2 = 2 \\implies x^3 + 3x - 4 = 0 \\implies x_0 = 1$។ រក $f'(x) = 3x^2 + 3 \\implies f'(1) = 3(1)^2 + 3 = 6$ នាំឱ្យ $(f^{-1})'(2) = \\frac{1}{f'(1)} = \\frac{1}{6}$។",
    },
    {
      q: {
        en: "Calculate the integral: $I = \\int_{0}^{\\pi} e^x \\cos x \\, dx$",
        km: "គណនាអាំងតេក្រាល៖ $I = \\int_{0}^{\\pi} e^x \\cos x \\, dx$",
      },
      options: [
        "ក. $-\\frac{e^\\pi + 1}{2}$",
        "ខ. $\\frac{e^\\pi + 1}{2}$",
        "គ. $-\\frac{e^\\pi - 1}{2}$",
        "ឃ. $0$",
      ],
      correct: "ក. $-\\frac{e^\\pi + 1}{2}$",
      difficulty: "hard",
      explanation:
        "អនុវត្តអាំងតេក្រាលដោយផ្នែក៖ តាង $u = e^x \\implies du = e^x dx$ និង $dv = \\cos x dx \\implies v = \\sin x$។ $I = [e^x \\sin x]_0^\\pi - \\int_0^\\pi e^x \\sin x dx = 0 - \\int_0^\\pi e^x \\sin x dx$។ ធ្វើអាំងតេក្រាលដោយផ្នែកម្តងទៀតលើ $\\int_0^\\pi e^x \\sin x dx$៖ តាង $u = e^x \\implies du = e^x dx$ និង $dv = \\sin x dx \\implies v = -\\cos x$ នាំឱ្យ $\\int_0^\\pi e^x \\sin x dx = [-e^x \\cos x]_0^\\pi - \\int_0^\\pi (-e^x \\cos x) dx = (e^\\pi + 1) + I$។ ជំនួសចូលសមីការដើម៖ $I = -[(e^\\pi + 1) + I] \\implies 2I = -(e^\\pi + 1) \\implies I = -\\frac{e^\\pi + 1}{2}$។",
    },
    {
      q: {
        en: "Calculate the area $S$ of the region bounded by the curves $y = x^2$ and $y = 2x$:",
        km: "គណនាផ្ទៃក្រឡា $S$ នៃដែនកំណត់ដោយក្រាបតាងអនុគមន៍ $y = x^2$ និងបន្ទាត់ $y = 2x$៖",
      },
      options: ["ក. $\\frac{2}{3}$", "ខ. $\\frac{4}{3}$", "គ. $2$", "ឃ. $\\frac{8}{3}$"],
      correct: "ខ. $\\frac{4}{3}$",
      difficulty: "hard",
      explanation:
        "រកចំណុចប្រសព្វ៖ $x^2 = 2x \\implies x(x - 2) = 0 \\implies x = 0$ ឬ $x = 2$។ លើចន្លោះ $[0, 2]$ បន្ទាត់ $y = 2x$ នៅលើប៉ារ៉ាបូល $y = x^2$ ដូច្នេះ $S = \\int_{0}^{2} (2x - x^2) \\, dx = \\left[x^2 - \\frac{x^3}{3}\\right]_0^2 = \\left(4 - \\frac{8}{3}\\right) - 0 = \\frac{4}{3}$ (ឯកតាផ្ទៃ)។",
    },
    {
      q: {
        en: "Calculate the value of the expression $Z = (1 + i\\sqrt{3})^{12}$:",
        km: "គណនាតម្លៃនៃកន្សោម $Z = (1 + i\\sqrt{3})^{12}$៖",
      },
      options: ["ក. $-4096$", "ខ. $4096i$", "គ. $-4096i$", "ឃ. $4096$"],
      correct: "ឃ. $4096$",
      difficulty: "hard",
      explanation:
        "សរសេរជាទម្រង់ត្រីកោណមាត្រ៖ $1 + i\\sqrt{3} = 2\\left(\\cos \\frac{\\pi}{3} + i\\sin \\frac{\\pi}{3}\\right)$។ អនុវត្តរូបមន្តដឺម័រ (De Moivre's Theorem)៖ $Z = 2^{12} \\left(\\cos \\left(12 \\cdot \\frac{\\pi}{3}\\right) + i\\sin \\left(12 \\cdot \\frac{\\pi}{3}\\right)\\right) = 4096(\\cos 4\\pi + i\\sin 4\\pi)$។ ដោយ $\\cos 4\\pi = 1$ និង $\\sin 4\\pi = 0$ នាំឱ្យ $Z = 4096(1 + 0) = 4096$។",
    },
    {
      q: {
        en: "In the complex plane, the locus of points $M$ representing complex number $z$ satisfying $|z - 3 + 4i| = 2$ is:",
        km: "ក្នុងប្លង់កុំផ្លិច សំណុំចំណុច $M$ តាងចំនួនកុំផ្លិច $z$ ដែលផ្ទៀងផ្ទាត់សមភាព $|z - 3 + 4i| = 2$ គឺជា៖",
      },
      options: [
        "ក. បន្ទាត់កាត់តាមចំណុច $(3, -4)$",
        "ខ. រង្វង់ផ្ចិត $I(-3, 4)$ និងកាំ $R = 2$",
        "គ. ប៉ារ៉ាបូលដែលមានកំពូលត្រង់ $(3, -4)$",
        "ឃ. រង្វង់ផ្ចិត $I(3, -4)$ និងកាំ $R = 2$",
      ],
      correct: "ឃ. រង្វង់ផ្ចិត $I(3, -4)$ និងកាំ $R = 2$",
      difficulty: "hard",
      explanation:
        "សរសេរឡើងវិញ៖ $|z - (3 - 4i)| = 2$។ តាង $A$ ជាចំណុចតាងចំនួនកុំផ្លិច $z_A = 3 - 4i$ (មានកូអរដោនេ $(3, -4)$)។ សមភាពក្លាយជាចម្ងាយ $AM = 2$ ដែលជាសមីការរង្វង់ផ្ចិត $A(3, -4)$ និងមានកាំ $R = 2$។",
    },
    {
      q: {
        en: "Find the general solution of the differential equation $y'' + 4y = 0$:",
        km: "រកចម្លើយទូទៅនៃសមីការឌីផេរ៉ង់ស្យែល $y'' + 4y = 0$៖",
      },
      options: [
        "ក. $y = C_1 e^{2x} + C_2 e^{-2x}$",
        "ខ. $y = (C_1 x + C_2)e^{2x}$",
        "គ. $y = C_1 \\cos(2x) + C_2 \\sin(2x)$",
        "ឃ. $y = C_1 \\cos(4x) + C_2 \\sin(4x)$",
      ],
      correct: "គ. $y = C_1 \\cos(2x) + C_2 \\sin(2x)$",
      difficulty: "hard",
      explanation:
        "សមីការសម្គាល់៖ $r^2 + 4 = 0 \\iff r^2 = -4 \\iff r = \\pm 2i$ (ឬសជាចំនួននិម្មិតសុទ្ធ $\\alpha = 0, \\beta = 2$)។ ចម្លើយទូទៅមានទម្រង់ $y = e^{\\alpha x}(C_1 \\cos \\beta x + C_2 \\sin \\beta x) = C_1 \\cos(2x) + C_2 \\sin(2x)$ (ដែល $C_1, C_2 \\in \\mathbb{R}$)។",
    },
    {
      q: {
        en: "A factory produces lightbulbs using two machines: Machine $A$ produces $60\\%$ and Machine $B$ produces $40\\%$. The defective rates are $2\\%$ for $A$ and $5\\%$ for $B$. A randomly selected bulb is defective. Find the probability that it was produced by Machine $A$:",
        km: "រោងចក្រមួយផលិតអំពូលភ្លើងដោយម៉ាស៊ីនពីរ៖ ម៉ាស៊ីន $A$ ផលិតបាន $60\\%$ និងម៉ាស៊ីន $B$ ផលិតបាន $40\\%$។ គេដឹងថាអត្រាខូចនៃម៉ាស៊ីន $A$ គឺ $2\\%$ ហើយអត្រាខូចនៃម៉ាស៊ីន $B$ គឺ $5\\%$។ គេជ្រើសរើសយកអំពូលមួយដោយចៃដន្យ ឃើញថាជាអំពូលខូច។ រកប្រូបាបដែលអំពូលខូចនោះត្រូវបានផលិតចេញពីម៉ាស៊ីន $A$៖",
      },
      options: ["ក. $\\frac{3}{8}$", "ខ. $\\frac{12}{31}$", "គ. $\\frac{3}{5}$", "ឃ. $\\frac{5}{12}$"],
      correct: "ក. $\\frac{3}{8}$",
      difficulty: "hard",
      explanation:
        "តាង $D$ ជាព្រឹត្តិការណ៍ \"អំពូលខូច\"៖ $P(D) = P(A) \\cdot P(D \\mid A) + P(B) \\cdot P(D \\mid B) = (0.60 \\times 0.02) + (0.40 \\times 0.05) = 0.012 + 0.020 = 0.032$។ តាមរូបមន្តបាយ៉េស (Bayes' Theorem)៖ $P(A \\mid D) = \\frac{P(A) \\cdot P(D \\mid A)}{P(D)} = \\frac{0.012}{0.032} = \\frac{12}{32} = \\frac{3}{8}$។",
    },
    {
      q: {
        en: "Five independent shots are fired at a target with hit probability $p = \\frac{2}{3}$ each. Find the probability of hitting the target at least 4 times:",
        km: "គេបាញ់គ្រាប់កាំភ្លើង 5 គ្រាប់ទៅលើផ្ទាំងស៊ីបមួយដោយឯករាជ្យពីគ្នា។ ប្រូបាបដែលបាញ់ត្រូវផ្ទាំងស៊ីបក្នុងមួយគ្រាប់ៗគឺ $p = \\frac{2}{3}$។ រកប្រូបាបដែលបាញ់ត្រូវផ្ទាំងស៊ីបបានយ៉ាងតិច 4 គ្រាប់៖",
      },
      options: [
        "ក. $\\frac{80}{243}$",
        "ខ. $\\frac{112}{243}$",
        "គ. $\\frac{32}{243}$",
        "ឃ. $\\frac{16}{27}$",
      ],
      correct: "ខ. $\\frac{112}{243}$",
      difficulty: "hard",
      explanation:
        "អថេរចៃដន្យ $X \\sim B\\left(5, \\frac{2}{3}\\right)$។ ព្រឹត្តិការណ៍ \"យ៉ាងតិច 4 គ្រាប់\" គឺ $P(X \\ge 4) = P(X = 4) + P(X = 5)$។ $P(X = 4) = C(5, 4) \\left(\\frac{2}{3}\\right)^4 \\left(\\frac{1}{3}\\right)^1 = 5 \\cdot \\frac{16}{81} \\cdot \\frac{1}{3} = \\frac{80}{243}$។ $P(X = 5) = C(5, 5) \\left(\\frac{2}{3}\\right)^5 \\left(\\frac{1}{3}\\right)^0 = 1 \\cdot \\frac{32}{243} \\cdot 1 = \\frac{32}{243}$។ ផលបូក៖ $P(X \\ge 4) = \\frac{80 + 32}{243} = \\frac{112}{243}$។",
    },
  ],

  // ── HISTORY ──
  history: [
    // ── BASIC DIFFICULTY ──
    {
      q: {
        en: "On what date did Cambodia achieve full independence from the French Republic?",
        km: "តើប្រទេសកម្ពុជាទទួលបានឯករាជ្យពេញលេញពីសាធារណរដ្ឋបារាំងនៅថ្ងៃ ខែ ឆ្នាំណា?",
      },
      options: [
        "ក. 09 វិច្ឆិកា 1953",
        "ខ. 17 មេសា 1975",
        "គ. 23 តុលា 1991",
        "ឃ. 07 មករា 1979",
      ],
      correct: "ក. 09 វិច្ឆិកា 1953",
      difficulty: "easy",
      explanation:
        "ក្រោមព្រះរាជបូជនីយកិច្ចទាមទារឯករាជ្យរបស់ព្រះបាទសម្តេចព្រះ នរោត្តម សីហនុ ប្រទេសកម្ពុជាបានទទួលឯករាជ្យបរិបូរណ៍ពីបារាំងនៅថ្ងៃទី 09 ខែវិច្ឆិកា ឆ្នាំ 1953។",
    },
    {
      q: {
        en: "In which year was the Geneva Conference on Indochina held?",
        km: "តើសន្និសីទអន្តរជាតិក្រុងហ្សឺណែវ (Geneva Conference) ស្តីពីឥណ្ឌូចិនត្រូវបានរៀបចំឡើងនៅឆ្នាំណា?",
      },
      options: ["ក. ឆ្នាំ 1945", "ខ. ឆ្នាំ 1954", "គ. ឆ្នាំ 1960", "ឃ. ឆ្នាំ 1970"],
      correct: "ខ. ឆ្នាំ 1954",
      difficulty: "easy",
      explanation:
        "សន្និសីទក្រុងហ្សឺណែវបានប្រព្រឹត្តទៅនៅឆ្នាំ 1954 ដើម្បីដោះស្រាយបញ្ហាបញ្ចប់សង្គ្រាម និងទទួលស្គាល់ឯករាជ្យ អធិបតេយ្យភាពនៃបណ្តាប្រទេសនៅឥណ្ឌូចិន (កម្ពុជា ឡាវ វៀតណាម)។",
    },
    {
      q: {
        en: "On what date did the coup d'état led by General Lon Nol overthrow Prince Norodom Sihanouk take place?",
        km: "រដ្ឋប្រហារទម្លាក់សម្តេចព្រះ នរោត្តម សីហនុ ដឹកនាំដោយលោកសេនាប្រមុខ លន់ នល់ បានកើតឡើងនៅថ្ងៃ ខែ ឆ្នាំណា?",
      },
      options: [
        "ក. 17 មេសា 1975",
        "ខ. 09 វិច្ឆិកា 1970",
        "គ. 18 មីនា 1970",
        "ឃ. 02 ធ្នូ 1978",
      ],
      correct: "គ. 18 មីនា 1970",
      difficulty: "easy",
      explanation:
        "នៅថ្ងៃទី 18 ខែមីនា ឆ្នាំ 1970 លន់ នល់ និងទ្រង់ ស៊ីសុវត្ថិ សិរីមតៈ បានដឹកនាំរដ្ឋប្រហារទម្លាក់សម្តេចព្រះ នរោត្តម សីហនុ ពីតំណែងព្រះប្រមុខរដ្ឋ រួចបង្កើតជារបប «សាធារណរដ្ឋខ្មែរ»។",
    },
    {
      q: {
        en: "During which years was the regime of 'Democratic Kampuchea' (Khmer Rouge) in power in Cambodia?",
        km: "តើរបប «កម្ពុជាប្រជាធិបតេយ្យ» (ខ្មែរក្រហម) បានកាន់កាប់អំណាចនៅប្រទេសកម្ពុជាក្នុងចន្លោះឆ្នាំណា?",
      },
      options: [
        "ក. 1970 – 1975",
        "ខ. 1979 – 1993",
        "គ. 1960 – 1970",
        "ឃ. 1975 – 1979",
      ],
      correct: "ឃ. 1975 – 1979",
      difficulty: "easy",
      explanation:
        "របបកម្ពុជាប្រជាធិបតេយ្យបានឡើងកាន់អំណាចបន្ទាប់ពីវាយលុកចូលរាជធានីភ្នំពេញនៅថ្ងៃទី 17 មេសា 1975 ហើយត្រូវបានដួលរលំនៅថ្ងៃទី 07 មករា 1979 (រយៈពេល 3 ឆ្នាំ 8 ខែ និង 20 ថ្ងៃ)។",
    },
    {
      q: {
        en: "On what date was the Paris Peace Agreements on a Comprehensive Political Settlement of the Cambodia Conflict signed?",
        km: "កិច្ចព្រមព្រៀងសន្តិភាពទីក្រុងប៉ារីស ស្តីពីដំណោះស្រាយនយោបាយរួមមួយនៃជម្លោះកម្ពុជា ត្រូវបានចុះហត្ថលេខានៅថ្ងៃ ខែ ឆ្នាំណា?",
      },
      options: [
        "ក. 07 មករា 1979",
        "ខ. 24 កញ្ញា 1993",
        "គ. 23 តុលា 1991",
        "ឃ. 29 ធ្នូ 1998",
      ],
      correct: "គ. 23 តុលា 1991",
      difficulty: "easy",
      explanation:
        "កិច្ចព្រមព្រៀងសន្តិភាពទីក្រុងប៉ារីសត្រូវបានចុះហត្ថលេខានៅថ្ងៃទី 23 ខែតុលា ឆ្នាំ 1991 ដោយភាគីជម្លោះខ្មែរទាំងបួន និងប្រទេសហត្ថលេខីអន្តរជាតិចំនួន 18។",
    },
    {
      q: {
        en: "Between which years did World War 1 begin and end?",
        km: "តើសង្គ្រាមលោកលើកទី 1 បានចាប់ផ្តើម និងបញ្ចប់នៅក្នុងចន្លោះឆ្នាំណា?",
      },
      options: [
        "ក. 1914 – 1918",
        "ខ. 1939 – 1945",
        "គ. 1917 – 1922",
        "ឃ. 1905 – 1911",
      ],
      correct: "ក. 1914 – 1918",
      difficulty: "easy",
      explanation:
        "សង្គ្រាមលោកលើកទី 1 បានផ្ទុះឡើងនៅខែកក្កដា ឆ្នាំ 1914 ក្រោយការធ្វើឃាតព្រះអង្គម្ចាស់ ហ្វ្រង់ស៊ីស ហ្វែរឌីណង់ និងបានបញ្ចប់ទៅវិញនៅខែវិច្ឆិកា ឆ្នាំ 1918 តាមរយៈបទឈប់បាញ់។",
    },
    {
      q: {
        en: "What event marked the beginning of World War 2 in Europe?",
        km: "តើព្រឹត្តិការណ៍អ្វីជាចំណុចផ្តើមនៃការផ្ទុះសង្គ្រាមលោកលើកទី 2 នៅទ្វីបអឺរ៉ុប?",
      },
      options: [
        "ក. ជប៉ុនវាយប្រហារកំពង់ផែភើលហាប៊័រ (Pearl Harbor)",
        "ខ. បដិវត្តន៍ខែតុលានៅប្រទេសរុស្ស៊ី",
        "គ. ការទម្លាក់គ្រាប់បែកបរមាណូលើទីក្រុងហ៊ីរ៉ូស៊ីម៉ា",
        "ឃ. អាល្លឺម៉ង់ចូលលុកលុយប្រទេសប៉ូឡូញ នៅថ្ងៃទី 01 កញ្ញា 1939",
      ],
      correct: "ឃ. អាល្លឺម៉ង់ចូលលុកលុយប្រទេសប៉ូឡូញ នៅថ្ងៃទី 01 កញ្ញា 1939",
      difficulty: "easy",
      explanation:
        "កងទ័ពណាស៊ីអាល្លឺម៉ង់ក្រោមការដឹកនាំរបស់ហ៊ីត្លែរបានចូលឈ្លានពានប្រទេសប៉ូឡូញនៅថ្ងៃទី 01 ខែកញ្ញា ឆ្នាំ 1939 ដែលនាំឱ្យអង់គ្លេស និងបារាំងប្រកាសសង្គ្រាមលើអាល្លឺម៉ង់។",
    },
    {
      q: {
        en: "In which year was the United Nations (UN) officially established following the end of World War 2?",
        km: "អង្គការសហប្រជាជាតិ (UN) ត្រូវបានបង្កើតឡើងជាផ្លូវការនៅឆ្នាំណា ក្រោយសង្គ្រាមលោកលើកទី 2 បញ្ចប់?",
      },
      options: ["ក. ឆ្នាំ 1919", "ខ. ឆ្នាំ 1945", "គ. ឆ្នាំ 1950", "ឃ. ឆ្នាំ 1960"],
      correct: "ខ. ឆ្នាំ 1945",
      difficulty: "easy",
      explanation:
        "អង្គការសហប្រជាជាតិត្រូវបានបង្កើតឡើងនៅថ្ងៃទី 24 ខែតុលា ឆ្នាំ 1945 ដោយមានធម្មនុញ្ញអង្គការសហប្រជាជាតិ ក្នុងគោលបំណងថែរក្សាសន្តិភាព និងសន្តិសុខពិភពលោក។",
    },
    {
      q: {
        en: "Which superpowers were primarily involved in the confrontation known as the 'Cold War'?",
        km: "តើពាក្យថា «សង្គ្រាមត្រជាក់» (Cold War) សំដៅលើការប្រឈមមុខដាក់គ្នារវាងមហាអំណាចណាខ្លះ?",
      },
      options: [
        "ក. សហរដ្ឋអាមេរិក និង សហភាពសូវៀត",
        "ខ. អង់គ្លេស និង បារាំង",
        "គ. ចិន និង ជប៉ុន",
        "ឃ. អាល្លឺម៉ង់ និង រុស្ស៊ី",
      ],
      correct: "ក. សហរដ្ឋអាមេរិក និង សហភាពសូវៀត",
      difficulty: "easy",
      explanation:
        "សង្គ្រាមត្រជាក់ (ប្រមាណឆ្នាំ 1947-1991) គឺជាការប្រកួតប្រជែងខាងមនោគមវិជ្ជា យោធា នយោបាយ និងសេដ្ឋកិច្ចរវាងប្លុកសេរី (ដឹកនាំដោយសហរដ្ឋអាមេរិក) និងប្លុកកុម្មុយនីស្ត (ដឹកនាំដោយសហភាពសូវៀត)។",
    },
    {
      q: {
        en: "In what year did the Berlin Wall, the symbol of Cold War division, fall?",
        km: "តើជញ្ជាំងប៊ែរឡាំង (Berlin Wall) ដែលជានិមិត្តរូបនៃការបែកបាក់គ្នានៅសម័យសង្គ្រាមត្រជាក់ ត្រូវបានដួលរលំនៅឆ្នាំណា?",
      },
      options: ["ក. ឆ្នាំ 1975", "ខ. ឆ្នាំ 1985", "គ. ឆ្នាំ 1989", "ឃ. ឆ្នាំ 1991"],
      correct: "គ. ឆ្នាំ 1989",
      difficulty: "easy",
      explanation:
        "ជញ្ជាំងប៊ែរឡាំងត្រូវបានវាយកម្ទេច និងបើកឱ្យឆ្លងកាត់ឡើងវិញនៅថ្ងៃទី 09 ខែវិច្ឆិកា ឆ្នាំ 1989 ដែលជាសញ្ញានៃការបង្រួបបង្រួមប្រទេសអាល្លឺម៉ង់ និងការឈានទៅរកការបញ្ចប់សង្គ្រាមត្រជាក់។",
    },

    // ── MEDIUM DIFFICULTY ──
    {
      q: {
        en: "What was Cambodia's core foreign policy during the Sangkum Reastr Niyum era (led by Prince Norodom Sihanouk)?",
        km: "តើគោលនយោបាយការបរទេសស្នូលរបស់កម្ពុជាក្នុងសម័យសង្គមរាស្ត្រនិយម (ដឹកនាំដោយសម្តេចព្រះ នរោត្តម សីហនុ) គឺជាអ្វី?",
      },
      options: [
        "ក. ចូលរួមជាមួយប្លុកកុម្មុយនីស្តសូវៀតយ៉ាងពេញទំហឹង",
        "ខ. ចុះហត្ថលេខាលើកតិកាសញ្ញាយោធាជាមួយសហរដ្ឋអាមេរិក",
        "គ. អព្យាក្រឹត អារិយភាព និងមិនចូលបក្សសម្ព័ន្ធ",
        "ឃ. បិទទ្វារសេដ្ឋកិច្ច និងមិនទាក់ទងជាមួយប្រទេសជិតខាង",
      ],
      correct: "គ. អព្យាក្រឹត អារិយភាព និងមិនចូលបក្សសម្ព័ន្ធ",
      difficulty: "medium",
      explanation:
        "ក្នុងសម័យសង្គមរាស្ត្រនិយម កម្ពុជាបានប្រកាន់យកនយោបាយការបរទេស «អព្យាក្រឹត អារិយភាព និងមិនចូលបក្សសម្ព័ន្ធ» ដោយអនុវត្តតាមស្មារតីនៃសន្និសីទបានឌុង (Bandung Conference) ឆ្នាំ 1955 ដើម្បីរក្សាសន្តិភាព និងបូរណភាពទឹកដី។",
    },
    {
      q: {
        en: "What were the primary socio-economic factors that precipitated the 18 March 1970 coup against Prince Norodom Sihanouk?",
        km: "តើកត្តាសេដ្ឋកិច្ច និងសង្គមចម្បងអ្វីខ្លះ ដែលបានជំរុញឱ្យកើតមានរដ្ឋប្រហារថ្ងៃទី 18 មីនា 1970 ទម្លាក់សម្តេចព្រះ នរោត្តម សីហនុ?",
      },
      options: [
        "ក. វិបត្តិឱនភាពថវិកា ការធ្វើជាតូបនីយកម្មសេដ្ឋកិច្ច និងវត្តមានទ័ពវៀតកុងលើទឹកដីកម្ពុជា",
        "ខ. គ្រោះរាំងស្ងួតយូរអង្វែង និងការឈ្លានពានផ្ទាល់ពីប្រទេសថៃ",
        "គ. ការទាមទាររបស់សិស្ស-និស្សិតឱ្យបារាំងចូលមកគ្រប់គ្រងប្រទេសឡើងវិញ",
        "ឃ. ជម្លោះសាសនារវាងពុទ្ធសាសនិក និងគ្រិស្តសាសនិក",
      ],
      correct:
        "ក. វិបត្តិឱនភាពថវិកា ការធ្វើជាតូបនីយកម្មសេដ្ឋកិច្ច និងវត្តមានទ័ពវៀតកុងលើទឹកដីកម្ពុជា",
      difficulty: "medium",
      explanation:
        "គោលនយោបាយធ្វើជាតូបនីយកម្មធនាគារ និងពាណិជ្ជកម្មក្រៅប្រទេសនៅឆ្នាំ 1963 បានធ្វើឱ្យសេដ្ឋកិច្ចធ្លាក់ចុះ អំពើពុករលួយកើនឡើង រួមផ្សំនឹងវត្តមានមូលដ្ឋានទ័ពវៀតកុងនៅតាមព្រំដែន ដែលជាលេសធ្វើឱ្យរដ្ឋសភានាសម័យនោះបោះឆ្នោតទម្លាក់ព្រះអង្គ។",
    },
    {
      q: {
        en: "In the Democratic Kampuchea (Khmer Rouge) regime, who did the term 'Base People' or 'Old People' refer to?",
        km: "នៅក្នុងរបបកម្ពុជាប្រជាធិបតេយ្យ (ខ្មែរក្រហម) តើពាក្យថា «ប្រជាជនចាស់ ឬ ប្រជាជនមូលដ្ឋាន» សំដៅលើក្រុមមនុស្សណា?",
      },
      options: [
        "ក. មន្ត្រីរាជការ និងទាហាននៃរបបសាធារណរដ្ឋខ្មែរ",
        "ខ. អ្នករស់នៅទីក្រុងភ្នំពេញដែលត្រូវបានជម្លៀសចេញ",
        "គ. បញ្ញវន្ត និងអ្នកចេះដឹងភាសាបរទេស",
        "ឃ. អ្នករស់នៅតាមជនបទក្នុងតំបន់រំដោះមុនថ្ងៃទី 17 មេសា 1975",
      ],
      correct: "ឃ. អ្នករស់នៅតាមជនបទក្នុងតំបន់រំដោះមុនថ្ងៃទី 17 មេសា 1975",
      difficulty: "medium",
      explanation:
        "ខ្មែរក្រហមបានបែងចែកប្រជាជនជាពីរក្រុមធំៗ៖ «ប្រជាជនចាស់ ឬមូលដ្ឋាន» គឺជាអ្នកដែលរស់នៅក្នុងតំបន់រំដោះក្រោមការគ្រប់គ្រងរបស់ពួកគេមុនថ្ងៃ 17 មេសា 1975 រីឯ «ប្រជាជនថ្មី ឬ 17 មេសា» គឺជាអ្នកដែលត្រូវជម្លៀសចេញពីទីក្រុង។",
    },
    {
      q: {
        en: "What was the primary focus of the Khmer Rouge regime's 'Four-Year Plan' (1977–1980)?",
        km: "តើទិសដៅស្នូលនៃ «ផែនការ 4 ឆ្នាំ» (1977-1980) របស់ពួកខ្មែរក្រហម ផ្តោតលើវិស័យណាខ្លះ?",
      },
      options: [
        "ក. អភិវឌ្ឍន៍បច្ចេកវិទ្យា និងឧស្សាហកម្មធុនធ្ងន់ទំនើប",
        "ខ. ធ្វើកសិកម្មដាំស្រូវឱ្យបានទិន្នផល 3 ទៅ 7 តោនក្នុងមួយហិកតា ដើម្បីនាំចេញយកប្រាក់មកកសាងឧស្សាហកម្ម",
        "គ. បើកទូលាយពាណិជ្ជកម្មសេរីជាមួយប្រទេសលោកខាងលិច",
        "ឃ. លើកកម្ពស់វិស័យអប់រំ និងពាណិជ្ជកម្មតាមប្រព័ន្ធអេឡិចត្រូនិក",
      ],
      correct:
        "ខ. ធ្វើកសិកម្មដាំស្រូវឱ្យបានទិន្នផល 3 ទៅ 7 តោនក្នុងមួយហិកតា ដើម្បីនាំចេញយកប្រាក់មកកសាងឧស្សាហកម្ម",
      difficulty: "medium",
      explanation:
        "ផែនការ 4 ឆ្នាំរបស់ខ្មែរក្រហមពឹងផ្អែកលើវិស័យកសិកម្មទាំងស្រុង ដោយដាក់ទិសដៅបង្ខំឱ្យប្រជាជនធ្វើការហួសកម្លាំងដើម្បីផលិតស្រូវឱ្យបាន 3 តោន/ហិកតា (ស្រូវធម្មតា) និងរហូតដល់ 7 តោន/ហិកតា (ស្រូវប្រាំង) ដើម្បីនាំចេញដោះដូរយកគ្រឿងចក្រ។",
    },
    {
      q: {
        en: "What was the primary mechanism of the 23 October 1991 Paris Peace Agreements for ending the Cambodian conflict?",
        km: "តើគោលការណ៍ចម្បងនៃកិច្ចព្រមព្រៀងសន្តិភាពទីក្រុងប៉ារីស 23 តុលា 1991 មានគោលដៅបញ្ចប់ជម្លោះខ្មែរតាមរយៈមធ្យោបាយណា?",
      },
      options: [
        "ក. ការបង្រួបបង្រួមជាតិ ការដកកងទ័ពបរទេស និងការរៀបចំការបោះឆ្នោតតាមបែបប្រជាធិបតេយ្យសេរីពហុបក្ស",
        "ខ. ការសម្រេចឱ្យភាគីខ្មែរក្រហមធ្វើជាអ្នកដឹកនាំរដ្ឋាភិបាលតែមួយគត់",
        "គ. ការបែងចែកទឹកដីកម្ពុជាជា 4 តំបន់គ្រប់គ្រងដោយស្វយ័ត",
        "ឃ. ការដាក់កម្ពុជាក្រោមអាណានិគមបារាំងជាថ្មីម្តងទៀត",
      ],
      correct:
        "ក. ការបង្រួបបង្រួមជាតិ ការដកកងទ័ពបរទេស និងការរៀបចំការបោះឆ្នោតតាមបែបប្រជាធិបតេយ្យសេរីពហុបក្ស",
      difficulty: "medium",
      explanation:
        "កិច្ចព្រមព្រៀងទីក្រុងប៉ារីសមានទិសដៅស្វែងរកដំណោះស្រាយនយោបាយរួម បញ្ឈប់សង្គ្រាមស៊ីវិល ដកកងទ័ពបរទេសចេញពីកម្ពុជា រំសាយអាវុធភាគីជម្លោះ និងរៀបចំការបោះឆ្នោតជាតិដោយសេរី និងយុត្តិធម៌ក្រោមការត្រួតពិនិត្យរបស់ UNTAC។",
    },
    {
      q: {
        en: "How did the harsh terms of the 1919 Treaty of Versailles negatively affect Germany?",
        km: "តើលក្ខខណ្ឌដ៏តឹងរ៉ឹងនៃសន្ធិសញ្ញាវែរសៃ (Treaty of Versailles) ឆ្នាំ 1919 បានជះឥទ្ធិពលអវិជ្ជមានយ៉ាងដូចម្តេចដល់ប្រទេសអាល្លឺម៉ង់?",
      },
      options: [
        "ក. ធ្វើឱ្យអាល្លឺម៉ង់ក្លាយជាមហាអំណាចសេដ្ឋកិច្ចធំជាងគេនៅអឺរ៉ុប",
        "ខ. បង្រួបបង្រួមអាល្លឺម៉ង់ និងអូទ្រីសឱ្យក្លាយជារដ្ឋតែមួយដោយសន្តិវិធី",
        "គ. បំបាត់ចោលទាំងស្រុងនូវគំនិតជាតិនិយមជ្រុលក្នុងសង្គមអាល្លឺម៉ង់",
        "ឃ. ធ្វើឱ្យអាល្លឺម៉ង់បាត់បង់ទឹកដី រងបន្ទុកសំណងសង្គ្រាមយ៉ាងធ្ងន់ធ្ងរ និងបង្កើតឱ្យមានគំនិតសងសឹក",
      ],
      correct:
        "ឃ. ធ្វើឱ្យអាល្លឺម៉ង់បាត់បង់ទឹកដី រងបន្ទុកសំណងសង្គ្រាមយ៉ាងធ្ងន់ធ្ងរ និងបង្កើតឱ្យមានគំនិតសងសឹក",
      difficulty: "medium",
      explanation:
        "សន្ធិសញ្ញាវែរសៃបានបង្ខំឱ្យអាល្លឺម៉ង់ទទួលកំហុសក្នុងសង្គ្រាម សងសំណងជំងឺចិត្តដ៏ច្រើនលើសលប់ កាត់បន្ថយកងទ័ព និងបាត់បង់ដែនដី ដែលជាហេតុធ្វើឱ្យសេដ្ឋកិច្ចដួលរលំ និងជាដើមចមជំរុញឱ្យហ៊ីត្លែរប្រើមនោសញ្ចេតនាសងសឹកនេះឡើងកាន់អំណាច។",
    },
    {
      q: {
        en: "What was the consequence of the Appeasement Policy pursued by Britain and France in the late 1930s?",
        km: "តើ «នយោបាយសម្រុះសម្រួល» (Appeasement Policy) របស់ចក្រភពអង់គ្លេស និងបារាំងនៅចុងទសវត្សរ៍ 1930 មានផលវិបាកយ៉ាងដូចម្តេច?",
      },
      options: [
        "ក. ជួយបញ្ឈប់ការឈ្លានពានរបស់អ៊ីតាលីនៅអាហ្វ្រិក",
        "ខ. ធ្វើឱ្យអាល្លឺម៉ង់ស្ម័គ្រចិត្តរំសាយកងទ័ពរបស់ខ្លួន",
        "គ. បង្កើនទំនុកចិត្តឱ្យហ៊ីត្លែរហ៊ានបន្តឈ្លានពានប្រទេសជិតខាង (ដូចជាឆេកូស្លូវ៉ាគី និងប៉ូឡូញ)",
        "ឃ. បង្កើតបានជាសន្តិភាពយូរអង្វែងនៅទ្វីបអឺរ៉ុប",
      ],
      correct:
        "គ. បង្កើនទំនុកចិត្តឱ្យហ៊ីត្លែរហ៊ានបន្តឈ្លានពានប្រទេសជិតខាង (ដូចជាឆេកូស្លូវ៉ាគី និងប៉ូឡូញ)",
      difficulty: "medium",
      explanation:
        "នយោបាយសម្រុះសម្រួល (ដូចជាការចុះកិច្ចព្រមព្រៀងមុយនិចឆ្នាំ 1938) ធ្វើឡើងដើម្បីជៀសវាងសង្គ្រាម ប៉ុន្តែផ្ទុយទៅវិញវាបានបង្ហាញពីភាពទន់ខ្សោយរបស់សម្ព័ន្ធមិត្ត និងធ្វើឱ្យហ៊ីត្លែរយល់ថាលោកខាងលិចមិនហ៊ានតបត ទើបហ៊ានវាយលុកយកប៉ូឡូញនៅឆ្នាំ 1939។",
    },
    {
      q: {
        en: "What was the premise of the United States' 'Domino Theory' during the Cold War?",
        km: "តើ «ទ្រឹស្តីដូមីណូ» (Domino Theory) របស់សហរដ្ឋអាមេរិកក្នុងសម័យសង្គ្រាមត្រជាក់ មានអត្ថន័យដូចម្តេច?",
      },
      options: [
        "ក. បើប្រទេសមហាអំណាចសេដ្ឋកិច្ចមួយដួលរលំ ពិភពលោកទាំងមូលនឹងធ្លាក់ក្នុងវិបត្តិសេដ្ឋកិច្ច",
        "ខ. បើប្រទេសមួយនៅអាស៊ីអាគ្នេយ៍ធ្លាក់ក្រោមឥទ្ធិពលកុម្មុយនីស្ត ប្រទេសជិតខាងផ្សេងទៀតនឹងធ្លាក់ជាបន្តបន្ទាប់ដូចគ្រាប់ដូមីណូ",
        "គ. ការប្រកួតប្រជែងសព្វាវុធនុយក្លេអ៊ែរនឹងបំផ្លាញប្រទេសជាសមាជិកអង្គការណាតូទាំងអស់",
        "ឃ. លទ្ធិប្រជាធិបតេយ្យនឹងសាយភាយដោយស្វ័យប្រវត្តិកាត់តាមព្រំដែន",
      ],
      correct:
        "ខ. បើប្រទេសមួយនៅអាស៊ីអាគ្នេយ៍ធ្លាក់ក្រោមឥទ្ធិពលកុម្មុយនីស្ត ប្រទេសជិតខាងផ្សេងទៀតនឹងធ្លាក់ជាបន្តបន្ទាប់ដូចគ្រាប់ដូមីណូ",
      difficulty: "medium",
      explanation:
        "ទ្រឹស្តីដូមីណូត្រូវបានប្រធានាធិបតី Dwight D. Eisenhower លើកឡើង ដែលជាមូលដ្ឋានគ្រឹះជំរុញឱ្យអាមេរិកលូកដៃធ្វើអន្តរាគមន៍យោធាយ៉ាងជ្រៅក្នុងសង្គ្រាមឥណ្ឌូចិន និងសង្គ្រាមវៀតណាម ដើម្បីទប់ស្កាត់កុំឱ្យកុម្មុយនីស្តលេបត្របាក់ប្រទេសផ្សេងៗក្នុងតំបន់។",
    },
    {
      q: {
        en: "How was the Cuban Missile Crisis of 1962 resolved?",
        km: "តើ «វិបត្តិមីស៊ីលនៅគុយបា» (Cuban Missile Crisis) ឆ្នាំ 1962 បានបញ្ចប់ទៅវិញដោយរបៀបណា?",
      },
      options: [
        "ក. សហភាពសូវៀតយល់ព្រមដកមីស៊ីលចេញពីគុយបា ជាថ្នូរនឹងការដែលអាមេរិកសន្យាមិនឈ្លានពានគុយបា និងដកមីស៊ីលរបស់ខ្លួនចេញពីតួកគី",
        "ខ. សហរដ្ឋអាមេរិកបានបើកការវាយប្រហារទម្លាក់គ្រាប់បែកបរមាណូលើកោះគុយបា",
        "គ. អង្គការសហប្រជាជាតិបានបញ្ជូនកងទ័ពមួកខៀវទៅកាន់កាប់កោះគុយបា",
        "ឃ. សហភាពសូវៀតបានដណ្តើមគ្រប់គ្រងមូលដ្ឋានទ័ពហ្កួនតាណាម៉ូ",
      ],
      correct:
        "ក. សហភាពសូវៀតយល់ព្រមដកមីស៊ីលចេញពីគុយបា ជាថ្នូរនឹងការដែលអាមេរិកសន្យាមិនឈ្លានពានគុយបា និងដកមីស៊ីលរបស់ខ្លួនចេញពីតួកគី",
      difficulty: "medium",
      explanation:
        "វិបត្តិមីស៊ីលគុយបាគឺជាចំណុចគ្រោះថ្នាក់បំផុតនៃសង្គ្រាមនុយក្លេអ៊ែរ ប៉ុន្តែត្រូវបានដោះស្រាយដោយការទូតសម្ងាត់រវាង John F. Kennedy និង Nikita Khrushchev ដោយសូវៀតដកមីស៊ីលចេញពីគុយបា ហើយអាមេរិកសន្យាមិនលុកលុយគុយបា ព្រមទាំងដកមីស៊ីល Jupiter ចេញពីប្រទេសតួកគី។",
    },
    {
      q: {
        en: "What was the purpose of Mikhail Gorbachev's policies of 'Glasnost' and 'Perestroika'?",
        km: "តើគោលនយោបាយ «ហ្គ្លាសណូស» (Glasnost) និង «ប៉េរ៉េស្ត្រយកា» (Perestroika) របស់លោក មីខាអ៊ីល ហ្គ័របាឆូវ មានគោលបំណងអ្វី?",
      },
      options: [
        "ក. ពង្រឹងការគ្រប់គ្រងបែបផ្តាច់ការ និងបិទព្រំដែនសូវៀតមិនឱ្យមានទំនាក់ទំនងជាមួយលោកខាងលិច",
        "ខ. បង្កើនការផលិតអាវុធនុយក្លេអ៊ែរដើម្បីវាយប្រហារប្លុកណាតូ",
        "គ. បើកចំហសេរីភាពបញ្ចេញមតិ (Glasnost) និងការកែទម្រង់រៀបចំរចនាសម្ព័ន្ធសេដ្ឋកិច្ច-នយោបាយឡើងវិញ (Perestroika)",
        "ឃ. រំលាយចោលនូវស្ថាប័នរដ្ឋ និងលុបបំបាត់ការបោះឆ្នោត",
      ],
      correct:
        "គ. បើកចំហសេរីភាពបញ្ចេញមតិ (Glasnost) និងការកែទម្រង់រៀបចំរចនាសម្ព័ន្ធសេដ្ឋកិច្ច-នយោបាយឡើងវិញ (Perestroika)",
      difficulty: "medium",
      explanation:
        "ហ្គ័របាឆូវ បានដាក់ចេញនយោបាយ Glasnost (ការបើកចំហ ផ្តល់សេរីភាពសារព័ត៌មាន និងតម្លាភាព) និង Perestroika (ការកែទម្រង់រចនាសម្ព័ន្ធសេដ្ឋកិច្ច និងនយោបាយឱ្យមានភាពបត់បែន) ដើម្បីស្រោចស្រង់សេដ្ឋកិច្ចសូវៀត ប៉ុន្តែចុងក្រោយគោលនយោបាយទាំងនេះបាននាំឱ្យប្លុកកុម្មុយនីស្តដួលរលំនៅឆ្នាំ 1991។",
    },

    // ── HARD DIFFICULTY ──
    {
      q: {
        en: "What royal powers were stripped from the Cambodian monarch by the Convention of 17 June 1884 forced upon King Norodom?",
        km: "តើអនុសញ្ញាថ្ងៃទី 17 ខែមិថុនា ឆ្នាំ 1884 ដែលបារាំងបង្ខំឱ្យព្រះបាទនរោត្តមចុះព្រះហស្តលេខា បានដកហូតព្រះរាជអំណាចអ្វីខ្លះពីព្រះមហាក្សត្រខ្មែរ?",
      },
      options: [
        "ក. ដកហូតតែសិទ្ធិគ្រប់គ្រងកងទ័ព ប៉ុន្តែទុកការគ្រប់គ្រងដីធ្លី និងពន្ធដារថ្វាយព្រះអង្គ",
        "ខ. បង្ខំឱ្យកម្ពុជាលុបបំបាត់របបរាជានិយម ហើយប្រកាសបង្កើតរបបសាធារណរដ្ឋ",
        "គ. ផ្ទេរអំណាចរដ្ឋបាល តុលាការ ហិរញ្ញវត្ថុ ពន្ធដារ និងដីធ្លីស្ទើរតែទាំងស្រុងទៅឱ្យទេសាភិបាលបារាំង",
        "ឃ. បង្ខំឱ្យកម្ពុជាបញ្ចូលទឹកដីជាមួយកូសាំងស៊ីនក្រោមច្បាប់តែមួយ",
      ],
      correct:
        "គ. ផ្ទេរអំណាចរដ្ឋបាល តុលាការ ហិរញ្ញវត្ថុ ពន្ធដារ និងដីធ្លីស្ទើរតែទាំងស្រុងទៅឱ្យទេសាភិបាលបារាំង",
      difficulty: "hard",
      explanation:
        "មិនដូចសន្ធិសញ្ញាការពារឆ្នាំ 1863 ដែលបារាំងគ្រប់គ្រងតែការបរទេសនោះទេ អនុសញ្ញាឆ្នាំ 1884 គឺជាការកាត់បន្ថយព្រះរាជអំណាចយ៉ាងធ្ងន់ធ្ងរ ដោយបារាំងក្តាប់កិច្ចការផ្ទៃក្នុងទាំងអស់ (រដ្ឋបាល ពន្ធដារ តុលាការ និងកម្មសិទ្ធិដីធ្លី) ដែលជាដើមចមបង្កឱ្យផ្ទុះចលនាបះបោរប្រឆាំងបារាំងយ៉ាងខ្លាំងក្លាដឹកនាំដោយព្រះអង្គម្ចាស់ស៊ីវត្ថា (1885-1886)។",
    },
    {
      q: {
        en: "What was the primary cause of the 'Umbrella Demonstration' in Phnom Penh on 20 July 1942?",
        km: "តើ «បាតុកម្មឆត្រ» (Umbrella Demonstration) នៅទីក្រុងភ្នំពេញ នាថ្ងៃទី 20 ខែកក្កដា ឆ្នាំ 1942 កើតឡើងដោយសារមូលហេតុអ្វីជាចម្បង?",
      },
      options: [
        "ក. ការប្រឆាំងនឹងការចាប់ខ្លួនអាចារ្យ ហែម ចៀវ និងលោក នួន ឌួង ដែលបានទេសនាបំផុសស្មារតីជាតិនិយម",
        "ខ. ការទាមទារដំឡើងប្រាក់ខែរបស់មន្ត្រីរាជការ និងកម្មករខ្មែរ",
        "គ. ការទាមទារឱ្យជប៉ុនដកកងទ័ពចេញពីប្រទេសកម្ពុជា",
        "ឃ. ការប្រឆាំងនឹងការប្តូរអក្សរខ្មែរទៅជាអក្សរឡាតាំង (រ៉ូម៉ាំងនីយកម្ម)",
      ],
      correct:
        "ក. ការប្រឆាំងនឹងការចាប់ខ្លួនអាចារ្យ ហែម ចៀវ និងលោក នួន ឌួង ដែលបានទេសនាបំផុសស្មារតីជាតិនិយម",
      difficulty: "hard",
      explanation:
        "បាតុកម្មឆត្រដឹកនាំដោយលោក ប៉ាច ឈឺន ដោយមានព្រះសង្ឃ និងប្រជាពលរដ្ឋរាប់ពាន់អង្គ/នាក់កាន់ឆត្រហែក្បួន ធ្វើឡើងដើម្បីទាមទារឱ្យបារាំងដោះលែងព្រះអាចារ្យ ហែម ចៀវ និងលោក នួន ឌួង។ នេះជាបាតុកម្មនយោបាយជាសាធារណៈលើកដំបូងបង្អស់ក្នុងប្រវត្តិសាស្ត្រទំនើបកម្ពុជាប្រឆាំងនឹងអាណានិគមបារាំង។",
    },
    {
      q: {
        en: "What diplomatic leverage strategy did King Norodom Sihanouk use against France during his 1953 international crusade for independence?",
        km: "ក្នុងដំណើរស្វែងរកការគាំទ្រអន្តរជាតិសម្រាប់ឯករាជ្យកម្ពុជាឆ្នាំ 1953 តើព្រះបាទសម្តេចព្រះ នរោត្តម សីហនុ បានប្រើប្រាស់យុទ្ធសាស្ត្រគាបសង្កត់ការទូតបែបណាទៅលើបារាំង?",
      },
      options: [
        "ក. បង្កើតសម្ព័ន្ធភាពយោធាជាមួយប្រទេសថៃដើម្បីវាយបណ្តេញបារាំង",
        "ខ. ដាក់ពាក្យបណ្តឹងទៅកាន់តុលាការយុត្តិធម៌អន្តរជាតិក្រុងឡាអេ",
        "គ. អំពាវនាវឱ្យអង្គការសហប្រជាជាតិបញ្ជូនកងទ័ពមួកខៀវមកជួយ",
        "ឃ. ព្រះអង្គយាងនិរទេសព្រះកាយទៅខេត្តសៀមរាប (តំបន់ស្វយ័ត) ហើយព្រមានថាកម្ពុជាអាចនឹងធ្លាក់ទៅក្នុងកណ្តាប់ដៃកុម្មុយនីស្ត ប្រសិនបើបារាំងមិនព្រមប្រគល់ឯករាជ្យ",
      ],
      correct:
        "ឃ. ព្រះអង្គយាងនិរទេសព្រះកាយទៅខេត្តសៀមរាប (តំបន់ស្វយ័ត) ហើយព្រមានថាកម្ពុជាអាចនឹងធ្លាក់ទៅក្នុងកណ្តាប់ដៃកុម្មុយនីស្ត ប្រសិនបើបារាំងមិនព្រមប្រគល់ឯករាជ្យ",
      difficulty: "hard",
      explanation:
        "ព្រះអង្គបានយាងទៅប្រទេសបារាំង កាណាដា អាមេរិក ជប៉ុន និងថៃ ហើយបានយាងទៅគង់នៅខេត្តសៀមរាប ដោយប្រកាសមិនយាងត្រឡប់មកភ្នំពេញវិញឡើយបើមិនទាន់បានឯករាជ្យ។ ព្រះអង្គបានផ្តល់បទសម្ភាសន៍ដល់កាសែត New York Times ដោយព្រមានថាលទ្ធិកុម្មុយនីស្តនឹងរីករាលដាល ប្រសិនបើពលរដ្ឋខ្មែរអស់សង្ឃឹមលើបារាំង ដែលយុទ្ធសាស្ត្រនេះបានដាក់សម្ពាធយ៉ាងខ្លាំងឱ្យបារាំងព្រមប្រគល់ឯករាជ្យនៅថ្ងៃទី 09 វិច្ឆិកា 1953។",
    },
    {
      q: {
        en: "What was the 'National Congress' during the Sangkum Reastr Niyum era, and what role did it play in governance?",
        km: "តើអ្វីទៅជា «មហាសន្និបាតជាតិ» ក្នុងរជ្ជកាលសង្គមរាស្ត្រនិយម ហើយវាមានតួនាទីអ្វីក្នុងដំណើរការដឹកនាំរដ្ឋ?",
      },
      options: [
        "ក. ជាការប្រជុំយោធាសម្ងាត់រវាងមេបញ្ជាការទ័ព និងព្រះប្រមុខរដ្ឋ",
        "ខ. ជាវេទិកាប្រជាធិបតេយ្យផ្ទាល់ ដែលប្រជាពលរដ្ឋអាចជួបជុំដេញដោល តវ៉ា និងសួរសំណួរផ្ទាល់មាត់ទៅកាន់រដ្ឋមន្ត្រី និងថ្នាក់ដឹកនាំរដ្ឋាភិបាល",
        "គ. ជាសភាជាន់ខ្ពស់ដែលមានតែសមាជិករាជវង្សានុវង្សចូលរួម",
        "ឃ. ជាតុលាការពិសេសសម្រាប់កាត់ទោសអ្នកប្រឆាំងនយោបាយ",
      ],
      correct:
        "ខ. ជាវេទិកាប្រជាធិបតេយ្យផ្ទាល់ ដែលប្រជាពលរដ្ឋអាចជួបជុំដេញដោល តវ៉ា និងសួរសំណួរផ្ទាល់មាត់ទៅកាន់រដ្ឋមន្ត្រី និងថ្នាក់ដឹកនាំរដ្ឋាភិបាល",
      difficulty: "hard",
      explanation:
        "មហាសន្និបាតជាតិដែលរៀបចំឡើងជាទៀងទាត់នៅវាលមេរុមុខព្រះបរមរាជវាំង គឺជាទម្រង់ប្រជាធិបតេយ្យផ្ទាល់ (Direct Democracy) របស់សម្តេចសីហនុ ដែលអនុញ្ញាតឱ្យប្រជារាស្ត្រសាមញ្ញឡើងនិយាយពីទុក្ខកង្វល់ និងរិះគន់អំពើពុករលួយរបស់មន្ត្រីរដ្ឋាភិបាលនៅចំពោះព្រះភក្ត្រព្រះអង្គផ្ទាល់។",
    },
    {
      q: {
        en: "How did the secret US bombing campaigns (Operations Menu and Freedom Deal, 1969–1973) produce political outcomes opposite to American expectations in Cambodia?",
        km: "តើយុទ្ធនាការទម្លាក់គ្រាប់បែកសម្ងាត់របស់សហរដ្ឋអាមេរិក (ប្រតិបត្តិការ Menu និង Freedom Deal ឆ្នាំ 1969-1973) លើទឹកដីកម្ពុជា បានបង្កផលវិបាកនយោបាយផ្ទុយស្រឡះពីការរំពឹងទុករបស់អាមេរិកយ៉ាងដូចម្តេច?",
      },
      options: [
        "ក. កម្ទេចចលនាខ្មែរក្រហមបានស្ទើរតែទាំងស្រុង",
        "ខ. ធ្វើឱ្យរបបសាធារណរដ្ឋខ្មែររបស់លោក លន់ នល់ គ្រប់គ្រងប្រទេសបានទូទាំងផ្ទៃប្រទេស",
        "គ. ធ្វើឱ្យប្រជាជនជនបទខឹងសម្បារ បង្កើតការបំផ្លិចបំផ្លាញយ៉ាងធ្ងន់ធ្ងរ និងរុញច្រានឱ្យកសិកររាប់ម៉ឺននាក់រត់ទៅចូលរួមជាមួយចលនាខ្មែរក្រហម",
        "ឃ. បញ្ឈប់ការដឹកជញ្ជូនស្បៀងតាមផ្លូវលំហូជីមិញបានជាស្ថាពរ",
      ],
      correct:
        "គ. ធ្វើឱ្យប្រជាជនជនបទខឹងសម្បារ បង្កើតការបំផ្លិចបំផ្លាញយ៉ាងធ្ងន់ធ្ងរ និងរុញច្រានឱ្យកសិកររាប់ម៉ឺននាក់រត់ទៅចូលរួមជាមួយចលនាខ្មែរក្រហម",
      difficulty: "hard",
      explanation:
        "គោលបំណងរបស់អាមេរិកគឺដើម្បីកម្ទេចជម្រកទ័ពវៀតកុង ប៉ុន្តែគ្រាប់បែករាប់សែនតោនបានធ្លាក់លើភូមិឋានកសិករ បណ្តាលឱ្យមនុស្សស្លាប់រាប់ម៉ឺននាក់ និងបាត់បង់ផ្ទះសម្បែង។ ខ្មែរក្រហមបានឆ្លៀតឱកាសឃោសនាពីការបំផ្លិចបំផ្លាញនេះ ដើម្បីកៀរគរកសិករឱ្យកាន់អាវុធប្រឆាំងនឹងរដ្ឋាភិបាលក្រុងភ្នំពេញ និងអាមេរិក។",
    },
    {
      q: {
        en: "In territorial administration, what did the Khmer Rouge replace traditional provinces and municipalities with?",
        km: "ក្នុងការគ្រប់គ្រងដែនដី ពួកខ្មែរក្រហមបានលុបចោលឈ្មោះខេត្ត-ក្រុងចាស់ៗទាំងអស់ ហើយជំនួសមកវិញដោយអ្វី?",
      },
      options: [
        "ក. ការបែងចែកជា 7 ភូមិភាគ និងតំបន់រដ្ឋបាលលេខ (ដូចជា ភូមិភាគបូព៌ា និរតី ពាយ័ព្យ...)",
        "ខ. ការបែងចែកប្រទេសជា «តំបន់ស្វយ័តយោធា» តាមបែបសូវៀត",
        "គ. ការគ្រប់គ្រងតាមប្រព័ន្ធសង្កាត់ និងខណ្ឌដូចសម័យបារាំង",
        "ឃ. ការបែងចែកទឹកដីជា 2 ផ្នែកគឺ តំបន់កសិកម្ម និងតំបន់ឧស្សាហកម្ម",
      ],
      correct:
        "ក. ការបែងចែកជា 7 ភូមិភាគ និងតំបន់រដ្ឋបាលលេខ (ដូចជា ភូមិភាគបូព៌ា និរតី ពាយ័ព្យ...)",
      difficulty: "hard",
      explanation:
        "របបកម្ពុជាប្រជាធិបតេយ្យបានប្តូររចនាសម្ព័ន្ធរដ្ឋបាល ដោយលុបឈ្មោះខេត្ត និងបែងចែកទឹកដីជា 7 ភូមិភាគធំៗ (ភូមិភាគបូព៌ា ភូមិភាគនិរតី ភូមិភាគឧត្តរ ភូមិភាគពាយ័ព្យ ភូមិភាគឦសាន ភូមិភាគបស្ចិម និងភូមិភាគកណ្តាល) ហើយនៅក្រោមភូមិភាគនីមួយៗត្រូវបានបែងចែកជា «តំបន់» ដែលសម្គាល់ដោយលេខ (ឧទាហរណ៍៖ តំបន់ 21, តំបន់ 105...) ស្រុក ឃុំ និងសហករណ៍។",
    },
    {
      q: {
        en: "What prompted the Communist Party of Kampuchea leadership (Pol Pot) to launch massive purges in the Eastern Zone under So Phim in 1978?",
        km: "តើមូលហេតុអ្វីដែលជំរុញឱ្យថ្នាក់ដឹកនាំមជ្ឈិមបក្សកុម្មុយនីស្តកម្ពុជា (ប៉ុល ពត) បើកការបោសសម្អាត និងសម្លាប់កម្មាភិបាលយ៉ាងរង្គាលនៅ «ភូមិភាគបូព៌ា» ដឹកនាំដោយលោក សោ ភឹម នៅឆ្នាំ 1978?",
      },
      options: [
        "ក. ដោយសារភូមិភាគបូព៌ាមិនព្រមធ្វើស្រែដាំដុះ",
        "ខ. ដោយសារកម្មាភិបាលភូមិភាគបូព៌ាទាមទារឱ្យបើកសាលារៀនឡើងវិញ",
        "គ. ដោយសារភូមិភាគបូព៌ាទទួលយកជំនួយពីសហរដ្ឋអាមេរិក",
        "ឃ. ដោយសារការសង្ស័យថាជា «ក្បាលយួនខ្លួនខ្មែរ» ឬជាជនក្បត់ដែលលួចទាក់ទងជាមួយប្រទេសវៀតណាម",
      ],
      correct:
        "ឃ. ដោយសារការសង្ស័យថាជា «ក្បាលយួនខ្លួនខ្មែរ» ឬជាជនក្បត់ដែលលួចទាក់ទងជាមួយប្រទេសវៀតណាម",
      difficulty: "hard",
      explanation:
        "ដោយសារមានព្រំប្រទល់ជាប់ប្រទេសវៀតណាម និងមានទំនាក់ទំនងតស៊ូពីមុនមក ក្រុមប៉ុល ពត មានការសង្ស័យខ្ពស់ (Paranoia) ថាថ្នាក់ដឹកនាំភូមិភាគបូព៌ាកំពុងក្បត់បក្ស។ ពួកគេបានចោទប្រកាន់អ្នកភូមិភាគបូព៌ាថាមាន «ចិត្តគំនិតយួន» ហើយបានបញ្ជូនកងទ័ពភូមិភាគនិរតីទៅវាយប្រហារ កម្ទេច និងសម្លាប់កម្មាភិបាលព្រមទាំងប្រជាជននៅទីនោះយ៉ាងព្រៃផ្សៃនៅឆ្នាំ 1978។",
    },
    {
      q: {
        en: "What was the purpose of the 'K5 Plan' implemented by the People's Republic of Kampuchea government between 1984 and 1989?",
        km: "តើ «ផែនការ ក-5» (K5 Plan) ដែលត្រូវបានអនុវត្តដោយរដ្ឋាភិបាលនៃរបបសាធារណរដ្ឋប្រជាមានិតកម្ពុជានៅចន្លោះឆ្នាំ 1984-1989 មានគោលដៅអ្វី?",
      },
      options: [
        "ក. ការធ្វើទំនើបកម្មប្រព័ន្ធស្រោចស្រព និងទំនប់ទឹកនៅទូទាំងប្រទេស",
        "ខ. ការកេណ្ឌកម្លាំងប្រជាជនទៅកាប់ឆ្ការព្រៃ ជីកលេណដ្ឋាន និងដាំមីនតាមបណ្តោយព្រំដែនកម្ពុជា-ថៃ ដើម្បីទប់ស្កាត់ការជ្រៀតចូលរបស់កងទ័ពខ្មែរក្រហម និងចលនាតស៊ូត្រីភាគី",
        "គ. ការសាងសង់ផ្លូវរថភ្លើងតភ្ជាប់ភ្នំពេញទៅខេត្តព្រះសីហនុ",
        "ឃ. ផែនការជម្លៀសប្រជាជនចេញពីតំបន់ទឹកជំនន់ទន្លេមេគង្គ",
      ],
      correct:
        "ខ. ការកេណ្ឌកម្លាំងប្រជាជនទៅកាប់ឆ្ការព្រៃ ជីកលេណដ្ឋាន និងដាំមីនតាមបណ្តោយព្រំដែនកម្ពុជា-ថៃ ដើម្បីទប់ស្កាត់ការជ្រៀតចូលរបស់កងទ័ពខ្មែរក្រហម និងចលនាតស៊ូត្រីភាគី",
      difficulty: "hard",
      explanation:
        "ផែនការ ក-5 គឺជាគម្រោងការពារព្រំដែនដ៏ធំសម្បើម ដោយបានកេណ្ឌប្រជាពលរដ្ឋ និងកម្មកររាប់សែននាក់ទៅកាប់ព្រៃ រៀបចំរបាំងការពារ និងបង្កប់គ្រាប់មីននៅខ្សែបន្ទាត់ព្រំដែនកម្ពុជា-ថៃ។ ទោះបីជាជួយរារាំងការជ្រៀតចូលរបស់ទ័ពតស៊ូបានខ្លះ ប៉ុន្តែវាបានបណ្តាលឱ្យពលរដ្ឋស្លាប់ និងពិការជាច្រើនដោយសារជំងឺគ្រុនចាញ់ និងគ្រាប់មីន។",
    },
    {
      q: {
        en: "Prior to the 1993 national election, which supreme national body was established under Prince Norodom Sihanouk to embody Cambodia's sovereignty and national unity?",
        km: "មុនការបោះឆ្នោតជាតិឆ្នាំ 1993 តើស្ថាប័នកំពូលជាតិខ្មែរមួយណាដែលត្រូវបានបង្កើតឡើងដើម្បីតំណាងឱ្យអធិបតេយ្យភាព ឯករាជ្យ និងឯកភាពជាតិកម្ពុជា ក្រោមព្រះរាជអធិបតីភាពនៃសម្តេចព្រះ នរោត្តម សីហនុ?",
      },
      options: [
        "ក. ក្រុមប្រឹក្សាជាតិជាន់ខ្ពស់ (SNC - Supreme National Council)",
        "ខ. គណៈកម្មាធិការជាតិរៀបចំការបោះឆ្នោត (គ.ជ.ប)",
        "គ. រដ្ឋសភាធម្មនុញ្ញ",
        "ឃ. តុលាការកំពូលនៃកម្ពុជា",
      ],
      correct: "ក. ក្រុមប្រឹក្សាជាតិជាន់ខ្ពស់ (SNC - Supreme National Council)",
      difficulty: "hard",
      explanation:
        "ក្រុមប្រឹក្សាជាតិជាន់ខ្ពស់ (SNC) បង្កើតឡើងដោយរួមបញ្ចូលភាគីជម្លោះកម្ពុជាទាំងបួន (រដ្ឋកម្ពុជា, ហ៊្វុនស៊ិនប៉ិច, រណសិរ្ស KPNLF, និងខ្មែរក្រហម) ដោយមានសម្តេចព្រះ នរោត្តម សីហនុ ជាព្រះប្រធាន។ SNC គឺជាតំណាងតែមួយគត់នៃអធិបតេយ្យភាពកម្ពុជានៅអង្គការសហប្រជាជាតិក្នុងអំឡុងពេលអន្តរកាលមុនការបោះឆ្នោត។",
    },
    {
      q: {
        en: "What is the historical significance of 29 December 1998 for Cambodia?",
        km: "តើព្រឹត្តិការណ៍នៅថ្ងៃទី 29 ខែធ្នូ ឆ្នាំ 1998 មានអត្ថន័យជាប្រវត្តិសាស្ត្រយ៉ាងដូចម្តេចចំពោះប្រទេសកម្ពុជា?",
      },
      options: [
        "ក. ជាថ្ងៃប្រកាសឱ្យប្រើប្រាស់រដ្ឋធម្មនុញ្ញថ្មីនៃព្រះរាជាណាចក្រកម្ពុជា",
        "ខ. ជាថ្ងៃដែលកម្ពុជាបានចូលជាសមាជិកពេញសិទ្ធិនៃសមាគមអាស៊ាន (ASEAN)",
        "គ. ជាថ្ងៃដែលមេដឹកនាំខ្មែរក្រហមចុងក្រោយ (ខៀវ សំផន និង នួន ជា) បានមកចុះចូលដល់គេហដ្ឋានសម្តេចតេជោ ហ៊ុន សែន នៅទីក្រុងតាខ្មៅ ដែលជាសញ្ញានៃការបញ្ចប់សង្គ្រាមស៊ីវិលទាំងស្រុង",
        "ឃ. ជាថ្ងៃចាប់ផ្តើមសវនាការលើកដំបូងនៃសាលាក្តីខ្មែរក្រហម",
      ],
      correct:
        "គ. ជាថ្ងៃដែលមេដឹកនាំខ្មែរក្រហមចុងក្រោយ (ខៀវ សំផន និង នួន ជា) បានមកចុះចូលដល់គេហដ្ឋានសម្តេចតេជោ ហ៊ុន សែន នៅទីក្រុងតាខ្មៅ ដែលជាសញ្ញានៃការបញ្ចប់សង្គ្រាមស៊ីវិលទាំងស្រុង",
      difficulty: "hard",
      explanation:
        "ថ្ងៃទី 29 ខែធ្នូ ឆ្នាំ 1998 ត្រូវបានចាត់ទុកជា «ទិវាសន្តិភាពនៅកម្ពុជា» ព្រោះជាថ្ងៃដែលមេដឹកនាំនយោបាយកំពូលៗរបស់ខ្មែរក្រហមបានស្ម័គ្រចិត្តមកចុះចូលដល់គេហដ្ឋានសម្តេចតេជោនៅតាខ្មៅ តាមរយៈ «នយោបាយ ឈ្នះ-ឈ្នះ» ដែលនាំមកនូវសន្តិភាពពេញលេញ និងការឯកភាពទឹកដីទាំងស្រុងជាលើកដំបូងក្នុងរយៈពេលជាង 500 ឆ្នាំនៃប្រវត្តិសាស្ត្រកម្ពុជា។",
    },
  ],

  // ── CHEMISTRY ──
  chemistry: [
    // ── BASIC DIFFICULTY ──
    {
      q: {
        en: "Which factors increase the rate of a chemical reaction?",
        km: "តើកត្តាណាខ្លះដែលធ្វើឱ្យល្បឿននៃប្រតិកម្មគីមីកើនឡើង?",
      },
      options: [
        "ក. ការបន្ថយសីតុណ្ហភាព និងការបន្ថយកំហាប់អង្គធាតុប្រតិករ",
        "ខ. ការបន្ថយផ្ទៃប៉ះនៃអង្គធាតុរឹង",
        "គ. ការបង្កើនសីតុណ្ហភាព និងការបង្កើនកំហាប់អង្គធាតុប្រតិករ",
        "ឃ. ការដកកាតាលីករចេញពីប្រតិកម្ម",
      ],
      correct: "គ. ការបង្កើនសីតុណ្ហភាព និងការបង្កើនកំហាប់អង្គធាតុប្រតិករ",
      difficulty: "easy",
      explanation:
        "កាលណាសីតុណ្ហភាព ឬកំហាប់អង្គធាតុប្រតិករកើនឡើង ចំនួនទង្គិចប្រសិទ្ធរវាងភាគល្អិតកើនឡើង ដែលធ្វើឱ្យប្រតិកម្មប្រព្រឹត្តទៅកាន់តែលឿន។",
    },
    {
      q: {
        en: "What is the role of a catalyst in a chemical reaction?",
        km: "តើកាតាលីករមានតួនាទីអ្វីខ្លះនៅក្នុងប្រតិកម្មគីមី?",
      },
      options: [
        "ក. ធ្វើឱ្យល្បឿនប្រតិកម្មកើនឡើង ដោយមិនប្រែប្រួលទម្រង់គីមីនៅពេលចប់ប្រតិកម្ម",
        "ខ. បង្កើនបរិមាណផលនៃអង្គធាតុកើត",
        "គ. ធ្វើឱ្យប្រតិកម្មបញ្ឈប់លឿនដោយបន្ថយល្បឿន",
        "ឃ. ផ្លាស់ប្តូរលំនឹងគីមីឱ្យងាកទៅឆ្វេង",
      ],
      correct:
        "ក. ធ្វើឱ្យល្បឿនប្រតិកម្មកើនឡើង ដោយមិនប្រែប្រួលទម្រង់គីមីនៅពេលចប់ប្រតិកម្ម",
      difficulty: "easy",
      explanation:
        "កាតាលីករជួយបន្ថយថាមពលសកម្មកម្ម (Activation Energy) នៃប្រតិកម្ម ធ្វើឱ្យប្រតិកម្មកើតឡើងលឿនជាងមុន ហើយវាមិនត្រូវបានបំផ្លាញ ឬប្រែប្រួលជាតិគីមីនៅចុងបញ្ចប់នៃប្រតិកម្មនោះឡើយ។",
    },
    {
      q: {
        en: "According to the Brønsted-Lowry theory, what is an acid?",
        km: "យោងតាមទ្រឹស្តីប្រុងស្តែត-ឡូរី (Brønsted-Lowry) តើអាស៊ីតជាអ្វី?",
      },
      options: [
        "ក. ប្រភេទគីមីដែលចាប់យកប្រូតុង ($H^+$)",
        "ខ. ប្រភេទគីមីដែលបោះបង់អេឡិចត្រុង",
        "គ. ប្រភេទគីមីដែលបង្កើនអ៊ីយ៉ុង $OH^-$ ក្នុងទឹក",
        "ឃ. ប្រភេទគីមីដែលបោះបង់ប្រូតុង ($H^+$)",
      ],
      correct: "ឃ. ប្រភេទគីមីដែលបោះបង់ប្រូតុង ($H^+$)",
      difficulty: "easy",
      explanation:
        "តាមប្រុងស្តែត អាស៊ីតគឺជាប្រភេទគីមី (ម៉ូលេគុល ឬអ៊ីយ៉ុង) ទាំងឡាយណាដែលអាចបោះបង់ ឬផ្តល់ប្រូតុង $H^+$។ រីឯបាសជាប្រភេទគីមីដែលចាប់យកប្រូតុង $H^+$។",
    },
    {
      q: {
        en: "A hydrochloric acid ($HCl$) solution has $[H_3O^+] = 10^{-3} \\text{ M}$. What is the $pH$ of this solution?",
        km: "សូលុយស្យុងអាស៊ីតក្លរីឌ្រិច ($HCl$) មួយមានកំហាប់ $[H_3O^+] = 10^{-3} \\text{ M}$។ តើសូលុយស្យុងនេះមាន $pH$ ស្មើនឹងប៉ុន្មាន?",
      },
      options: ["ក. $1$", "ខ. $3$", "គ. $7$", "ឃ. $11$"],
      correct: "ខ. $3$",
      difficulty: "easy",
      explanation:
        "តាមរូបមន្ត $pH = -\\log[H_3O^+] = -\\log(10^{-3}) = 3$។",
    },
    {
      q: {
        en: "For the exothermic equilibrium: $A_{(g)} + B_{(g)} \\rightleftharpoons C_{(g)} + \\text{Heat}$, how does increasing temperature affect equilibrium?",
        km: "គេមានប្រតិកម្មលំនឹងគីមីបញ្ចេញកម្តៅ៖ $A_{(g)} + B_{(g)} \\rightleftharpoons C_{(g)}$ + កម្តៅ តើការដំឡើងសីតុណ្ហភាពនឹងធ្វើឱ្យលំនឹងងាកទៅទិសដៅណា?",
      },
      options: [
        "ក. ងាកទៅទិសដៅច្រាស (ពីស្តាំទៅឆ្វេង)",
        "ខ. ងាកទៅទិសដៅស្រប (ពីឆ្វេងទៅស្តាំ)",
        "គ. មិនមានការប្រែប្រួលលំនឹងទេ",
        "ឃ. ធ្វើឱ្យល្បឿនប្រតិកម្មធ្លាក់ចុះដល់សូន្យ",
      ],
      correct: "ក. ងាកទៅទិសដៅច្រាស (ពីស្តាំទៅឆ្វេង)",
      difficulty: "easy",
      explanation:
        "តាមគោលការណ៍ឡឺសាតឺលីយេ កាលណាយើងបន្ថែមសីតុណ្ហភាព ប្រព័ន្ធលំនឹងនឹងរំកិលទៅទិសដៅស្រូបកម្តៅ (ទិសដៅច្រាស) ដើម្បីកាត់បន្ថយកម្តៅដែលបានបន្ថែម។",
    },
    {
      q: {
        en: "What is the functional group of an ester?",
        km: "តើបង្គុំនាទីរបស់អេស្ទែ (Ester) មានទម្រង់យ៉ាងដូចម្តេច?",
      },
      options: ["ក. $-\\text{OH}$", "ខ. $-\\text{CHO}$", "គ. $-\\text{COOH}$", "ឃ. $-\\text{COO}-$"],
      correct: "ឃ. $-\\text{COO}-$",
      difficulty: "easy",
      explanation:
        "$-\\text{OH}$ ជាបង្គុំអ៊ីដ្រុកស៊ីល (អាល់កុល), $-\\text{CHO}$ ជាបង្គុំកាបូនីល (អាល់ដេអ៊ីត), $-\\text{COOH}$ ជាបង្គុំកាបុកស៊ីល (អាស៊ីតកាបុកស៊ីលិក), $-\\text{COO}-$ ឬ $-\\text{COOR}$ ជាបង្គុំនាទីរបស់អេស្ទែ។",
    },
    {
      q: {
        en: "What substances react together in an esterification reaction?",
        km: "ប្រតិកម្មអេស្ទែកម្ម (Esterification) គឺជាប្រតិកម្មរវាងសារធាតុណាខ្លះ?",
      },
      options: [
        "ក. អាស៊ីតកាបុកស៊ីលិក ជាមួយ អាល់សែន",
        "ខ. អាស៊ីតកាបុកស៊ីលិក ជាមួយ អាល់កុល",
        "គ. អាល់កុល ជាមួយ ទឹក",
        "ឃ. អាល់ដេអ៊ីត ជាមួយ កេតូន",
      ],
      correct: "ខ. អាស៊ីតកាបុកស៊ីលិក ជាមួយ អាល់កុល",
      difficulty: "easy",
      explanation:
        "ប្រតិកម្មរវាងអាស៊ីតកាបុកស៊ីលិក និងអាល់កុល បង្កើតបានជា អេស្ទែ និងទឹក ($\\text{R-COOH} + \\text{R'-OH} \\rightleftharpoons \\text{R-COO-R'} + \\text{H}_2\\text{O}$) ដោយប្រើកាតាលីករ $\\text{H}_2\\text{SO}_4$ ខាប់។",
    },
    {
      q: {
        en: "What are the key characteristics of the direct esterification reaction?",
        km: "តើប្រតិកម្មអេស្ទែកម្មផ្ទាល់រវាងអាស៊ីតកាបុកស៊ីលិក និងអាល់កុល មានលក្ខណៈសម្បត្តិយ៉ាងដូចម្តេច?",
      },
      options: [
        "ក. លឿន បញ្ចេញកម្តៅ និងចប់សព្វគ្រប់",
        "ខ. ផ្ទុះខ្លាំង និងមិនអាចត្រឡប់វិញបាន",
        "គ. យឺត មិនបញ្ចេញកម្តៅ (អាទែម) និងជាប្រតិកម្មទ្វេទិស (មានលំនឹង)",
        "ឃ. កើតឡើងតែនៅសីតុណ្ហភាពក្រោម $0^\\circ\\text{C}$ ប៉ុណ្ណោះ",
      ],
      correct: "គ. យឺត មិនបញ្ចេញកម្តៅ (អាទែម) និងជាប្រតិកម្មទ្វេទិស (មានលំនឹង)",
      difficulty: "easy",
      explanation:
        "ប្រតិកម្មអេស្ទែកម្មជាប្រតិកម្មកម្រិតលំនឹង ដែលមានលក្ខណៈពិសេសបីគឺ៖ យឺត, អាទែម (កម្តៅប្រតិកម្មស្មើនឹងសូន្យ), និង ទ្វេទិស/កំណត់ (មិនចប់សព្វគ្រប់)។",
    },
    {
      q: {
        en: "What is the IUPAC name of $\\text{CH}_3-\\text{CH}_2-\\text{COOH}$?",
        km: "តើសមាសធាតុដែលមានរូបមន្តទូទៅ $\\text{CH}_3-\\text{CH}_2-\\text{COOH}$ មានឈ្មោះជាអន្តរជាតិ (IUPAC) ដូចម្តេច?",
      },
      options: [
        "ក. អាស៊ីតមេតាណូអ៊ិច",
        "ខ. អាស៊ីតអេតាណូអ៊ិច",
        "គ. អាស៊ីតប្រូប៉ាណូអ៊ិច",
        "ឃ. អាស៊ីតប៊ុយតាណូអ៊ិច",
      ],
      correct: "គ. អាស៊ីតប្រូប៉ាណូអ៊ិច",
      difficulty: "easy",
      explanation:
        "សមាសធាតុនេះមានអាតូមកាបូនចំនួន 3 ($C = 3$ សំដៅលើ «ប្រូប៉ាន») និងមានបង្គុំនាទី $-\\text{COOH}$ ដូច្នេះឈ្មោះរបស់វាគឺ «អាស៊ីតប្រូប៉ាណូអ៊ិច» (Propanoic acid)។",
    },
    {
      q: {
        en: "What classification of amine is $\\text{CH}_3-\\text{NH}_2$?",
        km: "តើសមាសធាតុ $\\text{CH}_3-\\text{NH}_2$ ជាអាមីនថ្នាក់ទីប៉ុន្មាន?",
      },
      options: [
        "ក. អាមីនថ្នាក់ទី 1",
        "ខ. អាមីនថ្នាក់ទី 2",
        "គ. អាមីនថ្នាក់ទី 3",
        "ឃ. អាមីនថ្នាក់ទី 4",
      ],
      correct: "ក. អាមីនថ្នាក់ទី 1",
      difficulty: "easy",
      explanation:
        "ថ្នាក់នៃអាមីនត្រូវបានកំណត់ដោយចំនួនរ៉ាឌីកាល់អ៊ីដ្រូកាបួរដែលភ្ជាប់ទៅនឹងអាតូមអាសូត ($N$)៖ ភ្ជាប់រ៉ាឌីកាល់ 1 ($-\\text{NH}_2$) ជាអាមីនថ្នាក់ទី 1 (មេទីលអាមីន), ភ្ជាប់រ៉ាឌីកាល់ 2 ($-\\text{NH}-$) ជាអាមីនថ្នាក់ទី 2, ភ្ជាប់រ៉ាឌីកាល់ 3 ($-\\text{N}<$) ជាអាមីនថ្នាក់ទី 3។",
    },

    // ── MEDIUM DIFFICULTY ──
    {
      q: {
        en: "In the time interval from $t_1 = 10\\text{ s}$ to $t_2 = 30\\text{ s}$, the concentration of product $C$ increases from $0.02\\text{ mol/L}$ to $0.08\\text{ mol/L}$. Calculate the average rate of formation of $C$:",
        km: "ក្នុងចន្លោះពេលពី $t_1 = 10\\text{ s}$ ទៅ $t_2 = 30\\text{ s}$ កំហាប់នៃអង្គធាតុកើត $C$ កើនឡើងពី $0.02\\text{ mol/L}$ ទៅដល់ $0.08\\text{ mol/L}$។ គណនាល្បឿនមធ្យមកំណកើននៃ $C$ ក្នុងចន្លោះពេលនោះ៖",
      },
      options: [
        "ក. $2.0 \\times 10^{-3}\\text{ mol}\\cdot\\text{L}^{-1}\\cdot\\text{s}^{-1}$",
        "ខ. $4.0 \\times 10^{-3}\\text{ mol}\\cdot\\text{L}^{-1}\\cdot\\text{s}^{-1}$",
        "គ. $1.5 \\times 10^{-3}\\text{ mol}\\cdot\\text{L}^{-1}\\cdot\\text{s}^{-1}$",
        "ឃ. $3.0 \\times 10^{-3}\\text{ mol}\\cdot\\text{L}^{-1}\\cdot\\text{s}^{-1}$",
      ],
      correct: "ឃ. $3.0 \\times 10^{-3}\\text{ mol}\\cdot\\text{L}^{-1}\\cdot\\text{s}^{-1}$",
      difficulty: "medium",
      explanation:
        "រូបមន្តល្បឿនមធ្យមកំណកើន៖ $V_m(C) = \\frac{\\Delta [C]}{\\Delta t} = \\frac{[C]_2 - [C]_1}{t_2 - t_1} = \\frac{0.08 - 0.02}{30 - 10} = \\frac{0.06}{20} = 3.0 \\times 10^{-3}\\text{ mol}\\cdot\\text{L}^{-1}\\cdot\\text{s}^{-1}$។",
    },
    {
      q: {
        en: "For the reaction: $2A + 3B \\rightarrow 4C$, if the rate of disappearance of $A$ at a given moment is $V(A) = 0.04\\text{ mol}\\cdot\\text{L}^{-1}\\cdot\\text{s}^{-1}$, what is the rate of formation of $C$?",
        km: "គេមានសមីការប្រតិកម្មតាងដោយ៖ $2A + 3B \\rightarrow 4C$ បើនៅខណៈពេលមួយ ល្បឿនបំបាត់នៃ $A$ គឺ $V(A) = 0.04\\text{ mol}\\cdot\\text{L}^{-1}\\cdot\\text{s}^{-1}$ តើល្បឿនកំណកើននៃ $C$ ស្មើនឹងប៉ុន្មាន?",
      },
      options: [
        "ក. $0.02\\text{ mol}\\cdot\\text{L}^{-1}\\cdot\\text{s}^{-1}$",
        "ខ. $0.04\\text{ mol}\\cdot\\text{L}^{-1}\\cdot\\text{s}^{-1}$",
        "គ. $0.08\\text{ mol}\\cdot\\text{L}^{-1}\\cdot\\text{s}^{-1}$",
        "ឃ. $0.16\\text{ mol}\\cdot\\text{L}^{-1}\\cdot\\text{s}^{-1}$",
      ],
      correct: "គ. $0.08\\text{ mol}\\cdot\\text{L}^{-1}\\cdot\\text{s}^{-1}$",
      difficulty: "medium",
      explanation:
        "តាមទំនាក់ទំនងមេគុណស្ដូគ្យូមែត្រនៃប្រតិកម្ម៖ $\\frac{V(A)}{2} = \\frac{V(C)}{4} \\implies V(C) = 2 \\cdot V(A) = 2 \\times 0.04 = 0.08\\text{ mol}\\cdot\\text{L}^{-1}\\cdot\\text{s}^{-1}$។",
    },
    {
      q: {
        en: "Sodium hydroxide ($NaOH$) is dissolved in water to yield $[OH^-] = 1.0 \\times 10^{-4}\\text{ M}$ at $25^\\circ\\text{C}$. Find the $pH$ of this solution:",
        km: "គេរំលាយសូដ្យូមអ៊ីដ្រុកស៊ីត ($NaOH$) ក្នុងទឹក បានសូលុយស្យុងដែលមានកំហាប់អ៊ីយ៉ុងអ៊ីដ្រុកស៊ីត $[OH^-] = 1.0 \\times 10^{-4}\\text{ M}$ នៅ $25^\\circ\\text{C}$។ រកតម្លៃ $pH$ នៃសូលុយស្យុងនេះ៖",
      },
      options: ["ក. $10$", "ខ. $4$", "គ. $8$", "ឃ. $12$"],
      correct: "ក. $10$",
      difficulty: "medium",
      explanation:
        "វិធីទី 1៖ $pOH = -\\log[OH^-] = -\\log(10^{-4}) = 4 \\implies pH = 14 - pOH = 14 - 4 = 10$។ វិធីទី 2៖ តាមផលគុណអ៊ីយ៉ុងនៃទឹក $K_w = [H_3O^+][OH^-] = 10^{-14} \\implies [H_3O^+] = \\frac{10^{-14}}{10^{-4}} = 10^{-10}\\text{ M} \\implies pH = 10$។",
    },
    {
      q: {
        en: "A buffer solution is prepared with equal concentrations of ethanoic acid $CH_3COOH$ and sodium ethanoate $CH_3COONa$. Given $pK_a = 4.75$, what is the $pH$ of this buffer?",
        km: "សូលុយស្យុងតំបុង (Buffer solution) មួយផ្សំឡើងពីអាស៊ីតអេតាណូអ៊ិច $CH_3COOH$ និងសូដ្យូមអេតាណូអាត $CH_3COONa$ ដែលមានកំហាប់ស្មើគ្នា។ គេឱ្យ $pK_a(CH_3COOH/CH_3COO^-) = 4.75$។ តម្លៃ $pH$ នៃសូលុយស្យុងតំបុងនេះគឺ៖",
      },
      options: ["ក. $7.00$", "ខ. $4.75$", "គ. $9.25$", "ឃ. $2.38$"],
      correct: "ខ. $4.75$",
      difficulty: "medium",
      explanation:
        "តាមរូបមន្តហង់ឌឺសិន-ហាសែលបាល (Henderson-Hasselbalch)៖ $pH = pK_a + \\log\\frac{[\\text{Base}]}{[\\text{Acid}]}$ (ដែល $[\\text{Base}] = [CH_3COO^-]$ និង $[\\text{Acid}] = [CH_3COOH]$)។ ដោយសារកំហាប់បាសនិងអាស៊ីតស្មើគ្នា នាំឱ្យ $\\frac{[\\text{Base}]}{[\\text{Acid}]} = 1 \\implies \\log(1) = 0$ ដូច្នេះ $pH = pK_a = 4.75$។",
    },
    {
      q: {
        en: "For the equilibrium reaction in a closed vessel: $2SO_2(g) + O_2(g) \\rightleftharpoons 2SO_3(g)$, what is the correct expression for the equilibrium constant $K_c$?",
        km: "ចំពោះប្រតិកម្មលំនឹងក្នុងប្រព័ន្ធបិទ៖ $2SO_2(g) + O_2(g) \\rightleftharpoons 2SO_3(g)$ តើកន្សោមថេរលំនឹង $K_c$ ត្រូវសរសេរយ៉ាងដូចម្តេច?",
      },
      options: [
        "ក. $K_c = \\frac{[SO_2]^2 [O_2]}{[SO_3]^2}$",
        "ខ. $K_c = \\frac{2[SO_3]}{2[SO_2][O_2]}$",
        "គ. $K_c = \\frac{[SO_3]}{[SO_2][O_2]}$",
        "ឃ. $K_c = \\frac{[SO_3]^2}{[SO_2]^2 [O_2]}$",
      ],
      correct: "ឃ. $K_c = \\frac{[SO_3]^2}{[SO_2]^2 [O_2]}$",
      difficulty: "medium",
      explanation:
        "ថេរលំនឹង $K_c$ គឺជាផលធៀបរវាងផលគុណកំហាប់អង្គធាតុកើតលើផលគុណកំហាប់អង្គធាតុប្រតិករនៅពេលលំនឹង ដោយលើកជាស្វ័យគុណតាមមេគុណស្ដូគ្យូមែត្ររៀងៗខ្លួន៖ $K_c = \\frac{[SO_3]^2}{[SO_2]^2 [O_2]}$។",
    },
    {
      q: {
        en: "For the gaseous equilibrium: $N_2(g) + 3H_2(g) \\rightleftharpoons 2NH_3(g)$, how does increasing pressure (by reducing volume) affect equilibrium?",
        km: "គេមានលំនឹងឧស្ម័ន៖ $N_2(g) + 3H_2(g) \\rightleftharpoons 2NH_3(g)$ កាលណាយើងបង្កើនសម្ពាធលើប្រព័ន្ធ (ដោយបន្ថយមាឌ) តើលំនឹងនឹងមានបម្លាស់ប្តូរយ៉ាងដូចម្តេច?",
      },
      options: [
        "ក. ងាកទៅទិសដៅស្រប (ពីឆ្វេងទៅស្តាំ)",
        "ខ. ងាកទៅទិសដៅច្រាស (ពីស្តាំទៅឆ្វេង)",
        "គ. មិនមានការប្រែប្រួលទេ ព្រោះជាឧស្ម័នដូចគ្នា",
        "ឃ. ថេរលំនឹង $K_c$ នឹងកើនឡើងទ្វេដង",
      ],
      correct: "ក. ងាកទៅទិសដៅស្រប (ពីឆ្វេងទៅស្តាំ)",
      difficulty: "medium",
      explanation:
        "តាមគោលការណ៍ឡឺសាតឺលីយេ ការបង្កើនសម្ពាធនឹងធ្វើឱ្យលំនឹងរំកិលទៅទិសដៅណាដែលមានចំនួនម៉ូលឧស្ម័នតិចជាង។ អង្គធាតុប្រតិករមាន $1 + 3 = 4\\text{ mol}$ ឧស្ម័ន រីឯអង្គធាតុកើតមានតែ $2\\text{ mol}$ ឧស្ម័ន ដូច្នេះលំនឹងរំកិលទៅស្តាំ (ទិសដៅស្រប)។",
    },
    {
      q: {
        en: "What are the products of the saponification reaction between an ester and hot sodium hydroxide ($NaOH$)?",
        km: "ប្រតិកម្មរវាងអេស្ទែជាមួយសូលុយស្យុងបាសខ្លាំង $NaOH$ ក្តៅ ហៅថាប្រតិកម្មសាពូនកម្ម (Saponification)។ តើប្រតិកម្មនេះផ្តល់ផលជាអ្វីខ្លះ?",
      },
      options: [
        "ក. អាស៊ីតកាបុកស៊ីលិក និង អាល់កុល",
        "ខ. អំបិលការបុកស៊ីឡាត (សាប៊ូ) និង អាល់កុល",
        "គ. អាល់កាន និង ទឹក",
        "ឃ. អេទែ និង អំបិល",
      ],
      correct: "ខ. អំបិលការបុកស៊ីឡាត (សាប៊ូ) និង អាល់កុល",
      difficulty: "medium",
      explanation:
        "សមីការទូទៅ៖ $\\text{R-COO-R'} + NaOH \\xrightarrow{t^\\circ} \\text{R-COONa} + \\text{R'-OH}$។ អំបិលការបុកស៊ីឡាត ($\\text{R-COONa}$) គឺជាសមាសភាគស្នូលនៃសាប៊ូ។",
    },
    {
      q: {
        en: "Acid hydrolysis of a triglyceride yields fatty acids and which specific alcohol?",
        km: "ការធ្វើអ៊ីដ្រូលីសទ្រីគ្លីសេរីត (ខ្លាញ់ ឬប្រេង) ក្នុងមជ្ឈដ្ឋានអាស៊ីត តែងតែផ្តល់ផលជាអាស៊ីតខ្លាញ់ និងសមាសធាតុអាល់កុលមួយប្រភេទ។ តើអាល់កុលនោះមានឈ្មោះអ្វី?",
      },
      options: [
        "ក. អេតាណុល",
        "ខ. មេតាណុល",
        "គ. គ្លីសេរ៉ូល (Glycerol / Propan-1,2,3-triol)",
        "ឃ. អេទីឡែនគ្លីកុល",
      ],
      correct: "គ. គ្លីសេរ៉ូល (Glycerol / Propan-1,2,3-triol)",
      difficulty: "medium",
      explanation:
        "ទ្រីគ្លីសេរីតគឺជាទ្រីអេស្ទែនៃគ្លីសេរ៉ូលជាមួយអាស៊ីតខ្លាញ់។ ដូច្នេះនៅពេលរងអ៊ីដ្រូលីស វានឹងបង្កើតឡើងវិញនូវអាស៊ីតខ្លាញ់ចំនួន 3 ម៉ូលេគុល និង គ្លីសេរ៉ូល (គ្លីសេរីន) ចំនួន 1 ម៉ូលេគុល។",
    },
    {
      q: {
        en: "Are amines (such as $\\text{CH}_3\\text{NH}_2$) acidic or basic, and why?",
        km: "តើអាមីន (ដូចជា $\\text{CH}_3\\text{NH}_2$) មានលក្ខណៈសម្បត្តិជាអាស៊ីត ឬបាស ហើយព្រោះអ្វី?",
      },
      options: [
        "ក. ជាបាស ព្រោះអាតូមអាសូត ($N$) មានទ្វេអេឡិចត្រុងសេរី (Lone pair) អាចចាប់យកប្រូតុង $H^+$",
        "ខ. ជាអាស៊ីត ព្រោះវាអាចបោះបង់ប្រូតុង $H^+$ យ៉ាងងាយ",
        "គ. ជាសារធាតុអព្យាក្រឹត មិនមានប្រតិកម្មជាមួយអាស៊ីតឡើយ",
        "ឃ. ជាអុកស៊ីតករខ្លាំង",
      ],
      correct:
        "ក. ជាបាស ព្រោះអាតូមអាសូត ($N$) មានទ្វេអេឡិចត្រុងសេរី (Lone pair) អាចចាប់យកប្រូតុង $H^+$",
      difficulty: "medium",
      explanation:
        "អាតូមអាសូតក្នុងម៉ូលេគុលអាមីនមានគូអេឡិចត្រុងសេរីមួយគូ ដែលអាចទទួលប្រូតុង $H^+$ ពីទឹក ឬអាស៊ីតបាន តាមសមីការ៖ $\\text{R-NH}_2 + H_2O \\rightleftharpoons \\text{R-NH}_3^+ + OH^-$ ធ្វើឱ្យសូលុយស្យុងមានលក្ខណៈជាបាសខ្សោយ ($pH > 7$)។",
    },
    {
      q: {
        en: "When two amino acids undergo a condensation reaction, what is the resulting linkage connecting them called?",
        km: "នៅពេលអាស៊ីតអាមីណេពីរម៉ូលេគុលធ្វើប្រតិកម្មបញ្ចូលគ្នា (Condensation) តើចំណងដែលភ្ជាប់រវាងម៉ូលេគុលទាំងពីរត្រូវបានហៅថាអ្វី?",
      },
      options: [
        "ក. ចំណងអេស្ទែ ($-\\text{COO}-$)",
        "ខ. ចំណងអ៊ីដ្រូសែន",
        "គ. ចំណងប៉ិបទីត ($-\\text{CO}-\\text{NH}-$)",
        "ឃ. ចំណងគ្លីកូស៊ីឌីក",
      ],
      correct: "គ. ចំណងប៉ិបទីត ($-\\text{CO}-\\text{NH}-$)",
      difficulty: "medium",
      explanation:
        "បង្គុំកាបុកស៊ីល ($-\\text{COOH}$) នៃអាស៊ីតអាមីណេទីមួយ ភ្ជាប់ជាមួយបង្គុំអាមីន ($-\\text{NH}_2$) នៃអាស៊ីតអាមីណេទីពីរ ដោយបាត់បង់ម៉ូលេគុលទឹកមួយ បង្កើតបានជាចំណងប៉ិបទីត ឬចំណងអាមីត ($-\\text{CO}-\\text{NH}-$)។",
    },

    // ── HARD DIFFICULTY ──
    {
      q: {
        en: "For the reaction $2A + B \\rightarrow C$, initial rate experiments yield:\n• Exp 1: $[A]_0 = 0.1\\text{ M}, [B]_0 = 0.1\\text{ M} \\implies v_0 = 2.0 \\times 10^{-3}\\text{ M}\\cdot\\text{s}^{-1}$\n• Exp 2: $[A]_0 = 0.2\\text{ M}, [B]_0 = 0.1\\text{ M} \\implies v_0 = 8.0 \\times 10^{-3}\\text{ M}\\cdot\\text{s}^{-1}$\n• Exp 3: $[A]_0 = 0.1\\text{ M}, [B]_0 = 0.2\\text{ M} \\implies v_0 = 4.0 \\times 10^{-3}\\text{ M}\\cdot\\text{s}^{-1}$\nWhat is the rate law equation for this reaction?",
        km: "ចំពោះប្រតិកម្ម $2A + B \\rightarrow C$ គេធ្វើពិសោធន៍វាស់ល្បឿនដើម $v_0$ ទទួលបានលទ្ធផលដូចខាងក្រោម៖\n• ពិសោធន៍ទី 1៖ $[A]_0 = 0.1\\text{ M}, [B]_0 = 0.1\\text{ M} \\implies v_0 = 2.0 \\times 10^{-3}\\text{ M}\\cdot\\text{s}^{-1}$\n• ពិសោធន៍ទី 2៖ $[A]_0 = 0.2\\text{ M}, [B]_0 = 0.1\\text{ M} \\implies v_0 = 8.0 \\times 10^{-3}\\text{ M}\\cdot\\text{s}^{-1}$\n• ពិសោធន៍ទី 3៖ $[A]_0 = 0.1\\text{ M}, [B]_0 = 0.2\\text{ M} \\implies v_0 = 4.0 \\times 10^{-3}\\text{ M}\\cdot\\text{s}^{-1}$\nតើសមីការច្បាប់ល្បឿននៃប្រតិកម្មនេះមានទម្រង់ដូចម្តេច?",
      },
      options: [
        "ក. $v = k[A][B]$",
        "ខ. $v = k[A][B]^2$",
        "គ. $v = k[A]^2[B]^2$",
        "ឃ. $v = k[A]^2[B]$",
      ],
      correct: "ឃ. $v = k[A]^2[B]$",
      difficulty: "hard",
      explanation:
        "តាមទម្រង់ទូទៅ $v = k[A]^x[B]^y$។ ប្រៀបធៀបពិសោធន៍ទី 1 និងទី 2 ($[B]$ ថេរ)៖ $\\frac{v_2}{v_1} = \\left(\\frac{0.2}{0.1}\\right)^x \\implies \\frac{8.0 \\times 10^{-3}}{2.0 \\times 10^{-3}} = 2^x \\implies 4 = 2^x \\implies x = 2$។ ប្រៀបធៀបពិសោធន៍ទី 1 និងទី 3 ($[A]$ ថេរ)៖ $\\frac{v_3}{v_1} = \\left(\\frac{0.2}{0.1}\\right)^y \\implies \\frac{4.0 \\times 10^{-3}}{2.0 \\times 10^{-3}} = 2^y \\implies 2 = 2^y \\implies y = 1$។ នាំឱ្យសមីការច្បាប់ល្បឿនគឺ $v = k[A]^2[B]$។",
    },
    {
      q: {
        en: "For the decomposition $2H_2O_2(aq) \\rightarrow 2H_2O(l) + O_2(g)$, the tangent to the $[H_2O_2]$ vs $t$ curve at $t = 100\\text{ s}$ intersects the concentration axis at $0.08\\text{ mol/L}$ and the time axis at $400\\text{ s}$. What is the instantaneous rate of disappearance of $H_2O_2$ at $t = 100\\text{ s}$?",
        km: "គេមានប្រតិកម្មបំបែកអ៊ីដ្រូសែនពែអុកស៊ីត៖ $2H_2O_2(aq) \\rightarrow 2H_2O(l) + O_2(g)$។ តាមរយៈក្រាបបំរែបំរួលកំហាប់ $[H_2O_2]$ ធៀបនឹងពេល $t$ បន្ទាត់ប៉ះនឹងក្រាបត្រង់ខណៈ $t = 100\\text{ s}$ កាត់អ័ក្សកំហាប់ត្រង់ $0.08\\text{ mol/L}$ និងកាត់អ័ក្សពេលត្រង់ $400\\text{ s}$។ តើល្បឿនខណៈនៃការបំបាត់ $H_2O_2$ ត្រង់ខណៈ $t = 100\\text{ s}$ មានតម្លៃប៉ុន្មាន?",
      },
      options: [
        "ក. $4.0 \\times 10^{-4}\\text{ mol}\\cdot\\text{L}^{-1}\\cdot\\text{s}^{-1}$",
        "ខ. $8.0 \\times 10^{-4}\\text{ mol}\\cdot\\text{L}^{-1}\\cdot\\text{s}^{-1}$",
        "គ. $2.0 \\times 10^{-4}\\text{ mol}\\cdot\\text{L}^{-1}\\cdot\\text{s}^{-1}$",
        "ឃ. $1.0 \\times 10^{-4}\\text{ mol}\\cdot\\text{L}^{-1}\\cdot\\text{s}^{-1}$",
      ],
      correct: "គ. $2.0 \\times 10^{-4}\\text{ mol}\\cdot\\text{L}^{-1}\\cdot\\text{s}^{-1}$",
      difficulty: "hard",
      explanation:
        "ល្បឿនខណៈនៃការបំបាត់អង្គធាតុប្រតិករស្មើនឹងតម្លៃដាច់ខាតនៃមេគុណប្រាប់ទិសបន្ទាត់ប៉ះក្រាប៖ $v = -\\left(\\frac{d[H_2O_2]}{dt}\\right)_{t=100} = -\\left(\\frac{0 - 0.08}{400 - 0}\\right) = \\frac{0.08}{400} = 2.0 \\times 10^{-4}\\text{ mol}\\cdot\\text{L}^{-1}\\cdot\\text{s}^{-1}$។",
    },
    {
      q: {
        en: "Calculate the $pH$ of a methanoic acid ($HCOOH$) solution of concentration $C = 0.1\\text{ M}$ at $25^\\circ\\text{C}$, given $K_a = 1.8 \\times 10^{-4}$ and $\\log(4.24) \\approx 0.63$:",
        km: "គណនាតម្លៃ $pH$ នៃសូលុយស្យុងអាស៊ីតមេតាណូអ៊ិច ($HCOOH$) កំហាប់ $C = 0.1\\text{ M}$ នៅ $25^\\circ\\text{C}$ ដោយស្គាល់ថេរកម្រិតអាស៊ីត $K_a = 1.8 \\times 10^{-4}$ (គេឱ្យ $\\log(4.24) \\approx 0.63$)៖",
      },
      options: ["ក. $2.37$", "ខ. $1.00$", "គ. $2.87$", "ឃ. $3.74$"],
      correct: "ក. $2.37$",
      difficulty: "hard",
      explanation:
        "ដោយសារ $\\frac{C}{K_a} = \\frac{0.1}{1.8 \\times 10^{-4}} \\approx 555 > 100$ យើងអាចចាត់ទុកការបែកជាអ៊ីយ៉ុងមានកម្រិតតិចតួច ($C - [H_3O^+] \\approx C$)។ រូបមន្ត៖ $[H_3O^+] = \\sqrt{K_a \\cdot C} = \\sqrt{1.8 \\times 10^{-4} \\times 0.1} = \\sqrt{18 \\times 10^{-6}} \\approx 4.24 \\times 10^{-3}\\text{ M}$។ នាំឱ្យ $pH = -\\log(4.24 \\times 10^{-3}) = 3 - \\log(4.24) = 3 - 0.63 = 2.37$។",
    },
    {
      q: {
        en: "A monoprotic weak acid $HA$ solution of concentration $0.05\\text{ M}$ has $pH = 3.0$. What is the degree of ionization (ionization percentage $\\alpha$) of this acid?",
        km: "សូលុយស្យុងអាស៊ីតខ្សោយម៉ូណូប្រូទិច $HA$ មួយមានកំហាប់ $0.05\\text{ M}$ និងមាន $pH = 3.0$។ តើអាស៊ីតនេះមានអត្រាបំបែកជាអ៊ីយ៉ុង (កម្រិតអ៊ីយ៉ូដកម្ម $\\alpha$) ស្មើនឹងប៉ុន្មានភាគរយ?",
      },
      options: ["ក. $1\\%$", "ខ. $2\\%$", "គ. $5\\%$", "ឃ. $10\\%$"],
      correct: "ខ. $2\\%$",
      difficulty: "hard",
      explanation:
        "តាម $pH = 3.0 \\implies [H_3O^+] = 10^{-3}\\text{ M}$។ អត្រាបំបែកជាអ៊ីយ៉ុង៖ $\\alpha = \\frac{[H_3O^+]}{C} \\times 100\\% = \\frac{10^{-3}}{0.05} \\times 100\\% = \\frac{0.001}{0.05} \\times 100\\% = 2\\%$។",
    },
    {
      q: {
        en: "Titrating $20\\text{ mL}$ of weak acid $CH_3COOH$ ($0.1\\text{ M}$) with strong base $NaOH$ ($0.1\\text{ M}$): at the equivalence point, what is the nature and approximate $pH$ of the solution?",
        km: "គេធ្វើការក្រិតសូលុយស្យុងអាស៊ីតខ្សោយ $CH_3COOH$ ចំណុះ $20\\text{ mL}$ កំហាប់ $0.1\\text{ M}$ ដោយសូលុយស្យុងបាសខ្លាំង $NaOH$ កំហាប់ $0.1\\text{ M}$។ នៅត្រង់ចំណុចសមមូល (Equivalence point) តើសូលុយស្យុងមានលក្ខណៈបែបណា និងមានតម្លៃ $pH$ ប្រហាក់ប្រហែលប៉ុន្មាន?",
      },
      options: [
        "ក. $pH = 7$ (អព្យាក្រឹត) ព្រោះអាស៊ីតនិងបាសមានចំនួនម៉ូលស្មើគ្នា",
        "ខ. $pH < 7$ (អាស៊ីត) ព្រោះអាស៊ីតខ្សោយមានឥទ្ធិពលខ្លាំងជាង",
        "គ. $pH > 7$ (បាស) ព្រោះកើតមានអ៊ីយ៉ុង $CH_3COO^-$ ដែលរងអ៊ីដ្រូលីសផ្តល់ $OH^-$",
        "ឃ. $pH = 13$ ព្រោះលើសកំហាប់ $NaOH$ ខ្លាំង",
      ],
      correct:
        "គ. $pH > 7$ (បាស) ព្រោះកើតមានអ៊ីយ៉ុង $CH_3COO^-$ ដែលរងអ៊ីដ្រូលីសផ្តល់ $OH^-$",
      difficulty: "hard",
      explanation:
        "នៅចំណុចសមមូល អាស៊ីតនិងបាសប្រតិកម្មអស់ទាំងស្រុង ក្លាយជាអំបិល $CH_3COONa$។ អ៊ីយ៉ុងអេតាណូអាត $CH_3COO^-$ ជាបាសឆ្លាស់នៃអាស៊ីតខ្សោយ វារងអ៊ីដ្រូលីសក្នុងទឹកតាមសមីការ៖ $CH_3COO^- + H_2O \\rightleftharpoons CH_3COOH + OH^-$ ធ្វើឱ្យសូលុយស្យុងនៅចំណុចសមមូលមានលក្ខណៈជាបាស ($pH \\approx 8.7$ ទៅ $9.0$)។",
    },
    {
      q: {
        en: "For the gas equilibrium $N_2O_4(g) \\rightleftharpoons 2NO_2(g)$ at $T = 300\\text{ K}$, what is the relationship between $K_p$ and $K_c$? (where $R$ is the ideal gas constant)",
        km: "ចំពោះប្រតិកម្មលំនឹងឧស្ម័ន៖ $N_2O_4(g) \\rightleftharpoons 2NO_2(g)$ នៅសីតុណ្ហភាព $T = 300\\text{ K}$។ តើទំនាក់ទំនងត្រឹមត្រូវរវាង $K_p$ និង $K_c$ គឺជាអ្វី? (ដែល $R$ ជាថេរឧស្ម័នបរិសុទ្ធ)",
      },
      options: [
        "ក. $K_p = K_c(RT)$",
        "ខ. $K_p = K_c$",
        "គ. $K_p = K_c(RT)^{-1}$",
        "ឃ. $K_p = K_c(RT)^2$",
      ],
      correct: "ក. $K_p = K_c(RT)$",
      difficulty: "hard",
      explanation:
        "រូបមន្តទំនាក់ទំនងទូទៅ៖ $K_p = K_c(RT)^{\\Delta n}$ ដែល $\\Delta n = n_{\\text{products}} - n_{\\text{reactants}}$ (ផលដកចំនួនម៉ូលឧស្ម័នកើត និងឧស្ម័នប្រតិករ)។ នៅទីនេះ $\\Delta n = 2 - 1 = 1$ នាំឱ្យ $K_p = K_c(RT)^1 = K_c(RT)$។",
    },
    {
      q: {
        en: "In a $1\\text{ L}$ closed vessel, $0.4\\text{ mol}$ of $HI$ gas is placed at constant temperature. Equilibrium forms via: $2HI(g) \\rightleftharpoons H_2(g) + I_2(g)$. At equilibrium, $0.05\\text{ mol}$ of $I_2$ is present. Calculate the equilibrium constant $K_c$:",
        km: "ក្នុងធុងបិទជិតមាឌ $1\\text{ L}$ មួយ គេដាក់ឧស្ម័ន $HI$ ចំនួន $0.4\\text{ mol}$ នៅសីតុណ្ហភាពថេរមួយ។ លំនឹងកើតមានឡើងតាមសមីការ៖ $2HI(g) \\rightleftharpoons H_2(g) + I_2(g)$។ នៅពេលប្រព័ន្ធឈានដល់លំនឹង គេឃើញមានឧស្ម័ន $I_2$ កើតឡើងចំនួន $0.05\\text{ mol}$។ គណនាតម្លៃថេរលំនឹង $K_c$ នៃប្រតិកម្មនេះ៖",
      },
      options: [
        "ក. $\\frac{1}{16}$",
        "ខ. $\\frac{1}{64}$",
        "គ. $0.25$",
        "ឃ. $\\frac{1}{36}$",
      ],
      correct: "ឃ. $\\frac{1}{36}$",
      difficulty: "hard",
      explanation:
        "តារាងបំរែបំរួលម៉ូលក្នុងមាឌ $1\\text{ L}$ ($[ ] = n$)៖ ពេលដើម៖ $[HI]_0 = 0.4\\text{ M}, [H_2]_0 = 0, [I_2]_0 = 0$។ ពេលប្រតិកម្ម៖ បង្កើតបាន $[I_2] = 0.05\\text{ M} \\implies [H_2] = 0.05\\text{ M}$ និងបាត់បង់ $[HI] = 2 \\times 0.05 = 0.1\\text{ M}$។ ពេលលំនឹង៖ $[HI]_{eq} = 0.4 - 0.1 = 0.3\\text{ M}$, $[H_2]_{eq} = 0.05\\text{ M}$, $[I_2]_{eq} = 0.05\\text{ M}$។ $K_c = \\frac{[H_2][I_2]}{[HI]^2} = \\frac{0.05 \\times 0.05}{(0.3)^2} = \\frac{0.0025}{0.09} = \\frac{25}{900} = \\frac{1}{36}$។",
    },
    {
      q: {
        en: "Reaction between $1\\text{ mol}$ of $CH_3COOH$ and $1\\text{ mol}$ of $C_2H_5OH$ reaches equilibrium producing $\\frac{2}{3}\\text{ mol}$ of ester. If initial ethanol is increased to $3\\text{ mol}$ with $1\\text{ mol}$ acid, what is the new equilibrium ester yield?",
        km: "គេឱ្យអាស៊ីតអេតាណូអ៊ិច ($CH_3COOH$) ចំនួន $1\\text{ mol}$ ធ្វើប្រតិកម្មជាមួយអេតាណុល ($C_2H_5OH$) ចំនួន $1\\text{ mol}$ ដោយមានកាតាលីករអាស៊ីត។ នៅពេលលំនឹង គេទទួលបានអេស្ទែចំនួន $\\frac{2}{3}\\text{ mol}$។ ប្រសិនបើគេបង្កើនបរិមាណអេតាណុលដើមរហូតដល់ $3\\text{ mol}$ (ដោយរក្សាអាស៊ីត $1\\text{ mol}$ ដដែល) តើចំនួនម៉ូលអេស្ទែកើតឡើងនៅពេលលំនឹងថ្មីមានតម្លៃប្រហែលប៉ុន្មាន?",
      },
      options: [
        "ក. $0.67\\text{ mol}$",
        "ខ. $0.90\\text{ mol}$",
        "គ. $1.00\\text{ mol}$",
        "ឃ. $1.50\\text{ mol}$",
      ],
      correct: "ខ. $0.90\\text{ mol}$",
      difficulty: "hard",
      explanation:
        "ជំហានទី 1 (រក $K$ នៃអេស្ទែកម្ម)៖ $CH_3COOH + C_2H_5OH \\rightleftharpoons CH_3COOC_2H_5 + H_2O$។ នៅលំនឹងដើម៖ $n_{\\text{ester}} = n_{\\text{water}} = \\frac{2}{3}\\text{ mol}$, $n_{\\text{acid}} = n_{\\text{alc}} = 1 - \\frac{2}{3} = \\frac{1}{3}\\text{ mol} \\implies K = \\frac{(\\frac{2}{3})(\\frac{2}{3})}{(\\frac{1}{3})(\\frac{1}{3})} = 4$។ ជំហានទី 2 (លំនឹងថ្មីដែលមាន $1\\text{ mol}$ អាស៊ីត និង $3\\text{ mol}$ អាល់កុល)៖ តាង $x$ ជាចំនួនម៉ូលអេស្ទែកើតឡើង៖ $K = \\frac{x^2}{(1 - x)(3 - x)} = 4 \\implies x^2 = 4(x^2 - 4x + 3) \\implies 3x^2 - 16x + 12 = 0$។ ដោះស្រាយសមីការដឺក្រេទី 2 (យក $x < 1$) នាំឱ្យបាន $x \\approx 0.90\\text{ mol}$។",
    },
    {
      q: {
        en: "Saponification of $0.02\\text{ mol}$ of a simple triglyceride with excess $NaOH$ yields $18.36\\text{ g}$ of sodium carboxylate soap. Calculate the molar mass of the constituent fatty acid ($Na = 23, O = 16, C = 12, H = 1$):",
        km: "គេធ្វើសាពូនកម្មលើទ្រីគ្លីសេរីតសាមញ្ញមួយប្រភេទ (បង្កើតឡើងពីគ្លីសេរ៉ូល និងអាស៊ីតខ្លាញ់តែមួយប្រភេទ) ចំនួន $0.02\\text{ mol}$ ដោយប្រើសូលុយស្យុង $NaOH$ លើស។ បន្ទាប់ពីប្រតិកម្មចប់សព្វគ្រប់ គេទទួលបានអំបិលសូដ្យូមការបុកស៊ីឡាត (សាប៊ូ) ទម្ងន់សរុប $18.36\\text{ g}$។ គណនាម៉ាសម៉ូលនៃអាស៊ីតខ្លាញ់ដែលបង្កើតទ្រីគ្លីសេរីតនោះ (គេឱ្យ $Na = 23, O = 16, C = 12, H = 1$)៖",
      },
      options: [
        "ក. $256\\text{ g/mol}$",
        "ខ. $282\\text{ g/mol}$",
        "គ. $284\\text{ g/mol}$",
        "ឃ. $304\\text{ g/mol}$",
      ],
      correct: "គ. $284\\text{ g/mol}$",
      difficulty: "hard",
      explanation:
        "ទ្រីគ្លីសេរីត 1 ម៉ូល ផ្តល់អំបិលសាប៊ូ $R-COONa$ ចំនួន 3 ម៉ូល (ចំនួនម៉ូលសាប៊ូ $n = 3 \\times n_{\\text{triglyceride}} = 3 \\times 0.02 = 0.06\\text{ mol}$)។ ម៉ាសម៉ូលនៃអំបិលសាប៊ូ៖ $M(R-COONa) = \\frac{m}{n} = \\frac{18.36}{0.06} = 306\\text{ g/mol}$។ ទំនាក់ទំនងរវាងម៉ាសម៉ូលអាស៊ីតខ្លាញ់ ($R-COOH$) និងអំបិល ($R-COONa$)៖ $M(R-COOH) = M(R-COONa) - M(Na) + M(H) = 306 - 23 + 1 = 284\\text{ g/mol}$ (ត្រូវនឹងអាស៊ីតស្តេអារិច $C_{17}H_{35}COOH$)។",
    },
    {
      q: {
        en: "Alanine has two acid-base equilibrium stages with $pK_{a1} = 2.34$ ($-\\text{COOH}$) and $pK_{a2} = 9.69$ ($-\\text{NH}_3^+$). What is its isoelectric point ($pI$), and what ionic form dominates at that $pH$?",
        km: "អាស៊ីតអាមីណេ អាឡានីន (Alanine) មានសមីការលំនឹងនៃការបែកជាអ៊ីយ៉ុងពីរដំណាក់កាលជាមួយតម្លៃ $pK_{a1} = 2.34$ (នៃបង្គុំ $-\\text{COOH}$) និង $pK_{a2} = 9.69$ (នៃបង្គុំ $-\\text{NH}_3^+$)។ តើតម្លៃចំណុចអ៊ីសូអគ្គិសនី (Isoelectric point, $pI$) របស់អាឡានីនស្មើនឹងប៉ុន្មាន ហើយនៅកម្រិត $pH$ នោះ អាឡានីនស្ថិតក្នុងទម្រង់ជាអ៊ីយ៉ុងបែបណា?",
      },
      options: [
        "ក. $pI = 6.02$ និងស្ថិតក្នុងទម្រង់ជាស្វ៊ីទែរីយ៉ុង (Zwitterion / អ៊ីយ៉ុងឌីប៉ូល)",
        "ខ. $pI = 7.00$ និងស្ថិតក្នុងទម្រង់ជាកាចុងសុទ្ធ ($+$)",
        "គ. $pI = 6.02$ និងស្ថិតក្នុងទម្រង់ជាអានីយ៉ុងសុទ្ធ ($-$)",
        "ឃ. $pI = 12.03$ និងគ្មានបន្ទុកអគ្គិសនីទាំងស្រុង",
      ],
      correct:
        "ក. $pI = 6.02$ និងស្ថិតក្នុងទម្រង់ជាស្វ៊ីទែរីយ៉ុង (Zwitterion / អ៊ីយ៉ុងឌីប៉ូល)",
      difficulty: "hard",
      explanation:
        "ចំពោះអាស៊ីតអាមីណេធម្មតា (គ្មានបង្គុំអ៊ីយ៉ូដកម្មនៅលើខ្សែខ្នែង)៖ $pI = \\frac{pK_{a1} + pK_{a2}}{2} = \\frac{2.34 + 9.69}{2} = \\frac{12.03}{2} = 6.015 \\approx 6.02$។ ត្រង់ចំណុច $pI$ ម៉ូលេគុលអាស៊ីតអាមីណេមានបន្ទុកបូកសរុបស្មើនឹងសូន្យ ដោយសារវាស្ថិតក្នុងទម្រង់ជា «ស្វ៊ីទែរីយ៉ុង» ($H_3N^+-CH(R)-COO^-$) ដែលមានបន្ទុកវិជ្ជមានលើ $-NH_3^+$ និងបន្ទុកអវិជ្ជមានលើ $-COO^-$ ក្នុងពេលតែមួយ។",
    },
  ],
  biology: [
    // ---------------------------------------------------------
    // BIOLOGY BASIC (EASY) - 10 Questions
    // Focus: Gymnosperms, Nervous System, Sensory Organs,
    // Endocrine Glands, Proteins & Enzymes
    // ---------------------------------------------------------
    {
      q: {
        en: "What is the defining characteristic of Gymnosperms (e.g. pine trees)?",
        km: "តើលក្ខណៈសំគាល់ចម្បងនៃរុក្ខជាតិស៊ីមណូស្ពែម (Gymnosperms ដូចជាស្រល់) គឺជាអ្វី?",
      },
      options: [
        "ក. រុក្ខជាតិមានផ្កា និងមានផ្លែរុំការពារគ្រាប់",
        "ខ. រុក្ខជាតិគ្មានផ្កា និងមានគ្រាប់អាក្រាតនៅលើស្រកាកោន",
        "គ. រុក្ខជាតិគ្មានសរសៃនាំ និងបន្តពូជដោយស្ប៉",
        "ឃ. រុក្ខជាតិគ្មានឫសពិតប្រាកដ និងរស់នៅតែក្នុងទឹក",
      ],
      correct: "ខ. រុក្ខជាតិគ្មានផ្កា និងមានគ្រាប់អាក្រាតនៅលើស្រកាកោន",
      difficulty: "easy",
      explanation:
        "រុក្ខជាតិស៊ីមណូស្ពែម (Gymnosperms) មកពីពាក្យក្រិច Gymnos (អាក្រាត) + Sperma (គ្រាប់) គឺជាប្រភេទរុក្ខជាតិដែលមានគ្រាប់អាក្រាតនៅលើស្រកាកោន (ដូចជាដើមស្រល់) ដោយពុំមានផ្លែ ឬអូវែរុំការពារគ្រាប់ដូចរុក្ខជាតិអង់ស្យូស្ពែមឡើយ។",
    },
    {
      q: {
        en: "Which three main parts constitute a typical neuron?",
        km: "តើណឺរ៉ូនមួយមានសមាសភាគសំខាន់ 3 ផ្នែកអ្វីខ្លះ?",
      },
      options: [
        "ក. តួកោសិកា ដង់ឌ្រីត និងអាក់សូន",
        "ខ. ស៊ីណាប់ មីយេលីន និងណ្វៃយ៉ូ",
        "គ. កោសិកាកោន កោសិកាកំពូល និងអាក់សូន",
        "ឃ. អង្គប្រដាប់ហ្គោលជី រីបូសូម និងដង់ឌ្រីត",
      ],
      correct: "ក. តួកោសិកា ដង់ឌ្រីត និងអាក់សូន",
      difficulty: "easy",
      explanation:
        "ណឺរ៉ូន (កោសិកាប្រសាទ) នីមួយៗផ្សំឡើងពី 3 ផ្នែកសំខាន់គឺ៖ តួកោសិកា (Soma/Cell body) ដែលផ្ទុកណ្វៃយ៉ូ, ដង់ឌ្រីត (Dendrites) ទទួលព័ត៌មាន, និងអាក់សូន (Axon) បញ្ជូនអាំងភ្លុចប្រសាទចេញពីតួកោសិកា។",
    },
    {
      q: {
        en: "What is the specialized junction between two neurons or between a neuron and an effector cell called?",
        km: "តើកន្លែងតភ្ជាប់រវាងណឺរ៉ូនពីរ ឬរវាងណឺរ៉ូននិងកោសិកាគោលដៅ ហៅថាអ្វី?",
      },
      options: [
        "ក. កោសិកាហ្គ្លីយ៉ាល់ (Glial cell)",
        "ខ. ស្រោមមីយេលីន (Myelin sheath)",
        "គ. ស៊ីណាប់ (Synapse)",
        "ឃ. ថ្នាំងរ៉ង់វីយេ (Node of Ranvier)",
      ],
      correct: "គ. ស៊ីណាប់ (Synapse)",
      difficulty: "easy",
      explanation:
        "ស៊ីណាប់ (Synapse) គឺជាទីតាំងចន្លោះតភ្ជាប់ពិសេសរវាងចុងអាក់សូននៃណឺរ៉ូនមួយ ទៅកាន់ដង់ឌ្រីត ឬតួកោសិកានៃណឺរ៉ូនមួយទៀត (ឬកោសិកាសាច់ដុំ/ក្រពេញ) ដោយការបញ្ជូនព័ត៌មានឆ្លងកាត់តាមរយៈសារធាតុបញ្ជូនសរសៃប្រសាទ (Neurotransmitters)។",
    },
    {
      q: {
        en: "Which photoreceptor cells in the human retina are responsible for daytime color vision?",
        km: "នៅក្នុងរេទីននៃភ្នែកមនុស្ស តើកោសិការងទទួលពន្លឺប្រភេទណាដែលមាននាទីទទួលដឹងពណ៌ និងមើលឃើញច្បាស់ក្នុងពន្លឺថ្ងៃ?",
      },
      options: [
        "ក. កោសិកាកំពូល (Rods)",
        "ខ. កោសិកាកែវភ្នែក (Lens cells)",
        "គ. កោសិកាស្ក្លេរ៉ូទិច (Sclera)",
        "ឃ. កោសិកាកោន (Cones)",
      ],
      correct: "ឃ. កោសិកាកោន (Cones)",
      difficulty: "easy",
      explanation:
        "រេទីនមានកោសិការងទទួលពន្លឺពីរប្រភេទ៖ កោសិកាកោន (Cones) មាននាទីមើលឃើញពណ៌ និងរូបភាពច្បាស់នៅពេលមានពន្លឺគ្រប់គ្រាន់ (ពន្លឺថ្ងៃ), រីឯកោសិកាកំពូល (Rods) ជួយឱ្យមើលឃើញក្នុងពន្លឺខ្សោយ (ពេលយប់) តែមិនអាចបែងចែកពណ៌បានឡើយ។",
    },
    {
      q: {
        en: "Which part of the inner ear is directly responsible for maintaining dynamic balance and detecting head rotation?",
        km: "តើផ្នែកណានៃត្រចៀកក្នុងដែលមាននាទីរក្សាលំនឹងរាងកាយ និងដឹងពីចលនារង្វិលនៃក្បាល?",
      },
      options: [
        "ក. ប្រដាប់វិលកងបី (Semicircular canals)",
        "ខ. ខ្យងត្រចៀក (Cochlea)",
        "គ. ក្រដាសត្រចៀក (Tympanic membrane)",
        "ឃ. ឆ្អឹងញញួរ (Malleus)",
      ],
      correct: "ក. ប្រដាប់វិលកងបី (Semicircular canals)",
      difficulty: "easy",
      explanation:
        "ប្រដាប់វិលកងបី (Semicircular canals) ក្នុងត្រចៀកក្នុង ផ្ទុកសារធាតុរាវ និងកោសិកាវិញ្ញាណរោម ដែលរំញោចពេលក្បាលធ្វើចលនារង្វិល ដើម្បីបញ្ជូនព័ត៌មានទៅខួរក្បាលជួយរក្សាលំនឹងឌីណាមិច។ ចំណែកខ្យងត្រចៀក (Cochlea) មាននាទីសម្រាប់ការឮសូរ។",
    },
    {
      q: {
        en: "Which endocrine gland is known as the 'master gland' because it regulates many other endocrine glands?",
        km: "តើក្រពេញអង់ដូគ្រីនមួយណាដែលត្រូវបានគេប្រសិទ្ធនាមថា «ក្រពេញមេ» ដោយសារវាផលិតអរម៉ូនត្រួតពិនិត្យដំណើរការក្រពេញដទៃទៀតស្ទើរតែទាំងអស់?",
      },
      options: [
        "ក. ក្រពេញទីរ៉ូអ៊ីត (Thyroid gland)",
        "ខ. ក្រពេញលើតម្រងនោម (Adrenal gland)",
        "គ. ក្រពេញលំពែង (Pancreas)",
        "ឃ. ក្រពេញអ៊ីប៉ូភីស (Pituitary gland)",
      ],
      correct: "ឃ. ក្រពេញអ៊ីប៉ូភីស (Pituitary gland)",
      difficulty: "easy",
      explanation:
        "ក្រពេញអ៊ីប៉ូភីស (Pituitary gland) ស្ថិតនៅក្រោមការបញ្ជារបស់អ៊ីប៉ូតាឡាមុស និងត្រូវបានគេហៅថា «ក្រពេញមេ» ព្រោះវាបញ្ចេញអរម៉ូនជាច្រើន (ដូចជា TSH, ACTH, FSH, LH...) ទៅភ្ញោច និងគ្រប់គ្រងសកម្មភាពនៃក្រពេញអង់ដូគ្រីនដទៃទៀតក្នុងរាងកាយ។",
    },
    {
      q: {
        en: "Which hormone is secreted by the pancreas to lower blood glucose levels when they rise above normal?",
        km: "នៅពេលកំហាប់គ្លុយកូសក្នុងឈាមឡើងខ្ពស់ តើលំពែងបញ្ចេញអរម៉ូនអ្វីដើម្បីបញ្ចុះជាតិស្ករមកកម្រិតធម្មតាវិញ?",
      },
      options: [
        "ក. អរម៉ូនគ្លុយកាកុង (Glucagon)",
        "ខ. អរម៉ូនអាំងស៊ុយលីន (Insulin)",
        "គ. អរម៉ូនអាដ្រេណាលីន (Adrenaline)",
        "ឃ. អរម៉ូនទីរ៉ុកស៊ីន (Thyroxine)",
      ],
      correct: "ខ. អរម៉ូនអាំងស៊ុយលីន (Insulin)",
      difficulty: "easy",
      explanation:
        "កោសិកាបេតា ($\\beta$) នៃកោះឡង់ស៊ែរហង់ក្នុងលំពែងបញ្ចេញ «អាំងស៊ុយលីន» ដើម្បីជម្រុញកោសិកាស្រូបយកគ្លុយកូស និងថ្លើម/សាច់ដុំបំប្លែងគ្លុយកូសទៅជាគ្លីកូសែន ដែលជួយបញ្ចុះជាតិស្ករក្នុងឈាមមកកម្រិតធម្មតា (ប្រហែល 1 g/L)។",
    },
    {
      q: {
        en: "What are the fundamental building blocks (monomers) of proteins?",
        km: "តើឯកតាសំណង់គ្រឹះ (ម៉ូណូមែ) នៃម៉ូលេគុលប្រូតេអ៊ីនគឺជាអ្វី?",
      },
      options: [
        "ក. អាស៊ីតអាមីណូ (Amino acids)",
        "ខ. គ្លុយកូស (Glucose)",
        "គ. អាស៊ីតខ្លាញ់ និងគ្លីសេរ៉ុល (Fatty acids & glycerol)",
        "ឃ. នុយក្លេអូទីត (Nucleotides)",
      ],
      correct: "ក. អាស៊ីតអាមីណូ (Amino acids)",
      difficulty: "easy",
      explanation:
        "ប្រូតេអ៊ីនជាប៉ូលីមែជីវៈដែលកើតឡើងពីការតម្រៀបភ្ជាប់គ្នានៃម៉ូណូមែហៅថា «អាស៊ីតអាមីណូ» (Amino acids)។ ក្នុងភាវៈរស់មានអាស៊ីតអាមីណូគ្រឹះចំនួន 20 ប្រភេទខុសៗគ្នាដែលចូលរួមបង្កើតប្រូតេអ៊ីន។",
    },
    {
      q: {
        en: "What type of chemical bond links amino acids together to form the primary structure of a protein?",
        km: "តើចំណងគីមីប្រភេទណាដែលភ្ជាប់អាស៊ីតអាមីណូមួយទៅអាស៊ីតអាមីណូមួយទៀត ដើម្បីបង្កើតជាទម្រង់ទី 1 នៃប្រូតេអ៊ីន?",
      },
      options: [
        "ក. ចំណងអ៊ីដ្រូសែន (Hydrogen bond)",
        "ខ. ចំណងអ៊ីយ៉ុង (Ionic bond)",
        "គ. ចំណងប៉ិបទីត (Peptide bond)",
        "ឃ. ចំណងផូស្វ័រឌីអែស្ទែ (Phosphodiester bond)",
      ],
      correct: "គ. ចំណងប៉ិបទីត (Peptide bond)",
      difficulty: "easy",
      explanation:
        "ចំណងប៉ិបទីត (Peptide bond) ជាចំណងកូវ៉ាឡង់កកើតឡើងរវាងបង្គុំកាបុកស៊ីល (-\\text{COOH}) នៃអាស៊ីតអាមីណូមួយ ជាមួយបង្គុំអាមីន (-\\text{NH}_2) នៃអាស៊ីតអាមីណូបន្ទាប់ ដោយការបាត់បង់ម៉ូលេគុលទឹក 1 ($H_2O$)។ វាជាចំណងគ្រឹះនៃទម្រង់ទី 1 (Primary structure)។",
    },
    {
      q: {
        en: "What is the biological function of enzymes in living organisms?",
        km: "តើអង់ស៊ីមមាននាទីជីវសាស្ត្រចម្បងអ្វីខ្លះនៅក្នុងសារពាង្គកាយមានជីវិត?",
      },
      options: [
        "ក. ជាប្រភពថាមពលបម្រុងចម្បងជំនួសខ្លាញ់ និងកាបូអ៊ីដ្រាត",
        "ខ. ជាអង្គធាតុដែលបំផ្លាញរចនាសម្ព័ន្ធកោសិកាទាំងអស់",
        "គ. ជាកាតាលីករជីវៈដែលជួយពន្លឿនល្បឿនប្រតិកម្មគីមីជីវៈ ដោយបន្ថយថាមពលសកម្មកម្ម",
        "ឃ. ជាអ្នកផ្ទុកព័ត៌មានសេនេទិចជំនួស ADN",
      ],
      correct:
        "គ. ជាកាតាលីករជីវៈដែលជួយពន្លឿនល្បឿនប្រតិកម្មគីមីជីវៈ ដោយបន្ថយថាមពលសកម្មកម្ម",
      difficulty: "easy",
      explanation:
        "អង់ស៊ីមគឺជាកាតាលីករជីវៈ (Biological catalysts) ដែលភាគច្រើនលើសលប់ជាប្រូតេអ៊ីន។ វាជួយពន្លឿនល្បឿនប្រតិកម្មគីមីជីវៈក្នុងកោសិកាឱ្យប្រព្រឹត្តទៅបានលឿនជាងធម្មតារាប់លានដង ដោយការបញ្ចុះថាមពលសកម្មកម្ម (Activation energy) នៃប្រតិកម្ម។",
    },
    // ---------------------------------------------------------
    // BIOLOGY MEDIUM - 10 Questions
    // Focus: Monocots vs Dicots, Stomata Mechanism, Tropisms & Auxin,
    // Reflex Arc, Autonomic System, Eye Accommodation, Calcium Homeostasis,
    // Hormone Mechanism, Protein Structure, Enzyme Denaturation
    // ---------------------------------------------------------
    {
      q: {
        en: "នៅពេលគេកាត់ទទឹងដើមនៃរុក្ខជាតិអង់ស្យូស្ពែមមួយប្រភេទ គេសង្កេតឃើញថា «បាច់សរសៃនាំ (ស៊ីឡែម និងផ្លូអែម) រៀបចំជារង្វង់មូលយ៉ាងមានរបៀប» ហើយស្លឹករបស់វាមាន «ទ្រនុងបែកខ្នែងដូចសំណាញ់»។ តើរុក្ខជាតិនេះជាប្រភេទអ្វី ហើយមានលក្ខណៈគ្រាប់ និងប្រព័ន្ធឫសបែបណា?",
        km: "នៅពេលគេកាត់ទទឹងដើមនៃរុក្ខជាតិអង់ស្យូស្ពែមមួយប្រភេទ គេសង្កេតឃើញថា «បាច់សរសៃនាំ (ស៊ីឡែម និងផ្លូអែម) រៀបចំជារង្វង់មូលយ៉ាងមានរបៀប» ហើយស្លឹករបស់វាមាន «ទ្រនុងបែកខ្នែងដូចសំណាញ់»។ តើរុក្ខជាតិនេះជាប្រភេទអ្វី ហើយមានលក្ខណៈគ្រាប់ និងប្រព័ន្ធឫសបែបណា?",
      },
      options: [
        "ក. ម៉ូណូកូទីលេដូន, មានកូទីលេដុង 1 និងប្រព័ន្ធឫសស្ញែ",
        "ខ. ឌីកូទីលេដូន, មានកូទីលេដុង 2 និងប្រព័ន្ធឫសកែវ",
        "គ. ម៉ូណូកូទីលេដូន, មានកូទីលេដុង 2 និងប្រព័ន្ធឫសកែវ",
        "ឃ. ស៊ីមណូស្ពែម, គ្មានកូទីលេដុង និងមានឫសព្រយោង",
      ],
      correct: "ខ. ឌីកូទីលេដូន, មានកូទីលេដុង 2 និងប្រព័ន្ធឫសកែវ",
      difficulty: "medium",
      explanation:
        "រុក្ខជាតិឌីកូទីលេដូន (Dicots) មានលក្ខណៈសម្គាល់គឺ៖ បាច់សរសៃនាំក្នុងដើមរៀបចំជារង្វង់មូល, ស្លឹកមានទ្រនុងបែកខ្នែង, គ្រាប់មានកូទីលេដុង 2, និងមានប្រព័ន្ធឫសកែវ (ឫសមេមួយចាក់ជ្រៅ)។ រីឯម៉ូណូកូទីលេដូន (Monocots) មានបាច់សរសៃនាំរាយប៉ាយ, ស្លឹកទ្រនុងស្រប, កូទីលេដុង 1 និងឫសស្ញែ។",
    },
    {
      q: {
        en: "តើយន្តការកោសិកាមួយណាដែលបណ្តាលឱ្យ «រន្ធស្ទូម៉ាតនៃស្លឹករុក្ខជាតិបើក» នៅពេលព្រឹកដែលមានពន្លឺព្រះអាទិត្យ?",
        km: "តើយន្តការកោសិកាមួយណាដែលបណ្តាលឱ្យ «រន្ធស្ទូម៉ាតនៃស្លឹករុក្ខជាតិបើក» នៅពេលព្រឹកដែលមានពន្លឺព្រះអាទិត្យ?",
      },
      options: [
        "ក. អ៊ីយ៉ុង $K^+$ ចាកចេញពីកោសិកាឈ្លាត ធ្វើឱ្យទឹកហូរចេញតាមអូស្មូស ហើយកោសិកាស្រពោន",
        "ខ. ជាតិស្ករស៊ុយក្រូសត្រូវបានបំប្លែងជាម្សៅទាំងស្រុង ធ្វើឱ្យសម្ពាធអូស្មូសក្នុងកោសិកាឈ្លាតថយចុះ",
        "គ. អ៊ីយ៉ុង $K^+$ ហូរចូលក្នុងកោសិកាឈ្លាត ធ្វើឱ្យទឹកហូរចូលតាមអូស្មូស កោសិកាឡើងប៉ោង ហើយរន្ធស្ទូម៉ាតបើក",
        "ឃ. អាស៊ីតអាប់ស៊ីស៊ីស (ABA) ត្រូវបានផលិតឡើងយ៉ាងច្រើនដើម្បីរារាំងការស្រូបទឹករបស់កោសិកាឈ្លាត",
      ],
      correct:
        "គ. អ៊ីយ៉ុង $K^+$ ហូរចូលក្នុងកោសិកាឈ្លាត ធ្វើឱ្យទឹកហូរចូលតាមអូស្មូស កោសិកាឡើងប៉ោង ហើយរន្ធស្ទូម៉ាតបើក",
      difficulty: "medium",
      explanation:
        "នៅពេលមានពន្លឺថ្ងៃ កោសិកាឈ្លាត (Guard cells) បូមអ៊ីយ៉ុង $K^+$ ចូលទៅខាងក្នុង បង្កើនកំហាប់សូលុយស្យុងខាងក្នុងកោសិកា នាំឱ្យទឹកហូរចូលតាមដំណើរអូស្មូស។ កោសិកាឈ្លាតឡើងប៉ោង (Turgid) ដោយសារជញ្ជាំងខាងក្នុងក្រាស់ជាងជញ្ជាំងខាងក្រៅ ទើបវាទាញរន្ធស្ទូម៉ាតឱ្យបើកចំហ។",
    },
    {
      q: {
        en: "នៅពេលពន្លឺព្រះអាទិត្យចាំងមកលើពន្លកកំពូលនៃរុក្ខជាតិពីទិសតែមួយ (ពន្លឺឯកទិស) តើព្រឹត្តិការណ៍អ្វីកើតឡើងចំពោះអរម៉ូនអុកស៊ីន (Auxin) ដែលបណ្តាលឱ្យចុងពន្លកបែនកោងទៅរកពន្លឺ?",
        km: "នៅពេលពន្លឺព្រះអាទិត្យចាំងមកលើពន្លកកំពូលនៃរុក្ខជាតិពីទិសតែមួយ (ពន្លឺឯកទិស) តើព្រឹត្តិការណ៍អ្វីកើតឡើងចំពោះអរម៉ូនអុកស៊ីន (Auxin) ដែលបណ្តាលឱ្យចុងពន្លកបែនកោងទៅរកពន្លឺ?",
      },
      options: [
        "ក. អុកស៊ីនត្រូវពន្លឺបំផ្លាញចោលនៅគ្រប់ផ្នែកទាំងអស់នៃពន្លក",
        "ខ. អុកស៊ីនផ្លាស់ទីទៅប្រមូលផ្តុំនៅចំហៀងស្រមោល (ងងឹត) ជំរុញឱ្យកោសិកាចំហៀងនោះលូតវែងលឿនជាងចំហៀងត្រូវពន្លឺ",
        "គ. អុកស៊ីនប្រមូលផ្តុំនៅចំហៀងត្រូវពន្លឺ ដើម្បីរារាំងការលូតលាស់នៃកោសិកាចំហៀងងងឹត",
        "ឃ. អុកស៊ីនជំរុញឱ្យកោសិកាចំហៀងត្រូវពន្លឺធ្វើចំណែកកោសិកាលឿនជាងទ្វេដង",
      ],
      correct:
        "ខ. អុកស៊ីនផ្លាស់ទីទៅប្រមូលផ្តុំនៅចំហៀងស្រមោល (ងងឹត) ជំរុញឱ្យកោសិកាចំហៀងនោះលូតវែងលឿនជាងចំហៀងត្រូវពន្លឺ",
      difficulty: "medium",
      explanation:
        "ក្រោមឥទ្ធិពលពន្លឺឯកទិស អុកស៊ីន (IAA) ធ្វើដំណើរចេញពីចំហៀងត្រូវពន្លឺ ទៅប្រមូលផ្តុំនៅចំហៀងស្រមោល (ចំហៀងងងឹត)។ កំហាប់អុកស៊ីនខ្ពស់នៅចំហៀងស្រមោលជំរុញឱ្យកោសិកានៅទីនោះលូតវែងលឿនជាងចំហៀងត្រូវពន្លឺ ជាហេតុធ្វើឱ្យពន្លកកោងបែនឆ្ពោះទៅរកពន្លឺ (រស្មីទំរោទិសវិជ្ជមាន)។",
    },
    {
      q: {
        en: "នៅពេលដៃយើងប៉ះនឹងវត្ថុក្តៅភ្លាម យើងដកដៃថយវិញដោយស្វ័យប្រវត្តិតាមរយៈ «ធ្នូរ៉េផ្លិច (Reflex arc)»។ តើតំណាក់កាល និងលំដាប់លំដោយនៃការបញ្ជូនព័ត៌មានក្នុងធ្នូរ៉េផ្លិចប្រព្រឹត្តទៅដូចម្តេច?",
        km: "នៅពេលដៃយើងប៉ះនឹងវត្ថុក្តៅភ្លាម យើងដកដៃថយវិញដោយស្វ័យប្រវត្តិតាមរយៈ «ធ្នូរ៉េផ្លិច (Reflex arc)»។ តើតំណាក់កាល និងលំដាប់លំដោយនៃការបញ្ជូនព័ត៌មានក្នុងធ្នូរ៉េផ្លិចប្រព្រឹត្តទៅដូចម្តេច?",
      },
      options: [
        "ក. ទួលវិញ្ញាណ $\\rightarrow$ ណឺរ៉ូនចលករ $\\rightarrow$ ខួរក្បាល $\\rightarrow$ ណឺរ៉ូនវិញ្ញាណនាំ $\\rightarrow$ សរីរាង្គប្រតិកម្ម",
        "ខ. សរីរាង្គប្រតិកម្ម $\\rightarrow$ ណឺរ៉ូនវិញ្ញាណនាំ $\\rightarrow$ អន្តរណឺរ៉ូន $\\rightarrow$ ណឺរ៉ូនចលករ $\\rightarrow$ ទួលវិញ្ញាណ",
        "គ. ទួលវិញ្ញាណ $\\rightarrow$ ណឺរ៉ូនវិញ្ញាណនាំ $\\rightarrow$ អន្តរណឺរ៉ូន (ក្នុងខួរឆ្អឹងខ្នង) $\\rightarrow$ ណឺរ៉ូនចលករ $\\rightarrow$ សរីរាង្គប្រតិកម្ម (សាច់ដុំ)",
        "ឃ. ណឺរ៉ូនវិញ្ញាណនាំ $\\rightarrow$ ទួលវិញ្ញាណ $\\rightarrow$ ខួរធំ $\\rightarrow$ សាច់ដុំ $\\rightarrow$ ណឺរ៉ូនចលករ",
      ],
      correct:
        "គ. ទួលវិញ្ញាណ $\\rightarrow$ ណឺរ៉ូនវិញ្ញាណនាំ $\\rightarrow$ អន្តរណឺរ៉ូន (ក្នុងខួរឆ្អឹងខ្នង) $\\rightarrow$ ណឺរ៉ូនចលករ $\\rightarrow$ សរីរាង្គប្រតិកម្ម (សាច់ដុំ)",
      difficulty: "medium",
      explanation:
        "ធ្នូរ៉េផ្លិចឆ្លងកាត់ 5 ដំណាក់កាលតាមលំដាប់៖ 1. ទួលវិញ្ញាណ (Receptor) ចាប់យករំញោចកម្តៅ $\\rightarrow$ 2. ណឺរ៉ូនវិញ្ញាណនាំ (Sensory neuron) ដឹកនាំអាំងភ្លុចទៅកាន់ខួរឆ្អឹងខ្នង $\\rightarrow$ 3. អន្តរណឺរ៉ូន (Interneuron) ក្នុងសារធាតុប្រផេះនៃខួរឆ្អឹងខ្នងសម្របសម្រួលបញ្ជា $\\rightarrow$ 4. ណឺរ៉ូនចលករ (Motor neuron) ដឹកនាំបញ្ជាចេញ $\\rightarrow$ 5. សរីរាង្គប្រតិកម្ម (Effector គឺសាច់ដុំដៃកន្ត្រាក់ដកថយភ្លាម) ដោយមិនចាំបាច់រង់ចាំការវិភាគពីខួរក្បាលឡើយ។",
    },
    {
      q: {
        en: "ក្នុងស្ថានភាពគ្រាអាសន្ន ឬពេលភ័យខ្លាចខ្លាំង (Fight-or-flight response) តើប្រព័ន្ធប្រសាទសាំប៉ាទិច (Sympathetic system) ធ្វើឱ្យមានបម្រែបម្រួលសរីរវិទ្យាដូចម្តេចខ្លះក្នុងរាងកាយ?",
        km: "ក្នុងស្ថានភាពគ្រាអាសន្ន ឬពេលភ័យខ្លាចខ្លាំង (Fight-or-flight response) តើប្រព័ន្ធប្រសាទសាំប៉ាទិច (Sympathetic system) ធ្វើឱ្យមានបម្រែបម្រួលសរីរវិទ្យាដូចម្តេចខ្លះក្នុងរាងកាយ?",
      },
      options: [
        "ក. ពង្រីកប្រស្រីភ្នែក, បង្កើនចង្វាក់បេះដូង, ពង្រីកទងសួត, និងបន្ថយសកម្មភាពរំលាយអាហារ",
        "ខ. បង្រួមប្រស្រីភ្នែក, បន្ថយចង្វាក់បេះដូង, និងបង្កើនការរំលាយអាហារ",
        "គ. បង្រួមទងសួត, បន្ថយសម្ពាធឈាម, និងជំរុញឱ្យថ្លើមស្តុកគ្លុយកូសជាគ្លីកូសែន",
        "ឃ. បង្កើនការបញ្ចេញទឹកមាត់, បង្រួមប្លោកនោម, និងបន្ថយកម្រិតជាតិស្ករក្នុងឈាម",
      ],
      correct:
        "ក. ពង្រីកប្រស្រីភ្នែក, បង្កើនចង្វាក់បេះដូង, ពង្រីកទងសួត, និងបន្ថយសកម្មភាពរំលាយអាហារ",
      difficulty: "medium",
      explanation:
        "ប្រព័ន្ធប្រសាទសាំប៉ាទិចសកម្មក្នុងគ្រាអាសន្ន (Fight or Flight) ដើម្បីរៀបចំរាងកាយទប់ទល់នឹងគ្រោះថ្នាក់៖ ពង្រីកប្រស្រីភ្នែក (មើលឃើញបានទូលាយ), បង្កើនចង្វាក់បេះដូង និងសម្ពាធឈាម, ពង្រីកទងសួត (ស្រូបអុកស៊ីសែនបានច្រើន), ថ្លើមបំបែកគ្លីកូសែនជាគ្លុយកូស, និងបន្ថយសកម្មភាពរំលាយអាហារក្នុងក្រពះពោះវៀនជាបណ្តោះអាសន្ន។",
    },
    {
      q: {
        en: "នៅពេលភ្នែកមនុស្សប្តូរពីការសម្លឹងមើលវត្ថុនៅឆ្ងាយ មកមើលអក្សរក្នុងសៀវភៅនៅជិត (ការសម្របតម្រូវ / Accommodation) តើសាច់ដុំអង្គស៊ីលីយែរ និងកែវភ្នែកមានបម្រែបម្រួលដូចម្តេច?",
        km: "នៅពេលភ្នែកមនុស្សប្តូរពីការសម្លឹងមើលវត្ថុនៅឆ្ងាយ មកមើលអក្សរក្នុងសៀវភៅនៅជិត (ការសម្របតម្រូវ / Accommodation) តើសាច់ដុំអង្គស៊ីលីយែរ និងកែវភ្នែកមានបម្រែបម្រួលដូចម្តេច?",
      },
      options: [
        "ក. អង្គស៊ីលីយែរកន្ត្រាក់ (រួមតូច), សរសៃចំណងធូរ, កែវភ្នែកប៉ោងក្រាស់ឡើង",
        "ខ. អង្គស៊ីលីយែរសម្រាក (ពង្រីក), សរសៃចំណងតឹង, កែវភ្នែកស្តើងស្មើ",
        "គ. អង្គស៊ីលីយែរកន្ត្រាក់, សរសៃចំណងតឹង, កែវភ្នែកស្តើងស្មើ",
        "ឃ. អង្គស៊ីលីយែរសម្រាក, សរសៃចំណងធូរ, កែវភ្នែកប៉ោងក្រាស់ឡើង",
      ],
      correct:
        "ក. អង្គស៊ីលីយែរកន្ត្រាក់ (រួមតូច), សរសៃចំណងធូរ, កែវភ្នែកប៉ោងក្រាស់ឡើង",
      difficulty: "medium",
      explanation:
        "ពេលមើលវត្ថុនៅជិត៖ សាច់ដុំនៃអង្គស៊ីលីយែរកន្ត្រាក់ធ្វើឱ្យរង្វង់សាច់ដុំរួមតូច $\\rightarrow$ សរសៃចំណងព្យួរកែវភ្នែកធូរ $\\rightarrow$ កែវភ្នែក (Lens) យឺតប៉ោងឡើងក្រាស់ ដើម្បីបង្កើនកម្លាំងប្រមូលផ្តុំពន្លឺឱ្យធ្លាក់ចំលើរ៉េទីន។ ផ្ទុយទៅវិញ ពេលមើលឆ្ងាយ អង្គស៊ីលីយែរសម្រាក សរសៃចំណងតឹង ទាញកែវភ្នែកឱ្យស្តើង។",
    },
    {
      q: {
        en: "តើអរម៉ូនពីរប្រភេទណាដែលមានសកម្មភាពប្រឆាំងគ្នា (Antagonistic) ក្នុងការរក្សាថេរលំនឹងនៃកំហាប់កាល់ស្យូម (Ca²⁺) ក្នុងឈាមមនុស្ស?",
        km: "តើអរម៉ូនពីរប្រភេទណាដែលមានសកម្មភាពប្រឆាំងគ្នា (Antagonistic) ក្នុងការរក្សាថេរលំនឹងនៃកំហាប់កាល់ស្យូម (Ca²⁺) ក្នុងឈាមមនុស្ស?",
      },
      options: [
        "ក. អាំងស៊ុយលីន (Insulin) និងគ្លុយកាកុង (Glucagon)",
        "ខ. ទីរ៉ុកស៊ីន (Thyroxine) និងក័រទីសូល (Cortisol)",
        "គ. អុកស៊ីតូស៊ីន (Oxytocin) និងប្រូឡាក់ទីន (Prolactin)",
        "ឃ. កាល់ស៊ីតូនីន (Calcitonin) និងអរម៉ូនប៉ារ៉ាទីរ៉ូអ៊ីត (PTH)",
      ],
      correct: "ឃ. កាល់ស៊ីតូនីន (Calcitonin) និងអរម៉ូនប៉ារ៉ាទីរ៉ូអ៊ីត (PTH)",
      difficulty: "medium",
      explanation:
        "កាល់ស៊ីតូនីន (បញ្ចេញដោយក្រពេញទីរ៉ូអ៊ីត) ធ្វើសកម្មភាព «បញ្ចុះកម្រិត $\\text{Ca}^{2+}$ ក្នុងឈាម» ដោយជំរុញឱ្យយកកាល់ស្យូមទៅស្តុកក្នុងឆ្អឹង។ ចំណែកឯអរម៉ូនប៉ារ៉ាទីរ៉ូអ៊ីត (PTH បញ្ចេញដោយក្រពេញប៉ារ៉ាទីរ៉ូអ៊ីត) ធ្វើសកម្មភាព «បង្កើនកម្រិត $\\text{Ca}^{2+}$ ក្នុងឈាម» ដោយដកកាល់ស្យូមពីឆ្អឹង និងជំរុញតម្រងនោម/ពោះវៀនស្រូបកាល់ស្យូមចូលឈាមវិញ។",
    },
    {
      q: {
        en: "ហេតុអ្វីបានជា «អរម៉ូនស្តេរ៉ូអ៊ីត» (ដូចជា អេស្ត្រូសែន និងតេស្តូស្តេរ៉ូន) អាចជ្រាបកាត់ភ្នាសប្លាសម៉ានៃកោសិកាគោលដៅដោយផ្ទាល់ ខណៈដែល «អរម៉ូនប៉ិបទីត» (ដូចជា អាំងស៊ុយលីន) ត្រូវភ្ជាប់នឹងរ៉េសិបទ័រលើផ្ទៃភ្នាសកោសិកា?",
        km: "ហេតុអ្វីបានជា «អរម៉ូនស្តេរ៉ូអ៊ីត» (ដូចជា អេស្ត្រូសែន និងតេស្តូស្តេរ៉ូន) អាចជ្រាបកាត់ភ្នាសប្លាសម៉ានៃកោសិកាគោលដៅដោយផ្ទាល់ ខណៈដែល «អរម៉ូនប៉ិបទីត» (ដូចជា អាំងស៊ុយលីន) ត្រូវភ្ជាប់នឹងរ៉េសិបទ័រលើផ្ទៃភ្នាសកោសិកា?",
      },
      options: [
        "ក. ព្រោះអរម៉ូនស្តេរ៉ូអ៊ីតជាសមាសធាតុរលាយក្នុងលីពីត ទើបជ្រាបកាត់ស្រទាប់ទ្វេផូស្វ័រលីពីតបាន ចំណែកអរម៉ូនប៉ិបទីតមិនរលាយក្នុងលីពីត",
        "ខ. ព្រោះអរម៉ូនស្តេរ៉ូអ៊ីតមានទំហំម៉ូលេគុលធំជាងអរម៉ូនប៉ិបទីតរាប់ពាន់ដង",
        "គ. ព្រោះភ្នាសកោសិកាផ្ទុកតែប្រូតេអ៊ីនគ្មានស្រទាប់ខ្លាញ់ lipid bilayer ឡើយ",
        "ឃ. ព្រោះអរម៉ូនប៉ិបទីតមានបន្ទុកវិជ្ជមានខ្លាំងទើបត្រូវទាញចូលដោយបណ្តាញដឹកនាំសកម្ម",
      ],
      correct:
        "ក. ព្រោះអរម៉ូនស្តេរ៉ូអ៊ីតជាសមាសធាតុរលាយក្នុងលីពីត ទើបជ្រាបកាត់ស្រទាប់ទ្វេផូស្វ័រលីពីតបាន ចំណែកអរម៉ូនប៉ិបទីតមិនរលាយក្នុងលីពីត",
      difficulty: "medium",
      explanation:
        "ភ្នាសប្លាសម៉ាកោសិកាកើតឡើងពីស្រទាប់ទ្វេផូស្វ័រលីពីត (Phospholipid bilayer)។ អរម៉ូនស្តេរ៉ូអ៊ីតកើតចេញពីកូឡេស្តេរ៉ុល និងរលាយក្នុងលីពីត (Lipid-soluble) ដូច្នេះវាអាចជ្រាបកាត់ភ្នាសកោសិកាដោយសេរីទៅភ្ជាប់នឹងរ៉េសិបទ័រក្នុងស៊ីតូប្លាស ឬក្នុងណ្វៃយ៉ូ។ រីឯអរម៉ូនប៉ិបទីតរលាយក្នុងទឹក (Water-soluble) មិនអាចជ្រាបកាត់លីពីតបានឡើយ ដូច្នេះវាត្រូវភ្ជាប់នឹងប្រូតេអ៊ីនទទួល (Receptor) នៅលើផ្ទៃភ្នាសកោសិកា រួចបញ្ជូនសញ្ញាតាមសារនាំសារទី 2 (cAMP)។",
    },
    {
      q: {
        en: "ទម្រង់ទី 2 (Secondary structure) នៃប្រូតេអ៊ីន ដែលមានសណ្ឋានជា «រាងកងស្ពីរ៉ាល់ (α-helix)» ឬ «រាងបត់បត់ (β-pleated sheet)» កើតឡើងដោយសារចំណងគីមីប្រភេទណា?",
        km: "ទម្រង់ទី 2 (Secondary structure) នៃប្រូតេអ៊ីន ដែលមានសណ្ឋានជា «រាងកងស្ពីរ៉ាល់ (α-helix)» ឬ «រាងបត់បត់ (β-pleated sheet)» កើតឡើងដោយសារចំណងគីមីប្រភេទណា?",
      },
      options: [
        "ក. ចំណងឌីស៊ុលភួ (Disulfide bonds) រវាងរ៉ាឌីកាល់នៃស៊ីស្តេអ៊ីន",
        "ខ. ចំណងអ៊ីយ៉ុង (Ionic bonds) រវាងបណ្តុំអាស៊ីត និងបណ្តុំបាសនៃច្រវ៉ាក់ខ្នែង",
        "គ. អន្តរកម្មអ៊ីដ្រូហ្វូប (Hydrophobic interactions) ក្នុងស្នូលកណ្តាលនៃប្រូតេអ៊ីន",
        "ឃ. ចំណងអ៊ីដ្រូសែន (Hydrogen bonds) រវាងក្រុម $>\\text{C}=\\text{O}$ និងក្រុម $-\\text{NH}-$ នៃឆ្អឹងខ្នងប៉ូលីប៉ិបទីត",
      ],
      correct:
        "ឃ. ចំណងអ៊ីដ្រូសែន (Hydrogen bonds) រវាងក្រុម $>\\text{C}=\\text{O}$ និងក្រុម $-\\text{NH}-$ នៃឆ្អឹងខ្នងប៉ូលីប៉ិបទីត",
      difficulty: "medium",
      explanation:
        "ទម្រង់ទី 2 (Secondary structure) នៃប្រូតេអ៊ីន (ដូចជា $\\alpha$-helix ឬ $\\beta$-pleated sheet) កើតចេញពីការបង្កើតចំណងអ៊ីដ្រូសែនជាប្រព័ន្ធទៀងទាត់ រវាងអាតូមអុកស៊ីសែននៃក្រុម $>\\text{C}=\\text{O}$ និងអាតូមអ៊ីដ្រូសែននៃក្រុម $-\\text{NH}-$ នៃឆ្អឹងខ្នងប៉ូលីប៉ិបទីត។ ចំណែកចំណងឌីស៊ុលភួ ចំណងអ៊ីយ៉ុង និងអន្តរកម្មអ៊ីដ្រូហ្វូប ចូលរួមបង្កើតទម្រង់ទី 3 (Tertiary structure)។",
    },
    {
      q: {
        en: "នៅពេលកម្តៅប្រតិកម្មកើនឡើងហួសពី «សីតុណ្ហភាពប្រសើរបំផុត (Optimum temperature ប្រហែល 40°C ក្នុងមនុស្ស)» ហេតុអ្វីបានជាល្បឿនប្រតិកម្មអង់ស៊ីមធ្លាក់ចុះយ៉ាងគំហុកស្ទើរតែដល់សូន្យ?",
        km: "នៅពេលកម្តៅប្រតិកម្មកើនឡើងហួសពី «សីតុណ្ហភាពប្រសើរបំផុត (Optimum temperature ប្រហែល 40°C ក្នុងមនុស្ស)» ហេតុអ្វីបានជាល្បឿនប្រតិកម្មអង់ស៊ីមធ្លាក់ចុះយ៉ាងគំហុកស្ទើរតែដល់សូន្យ?",
      },
      options: [
        "ក. ព្រោះកំហាប់អង់ស៊ីមកើនឡើងខ្លាំងពេកធ្វើឱ្យស្ទះប្រតិកម្ម",
        "ខ. ព្រោះស៊ុបស្ត្រាតទាំងអស់ត្រូវបានបំលែងទៅជាផលិតផលអស់ភ្លាមៗ",
        "គ. ព្រោះកម្តៅខ្ពស់ផ្តាច់ចំណងខ្សោយៗ (ចំណងអ៊ីដ្រូសែន) ធ្វើឱ្យអង់ស៊ីមបាត់បង់ទម្រង់ 3 វិមាត្រ និងមជ្ឈមណ្ឌលសកម្ម (ប្លែងភាព / Denaturation)",
        "ឃ. ព្រោះកម្តៅខ្ពស់ធ្វើឱ្យម៉ូលេគុលអង់ស៊ីម និងស៊ុបស្ត្រាតឈប់ធ្វើចលនាទង្គិចគ្នា",
      ],
      correct:
        "គ. ព្រោះកម្តៅខ្ពស់ផ្តាច់ចំណងខ្សោយៗ (ចំណងអ៊ីដ្រូសែន) ធ្វើឱ្យអង់ស៊ីមបាត់បង់ទម្រង់ 3 វិមាត្រ និងមជ្ឈមណ្ឌលសកម្ម (ប្លែងភាព / Denaturation)",
      difficulty: "medium",
      explanation:
        "កម្តៅខ្ពស់លើសសីតុណ្ហភាពប្រសើរ បង្កើនថាមពលស៊ីនេទិចរហូតដល់កាត់ផ្តាច់ចំណងអ៊ីដ្រូសែន និងចំណងខ្សោយដទៃទៀតដែលថែរក្សាទម្រង់ 3 វិមាត្រនៃប្រូតេអ៊ីនអង់ស៊ីម។ បាតុភូតនេះហៅថា «ប្លែងភាព (Denaturation)» ដែលធ្វើឱ្យមជ្ឈមណ្ឌលសកម្ម (Active site) ផ្លាស់ប្តូរទ្រង់ទ្រាយ មិនអាចភ្ជាប់ជាមួយស៊ុបស្ត្រាតបានទៀតឡើយ ទើបល្បឿនប្រតិកម្មធ្លាក់ចុះដល់សូន្យ។",
    },
    // ---------------------------------------------------------
    // BIOLOGY HARD - 10 Questions
    // Focus: DNA Hydrogen Bonds & Length Calculation, Protein Translation
    // Codon & Peptide Counting, Semi-Conservative Replication Isotopes,
    // Action Potential Ion Fluxes, Resting Membrane Potential & Na+/K+ Pump,
    // Double Fertilization & Ploidy, Thyroid Negative Feedback Loop,
    // Competitive vs Non-Competitive Inhibitors, ABO Blood Group Genetics,
    // Sex-Linked Hemophilia Inheritance
    // ---------------------------------------------------------
    {
      q: {
        en: "ម៉ូលេគុល ADN មួយមានប្រវែង $L = 5100\\text{ Å}$ និងមានចំនួននុយក្លេអូទីតប្រភេទ អាដេនីន $A = 600$។ ដោយដឹងថានុយក្លេអូទីត 1 គូមានប្រវែង $3.4\\text{ Å}$ ចូរគណនាចំនួនចំណងអ៊ីដ្រូសែនសរុបនៃម៉ូលេគុល ADN នោះ៖",
        km: "ម៉ូលេគុល ADN មួយមានប្រវែង $L = 5100\\text{ Å}$ និងមានចំនួននុយក្លេអូទីតប្រភេទ អាដេនីន $A = 600$។ ដោយដឹងថានុយក្លេអូទីត 1 គូមានប្រវែង $3.4\\text{ Å}$ ចូរគណនាចំនួនចំណងអ៊ីដ្រូសែនសរុបនៃម៉ូលេគុល ADN នោះ៖",
      },
      options: [
        "ក. 3000 ចំណង",
        "ខ. 3600 ចំណង",
        "គ. 3900 ចំណង",
        "ឃ. 4200 ចំណង",
      ],
      correct: "គ. 3900 ចំណង",
      difficulty: "hard",
      explanation:
        "ចំនួននុយក្លេអូទីតសរុប៖ $N = \\frac{2 \\times L}{3.4} = \\frac{2 \\times 5100}{3.4} = 3000$ នុយក្លេអូទីត។ តាមគោលការណ៍បំពេញបាស Chargaff៖ $A = T = 600$ នាំឱ្យ $G = C = \\frac{3000 - (2 \\times 600)}{2} = 900$។ ចំនួនចំណងអ៊ីដ្រូសែនសរុប៖ $H = 2A + 3G = 2(600) + 3(900) = 1200 + 2700 = 3900$ ចំណង។",
    },
    {
      q: {
        en: "ច្រវ៉ាក់ម៉ូលេគុល ARNm មួយមាននុយក្លេអូទីតចំនួន 900 (រាប់បញ្ចូលទាំងត្រីធាតុផ្តើម និងត្រីធាតុបញ្ចប់)។ ប្រសិនបើម៉ូលេគុល ARNm នេះចូលរួមក្នុងដំណើរការបកប្រែក្រមដើម្បីបង្កើតច្រវ៉ាក់ប៉ូលីប៉ិបទីត តើច្រវ៉ាក់ប៉ូលីប៉ិបទីតដែលសំយោគបានពេញលេញមានចំនួន «អាស៊ីតអាមីណូ» និង «ចំណងប៉ិបទីត» ប៉ុន្មាន?",
        km: "ច្រវ៉ាក់ម៉ូលេគុល ARNm មួយមាននុយក្លេអូទីតចំនួន 900 (រាប់បញ្ចូលទាំងត្រីធាតុផ្តើម និងត្រីធាតុបញ្ចប់)។ ប្រសិនបើម៉ូលេគុល ARNm នេះចូលរួមក្នុងដំណើរការបកប្រែក្រមដើម្បីបង្កើតច្រវ៉ាក់ប៉ូលីប៉ិបទីត តើច្រវ៉ាក់ប៉ូលីប៉ិបទីតដែលសំយោគបានពេញលេញមានចំនួន «អាស៊ីតអាមីណូ» និង «ចំណងប៉ិបទីត» ប៉ុន្មាន?",
      },
      options: [
        "ក. 300 អាស៊ីតអាមីណូ និង 299 ចំណងប៉ិបទីត",
        "ខ. 298 អាស៊ីតអាមីណូ និង 297 ចំណងប៉ិបទីត",
        "គ. 299 អាស៊ីតអាមីណូ និង 299 ចំណងប៉ិបទីត",
        "ឃ. 297 អាស៊ីតអាមីណូ និង 296 ចំណងប៉ិបទីត",
      ],
      correct: "ខ. 298 អាស៊ីតអាមីណូ និង 297 ចំណងប៉ិបទីត",
      difficulty: "hard",
      explanation:
        "ចំនួនកូដុងសរុប $= \\frac{900}{3} = 300$ កូដុង។ ដោយសារកូដុងបញ្ចប់ 1 មិនបង្កើតអាស៊ីតអាមីណូ និងអាស៊ីតអាមីណូផ្តើម (Met) 1 ត្រូវបានកាត់ចេញក្រោយការបកប្រែក្រម នាំឱ្យចំនួនអាស៊ីតអាមីណូក្នុងប្រូតេអ៊ីនពេញលេញស្មើនឹង $300 - 2 = 298$ អាស៊ីតអាមីណូ។ ចំនួនចំណងប៉ិបទីតក្នុងច្រវ៉ាក់ប៉ូលីប៉ិបទីតស្មើនឹងចំនួនអាស៊ីតអាមីណូដក 1 គឺ $298 - 1 = 297$ ចំណងប៉ិបទីត។",
    },
    {
      q: {
        en: "គេបណ្តុះបាក់តេរីមួយប្រភេទក្នុងមជ្ឈដ្ឋានដែលមានអ៊ីសូតូបធ្ងន់ ¹⁵N រហូតដល់ម៉ូលេគុល ADN ទាំងអស់សុទ្ធតែផ្ទុក ¹⁵N (ច្រវ៉ាក់ទាំងពីរជា ¹⁵N)។ បន្ទាប់មក គេផ្ទេរបាក់តេរីនោះទៅបណ្តុះក្នុងមជ្ឈដ្ឋានអ៊ីសូតូបស្រាល ¹⁴N ធម្មតាវិញ ហើយទុកឱ្យវាធ្វើស្វ័យតម្រងឡើងវិញបានចំនួន 3 ជំនាន់ (3 លើក)។ តើសមាមាត្រម៉ូលេគុល ADN កូនកាត់ (¹⁵N-¹⁴N) ធៀបនឹងម៉ូលេគុល ADN ស្រាល (¹⁴N-¹⁴N) ស្មើនឹងប៉ុន្មាន?",
        km: "គេបណ្តុះបាក់តេរីមួយប្រភេទក្នុងមជ្ឈដ្ឋានដែលមានអ៊ីសូតូបធ្ងន់ ¹⁵N រហូតដល់ម៉ូលេគុល ADN ទាំងអស់សុទ្ធតែផ្ទុក ¹⁵N (ច្រវ៉ាក់ទាំងពីរជា ¹⁵N)។ បន្ទាប់មក គេផ្ទេរបាក់តេរីនោះទៅបណ្តុះក្នុងមជ្ឈដ្ឋានអ៊ីសូតូបស្រាល ¹⁴N ធម្មតាវិញ ហើយទុកឱ្យវាធ្វើស្វ័យតម្រងឡើងវិញបានចំនួន 3 ជំនាន់ (3 លើក)។ តើសមាមាត្រម៉ូលេគុល ADN កូនកាត់ (¹⁵N-¹⁴N) ធៀបនឹងម៉ូលេគុល ADN ស្រាល (¹⁴N-¹⁴N) ស្មើនឹងប៉ុន្មាន?",
      },
      options: [
        "ក. 1 : 1 (កូនកាត់ 4 : ស្រាល 4)",
        "ខ. 1 : 7 (កូនកាត់ 1 : ស្រាល 7)",
        "គ. 1 : 3 (កូនកាត់ 2 : ស្រាល 6)",
        "ឃ. 0 : 8 (គ្មានកូនកាត់ឡើយ)",
      ],
      correct: "គ. 1 : 3 (កូនកាត់ 2 : ស្រាល 6)",
      difficulty: "hard",
      explanation:
        "តាមច្បាប់ពាក់កណ្តាលរក្សាទុក (Semi-conservative replication) ក្រោយស្វ័យតម្រង 3 លើក បង្កើតបាន ADN សរុប $2^3 = 8$ ម៉ូលេគុល។ ច្រវ៉ាក់ $^{15}\\text{N}$ ដើមទាំង 2 ត្រូវបានរក្សាទុកក្នុងម៉ូលេគុល ADN កូនកាត់ ($^{15}\\text{N}-^{14}\\text{N}$) ចំនួន 2 ជានិច្ច។ ម៉ូលេគុលដែលនៅសល់ 6 ទៀតសុទ្ធសឹងជា ADN ស្រាល ($^{14}\\text{N}-^{14}\\text{N}$)។ ដូច្នេះផលធៀបរវាង ADN កូនកាត់ និង ADN ស្រាលគឺ $2 : 6 = 1 : 3$។",
    },
    {
      q: {
        en: "ក្នុងអំឡុងពេលនៃការបង្កើត «ប៉ូតង់ស្យែលសកម្មភាព (Action potential)» លើភ្នាសអាក់សូន តើបម្រែបម្រួលចលនាអ៊ីយ៉ុង និងតង់ស្យុងភ្នាសនៅដំណាក់កាល «បាត់បង់បន្ទុកប៉ូល (Depolarization)» និងដំណាក់កាល «បង្កើតបន្ទុកប៉ូលឡើងវិញ (Repolarization)» ប្រព្រឹត្តទៅយ៉ាងដូចម្តេច?",
        km: "ក្នុងអំឡុងពេលនៃការបង្កើត «ប៉ូតង់ស្យែលសកម្មភាព (Action potential)» លើភ្នាសអាក់សូន តើបម្រែបម្រួលចលនាអ៊ីយ៉ុង និងតង់ស្យុងភ្នាសនៅដំណាក់កាល «បាត់បង់បន្ទុកប៉ូល (Depolarization)» និងដំណាក់កាល «បង្កើតបន្ទុកប៉ូលឡើងវិញ (Repolarization)» ប្រព្រឹត្តទៅយ៉ាងដូចម្តេច?",
      },
      options: [
        "ក. Depolarization បង្កឡើងដោយអ៊ីយ៉ុង $K^+$ ហូរចេញក្រៅភ្នាស, រីឯ Repolarization បង្កឡើងដោយ $Na^+$ ហូរចូលក្នុងកោសិកា",
        "ខ. Depolarization កើតឡើងដោយសារច្រក $Na^+$ អាស្រ័យតង់ស្យុងបើក ធ្វើឱ្យ $Na^+$ ហូរចូលយ៉ាងគំហុក (តង់ស្យុងឡើងដល់ $+30\\text{ mV}$), រីឯ Repolarization កើតឡើងដោយសារច្រក $Na^+$ បិទ ហើយច្រក $K^+$ បើក ធ្វើឱ្យ $K^+$ ហូរចេញក្រៅកោសិកា",
        "គ. ដំណាក់កាលទាំងពីរដំណើរការដោយច្រកបូម $Na^+/K^+$ pump បញ្ចេញ $3Na^+$ និងស្រូប $2K^+$ យ៉ាងលឿន",
        "ឃ. Depolarization បង្កឡើងដោយការហូរចូលនៃអ៊ីយ៉ុង $Cl^-$ ធ្វើឱ្យខាងក្នុងកោសិកាកាន់តែអវិជ្ជមានខ្លាំង",
      ],
      correct:
        "ខ. Depolarization កើតឡើងដោយសារច្រក $Na^+$ អាស្រ័យតង់ស្យុងបើក ធ្វើឱ្យ $Na^+$ ហូរចូលយ៉ាងគំហុក (តង់ស្យុងឡើងដល់ $+30\\text{ mV}$), រីឯ Repolarization កើតឡើងដោយសារច្រក $Na^+$ បិទ ហើយច្រក $K^+$ បើក ធ្វើឱ្យ $K^+$ ហូរចេញក្រៅកោសិកា",
      difficulty: "hard",
      explanation:
        "ពេលមានរំញោចដល់កម្រិត threshold (ប្រហែល $-55\\text{ mV}$), ច្រក $Na^+$ អាស្រ័យតង់ស្យុងបើក ធ្វើឱ្យ $Na^+$ ហូរចូលខាងក្នុងកោសិកាយ៉ាងគំហុក នាំឱ្យបន្ទុកខាងក្នុងប្រែជាវិជ្ជមានដល់ $+30\\text{ mV}$ (Depolarization)។ បន្ទាប់មក ច្រក $Na^+$ បិទ ហើយច្រក $K^+$ បើក ធ្វើឱ្យ $K^+$ ហូរចេញក្រៅកោសិកា ទាញតង់ស្យុងភ្នាសធ្លាក់មកអវិជ្ជមានវិញ (Repolarization)។",
    },
    {
      q: {
        en: "នៅពេលណឺរ៉ូនស្ថិតក្នុងស្ថានភាពសម្រាក (Resting state) ប៉ូតង់ស្យែលភ្នាសរក្សាតម្លៃថេរប្រហែល -70 mV (ខាងក្នុងអវិជ្ជមានធៀបនឹងខាងក្រៅ)។ តើយន្តការកោសិកាសំខាន់បំផុតមួយណាដែលទទួលខុសត្រូវក្នុងការរក្សាកំហាប់មិនស្មើគ្នានៃអ៊ីយ៉ុង និងប៉ូតង់ស្យែលសម្រាកនេះ?",
        km: "នៅពេលណឺរ៉ូនស្ថិតក្នុងស្ថានភាពសម្រាក (Resting state) ប៉ូតង់ស្យែលភ្នាសរក្សាតម្លៃថេរប្រហែល -70 mV (ខាងក្នុងអវិជ្ជមានធៀបនឹងខាងក្រៅ)។ តើយន្តការកោសិកាសំខាន់បំផុតមួយណាដែលទទួលខុសត្រូវក្នុងការរក្សាកំហាប់មិនស្មើគ្នានៃអ៊ីយ៉ុង និងប៉ូតង់ស្យែលសម្រាកនេះ?",
      },
      options: [
        "ក. ច្រកបូម $Na^+/K^+$ ATPase pump បូមបញ្ចេញ $3\\text{ Na}^+$ ទៅក្រៅកោសិកា និងបូមស្រូបចូល $2\\text{ K}^+$ មកក្នុងកោសិកា ដោយប្រើប្រាស់ថាមពល $1\\text{ ATP}$ រួមផ្សំនឹងការជ្រាបចេញងាយនៃ $K^+$",
        "ខ. ការសាយភាយដោយសេរីនៃអ៊ីយ៉ុង $Na^+$ ចូលមកខាងក្នុងតាមរយៈរន្ធភ្នាសប្លាសម៉ា",
        "គ. ច្រកបូមបញ្ចេញ $2\\text{ Na}^+$ និងស្រូបចូល $3\\text{ K}^+$ ដោយមិនប្រើប្រាស់ថាមពល ATP",
        "ឃ. ការបញ្ចេញអ៊ីយ៉ុង $Ca^{2+}$ ទាំងអស់ចេញពីស៊ីតូប្លាសតាមរយៈដំណឹកនាំអសកម្ម",
      ],
      correct:
        "ក. ច្រកបូម $Na^+/K^+$ ATPase pump បូមបញ្ចេញ $3\\text{ Na}^+$ ទៅក្រៅកោសិកា និងបូមស្រូបចូល $2\\text{ K}^+$ មកក្នុងកោសិកា ដោយប្រើប្រាស់ថាមពល $1\\text{ ATP}$ រួមផ្សំនឹងការជ្រាបចេញងាយនៃ $K^+$",
      difficulty: "hard",
      explanation:
        "ច្រកបូម $Na^+/K^+$ ATPase pump ដឹកនាំអ៊ីយ៉ុងច្រាសទិសកំហាប់ ដោយប្រើ $1\\text{ ATP}$ ដើម្បីបូមបញ្ចេញ $3\\text{ Na}^+$ ទៅខាងក្រៅ និងស្រូបយក $2\\text{ K}^+$ ចូលខាងក្នុង។ ដោយសារចំនួនបន្ទុកបូកចេញក្រៅ (3) ច្រើនជាងចូលក្នុង (2) និងភ្នាសកោសិកាជ្រាប $K^+$ ចេញក្រៅងាយជាង $Na^+$ ទើបធ្វើឱ្យផ្ទៃខាងក្នុងភ្នាសមានបន្ទុកអវិជ្ជមានធៀបនឹងផ្ទៃខាងក្រៅ ($-70\\text{ mV}$)។",
    },
    {
      q: {
        en: "ក្នុងដំណើរការបន្តពូជផ្លូវភេទនៃរុក្ខជាតិអង់ស្យូស្ពែម តើបាតុភូត «រលាយទ្វេ (Double fertilization)» កើតឡើងដូចម្តេច ហើយកោសិកាដែលកកើតឡើងមានប្លូអ៊ីឌី (n, 2n, 3n) បែបណា?",
        km: "ក្នុងដំណើរការបន្តពូជផ្លូវភេទនៃរុក្ខជាតិអង់ស្យូស្ពែម តើបាតុភូត «រលាយទ្វេ (Double fertilization)» កើតឡើងដូចម្តេច ហើយកោសិកាដែលកកើតឡើងមានប្លូអ៊ីឌី (n, 2n, 3n) បែបណា?",
      },
      options: [
        "ក. ស្ពែម៉ាតូសូអ៊ីតទាំង 2 ($n$) រលាយជាមួយអូវុលតែមួយ បង្កើតបានជាអំប្រ៊ីយ៉ុងទ្រីប្លូអ៊ីត ($3n$)",
        "ខ. អ័រហ្កោនទាំង 2 ($n$) បង្កកំណើតជាមួយកោសិកាប៉ូល 2 ($2n$) បង្កើតបានជាសំបកគ្រាប់ ($4n$)",
        "គ. ស្ពែម៉ាតូសូអ៊ីតទី 1 ($n$) រលាយជាមួយកោសិកាមេកាម៉ែតញី ($n$) បង្កើតជាស៊ីហ្គោត ($2n$), រីឯស្ពែម៉ាតូសូអ៊ីតទី 2 ($n$) រលាយជាមួយណ្វៃយ៉ូប៉ូល 2 ($2n$) បង្កើតជាអង់ដូស្ពែម ($3n$)",
        "ឃ. គ្រាប់លំអង ($2n$) រលាយជាមួយកោសិកាកណ្តាល ($2n$) បង្កើតបានជាផ្លែឥតគ្រាប់ ($4n$)",
      ],
      correct:
        "គ. ស្ពែម៉ាតូសូអ៊ីតទី 1 ($n$) រលាយជាមួយកោសិកាមេកាម៉ែតញី ($n$) បង្កើតជាស៊ីហ្គោត ($2n$), រីឯស្ពែម៉ាតូសូអ៊ីតទី 2 ($n$) រលាយជាមួយណ្វៃយ៉ូប៉ូល 2 ($2n$) បង្កើតជាអង់ដូស្ពែម ($3n$)",
      difficulty: "hard",
      explanation:
        "ក្នុងបំពង់លំអងមានស្ពែម៉ាតូសូអ៊ីត (កាម៉ែតឈ្មោល) 2 ($n$)៖ ស្ពែម៉ាតូសូអ៊ីតទី 1 ($n$) ចូលបង្កកំណើតជាមួយអូអូស្វែរ ($n$) បង្កើតបានជាស៊ីហ្គោតឌីប្លូអ៊ីត ($2n$) ដែលនឹងលូតលាស់ជាអំប្រ៊ីយ៉ុង។ ស្ពែម៉ាតូសូអ៊ីតទី 2 ($n$) ចូលរលាយជាមួយណ្វៃយ៉ូប៉ូលទាំង 2 ($n + n = 2n$) នៃថង់អំប្រ៊ីយ៉ុង បង្កើតបានជាណ្វៃយ៉ូទ្រីប្លូអ៊ីត ($3n$) ដែលនឹងលូតលាស់ជាអង់ដូស្ពែម (ជាលិកាស្តុកអាហារបម្រុងសម្រាប់គ្រាប់)។",
    },
    {
      q: {
        en: "នៅក្នុងអ័ក្ស «អ៊ីប៉ូតាឡាមុស – អ៊ីប៉ូភីស – ទីរ៉ូអ៊ីត» តើមានអ្វីកើតឡើងនៅពេលកំហាប់អរម៉ូនទីរ៉ុកស៊ីន (T₃, T₄) ក្នុងឈាមកើនឡើងលើសកម្រិតធម្មតា (យន្តការតំណបត្រឡប់អវិជ្ជមាន / Negative Feedback)?",
        km: "នៅក្នុងអ័ក្ស «អ៊ីប៉ូតាឡាមុស – អ៊ីប៉ូភីស – ទីរ៉ូអ៊ីត» តើមានអ្វីកើតឡើងនៅពេលកំហាប់អរម៉ូនទីរ៉ុកស៊ីន (T₃, T₄) ក្នុងឈាមកើនឡើងលើសកម្រិតធម្មតា (យន្តការតំណបត្រឡប់អវិជ្ជមាន / Negative Feedback)?",
      },
      options: [
        "ក. ទីរ៉ុកស៊ីនបញ្ជូនសញ្ញាទៅរារាំងអ៊ីប៉ូតាឡាមុសមិនឱ្យបញ្ចេញ TRH និងរារាំងអ៊ីប៉ូភីសមុខមិនឱ្យបញ្ចេញ TSH ដើម្បីបន្ថយការផលិតទីរ៉ុកស៊ីនមកកម្រិតប្រក្រតីវិញ",
        "ខ. ទីរ៉ុកស៊ីនជំរុញឱ្យអ៊ីប៉ូតាឡាមុសបញ្ចេញ TRH បន្ថែម និងជំរុញអ៊ីប៉ូភីសបញ្ចេញ TSH ទ្វេដង",
        "គ. ទីរ៉ុកស៊ីនបំផ្លាញក្រពេញទីរ៉ូអ៊ីតទាំងស្រុងដើម្បីកុំឱ្យផលិតអរម៉ូនបន្តទៀត",
        "ឃ. ទីរ៉ុកស៊ីនជំរុញឱ្យតម្រងនោមបញ្ចេញកាល់ស្យូមចោលទាំងអស់តាមទឹកនោម",
      ],
      correct:
        "ក. ទីរ៉ុកស៊ីនបញ្ជូនសញ្ញាទៅរារាំងអ៊ីប៉ូតាឡាមុសមិនឱ្យបញ្ចេញ TRH និងរារាំងអ៊ីប៉ូភីសមុខមិនឱ្យបញ្ចេញ TSH ដើម្បីបន្ថយការផលិតទីរ៉ុកស៊ីនមកកម្រិតប្រក្រតីវិញ",
      difficulty: "hard",
      explanation:
        "តាមយន្តការតំណបត្រឡប់អវិជ្ជមាន (Negative Feedback)៖ កាលណាកំហាប់ទីរ៉ុកស៊ីន ($T_3, T_4$) ក្នុងឈាមឡើងខ្ពស់ វានឹងធ្វើសកម្មភាពរារាំងដោយផ្ទាល់ទៅលើអ៊ីប៉ូតាឡាមុស (បន្ថយការបញ្ចេញ TRH) និងអ៊ីប៉ូភីសមុខ (បន្ថយការបញ្ចេញ TSH)។ ការថយចុះនៃ TSH នាំឱ្យក្រពេញទីរ៉ូអ៊ីតបន្ថយការសំយោគទីរ៉ុកស៊ីន រហូតដល់កម្រិតក្នុងឈាមត្រឡប់មកថេរលំនឹងធម្មតាវិញ។",
    },
    {
      q: {
        en: "តើអ្វីជាចំណុចខុសគ្នាសំខាន់រវាង «សារធាតុរារាំងប្រកួតប្រជែង (Competitive inhibitor)» និង «សារធាតុរារាំងមិនប្រកួតប្រជែង (Non-competitive inhibitor)» ទៅលើសកម្មភាពអង់ស៊ីម?",
        km: "តើអ្វីជាចំណុចខុសគ្នាសំខាន់រវាង «សារធាតុរារាំងប្រកួតប្រជែង (Competitive inhibitor)» និង «សារធាតុរារាំងមិនប្រកួតប្រជែង (Non-competitive inhibitor)» ទៅលើសកម្មភាពអង់ស៊ីម?",
      },
      options: [
        "ក. សារធាតុរារាំងប្រកួតប្រជែងភ្ជាប់នឹងមជ្ឈមណ្ឌលសកម្ម (Active site) ដោយប្រជែងជាមួយស៊ុបស្ត្រាត និងអាចបន្សាបឥទ្ធិពលបានដោយការបង្កើនកំហាប់ស៊ុបស្ត្រាត, រីឯសារធាតុរារាំងមិនប្រកួតប្រជែងភ្ជាប់នឹងទីតាំងអាឡូស្តេរិច (Allosteric site) ធ្វើឱ្យខូចទ្រង់ទ្រាយមជ្ឈមណ្ឌលសកម្ម ហើយមិនអាចបន្សាបដោយការបន្ថែមស៊ុបស្ត្រាតបានឡើយ",
        "ខ. សារធាតុរារាំងប្រកួតប្រជែងបំផ្លាញអង់ស៊ីមជាអចិន្ត្រៃយ៍, រីឯសារធាតុរារាំងមិនប្រកួតប្រជែងជួយពន្លឿនល្បឿនប្រតិកម្ម",
        "គ. សារធាតុរារាំងប្រកួតប្រជែងភ្ជាប់តែលើប្រូតេអ៊ីនទម្រង់ទី 1 ប៉ុណ្ណោះ",
        "ឃ. សារធាតុទាំងពីរប្រភេទសុទ្ធតែភ្ជាប់នឹងមជ្ឈមណ្ឌលសកម្មដូចគ្នា ហើយអាចបន្សាបដោយការបន្ថយកម្តៅ",
      ],
      correct:
        "ក. សារធាតុរារាំងប្រកួតប្រជែងភ្ជាប់នឹងមជ្ឈមណ្ឌលសកម្ម (Active site) ដោយប្រជែងជាមួយស៊ុបស្ត្រាត និងអាចបន្សាបឥទ្ធិពលបានដោយការបង្កើនកំហាប់ស៊ុបស្ត្រាត, រីឯសារធាតុរារាំងមិនប្រកួតប្រជែងភ្ជាប់នឹងទីតាំងអាឡូស្តេរិច (Allosteric site) ធ្វើឱ្យខូចទ្រង់ទ្រាយមជ្ឈមណ្ឌលសកម្ម ហើយមិនអាចបន្សាបដោយការបន្ថែមស៊ុបស្ត្រាតបានឡើយ",
      difficulty: "hard",
      explanation:
        "សារធាតុរារាំងប្រកួតប្រជែង (Competitive inhibitor) មានទម្រង់ម៉ូលេគុលស្រដៀងនឹងស៊ុបស្ត្រាត ទើបវាចូលទៅដណ្តើមភ្ជាប់នឹងមជ្ឈមណ្ឌលសកម្ម (Active site) របស់អង់ស៊ីម (អាចបន្សាបឥទ្ធិពលបានបើគេបង្កើនកំហាប់ស៊ុបស្ត្រាតឱ្យច្រើនលើសលប់)។ រីឯសារធាតុរារាំងមិនប្រកួតប្រជែង (Non-competitive inhibitor) ចូលទៅភ្ជាប់នឹងទីតាំងផ្សេងពីមជ្ឈមណ្ឌលសកម្ម (Allosteric site) ធ្វើឱ្យទម្រង់ 3 វិមាត្រនៃមជ្ឈមណ្ឌលសកម្មប្រែប្រួល ស៊ុបស្ត្រាតមិនអាចភ្ជាប់បានឡើយ ហើយការបន្ថែមស៊ុបស្ត្រាតមិនអាចជម្នះការរារាំងនេះបានទេ។",
    },
    {
      q: {
        en: "បុរសម្នាក់មានឈាម «ប្រភេទ A» (ដែលមានម្តាយមានឈាមប្រភេទ O) បានរៀបការជាមួយស្ត្រីម្នាក់ដែលមានឈាម «ប្រភេទ B» (ដែលមានឪពុកមានឈាមប្រភេទ O)។ តើប្រូបាបដែលគូស្វាមីភរិយានេះបង្កើតបានកូនដំបូងមាន «ឈាមប្រភេទ O» ស្មើនឹងប៉ុន្មាន?",
        km: "បុរសម្នាក់មានឈាម «ប្រភេទ A» (ដែលមានម្តាយមានឈាមប្រភេទ O) បានរៀបការជាមួយស្ត្រីម្នាក់ដែលមានឈាម «ប្រភេទ B» (ដែលមានឪពុកមានឈាមប្រភេទ O)។ តើប្រូបាបដែលគូស្វាមីភរិយានេះបង្កើតបានកូនដំបូងមាន «ឈាមប្រភេទ O» ស្មើនឹងប៉ុន្មាន?",
      },
      options: [
        "ក. 0% (មិនអាចមានកូនឈាម O បានឡើយ)",
        "ខ. 50%",
        "គ. 12.5%",
        "ឃ. 25% (1/4)",
      ],
      correct: "ឃ. 25% (1/4)",
      difficulty: "hard",
      explanation:
        "ដោយសារបុរសឈាម A មានម្តាយឈាម O ($ii$) នាំឱ្យសេណូទីបរបស់គាត់គឺ $I^A i$។ ដោយសារស្ត្រីឈាម B មានឪពុកឈាម O ($ii$) នាំឱ្យសេណូទីបរបស់នាងគឺ $I^B i$។ តាមការបង្កាត់ $I^A i \\times I^B i$ ផ្តល់កូនតាមសមាមាត្រ៖ $\\frac{1}{4}\\ I^A I^B$ (ឈាម AB), $\\frac{1}{4}\\ I^A i$ (ឈាម A), $\\frac{1}{4}\\ I^B i$ (ឈាម B), និង $\\frac{1}{4}\\ ii$ (ឈាម O)។ ដូច្នេះប្រូបាបកូនមានឈាមប្រភេទ O គឺ $\\frac{1}{4} = 25\\%$។",
    },
    {
      q: {
        en: "ជំងឺអេម៉ូហ្វីលី (ជំងឺឈាមមិនកក) កំណត់ដោយអាឡែលអន់ Xʰ លើក្រូម៉ូសូមភេទ X (រីឯ Xᴴ ជាអាឡែលលុបកំណត់ឈាមកកធម្មតា)។ ប្រសិនបើបុរសម្នាក់មានសុខភាពធម្មតា (XᴴY) រៀបការជាមួយស្ត្រីម្នាក់ជាអ្នកផ្ទុកមិនបញ្ចេញរោគសញ្ញា (XᴴXʰ) តើកូនប្រុសរបស់ពួកគាត់មានប្រូបាបប៉ុន្មានភាគរយដែលកើតជំងឺអេម៉ូហ្វីលី?",
        km: "ជំងឺអេម៉ូហ្វីលី (ជំងឺឈាមមិនកក) កំណត់ដោយអាឡែលអន់ Xʰ លើក្រូម៉ូសូមភេទ X (រីឯ Xᴴ ជាអាឡែលលុបកំណត់ឈាមកកធម្មតា)។ ប្រសិនបើបុរសម្នាក់មានសុខភាពធម្មតា (XᴴY) រៀបការជាមួយស្ត្រីម្នាក់ជាអ្នកផ្ទុកមិនបញ្ចេញរោគសញ្ញា (XᴴXʰ) តើកូនប្រុសរបស់ពួកគាត់មានប្រូបាបប៉ុន្មានភាគរយដែលកើតជំងឺអេម៉ូហ្វីលី?",
      },
      options: ["ក. 0%", "ខ. 25%", "គ. 100%", "ឃ. 50%"],
      correct: "ឃ. 50%",
      difficulty: "hard",
      explanation:
        "តាមការបង្កាត់ $X^H X^h \\times X^H Y$ កូនដែលកើតមកមាន៖ $X^H X^H$ (ស្រីធម្មតា 25%), $X^H X^h$ (ស្រីផ្ទុក 25%), $X^H Y$ (ប្រុសធម្មតា 25%), និង $X^h Y$ (ប្រុសកើតជំងឺអេម៉ូហ្វីលី 25%)។ ដូច្នេះ បើគិតតែលើ «កូនប្រុស» ប្រូបាបដែលកូនប្រុសកើតជំងឺអេម៉ូហ្វីលី ($X^h Y$) គឺ $\\frac{1}{2} = 50\\%$។",
    },
  ],
};
