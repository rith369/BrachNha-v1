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
  ],
};
