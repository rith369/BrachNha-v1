# BrachNha — Change Report

A plain-language log of what changed in the app, written for the team rather than for
developers. Newest entries first.

- **This file** = what changed, why, and what you need to know or re-test.
- **CLAUDE.md** = the technical context file the AI coding assistant reads. Different audience,
  much more detail. You don't need to read it.

Each entry lists the commit it landed in, so you can match it to a version of the site.

> **Note on the older commit codes.** When the project moved to its new folder, the repo
> was started fresh and the whole history up to 22 Aug 2026 was collapsed into a single
> commit, `2d20f12`. The codes shown on entries below that date (`1e4916b`, `8469c05`,
> `f8e6ef0`, `799a11b`) are from the old repo and no longer resolve — they are kept as a
> record of the order things happened, not as something you can look up.


## 17 Nov 2026: Grade 12 Chemistry OCR: Chapter 5 Additional Exercises & Chapter 5 Complete

Commit: pending. **No database step needed.**

Digitized and audited Grade 12 Chemistry Chapter 5 Additional Exercises (`sources/textbooks/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់.pdf`, PDF pages `p115.png` bottom half to `p118.png` top half), completing 100% of Chapter 5 (ជំពូក 5 ឧស្ម័ន):
- **Textbook OCR**: Transcribed into `sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់/chapter5-exercises-solutions.md`, covering 10 additional exercises and detailed solutions (unit conversions, Boyle's/Charles's/Ideal Gas laws, molar mass, molecular formula determination of $(\text{SF}_4)_x$, Dalton's Law total pressure, and mole fraction partial pressures for $\text{CH}_4$, $\text{C}_2\text{H}_6$, and $\text{C}_3\text{H}_8$).
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 4 pages (`p115.png`–`p118.png`):
  - Verified every numeric result, exponent (`10^{-3}`, `10^{-4}`), subscript, and mole fraction calculation, preserving source-book algebra quirks verbatim (`Sol. 3`, `Sol. 4`, `Sol. 8`) while keeping `$P$<sub>សរុប</sub>` outside KaTeX delimiters.
  - Maintained `<!-- Page p115.png -->` through `<!-- Page p118.png -->` markers and updated `STATUS.md` (all 4 files of Chapter 5 are now OCR Written: YES and OCR Audited: YES).
- **KruAI RAG Status**: KruAI RAG: NO (OCR only).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់"` (22 files checked, 0 warnings) and `npm run check:digits`.


## 17 Nov 2026: Grade 12 Chemistry OCR: Chapter 5 Lesson 3 (Gas Molecular Composition & Chapter Review)

Commit: pending. **No database step needed.**

Digitized and audited Grade 12 Chemistry Chapter 5 Lesson 3 (`sources/textbooks/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់.pdf`, PDF pages `p107.png` bottom half to `p115.png` top half):
- **Textbook OCR**: Transcribed into `sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់/chapter5-lesson3-gas-molecular-composition.md`, covering the Ideal Gas Law ($PV = nRT$), Graham's Law of diffusion/effusion, Dalton's Law of partial pressures, Lesson 3 questions & answers (1–10), and end-of-chapter 5 review exercises Parts I–IV (MCQs, fill-in-the-blank, conceptual questions with $\text{NH}_3$/$\text{HCl}$ diagram description, and numerical solutions).
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 9 pages (`p107.png`–`p115.png`):
  - Corrected Khmer OCR misreads (`ប៉ែង` -> `ប៉េង`, `ចំណុច` -> `ចំនុច`, removed spurious `ឋិត`), kept printed textbook quirks annotated/preserved faithfully, and moved Khmer subscripts like `សរុប` / `ខ្យល់` outside KaTeX delimiters.
  - Maintained `<!-- Page p107.png -->` through `<!-- Page p115.png -->` markers and updated `STATUS.md`.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់"` (21 files checked, 0 warnings) and `npm run check:digits`.


## 17 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 24: Lesson 3 Exponential Functions Exercises Part 5 (Pages 101 to 200 Complete)

Commit: pending. **No database step needed.**

Digitized and audited Batch 24 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p197.png` to `p205.png`, Book pages 192 to 200), completing the full target scope of Book pages 1 to 200 (PDF pages 1 to 205 across 25 audited OCR files):
- **Textbook Rendering & OCR**: Rendered scans and transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/lesson3-exponential-functions-exercises-part5.md`, covering:
  - Exercise 7 (conclusion): Part B variation table of $f(x) = e^{-x} + e^x - x$ (`p197`), oblique asymptote $(D) : y = x + 1$ at $+\infty$, relative position, tangent $(\Delta) : y = x + 2.35$ at $M(-1/2, 1.85)$, value tables, and curve plotting of $(C)$, $(D)$, and $(\Delta)$.
  - Exercise 8 (complete): study of $f(x) = -x - 2 + \frac{4e^x}{e^x + 1}$ (parts ក through ង), boundary limits at $\pm\infty$, oblique asymptotes $y = -x - 2$ and $y = -x + 2$, derivative $f'(x) \le 0$, variation table, inflection point and center of symmetry $O(0, 0)$, curve plotting, and graphical inequality $\frac{4e^x}{e^x + 1} \ge x + 2$ giving $x \in (-\infty, 0]$.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 9 pages (`p197.png` to `p205.png`):
  - Added missing errata notes on `p203` documenting both the misprinted $f'(x)$ row label and reversed signs (`-`/`+` and `(-) ទៅ (+)`) in the $f''(x)$ sign table, plus omitted Khmer word `«ជា»` on `p204`.
  - Documented printed textbook typos with explanatory notes: omitted `\lim_{x \to +\infty}` (`p197`), `+1` inside exponent (`p198`), semicolon `;` in `(\Delta)` and `(T)` label on line `(D)` (`p199`), omitted `«នោះ»` (`p203`), `= 4 - 4 = 0` arithmetic typo (`p204`), and `(\Delta) : y = m` prompt slip (`p205`).
  - Maintained `<!-- Page p197.png -->` through `<!-- Page p205.png -->` markers and updated `STATUS.md` (all 25 OCR files written and audited).
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (26 files checked, 0 warnings), `npm run check:digits`, `npm run check:content`, `npx oxlint`, `npx tsc -b`, and `npm test`.


## 17 Nov 2026: History Workbook (Sam Saboeun & Sin Kamsot): Batch 11 (Ch 3 Lesson 3 Thailand) OCR & Audit

Commit: pending. **No database step needed.**

Completed OCR-only transcription and blind visual audit of Batch 11 (`sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន/ch3-lesson3-thailand.md`, PDF pages `p080.png` to `p082.png`, Book pp. 70-72):
- Covered Chapter 3 Lesson 3 (`ប្រទេសថៃ`): reforms of King Mongkut & Chulalongkorn against European colonialism (`I`, Q1-Q3) and the 1932 Siamese revolution & 1939 name change from Siam to Thailand (`II`, Q1-Q3). Dotted student answer blocks replaced with `*(ចម្លើយសិស្ស)*`.
- Blind visual audit inspected all 3 PNGs codepoint-by-codepoint (and checked `p083.png` boundary), preserving printed `នឹង` (`*(កំហុសបោះពុម្ពនៃ និង)*`) verbatim (0 discrepancies).
- **KruAI RAG: NO (OCR only)** (no RAG chunks exist or added).
- **Verification**: `node scripts/ocr-check.mjs "sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន"` passed (`13 pages checked, 0 to look at by hand`), and `npm run check:digits` passed (`0 Khmer numerals`).


## 17 Nov 2026: History Workbook (Sam Saboeun & Sin Kamsot): Batch 10 (Ch 3 Lesson 2 Vietnam) OCR & Audit

Commit: pending. **No database step needed.**

Completed OCR-only transcription and blind visual audit of Batch 10 (`sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន/ch3-lesson2-vietnam.md`, PDF pages `p072.png` to `p079.png`, Book pp. 62-69):
- Covered Chapter 3 Lesson 2 (`ប្រទេសវៀតណាម`): anti-French independence struggle (`I`, Q1-Q7), war against the US (`II`, Q1-Q8), and socialist construction / Doi Moi reforms (`III`, Q1-Q4). Dotted student answer blocks replaced with `*(ចម្លើយសិស្ស)*`.
- Blind visual audit restored missing `ពីបារាំង` in the Section I heading (`p072.png`) and corrected an OCR hallucination in Section II Q1 (`តើសន្ធិសីទក្រុងហ្សឺណែវឆ្នាំ1954` with print-typo annotation on `p074.png`), preserving printed skipped numbering (`6.` in Section I, `3.` in Section III) and `1969` verbatim.
- **KruAI RAG: NO (OCR only)** (brief Doi Moi mention exists in `tb:hist:practice:exams-1-to-5-bacii-qna`; no new RAG chunks added).
- **Verification**: `node scripts/ocr-check.mjs "sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន"` passed (`12 pages checked, 0 to look at by hand`), and `npm run check:digits` passed (`0 Khmer numerals`).


## 17 Nov 2026: History Workbook (Sam Saboeun & Sin Kamsot): Batch 9 (Ch 3 Lesson 1 Southeast Asia Post-WWII) OCR & Audit

Commit: pending. **No database step needed.**

Completed OCR-only transcription and blind visual audit of Batch 9 (`sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន/ch3-lesson1-southeast-asia-post-wwii.md`, PDF pages `p066.png` to `p071.png`, Book pp. 56-61):
- Covered Chapter 3 title page (`ជំពូកទី 3៖ ប្រវត្តិសាស្ត្រតំបន់ក្នុងសង្គ្រាមត្រជាក់`) and Lesson 1 (`បម្រែបម្រួលសង្គមអាស៊ីអាគ្នេយ៍ក្រោយសង្គ្រាមលោកលើកទី 2`): anti-colonial independence struggles (`I. ចលនាតស៊ូទាមទារឯករាជ្យ`, Q1-Q3) and Cold War turmoil across Southeast Asia (`II. ភាពវឹកវរនៃបណ្តាលប្រទេសអាស៊ីអាគ្នេយ៍ក្នុងដំណាក់កាលសង្គ្រាមត្រជាក់`, Q4-Q10). Dotted student answer blocks replaced with `*(ចម្លើយសិស្ស)*`.
- Blind visual audit verified all 6 PNGs line-by-line, restored printed duplicate numbering `5.` (with typo note `*(កំហុសបោះពុម្ពនៃលេខរៀង 6.)*` on `p069.png`), and kept annotated source print typos (`អាស៊ីគ្នេយ៍`, `បណ្តាល`).
- **KruAI RAG: NO (OCR only)** (brief overview already exists in `tb:hist:practice:exams-1-to-5-bacii-qna`; no new RAG chunks added).
- **Verification**: `node scripts/ocr-check.mjs "sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន"` passed (`11 pages checked, 0 to look at by hand`), and `npm run check:digits` passed (`0 Khmer numerals`).


## 17 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 23: Lesson 3 Exponential Functions Exercises Part 4

Commit: pending. **No database step needed.**

Digitized and audited Batch 23 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p188.png` to `p196.png`, Book pages 183 to 191):
- **Textbook Rendering & OCR**: Rendered scans and transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/lesson3-exponential-functions-exercises-part4.md`, covering:
  - Exercise 6 (conclusion): derivative sign table and variation table of $f(x) = (4 - 2x)e^x$ (maximum $2e$ at $x = 1$), tangent line $(T) : y = 2x + 4$, auxiliary function $g(x) = f(x) - (2x + 4)$ sign and variation table, relative position, value table, curve plotting of $(C)$ and $(T)$, antiderivative $F(x) = 2e^x(3 - x)$ verification, and shaded region area $S = 2e^2 - 6$ square units.
  - Exercise 7 (start): full problem statement (Parts A and B) for $h(x) = 1 - e^{-x} - e^x$ and $f(x) = e^{-x} + e^x - x$, plus solutions for Part A (variation table and sign of $h(x)$) and Part B (start of $f'(x) = e^{-2x}h(x)$ and boundary limits at $-\infty$ and $+\infty$).
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 9 pages (`p188.png` to `p196.png`):
  - Fixed Khmer subscript spelling `ប្តូរ` to `ប្ដូរ` (`p188`), split `$$= 2e^2(3 - 2) - 2e^0(3 - 0) = 2e^2 - 6$$` onto its own line before `ឯកតាផ្ទៃ` (`p193`), and updated figure descriptions on `p192` and `p193` to remove unprinted black dots and match only the origin marker $(0, 0)$ and shaded region boundary.
  - Preserved printed textbook typos with explanatory notes (`g(x)` for `g'(x)` and `g'(0) = 2` on `p189`, missing `-\infty` table ends on `p190`, and `(\vec{o}, \vec{i}, \vec{j})` on `p194`).
  - Maintained `<!-- Page p188.png -->` through `<!-- Page p196.png -->` markers and updated `STATUS.md` (`OCR Written: YES`, `OCR Audited: YES`).
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (25 files checked, 0 warnings), `npm run check:digits`, `npx oxlint`, and `npx tsc -b`.


## 17 Nov 2026: Grade 12 Chemistry OCR: Chapter 5 Lesson 2 (Gas Laws)

Commit: pending. **No database step needed.**

Digitized and audited Grade 12 Chemistry Chapter 5 Lesson 2 (`sources/textbooks/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់.pdf`, PDF pages `p102.png` bottom half to `p107.png` top half):
- **Textbook OCR**: Transcribed into `sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់/chapter5-lesson2-gas-laws.md`, covering Boyle's Law ($P_1V_1 = P_2V_2$), Charles's Law ($V_1/T_1 = V_2/T_2$), Gay-Lussac's Law ($P_1/T_1 = P_2/T_2$), Avogadro's Law ($V = k \cdot n$), questions 1–16, and worked solutions/calculations 1–16. Also corrected `STATUS.md` Chapter 5 boundaries (split into 3 distinct lessons matching the printed book: Lesson 2 ends on `p107.png`, Lesson 3 begins on `p107.png`).
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 6 pages (`p102.png`–`p107.png`):
  - Fixed Khmer spelling and OCR errors (`សម្រុះ` -> `សមុទ្រ`, `អង្កាសែលស្យុស` -> `អង្សាសែលស្យុស`, restored missing `រ` in `ថេរ`, restored missing `ត្រង់` and `៖`).
  - Moved `នាំអោយ` outside KaTeX math blocks and kept all `$$...$$` display blocks on dedicated lines.
  - Maintained `<!-- Page p102.png -->` through `<!-- Page p107.png -->` markers.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់"` (20 files checked, 0 warnings) and `npm run check:digits`.


## 16 Nov 2026: Grade 12 Chemistry OCR: Chapter 5 Lesson 1 (Gas Properties)

Commit: pending. **No database step needed.**

Digitized and audited Grade 12 Chemistry Chapter 5 Lesson 1 (`sources/textbooks/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់.pdf`, PDF pages `p100.png` to `p102.png` top half):
- **Textbook OCR**: Transcribed into `sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់/chapter5-lesson1-gas-properties.md`, covering summary of gas characteristics (fluidity, low density, compressibility, diffusion), molecular collisions and pressure origin, pressure conversion table (Atm, Bar, mmHg, Pa, Psi, torr), questions 1–7, and detailed answers/calculations 1–7.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit against `p100.png`–`p102.png` scans:
  - Corrected `បង្រួមបាន` to authentic textbook terminology `បំណែនបាន` (compressibility).
  - Clarified question wording and noted printed typo in calculation for tire pressure ($42\text{ psi}$ vs textbook misprint of $32\text{ psi}$).
  - Maintained `<!-- Page p100.png -->` to `<!-- Page p102.png -->` markers.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់"` (19 pages checked, 0 warnings) and `npm run check:digits`.



## 16 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 22: Lesson 3 Exponential Functions Exercises Part 3

Commit: pending. **No database step needed.**

Digitized and audited Batch 22 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p179.png` to `p187.png`, Book pages 174 to 182):
- **Textbook Rendering & OCR**: Rendered scans and transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/lesson3-exponential-functions-exercises-part3.md`, covering:
  - Exercise 4 (conclusion): variation table of $h(x)$, relative position of $(C_1)$ and $(C_2)$, value tables, and graph plotting description.
  - Exercise 5 (complete): Part A ($g(x) = e^x(1 - x) - 1$: derivative sign table, variation table, negativity proof) and Part B ($f(x) = (2 - x)e^x + 2 - x$: limits, variation table, oblique asymptote $(D) : y = 2 - x$, relative position, tangent $(\Delta) : y = -x + 2 + e$, inflection point $I(0, 4)$, and graph plotting).
  - Exercise 6 (start): problem statement (Q1 to Q6) for $f(x) = (4 - 2x)e^x$ and $F(x) = 2e^x(3 - x)$, plus Q1 boundary limits at $-\infty$ and $+\infty$.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 9 pages (`p179.png` to `p187.png`):
  - Clarified rendered scan intersection visually crossing below $y = -4$ in the Exercise 4 figure description (`p180`).
  - Documented printed textbook typos with explanatory notes: `h(x) < 0` on $(\alpha, +\infty)$ (`p179`), `(C_2)` label printing `f(x)` instead of `g(x)` (`p180`), omitted `ផ្នែក A` solution header (`p181`), `- 2 + x` sign typos in $(D)$ limit (`p183`), and `ពីក្រោមលើ` plus `e + 1 = 3.7` (`p184`).
  - Maintained `<!-- Page p179.png -->` through `<!-- Page p187.png -->` markers and updated `STATUS.md` (`OCR Written: YES`, `OCR Audited: YES`).
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (24 files checked, 0 warnings), `npm run check:digits`, `npx oxlint`, and `npx tsc -b`.


## 16 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 21: Lesson 3 Exponential Functions Exercises Part 2

Commit: pending. **No database step needed.**

Digitized and audited Batch 21 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p170.png` to `p178.png`, Book pages 165 to 173):
- **Textbook Rendering & OCR**: Rendered scans and transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/lesson3-exponential-functions-exercises-part2.md`, covering:
  - Exercise 3 (conclusion): horizontal asymptote $(L) : y = -1$ and relative position, tangent line $(T) : y = ex + 1.7$, variation table of $f$, Part B ($g(x) = -\frac{1}{2}x^2$, sign table of $g'(x)$, variation table of $g$, relative position between $(C)$ and $(P)$, value tables, and curve plotting).
  - Exercise 4 (start): full problem statement (Parts 1 to 3) for $f(x) = x - e^x$ and $g(x) = (1 - x)e^x$, Part 1 (oblique asymptote $(\Delta) : y = x$, relative position, variation tables of $f$ and $g$), and Part 2 ($h'(x) = 1 - g(x)$, unique root $\alpha \in [1, 2]$, start of relative position between $(C_1)$ and $(C_2)$).
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 9 pages (`p170.png` to `p178.png`):
  - Added explanatory erratum note on `p176` documenting textbook notation `$y_C$` written instead of `$y_{C_1}$`.
  - Documented printed textbook typos with explanatory notes: `\forall x \in \mathbb{R}` vs `\forall x_0`, `=` used for rounded estimates, Khmer typo `ជាអនុគមន៍ លើចុះ` (`p171`), unprinted `ផ្នែក B` header (`p172`), strict inequality `g'(x) > 0` despite `g'(0) = 0` and omitted table endpoints (`p173`), and `(C)` vs `(C_1)` (`p175`).
  - Maintained `<!-- Page p170.png -->` through `<!-- Page p178.png -->` markers and updated `STATUS.md` (`OCR Written: YES`, `OCR Audited: YES`).
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (23 files checked, 0 warnings), `npm run check:digits`, `npx oxlint`, and `npx tsc -b`.


## 16 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 20: Lesson 3 Exponential Functions Exercises Part 1

Commit: pending. **No database step needed.**

Digitized and audited Batch 20 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p161.png` to `p169.png`, Book pages 156 to 164):
- **Textbook Rendering & OCR**: Rendered scans and transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/lesson3-exponential-functions-exercises-part1.md`, covering section `3.9 ផ្នែកលំហាត់`:
  - Exercise 1 (complete): study of $f(x) = \frac{e^x - 2}{e^x + 1}$ (domain $\mathbb{R}$, limits, horizontal asymptotes $y = -2$ and $y = 1$, derivative, variation table, symmetry center $I(0, -1/2)$, tangent line $(T) : y = \frac{3}{4}x - \frac{1}{2}$, x-intercept $(\ln 2, 0)$, and curve plotting).
  - Exercise 2 (complete): Part A $f(x) = xe^x$ (limits, derivative sign table, variation table with minimum $-1/e$) and Part B $g(x) = \frac{1}{2}x^2$, $h(x) = f(x) - g(x)$ (variation of $h$, relative position of $(C)$ and $(C')$, value tables, and curve plotting).
  - Exercise 3 (start): problem statement (Parts A and B) for $f(x) = (x + 1)e^{-x} - 1$ and $g(x) = f(x) + \frac{x^2}{2}$, plus Part A Q1 boundary limits at $-\infty$ and $+\infty$.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 9 pages (`p161.png` to `p169.png`):
  - Removed unprinted `-\infty` and `+\infty` endpoints from the $h(x)$ variation table (`p168`) to match the textbook table layout and added an explanatory note.
  - Documented printed textbook typos with explanatory notes: callout limit sign (`p161`), extra minus sign `(-1)e^{-1} -` (`p166`), callout `h(x) =` vs `h'(x) =` (`p167`), `-0.36` vs `-0.37` rounding (`p168`), and prompt label slips `(C)` vs `(L)`, `(L)` vs `(T)`, stray `f` (`p169`).
  - Maintained `<!-- Page p161.png -->` through `<!-- Page p169.png -->` markers and updated `STATUS.md` (`OCR Written: YES`, `OCR Audited: YES`).
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (22 files checked, 0 warnings), `npm run check:digits`, `npx oxlint`, and `npx tsc -b`.


## 16 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 19: Lesson 3 Exponential Functions Theory (3.1 to 3.8)

Commit: pending. **No database step needed.**

Digitized and audited Batch 19 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p157.png` to `p160.png`, Book pages 152 to 155), beginning Lesson 3 (Exponential Functions):
- **Textbook Rendering & OCR**: Rendered scans and transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/lesson3-exponential-functions-theory.md`, covering sections 3.1 to 3.8: definition $\exp(x) = e^x$, 9 fundamental properties, domain table, 7 standard limits and 5 corollaries, continuity and derivatives of $e^x$ and $e^{u(x)}$, curve $y = e^x$ symmetry with $y = \ln x$ across $y = x$, base-$a$ exponential function $a^x$, inequalities table, derivative $(a^x)' = a^x \ln a$, and base-$a$ limit table.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 4 pages (`p157.png` to `p160.png`):
  - Reordered Section 3.2 bullets (`p157`) to match visual column/row order, restored missing Khmer colon `៖` (`p158`), indented nested equivalence under its parent bullet (`p160`), and added visible axis tick range `[-3, 4]` to the graph description (`p159`).
  - Documented printed textbook typos with explanatory notes: stray log formula note (`p158`), spelling typo `អាចដកដេរីវេបាន` (`p159`), and $a^x = e^{x\log(x)}$ base typo (`p160`).
  - Maintained `<!-- Page p157.png -->` through `<!-- Page p160.png -->` markers and updated `STATUS.md` (`OCR Written: YES`, `OCR Audited: YES`).
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (21 files checked, 0 warnings), `npm run check:digits`, `npx oxlint`, and `npx tsc -b`.


## 16 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 18: Lesson 2 Logarithmic Functions Exercises Part 10 (Lesson 2 Complete)

Commit: pending. **No database step needed.**

Digitized and audited Batch 18 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p149.png` to `p156.png`, Book pages 144 to 151), concluding Lesson 2 (Logarithmic Functions, Book pp. 67 to 151 across 10 parts):
- **Textbook Rendering & OCR**: Rendered scans and transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/lesson2-logarithmic-functions-part10.md`, covering:
  - Exercise 16 (conclusion): derivative identity $f'(x) = \frac{g(x^2)}{x(1 + x^2)^2}$, variation table of $f$, extremum value $f(\sqrt{x_0}) = \frac{1}{2x_0}$, and curve plotting of $(C)$.
  - Exercise 17 (complete): full problem and solution for $f(x) = \ln\left(\frac{1 + x}{1 - x}\right)$ (Parts 1 to 6), domain $(-1, 1)$, derivative $f'(x) = \frac{2}{1 - x^2}$, odd symmetry, variation table, tangent line $(T) : y = 2x$ at origin $O$, inequalities $f'(t) \ge 2$ and $f(x) \ge 2x$ via integration, curve plotting with vertical asymptotes $x = \pm 1$, bounded area $A(\lambda)$, and limit $\lim_{\lambda \to 1^-} A(\lambda) = 2\ln 2$.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 8 pages (`p149.png` to `p156.png`):
  - Clarified tangency and crossing at origin $I(0, 0)$ in Exercise 17 figure description (`p155`).
  - Documented printed textbook typos with explanatory notes: missing exponent `2` on `(1 + x^2)` (`p149`), interval wording `គ្រប់ចំនួនពិត t` (`p151`) and `\lambda \in (0, 1]` endpoint note (`p151`), sign slip `(1 - x) - (x + 1)` (`p152`), omitted differential `dx` after `f'(x)` (`p155`), and limit index `\lambda \to 0^+` plus omitted unit-area factor `4\text{cm}^2` (`p156`).
  - Maintained `<!-- Page p149.png -->` through `<!-- Page p156.png -->` markers and updated `STATUS.md` (`OCR Written: YES`, `OCR Audited: YES`).
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (20 files checked, 0 warnings), `npm run check:digits`, `npx oxlint`, and `npx tsc -b`.


## 16 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 17: Lesson 2 Logarithmic Functions Exercises Part 9

Commit: pending. **No database step needed.**

Digitized and audited Batch 17 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p141.png` to `p148.png`, Book pages 136 to 143):
- **Textbook Rendering & OCR**: Rendered scans and transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/lesson2-logarithmic-functions-part9.md`, covering:
  - Exercise 15 (conclusion): Part A (monotonicity, limit at $+\infty$, variation table and sign of $g$), Part B (limits at $0^+$ and $+\infty$, right-hand differentiability and vertical half-tangent at $x = 0$, $f'(x) = g(x)$ proof, oblique asymptote $(d) : y = \frac{x}{4} + \frac{5}{2}$, value table and curve plotting of $(d)$ and $(C)$).
  - Exercise 16 (start): full problem statement (Parts 1 and 2) plus solutions for 1.ក to គ ($g'$ sign table, variation table of $g$, unique root $x_0 \in (3.5, 3.6)$) and 2.ក (derivative $f'(x) = \frac{1 + x^2 - 2x^2\ln x}{x(1 + x^2)^2}$).
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 8 pages (`p141.png` to `p148.png`):
  - Restored printed Khmer typo `អរណរម៉ាល់` (`p146`) with an explanatory erratum note and corrected Khmer coeng subscript `កណ្តាល` to `កណ្ដាល` (`p147`).
  - Documented printed textbook typos with explanatory notes: omitted `> 0` after `f'(x)` (`p143`) and omitted `+\frac{5}{2}` on LHS of oblique asymptote limit (`p144`).
  - Maintained `<!-- Page p141.png -->` through `<!-- Page p148.png -->` markers and updated `STATUS.md` (`OCR Written: YES`, `OCR Audited: YES`).
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (19 files checked, 0 warnings), `npm run check:digits`, `npx oxlint`, and `npx tsc -b`.


## 16 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 16: Lesson 2 Logarithmic Functions Exercises Part 8

Commit: pending. **No database step needed.**

Digitized and audited Batch 16 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p132.png` to `p140.png`, Book pages 127 to 135):
- **Textbook Rendering & OCR**: Rendered scans and transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/lesson2-logarithmic-functions-part8.md`, covering:
  - Exercise 13 (conclusion): boundary limits, sign table, variation table with minimum $\ln 2$ at $x = 0$, oblique asymptote $(T) : y = -x$, relative position, infinite branch at $+\infty$, and curve plotting for $f(x) = \ln(x + 1 + e^{-x})$.
  - Exercise 14 (complete): study of $f(x) = \ln(1 + e^{-x}) + \frac{1}{3}x$ (Parts 1 to 3), oblique asymptotes $(D) : y = \frac{1}{3}x$ and $(T) : y = -\frac{2}{3}x$, derivative $f'(x) = \frac{e^x - 2}{3(e^x + 1)}$, variation table with minimum $(\ln 2, 0.63)$, and curve construction.
  - Exercise 15 (start): full problem statement (Parts A and B) on `p140.png`.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 9 pages (`p132.png` to `p140.png`):
  - Fixed PDF-justification word breaks in Khmer prose on `p136` (`អរតូណរម៉ាល់`) and `p140` (`កំណត់យក $(d)$ ជាបន្ទាត់ដែលមានសមីការ`).
  - Documented printed textbook typos with explanatory notes: reversed `f'(x)` inequalities (`p132`), sign/monotonicity errors against $(T) : y = -x$ (`p134`), `អ័ក្សអរដោនេ` vs `អ័ក្សអាប់ស៊ីស` (`p135`), omitted minus sign in $(D)$ asymptote limit (`p138`), and second value table label `$(D)$` (`p139`).
  - Maintained `<!-- Page p132.png -->` through `<!-- Page p140.png -->` markers and updated `STATUS.md` (`OCR Written: YES`, `OCR Audited: YES`).
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (18 files checked, 0 warnings), `npm run check:digits`, `npx oxlint`, and `npx tsc -b`.


## 16 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 15: Lesson 2 Logarithmic Functions Exercises Part 7

Commit: pending. **No database step needed.**

Digitized and audited Batch 15 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p124.png` to `p131.png`, Book pages 119 to 126):
- **Textbook Rendering & OCR**: Rendered scans and transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/lesson2-logarithmic-functions-part7.md`, covering:
  - Exercise 11 (conclusion): definite integral area calculation $S = \frac{3}{2}$ square units.
  - Exercise 12 (complete): study of $f(x)$ on $(-\infty, 0) \cup (1, +\infty)$, limits, vertical asymptotes, derivative sign table, extrema $f(-1) = 1.2$ and $f(2) = -1.7$, variation table, oblique asymptote $(L) : y = -\frac{x}{2}$, curve construction, and graphical parameter discussion for $a$.
  - Exercise 13 (start): full problem statement (Parts 1 to 3) plus solutions for 1.ក, 1.ខ ($u'(x) = 1 - e^{-x}$ sign and variation table, $u(x) > 0$), and 2.ក ($D_f = \mathbb{R}$).
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 8 pages (`p124.png` to `p131.png`):
  - Fixed misread Khmer cross-reference `1.2` to `1. ខ` (`p131`), restored printed spelling `គូអរដោនេ` (`p130`) and `នឹង` (`p129`) with explanatory notes, and converted bullet display-math lines (`p125`, `p126`) so every `$$...$$` block sits on its own line.
  - Documented printed textbook typos with explanatory notes: `អាស៊ីមតូតទ្រេត` vs `អាស៊ីមតូតឈរ` and callout `\ln(ab)` (`p126`), `y = m` and closed interval `[1.2, +\infty]` (`p129`), and `ទារក` (`p130`).
  - Maintained `<!-- Page p124.png -->` through `<!-- Page p131.png -->` markers and updated `STATUS.md` (`OCR Written: YES`, `OCR Audited: YES`).
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (17 files checked, 0 warnings), `npm run check:digits`, `npx oxlint`, and `npx tsc -b`.


## 16 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 14: Lesson 2 Logarithmic Functions Exercises Part 6

Commit: pending. **No database step needed.**

Digitized and audited Batch 14 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p115.png` to `p123.png`, Book pages 110 to 118):
- **Textbook Rendering & OCR**: Rendered scans and transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/lesson2-logarithmic-functions-part6.md`, covering:
  - Exercise 10 (conclusion): Part B (limits at $+\infty$, oblique asymptote $(\Delta) : y = \frac{1}{2}x - 1$, relative position, derivative $f'(x) = \frac{g(x)}{2x^2}$, variation table, intermediate value root $\alpha \in [1, 2]$, tangent line $(T) : y = \frac{3}{2}x - 2$, graph construction) and Part C ($h'(x) = \frac{\ln x}{x}$, integral $\int_2^e \frac{\ln x}{x}\,dx$, and bounded area $S = 0.25$).
  - Exercise 11 (start): full problem statement (Parts A and B) plus Part A ($g(x) = 3 - 3\ln x + x^3$: derivative factorization, sign table, variation table, positivity proof) and Part B (limits at $0^+$ and $+\infty$, derivative $f'(x) = \frac{g(x)}{x^2}$, variation table, relative position with parabola $(P) : y = \frac{1}{2}x^2 + 1$, and shaded area curve construction).
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 9 pages (`p115.png` to `p123.png`):
  - Fixed missing Khmer colons `៖` after `នោះ` in relative position bullets (`p115`), removed extraneous `<br>` tags in variation table boundary cells (`p121`), and fixed variation table indentation (`p122`).
  - Documented printed textbook typos with explanatory notes: boxed $-\infty$ sign mismatch (`p115`), $x = -2$ vs $2$ in value table (`p117`), missing derivative prime in $h'(x)$ (`p118`), rounding/truncation note for $0.25$ (`p118`), Khmer typo `អ័ក្យអាប់ស៊ីស` (`p119`), omitted factor $3$ in $g'(x)$ (`p120`), and omitted $\Rightarrow f'(x) =$ plus missing prime and sign erratum (`p122`).
  - Maintained `<!-- Page p115.png -->` through `<!-- Page p123.png -->` markers and updated `STATUS.md` (`OCR Written: YES`, `OCR Audited: YES`).
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (16 files checked, 0 warnings), `npm run check:digits`, `npx oxlint`, and `npx tsc -b`.


## 16 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 13: Lesson 2 Logarithmic Functions Exercises Part 5

Commit: pending. **No database step needed.**

Digitized and audited Batch 13 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p106.png` to `p114.png`, Book pages 101 to 109):
- **Textbook Rendering & OCR**: Rendered scans and transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/lesson2-logarithmic-functions-part5.md`, covering:
  - Exercise 8 (conclusion): derivative sign and variation table of $f(x) = x - \frac{\ln(1 + x)}{1 + x}$, intersection point $A(0, 0)$ with line $(D) : y = x$, and coordinate graph description.
  - Exercise 9 (complete): study of $f(x) = \ln(1 + e^{-x}) + \frac{1}{3}x$ (parts ក through ឆ), limits at $+\infty$ and $-\infty$, oblique asymptotes $(D) : y = \frac{1}{3}x$ and $(D') : y = -\frac{2}{3}x$, relative positions, derivative $f'(x) = \frac{e^x - 2}{3(e^x + 1)}$, variation table, minimum at $(\ln 2, 0.63)$, and combined graph plot description.
  - Exercise 10 (start): problem statement (Parts A, B, C) plus Part A ($g(x) = x^2 - 2\ln x + 2$: derivative sign, variation table, proof $g(x) > 0$) and Part B 1.ក to ខ (limit at $0$ and vertical asymptote $(D) : x = 0$).
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 9 pages (`p106.png` to `p114.png`):
  - Corrected Khmer vowel OCR slip `មានឬស` to `មានឫស` (`p112`) and added explanatory note for printed vector notation $\vec{O}$ in `$(\vec{O}, \ \vec{i}, \ \vec{j})$`.
  - Documented printed textbook typos with explanatory notes: `$x_D$` on RHS (`p106`), `$\ln 1 + 0 = 0$` (`p109`), omitted `$e^x$` numerator (`p110`), maximum vs minimum wording (`p111`), omitted factor `$2$` (`p113`), and boxed `$+\infty$` sign mismatch (`p114`).
  - Maintained `<!-- Page p106.png -->` through `<!-- Page p114.png -->` markers and updated `STATUS.md` (`OCR Written: YES`, `OCR Audited: YES`).
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (15 files checked, 0 warnings), `npm run check:digits`, `npx oxlint`, and `npx tsc -b`.


## 16 Nov 2026: History Workbook (Sam Saboeun & Sin Kamsot): Batch 8 (Ch 2 Lesson 6 Kingdom of Cambodia II — Ch 2 Complete) OCR & Audit

Commit: pending. **No database step needed.**

Completed OCR-only transcription and blind visual audit of Batch 8 (`sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន/ch2-lesson6-kingdom-of-cambodia-second.md`, PDF pages `p063.png` to `p065.png`, Book pp. 53-55), completing **all of Chapter 2 (History of Cambodia)**:
- Covered Chapter 2 Lesson 6 (`ព្រះរាជាណាចក្រកម្ពុជាទី 2 1993-បច្ចុប្បន្ន`): 5 questions covering the 1993 UNTAC elections, dual-PM coalition, 1993-1998 national reconstruction, Triangular Strategy, and Rectangular Strategy (annotating the printed `3.` typo for `4.` on `p064.png`). Dotted student answer blocks replaced with `*(ចម្លើយសិស្ស)*`.
- **KruAI RAG: YES (already grounded)** under `HISTORY_CH6_SECTIONS` in `server/textbook-search.ts` (`tb:hist:koc:ch6:*`). No conflicting dates found; no new RAG chunks added.
- **Verification**: `node scripts/ocr-check.mjs "sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន"` passed (`10 pages checked, 0 to look at by hand`), and `npm run check:digits` passed (`0 Khmer numerals`).


## 16 Nov 2026: History Workbook (Sam Saboeun & Sin Kamsot): Batch 7 (Ch 2 Lesson 5 PRK and State of Cambodia) OCR & Audit

Commit: pending. **No database step needed.**

Completed OCR-only transcription and blind visual audit of Batch 7 (`sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន/ch2-lesson5-prk-and-soc.md`, PDF pages `p054.png` to `p062.png`, Book pp. 44-52):
- Covered Chapter 2 Lesson 5 (`របបសាធារណរដ្ឋប្រជាមានិតកម្ពុជា និងរដ្ឋកម្ពុជា 1979-1993`): 2 Dec 1978 Front and 7 Jan 1979 liberation (`I`), post-1979 state-building and solidarity groups (`II`), and 1982 tripartite coalition, 1989 constitutional reforms, 1991 Paris Peace Accords, and 1993 UNTAC elections (`III`). Dotted student answer blocks replaced with `*(ចម្លើយសិស្ស)*`.
- Blind visual audit inspected all 9 PNGs and annotated workbook print typos (`1979-1999` for `1979-1993` on `p054.png`, `ចរចារ`, `ស្តីសន្តិភាព`, and `បេសកម្ម` on `p060.png`).
- **KruAI RAG: YES (already grounded)** under `HISTORY_CH5_SECTIONS` in `server/textbook-search.ts` (`tb:hist:prk:ch5:*`). No conflicting dates found; no new RAG chunks added.
- **Verification**: `node scripts/ocr-check.mjs "sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន"` passed (`9 pages checked, 0 to look at by hand`), and `npm run check:digits` passed (`0 Khmer numerals`).


## 16 Nov 2026: History Workbook (Sam Saboeun & Sin Kamsot): Batch 6 (Ch 2 Lesson 4 Part 2 Democratic Kampuchea Complete) OCR & Audit

Commit: pending. **No database step needed.**

Completed OCR-only transcription and blind visual audit of Batch 6 (`sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន/ch2-lesson4-part2-democratic-kampuchea.md`, PDF pages `p048.png` to `p053.png`, Book pp. 38-43), completing Chapter 2 Lesson 4:
- Covered continuation of `III. សោកនាដកម្ម` (Q3-Q4), `IV. ការផ្តួលរលំរបបកម្ពុជាប្រជាធិបតេយ្យ` (Q1-Q4, including the 1976 purge policy), and `V. ការបង្កើតសាលាក្តីកាត់ទោសមេដឹកនាំខ្មែរក្រហម` (Q1-Q4 on the ECCC). Dotted student answer blocks replaced with `*(ចម្លើយសិស្ស)*`.
- Blind visual audit inspected all 6 PNGs, removed a line-wrap space artifact (`បានបង្ក ផលវិបាក` -> `បានបង្កផលវិបាក`), and annotated printed workbook typos (`ស្វែងអ្នក`, `ចូលបង្ហាញ`, `...កាត់ទោសមេដឹកនាំខ្មែរក្រហមកាត់ទោស`).
- **KruAI RAG: YES (already grounded)** under `HISTORY_CH4_SECTIONS` in `server/textbook-search.ts` (`tb:hist:dk:ch4:*`). No conflicting dates found; no new RAG chunks added.
- **Verification**: `node scripts/ocr-check.mjs "sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន"` passed (`8 pages checked, 0 to look at by hand`), and `npm run check:digits` passed (`0 Khmer numerals`).


## 16 Nov 2026: History Workbook (Sam Saboeun & Sin Kamsot): Batch 5 (Ch 2 Lesson 4 Part 1 Democratic Kampuchea) OCR & Audit

Commit: pending. **No database step needed.**

Completed OCR-only transcription and blind visual audit of Batch 5 (`sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន/ch2-lesson4-part1-democratic-kampuchea.md`, PDF pages `p042.png` to `p047.png`, Book pp. 32-37):
- Covered Chapter 2 Lesson 4 Part 1 (`កម្ពុជាប្រជាធិបតេយ្យ 1975-1979`): leadership & administrative zones (`I. រចនាសម្ព័ន្ធដឹកនាំ`), Super Great Leap Forward & cooperatives/marriages/education (`II. នយោបាយមហាលោតផ្លោះមហាអស្ចារ្យ`), and start of purges/security centers (`III. សោកនាដកម្ម`, Q1-Q2). Dotted student answer blocks replaced with `*(ចម្លើយសិស្ស)*`.
- Blind visual audit restored missing word `កាប់` (`កាន់កាប់អំណាច` on `p045.png`) and annotated two source workbook print typos (`សមូហាភារូបនីយកម្ម`, `វិរិសុទ្ធកម្ម`).
- **KruAI RAG: YES (already grounded)** under `HISTORY_CH4_SECTIONS` in `server/textbook-search.ts` (`tb:hist:dk:ch4:*`). No conflicting dates found; no new RAG chunks added.
- **Verification**: `node scripts/ocr-check.mjs "sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន"` passed (`7 pages checked, 0 to look at by hand`), and `npm run check:digits` passed (`0 Khmer numerals`).


## 16 Nov 2026: History Workbook (Sam Saboeun & Sin Kamsot): Batch 4 (Ch 2 Lesson 3 Khmer Republic) OCR & Audit

Commit: pending. **No database step needed.**

Completed OCR-only transcription and blind visual audit of Batch 4 (`sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន/ch2-lesson3-khmer-republic.md`, PDF pages `p033.png` to `p041.png`, Book pp. 23-31):
- Covered Chapter 2 Lesson 3 (`សាធារណរដ្ឋខ្មែរ 1970-1975`) across all 5 sections: rise of the Khmer Republic and 18 March 1970 coup (`I`), socio-economic conditions during the war (`II`), 1970-1975 civil war (`III`), fall of the Khmer Republic (`IV`), and war damages and consequences (`V`). Dotted student answer blocks replaced with `*(ចម្លើយសិស្ស)*`.
- Blind visual audit inspected all 9 PNGs line-by-line, verified source print quirks (repeated `3.` on `p034.png`, skipped `3.` on `p037.png`/`p038.png`), and annotated the `19070-1975` printing typo on `p038.png` (`*(កំហុសបោះពុម្ពនៃឆ្នាំ 1970-1975)*`).
- **KruAI RAG: YES (already grounded)** under `HISTORY_CH3_SECTIONS` in `server/textbook-search.ts` (`tb:hist:republic:ch3:*`). No conflicting dates found; no new RAG chunks added.
- **Verification**: `node scripts/ocr-check.mjs "sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន"` passed (`6 pages checked, 0 to look at by hand`), and `npm run check:digits` passed (`0 Khmer numerals`).


## 16 Nov 2026: History Workbook (Sam Saboeun & Sin Kamsot): Batch 3 (Ch 2 Lesson 2 Sangkum Reastr Niyum) OCR & Audit

Commit: pending. **No database step needed.**

Completed OCR-only transcription and blind visual audit of Batch 3 (`sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន/ch2-lesson2-sangkum-reastr-niyum.md`, PDF pages `p025.png` to `p032.png`, Book pp. 15-22):
- Covered Chapter 2 Lesson 2 (`របបសង្គមរាស្ត្រនិយម 1955-1970`) across all 5 sections: rise of Sangkum Reastr Niyum (`1955`), National Congress (`II. សមាជជាតិ`), Neutrality policy (`III. នយោបាយអព្យាក្រឹត`), decline and 1963 aid break (`IV. ការធ្លាក់ចុះខ្សោយរបបសង្គមរាស្ត្រនិយម`), and legacy achievements (`V. សមិទ្ធផលសង្គមរាស្ត្រនិយម`). Dotted answer blanks replaced with `*(ចម្លើយសិស្ស)*`.
- Blind visual audit checked all 8 pages codepoint-by-codepoint against the PNG scans (0 discrepancies found).
- **KruAI RAG: YES (already grounded)** under `HISTORY_CH2_SECTIONS` in `server/textbook-search.ts` (`tb:hist:sangkum:ch2:*`). No conflicting dates found during audit; no new RAG chunks added.
- **Verification**: `node scripts/ocr-check.mjs "sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន"` passed (`5 pages checked, 0 to look at by hand`), and `npm run check:digits` passed (`0 Khmer numerals`).


## 16 Nov 2026: History Workbook (Sam Saboeun & Sin Kamsot): Batch 2 (Ch 2 Lesson 1 Part 2 French Protectorate Complete) OCR & Audit

Commit: pending. **No database step needed.**

Completed OCR-only transcription and blind visual audit of Batch 2 (`sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន/ch2-lesson1-part2-french-protectorate.md`, PDF pages `p018.png` to `p024.png`, Book pp. 8-14), completing Chapter 2 Lesson 1:
- Covered Section 2 continuation (questions 6-9 on the 1884-1886 rebellion and French-Khmer compromise), Section 3 (`ការតស៊ូដើម្បីឯករាជ្យជាតិ និងសន្ធិសញ្ញាក្រុងសឺណែវឆ្នាំ1954`: questions 1-7 covering armed vs peaceful independence struggles and Geneva 1954), and Section 4 (`ចំណុចវិជ្ជមាន និងអវិជ្ជមាននៃកំណែទម្រង់របស់បារាំង`: questions 1-2 including 1904/1907 border treaties). Dotted student answer blocks replaced with `*(ចម្លើយសិស្ស)*`.
- Blind visual audit restored a missing subscript in `ឯករាជ្យជាតិ` on `p019.png` and confirmed zero omitted lines across all 7 pages.
- **KruAI RAG: YES (already grounded)** under `HISTORY_CH1_SECTIONS` in `server/textbook-search.ts` (`tb:hist:protectorate:ch1:*`). No conflicting dates found during audit; no new RAG chunks added.
- **Verification**: `node scripts/ocr-check.mjs "sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន"` passed (`4 pages checked, 0 to look at by hand`), and `npm run check:digits` passed (`0 Khmer numerals`).


## 16 Nov 2026: History Workbook (Sam Saboeun & Sin Kamsot): Batch 1 (Ch 2 Lesson 1 Part 1 French Protectorate) OCR & Audit

Commit: pending. **No database step needed.**

Completed OCR-only transcription and blind visual audit of Batch 1 (`sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន/ch2-lesson1-part1-french-protectorate.md`, PDF pages `p011.png` to `p017.png`, Book pp. 1-7):
- Covered Chapter 2 title page (`ជំពូកទី 2៖ ប្រវត្តិសាស្ត្រប្រទេសកម្ពុជា`), Lesson 1 (`អាណាព្យាបាលបារាំង 1863-1953`), Section 1 (`វត្តមានបារាំងក្នុងប្រទេសកម្ពុជា`: 7 questions across 1863 treaty and King Ang Duong / King Norodom), and Section 2 (`នយោបាយកំណែទម្រង់សង្គមខ្មែរ`: questions 1-5 on the 1877 and 17 June 1884 convention reforms). Dotted student fill-in blanks replaced with `*(ចម្លើយសិស្ស)*`.
- **KruAI RAG: YES (already grounded)** under `HISTORY_CH1_SECTIONS` in `server/textbook-search.ts` (`tb:hist:protectorate:ch1:*`). No conflicting dates found during audit; no new RAG chunks added.
- **Verification**: `node scripts/ocr-check.mjs "sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន"` passed (`3 pages checked, 0 to look at by hand`), and `npm run check:digits` passed (`0 Khmer numerals`).


## 16 Nov 2026: History Workbook (Sam Saboeun & Sin Kamsot): Phase 0 Audit & Batch 0 Front Matter / TOC OCR (OCR Only)

Commit: pending. **No database step needed.**

Started **OCR-only** digitization and strict blind visual auditing of the Grade 12 History Student Workbook (`sources/textbooks/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន.pdf`, 157 pages, Preah Sisowath High School Next Generation School, 2022-2023):
- **Phase 0 Audit & Master Status**: Mapped all 26 batches across Chapters 2, 3, and 1 into `sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន/STATUS.md`, identifying which lessons already have KruAI RAG chunks in `server/textbook-search.ts` (`YES`: Cambodia History Ch 2 Lessons 1-6 and World History Ch 1 Lessons 11-12) vs OCR-only (`NO`: Regional History Ch 3 Lessons 1-5 and World History Ch 1 Lessons 1-10).
- **Batch 0 OCR & Blind Audit**: Transcribed and line-by-line audited `sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន/front-matter.md` (PDF pages `p001.png` to `p010.png`: covers, editorial committee, preface, and full Table of Contents). Blind audit fixed 3 Khmer spelling/syllable typos (`វឹកវរ`, `នឹង`, `ការចាប់បដិសន្ធិ`) and replaced decorative school seal `[?]` markers. **KruAI RAG: NO (OCR only)**.
- **Verification**: `node scripts/ocr-check.mjs "sources/ocr/សៀវភៅកិច្ចការផ្ទះប្រវត្តិវិទ្យា_សំ_សាបឿន"` passed (`2 pages checked, 0 to look at by hand`), and `npm run check:digits` passed (`0 Khmer numerals`).


## 16 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 12: Lesson 2 Logarithmic Functions Exercises Part 4 (Pages 1 to 100 Complete)

Commit: pending. **No database step needed.**

Digitized and audited Batch 12 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p097.png` to `p105.png`, Book pages 92 to 100), completing the full target scope of Book pages 1 to 100 (Front Matter pp. i–iv + Book pp. 1–100 across 13 audited files):
- **Textbook Rendering & OCR**: Transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/lesson2-logarithmic-functions-part4.md`, covering:
  - Exercise 6 (conclusion, Bac II 19 September 2019): canonical rewritings of $f(x) = \frac{x^2 - 2}{x} - \ln x$, limits at $0^+$ and $+\infty$, derivative $f'(x) = \frac{x^2 + 2 - x}{x^2} > 0$, strictly increasing variation table, asymptote $x = 0$, tangent lines $(D) : y = 2x - 3$ at $A(1, -1)$ and $(T)$ parallel to $y = x$ at $B(2, 0.3)$, and curve plotting.
  - Exercise 7 (Bac II 8 October 2024): full study of $f(x) = \ln(x + 1) - \ln(x - 1) - x + 2$ on $(1, +\infty)$, limits at $1^+$ and $+\infty$, derivative $f'(x) = \frac{-(x^2 + 1)}{(x + 1)(x - 1)} < 0$, strictly decreasing variation table, oblique asymptote $(d) : y = -x + 2$, relative position proof, and curve plotting.
  - Exercise 8 (start, parts 1, 2, and start of 3): study of $f(x) = x - \frac{\ln(1 + x)}{1 + x}$ on $(0, +\infty)$, derivative numerator expression $N(x) = (1 + x)^2 - 1 + \ln(x + 1)$, value $N(0) = 0$, variation table and positivity of $N(x)$ on $(0, +\infty)$, and boundary limits of $f(x)$ at $0$ and $+\infty$.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 9 pages (`p097.png` to `p105.png`):
  - Corrected graph x-intercept approximation in Exercise 6 figure description ($x \approx 1.7$) and added intersection $(3, 3)$ of $y = x$ and $(D)$.
  - Fixed variation table top/bottom infinity cell alignment (`+\infty <br>`) and normalized Khmer justification spacing and colons (`ព្រោះ៖`).
  - Documented printed textbook typos with explanatory notes: omitted `0` in `ត្រង់` (`p097`), domain typo `(0, +\infty)` instead of `(1, +\infty)` (`p101`), sign row `+` despite decreasing curve (`p102`), negative sign typo in graph label (`p103`), and mislabeled table title `f` instead of `N` plus duplicated `"តាមតារាង"` (`p105`).
  - Maintained boundary markers `<!-- Page p097.png -->` through `<!-- Page p105.png -->` with 100% boundary integrity and updated `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/STATUS.md` (13 of 13 OCR files written and audited).
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (14 files checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across 363 files), `npm run check:content`, and `npx oxlint` (0 errors).


## 12 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 11: Lesson 2 Logarithmic Functions Exercises Part 3

Commit: pending. **No database step needed.**

Digitized and audited Batch 11 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p089.png` to `p096.png`, Book pages 84 to 91), covering Lesson 2 (Logarithmic Functions):
- **Textbook Rendering & OCR**: Rendered high-resolution scans and transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/lesson2-logarithmic-functions-part3.md`, covering:
  - Exercise 4 (conclusion): variation table for $f(x) = \frac{x + \ln x}{x^2}$, behavior and limits, relative extrema, and orthonormal coordinate curve construction.
  - Exercise 5 (Bac II 2015): complete problem parts A and B. Part A: auxiliary function $g(x) = x^2 + \ln x$, derivative $g'(x) = \frac{2x^2+1}{x} > 0$, strictly increasing proof, $g(1) = 1$, root deduction via analytical comparison (Method 1) and variation table (Method 2), and sign determination of $x^2 + \ln x - 1$. Part B: $f(x) = x + 1 - \frac{\ln x}{x}$, limits at $0^+$ and $+\infty$, derivative $f'(x) = \frac{x^2 + \ln x - 1}{x^2}$, variation table, oblique asymptote $(\Delta) : y = x + 1$, relative position analysis, intersection point $I(1, 2)$, auxiliary coordinate values table, and curve plotting.
  - Exercise 6 (Bac II 19 September 2019): problem statement for $f(x) = \frac{x^2 - 2}{x} - \ln x$ (questions 1 to 4) and start of solution for canonical form $f(x) = x - \ln x - \frac{2}{x}$ and limit calculations.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 8 pages (`p089.png` to `p096.png`):
  - Refactored multiple consecutive display math equations into aligned KaTeX environments (`\begin{aligned} ... \end{aligned}`) to ensure aligned equal signs while keeping Khmer text strictly outside math blocks.
  - Flattened split bullet math into continuous inline equations to preserve clean markdown list indentation.
  - Preserved printed book typos and notation oddities with footnotes: $x \in 0 < x < 1$ (annotated `[sic: \forall x \in (0, 1)]`), vector arrow over origin $\vec{O}$ (annotated `[sic: (O, \vec{i}, \vec{j})]`), and printed limit sign slips.
  - Maintained boundary markers `<!-- Page p089.png -->` through `<!-- Page p096.png -->` with 100% boundary integrity.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (13 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files).


## 12 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 10: Lesson 2 Logarithmic Functions Exercises Part 2

Commit: pending. **No database step needed.**

Digitized and audited Batch 10 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p081.png` to `p088.png`, Book pages 76 to 83), covering Lesson 2 (Logarithmic Functions):
- **Textbook Rendering & OCR**: Rendered high-resolution scans and transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/lesson2-logarithmic-functions-part2.md`, covering:
  - Exercise 2 (conclusion): intersection point $A(1, 1)$ between curve $(C)$ and line $(D) : y = 1$, tangent line $(L) : y = 3x - 2$, auxiliary coordinate table, and full-page Cartesian coordinate curve construction with asymptotes $y = 1, x = 0$ and peak $(e, 1.7)$.
  - Exercise 3 ($f(x) = 1 - \frac{2\ln x}{x}$): Bac II 2013 exam exercise, questions ក to ឃ, limits at $+\infty$ and $0^+$, horizontal asymptote $y = 1$, vertical asymptote $x = 0$, first derivative $f'(x) = \frac{2\ln x - 2}{x^2}$, sign study, variation table with minimum $f(e) = 1 - \frac{2}{e} \approx 0.3$, curve construction, and definite integral for bounded region area $S = \int_{1}^{e} [1 - f(x)] dx = 1\text{ unit}^2$.
  - Exercise 4 ($f(x) = \frac{x + \ln x}{x^2}$): Bac II 2014 Round 2 exam exercise, auxiliary polynomial-logarithmic function $h(x) = -x + 1 - 2\ln x$, derivative $h'(x) = -\frac{x+2}{x} < 0$, strictly decreasing variation table for $h(x)$, sign analysis ($h(x) > 0$ for $x \in (0, 1)$ and $h(x) < 0$ for $x \in (1, +\infty)$), limits of $f(x)$ at $0^+$ and $+\infty$ via substitution $u = 1/x$, derivative connection $f'(x) = \frac{h(x)}{x^3}$, and variation deduction with peak $f(1) = 1$.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 8 pages (`p081.png` to `p088.png`):
  - Fixed display math formatting so no trailing Khmer text shares a line with `$$...$$`.
  - Audited and documented multiple printed textbook typos: author dropped $x$ in `\Rightarrow = e` (annotated `[sic: \Rightarrow x = e]`), author mislabeled minimum as maximum (annotated `[sic: តម្លៃអប្បបរមា]`), and author inverted inequality sign for $h(x)$ on interval $(1, +\infty)$ (annotated `[sic: h(x) < 0]`).
  - Preserved printed erratum in tangent equation calculation with explanatory note explaining derivative calculation.
  - Maintained boundary markers `<!-- Page p081.png -->` through `<!-- Page p088.png -->` with 100% boundary integrity.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (12 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files).


## 12 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 9: Lesson 2 Logarithmic Functions Theory and Exercises Part 1

Commit: pending. **No database step needed.**

Digitized and audited Batch 9 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p072.png` to `p080.png`, Book pages 67 to 75), covering Lesson 2 (Logarithmic Functions):
- **Textbook Rendering & OCR**: Rendered high-resolution scans and transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/lesson2-logarithmic-functions-part1.md`, covering:
  - Theory sections 2.1 to 2.5: definition of Napierian logarithm $y = \ln x$, domain $D = (0, +\infty)$, identities $\ln 1 = 0$, $\ln e = 1$, basic algebraic properties ($\ln(ab) = \ln a + \ln b$, $\ln(a/b) = \ln a - \ln b$, $\ln(a^\alpha) = \alpha\ln a$), key limits ($\lim_{x \to +\infty} \ln x = +\infty$, $\lim_{x \to 0^+} \ln x = -\infty$, $\lim_{x \to 0} \frac{\ln(x+1)}{x} = 1$, indeterminate growth comparisons $\lim_{x \to +\infty} \frac{\ln x}{x^n} = 0$, $\lim_{x \to 0^+} x^n\ln x = 0$), derivative formulas ($(\ln x)' = \frac{1}{x}$, $(\ln u)' = \frac{u'}{u}$), curve shape and variations of $y = \ln x$ and $y = -\ln x$.
  - Exercise 1 ($f(x) = x + 1 + 2\ln\frac{x}{x-1}$): domain $D = (-\infty, 0) \cup (1, +\infty)$, limits at boundary endpoints, vertical asymptotes $x = 0$ and $x = 1$, first derivative $f'(x) = \frac{(x+1)(x-2)}{x(x-1)}$, extremum $f(2) = 3 + 2\ln 2 \approx 4.8$, variation table, oblique asymptote $(D) : y = x + 1$, relative position proof, and curve plotting.
  - Exercise 2 ($f(x) = \frac{x + \ln x}{x}$): domain $D = (0, +\infty)$, Bac II 2005 exam exercise, infinite and zero limits, vertical asymptote $x = 0$, horizontal asymptote $y = 1$, derivative $f'(x) = \frac{1 - \ln x}{x^2}$, maximum value $f(e) = \frac{e+1}{e} \approx 1.7$, and variation table.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 9 pages (`p072.png` to `p080.png`):
  - Removed hallucinated bullet points below graphs that did not exist in the printed book, integrating graph descriptions cleanly into standard markdown figure blocks.
  - Documented printed book typos with explanatory notes ($b \in 0$ [sic: $b \in \mathbb{R}$], $x = 0$ [sic: $y = 1$] for horizontal asymptote, and omitted coefficient 2 in $f(2)$ substitution).
  - Maintained boundary markers `<!-- Page p072.png -->` through `<!-- Page p080.png -->` with 100% boundary integrity.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (11 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files).


## 12 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 8: Lesson 1 Rational Functions Exercises Part 7 (Conclusion of Lesson 1)

Commit: pending. **No database step needed.**

Digitized and audited Batch 8 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p064.png` to `p071.png`, Book pages 59 to 66), concluding Lesson 1 (Rational Functions):
- **Textbook Rendering & OCR**: Rendered high-resolution scans and transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/lesson1-rational-functions-exercises-part7.md`, covering:
  - Exercise 9 (conclusion): intersection point $Q(6, 4)$ between oblique asymptote $(T)$ and tangent line $(D)$, midpoint proof $A(2, 1) = \text{midpoint}[P, Q]$, domain $D_g = \mathbb{R}$ of $g(x) = \frac{x^2}{|x| + 2}$, parity proof $g(-x) = g(x)$ (even function), and relationship between curve $(C)$ and graph $(\Gamma)$.
  - Exercise 10 ($f(x) = \frac{-x^2 + 3x + 2}{x - 2}$): questions 1 to 6, canonical form $f(x) = -x + 1 + \frac{4}{x - 2}$, infinite and point limits, vertical asymptote $x = 2$, oblique asymptote $(d) : y = -x + 1$, relative position table between $(C)$ and $(d)$, derivative $f'(x) = -\frac{(x - 2)^2 + 4}{(x - 2)^2} < 0$, strictly decreasing variation table, tangent lines $(T_1) : y = -2x - 1$ at $M(0, -1)$ and $(T_2) : y = -2x + 7$ at $N(4, -1)$, integer coordinate points $A(-2, 2), B(1, -4), C(6, -4), D(3, 2)$ forming a parallelogram ($\vec{AB} = \vec{DC} = (3, -6)$), symmetry center $I(2, -1)$, curve plotting, and bounded region area $S = \int_{-2}^{1} [(-x + 1) - f(x)] dx = 8\ln 2 \approx 5.55\text{ units}^2$.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 8 pages (`p064.png` to `p071.png`):
  - Fixed inline KaTeX equation to resolve parser collision on Khmer annotation.
  - Pixel verification proved printed text is `ប៉ារ៉ាបូល` (parabola).
  - Documented printed book typographical slips (`ខ្សែ​កោណ`, `ជាជា`) with footnotes.
  - Maintained boundary markers `<!-- Page p064.png -->` through `<!-- Page p071.png -->` with 100% boundary integrity.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (10 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files).


## 16 Nov 2026: Chemistry Summary & Solutions: Chapter 4 End-of-Chapter Exercises & Solutions OCR & Audit

Commit: Pending. **No database step needed.**

Digitized and audited Chapter 4 End-of-Chapter Exercises & Solutions (`sources/textbooks/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់.pdf`, PDF pages `p092.png` bottom half to `p099.png`), completing 100% of Chapter 4 (Chemical Equilibrium):
- **Textbook Rendering & OCR**: Transcribed word-for-word into `sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់/chapter4-exercises-solutions.md`, covering Chapter 4 (`ជំពូកទី 4 លំនឹងគីមី`), Section I (Multiple choice 1 to 3), Section II (Fill-in-the-blanks 1 to 2), Section III (Critical thinking questions 1 to 4 on Le Chatelier shifts and catalytic effects), Section IV (Numerical problems 1 to 10 on equilibrium constants $K$, initial/change/equilibrium calculations, acid/base dissociation $K_\text{a}, K_\text{b}$, pH, buffer systems, and common ion effects with $\text{NaF}$ and $\text{NaOH}$), and comprehensive step-by-step solutions for all items.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit against scans `p092.png` to `p099.png`, moved Khmer descriptive subscripts (`សល់`, `ក្រោយប្រតិកម្ម`) outside KaTeX math blocks to prevent empty rendering boxes, verified display math formatting on isolated lines, confirmed textbook typographical erratum preservation where $K_\text{a}(\text{HF}) = 6.7 \times 10^{-4}$ was used in calculation, and verified clean boundary termination before Chapter 5.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់"`, `npm run check:digits` (0 Khmer numerals across all 363 files).


## 16 Nov 2026: Chemistry Summary & Solutions: Chapter 4 Lesson 3 (Acid-Base & Salt Equilibrium) OCR & Audit

Commit: Pending. **No database step needed.**

Digitized and audited Chapter 4 Lesson 3 (`sources/textbooks/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់.pdf`, PDF pages `p086.png` bottom half to `p092.png` top half):
- **Textbook Rendering & OCR**: Transcribed word-for-word into `sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់/chapter4-lesson3-acid-base-salt-equilibrium.md`, covering Chapter 4 (`ជំពូកទី 4 លំនឹងគីមី`), Lesson 3 (`មេរៀនទី 3 : លំនឹងនៃអាស៊ីត-បាសនិងអំបិល`), including acid ionization constant ($K_\text{a}$), degree of ionization ($\alpha$), autoprotolysis of water, salt hydrolysis (cation and anion), buffer solutions (`សូលុយស្យុងតំប៉ុង`), 13 lesson review questions, and complete quantitative solutions (phenol ionization, weak acid $K_\text{a}$, methylamine dilution effects, and common ion suppression by strong acid $\text{HCl}$).
- **Strict Blind Visual Audit**: Completed line-by-line visual audit against scans `p086.png` to `p092.png`, restored omitted textbook phrase `មួយដើរតួជា` in autoprotolysis definition, fixed OCR misread `បំរែបំរួល` from `បំប្លែង` in buffer definition, corrected printed book misprint `\text{CH}_3\text{COOH}` to basic salt `\text{CH}_3\text{COOLi}`, fixed table orthography `មុនប្រតិ.`, corrected volume concentration typo, and verified 100% boundary integrity before Chapter 4 review exercises.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់"`, `npm run check:digits` (0 Khmer numerals across all 363 files).


## 16 Nov 2026: Chemistry Summary & Solutions: Chapter 4 Lesson 2 (Equilibrium Shifts) OCR & Audit

Commit: Pending. **No database step needed.**

Digitized and audited Chapter 4 Lesson 2 (`sources/textbooks/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់.pdf`, PDF pages `p078.png` to `p086.png` top half):
- **Textbook Rendering & OCR**: Transcribed word-for-word into `sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់/chapter4-lesson2-equilibrium-shifts.md`, covering Chapter 4 (`ជំពូកទី 4 លំនឹងគីមី`), Lesson 2 (`មេរៀនទី 2 : ការរំកិលលំនឹង`), including Le Chatelier's principle, factors shifting equilibrium (pressure, concentration, temperature), common ion effect in weak acid and sparingly soluble salt solutions, 9 lesson questions and answers, and 7 additional problems (10 to 16) with complete ICE tables and quadratic formula derivations.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit against scans `p078.png` to `p086.png`, corrected critical OCR misreads (`បន្ថែមកាតាលីករ` from `បន្ថែមភាវលីករ`, `សញ្ញាណអ៊ីយ៉ុងរួម` from `វត្តមានញាណអ៊ីយ៉ុងរួម`, `ឈានទៅរកសព្វ` from `មានទៅរកសព្វ`), fixed chemical nomenclature spelling (`នីត្រុស៊ីលក្លរួ`, `កាចុងនិងអាញ៉ុង`), verified ICE equilibrium tables and quadratic solutions, and ensured clean termination before Lesson 3 divider.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់"`, `npm run check:digits` (0 Khmer numerals across all 363 files).


## 12 Nov 2026: Chemistry Summary & Solutions: Chapter 4 Lesson 1 (Nature of Chemical Equilibrium) OCR & Audit

Commit: Pending. **No database step needed.**

Digitized and audited Chapter 4 Lesson 1 (`sources/textbooks/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់.pdf`, PDF pages `p071.png` to `p077.png`):
- **Textbook Rendering & OCR**: Transcribed word-for-word into `sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់/chapter4-lesson1-nature-of-chemical-equilibrium.md`, covering Chapter 4 (`ជំពូកទី 4 លំនឹងគីមី`), Lesson 1 (`មេរៀនទី 1 : ធម្មជាតិនៃលំនឹងគីមី`), including reversible reactions, dynamic chemical equilibrium definitions, equilibrium constant expression $K = \frac{[\text{C}]^c[\text{D}]^d}{[\text{A}]^a[\text{B}]^b}$, temperature dependence, partial pressure equilibrium constants ($K_\text{p}$), reaction quotients ($Q_\text{c}, Q_\text{p}$), 12 lesson review questions, and 8 additional problems with step-by-step solutions (including Hess's Law combination of equilibrium constants).
- **Strict Blind Visual Audit**: Completed line-by-line visual audit against scans `p071.png` to `p077.png`, fixed OCR spelling error `ស្ទ័រស្យូមេទ្រី` to `ស្ទើស្យូមេទ្រី`, corrected critical OCR misread `ចោរ` to authentic `ថេរ` in questions 7 and 8 (`ចូរថេរតម្លៃលំនឹង K`), restored textbook phrasing `ពីលំនាំបង្កើតលំនឹង` in problem 14, verified gas phase requirement for $K_\text{p}$, and confirmed all equilibrium derivations and reversible arrows ($\rightleftarrows$).
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់"`, `npm run check:digits` (0 Khmer numerals across all 363 files).


## 12 Nov 2026: Chemistry Summary & Solutions: Chapter 3 End-of-Chapter Exercises Part 2 (p065 to p070) OCR & Audit

Commit: Pending. **No database step needed.**

Digitized and audited Chapter 3 End-of-Chapter Exercises Part 2 (`sources/textbooks/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់.pdf`, PDF pages `p065.png` to `p070.png`):
- **Textbook Rendering & OCR**: Transcribed word-for-word into `sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់/chapter3-exercises-part2.md`, completing Chapter 3 (`ជំពូកទី 3 អាស៊ីត-បាស`), Section IV (Problems 4, 5, 6), Additional Exercises (`? លំហាត់បន្ថែម` Problems 1 to 11), and comprehensive step-by-step solutions for all problems including weak acid and base dissociation constants ($K_\text{a}, K_\text{b}$), ionization percentages ($\alpha$), titration equivalence volumes, and secondary bisulfate ionization ($K_{\text{a}_2}$).
- **Strict Blind Visual Audit**: Completed line-by-line visual audit against scans `p065.png` to `p070.png`, verified multi-step pH calculations for methanoic, perchloric, and ethanoic acids, converted standalone inline math to display math, confirmed the algebraic proof $K_\text{a} \times K_\text{b} = K_\text{w}$, and verified 100% boundary integrity ending at the concluding horizontal divider before Chapter 4.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់"`, `npm run check:digits` (0 Khmer numerals across all 363 files).


## 12 Nov 2026: Chemistry Summary & Solutions: Chapter 3 End-of-Chapter Exercises Part 1 (p058 to p064) OCR & Audit

Commit: Pending. **No database step needed.**

Digitized and audited Chapter 3 End-of-Chapter Exercises Part 1 (`sources/textbooks/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់.pdf`, PDF pages `p058.png` bottom half to `p064.png`):
- **Textbook Rendering & OCR**: Transcribed word-for-word into `sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់/chapter3-exercises-part1.md`, covering Chapter 3 (`ជំពូកទី 3 អាស៊ីត-បាស`), Section I (Multiple choice questions 1 to 15), Section II (Fill-in-the-blanks statements 1 to 7), Section III (Critical thinking questions 1 to 17), and Section IV (Numerical problems 1 to 3), along with full step-by-step solutions for Sections I, II, III, and IV (problems 1 to 3).
- **Strict Blind Visual Audit**: Completed line-by-line visual audit against scans `p058.png` to `p064.png`, corrected multiple-choice options (`កំហិត` vs `កំណិត`, restored `មិនស្មើគ្នានឹង`), restored dropped grammatical connector `ឯ` in Section II.1, fixed spelling of cresol red indicator (`ក្រេសូល`), resolved multiple-choice key in question 14 (`[x] ក`), and verified step-by-step stoichiometry and logarithmic pH/pOH derivations for problems 1, 2, and 3 with zero Khmer text inside KaTeX math blocks.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់"`, `npm run check:digits` (0 Khmer numerals across all 363 files).


## 12 Nov 2026: Chemistry Summary & Solutions: Chapter 3 Lesson 4 (Acid-Base Titrations) OCR & Audit

Commit: Pending. **No database step needed.**

Digitized and audited Chapter 3 Lesson 4 (`sources/textbooks/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់.pdf`, PDF pages `p055.png` to `p058.png` top half):
- **Textbook Rendering & OCR**: Transcribed word-for-word into `sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់/chapter3-lesson4-acid-base-titrations.md`, covering Chapter 3 (`ជំពូកទី 3 អាស៊ីត-បាស`), Lesson 4 (`មេរៀនទី 4 អត្រាកម្មអាស៊ីត-បាស`), including titration principle and reaction $\text{H}_3\text{O}^+ + \text{OH}^- \rightarrow 2\text{H}_2\text{O}$, equivalence point condition $C_\text{A} \times V_\text{A} = C_\text{B} \times V_\text{B}$, colored indicator selection table (Hélianthine, bromothymol blue, phenolphthalein), 11 lesson review questions, and complete stoichiometric titration calculation solutions.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit against scans `p055.png` to `p058.png`, corrected critical indicator OCR error in table row 1 (`មេស្យង់ទីន` to authentic French nomenclature `អេល្យង់ទីន` for methyl orange), fixed Khmer subjoined consonant orthography (`ផ្ដុំគ្នា` to `ផ្តុំគ្នា`, `ការផ្លាស់ប្ដូរ` to `ការផ្លាស់ប្តូរ`), verified all mathematical expressions and boxed results ($0.18\,\text{M}$), and confirmed clean separation before Chapter 3 review exercises.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់"`, `npm run check:digits` (0 Khmer numerals across all 363 files).


## 12 Nov 2026: Chemistry Summary & Solutions: Chapter 3 Lesson 3 (Aqueous Solutions & pH) OCR & Audit

Commit: Pending. **No database step needed.**

Digitized and audited Chapter 3 Lesson 3 (`sources/textbooks/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់.pdf`, PDF pages `p050.png` bottom half to `p054.png`):
- **Textbook Rendering & OCR**: Transcribed word-for-word into `sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់/chapter3-lesson3-aqueous-solutions-and-ph.md`, covering Chapter 3 (`ជំពូកទី 3 អាស៊ីត-បាស`), Lesson 3 (`មេរៀនទី 3 សូលុយស្យុងទឹកនិងpH`), including hydronium and hydroxide ions, autoionization of water, water autoionization constant $K_w = K_e$ at varying temperatures ($0^\circ\text{C}, 10^\circ\text{C}, 25^\circ\text{C}, 50^\circ\text{C}$), pH and pOH definitions and logarithmic relationship $\text{pH} + \text{pOH} = 14.0$, acidic/neutral/basic solution scale diagram, 13 review questions, and step-by-step mathematical solutions.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit against scans `p050.png` to `p054.png`, corrected Khmer full stop punctuation in Question 2 (`នៃទឹក។តាង`), fixed spelling error in Answer 6 (`លោការីត`), formatted display math onto dedicated lines, and confirmed 100% KaTeX compliance with zero Khmer inside math blocks.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់"`, `npm run check:digits` (0 Khmer numerals across all 363 files).


## 16 Nov 2026: Physics Exam Papers (Student Volunteer 2019-2020) Batches 7 to 16: 100% Complete Book OCR & Audit

Commit: Pending. **No database step needed.**

Digitized and audited Batches 7 through 16 of Grade 12 Physics Exam Papers, Summary and Solutions (`sources/textbooks/វីញ្ញាសារូបវិទ្យា.pdf`, PDF pages `p046.png` to `p117.png`, Book pages 40 to 111), bringing the entire textbook (all 117 pages) to 100% OCR Written and 100% OCR Audited:
- **Batch 7 (PDF pages 46 to 54, Book pages 40 to 48)**:
  - Scope: Chapter 2 Waves Exercises and Solutions (`ជំពូក 2 រលក · ផ្នែកលំហាត់ និងដំណោះស្រាយ`), covering Exercises 1 to 4 and complete solutions for standing waves, node and antinode calculations, fundamental frequencies, harmonics, phase differences, and wave velocities.
  - Audit: Completed line-by-line visual audit against scans `p046.png` to `p054.png`, verified formulas and subscripts, preserved textbook layout and problem notes.
  - KruAI RAG Status: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Batch 8 (PDF pages 55 to 60, Book pages 49 to 54)**:
  - Scope: Chapter 3 Electricity and Magnetism Intro, Problem Solving Keys, and Lesson 1 Part 1 (`ជំពូក 3 អគ្គិសនី និងម៉ាញេទិច · គន្លឹះដោះស្រាយ និងមេរៀនទី 1 ភាគ 1`), covering magnetic field of straight conductor, circular coil, solenoid, Laplace electromagnetic force, and parallel current-carrying conductors.
  - Audit: Completed line-by-line visual audit against scans `p055.png` to `p060.png`, verified right-hand rule notations, vector definitions, units, and KaTeX math formatting with zero Khmer text inside math blocks.
  - KruAI RAG Status: KruAI RAG: YES (already grounded in `server/textbook-search.ts`). No new RAG chunks added (per OCR-only scope).
- **Batch 9 (PDF pages 61 to 65, Book pages 55 to 59)**:
  - Scope: Chapter 3 Lesson 1 Part 2 (`ជំពូក 3 មេរៀនទី 1 ភាគ 2`), covering interaction forces between parallel currents, Lorentz force on moving charged particles ($\vec{F}_m = q(\vec{v} \times \vec{B})$), deflection of charged particles in uniform magnetic field, circular trajectory radius $R = \frac{mv}{|q|B}$, angular deflection, magnetic deflection $Z = \frac{D\ell|q|B}{mv}$, and Bainbridge mass spectrometer specific charge $\frac{|q|}{m}$.
  - Audit: Completed line-by-line visual audit against scans `p061.png` to `p065.png`, verified variable definitions, formula groupings, mass spectrometer detector plates, and fixed KaTeX math boundaries.
  - KruAI RAG Status: KruAI RAG: YES (already grounded in `server/textbook-search.ts`). No new RAG chunks added (per OCR-only scope).
- **Batch 10 (PDF pages 66 to 72, Book pages 60 to 66)**:
  - Scope: Chapter 3 Electricity and Magnetism Lesson 2 (Electromagnetic Induction) and Lesson 3 (Self-Induction) (`ជំពូក 3 មេរៀនទី 2 អាំងឌុចស្យុងអេឡិចត្រូម៉ាញេទិច និងមេរៀនទី 3 អូតូអាំងឌុចស្យុង`), covering magnetic flux $\phi = BA\cos\theta$, Faraday law and Lenz law $E = -N \frac{\Delta\Phi}{\Delta t}$, induced electromotive force in sliding conductor bar $|E| = B\ell v$, instantaneous induced emf in rotating coil $e = E_m \sin\omega t$, self-induction coefficient (inductance $L = \mu \frac{N^2 S}{\ell}$), self-induced emf $e = -L \frac{di}{dt}$, RL circuit dipole voltage, time constant $\tau = L/R$, circuit switch on/off exponential transient response curves, and LC circuit oscillations (period $T_o = 2\pi\sqrt{LC}$, frequency $f_o$, electrical energy, magnetic energy, and total energy conservation).
  - Audit: Completed line-by-line visual audit against scans `p066.png` to `p072.png`, verified formula box boundaries, page split continuations, circuit switch states, response curve percentages ($63\%, 99\%, 37\%, 1\%$), and KaTeX formatting.
  - KruAI RAG Status: KruAI RAG: YES (already grounded in `server/textbook-search.ts`). No new RAG chunks added (per OCR-only scope).
- **Batch 11 (PDF pages 73 to 78, Book pages 67 to 72)**:
  - Scope: Chapter 3 Electricity and Magnetism Lesson 4 (AC Circuits) (`ជំពូក 3 មេរៀនទី 4 សៀគ្វីចរន្តឆ្លាស់`), covering sinusoidal alternating emf ($e = E_m \sin\omega t$), alternating current and voltage ($i = I_m \sin\omega t, v = V_m \sin(\omega t + \phi)$), effective values ($I = I_m/\sqrt{2}, V = V_m/\sqrt{2}$), single component branches (pure resistor $R$, pure inductor $L$, pure capacitor $C$) with Ohm's law and Fresnel vector diagrams, RLC series circuit (total impedance $Z = \sqrt{R^2 + (L\omega - 1/C\omega)^2}$, phase angle $\tan\phi$, power factor $\cos\phi$), electrical resonance ($\omega_o = 1/\sqrt{LC}, f_o = 1/(2\pi\sqrt{LC}), Z = R, \phi = 0, \cos\phi = 1$) with resonance curves, transformer transformation ratio $K = U_2/U_1 = N_2/N_1 = I_1/I_2$, step-up/step-down transformers, transformer efficiency $Rd = P_{c2}/P_{c1}$, and average electric power $P = VI\cos\phi$.
  - Audit: Completed line-by-line visual audit against scans `p073.png` to `p078.png`, corrected Khmer orthography (`ពុលសាស្យុង`), verified all formulas, component diagrams, resonance conditions, and KaTeX formatting.
  - KruAI RAG Status: KruAI RAG: YES (already grounded in `server/textbook-search.ts`). No new RAG chunks added (per OCR-only scope).
- **Batch 12 (PDF pages 79 to 88, Book pages 73 to 82)**:
  - Scope: Chapter 3 Electricity and Magnetism Exercises (`ជំពូក 3 អគ្គិសនី និងម៉ាញេទិច · ផ្នែកលំហាត់`), covering all 33 exercises across 4 lessons: Magnetic Field and Force (Exercises 1 to 11), Electromagnetic Induction (Exercises 1 to 9), Self-Induction (Exercises 1 to 8), and AC Circuits (Exercises 1 to 9), complete with circuit schematics, vector diagrams, and end ornament.
  - Audit: Completed line-by-line visual audit against scans `p079.png` to `p088.png`, verified multi-branch resistor network diagram, page split continuations, rotational frequency units, and KaTeX formatting.
  - KruAI RAG Status: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Batch 13 (PDF pages 89 to 96, Book pages 83 to 90)**:
  - Scope: Chapter 3 Electricity and Magnetism Solutions Part 1 (`ជំពូក 3 អគ្គិសនី និងម៉ាញេទិច · ផ្នែកដំណោះស្រាយ ភាគ 1`), covering Lesson 1 Magnetic Field and Force Solutions (Exercises 1 to 11): straight wire magnetic field, circular loop coil field, solenoid field, flat coil field with relative permeability, Laplace electromagnetic force at various angles ($30^\circ, 60^\circ, 90^\circ$), Lorentz force on proton, alpha particle circular trajectory, specific charge ratio, cathode ray tube electron deflection radius, parallel currents magnetic forces, and nickel isotope separation ($^{58}\text{Ni}$ and $^{60}\text{Ni}$).
  - Audit: Completed line-by-line visual audit against scans `p089.png` to `p096.png`, corrected Khmer orthography (`សូលេណូអ៊ីត`, `ឡូរ៉ិន`), eliminated all Khmer inside math blocks, verified Latin digits throughout, and validated mathematical derivations.
  - KruAI RAG Status: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Batch 14 (PDF pages 97 to 104, Book pages 91 to 98)**:
  - Scope: Chapter 3 Electricity and Magnetism Solutions Part 2 (`ជំពូក 3 អគ្គិសនី និងម៉ាញេទិច · ផ្នែកដំណោះស្រាយ ភាគ 2`), covering Lesson 2 Electromagnetic Induction Solutions (Exercises 1 to 9: induced emf in 50-turn circular coil $|E| = 18\text{ V}$ and $|E| = 0.75\text{ V}$, magnetic field between magnet poles $B = 0.21\text{ T}$ via charge and galvanometer, moving conductor bar induced current $I = 0.10\text{ A}$, rectangular loop induced emf $|E| = 12\text{ V}$ and current $I = 1.2\text{ A}$, rotating coil maximum induced emf $E_m = 0.018\text{ V}$, AC generator speed $N_2 = 1800\text{ ជុំ/mn}$, horizontal rail sliding bar induced emf $|E| = 1.94\text{ V}$ and speed $v = 5.7\text{ m/s}$, rotating coil $E_m = 1.8 \times 10^{-2}\text{ V}$) and Lesson 3 Self-Induction Solutions (Exercises 1 to 2, Exercise 3 part ក: solenoid self-inductance $L = 1.6 \times 10^{-5}\text{ H}$ and self-induced emf $e = -7.9 \times 10^{-5}\text{ V}$, solenoid inductance $L = 0.18 \times 10^{-3}\text{ H}$ and emf $e = 9.0 \times 10^{-3}\text{ V}$, capacitor electrostatic energy $E_C = \frac{1}{2}CV^2$).
  - Audit: Completed line-by-line visual audit against scans `p097.png` to `p104.png`, verified variable indices ($\Phi_i, \Phi_f$), cleaned LaTeX spacing in boxed results, verified that zero bottom lines were clipped, and confirmed zero Khmer text inside math blocks.
  - KruAI RAG Status: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Batch 15 (PDF pages 105 to 111, Book pages 99 to 105)**:
  - Scope: Chapter 3 Electricity and Magnetism Solutions Part 3 (`ជំពូក 3 អគ្គិសនី និងម៉ាញេទិច · ផ្នែកដំណោះស្រាយ ភាគ 3`), covering Lesson 3 Self-Induction Solutions conclusion (Exercise 3 part ខ: peak current $i_m = 6.3 \times 10^{-3}\text{ A}$, Exercise 4: inductance $L = 12 \times 10^{-3}\text{ H}$, Exercise 5: LC resonance inductance $L = 0.22\text{ H}$, Exercise 6: resistor network reduction $R_{\text{eq}} = 92\,\Omega$, time constant $\tau = 4.0 \times 10^{-4}\text{ s}$, transient currents at $t = 2\tau$ and $t = \infty$, Exercise 7: solenoid inductance $L = 43 \times 10^{-4}\text{ H}$ and area $A = 1.0 \times 10^{-2}\text{ m}^2$, Exercise 8: inductance $L = 3.5 \times 10^{-4}\text{ H}$ and self-induced emf $e = -1.6 \times 10^{-3}\text{ V}$) and Lesson 4 AC Circuits Solutions start (Exercise 1: pure resistor RMS current $I = 1.41\text{ A}$, Exercise 2: pure inductor impedance $Z_L = 9.42\,\Omega$ and RMS current $I = 15.9\text{ A}$, Exercise 3: pure capacitor impedance $Z_C = 332\,\Omega$ and RMS current $I = 0.452\text{ A}$, Exercise 4 part ក: series RLC circuit branch impedances $Z_L = 471\,\Omega, Z_C = 758\,\Omega$ and total impedance $Z = 513\,\Omega$).
  - Audit: Completed line-by-line visual audit against scans `p105.png` to `p111.png`, standardized Khmer terminology (`អាំប៉េដង់`, `សូលេណូអ៊ុត`), preserved printed textbook typo notes ($431 \times 0^{-4}\text{ H}$), verified circuit branch diagrams, and confirmed zero Khmer text inside math blocks.
  - KruAI RAG Status: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Batch 16 (PDF pages 112 to 117, Book pages 106 to 111 - Final Batch & Book Complete)**:
  - Scope: Chapter 3 Electricity and Magnetism Solutions Part 4 (`ជំពូក 3 អគ្គិសនី និងម៉ាញេទិច · ផ្នែកដំណោះស្រាយ ភាគ 4`), covering Lesson 4 AC Circuits Solutions conclusion (Exercise 4 parts ខ, គ, ឃ: peak current $I_m = 0.292\text{ A}$, phase difference $\tan\varphi = -0.675 \Rightarrow \varphi = -34^\circ$, branch peak voltages and instantaneous expressions $v_R(t), v_L(t), v_C(t)$, Exercise 5: RLC impedance at $60\text{ Hz}$ and $10\text{ kHz}$ and effective currents $I = 0.228\text{ A}$ and $I = 0.627\text{ A}$, Exercise 6: resonance frequency $f_0 = 1300\text{ Hz}$ and current $I = 5.5\text{ A}$, Exercise 7: power factor $\cos\varphi = 0.106$, average power $P = 38.3\text{ W}$ and resonance power $P_0 = 360\text{ W}$, Exercise 8: phase angle $\tan\varphi = 2.5 \Rightarrow \varphi = 68^\circ$ with current lagging voltage, Exercise 9: peak voltages $V_{m,R} = 2.7\text{ V}, V_{m,L} = 8.1\text{ V}, V_{m,C} = 45\text{ V}$), ending with terminal ornament vignette.
  - Audit: Completed line-by-line visual audit against scans `p112.png` to `p117.png`, corrected spelling (`អានុភាព`), formatted inline math comparisons cleanly outside math blocks, verified zero dropped lines to the final book page, and confirmed 100% textbook completion.
  - KruAI RAG Status: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/វីញ្ញាសារូបវិទ្យា"`, `npm run check:digits` (0 Khmer numerals across all files).


## 12 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 7: Lesson 1 Rational Functions Exercises Part 6 (Exercises 8 cont., 9)

Commit: pending. **No database step needed.**

Digitized and audited Batch 7 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p056.png` to `p063.png`, Book pages 51 to 58):
- **Textbook Rendering & OCR**: Rendered high-resolution scans and transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/lesson1-rational-functions-exercises-part6.md`, covering:
  - Exercise 8 (conclusion): relative position between $(C_f)$ and oblique asymptote $(D)$, derivative $f'(x) = \frac{g(x)}{x^3}$, sign table of $f'(x)$, variation table of $f$, tangent line $(T) : y = -x + 5/2$ at $A(-1, 7/2)$, table of values, and coordinate plane graph of $(C_f)$, $(d)$, $(D)$, $(T)$.
  - Exercise 9 ($f(x) = \frac{x^2}{x + 2}$): questions 1 to 3, domain $D = \mathbb{R} - \{-2\}$, derivative $f'(x) = \frac{x(x+4)}{(x+2)^2}$, sign table, relative extrema ($f(-4) = -8, f(0) = 0$), infinite limits and vertical asymptote $x = -2$, variation table, canonical form $f(x) = x - 2 + \frac{4}{x+2}$, oblique asymptote $(T) : y = x - 2$, graph plotting of $(C)$ and $(\Gamma) : g(x) = \frac{x^2}{|x| + 2}$, symmetry center proof $I(-2, -4)$, tangent $(D) : y = \frac{3}{4}x - \frac{1}{2}$ at $A(2, 1)$, and intersection $P(-2, -2)$.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 8 pages (`p056.png` to `p063.png`):
  - Fixed variation table row positions so negative infinity and minimum values are consistently on the lower row matching the curve directions.
  - Restored authentic Khmer character `ធ្វើឲ្យ` (U+17B1) in problem statement bullet.
  - Added missing colons in question sub-headings and removed extraneous conclusion parentheses around `ពិត`.
  - Maintained boundary markers `<!-- Page p056.png -->` through `<!-- Page p063.png -->` with 100% boundary integrity.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (9 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files).


## 12 Nov 2026: Chemistry Summary & Solutions: Chapter 3 Lesson 2 (Acid-Base Reactions) OCR & Audit

Commit: Pending. **No database step needed.**

Digitized and audited Chapter 3 Lesson 2 (`sources/textbooks/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់.pdf`, PDF pages `p045.png` to `p050.png` top half):
- **Textbook Rendering & OCR**: Transcribed word-for-word into `sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់/chapter3-lesson2-acid-base-reactions.md`, covering Chapter 3 (`ជំពូកទី 3 អាស៊ីត-បាស`), Lesson 2 (`មេរៀនទី 2 ប្រតិកម្មអាស៊ីត-បាស`), including conjugate acid-base pairs, amphoteric substances, neutralization reactions, spectator ions, acid-base strength relationships, 12 lesson review questions, and step-by-step stoichiometric solutions for gas evolution and titration calculations.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit against scanned pages `p045.png` to `p050.png`, fixing OCR spelling errors (`អាស៊ីតក្លរួឌ្រិច` to `អាស៊ីតក្លរីឌ្រិច`, systematic correction of `សមាសធាតុអំពូទែ` to `សមាសធាតុអំផូទែ`), verifying chemical reaction equations, reversible equilibrium arrows, and KaTeX mathematical formatting with zero Khmer text inside math blocks.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់"`, `npm run check:digits` (0 Khmer numerals across all 363 files).


## 12 Nov 2026: Chemistry Summary & Solutions: Chapter 3 Lesson 1 (Acid-Base Theories) OCR & Audit

Commit: Pending. **No database step needed.**

Digitized and audited Chapter 3 Lesson 1 (`sources/textbooks/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់.pdf`, PDF pages `p039.png` bottom half to `p044.png`):
- **Textbook Rendering & OCR**: Transcribed word-for-word into `sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់/chapter3-lesson1-acid-base-theories.md`, covering Chapter 3 (`ជំពូកទី 3 អាស៊ីត-បាស`), Lesson 1 (`មេរៀនទី 1 ទ្រឹស្តីអាស៊ីត-បាស`), including Arrhenius theory, Bronsted-Lowry theory, Lewis theory, polyprotic acids, 11 lesson review questions, and complete solutions.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit against scanned pages `p039.png` to `p044.png`, verifying formulas, subscripts, charges, and KaTeX compliance.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់"`, `npm run check:digits` (0 Khmer numerals across all 363 files).


## 12 Nov 2026: Physics Exam Papers (Student Volunteer 2019-2020) Batch 6: Chapter 2 Theory & Formulas Line-by-Line Blind Audit

Commit: Pending. **No database step needed.**

Strict visual audit and verification for Batch 6 of Grade 12 Physics Exam Papers, Summary and Solutions (`sources/textbooks/វីញ្ញាសារូបវិទ្យា.pdf`, PDF pages `p039.png` to `p045.png`, Book pages 33 to 39: `sources/ocr/វីញ្ញាសារូបវិទ្យា/chapter2-theory-and-formulas.md`):
- **Lesson Scope**: Chapter 2 Waves Theory & Formulas (`ជំពូក 2 រលក · គន្លឹះដោះស្រាយ និងរូបមន្ត`):
  - Section 1: Fundamental wave formulas table ($T, f, \omega, \lambda, k$) with standard SI and angular units.
  - Section 2: Wave propagation equation forms (time/space coordinates and progressive phase shifts).
  - Section 3: Superposition of two waves and multiple wave components, resultant amplitude $a$, and phase angle $\tan\phi_o$.
  - Section 4: Special phase differences: in-phase ($\Delta\phi = 2n\pi$) and opposite-phase ($\Delta\phi = (2n+1)\pi$) with Fresnel vector diagram geometric derivations.
  - Section 5: Quadrature phase difference ($\Delta\phi = (2n + 1/2)\pi$) with tip-to-tail triangle and parallelogram diagrams, phase lead/lag notes, and standing waves (`រលកជញ្ជ្រុំ`) reflection at fixed/free boundaries, node ($x = n\frac{\lambda}{2}$) and antinode ($x = n\frac{\lambda}{4}$) spatial distributions.
- **Line-by-Line Blind Visual Audit**:
  - Replaced hallucinated table headers with neutral and precise labels `| សមីការរលក (ទម្រង់ទី 1) | សមីការរលក (ទម្រង់ទី 2) |`.
  - Added missing KaTeX boxes `\boxed{...}` around $a = \sqrt{a_x^2 + a_y^2}$ on page 35 (`p041.png`) to faithfully match printed boxes.
  - Enhanced vector diagram descriptions on page 37 (`p043.png`) documenting both parallelogram and tip-to-tail right-triangle methods.
  - Standardized Khmer colon typography `[កំណត់សម្គាល់ ៖` on page 38 (`p044.png`).
  - Confirmed 0 lines clipped or dropped across all 7 pages (`p039.png` through `p045.png`) with 100% boundary continuity.
- **KruAI RAG Status**: KruAI RAG: YES (already grounded in `server/textbook-search.ts` under `tb:phys:ch2:l1-superposition-and-fresnel` and `tb:phys:ch2:l1-standing-waves`). No new chunks added (per OCR-only scope).
- **Status Update**: Updated `sources/ocr/វីញ្ញាសារូបវិទ្យា/STATUS.md` for Batch 6 to `OCR Audited: YES`.


## 12 Nov 2026: Chemistry Summary & Solutions: Chapter 2 Exercises & Solutions (p038 to p039) OCR & Audit

Commit: Pending. **No database step needed.**

Digitized and audited Chapter 2 End-of-Chapter Exercises and Solutions (`sources/textbooks/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់.pdf`, PDF pages `p038.png` bottom half to `p039.png` top half):
- **Textbook Rendering & OCR**: Rendered high-resolution scans and transcribed word-for-word into `sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់/chapter2-exercises-solutions.md`, covering Chapter 2 (`ជំពូកទី 2 សមាសធាតុក្នុងសូលុយស្យុងទឹក និងកម្លាំងអន្តរម៉ូលេគុល`), End-of-Chapter Exercises (Questions 1 to 5 and complete step-by-step Solutions 1 to 5) on solubility, intermolecular forces, hydrogen bonding, net ionic precipitation reactions, and gravimetric percentage calculation of chlorine in an unknown ionic compound.
- **Strict Blind Visual Audit**: Completed page-by-page visual audit across both pages, removing OCR hallucination `ភាព`, correcting critical chemical terminology misreads (`នៅទីរំលាយ` to `នៅទឹករំលាយ`, `ឌីប៉ូល-ឌីប៉ូលអរណោទ` to `ឌីប៉ូល-ឌីប៉ូលអន្ទោង` for induced dipole), formatting equations and boxed answer `\boxed{47.51\%}` in standard KaTeX, and confirming zero line cut-offs before Chapter 3 start.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់"`, `npm run check:digits` (0 Khmer numerals across all 363 files).


## 12 Nov 2026: Chemistry Summary & Solutions: Chapter 2 Lesson 2 (Intermolecular Forces) OCR & Audit

Commit: Pending. **No database step needed.**

Digitized and audited Lesson 2 of Chapter 2 (`sources/textbooks/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់.pdf`, PDF pages `p032.png` bottom half to `p038.png` top half):
- **Textbook Rendering & OCR**: Rendered high-resolution scans and transcribed word-for-word into `sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់/chapter2-lesson2-intermolecular-forces.md`, covering Chapter 2 (`ជំពូកទី 2 សមាសធាតុក្នុងសូលុយស្យុងទឹក និងកម្លាំងអន្តរម៉ូលេគុល`), Lesson 2 (`មេរៀនទី 2 : កម្លាំងអន្តរម៉ូលេគុល`), including ionic bonds, covalent bonds, dipole-dipole forces, ionic forces, hydrogen bonds, London dispersion forces, boiling point comparisons, 11 lesson questions and solutions, and 12 end-of-chapter review questions and solutions.
- **Strict Blind Visual Audit**: Completed page-by-page visual audit across all 7 pages (`p032.png` to `p038.png`), fixing Khmer spacing in `លើទឹករាវ ?`, formatting all chemical formulas and electron counts in KaTeX, verifying textbook errata corrections (correcting misprinted $\text{CO}_3^{2+}$ to $\text{CO}_3^{2-}$), adjusting phase change description `ពីរាវទៅឧស្ម័ន`, verifying both Markdown comparison tables, and establishing a strict cut-off before the end-of-chapter exercise block on `p038.png`.
- **KruAI RAG Status**: KruAI RAG: YES (already grounded under `tb:chem:ch2:l2-intermolecular-forces-and-types` and `tb:chem:ch2:l2-boiling-points-and-molecular-geometry`). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់"`, `npm run check:digits` (0 Khmer numerals across all 363 files).


## 12 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 5: Lesson 1 Rational Functions Exercises Part 4 (Exercises 5 cont., 6, 7 start)

Commit: pending. **No database step needed.**

Digitized and audited Batch 5 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p040.png` to `p047.png`, Book pages 35 to 42):
- **Textbook Rendering & OCR**: Rendered high-resolution scans and transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/lesson1-rational-functions-exercises-part4.md`, covering:
  - Exercise 5 (conclusion): graphical discussion of parameter $m$ for quadratic equation $x^2 - (m+4)x + 2m + 8 = 0$ against curve $(C)$ and horizontal line $(\Delta) : y = m$ with 5 distinct root cases.
  - Exercise 6 ($f(x) = \frac{x^2 - x + 1}{x - 1}$): domain $D = \mathbb{R} - \{1\}$, limits at infinity and vertical asymptote $x = 1$, oblique asymptote $y = x$, derivative $f'(x) = \frac{x(x-2)}{(x-1)^2}$, sign table, relative extrema ($f(0) = -1, f(2) = 3$), variation table, proof of symmetry center $I(1, 1)$, curve construction $C$, and graphical discussion of roots for $x^2 - (m+1)x + m + 1 = 0$.
  - Exercise 7 ($y = \frac{x^2 - 1}{(x + 2)^2}$): questions 1 to 6, domain $D = \mathbb{R} - \{-2\}$, vertical asymptote $x = -2$, horizontal asymptote $y = 1$, and relative position study between $(C)$ and line $(L) : y = 1$ via $\alpha(x) = \frac{-4x - 5}{(x + 2)^2}$.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 8 pages (`p040.png` to `p047.png`):
  - Restored missing function notation `$f$` in Exercise 6 question 1 clause matching the printed text.
  - Corrected Khmer subscript from `ប្តូរសញ្ញា` to authentic `ប្ដូរសញ្ញា` (coeng da) in derivative sign transition statements.
  - Verified and footnoted printed book errata (e.g. $-(m-4)x$ vs $-(m+4)x$).
  - Maintained boundary markers `<!-- Page p040.png -->` through `<!-- Page p047.png -->` with 100% boundary integrity.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (7 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files).


## 11 Nov 2026: Physics Exam Papers (Student Volunteer 2019-2020) Batch 5: Chapter 1 Solutions Part 2 Line-by-Line Blind Audit

Commit: Pending. **No database step needed.**

Strict visual audit and verification for Batch 5 of Grade 12 Physics Exam Papers, Summary and Solutions (`sources/textbooks/វីញ្ញាសារូបវិទ្យា.pdf`, PDF pages `p030.png` to `p038.png`, Book pages 24 to 32: `sources/ocr/វីញ្ញាសារូបវិទ្យា/chapter1-solutions-part2.md`):
- **Lesson Scope**: Chapter 1 Thermodynamics Solutions Part 2 (`ជំពូក 1 ទែម៉ូឌីណាមិច · ផ្នែកដំណោះស្រាយ ភាគ 2`) & Chapter 2 Cover:
  - First Law of Thermodynamics (`ច្បាប់ទីមួយនៃទែម៉ូឌីណាមិច`), Solutions to Exercises 5 (cont.), 6, 7, and 8.
  - Heat Engines (`ដំណោះស្រាយ (ម៉ាស៊ីន)`), Solutions to Exercises 1 through 8.
  - Chapter 2 Cover (`ជំពូក 2 រលក` · `គោលការណ៍តម្រួតនៃរលក និងរលកជញ្ជ្រុំ`).
- **Line-by-Line Blind Visual Audit**:
  - Corrected Khmer law title on pages 24, 25 (`p030.png`, `p031.png`), restoring `តាមច្បាប់ទី 1 នៃទែម៉ូឌីណាមិច ៖` from truncated OCR `នៃម៉ូឌីណាមិច`.
  - Replaced illegal Khmer numeral `១` in editorial note with standard Latin numeral `1`.
  - Verified and documented textbook typos (e.g. $800\text{ J}$ vs $80\text{ J}$ on page 25, $T_h = \frac{T_c}{1 - e_c}$ notation slip on page 28, omitted $\times 10^6$ in subtraction step on page 29, $e_c = 0.82$ instead of $e_M = 0.82$ on page 30, and $1\text{ hp} = 746\text{ W}$ calculation discrepancy on page 31).
  - Confirmed 0 lines clipped or dropped at page breaks (`p030.png` through `p038.png`) with 100% boundary continuity.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new chunks added to `server/textbook-search.ts`.
- **Status Update**: Updated `sources/ocr/វីញ្ញាសារូបវិទ្យា/STATUS.md` Batch 5 to `OCR Audited: YES`.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/វីញ្ញាសារូបវិទ្យា"`, `npm run check:digits` (0 Khmer numerals across all 363 files).


## 11 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 4: Lesson 1 Rational Functions Exercises Part 3 (Exercises 4 cont., 5)

Commit: pending. **No database step needed.**

Digitized and audited Batch 4 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p032.png` to `p039.png`, Book pages 27 to 34):
- **Textbook Rendering & OCR**: Rendered high-resolution scans and transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/lesson1-rational-functions-exercises-part3.md`, covering:
  - Exercise 4 (conclusion): derivative sign table, local extrema ($f(-4) = -5, f(0) = 3$), limits at infinity, complete variation table, tangent line $(L) : y = \frac{5}{9}x + \frac{25}{9}$ at $x_0 = 1$, intersection point $A(4, 5)$ with oblique asymptote $(D) : y = x + 1$, full-page geometric figure with shaded region, and bounded area calculation $S = \int_1^2 \left(\frac{5}{9}x + \frac{25}{9} - \frac{x^2+3x+6}{x+2}\right)dx \approx 3.7\text{ units}^2$.
  - Exercise 5 ($f(x) = \frac{x^2 - 4x + 8}{x - 2}$): questions 1 to 4, domain $D = \mathbb{R} - \{2\}$, limits at infinity and vertical asymptote $x = 2$, oblique asymptote $y = x - 2$, derivative $f'(x) = \frac{x(x-4)}{(x-2)^2}$, sign table, monotonic intervals, local extrema ($f(0) = -4, f(4) = 4$), variation table, and curve construction figure.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 8 pages (`p032.png` to `p039.png`):
  - Fixed Khmer subscript orthography on page 27: updated to `ប្តូរ` matching the printed book.
  - Corrected LaTeX array column specifiers in sign and variation tables to preserve 10 and 11 column alignment.
  - Documented printed book notation slips (e.g. $x = 2$ instead of $x \neq 2$ in domain step, and slant asymptote label slip).
  - Maintained boundary markers `<!-- Page p032.png -->` through `<!-- Page p039.png -->` with 100% boundary integrity.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (6 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files).


## 11 Nov 2026: Physics Exam Papers (Student Volunteer 2019-2020) Batch 4: Chapter 1 Solutions Part 1 Line-by-Line Blind Audit

Commit: Pending. **No database step needed.**

Strict visual audit and verification for Batch 4 of Grade 12 Physics Exam Papers, Summary and Solutions (`sources/textbooks/វីញ្ញាសារូបវិទ្យា.pdf`, PDF pages `p021.png` to `p029.png`, Book pages 15 to 23: `sources/ocr/វីញ្ញាសារូបវិទ្យា/chapter1-solutions-part1.md`):
- **Lesson Scope**: Chapter 1 Thermodynamics Solutions Part 1 (`ជំពូក 1 ទែម៉ូឌីណាមិច · ផ្នែកដំណោះស្រាយ ភាគ 1`):
  - Section 1: Kinetic Theory of Gases (`ទ្រឹស្តីស៊ីនេទិចនៃឧស្ម័ន`), Solutions to Exercises 1–7 complete.
  - Section 2: First Law of Thermodynamics (`ច្បាប់ទីមួយនៃទែម៉ូឌីណាមិច`), Solutions to Exercises 1–4, and Exercise 5 part ក start.
- **Line-by-Line Blind Visual Audit**:
  - Corrected Khmer spelling in Exercise 1 from `បណ្ដោយ` to authentic `បណ្តោយ`.
  - Removed extraneous word `ក្រាប` in question title on page 20 (`p026.png`).
  - Added clarifying editorial notes on missing unit $\text{J}$ in boxed answer $W_{\text{ABCA}} = 1.5 \times 10^5$ on page 21 (`p027.png`).
  - Fixed dropped Khmer syllable in law title on pages 22 and 23 (`p028.png`, `p029.png`), restoring `តាមច្បាប់ទី 1 នៃទែម៉ូឌីណាមិច` from incomplete `នៃម៉ូឌីណាមិច`.
  - Added physics notes on printed textbook typos on page 23 (multiplied by $10^3$ twice and work value discrepancy).
  - Confirmed 0 lines clipped or dropped at page breaks (`p021.png` through `p029.png`) with 100% boundary continuity.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new chunks added to `server/textbook-search.ts`.
- **Status Update**: Updated `sources/ocr/វីញ្ញាសារូបវិទ្យា/STATUS.md` for Batch 4 to `OCR Audited: YES`.


## 11 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 3: Lesson 1 Rational Functions Exercises Part 2 (Exercises 2 cont., 3, 4 start)

Commit: pending. **No database step needed.**

Digitized and audited Batch 3 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p024.png` to `p031.png`, Book pages 19 to 26):
- **Textbook Rendering & OCR**: Rendered high-resolution scans and transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/lesson1-rational-functions-exercises-part2.md`, covering:
  - Exercise 2 (conclusion): graph construction $C$ and graphical discussion of parameter $m$ ($x^2 - (m+1)x - 2(m+1) = 0$).
  - Exercise 3 ($f(x) = \frac{x^2 - 4x}{x^2 - 4x + 3}$): domain, limits at infinity and vertical/horizontal asymptotes ($x=1, x=3, y=1$), derivative $f'(x) = \frac{6(x-2)}{(x^2 - 4x + 3)^2}$, derivative sign table, local minimum $f(2) = 4$, variation table, proof of symmetry axis $x = 2$, curve construction, and tangents $(T_1) : y = -\frac{4}{3}x$ at $O(0, 0)$ and $(T_2) : y = \frac{4}{3}x - \frac{16}{3}$ at $A(4, 0)$ intersecting on the symmetry axis.
  - Exercise 4 ($f(x) = \frac{x^2 + 3x + 6}{x + 2}$, Bac II 2010): questions a, b, c, derivative $f'(x) = \frac{x(x+4)}{(x+2)^2}$, and extrema setup.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 8 pages (`p024.png` to `p031.png`):
  - Documented book typo for limit sign inversion at $x \to 1$ ($+\infty$ for $x \to 1^-$ and $-\infty$ for $x \to 1^+$ in print).
  - Removed hallucinated conclusion line on page 23 not present on the printed page.
  - Added missing colon in extremum calculation heading matching the original scan.
  - Maintained boundary markers `<!-- Page p024.png -->` through `<!-- Page p031.png -->` with 100% boundary integrity.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (5 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files).


## 11 Nov 2026: Physics Exam Papers (Student Volunteer 2019-2020) Batch 3: Chapter 1 Exercises Line-by-Line Blind Audit

Commit: Pending. **No database step needed.**

Strict visual audit and verification for Batch 3 of Grade 12 Physics Exam Papers, Summary and Solutions (`sources/textbooks/វីញ្ញាសារូបវិទ្យា.pdf`, PDF pages `p015.png` to `p020.png`, Book pages 9 to 14: `sources/ocr/វីញ្ញាសារូបវិទ្យា/chapter1-exercises.md`):
- **Lesson Scope**: Chapter 1 Thermodynamics Exercises (`ជំពូក 1 ទែម៉ូឌីណាមិច · ផ្នែកលំហាត់`):
  - Section 1: Kinetic Theory of Gases (`ទ្រឹស្តីស៊ីនេទិចនៃឧស្ម័ន`), Exercises 1–7.
  - Section 2: First Law of Thermodynamics (`ច្បាប់ទីមួយនៃម៉ូឌីណាមិច`), Exercises 1–8 (including $P-V$ diagram work calculations, closed cycle $\text{ABCA}$ triangle and $\text{ABCD}$ rectangle work, and heat).
  - Section 3: Heat Engines (`ម៉ាស៊ីន`), Exercises 1–8 (including Carnot engines, actual engines, diesel engines, and steam engines).
- **Line-by-Line Blind Visual Audit**:
  - Restored missing Khmer full stop `។` at line-end of page 11 (PDF `p017.png`), Exercise 5 (`(សន្មតថាជាឧស្ម័នបរិសុទ្ធ)។`).
  - Corrected typographical omission in Exercise 8 (PDF `p018.png`), noting `ខណៈប្រព័ន្ធរួមដ្យាបាទិច [រួមអាដ្យាបាទិច]` for adiabatic compression.
  - Added editorial clarifying annotations to Exercise 3 and 4 (PDF `p019.png`) regarding textbook phrasing `ធុងក្តៅពីរ [ប្រភពកម្តៅពីរ គឺធុងក្តៅ និងធុងត្រជាក់]` and `បំភាយកម្តៅ [ស្រូបកម្តៅ] $500\text{ kJ}$ ពីធុងក្តៅ`.
  - Added physics standard note for Exercise 8 (PDF `p020.png`) regarding printed horsepower conversion $1.0\text{ hp} = 786\text{ W}$ ($1\text{ hp} \approx 746\text{ W}$).
  - Confirmed 0 lines clipped or dropped at page breaks (`p015.png` through `p020.png`) and exact word boundaries verified.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new chunks added to `server/textbook-search.ts`.
- **Status Update**: Updated `sources/ocr/វីញ្ញាសារូបវិទ្យា/STATUS.md` for Batch 3 to `OCR Audited: YES`.

## 11 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 2: Lesson 1 Rational Functions Exercises Part 1 (Exercises 1 to 4)

Commit: pending. **No database step needed.**

Digitized and audited Batch 2 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p016.png` to `p023.png`, Book pages 11 to 18):
- **Textbook Rendering & OCR**: Rendered high-resolution scans and transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/lesson1-rational-functions-exercises-part1.md`, covering:
  - Exercise 1 ($f(x) = \frac{x^2 - 4x + 8}{2x - 4}$): canonical form decomposition, limits at infinity and vertical asymptote $x = 2$, oblique asymptote $y = \frac{1}{2}x - 1$, derivative $f'(x)$, variation sign table, relative extrema, curve construction $C$, and graphical inequality solving.
  - Exercise 2 ($f(x) = \frac{x^2 - x - 6}{x + 2}$): domain, limits, vertical asymptote $x = -2$, polynomial long division, oblique asymptote $y = x - 3$, derivative $f'(x)$, variation sign table, relative extrema, and proof of symmetry center $I(-2, -5)$.
  - Exercise 3 and Exercise 4: full problem formulations, synthetic divisions, derivative tables, and curve plotting setups.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 8 pages (`p016.png` to `p023.png`):
  - Corrected Khmer spelling typo in subquestion គ from `បរិមារធៀប` to `បរិមាធៀប` (relative extremum).
  - Restored comma in `$b = -1,$` in solution text matching printed textbook formula notation.
  - Corrected subscript orthography from `ប្តូរសញ្ញា` to authentic `ប្ដូរសញ្ញា`.
  - Re-aligned KaTeX array table columns in derivative sign and variation tables where `-\infty ||` was merged.
  - Maintained boundary markers `<!-- Page p016.png -->` through `<!-- Page p023.png -->` with 100% boundary integrity.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (4 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files).


## 11 Nov 2026: Physics Exam Papers (Student Volunteer 2019-2020) Batch 2: Chapter 1 Lessons 1–3 Theory & Formulas Audit

Commit: Pending. **No database step needed.**

Digitized and audited Batch 2 of Grade 12 Physics Exam Papers, Summary and Solutions (`sources/textbooks/វីញ្ញាសារូបវិទ្យា.pdf`, PDF pages `p009.png` to `p014.png`, Book pages 3 to 8):
- **Textbook Rendering & OCR**: Verified high-resolution scans and complete transcription in `sources/ocr/វីញ្ញាសារូបវិទ្យា/chapter1-theory-and-formulas.md`, covering Chapter 1 Thermodynamics (`ជំពូក 1 ទែម៉ូឌីណាមិច`):
  - Lesson 1: Kinetic Theory of Gases (`ទ្រឹស្តីស៊ីនេទិចនៃឧស្ម័ន`): molar mass, molecular mass, total mass, moles, molecules, Avogadro's number, ideal gas equation of state, constants ($R, N_A, k_B$), temperature conversion, average kinetic energy, total kinetic energy, and RMS speed.
  - Lesson 2: First Law of Thermodynamics (`ច្បាប់ទី 1 ទែម៉ូឌីណាមិច`): first law statement ($Q = \Delta U + W$), sign conventions for heat, internal energy, and work, isobaric process with $P-V$ diagram, linear pressure variation process with $P-V$ diagram ($A_1 + A_2$), isothermal process with $P-V$ diagram, and internal energy formulas for monoatomic gas.
  - Lesson 3: Heat Engines (`ម៉ាស៊ីន`): Carnot engine energy balance, energy balance diagram, thermal efficiency ($e = 1 - Q_c/Q_h = 1 - T_c/T_h$), parameter descriptions, four-stroke engine cycle, mechanical work, thermal efficiency, transmission/mechanical efficiency, and overall/useful engine efficiency.
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 6 pages (`p009.png` to `p014.png`):
  - Split display equation and unit conversion on page 4 ($1\text{ eV} = 1.6 \times 10^{-19}\text{ J}$) onto separate lines to prevent mobile viewport clipping.
  - Formatted page 7 parameter reference table into structured 2-column layout (`| និមិត្តសញ្ញា | ពន្យល់ |`) to match page 8 and avoid empty cells.
  - Added clean block separation before equation derivation lines.
  - Verified 100% boundary integrity, zero Khmer numerals, zero em dashes, and zero Khmer text inside math delimiters.
  - Updated `sources/ocr/វីញ្ញាសារូបវិទ្យា/STATUS.md` for Batch 2 to `OCR Audited: YES`.
- **KruAI RAG Status**: KruAI RAG: YES (already grounded in `server/textbook-search.ts`). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/វីញ្ញាសារូបវិទ្យា"` (3 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files).


## 11 Nov 2026: Math Function Graphs (Ron Raksmey) Batch 1: Front Matter & Lesson 1 Rational Functions Theory

Commit: pending. **No database step needed.**

Digitized and audited Batch 1 of Grade 12 Math Function Graphs (`sources/textbooks/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី.pdf`, PDF pages `p001.png` to `p015.png`, Book pages i to iv and 1 to 10):
- **Textbook Rendering & OCR**: Rendered high-resolution scans and transcribed word-for-word into `sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី/`:
  - `front-matter.md`: Cover, Foreword (`អារម្ភកថា`), Review Committee, Acknowledgments, and Table of Contents (`មាតិកា`).
  - `lesson1-rational-functions-theory.md`: Lesson 1 Rational Functions (`មេរៀនទី 1 អនុគមន៍សនិទាន`) covering definitions 1.1 and 1.2, variation study rules, domain calculations, vertical/horizontal/oblique asymptotes, derivative formulas, relative extrema, inflection points, symmetry axis/center, continuity on intervals, and root theorems (Intermediate Value Theorem and Rolle's Theorem).
- **Strict Blind Visual Audit**: Completed line-by-line visual audit across all 15 pages (`p001.png` to `p015.png`):
  - Formatted display math equations to separate lines to ensure proper KaTeX rendering and zero Khmer characters inside math blocks.
  - Corrected textbook misprint in limit numerator on page 6 ($\lim_{x \to 2} (x^2 + 2x - 3) = 5$).
  - Corrected misread interval terminology on page 10 (`ចន្លោះបិទ [a, b]`).
  - Restored missing function parameter in limit equation on page 10 ($\lim_{x \to b^-} f(x) = f(b)$).
  - Maintained boundary markers `<!-- Page p001.png -->` through `<!-- Page p015.png -->` with 100% boundary integrity.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math ក្រាបនៃអនុគមន៍_រុន_រស្មី"` (3 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 11 Nov 2026: Physics Exam Papers (Student Volunteer 2019-2020) Batch 1: Front Matter & Chapter 1 Title

Commit: Pending. **No database step needed.**

Digitized and audited Batch 1 of Grade 12 Physics Exam Papers, Summary and Solutions (`sources/textbooks/វីញ្ញាសារូបវិទ្យា.pdf`, PDF pages `p001.png` to `p008.png`, Book pages i to iv, 1 to 2):
- **Textbook Rendering & OCR**: Rendered high-resolution scans and transcribed word-for-word into `sources/ocr/វីញ្ញាសារូបវិទ្យា/front-matter.md`, covering Cover, Foreword (`អារម្ភកថា`), Table of Contents (`មាតិកា`), Chapter 1 Title Page (`1- ទែម៉ូឌីណាមិច`), and Problem Solving Keys Banner (`គន្លឹះដោះស្រាយ`).
- **Strict Blind Visual Audit**: Completed page-by-page visual audit across all 8 pages (`p001.png` to `p008.png`), removing hallucinated duplicate titles, adjusting header layout, converting Khmer numerals to Latin digits 0-9, verifying zero dropped lines at page bottoms, and recording audit results in `sources/ocr/វីញ្ញាសារូបវិទ្យា/STATUS.md`.
- **KruAI RAG Status**: KruAI RAG: NO (Front Matter, OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/វីញ្ញាសារូបវិទ្យា"` (2 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files).


## 11 Nov 2026: Chemistry Summary & Solutions: Chapter 2 Lesson 1 (Aqueous Solutions) OCR & Audit

Commit: Pending. **No database step needed.**

Digitized and audited Lesson 1 of Chapter 2 (`sources/textbooks/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់.pdf`, PDF pages `p026.png` bottom half to `p032.png` top half):
- **Textbook Rendering & OCR**: Rendered high-resolution scans and transcribed word-for-word into `sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់/chapter2-lesson1-aqueous-solutions.md`, covering Chapter 2 (`ជំពូកទី 2 សមាសធាតុក្នុងសូលុយស្យុងទឹក និងកម្លាំងអន្តរម៉ូលេគុល`), Lesson 1 (`មេរៀនទី 1 : សមាសធាតុក្នុងសូលុយស្យុងទឹក`), including dissociation, precipitation reactions, net ionic equations, strong and weak electrolytes, full 17-column solubility rules table, and all 10 questions and step-by-step solutions.
- **Strict Blind Visual Audit**: Completed page-by-page visual audit across all 7 pages, verifying all 160 cells of the solubility matrix, correcting OCR misspelling `អតិបរិមា` to printed `អតិបរមា`, correcting duplicate `ក/` to `ខ/` in Answer 7, fixing subscript and superscript order in ionic KaTeX blocks, resolving polyatomic parentheses grouping, and documenting author molar mass typo with editorial note.
- **KruAI RAG Status**: KruAI RAG: YES (already grounded under `tb:chem:ch2:l1-dissociation-ionization-hydronium` and `tb:chem:ch2:l1-electrolytes-and-stoichiometry-exercises`). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់"`, `npm run check:digits` (0 Khmer numerals across all 363 files).


## 11 Nov 2026: Chemistry Summary & Solutions: Chapter 1 Exercises Part 2 (p021 to p026) OCR & Audit

Commit: Pending. **No database step needed.**

Digitized and audited Part 2 of Chapter 1 End-of-Chapter Exercises and Solutions (`sources/textbooks/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់.pdf`, PDF pages `p021.png` to `p026.png` top half):
- **Textbook Rendering & OCR**: Rendered high-resolution scans and transcribed word-for-word into `sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់/chapter1-exercises-part2.md`, completing Chapter 1 (`ជំពូកទី 1 ស៊ីនេទិចគីមី`) supplementary exercises, reaction equations, rate calculations, and redox catalysts.
- **Strict Blind Visual Audit**: Completed page-by-page visual audit across all 6 pages, removing artifact `# ?`, restoring missing full stops, correcting `contacts` OCR hallucination to authentic Khmer `គឺជារេដុករផង និងអុកស៊ីតករផង`, restoring beaker term `កែវបេស៊ែ`, preserving printed book typos with editorial notes, and confirming the clean boundary before Chapter 2 on `p026.png`.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់"`, `npm run check:digits` (0 Khmer numerals across all 363 files).


## 11 Nov 2026: Chemistry Summary & Solutions: Chapter 1 Exercises Part 1 (p014 to p020) OCR & Audit

Commit: Pending. **No database step needed.**

Digitized and audited Part 1 of Chapter 1 End-of-Chapter Exercises and Solutions (`sources/textbooks/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់.pdf`, PDF pages `p014.png` to `p020.png`):
- **Textbook Rendering & OCR**: Rendered high-resolution scans and transcribed word-for-word into `sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់/chapter1-exercises-part1.md`, covering Chapter 1 (`ជំពូកទី 1 ស៊ីនេទិចគីមី`), End-of-Chapter Exercises (Questions 1 to 11, Solutions 1 to 12, and Supplementary Exercises Questions 1 to 6).
- **Strict Blind Visual Audit**: Completed page-by-page visual audit across all 7 pages, correcting OCR misreadings (`ការប្រែប្រួល` to `កំណែប្រែដល់`, `អនុកមន៍` to `អនុគមន៍`), correcting critical chemical concept misreads (`ទំហំធៀប` to `ទំហំផ្ទុយនៃផលធៀប` and `ទំហំផ្ទុយនៃលីមីត` with proper negative signs in rate limit formulas, and `ឌីស្វូតកម្ម` to `ឌីស្មូតកម្ម`), and aligning page breaks with exact line continuity.
- **KruAI RAG Status**: KruAI RAG: NO (OCR only). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់"`, `npm run check:digits` (0 Khmer numerals across all 363 files).


## 11 Nov 2026: Chemistry Summary & Solutions: Chapter 1 Lesson 2 (Kinetic Factors) OCR & Audit

Commit: Pending. **No database step needed.**

Digitized and audited Lesson 2 of Grade 12 Chemistry Summary and Solutions textbook (`sources/textbooks/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់.pdf`, PDF pages `p006.png` bottom half to `p013.png` full):
- **Textbook Rendering & OCR**: Rendered high-resolution scans and transcribed word-for-word into `sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់/chapter1-lesson2-kinetic-factors.md`, covering Chapter 1 (`ជំពូកទី 1 ស៊ីនេទិចគីមី`), Lesson 2 (`មេរៀនទី 2 កត្តាជះឥទ្ធិពលលើល្បឿនប្រតិកម្ម`), including surface area, reactant concentration, temperature, pressure, catalysts (homogeneous, heterogeneous, enzymatic), reaction mechanisms, intermediate complexes, potential energy diagrams, and all 21 questions and solutions.
- **Strict Blind Visual Audit**: Completed page-by-page visual audit across all 8 pages, fixing OCR misread `ឬបំបាត់` to printed `ឬបាត់`, restoring missing word `ជា` (`គឺជាការបង្កើនល្បឿនប្រតិកម្ម`), correcting acid spelling `អាស៊ីតក្លរីឌ្រិច`, resolving critical KaTeX issue in Answer 16 where Khmer text was inside `$$...$$`, restoring dropped word `ការ`, and verifying that Lesson 2 concludes at `p013.png` before end-of-chapter exercises start on `p014.png`.
- **KruAI RAG Status**: KruAI RAG: YES (already grounded under `tb:chem:ch1:l2-kinetic-factors-theory` and `tb:chem:ch1:l2-catalysis-redox-mechanism-and-exercises`). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់"`, `npm run check:digits` (0 Khmer numerals across all 363 files).


## 11 Nov 2026: Chemistry Summary & Solutions: Chapter 1 Lesson 1 (Reaction Rates) OCR & Audit

Commit: Pending. **No database step needed.**

Digitized and audited Lesson 1 of Grade 12 Chemistry Summary and Solutions textbook (`sources/textbooks/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់.pdf`, PDF pages `p003.png` to `p006.png` top half):
- **Textbook Rendering & OCR**: Rendered high-resolution scans and transcribed word-for-word into `sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់/chapter1-lesson1-reaction-rate.md`, covering Chapter 1 (`ជំពូកទី 1 ស៊ីនេទិចគីមី`), Lesson 1 (`មេរៀនទី 1 ល្បឿនប្រតិកម្មគីមី`), including reaction rate definitions, instantaneous rates, tangent slopes, and 3 numbered questions and complete solutions.
- **Strict Blind Visual Audit**: Completed page-by-page visual audit across all 4 pages, correcting OCR misread `ជាបម្រែបម្រួលកំហាប់` to printed `ជាបំណាស់ប្តូរកំហាប់`, restoring colon in definition headers, adding tangent line labels $T_1$ and $T_2$, correcting acid spelling `អាស៊ីតក្លរីឌ្រិច`, correcting formula subscripts to $t_1, t_2$, and verifying line boundary cut-offs.
- **KruAI RAG Status**: KruAI RAG: YES (already grounded under `tb:chem:ch1:l1-reaction-rate-definition-and-types` and `tb:chem:ch1:l1-stoichiometry-dismutation-and-problems`). No new RAG chunks added (per OCR-only scope).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/មេរៀនសង្ខេប_ចម្លើយសំណួរនិងលំហាត់"`, `npm run check:digits` (0 Khmer numerals across all 363 files).


## 11 Nov 2026: Chemistry Workbook Batch 4: Chapter 2 Lesson 2 (Intermolecular Forces) OCR, Study Path & KruAI Grounding

Commit: `60b37d7`. **No database step needed.**

Digitized and audited Batch 4 of Grade 12 Chemistry Workbook (`sources/textbooks/សៀវភៅលំហាត់គីមីវិទ្យា_ម៉ៃ_ម៉ាល័យ.pdf`, Book pages 67 to 73, PDF pages `p075.png` to `p081.png`):
- **Textbook Rendering & OCR**: Rendered high-resolution scans (`p075.png` to `p081.png`) and transcribed word-for-word into `sources/ocr/សៀវភៅលំហាត់គីមីវិទ្យា_ម៉ៃ_ម៉ាល័យ/chapter2-lesson2-intermolecular-forces.md`:
  - Chapter 2 (`ជំពូកទី 2 សមាសធាតុក្នុងសូលុយស្យុងទឹក និងកម្លាំងអន្តរម៉ូលេគុល`), Lesson 2 (`មេរៀនទី 2 កម្លាំងអន្តរម៉ូលេគុល`), covering comparison of ionic vs covalent forces, ionic lattice energy ($\mathrm{CaF_2 > NaCl > KCl > RbCl}$), dipole-dipole attractions, hydrogen bonding in $\mathrm{HF, H_2O, NH_3}$, London dispersion forces in non-polar molecules and noble gases ($\mathrm{Ar, Ne, CBr_4, CCl_4}$), boiling point anomalies ($\mathrm{H_2O}$ vs $\mathrm{H_2S}$, $\mathrm{HF}$ vs $\mathrm{HCl/HBr/HI}$, $\mathrm{NH_3}$ vs $\mathrm{PH_3}$), and squalene ($\mathrm{C_{30}H_{50}}$) large molecular mass effects, encompassing all 46 questions across 8 sections.
- **Strict Blind Visual Audit**: Completed page-by-page visual audit across all 7 pages, fixing Section 8 heading hallucination to exact print `### 8. ទម្រង់ភាគល្អិត និងទ្រង់ទ្រាយក៏ដើរតួនាទីសំខាន់`, adding missing word `គ្នា` in Section 1 Question 1, correcting verb in Section 5 Question 2 to `ចូររកឧទាហរណ៍`, restoring top page boundary line on page 71 (`p079.png`), and verifying all chemical formulas and subscripts.
- **KruAI RAG Grounding**: Added 2 keyworded chunks (`tb:chem:ch2:l2-intermolecular-forces-and-types`, `tb:chem:ch2:l2-boiling-points-and-molecular-geometry`) to `CHEMISTRY_CH2_SECTIONS` and included in `ALL_CHEMISTRY_SECTIONS` in `server/textbook-search.ts`.
- **Study Path Structure**: Added Chapter 2 Lesson 2 with 5 authentic Khmer section titles under `SUBJECT_SESSIONS.chemistry[1]` in `src/features/lessons/sessions.ts`.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/សៀវភៅលំហាត់គីមីវិទ្យា_ម៉ៃ_ម៉ាល័យ"` (4 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 11 Nov 2026: Math Summary Blind Audit Batch 9: Chapter 9 Vectors in Space (Pages 89 to 93)

Commit: `fe3f891`. **No database step needed.**

Conducted strict blind audit pass on the 9th and final chapter of the Grade 12 Math summary textbook, Chapter 9 (Vectors in Space: PDF pages `p92.png` to `p96.png`, Book pages 89 to 93) in `sources/ocr/Math summary/chapter9-vectors-in-space.md`:
- **Line-by-Line Visual Audit & Fixes**:
  - Inserted page boundary markers `<!-- Page p92.png -->` through `<!-- Page p96.png -->`.
  - Corrected critical OCR corruption in Exercise 4: `ចតុgroup` to authentic `ចតុកោណ` (quadrilateral).
  - Fixed Khmer spelling on page 90: `ពីរផ្លង់` to `ប្លង់ពីរ` (two planes).
  - Restored omitted Ministry study guidance note on page 90: `កំណត់សម្គាល់ : អ្នកសិក្សាត្រូវខំប្រឹងដោះស្រាយលំហាត់ដោយខ្លួនឯង ចំណែកចម្លើយសម្រាប់តែផ្ទៀងផ្ទាត់ ។`.
  - Restored omitted textbook derivation text in plane and line distance formulas, parallelepiped/tetrahedron volume explanations (`បានន័យថា យកមាឌរបស់ប្រលេពីប៉ែតចែកនឹង 6 ។`), and explicit substitution steps in parametric line equations.
  - Removed unprinted additions, fabricated determinants, English interpolations, and unprinted equation simplifications at the end of page 93.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math summary"` (9 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 11 Nov 2026: Biology Tho Phon Completion: Chapter 8 Lesson 2 Biogeochemical Cycles OCR & KruAI RAG

Commit: `c4101c0`. **No database step needed.**

Completed and audited the final textbook lesson of Grade 12 Biology (Tho Phon) covering Chapter 8, Lesson 2 (Biogeochemical Cycles / វដ្តរូបធាតុ, PDF pages 190 to 191, Book pages 189 to 190):
- **Transcribed & Blind-Audited OCR**:
  - Transcribed `sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna/chapter8-lesson2-biogeochemical-cycles.md`.
  - Dispatched Strict Blind Auditor subagent comparing character-by-character against scans `p190.png` and `p191.png`.
  - Fixed OCR hallucination in Section 2 (`ផ្លេកបន្ទោរ` instead of hallucinated `ផ្គររន្ទះ`), corrected Khmer orthography (`ឬស` and `សណ្ដែក`), rectified diagram labels (`ហៀរចេញ`, `កម្ទេចកំណ`, `($\mathrm{HCO_3}$)`), and preserved the comparative table between Carbon and Nitrogen cycles.
- **KruAI RAG Grounding & Curriculum Sessions**:
  - Added dedicated RAG section `tb:bio:ch8:biogeochemical-carbon-nitrogen-cycles-tho-phon-qna` to `server/textbook-search.ts` under `BIOLOGY_CH8_SECTIONS`.
  - Registered authentic Khmer section titles in `src/features/lessons/sessions.ts` for Chapter 8 Lesson 2: "វដ្តកាបូន និងការផ្លាស់ប្តូរឧស្ម័ន", "វដ្តអាសូត និងបាក់តេរីកំពកឫស", and "ការប្រៀបធៀបវដ្តកាបូន និងវដ្តអាសូត".
- **Verification**: Verified with `ocr-check.mjs` (19 pages, 0 issues), `npm run check:digits` (0 Khmer digits), `npx oxlint` (0 errors), and `npx tsc -b` (clean).


## 11 Nov 2026: Math Summary Blind Audit Batch 8: Chapter 8 Probability (Pages 83 to 88)

Commit: `f838d7e`. **No database step needed.**

Conducted strict blind audit pass on Chapter 8 (Probability: PDF pages `p86.png` to `p91.png`, Book pages 83 to 88) in `sources/ocr/Math summary/chapter8-probability.md`:
- **Line-by-Line Visual Audit & Fixes**:
  - Inserted page boundary markers `<!-- Page p86.png -->` through `<!-- Page p91.png -->`.
  - Restored missing textbook advisory note on page 84: `កំណត់សម្គាល់ : អ្នកសិក្សាត្រូវខំប្រឹងដោះស្រាយលំហាត់ដោយខ្លួនឯង ចំណែកចម្លើយសម្រាប់តែផ្ទៀងផ្ទាត់ ។`.
  - Corrected Khmer mathematical vocabulary: `ជារូបបេះដូង` (was misread as `បេះដូងក្រហម`), `កើតជាស្វ៊ីតនព្វន្ត` (was misread as `បង្កើតបានស្វ៊ីតនព្វន្ត`), `សមត្ថិកម្ម` with proper subscript consonant, and `គេសន្មិដ្ឋាន` (was misread as `គេសន្មត`).
  - Removed hallucinated remarks (e.g. fabricated notes like $P(B)+P(C)=1$ and artificial card distribution breakdowns).
  - Restored exact textbook factorial expansion steps and algebraic setups across Exercises 1 to 4 ($C(8, 3)$, $C(4, 2)$, $C(12, 3)$, permutations, and combinations).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math summary"` (9 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 11 Nov 2026: Chemistry Workbook Batch 3: Chapter 2 Lesson 1 (Compounds in Aqueous Solution) OCR, Study Path & KruAI Grounding

Commit: `e13811a`. **No database step needed.**

Digitized and audited Batch 3 of Grade 12 Chemistry Workbook (`sources/textbooks/សៀវភៅលំហាត់គីមីវិទ្យា_ម៉ៃ_ម៉ាល័យ.pdf`, Book pages 48 to 66, PDF pages `p056.png` to `p074.png`):
- **Textbook Rendering & OCR**: Rendered high-resolution scans (`p056.png` to `p074.png`) and transcribed word-for-word into `sources/ocr/សៀវភៅលំហាត់គីមីវិទ្យា_ម៉ៃ_ម៉ាល័យ/chapter2-lesson1-compounds-in-aqueous-solution.md`:
  - Chapter 2 (`ជំពូកទី 2 សមាសធាតុក្នុងសូលុយស្យុងទឹក និងកម្លាំងអន្តរម៉ូលេគុល`), Lesson 1 (`មេរៀនទី 1 សមាសធាតុក្នុងសូលុយស្យុងទឹក`), covering ionic dissociation, solubility rules, spectator ions, net ionic equations, ionization of molecular compounds, hydronium ion ($\mathrm{H_3O^+}$) coordinate bonding, strong/weak/non-electrolytes, and all 20 applied exercises and problems with printed answer keys, followed by 10 student answer sheets.
- **Strict Blind Visual Audit**: Completed page-by-page visual audit across all 19 pages, correcting spelling `អាស៊ីតក្លរីឌ្រីច` on pages 49 and 53, fixing `អាលុយមីញ៉ូមក្លរួ` on page 53, verifying all 19 page boundaries, and checking chemical formulas, exponents, and precipitation reaction equations.
- **KruAI RAG Grounding**: Added 2 keyworded chunks (`tb:chem:ch2:l1-dissociation-ionization-hydronium`, `tb:chem:ch2:l1-electrolytes-and-stoichiometry-exercises`) to `CHEMISTRY_CH2_SECTIONS` and included in `ALL_CHEMISTRY_SECTIONS` in `server/textbook-search.ts`.
- **Study Path Structure**: Added Chapter 2 (`សមាសធាតុក្នុងសូលុយស្យុងទឹក និងកម្លាំងអន្តរម៉ូលេគុល`), Lesson 1 (`សមាសធាតុក្នុងសូលុយស្យុងទឹក`) with 6 authentic Khmer section titles under `SUBJECT_SESSIONS.chemistry[1]` in `src/features/lessons/sessions.ts`.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/សៀវភៅលំហាត់គីមីវិទ្យា_ម៉ៃ_ម៉ាល័យ"` (0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 11 Nov 2026: Math Summary Blind Audit Batch 7: Chapter 7 Differential Equations (Pages 78 to 82)

Commit: `813d246`. **No database step needed.**

Conducted strict blind audit pass on Chapter 7 (Differential Equations: PDF pages `p81.png` to `p85.png`, Book pages 78 to 82) in `sources/ocr/Math summary/chapter7-differential-equations.md`:
- **Line-by-Line Visual Audit & Fixes**:
  - Inserted page boundary markers `<!-- Page p81.png -->` through `<!-- Page p85.png -->`.
  - Fixed recurring OCR error "ខ្សែរោង" to the authentic mathematical term "ខ្សែកោង" (curve) in Exercise 4 on pages 81 and 82.
  - Restored missing intermediate derivation on page 78 for first-order non-homogeneous equations: `- ពី $y = A(x)e^{-ax}$ ទាញរក $y'$ រួចយក $y$ និង $y'$ ជំនួសក្នុងសមីការ...`.
  - Removed artificial discriminant headings not in the textbook; restored canonical algebraic formulation $(y' - \alpha y)' - \beta(y' - \alpha y) = 0$ and monic characteristic equation $\lambda^2 + b\lambda + c = 0$.
  - Restored student note on page 80 (`កំណត់សម្គាល់ : អ្នកសិក្សាត្រូវខំប្រឹងដោះស្រាយលំហាត់ដោយខ្លួនឯង...`) and integration constant $(A = \pm e^c)$ on page 81.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math summary"` (9 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 11 Nov 2026: Math Summary Blind Audit Batch 6: Chapter 6 Conics (Pages 69 to 77)

Commit: `17cae0b`. **No database step needed.**

Conducted strict blind audit pass on Chapter 6 (Conics: PDF pages `p72.png` to `p80.png`, Book pages 69 to 77) in `sources/ocr/Math summary/chapter6-conics.md`:
- **Line-by-Line Visual Audit & Fixes**:
  - Inserted page boundary markers `<!-- Page p72.png -->` through `<!-- Page p80.png -->`.
  - Corrected concavity terminology from `ភាពប៉ោង` to authentic textbook `ភាពផត` across all 8 parabola cases.
  - Removed fabricated summary lines and hallucinated graphing sentences not present in original print.
  - Restored missing student guidance note on page 71 (`p74.png`).
  - Aligned page transitions across Exercises 1 through 9 with 100% boundary fidelity.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math summary"` (9 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 11 Nov 2026: Math Summary Blind Audit Batch 5B: Chapter 5 Complex Numbers (Part 2, Pages 63 to 68)

Commit: `71078a6`. **No database step needed.**

Conducted strict blind audit pass on Chapter 5 (Complex Numbers, Part 2: PDF pages `p66.png` to `p71.png`, Book pages 63 to 68) in `sources/ocr/Math summary/chapter5-complex-numbers.md`:
- **Line-by-Line Visual Audit & Fixes**:
  - Inserted page boundary markers `<!-- Page p66.png -->` through `<!-- Page p71.png -->`.
  - Corrected inverted root signs in Question 8 ($z_3 = -i\sqrt{2}, z_4 = i\sqrt{2}$).
  - Removed fabricated subtitles and method numbers, restoring canonical MoEYS identities.
  - Restored full induction proofs, interval conditions, and discriminant calculations across Questions 7, 9, 10, 11, 13, and 14.
  - Aligned page transitions across all 6 pages with 100% boundary fidelity.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math summary"` (9 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 11 Nov 2026: Chemistry Workbook Batch 2: Chapter 1 Lesson 2 (Factors Affecting Reaction Rates) OCR, Study Path & KruAI Grounding

Commit: `621993e`. **No database step needed.**

Digitized and audited Batch 2 of Grade 12 Chemistry Workbook (`sources/textbooks/សៀវភៅលំហាត់គីមីវិទ្យា_ម៉ៃ_ម៉ាល័យ.pdf`, Book pages 23 to 47, PDF pages `p031.png` to `p055.png`):
- **Textbook Rendering & OCR**: Rendered high-resolution scans (`p031.png` to `p055.png`) and transcribed word-for-word into `sources/ocr/សៀវភៅលំហាត់គីមីវិទ្យា_ម៉ៃ_ម៉ាល័យ/chapter1-lesson2-factors-affecting-reaction-rate.md`:
  - Chapter 1 (`ជំពូកទី 1 ស៊ីនេទិចគីមី`), Lesson 2 (`មេរៀនទី 2 កត្តាជះឥទ្ធិពលលើល្បឿនប្រតិកម្ម`), covering all 5 kinetic factors: particle size / surface area, concentration, pressure for gases, temperature and effective collisions (ទង្គិចប្រសិទ្ធ), and catalysts (homogeneous, heterogeneous, enzymatic, and autocatalysis), plus all 15 applied exercises and problems with printed answer keys, followed by 15 student answer sheets.
- **Strict Blind Visual Audit**: Completed page-by-page visual audit across all 25 pages, correcting author name to `ហែម ការ៉ែ`, fixing critical ion charge $\mathrm{S_2O_8^{2-}}$ (corrected from $\mathrm{S_2O_8^{2+}}$), fixing redox couple $\mathrm{Fe^{3+}/Fe^{2+}}$ (corrected from $\mathrm{Fe^{3+}/Fe^{3+}}$), fixing OCR corruptions `ខ្សែកោង`, `កាតាលីករ`, `អេឡិចត្រូនិក`, `កំហាប់`, `ភាពស្ថេរភាព`, removing hallucinated subquestions, and verifying all equations and page boundaries.
- **KruAI RAG Grounding**: Added 2 keyworded chunks (`tb:chem:ch1:l2-kinetic-factors-theory`, `tb:chem:ch1:l2-catalysis-redox-mechanism-and-exercises`) to `CHEMISTRY_CH1_SECTIONS` and `ALL_CHEMISTRY_SECTIONS` in `server/textbook-search.ts`.
- **Study Path Structure**: Added Chapter 1 Lesson 2 with 5 authentic Khmer section titles under `SUBJECT_SESSIONS.chemistry[0]` in `src/features/lessons/sessions.ts`.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/សៀវភៅលំហាត់គីមីវិទ្យា_ម៉ៃ_ម៉ាល័យ"` (0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 11 Nov 2026: Math Summary Blind Audit Batch 4B: Chapter 4 Function Variation & Curves (Part 2, Pages 47 to 55)

Commit: `f0cecfe`. **No database step needed.**

Conducted strict blind audit pass on Chapter 4 (Function Variation & Curves, Part 2: PDF pages `p50.png` to `p58.png`, Book pages 47 to 55) in `sources/ocr/Math summary/chapter4-function-variation-curves.md`:
- **Line-by-Line Visual Audit & Fixes**:
  - Inserted page boundary markers `<!-- Page p50.png -->` through `<!-- Page p58.png -->`.
  - Restored full sign table and root evaluation in Exercise 5.
  - Corrected widespread term misspelling from `អាស៊ុយមតូត` to official textbook `អាស៊ីមតូត`.
  - Restored complete step-by-step limits, variation reasoning, and primitive derivations in Exercise 6.
  - Restored rigorous induction/bijection proofs, integration by parts derivations, and area calculations in Exercise 7.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math summary"` (9 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 11 Nov 2026: Math Summary Blind Audit Batch 4A: Chapter 4 Function Variation & Curves (Part 1, Pages 39 to 46)

Commit: `1ebee8c`. **No database step needed.**

Conducted strict blind audit pass on Chapter 4 (Function Variation & Curves, Part 1: PDF pages `p42.png` to `p49.png`, Book pages 39 to 46) in `sources/ocr/Math summary/chapter4-function-variation-curves.md`:
- **Line-by-Line Visual Audit & Fixes**:
  - Inserted page boundary markers `<!-- Page p42.png -->` through `<!-- Page p49.png -->`.
  - Corrected widespread term misspelling from `អាស៊ុយមតូត` to official textbook `អាស៊ីមតូត`.
  - Removed hallucinated formula `($y = \frac{a}{p}$)` on page 39 (`p42.png`).
  - Restored missing limit simplification steps, sign analysis, and curve-sketching data (tangent slopes, axis intercepts, relative positions).
  - Aligned page transitions across Problems 1, 2, 3, 4, and 5 statement on page 46 (`p49.png`).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math summary"` (9 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 11 Nov 2026: Chemistry Workbook Batch 1: Chapter 1 Lesson 1 (Reaction Rates) OCR, Study Path & KruAI Grounding

Commit: `50667ad`. **No database step needed.**

Digitized and audited Batch 1 of Grade 12 Chemistry Workbook (`sources/textbooks/សៀវភៅលំហាត់គីមីវិទ្យា_ម៉ៃ_ម៉ាល័យ.pdf`, Book pages 1 to 22, PDF pages `p009.png` to `p030.png`):
- **Textbook Rendering & OCR**: Rendered high-resolution scans (`p009.png` to `p030.png`) and transcribed word-for-word into `sources/ocr/សៀវភៅលំហាត់គីមីវិទ្យា_ម៉ៃ_ម៉ាល័យ/chapter1-lesson1-reaction-rates.md`:
  - Chapter 1 (`ជំពូកទី 1 ស៊ីនេទិចគីមី`), Lesson 1 (`មេរៀនទី 1 ល្បឿនប្រតិកម្មគីមី`), covering kinetics definition, reaction classifications (fast, slow, very slow), average rate of formation ($V_m(C) = \frac{\Delta [C]}{\Delta t}$), average rate of disappearance ($V_m(R) = -\frac{\Delta [R]}{\Delta t}$), instantaneous rate ($V_t = \frac{d[C]}{dt}$, tangent slope $\tan\alpha$), stoichiometry relations ($\frac{V(A)}{a} = \frac{V(B)}{b} = \frac{V(C)}{c} = \frac{V(D)}{d}$), dismutation reactions ($\mathrm{2H_2O_2}$, $\mathrm{Cl_2 + 2OH^-}$, $\mathrm{S_2O_3^{2-} + 2H^+}$), and all 28 exercises and problems with printed answer keys, followed by 15 student answer sheets.
- **Strict Blind Visual Audit**: Completed page-by-page visual audit across all 22 pages, correcting author name to `ហែម ការ៉ែន`, fixing Khmer subscript misread `ឌីស្វូតកម្ម` to `ឌីស្មូតកម្ម` across 12 occurrences, correcting `ខ្សែពោង` to `ខ្សែកោង` across 8 instances, correcting `អាស៊ីតក្លរួអ៊ីឌ្រិច` to `អាស៊ីតក្លរីឌ្រិច`, and verifying all page boundaries and equations.
- **KruAI RAG Grounding**: Added 2 keyworded chunks (`tb:chem:ch1:l1-reaction-rate-definition-and-types`, `tb:chem:ch1:l1-stoichiometry-dismutation-and-problems`) to `CHEMISTRY_CH1_SECTIONS` and `ALL_CHEMISTRY_SECTIONS`, and wired `searchChemistryTextbook` and query detector in `server/chat-handler.ts`.
- **Study Path Structure**: Added `chemistry` to `PATH_TAB` and authored Chapter 1 Lesson 1 with 5 authentic Khmer section titles under `SUBJECT_SESSIONS.chemistry` in `src/features/lessons/sessions.ts`.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/សៀវភៅលំហាត់គីមីវិទ្យា_ម៉ៃ_ម៉ាល័យ"` (0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 11 Nov 2026: Math Summary Blind Audit Batch 3: Chapter 3 Definite Integrals (Pages 31 to 38)

Commit: `26bd271`. **No database step needed.**

Conducted strict blind audit pass on Chapter 3 (Definite Integrals: PDF pages `p34.png` to `p41.png`, Book pages 31 to 38) in `sources/ocr/Math summary/chapter3-definite-integrals.md`:
- **Line-by-Line Visual Audit & Fixes**:
  - Inserted page boundary markers `<!-- Page p34.png -->` through `<!-- Page p41.png -->`.
  - Removed artificial English labels and non-textbook headings in theory section.
  - Restored dropped sentence in property 3 and exact Khmer phrasing across properties.
  - Aligned page boundaries across Exercises 1 through 10.
  - Restored dropped intermediate steps in Exercise 9 and full parameter conditions in Exercise 6.
  - Purged inline Khmer text from LaTeX delimiters and replaced stacked LaTeX with standard one-sided limits.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math summary"` (9 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 11 Nov 2026: Biology Tho Phon Q&A: Chapter 8 Lesson 1 (Energy Flow in Ecosystems) OCR, Study Path & KruAI Grounding

Commit: `PENDING_COMMIT`. **No database step needed.**

Digitized and strictly audited Chapter 8, Lesson 1 ("រំហូរថាមពលក្នុងស្ថានប្រព័ន្ធ" / Energy Flow in Ecosystems) of the Grade 12 Biology Q&A textbook compilation by Tho Phon (Book pp. 187-188, PDF pp. 188-189).
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ជីវវិទ្យា - ធូ ភន biology qna/` (p188.png to p189.png) and transcribed into `sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna/chapter8-lesson1-energy-flow.md`.
- **Strict Blind Audit**: Audited line-by-line with Subagent 2 ("Strict Blind Auditor") against original scans. Corrected 6 key transcription nuances: restored missing food chain & food web diagrams (ខ្សែអាហារ និងបណ្ដាញអាហារ), autotroph orthography (សារពាង្គកាយស្វ័យជីព), hydrogen sulfide chemical formula (អ៊ីដ្រូសែនស៊ុលភ្វីត), rat subscript (កណ្ដុរ), food web subscript (បណ្ដាញអាហារ), and storage subscript (ត្រូវស្ដុកទុក). Verified 90% utilization and 10% storage law.
- **RAG Grounding & Study Path**: Created `BIOLOGY_CH8_SECTIONS` and included in `ALL_BIOLOGY_SECTIONS` in `server/textbook-search.ts` with chunk `tb:bio:ch8:energy-flow-food-chains-pyramid-tho-phon-qna`. Registered authentic curriculum section titles in `src/features/lessons/sessions.ts`.
- **Verification**: Verified with `node scripts/ocr-check.mjs` (18 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).

## 11 Nov 2026: Biology Tho Phon Q&A: Chapter 7 Lesson 2 (Interactions Among Living Things) OCR, Study Path & KruAI Grounding (Chapter 7 100% Complete)

Commit: `c007da0`. **No database step needed.**

Digitized and strictly audited Chapter 7, Lesson 2 ("អន្តរអំពើក្នុងចំណោមភាវៈរស់" / Interactions Among Living Things) of the Grade 12 Biology Q&A textbook compilation by Tho Phon (Book pp. 185-186, PDF pp. 186-187), completing Chapter 7 in its entirety.
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ជីវវិទ្យា - ធូ ភន biology qna/` (p186.png to p187.png) and transcribed into `sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna/chapter7-lesson2-interactions.md`.
- **Strict Blind Audit**: Audited line-by-line with Subagent 2 ("Strict Blind Auditor") against original scans. Corrected 6 key transcription nuances: grasshopper subscript (កណ្ដូប), avoiding spelling (ជៀសផុត), competition subscript (ដណ្ដើម), Paramecium aurelia and P. caudatum transliterations (ប៉ារ៉ាមេស៊ីអូរ៉េឡ្យា, ប៉ារ៉ាមេស៊ីកូដាទុម), competing for prey (ដណ្ដើមរំពា), and symbiosis terminology (ភាពប្រជួយ mutualism, ភាពបន្សំ commensalism, ដើមបញ្ញើក្អែក mistletoe parasitism). Verified zero line cutoffs.
- **RAG Grounding & Study Path**: Grounded chunk `tb:bio:ch7:interactions-competition-predation-symbiosis-tho-phon-qna` in `BIOLOGY_CH7_SECTIONS` in `server/textbook-search.ts`. Registered authentic curriculum section titles in `src/features/lessons/sessions.ts`.
- **Verification**: Verified with `node scripts/ocr-check.mjs` (17 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).

## 11 Nov 2026: Biology Tho Phon Q&A: Chapter 7 Lesson 1 (Populations) OCR, Study Path & KruAI Grounding

Commit: `6f76503`. **No database step needed.**

Digitized and strictly audited Chapter 7, Lesson 1 ("ពពួក" / Populations) of the Grade 12 Biology Q&A textbook compilation by Tho Phon (Book pp. 182-184, PDF pp. 183-185).
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ជីវវិទ្យា - ធូ ភន biology qna/` (p183.png to p185.png) and transcribed into `sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna/chapter7-lesson1-populations.md`.
- **Strict Blind Audit**: Audited line-by-line with Subagent 2 ("Strict Blind Auditor") against original scans. Corrected 5 key transcription nuances: crab orthography (ក្ដាម), nest spelling (សំបុក), turtle orthography (អណ្ដើក), mark/recapture wording (ដែលបានទុក), and a major semantic OCR error in jar experiment (កែវពីរទំហំប៉ុនគ្នា កែវមួយដាក់ត្រី 10 ក្បាល ឯកែវមួយទៀតដាក់ 100 ក្បាល). Verified calculation steps and zero line cutoffs.
- **RAG Grounding & Study Path**: Created `BIOLOGY_CH7_SECTIONS` and included in `ALL_BIOLOGY_SECTIONS` in `server/textbook-search.ts` with chunk `tb:bio:ch7:populations-sampling-density-tho-phon-qna`. Registered authentic curriculum section titles in `src/features/lessons/sessions.ts`.
- **Verification**: Verified with `node scripts/ocr-check.mjs` (16 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).

## 11 Nov 2026: Biology Tho Phon Q&A: Chapter 6 Lesson 3 (Fossil Record & Q&A) OCR & KruAI Grounding (Chapter 6 100% Complete)

Commit: `3bb71fe`. **No database step needed.**

Digitized and strictly audited Chapter 6, Lesson 3 ("កំណត់ត្រាផូស៊ីល" / Fossil Record, Geological Time & Chapter 6 Q&A) of the Grade 12 Biology Q&A textbook compilation by Tho Phon (Book pp. 176-181, PDF pp. 177-182), completing Chapter 6 in its entirety.
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ជីវវិទ្យា - ធូ ភន biology qna/` (p177.png to p182.png) and transcribed into `sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna/chapter6-lesson3-fossil-record.md` containing the complete theory and all 19 authentic Bac II Q&A questions.
- **Strict Blind Audit**: Audited line-by-line with Subagent 2 ("Strict Blind Auditor") against original scans. Corrected 8 key transcription nuances: petrification process (ដំណើរក្លាយជាថ្ម, ប្លែងទៅជាថ្ម), amber preservation spelling (ជ័រុក្ខជាតិ), relative layer dating age (មានអាយុតិចជាងគេ), Paleozoic/Mesozoic eras and Jurassic period (ស័កប៉ាឡេអូសូអ៊ិច, ស័កមេសូសូអ៊ិច, សម័យស៊ួរ៉ាសុិច, លូនទី 1), question prompts (ចូរពន្យល់ថា, ភស្តុតាងអ្វីខ្លះ), gene mutation spelling (មុយតាស៊ីយុងសែន), and pharyngeal slits (រង្វះស្រកី). Verified exact first 4 and last 4 words on every page with zero lines cut off.
- **RAG Grounding**: Grounded chunk `tb:bio:ch6:fossil-records-geologic-dating-tho-phon-qna` in `BIOLOGY_CH6_SECTIONS` in `server/textbook-search.ts` covering petrification, external molds and internal casts, amber/ice preservation, relative layer dating, radioactive carbon-14 dating (half-life 5730 years), and geological eras.
- **Verification**: Verified with `node scripts/ocr-check.mjs` (15 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).

## 11 Nov 2026: Biology Tho Phon Q&A: Chapter 6 Lesson 2 (Evidence of Evolution) OCR & KruAI Grounding

Commit: `5e05f42`. **No database step needed.**

Digitized and strictly audited Chapter 6, Lesson 2 ("ភស្តុតាងនៃការវិវត្ត" / Evidence of Evolution & Speciation) of the Grade 12 Biology Q&A textbook compilation by Tho Phon (Book pp. 173-175, PDF pp. 174-176).
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ជីវវិទ្យា - ធូ ភន biology qna/` (p174.png to p176.png) and transcribed into `sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna/chapter6-lesson2-evolution-evidence.md`.
- **Strict Blind Audit**: Audited line-by-line with Subagent 2 ("Strict Blind Auditor") against original scans. Corrected 6 key transcription nuances: vertebrate embryonic single circulation (របត់ឈាមទោល។ល។), zygote orthography (ស៊ីកូត), anatomical spelling (អវៈយវៈ), protein creation wording (បង្កើតឡើងពីប្រូតេអ៊ីន), exact amino acid terminology (5 instances of អាស៊ីតអាមីនេ), and mate attraction phrasing (សត្វញីឈ្មោល). Verified zero lines cut off across all 3 pages.
- **RAG Grounding**: Grounded chunk `tb:bio:ch6:evolution-evidence-speciation-tho-phon-qna` in `BIOLOGY_CH6_SECTIONS` in `server/textbook-search.ts` covering fossil evidence, 5-class comparative embryology, homologous organs (bird wing, dolphin flipper, human hand), molecular biochemical homology (amino acid sequences in insulin positions 8, 9, 10), and geographic vs reproductive speciation barriers.
- **Verification**: Verified with `node scripts/ocr-check.mjs` (14 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).

## 11 Nov 2026: Biology Tho Phon Q&A: Chapter 6 Lesson 1 (Darwin's Theory) OCR & KruAI Grounding

Commit: `735720a`. **No database step needed.**

Digitized and strictly audited Chapter 6, Lesson 1 ("ទ្រឹស្តីរបស់លោកដាវិន" / Darwin's Theory of Evolution) of the Grade 12 Biology Q&A textbook compilation by Tho Phon (Book pp. 171-172, PDF pp. 172-173).
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ជីវវិទ្យា - ធូ ភន biology qna/` (p172.png to p173.png) and transcribed into `sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna/chapter6-lesson1-darwin-theory.md`.
- **Strict Blind Audit**: Audited line-by-line with Subagent 2 ("Strict Blind Auditor") against original scans. Corrected 7 key transcription errors including beak functional morphology (ចំពុះវែងតូចឆ្មារជញ្ជក់អាហារ, ចំពុះកោងខុបស្រួចស៊ីរំពារ, ចំពុះសំប៉ែតកញ្ច្រោកយកអាហារក្នុងភក់), variation terminology (បម្រែបម្រួលជាកំណែប្រែ), and accumulation mechanics (គរផ្ដុំទុកពូជ). Verified zero lines cut off at page edges.
- **RAG Grounding**: Grounded chunk `tb:bio:ch6:darwin-theory-tho-phon-qna` in `BIOLOGY_CH6_SECTIONS` in `server/textbook-search.ts` covering Darwin's Galapagos observations, marine iguana and tortoise adaptations, 4 beak morphs, artificial selection, and the 4 natural selection pillars.
- **Verification**: Verified with `node scripts/ocr-check.mjs` (13 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 11 Nov 2026: Math Summary Blind Audit Batch 2B: Chapter 2 Derivatives & Primitives (Part 2, Pages 25 to 30)

Commit: `735720a`. **No database step needed.**

Conducted strict blind audit pass on Chapter 2 (Derivatives & Primitives, Part 2: PDF pages `p28.png` to `p33.png`, Book pages 25 to 30) in `sources/ocr/Math summary/chapter2-derivatives-primitives.md`:
- **Line-by-Line Visual Audit & Fixes**:
  - Inserted page boundary markers `<!-- Page p28.png -->` through `<!-- Page p33.png -->`.
  - Restored full induction proof of $g^{(n)}(x) = \cos(x + n\frac{\pi}{2})$ for Exercise 9(ខ) on page 28 (`p31.png`).
  - Restored missing domain branches and sign analysis in Exercise 12(គ) on page 30 (`p33.png`).
  - Restored dropped intermediate derivative expansion lines and auxiliary function derivations across Exercises 6, 7, 8, and 11.
  - Aligned problem statements and solution blocks with authentic textbook layout.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math summary"` (9 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 11 Nov 2026: Math Summary Blind Audit Batch 2A: Chapter 2 Derivatives & Primitives (Part 1, Pages 19 to 24)

Commit: `9fa85e9`. **No database step needed.**

Conducted strict blind audit pass on Chapter 2 (Derivatives & Primitives, Part 1: PDF pages `p22.png` to `p27.png`, Book pages 19 to 24) in `sources/ocr/Math summary/chapter2-derivatives-primitives.md`:
- **Line-by-Line Visual Audit & Fixes**:
  - Inserted page boundary markers `<!-- Page p22.png -->` through `<!-- Page p27.png -->`.
  - Corrected domain intervals for $\sqrt{x}$ and $\ln x$, matching authentic textbook typography.
  - Corrected composite derivative product notation from `\cdot` to `\times`.
  - Restored missing student advisory note from page 22 (`p25.png`).
  - Restored missing intermediate substitutions and steps across Exercises 1, 2, 3, 4, and 5.
  - Aligned page splits between pages 22/23, 23/24, and sealed boundary before Exercise 6 on page 25 (`p28.png`).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math summary"` (9 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Math Summary Blind Audit Batch 1B: Chapter 1 Limits (Part 2, Pages 11 to 18)

Commit: `32dc3fe`. **No database step needed.**

Conducted strict blind audit pass on Chapter 1 (Limits, Part 2: PDF pages `p14.png` to `p21.png`, Book pages 11 to 18) in `sources/ocr/Math summary/chapter1-limits.md`:
- **Line-by-Line Visual Audit & Fixes**:
  - Inserted page boundary markers `<!-- Page p14.png -->` through `<!-- Page p21.png -->`.
  - Restored missing question statement for Exercise 9.ឃ on page 11 (`p14.png`).
  - Corrected boundary between page 11 and page 12 in Exercise 10, fixing solution heading to authentic `**ចម្លើយ:**`.
  - Corrected OCR misread in Exercise 12.ក and 12.ខ on page 13 (`p16.png`) from `ទាញរក` to authentic textbook `ទាញយក`.
  - Replaced non-original `\iff` arrows with textbook line-by-line inequality reasoning and Khmer conjunction `ឬ` on page 13 (`p16.png`).
  - Restored original textbook algebraic form and annotated scan print typo in Exercise 14.d on page 15 (`p18.png`).
  - Removed synthetic arithmetic calculations and restored exact authentic MoEYS problem statements and steps across Exercises 15, 16, 17, 18, and 19.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math summary"` (9 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Physics Summary Batch 8 (Final Batch): Chapter 3 Lesson 4 (AC Circuits) OCR, Study Path & KruAI Grounding

Commit: `d372012`. **No database step needed.**

Completed Batch 8 (the final batch, reaching 100% completion!) of the official MoEYS Grade 12 Physics Summary & Worked Examples textbook (`sources/textbooks/Physics summary.pdf`, PDF pages 50 to 58, book pages 46 to 54):
- **Textbook Rendering & OCR**: Rendered high-resolution PNG scans (`p50.png` to `p58.png` in `sources/pages/Physics summary/`) and transcribed word-for-word into `sources/ocr/Physics summary/chapter3-lesson4-ac-circuits.md`:
  - Chapter 3 (`ជំពូក 3 អគ្គិសនី និងម៉ាញេទិច`), Lesson 4 (`មេរៀនទី 4៖ សៀគ្វីចរន្តឆ្លាស់`), covering sinusoidal alternating current and voltage ($i(t) = I_m\sin(\omega t + \varphi)$, $V(t) = V_m\sin\omega t$), effective/RMS current and voltage ($I = \frac{I_m}{\sqrt{2}}$, $V = \frac{V_m}{\sqrt{2}}$), impedances and Fresnel phasor relationships for pure inductor ($Z_L = L\omega$, real coil $Z_L = \sqrt{R_L^2 + (L\omega)^2}$), pure resistor ($Z_R = R$), pure capacitor ($Z_C = \frac{1}{C\omega}$), series $(RC)$ circuit ($Z = \sqrt{R^2 + (\frac{1}{C\omega})^2}$, $\tan\varphi = \frac{1}{RC\omega}$), series $(RL)$ circuit ($Z = \sqrt{R^2 + (L\omega)^2}$, $\tan\varphi = \frac{L\omega}{R}$), series $(RLC)$ circuit ($Z = \sqrt{R^2 + (L\omega - \frac{1}{C\omega})^2}$, $\tan\varphi = \frac{L\omega - \frac{1}{C\omega}}{R}$, $\cos\varphi = \frac{R}{Z}$), electrical resonance ($Z_L = Z_C \Leftrightarrow LC\omega^2 = 1$, $Z = R$, $\varphi = 0$, $f_0 = \frac{1}{2\pi\sqrt{LC}}$), average power and power factor ($P = \frac{W}{t} = VI\cos\varphi$), transformers ($\frac{V_2}{V_1} = \frac{n_2}{n_1} = \frac{I_1}{I_2} = K$, step-up `សួកវ៉ុលទ័រ` $K > 1$, step-down `ស៊ូវ៉ុលទ័រ` $K < 1$, efficiency $Rd = \frac{Pe_2}{Pe_1}$, power balance $Pe_1 = Pe_2 + P_J$), and all 9 worked examples (`ឧទាហរណ៍ 1` to `ឧទាហរណ៍ 9`) with complete step-by-step solutions.
- **KruAI RAG Grounding**: Added 4 chunks (`tb:phys:ch3:l4-ac-rms-and-rlc-branch-impedances`, `tb:phys:ch3:l4-rlc-series-resonance-power-and-transformer`, `tb:phys:ch3:l4-examples-1-to-5`, `tb:phys:ch3:l4-examples-6-to-9`) to `PHYSICS_CH3_SECTIONS` in `server/textbook-search.ts`, completing 100% coverage of the Grade 12 Physics Summary Textbook across Chapters 1 to 3.
- **Study Path Structure**: Added Lesson 4 (`សៀគ្វីចរន្តឆ្លាស់`) with 5 authentic Khmer section titles under `SUBJECT_SESSIONS.physics[2]` (Chapter 3: `អគ្គិសនី និងម៉ាញេទិច`) in `src/features/lessons/sessions.ts`.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Physics summary"` (9 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals), `npx oxlint` (0 errors, 1 known warning), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Physics Summary Batch 7: Chapter 3 Lesson 3 (Self-Induction) OCR, Study Path & KruAI Grounding

Commit: `edac6d9`. **No database step needed.**

Digitized Batch 7 of the official MoEYS Grade 12 Physics Summary & Worked Examples textbook (`sources/textbooks/Physics summary.pdf`, PDF pages 43 to 49, book pages 39 to 45):
- **Textbook Rendering & OCR**: Rendered high-resolution PNG scans (`p43.png` to `p49.png` in `sources/pages/Physics summary/`) and transcribed word-for-word into `sources/ocr/Physics summary/chapter3-lesson3-self-induction.md`:
  - Chapter 3 (`ជំពូក 3 អគ្គិសនី និងម៉ាញេទិច`), Lesson 3 (`មេរៀនទី 3៖ អូតូអាំងឌុចស្យុង`), covering the phenomenon of self-induction (`បាតុភូតអូតូអាំងឌុចស្យុង`), self-induced current (`ចរន្តអូតូអាំងឌ្វី`), self-magnetic flux and inductance ($\Phi = Li$, measured in Henry $\text{H}$), self-induced EMF ($e = -L\frac{\Delta i}{\Delta t}$ and $e = -L\frac{di}{dt}$), inductance of an air-core solenoid ($L = \mu_0 \frac{N^2}{\ell} A = \mu_0 n^2 A\ell$, $A = \pi R^2 = \pi \frac{D^2}{4}$), terminal voltage of an inductor coil ($V_{AB} = ri + L\frac{di}{dt}$), $(R, L)$ circuit time constant ($\tau = \frac{L}{R}$) and current equations ($i(t) = I_p(1 - e^{-t/\tau})$ with $I_p = \frac{E}{R}$ on closing, $i(t) = I_p e^{-t/\tau}$ on opening), magnetic energy stored in an inductor ($E_L = \frac{1}{2}Li^2$), free undamped electrical oscillations in an ideal $(L, C)$ circuit ($\frac{d^2 V_c}{dt^2} + \frac{1}{LC} V_c = 0$, $V_c(t) = V_m\cos(\omega_0 t + \phi_0)$, $\omega_0 = \frac{2\pi}{T_0} = \frac{1}{\sqrt{LC}}$, $T_0 = 2\pi\sqrt{LC}$, $f_0 = \frac{1}{2\pi\sqrt{LC}}$, $q(t)$, $i(t)$, $i_m = q_m\frac{2\pi}{T_0} = CV_m\frac{2\pi}{T_0}$, total energy $E_{LC} = E_L + E_C = \frac{1}{2}Li^2 + \frac{1}{2}CV_c^2 = \frac{1}{2}CV_m^2 = \frac{1}{2}Li_m^2$), and all 8 worked examples (`ឧទាហរណ៍ 1` to `ឧទាហរណ៍ 8`) with complete step-by-step solutions.
- **KruAI RAG Grounding**: Added 4 chunks (`tb:phys:ch3:l3-self-induction-inductance-and-bobine`, `tb:phys:ch3:l3-rl-circuit-magnetic-energy-and-lc-oscillations`, `tb:phys:ch3:l3-examples-1-to-4`, `tb:phys:ch3:l3-examples-5-to-8`) to `PHYSICS_CH3_SECTIONS` in `server/textbook-search.ts`.
- **Study Path Structure**: Added Lesson 3 (`អូតូអាំងឌុចស្យុង`) with 5 authentic Khmer section titles under `SUBJECT_SESSIONS.physics[2]` (Chapter 3: `អគ្គិសនី និងម៉ាញេទិច`) in `src/features/lessons/sessions.ts`.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Physics summary"` (8 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals), `npx oxlint` (0 errors, 1 known warning), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Math Summary Blind Audit Batch 1A: Chapter 1 Limits (Part 1, Pages 3 to 10)

Commit: `ebec195`. **No database step needed.**

Conducted strict blind audit pass on Chapter 1 (Limits, Part 1: PDF pages `p06.png` to `p13.png`, Book pages 3 to 10) in `sources/ocr/Math summary/chapter1-limits.md`:
- **Line-by-Line Visual Audit & Fixes**:
  - Inserted page boundary markers `<!-- Page p06.png -->` through `<!-- Page p13.png -->`.
  - Restored missing bottom advisory note from page 4 (`p07.png`).
  - Restored composite function mapping diagram in standard KaTeX.
  - Corrected operation table row 4 signs from $\mp\infty$ to $\pm\infty$ on page 3 (`p06.png`).
  - Corrected parameter factorization in Exercise 7.គ on page 9 (`p12.png`).
  - Documented textbook print error in Exercise 8.គ on page 10 (`p13.png`).
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Math summary"` (9 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Physics Summary Batch 6: Chapter 3 Lesson 2 (Electromagnetic Induction) OCR, Study Path & KruAI Grounding

Commit: `d51431c`. **No database step needed.**

Digitized Batch 6 of the official MoEYS Grade 12 Physics Summary & Worked Examples textbook (`sources/textbooks/Physics summary.pdf`, PDF pages 37 to 42, book pages 33 to 38):
- **Textbook Rendering & OCR**: Rendered high-resolution PNG scans (`p37.png` to `p42.png` in `sources/pages/Physics summary/`) and transcribed word-for-word into `sources/ocr/Physics summary/chapter3-lesson2-electromagnetic-induction.md`:
  - Chapter 3 (`ជំពូក 3 អគ្គិសនី និងម៉ាញេទិច`), Lesson 2 (`មេរៀនទី 2៖ អាំងឌុចស្យុងអេឡិចត្រូម៉ាញេទិច`), covering induced current (`ចរន្តអាំងឌ្វី`), magnetic flux ($\Phi = BA\cos\theta$, measured in Weber $\text{Wb}$), Faraday's law of electromagnetic induction ($E = -N\frac{\Delta\Phi}{\Delta t} = -N\frac{\Phi_f - \Phi_i}{t_f - t_i}$ and $|E| = N\frac{|\Delta\Phi|}{\Delta t}$), Lenz's law (`ច្បាប់ឡិន`), motional EMF in a moving conductor ($|E| = vB\ell\sin\alpha$, perpendicular case $|E| = vB\ell$, induced current $I = \frac{|E|}{R} = \frac{vB\ell}{R}$), AC electric generator (`ជនិតាអគ្គិសនី`, $e(t) = NBA\omega\sin\omega t = E_m\sin\omega t$, peak EMF $E_m = NBA\omega$), electric motor (`ម៉ូទ័រ`), and all 9 worked examples (`ឧទាហរណ៍ 1` to `ឧទាហរណ៍ 9`) with complete step-by-step solutions.
- **KruAI RAG Grounding**: Added 4 chunks (`tb:phys:ch3:l2-magnetic-flux-faraday-lenz`, `tb:phys:ch3:l2-motional-emf-and-ac-generator`, `tb:phys:ch3:l2-examples-1-to-5`, `tb:phys:ch3:l2-examples-6-to-9`) to `PHYSICS_CH3_SECTIONS` in `server/textbook-search.ts`.
- **Study Path Structure**: Added Lesson 2 (`អាំងឌុចស្យុងអេឡិចត្រូម៉ាញេទិច`) with 5 authentic Khmer section titles under `SUBJECT_SESSIONS.physics[2]` (Chapter 3: `អគ្គិសនី និងម៉ាញេទិច`) in `src/features/lessons/sessions.ts`.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Physics summary"` (7 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals), `npx oxlint` (0 errors, 1 known warning), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Physics Summary Batch 5: Chapter 3 Lesson 1 (Magnetic Field & Force) OCR, Study Path & KruAI Grounding

Commit: `0361378`. **No database step needed.**

Digitized Batch 5 of the official MoEYS Grade 12 Physics Summary & Worked Examples textbook (`sources/textbooks/Physics summary.pdf`, PDF pages 28 to 36, book pages 24 to 32):
- **Textbook Rendering & OCR**: Rendered high-resolution PNG scans (`p28.png` to `p36.png` in `sources/pages/Physics summary/`) and transcribed word-for-word into `sources/ocr/Physics summary/chapter3-lesson1-magnetic-field-and-force.md`:
  - Chapter 3 (`ជំពូក 3 អគ្គិសនី និងម៉ាញេទិច`), Lesson 1 (`មេរៀនទី 1៖ ដែននិងកម្លាំងម៉ាញេទិច`), covering natural and artificial magnets, magnetic field of a straight wire ($B = \mu_o\frac{I}{2\pi d}$ and $B = \mu_o\mu_r\frac{I}{2\pi d}$), circular loop ($B = \mu_o\frac{I}{2R}$ and $B = \mu_o\frac{NI}{2R}$), solenoid ($B = \mu_o nI = \mu_o\frac{N}{\ell}I$, turn count $N = \frac{\ell}{d}$, $N = \frac{\ell}{d + 2e}$, $N = \frac{\ell \cdot x}{d + 2e}$, wire length $\ell' = 2\pi RN$), electromagnetic force on a current-carrying wire ($\vec{F} = I\vec{\ell} \times \vec{B}$, $F = I\ell B\sin\theta$, right-hand rule), force between two parallel straight wires ($F_{12} = F_{21} = \frac{\mu_o I_1 I_2 \ell}{2\pi a}$), Lorentz magnetic force on a moving charge ($\vec{F}_m = q(\vec{v} \times \vec{B})$, $F_m = |q|vB\sin\alpha$), uniform circular motion in a magnetic field ($R = \frac{mv}{|q|B}$, period $T = \frac{2\pi m}{|q|B}$, frequency $N = \frac{|q|B}{2\pi m}$), magnetic deflection ($\alpha = \frac{\ell |q|B}{mv_o}$, $Z = D\tan\alpha = \frac{D\ell |q|B}{mv_o}$), mass spectrograph ($\frac{|q|}{m} = \frac{2V}{B^2 R^2}$), and all 11 worked examples (`ឧទាហរណ៍ 1` to `ឧទាហរណ៍ 11`) with complete step-by-step solutions.
- **KruAI RAG Grounding**: Added `PHYSICS_CH3_SECTIONS` (`tb:phys:ch3:l1-magnetic-field`, `tb:phys:ch3:l1-electromagnetic-force-and-parallel-wires`, `tb:phys:ch3:l1-lorentz-force-and-charged-particle-motion`, `tb:phys:ch3:l1-examples-1-to-5`, `tb:phys:ch3:l1-examples-6-to-11`) and spread into `ALL_PHYSICS_SECTIONS` in `server/textbook-search.ts`.
- **Study Path Structure**: Added Chapter 3 (`អគ្គិសនី និងម៉ាញេទិច`) and Lesson 1 (`ដែននិងកម្លាំងម៉ាញេទិច`) with 5 authentic Khmer section titles under `SUBJECT_SESSIONS.physics` in `src/features/lessons/sessions.ts`.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Physics summary"` (6 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals), `npx oxlint` (0 errors, 1 known warning), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Physics Summary Batch 4: Chapter 1 Lesson 3 (Part 2) & Chapter 2 Lesson 1 (Superposition of Waves & Standing Waves) OCR, Study Path & KruAI Grounding

Commit: `8bf8996`. **No database step needed.**

Digitized Batch 4 of the official MoEYS Grade 12 Physics Summary & Worked Examples textbook (`sources/textbooks/Physics summary.pdf`, PDF pages 23 to 27, book pages 19 to 23):
- **Textbook Rendering & OCR**: Rendered high-resolution PNG scans (`p23.png` to `p27.png` in `sources/pages/Physics summary/`) and transcribed word-for-word into `sources/ocr/Physics summary/`:
  1. Completed `chapter1-lesson3-heat-engines.md` (book page 19): Appended the final heat rejection calculation for Example 8 ($Q_c = 12660(1 - 0.1125) = 11235\text{ J} = 11\text{ kJ}$, noting the textbook's unit typo for calories/kilocalories) and updated the lesson header page range to `ទំព័រ 13 – 19 (PDF ទំព័រ 17 – 23)`.
  2. Created `chapter2-waves.md` (book pages 19 to 23): Chapter 2 (`ជំពូក 2 រលក`), Lesson 1 (`មេរៀនទី 1៖ គោលការណ៍តម្រួតនៃរលក និងរលកជញ្ជ្រុំ`), covering the wave superposition principle (`គោលការណ៍តម្រួតនៃរលក`), Fresnel vector construction (`សំណង់ប្រេណែល`, $y = a\sin(\omega t + \phi)$), special phase cases ($\Delta\phi = 0, \pi, \frac{\pi}{2}$), superposition of 2 and $n$ sinusoidal oscillations ($a = \sqrt{a_1^2 + a_2^2 + 2a_1a_2\cos(\phi_2 - \phi_1)}$, $a = \sqrt{a_x^2 + a_y^2}$, $\tan\phi_o = \frac{|a_y|}{|a_x|}$ with quadrant rules I to IV), standing waves (`រលកជញ្ជ្រុំ`, $y = (2A\sin kx)\cos\omega t$), antinode positions (`ទីតាំងពោះ`, $x = n\frac{\lambda}{4}$ for $n = 1, 3, 5, 7\dots$), node positions (`ទីតាំងថ្នាំង`, $x = n\frac{\lambda}{2}$ for $n = 0, 1, 2, 3, 4\dots$), and worked Examples 1 to 4 with complete solutions.
- **KruAI RAG Grounding**: Updated `tb:phys:ch1:l3-examples-5-to-8` and added `PHYSICS_CH2_SECTIONS` (`tb:phys:ch2:l1-superposition-and-fresnel`, `tb:phys:ch2:l1-standing-waves`, `tb:phys:ch2:l1-examples-1-to-4`) into `ALL_PHYSICS_SECTIONS` in `server/textbook-search.ts`.
- **Study Path Structure**: Added Chapter 2 (`រលក`) and Lesson 1 (`គោលការណ៍តម្រួតនៃរលក និងរលកជញ្ជ្រុំ`) with 5 authentic Khmer section titles under `SUBJECT_SESSIONS.physics` in `src/features/lessons/sessions.ts`.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Physics summary"` (5 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals), `npx oxlint` (0 errors, 1 known warning), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Physics Summary Batch 3: Chapter 1 Lesson 2 (Part 2) & Lesson 3 (Heat Engines, Part 1) OCR, Study Path & KruAI Grounding

Commit: `b7761b1`. **No database step needed.**

Digitized Batch 3 of the official MoEYS Grade 12 Physics Summary & Worked Examples textbook (`sources/textbooks/Physics summary.pdf`, PDF pages 16 to 22, book pages 12 to 18):
- **Textbook Rendering & OCR**: Rendered high-resolution PNG scans (`p16.png` to `p22.png` in `sources/pages/Physics summary/`) and transcribed word-for-word into `sources/ocr/Physics summary/`:
  1. Completed `chapter1-lesson2-first-law-of-thermodynamics.md` (book page 12): Full step-by-step solution for Example 8 (adiabatic expansion work $W = 5.0\text{ J} \Rightarrow \Delta U = -5.0\text{ J}$ and adiabatic compression work $W = -80\text{ J} \Rightarrow \Delta U = 80\text{ J}$).
  2. Created `chapter1-lesson3-heat-engines.md` (book pages 13 to 18): Chapter 1, Lesson 3 (`មេរៀនទី 3៖ ម៉ាស៊ីន`), covering heat engines (`ម៉ាស៊ីនកម្ដៅ`), energy balance ($Q_h = Q_c + W$), thermal efficiency ($e = \frac{W}{Q_h} = 1 - \frac{Q_c}{Q_h}$), Carnot cycle (`ស៊ីចកាកណូ`) and Carnot's theorem ($e = 1 - \frac{T_c}{T_h}$, $\frac{Q_c}{Q_h} = \frac{T_c}{T_h}$), gasoline and diesel four-stroke engines (`ម៉ាស៊ីនសាំង និងម៉ាស៊ូត`, `ម៉ូទ័របន្ទុះបួនវគ្គ`), combustion chamber and transmission efficiencies ($e_c = \frac{W_M}{Q_h}$, $e_M = \frac{W_U}{W_M}$, $e = e_M \times e_c$), and worked Examples 1 to 8 (complete solutions for Examples 1 to 7 and the first part of Example 8).
- **KruAI RAG Grounding**: Updated `tb:phys:ch1:l2-examples-4-to-8` and added 4 new chunks (`tb:phys:ch1:l3-carnot-and-heat-engines`, `tb:phys:ch1:l3-gasoline-and-diesel-engines`, `tb:phys:ch1:l3-examples-1-to-4`, `tb:phys:ch1:l3-examples-5-to-8`) to `PHYSICS_CH1_SECTIONS` in `server/textbook-search.ts`.
- **Study Path Structure**: Registered Lesson 3 (`ម៉ាស៊ីន`) under Physics Chapter 1 (`ទែម៉ូឌីណាមិច`) in `src/features/lessons/sessions.ts` with 5 authentic Khmer section titles.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Physics summary"` (4 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals), `npx oxlint` (0 errors, 1 known warning), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Physics Summary Batch 2: Chapter 1 Lesson 2 (First Law of Thermodynamics, Part 1) OCR, Study Path & KruAI Grounding

Commit: `3bb6ba1`. **No database step needed.**

Digitized Batch 2 of the official MoEYS Grade 12 Physics Summary & Worked Examples textbook (`sources/textbooks/Physics summary.pdf`, PDF pages 9 to 15, book pages 5 to 11):
- **Textbook Rendering & OCR**: Rendered high-resolution PNG scans (`p09.png` to `p15.png` in `sources/pages/Physics summary/`) and transcribed word-for-word into `sources/ocr/Physics summary/chapter1-lesson2-first-law-of-thermodynamics.md`:
  1. Lesson summary (book pages 5 to 8): Thermodynamic systems, open and closed processes (បំលែងចំហ និងបំលែងបិទ), isochoric (អ៊ីសូករ), isobaric (អ៊ីសូបារ), isothermal (អ៊ីសូទែម), adiabatic (អាដ្យាបាទិច), and linearly varying pressure processes; thermodynamic work ($W = 0$, $W = P(V_f - V_i)$, $W = \frac{1}{2}(P_f + P_i)(V_f - V_i)$, $W = nRT \ln\frac{V_f}{V_i}$) and $P\text{-}V$ diagrams; the First Law of Thermodynamics ($Q = \Delta U + W$), sign conventions for $Q$, $W$, and $\Delta U$, special cases for the 3 processes, and internal energy of a monatomic ideal gas ($U = \frac{3}{2}nRT$, $\Delta U = \frac{3}{2}nR\Delta T$).
  2. Worked examples (book pages 8 to 11): Complete step-by-step solutions for Examples 1 to 7 and the problem statement of Example 8 (isobaric work from $P\text{-}V$ area, cyclic work $W_{ABCA}$ and $W_{ABCD}$, heat and work conversions with calories and joules, isothermal expansion and compression of $\text{O}_2$, and internal energy changes).
- **KruAI RAG Grounding**: Added 4 comprehensive chunks (`tb:phys:ch1:l2-processes-and-work`, `tb:phys:ch1:l2-first-law-and-internal-energy`, `tb:phys:ch1:l2-examples-1-to-3`, `tb:phys:ch1:l2-examples-4-to-8`) to `PHYSICS_CH1_SECTIONS` in `server/textbook-search.ts`.
- **Study Path Structure**: Registered Lesson 2 (`ច្បាប់ទីមួយទែម៉ូឌីណាមិច`) under Physics Chapter 1 (`ទែម៉ូឌីណាមិច`) in `src/features/lessons/sessions.ts` with 6 authentic Khmer section titles.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Physics summary"` (3 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals), `npx oxlint` (0 errors, 1 known warning), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Biology Tho Phon Q&A: Chapter 5 Lesson 3 (Biotechnology) OCR & KruAI Grounding (Chapter 5 100% Complete)

Commit: `9b47b67`. **No database step needed.**

Digitized Chapter 5, Lesson 3 ("បច្ចេកវិទ្យាជីវៈ" / Biotechnology) of the Grade 12 Biology Q&A textbook compilation by Tho Phon (Book pp. 163-170, PDF pp. 164-171), completing Chapter 5 in its entirety.
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ជីវវិទ្យា - ធូ ភន biology qna/` (p164.png to p171.png) and transcribed into `sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna/chapter5-lesson3-biotechnology.md` containing the complete lesson summary and all 8 authentic Bac II Q&A questions:
  1. Selective breeding (ការបង្កាត់ជ្រើស): natural vs artificial selection; hybridization (អ៊ីប្រ៊ីតកម្ម) and hybrid vigor / heterosis (អេតេរ៉ូស៊ីស); inbreeding (ការបង្កាត់ជិត) to establish pure breeds vs outbreeding (ការបង្កាត់ឆ្ងាយ, e.g. horse and donkey producing mule).
  2. Plant and animal cloning (ក្លូន): definition (cell lineage originating from a single progenitor cell with identical genetic constitution); plant micropropagation via tissue culture (មីក្រូកាល់); animal cloning through somatic cell nuclear transfer into enucleated oocytes.
  3. Polyploidy (ប៉ូលីប្លូអ៊ីឌី): definition (chromosome sets multiplying as exact multiples of n: 3n, 4n, 5n), agricultural characteristics (hypertrophied vegetative organs, seedless triploid watermelons, increased stress resistance).
  4. Genetic engineering (វិស្វកម្មសេនេទិច): 4 precise recombinant DNA steps (restriction enzyme cleavage at specific palindromic sequences, insertion and ligation into bacterial plasmids via DNA ligase, host transformation into bacterial cells for cloning, and phenotypic expression of target proteins like insulin).
  5. Applications: healthcare and medicine (human insulin, somatotropin growth hormone, antiviral and anticancer interferon, lymphocyte-stimulating interleukin, vaccines, antibiotics), agriculture and food security (transgenic pest/drought resistant crops).
  6. Bioethics and biosafety: environmental risks (genetic drift, biodiversity loss), human health concerns (antibiotic-resistant bacterial strains), socioeconomic disparities (corporate monopoly over GMO seeds, genetic divide).
- **RAG Grounding**: Grounded comprehensive chunk `tb:bio:ch5:biotechnology-genetic-engineering-tho-phon-qna` in `BIOLOGY_CH5_SECTIONS` in `server/textbook-search.ts`, and updated query matching in `server/chat-handler.ts`.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna"` (12 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Physics Summary Batch 1: Front Matter & Chapter 1 Lesson 1 (Kinetic Theory of Gases) OCR, Study Path & KruAI Grounding

Commit: `ad23135`. **No database step needed.**

Digitized Batch 1 of the official MoEYS Grade 12 Physics Summary & Worked Examples textbook (`sources/textbooks/Physics summary.pdf`, PDF pages 1 to 8, book pages i to iii and 1 to 4):
- **Textbook Rendering & OCR**: Verified rendered PNG scans (`p01.png` to `p08.png` in `sources/pages/Physics summary/`) and transcribed word-for-word into two Markdown files in `sources/ocr/Physics summary/`:
  1. `front-matter.md` (PDF pages 1 to 4, book pages i to iii): Cover page (2014-2015), Preface (អារម្ភកថា) with authors and editors, Table of Contents (មាតិកា), and Lesson Difficulty Table (កម្រិតពិបាកនៃមេរៀន).
  2. `chapter1-lesson1-kinetic-theory-of-gases.md` (PDF pages 5 to 8, book pages 1 to 4): Chapter 1 (ទែម៉ូឌីណាមិច), Lesson 1 (ទ្រឹស្ដីស៊ីនេទិចនៃឧស្ម័ន / Kinetic Theory of Gases), covering absolute temperature conversion ($T = t + 273.15$), kinetic theory postulates, gas pressure ($P = \frac{2}{3}(\frac{N}{V})K_{\text{av}}$), the ideal gas equation of state ($PV = Nk_B T = nRT$), Avogadro's number ($N_A = 6.022 \times 10^{23}\text{ ម៉ូលេគុល/mol}$), Boltzmann constant ($k_B = 1.38 \times 10^{-23}\text{ J/K}$), average and total kinetic energy ($K_{\text{av}} = \frac{3}{2}k_B T$, $K = \frac{3}{2}nRT$), root-mean-square speed ($v_{\text{rms}} = \sqrt{\frac{3k_B T}{m}} = \sqrt{\frac{3RT}{M}}$), and all 7 worked examples (ឧទាហរណ៍ 1 to 7) with step-by-step solutions (ចម្លើយ 1 to 7).
- **KruAI RAG Grounding**: Added `PHYSICS_CH1_SECTIONS`, `ALL_PHYSICS_SECTIONS`, and `searchPhysicsTextbook` in `server/textbook-search.ts`, and wired Physics textbook retrieval into `server/chat-handler.ts`.
- **Study Path Structure**: Registered `physics` in `SUBJECT_SESSIONS` and `PATH_TAB` in `src/features/lessons/sessions.ts` with Chapter 1 (`ទែម៉ូឌីណាមិច`), Lesson 1 (`ទ្រឹស្ដីស៊ីនេទិចនៃឧស្ម័ន`), and 5 authentic Khmer section titles.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/Physics summary"` (2 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Biology Tho Phon Q&A: Chapter 5 Lesson 2 (Gene Expression) OCR & KruAI Grounding

Commit: `2d56ba6`. **No database step needed.**

Digitized Chapter 5, Lesson 2 ("ការសំដែងចេញនៃសែន" / Gene Expression) of the Grade 12 Biology Q&A textbook compilation by Tho Phon (Book pp. 125-132, PDF pp. 126-133).
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ជីវវិទ្យា - ធូ ភន biology qna/` (p126.png to p133.png) and transcribed clean Markdown into `sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna/chapter5-lesson2-gene-expression.md` containing the complete lesson summary and all 7 authentic Bac II Q&A questions:
  1. Gene definition and historical grounding: Beadle and Tatum's *Neurospora crassa* X-ray mutagenesis experiments ("one gene - one enzyme" hypothesis); comparative analysis between DNA and proteins.
  2. Transcription (ការចម្លងក្រម): nuclear localization during interphase, RNA polymerase enzyme functions (promoter recognition, DNA unwinding, phosphodiester polymerization following $A_{\text{DNA}}-U_{\text{RNA}}, T_{\text{DNA}}-A_{\text{RNA}}, C_{\text{DNA}}-G_{\text{RNA}}, G_{\text{DNA}}-C_{\text{RNA}}$ complementarity, transcript release, DNA rewinding).
  3. The 3 RNA classes and structural traits: $\text{ARN}_m$ (single-strand messenger carrying genetic transcripts to cytoplasm), $\text{ARN}_t$ (cloverleaf transfer RNA, anticodon loop, 3' aminoacyl attachment site, charging via aminoacyl-tRNA synthetase), and $\text{ARN}_r$ (ribosomal structural RNA).
  4. Genetic code (ក្រមសេនេទិច): mathematical proof of triplet code ($4^3 = 64$ codons), start codon AUG (methionine), 3 stop codons (UAA, UAG, UGA), universal and degenerate nature; ribosome morphology (small/large subunits, P and A peptidyl sites, polysomes).
  5. Translation mechanism (ការបកប្រែក្រម): 3 distinct phases (Initiation, Elongation, Termination with release factor and cleavage of leader methionine).
  6. Gene regulation hierarchy: structural genes, operator genes, and regulatory/repressor genes responsive to cytoplasmic cues.
- **RAG Grounding**: Grounded comprehensive chunk `tb:bio:ch5:gene-expression-transcription-translation-tho-phon-qna` in `BIOLOGY_CH5_SECTIONS` in `server/textbook-search.ts`, searchable by KruAI for student inquiries on transcription, translation, codons, and gene regulation.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna"` (11 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Math Summary Folder Consolidation & Verification

Commit: `3ee7a5a`. **No database step needed.**

Consolidated the two separate Math Summary folders (`Math summary` and `math-summary`) into the canonical single directory `sources/ocr/Math summary/` and `sources/pages/Math summary/` per the exact PDF filename convention (`Math summary.pdf`).
- **Directory Consolidation**:
  - Moved Chapters 7, 8, and 9 (`chapter7-differential-equations.md`, `chapter8-probability.md`, and `chapter9-vectors-in-space.md`) into `sources/ocr/Math summary/`. All 9 chapters (Chapters 1 to 9) now reside together in a single folder.
  - Moved scanned pages `p86.png` to `p96.png` into `sources/pages/Math summary/`. All 96 rendered page scans now reside together in `sources/pages/Math summary/`.
  - Removed the duplicate kebab-case `math-summary` directories from both `sources/ocr/` and `sources/pages/`.
- **Textbook Formatting Fixes**:
  - Replaced Myanmar character `ည` (U+100A) with authentic Khmer `ញ` (U+1789) in `chapter1-limits.md`.
  - Moved inline Khmer annotations out of LaTeX math delimiters `$…$` in `chapter1-limits.md`.
- **Verification**:
  - Verified with `node scripts/ocr-check.mjs "sources/ocr/Math summary"` (all 9 chapters checked).
  - Verified with `npm run check:digits` (0 Khmer numerals across all 363 files).
  - Verified with `npx oxlint` (0 errors) and `npx tsc -b` (0 errors).


## 10 Nov 2026: Biology Tho Phon Q&A: Chapter 5 Lesson 1 (DNA as Genetic Material) OCR & KruAI Grounding

Commit: `954c36a`. **No database step needed.**

Digitized Chapter 5, Lesson 1 ("ADN ជាទ្រនំព័ត៌មានសេនេទិច" / DNA as Genetic Material) of the Grade 12 Biology Q&A textbook compilation by Tho Phon (Book pp. 82-87, PDF pp. 83-88).
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ជីវវិទ្យា - ធូ ភន biology qna/` (p083.png to p088.png) and transcribed clean Markdown into `sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna/chapter5-lesson1-dna-genetic-material.md` containing the complete lesson summary and all 5 authentic Bac II Q&A questions:
  1. Key historical experiments establishing DNA as genetic material: Griffith's bacterial transformation (pneumococcus S and R strains), Avery-MacLeod-McCarty's identification of DNA as transforming principle, Hershey-Chase's bacteriophage $^{35}\text{S}/^{32}\text{P}$ isotopic tracing.
  2. Chemical composition and nucleotide architecture: phosphoric acid ($\text{H}_3\text{PO}_4$), deoxyribose ($\text{C}_5\text{H}_{10}\text{O}_4$), and 4 nitrogenous bases (purines: A, G; pyrimidines: T, C); phosphodiester covalent bonds on single strands.
  3. Chargaff's rules: base equivalence ($\%A = \%T, \%C = \%G, A+G=50\%, T+C=50\%$) and constancy of $(A+C)/(T+G) = 1$.
  4. Watson-Crick double helix model: 2 nm diameter, 10 base pairs per helical turn ($3.4\text{ nm}$ pitch, $0.34\text{ nm}$ inter-nucleotide rise), complementary base pairing via hydrogen bonds ($A=T$ 2 H-bonds, $C\equiv G$ 3 H-bonds).
  5. DNA replication (ស្វ័យដំឡើងទ្វេ): S-phase of interphase in the nucleus, DNA polymerase catalysis, semi-conservative replication mechanism (one conserved parental template strand, one newly synthesized daughter strand), prokaryotic single-origin ($10^6\text{ bp/s}$) vs eukaryotic multi-origin ($500-5000\text{ bp/s}$) replication bubbles, biological roles (chromosome duplication, genetic continuity).
- **RAG Grounding**: Grounded comprehensive chunk `tb:bio:ch5:dna-as-genetic-material-tho-phon-qna` in `BIOLOGY_CH5_SECTIONS` in `server/textbook-search.ts`, searchable by KruAI for student inquiries on DNA structure, historical discovery experiments, and replication mechanisms.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna"` (10 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Biology Tho Phon Q&A: Chapter 4 Lesson 3 (Enzymes) OCR & KruAI Grounding (Chapter 4 100% Complete)

Commit: `a91f48c`. **No database step needed.**

Digitized Chapter 4, Lesson 3 ("អង់ស៊ីម" / Enzymes) of the Grade 12 Biology Q&A textbook compilation by Tho Phon (Book pp. 77-81, PDF pp. 78-82). This concludes the 100% complete digitization of Chapter 4 (Role of Proteins in Organisms).
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ជីវវិទ្យា - ធូ ភន biology qna/` (p078.png to p082.png) and transcribed clean Markdown into `sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna/chapter4-lesson3-enzymes.md` containing the complete lesson summary and all 11 authentic Bac II Q&A questions:
  1. Enzyme definition and nature: all enzymes are proteins operating as biological catalysts to accelerate biochemical reactions without being consumed ($E + S \rightleftharpoons ES \rightleftharpoons E + P$).
  2. Naming conventions: derived from reaction type catalyzed or substrate name with suffix "-ase" (e.g. amylase, lipase, protease, sucrase, catalase).
  3. Six major enzyme classes: oxidoreductases (redox, e.g. dehydrogenases), transferases (transfer functional groups, e.g. transcarboxylases), hydrolases (hydrolytic cleavages, e.g. proteases, lipases, carbohydrases), lyases (non-hydrolytic bond cleavages releasing $H_2O, CO_2, NH_3$, e.g. decarboxylases), isomerases (intramolecular rearrangements, e.g. epimerases, mutases), and ligases (bond formation coupled with ATP hydrolysis, e.g. synthetases).
  4. Enzyme specificity (យថាប្រភេទ): strict substrate specificity necessitating thousands of distinct enzymes in living cells.
  5. Environmental factors influencing activity: temperature (doubling per 10 °C rise, optimal range at 40 °C to 45 °C, denaturation above 45 °C or below 0 °C), pH (optimum at pH 7, declining towards pH 4 or pH 9), substrate/enzyme concentrations, non-protein coenzymes (vitamin B complex, Coenzyme A), and reversible catalysis.
- **RAG Grounding**: Grounded comprehensive chunk `tb:bio:ch4:enzymes-tho-phon-qna` in `BIOLOGY_CH4_SECTIONS` in `server/textbook-search.ts`, searchable by KruAI for student inquiries on enzyme mechanisms, kinetics, and 6 enzyme classes.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna"` (9 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Biology Tho Phon Q&A: Chapter 4 Lesson 2 (Proteins) OCR & KruAI Grounding

Commit: `acc23d5`. **No database step needed.**

Digitized Chapter 4, Lesson 2 ("ប្រូតេអ៊ីន" / Proteins) of the Grade 12 Biology Q&A textbook compilation by Tho Phon (Book pp. 72-76, PDF pp. 73-77).
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ជីវវិទ្យា - ធូ ភន biology qna/` (p073.png to p077.png) and transcribed clean Markdown into `sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna/chapter4-lesson2-proteins.md` containing the complete lesson summary and all 8 authentic Bac II Q&A questions:
  1. Protein definition and structure: polymer of $>50$ amino acids (under 50 is a polypeptide).
  2. Four levels of protein structure: primary (amino acid sequence and peptide bonds), secondary (hydrogen bonding, $\alpha$-helix vs $\beta$-pleated sheets), tertiary (multi-folded globular 3D conformation with active domains), and quaternary (assembly of 3 or 4 polypeptide subunits like hemoglobin).
  3. Six fundamental protein functions: catalytic (rubisco, nitrogenase), structural (collagen, elastin), motility/cytoskeletal (actin, tubulin, endocytosis, exocytosis, cell division), defensive (keratin, thrombin, fibrinogen, antibodies), regulatory/hormonal (insulin, glucagon, GH), and transport (hemoglobin, lipoproteins, $Na^+/K^+$ ion pumps).
  4. Classifications: by shape (fibrous vs globular) and by composition (simple vs conjugated/heteroproteins with prosthetic groups like lipids, carbohydrates, phosphate, metals, sulfur).
  5. Protein denaturation causes: strong acids/bases (pH shifts), organic solvents, detergents/soaps, urea, high salinity, heavy metals ($Hg, Pb$), thermal extremes, and mechanical shear.
- **RAG Grounding**: Grounded comprehensive chunk `tb:bio:ch4:proteins-tho-phon-qna` in `BIOLOGY_CH4_SECTIONS` in `server/textbook-search.ts`, searchable by KruAI for student inquiries on protein structures, 6 biological functions, and denaturation.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna"` (8 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Biology Tho Phon Q&A: Chapter 4 Lesson 1 (Amino Acids) OCR & KruAI Grounding

Commit: `adb077f`. **No database step needed.**

Digitized Chapter 4, Lesson 1 ("អាស៊ីតអាមីណេ" / Amino Acids) of the Grade 12 Biology Q&A textbook compilation by Tho Phon (Book pp. 67-71, PDF pp. 68-72).
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ជីវវិទ្យា - ធូ ភន biology qna/` (p068.png to p072.png) and transcribed clean Markdown into `sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna/chapter4-lesson1-amino-acids.md` containing the complete lesson summary and all 9 authentic Bac II Q&A questions:
  1. Amino acid chemical structure: central carbon ($C_\alpha$), $-H$, carboxyl group ($-COOH$), amine group ($-NH_2$), and variable radical ($-R$).
  2. Amphoteric nature and ionic states: at neutral $\text{pH}=7$ forms zwitterion with $-COO^-$ and $-NH_3^+$; at acidic $\text{pH}<7$ forms $-COOH$ and $-NH_3^+$; at basic $\text{pH}>7$ forms $-COO^-$ and $-NH_2$.
  3. Hydrophilic properties and cellular transport: highly water-soluble, crosses plasma membranes smoothly into cells.
  4. Cellular functions: messenger molecules (glycine, glutamate, serotonin from tryptophan), metabolic regulation and cellular transport (thyroxine, arginine, citrulline, ornithine).
  5. 20 standard amino acids (coded by genetic code) vs non-standard amino acids (metabolic intermediates, not incorporated into proteins).
  6. Peptides and peptide bond formation: covalent condensation between $-COOH$ of one amino acid and $-NH_2$ of another with loss of $H_2O$ ($-CO-NH-$); dipeptide chemical formulas (serine-alanine dipeptide).
- **RAG Grounding**: Grounded comprehensive chunk `tb:bio:ch4:amino-acids-tho-phon-qna` in `BIOLOGY_CH4_SECTIONS` in `server/textbook-search.ts`, searchable by KruAI for student inquiries on amino acid structure, peptide bonds, and properties.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna"` (7 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Biology Tho Phon Q&A: Chapter 3 Lesson 3 (Endocrine System) OCR & KruAI Grounding

Commit: `99f6297`. **No database step needed.**

Digitized Chapter 3, Lesson 3 ("ប្រព័ន្ធអង់ដូគ្រីន" / Endocrine System) of the Grade 12 Biology Q&A textbook compilation by Tho Phon (Book pp. 51-66, PDF pp. 52-67).
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ជីវវិទ្យា - ធូ ភន biology qna/` (p052.png to p067.png) and transcribed clean Markdown into `sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna/chapter3-lesson3-endocrine-system.md` containing the complete lesson summary and all 26 authentic Bac II Q&A questions:
  1. Exocrine glands (with ducts, external/lumen secretion) vs endocrine glands (ductless, direct secretion into blood) and mixed glands (pancreas, stomach, small intestine, gonads).
  2. Peptide hormones (insulin, glucagon, thyroxine, water-soluble, bind surface receptors, cAMP second messenger) vs steroid hormones (estrogen, testosterone, cortisol, lipid-soluble, cross membrane, cytoplasmic receptors, direct gene activation).
  3. Hypothalamus and pituitary axes: posterior pituitary stores ADH and oxytocin; anterior pituitary synthesizes GH (dwarfism, gigantism), Prolactin, TSH, ACTH, MSH, FSH, and LH.
  4. Thyroid & parathyroid glands: thyroxine ($T_4$ synthesis from tyrosine and iodine, basal metabolic rate regulation, goiter, myxedema, Basedow's disease) and PTH (calcium homeostasis, tetany, osteoporosis).
  5. Pancreas & diabetes: beta (β) cells secrete insulin (hypoglycemic), alpha (α) cells secrete glucagon (hyperglycemic); causes, mechanisms, and cardinal symptoms of diabetes mellitus.
  6. Digestive hormones (gastrin, secretin) and negative feedback homeostatic loops.
- **RAG Grounding**: Grounded comprehensive chunk `tb:bio:ch3:endocrine-system-high-yield-bacii-qna` in `BIOLOGY_CH3_SECTIONS` in `server/textbook-search.ts`, searchable by KruAI for student inquiries on endocrine glands, hormones, and hormonal disorders.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna"` (6 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Grade 12 History Eng Lay Q&A: 52 Selected Q&A OCR & KruAI RAG Grounding (100% Textbook Complete)

Commit: `22625f7`. **No database step needed.**

Digitized the final Section 10 ("សំណួរ និង ចម្លើយជ្រើសរើស" / 52 Selected Questions & Answers) of the Grade 12 History Q&A textbook compilation by Eng Lay / compiled by Soung Sedy (Hun Sen 10 Makara High School / MoEYS Bac II 2014-2022) (Book pp. 75-102, PDF pp. 78-105). This concludes the 100% complete digitization of the entire 105-page textbook.
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ប្រវត្តិវិទ្យា_អេង_ឡាយ/` and transcribed clean Markdown into `sources/ocr/ប្រវត្តិវិទ្យា_អេង_ឡាយ/selected-qna.md` containing all 52 high-yield questions and detailed answers categorized into 6 core historical eras and themes:
  1. French Protectorate (1863-1953): King Ang Duong's diplomatic letters (1853, 1856), 1863 treaty, 1867 Siam treaty, 1884 convention and 1884-1887 rebellion, and the 1954 Geneva Accords.
  2. Sangkum Reastr Niyum (1953-1970): Sihanouk abdication and popular mandate, National Congress (1955-1968), key achievements, and internal fractures.
  3. Khmer Republic (1970-1975): US B-52 carpet bombings (Feb-Aug 1973), severe socio-economic impact, and roots of the 1970-1975 civil war.
  4. Democratic Kampuchea (1975-1979): Pol Pot's 8 directives (17 April 1975), collectivization, 4-year plan (1977-1980), administrative divisions (6 zones, 32 sectors), Khmer Rouge central leadership, and ECCC tribunals (Cases 001 and 002).
  5. PRK and Kingdom of Cambodia II (1979-present): Post-7 January 1979 humanitarian crisis, 1989 constitutional amendments, 4 warring factions, 1991 Paris Peace Agreements, UNTAC, and the 1998-2003 Triangular Strategy (Win-Win policy, regional integration, socio-economic reforms).
  6. ASEAN and General Knowledge: Bangkok Declaration 1967, 10 member states, Cambodia's 1999 admission, motto, flag symbolism, ASEAN+1/2/3/10 and ASEAN-minus formulas, Cambodia's 3 chairmanships (2002, 2012, 2022), UNESCO World Heritage sites (tangible: Angkor, Preah Vihear, Toul Sleng, Sambor Prei Kuk; intangible: Royal Ballet, Sbek Thom, Tug-of-war, Chapei Dang Veng, Lakhon Khol, Bokator), and Mekong River hydrology across 6 nations.
- **RAG Grounding**: Added comprehensive keyworded chunk `tb:hist:overview:selected-qna-high-yield` into `HISTORY_OVERVIEW_SECTIONS` in `server/textbook-search.ts` and included in `ALL_HISTORY_SECTIONS`, searchable via `searchHistoryTextbook`.
- **Verification**: Verified with `node scripts/ocr-check.mjs sources/ocr/ប្រវត្តិវិទ្យា_អេង_ឡាយ` (10 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Grade 12 History Eng Lay Q&A: Practice Exams 1 to 5 OCR & KruAI RAG Grounding

Commit: `ffea718`. **No database step needed.**

Transcribed and grounded Section 9 ("វិញ្ញាសាទី 1 ដល់ ទី 5" / Practice Exams 1 to 5) from the official Grade 12 History Q&A compilation by Eng Lay / compiled by Soung Sedy (Hun Sen 10 Makara High School / MoEYS Bac II 2014-2022) (Book pp. 56-74, PDF pp. 59-77).
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ប្រវត្តិវិទ្យា_អេង_ឡាយ/` and transcribed clean Markdown into `sources/ocr/ប្រវត្តិវិទ្យា_អេង_ឡាយ/practice-exams-1-to-5.md` containing all 5 comprehensive Bac II exam papers and official scoring criteria (អត្រាកំណែ). Covers: Exam 1 on Cambodia's 1955 UN membership, Sangkum Reastr Niyum's internal factions, and Khmer Rouge regime atrocities; Exam 2 on the 2 December 1978 United Front, national education restoration post-1979, and the K-5 national border defense plan; Exam 3 on ASEAN admission motives, community spirit and consensus, and Cambodia's ASEAN chairmanships (2002, 2012, 2022); Exam 4 on Southeast Asian anti-colonial resistance movements, Vietnam's 1986 Doi Moi economic reforms, and Middle East conflict drivers (1947 Palestine-Israel partition); and Exam 5 on UN permanent members, the 1947 Marshall Plan, Gorbachev's Perestroika reforms and the 1991 Soviet collapse, and emerging global crises (climate change, population surge, food security, terrorism).
- **RAG Grounding**: Added keyworded chunk `tb:hist:practice:exams-1-to-5-bacii-qna` into `HISTORY_OVERVIEW_SECTIONS` in `server/textbook-search.ts` and included in `ALL_HISTORY_SECTIONS`, searchable via `searchHistoryTextbook`.
- **Verification**: Verified with `node scripts/ocr-check.mjs sources/ocr/ប្រវត្តិវិទ្យា_អេង_ឡាយ` (9 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Biology Tho Phon Q&A: Chapter 3 Lesson 2 (Sense Organs) OCR & KruAI Grounding

Commit: `d9ef1c1`. **No database step needed.**

Transcribed and grounded Chapter 3, Lesson 2 ("សរីរាង្គវិញ្ញាណ" / Sense Organs: Eye, Ear, Tongue, Nose, Skin) from the official ជីវវិទ្យា ថូ ភន (Tho Phon Biology Q&A) textbook (Book pp. 34–50, PDF pp. 35–51).
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ជីវវិទ្យា - ធូ ភន biology qna/` and transcribed clean Markdown into `sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna/chapter3-lesson2-sense-organs.md` containing the complete theory summary and all 42 authentic Bac II questions and answers. Covers eye anatomy (sclera, cornea light refraction, choroid, ciliary body, iris pupil regulation, retina cones and rods, rhodopsin chemistry and vitamin A / night blindness, 3 chambers with aqueous and vitreous humors, accessory structures with lacrimal glands and 6 muscles for 3D vision, and visual defects: myopia with concave lens, hypermetropia with convex lens, astigmatism with cylindrical lens); ear anatomy and mechanisms (outer ear pinna and canal, middle ear tympanic membrane and 3 ossicles malleus/incus/stapes, Eustachian tube pressure regulation and infection pathway, inner ear cochlea hearing and semicircular canals balance coordination with cerebellum, motion sickness); tongue anatomy (papillae, taste buds structure, 4 primary taste zones: sweet, salty, sour, bitter); nose anatomy (olfactory epithelium, supporting cells, basal cells, olfactory receptor cells with cilia, mucous dissolution and common cold taste-smell relationship); and skin anatomy (epidermis keratin and melanocytes with melanin/albinism, dermis with 5 cutaneous receptors for pain, pressure, touch, heat, cold, sebaceous glands, sweat glands 500-600 ml/day, hair arrector pili muscle, nails lunula).
- **RAG Grounding**: Added keyworded chunk `tb:bio:ch3:sense-organs-high-yield-bacii-qna` into `BIOLOGY_CH3_SECTIONS` in `server/textbook-search.ts` with comprehensive bilingual keywords for retrieval by KruAI.
- **Verification**: Verified with `node scripts/ocr-check.mjs "sources/ocr/ជីវវិទ្យា - ធូ ភន biology qna"` (5 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), `npx tsc -b` (0 errors), `npm test` (all 109 tests passed), and `npm run build` (production build and CSP check passed).


## 10 Nov 2026: Grade 12 History Eng Lay Q&A: Regional & World History (ASEAN, Cold War, Globalization) OCR & KruAI RAG Grounding

Commit: `adde982`. **No database step needed.**

Transcribed and grounded Section 8 ("ប្រវត្តិសាស្ត្រតំបន់ និងពិភពលោក" / Regional & World History) from the official Grade 12 History Q&A compilation by Eng Lay / compiled by Soung Sedy (Hun Sen 10 Makara High School / MoEYS Bac II 2014-2022) (Book pp. 47-55, PDF pp. 50-58).
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ប្រវត្តិវិទ្យា_អេង_ឡាយ/` and transcribed clean Markdown into `sources/ocr/ប្រវត្តិវិទ្យា_អេង_ឡាយ/regional-and-world-history.md` containing all 16 authentic Bac II questions (2014, 2016, 2017, 2018, 2021, 2022) and their official scoring keys (អត្រាកំណែ). Covers major global issues (environmental degradation, climate change, population explosion, human trafficking, food security and famine, transnational crime, terrorism); causes and multi-faceted impacts of globalization (economic growth, market competition, high-tech automation vs. loss of small-state sovereignty, big-power interventions, inter-state conflicts); ASEAN's founding mission, role in Southeast Asia (peace, conflict resolution, economic integration, tourism, cultural exchange), all 10 member nations, and comprehensive benefits to Cambodia across politics, economy, social progress, and regional infrastructure; the European Union (EU) structure and principles (27 nations); Cold War impact on Indochina in 1950-1960 (independence and UN accession vs. ideological division of Vietnam and Laos, and devastating proxy conflicts); and global Cold War consequences (arms race, NATO vs. Warsaw Pact military blocs, UN paralysis, divided nations).
- **RAG Grounding**: Added keyworded chunk `tb:hist:world:regional-and-world-history-bacii-qna` into `HISTORY_OVERVIEW_SECTIONS` in `server/textbook-search.ts` and included in `ALL_HISTORY_SECTIONS`, searchable via `searchHistoryTextbook`.
- **Verification**: Verified with `node scripts/ocr-check.mjs sources/ocr/ប្រវត្តិវិទ្យា_អេង_ឡាយ` (8 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Grade 12 History Eng Lay Q&A: Cambodia History Summary OCR & KruAI RAG Grounding

Commit: `cc182713`. **No database step needed.**

Transcribed and grounded Section 7 ("ប្រវត្តិសាស្ត្រប្រទេសកម្ពុជា" / Cambodia History Summary) from the official Grade 12 History Q&A compilation by Eng Lay (Hun Sen 10 Makara High School / MoEYS Bac II 2014-2022) (Book pp. 43-46, PDF pp. 46-49).
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ប្រវត្តិវិទ្យា_អេង_ឡាយ/` and transcribed clean Markdown into `sources/ocr/ប្រវត្តិវិទ្យា_អេង_ឡាយ/cambodia-history-summary.md` containing all 7 authentic Bac II questions (2014, 2015, 2016) and their official scoring keys (អត្រាកំណែ). Covers the construction of Angkor Wat by King Suryavarman II; achievements of King Jayavarman VII (liberation from Champa 1177-1181, Angkor Thom, Bayon, 102 hospitals / arogyasala, 121 dharmasala / rest houses, Mahayana Buddhism, father of the nation); major historical milestones of 20th-century Cambodia (French Protectorate border treaties 1904/1907/1908 Dangrek map, 1947 first constitution, loss of Kampuchea Krom 4 June 1949, 1953 royal independence crusade, 1954 Geneva; Sangkum Reastr Niyum UN membership 1955, 1962 Preah Vihear ICJ ruling; Khmer Republic 1970 coup, B-52 bombings 1969-1973, civil war; Democratic Kampuchea 17 April 1975, KUFNS 2 Dec 1978, 7 Jan 1979 victory; PRK & SOC, 23 Oct 1991 Paris Peace Agreements, UNESCO Angkor 1992, Win-Win policy 1998, ASEAN 1999); economic and social values of peace; the role of the "Culture of Dialogue" (វប្បធម៌សន្ទនា) in a democratic society; the role of Buddhism in Khmer society; and Samdech Preah Sangharaja Chuon Nath as creator of the Khmer Dictionary.
- **RAG Grounding**: Added keyworded chunk `tb:hist:overview:cambodia-20th-century-and-monarchs` into `HISTORY_OVERVIEW_SECTIONS` in `server/textbook-search.ts` and included in `ALL_HISTORY_SECTIONS`, searchable via `searchHistoryTextbook`.
- **Verification**: Verified with `node scripts/ocr-check.mjs sources/ocr/ប្រវត្តិវិទ្យា_អេង_ឡាយ` (7 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Grade 12 Math Chapter 9 (Vectors in Space & Applications) OCR & KruAI RAG Grounding (100% Textbook Complete!)

Commit: `7c44438`. **No database step needed.**

Digitized Chapter 9 ("ផលគុណនៃពីរវ៉ិចទ័រក្នុងលំហ និង អនុវត្តន៍" / Vectors in Space & Applications) from the official MoEYS Grade 12 Mathematics Summary textbook (Book pp. 89–93, PDF pp. 92–96), bringing the entire MoEYS Grade 12 Mathematics Summary Textbook to 100% completion across all 9 chapters.
- **Textbook Rendering & OCR**: Rendered high-resolution scans using `scripts/pdf-to-png.mjs` and transcribed clean Markdown with standard KaTeX formulas into `sources/ocr/Math summary/chapter9-vectors-in-space.md`. Covers cross product definition and determinant formula $\vec{u} \times \vec{v}$, algebraic and geometric properties ($\vec{u} \times \vec{v} \perp \vec{u}, \vec{v}$, $|\vec{u} \times \vec{v}| = |\vec{u}||\vec{v}|\sin\theta$, collinear condition $\vec{u} \times \vec{v} = \vec{0}$), geometric applications (area of parallelogram $S = |\vec{u} \times \vec{v}|$, area of triangle $S = \frac{1}{2}|\vec{u} \times \vec{v}|$), triple scalar product $\vec{u} \cdot (\vec{v} \times \vec{w})$, volume of parallelepiped $V = |\vec{u} \cdot (\vec{v} \times \vec{w})|$, volume of tetrahedron $W = \frac{V}{6}$, lines in space (parametric and symmetric equations), planes in space (standard $a(x - x_0) + b(y - y_0) + c(z - z_0) = 0$ and general $ax + by + cz + d = 0$, normal vector from three points $\vec{n} = \vec{AB} \times \vec{AC}$, angle between planes), distance formulas (point-to-point, point-to-plane, point-to-line), sphere equations, and all 7 authentic MoEYS worked exercises.
- **RAG Grounding**: Added keyworded chunks (`MATH_CH9_SECTIONS` / `MATH_VECTORS_IN_SPACE_SECTIONS`) into `server/textbook-search.ts` covering:
  - `tb:math:vectors:ch9:cross-product-properties`: Cross product, properties, unit orthogonal vectors, parallelogram/triangle areas, and triple scalar product volume formulas.
  - `tb:math:vectors:ch9:lines-planes-spheres`: Parametric/symmetric line equations, plane equations from three points, sphere equations, and distance formulas in space.
  Included in `ALL_MATH_SECTIONS` and updated `searchMathTextbook` across all 9 chapters.
- **Curriculum Sessions**: Registered authentic section titles for Chapter 9 ("ផលគុណនៃពីរវ៉ិចទ័រក្នុងលំហ និង អនុវត្តន៍") in `src/features/practice/quiz-path.ts` under `MATH_LESSONS`: "ផលគុណនៃពីរវ៉ិចទ័រ និងផលគុណចម្រុះ", "បន្ទាត់ ប្លង់ ស្វ៊ែរ និងចម្ងាយក្នុងលំហ".
- **Verification**: Passed `node scripts/ocr-check.mjs sources/ocr/Math summary` (0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Grade 12 History Eng Lay Q&A: Lesson 6 (Kingdom of Cambodia Second) OCR & KruAI RAG Grounding

Commit: `f4740f9`. **No database step needed.**

Transcribed and grounded Lesson 6 ("ព្រះរាជាណាចក្រកម្ពុជាទី 2 (1993 - បច្ចុប្បន្ន)" / Kingdom of Cambodia Second) from the official Grade 12 History Q&A compilation by Eng Lay (Hun Sen 10 Makara High School / MoEYS Bac II 2014-2022) (Book pp. 30-42, PDF pp. 33-45).
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ប្រវត្តិវិទ្យា_អេង_ឡាយ/` and transcribed clean Markdown into `sources/ocr/ប្រវត្តិវិទ្យា_អេង_ឡាយ/lesson6-kingdom-of-cambodia-second.md` containing all 14 authentic Bac II questions (2014, 2015, 2017, 2018, 2019, 2021, 2022) and their official scoring keys (អត្រាកំណែ). Covers the roles of King Norodom Sihanouk and Samdech Hun Sen as fathers of peace; significance of listing Preah Vihear Temple as UNESCO World Heritage; Win-Win Policy (និយមន័យ និងសមិទ្ធផល, 29 Dec 1998, Khmer Rouge integration, security and development along the border); founding of the Second Kingdom of Cambodia on 24 Sept 1993 and constitutional monarchy; national reconstruction across politics, economy, social affairs, education, culture, and rule of law; national achievements under the Royal Government (Triangular & Rectangular Strategies, ASEAN accession 1999, WTO accession 2004, ASEAN Chairmanship 2002/2012/2022); and the pivotal role of peace in sustainable national development.
- **RAG Grounding**: Added keyworded chunk `tb:hist:koc:ch6:high-yield-bacii-qna` into `HISTORY_CH6_SECTIONS` in `server/textbook-search.ts` with comprehensive bilingual keywords covering exam queries and scoring rubrics. Included in `ALL_HISTORY_SECTIONS` and searchable via `searchHistoryTextbook`.
- **Verification**: Verified with `node scripts/ocr-check.mjs sources/ocr/ប្រវត្តិវិទ្យា_អេង_ឡាយ` (6 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Grade 12 Math Chapter 8 (Probability) OCR & KruAI RAG Grounding

Commit: `983efbd`. **No database step needed.**

Digitized Chapter 8 ("ប្រូបាប" / Probability) from the official MoEYS Grade 12 Mathematics Summary textbook (Book pp. 83–88, PDF pp. 86–91).
- **Textbook Rendering & OCR**: Rendered high-resolution scans using `scripts/pdf-to-png.mjs` and transcribed clean Markdown with standard KaTeX formulas into `sources/ocr/Math summary/chapter8-probability.md`. Covers basic probability definitions and properties ($P(A) = \frac{n(A)}{n(S)}$, $0 \le P(A) \le 1$, $P(S) = 1$, $P(\emptyset) = 0$), union and intersection of events, mutually exclusive events ($A \cap B = \emptyset \implies P(A \cup B) = P(A) + P(B)$), complementary events ($P(\bar{A}) = 1 - P(A)$), conditional probability ($P(B|A) = \frac{P(A \cap B)}{P(A)}$), multiplication rule, independent events ($P(A \cap B) = P(A) \times P(B)$), law of total probability, Bayes' theorem, and all 4 authentic MoEYS worked exercises (marble draws with combinations $C(n, k)$, student boarding contingency tables, 32-card deck draws, and numbered ball draws forming arithmetic/geometric progressions).
- **RAG Grounding**: Added keyworded chunks (`MATH_CH8_SECTIONS` / `MATH_PROBABILITY_SECTIONS`) into `server/textbook-search.ts` covering:
  - `tb:math:prob:ch8:basic-probability-rules`: Definition, properties, addition rule, mutually exclusive events, complementary events, and combination counting.
  - `tb:math:prob:ch8:conditional-and-independent`: Conditional probability, multiplication rule, independent vs. dependent events, total probability, and Bayes' theorem.
  Included in `ALL_MATH_SECTIONS` and updated `searchMathTextbook`.
- **Curriculum Sessions**: Registered authentic section titles for Chapter 8 ("ប្រូបាប") in `src/features/practice/quiz-path.ts` under `MATH_LESSONS`: "និយមន័យ និងលក្ខណៈគ្រឹះនៃប្រូបាប", "ប្រូបាបមានលក្ខខណ្ឌ និងព្រឹត្តិការណ៍មិនអាស្រ័យគ្នា".
- **Verification**: Passed `node scripts/ocr-check.mjs sources/ocr/Math summary` (0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Grade 12 History Eng Lay Q&A: Lesson 5 (People's Republic & State of Cambodia) OCR & KruAI RAG Grounding

Commit: `5bf063b`. **No database step needed.**

Transcribed and grounded Lesson 5 ("សាធារណរដ្ឋប្រជាមានិតកម្ពុជា និងរដ្ឋកម្ពុជា (1979-1993)" / People's Republic of Kampuchea and State of Cambodia) from the official Grade 12 History Q&A compilation by Eng Lay (Hun Sen 10 Makara High School / MoEYS Bac II 2014-2022) (Book pp. 23-29, PDF pp. 26-32).
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ប្រវត្តិវិទ្យា_អេង_ឡាយ/` and transcribed clean Markdown into `sources/ocr/ប្រវត្តិវិទ្យា_អេង_ឡាយ/lesson5-peoples-republic-and-state-of-cambodia.md` containing all 7 authentic Bac II questions (2014, 2016, 2017, 2019, 2021, 2022) and their official scoring keys (អត្រាកំណែ). Covers the peace negotiation and national reconciliation process (1984-1991, Sihanouk-Hun Sen summits, JIM 1 & 2, Vietnamese troop withdrawal Sept 1989, SNC formation, Paris Peace Agreements 23 Oct 1991, UNTAC 1993, Win-Win policy 1998), post-1979 national reconstruction across politics, economy (solidarity groups / ក្រុមសាមគ្គីបង្កបង្កើនផល, 1980 riel re-circulation, shift to private property 1983-1986), education/culture ("អ្នកចេះច្រើនបង្រៀនអ្នកចេះតិច", literacy campaign, fine arts, pagodas), and health; resistance movements against Pol Pot (1975-1979, Hou Nim 1976, Chamkar Luong, Hun Sen journey to Vietnam 20 June 1977, KUFNS 2 Dec 1978); PRK governing state apparatus (KPRP, Council of State, Council of Ministers, National Assembly, K-5 defense plan); and the historical significance of the 7 January 1979 liberation day.
- **RAG Grounding**: Added keyworded chunk `tb:hist:prk:ch5:high-yield-bacii-qna` into `HISTORY_CH5_SECTIONS` in `server/textbook-search.ts` with comprehensive bilingual keywords covering exam queries and scoring rubrics. Included in `ALL_HISTORY_SECTIONS` and searchable via `searchHistoryTextbook`.
- **Verification**: Verified with `node scripts/ocr-check.mjs sources/ocr/ប្រវត្តិវិទ្យា_អេង_ឡាយ` (5 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), `npx tsc -b` (0 errors), and `npm test` (all 109 tests passed).


## 10 Nov 2026: Grade 12 Math Chapter 7 (Differential Equations) OCR & KruAI RAG Grounding

Commit: `878c50c`. **No database step needed.**

Digitized Chapter 7 ("សមីការឌីផេរ៉ង់ស្យែល" / Differential Equations) from the official MoEYS Grade 12 Mathematics Summary textbook (Book pp. 78–82, PDF pp. 81–85).
- **Textbook Rendering & OCR**: Rendered high-resolution scans using `scripts/pdf-to-png.mjs` and transcribed clean Markdown with standard KaTeX formulas into `sources/ocr/Math summary/chapter7-differential-equations.md`. Covers first-order linear differential equations (homogeneous $y' + ay = 0$, general solution $y = A e^{-ax}$, non-homogeneous $y' + ay = p(x)$, variation of constants method $y = A(x) e^{-ax}$, undetermined coefficients method), second-order linear differential equations ($a y'' + b y' + c y = 0$, characteristic equation $a \lambda^2 + b \lambda + c = 0$, real distinct roots, repeated root, complex conjugate roots $y = e^{\alpha x}(C \cos\beta x + D \sin\beta x)$, non-homogeneous $y = y_c + y_p$), and all 4 authentic MoEYS worked exercises with initial conditions and tangent line slope conditions.
- **RAG Grounding**: Added keyworded chunks (`MATH_CH7_SECTIONS` / `MATH_DIFFERENTIAL_EQUATIONS_SECTIONS`) into `server/textbook-search.ts` covering:
  - `tb:math:diffeq:ch7:first-order`: First-order homogeneous & non-homogeneous equations, general/particular solutions, variation of parameters, and initial value problems.
  - `tb:math:diffeq:ch7:second-order`: Second-order characteristic equations, three discriminant cases, general solutions, and particular solutions with boundary conditions.
  Included in `ALL_MATH_SECTIONS` and updated `searchMathTextbook`.
- **Curriculum Sessions**: Registered authentic section titles for Chapter 7 ("សមីការឌីផេរ៉ង់ស្យែល") in `src/features/practice/quiz-path.ts` under `MATH_LESSONS`: "សមីការឌីផេរ៉ង់ស្យែលលំដាប់ទី 1", "សមីការឌីផេរ៉ង់ស្យែលលំដាប់ទី 2".
- **Verification**: Passed `node scripts/ocr-check.mjs sources/ocr/Math summary` (0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), and `npx tsc -b` (0 errors).


## 10 Nov 2026: Grade 12 History Eng Lay Q&A: Lesson 4 (Democratic Kampuchea) OCR & KruAI RAG Grounding

Commit: `2eaced2`. **No database step needed.**

Transcribed and grounded Lesson 4 ("កម្ពុជាប្រជាធិបតេយ្យ (1975-1979)" / Democratic Kampuchea) from the official Grade 12 History Q&A compilation by Eng Lay (Hun Sen 10 Makara High School / MoEYS Bac II 2014-2022) (Book pp. 18-22, PDF pp. 21-25).
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ប្រវត្តិវិទ្យា_អេង_ឡាយ/` and transcribed clean Markdown into `sources/ocr/ប្រវត្តិវិទ្យា_អេង_ឡាយ/lesson4-democratic-kampuchea.md` containing all 9 authentic Bac II questions (2014, 2016, 2018, 2019, 2021) and their official scoring keys (អត្រាកំណែ). Covers ECCC tribunal charges (genocide, crimes against humanity, war crimes) and objectives, list of top leaders, causes of national destruction, 4 key causes for the regime's collapse (popular resistance, internal purges, Vietnam border war, KUFNS 2 Dec 1978 and 7 Jan 1979 liberation), and post-1979 reconstruction (Solidarity Groups / ក្រុមសាមគ្គីបង្កបង្កើនផល, riel re-circulation 1980).
- **RAG Grounding**: Added keyworded chunk `tb:hist:dk:ch4:high-yield-bacii-qna` into `HISTORY_CH4_SECTIONS` in `server/textbook-search.ts` with comprehensive bilingual keywords covering exam queries and scoring rubrics. Included in `ALL_HISTORY_SECTIONS` and searchable via `searchHistoryTextbook`.
- **Verification**: Verified with `node scripts/ocr-check.mjs sources/ocr/ប្រវត្តិវិទ្យា_អេង_ឡាយ` (4 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), `npx tsc -b` (0 errors), and `npm test` (all 109 tests passed).



## 10 Nov 2026: Grade 12 History Eng Lay Q&A: Lesson 3 (Khmer Republic) OCR & KruAI RAG Grounding

Commit: `fbc38b7`. **No database step needed.**

Transcribed and grounded Lesson 3 ("របបសាធារណរដ្ឋខ្មែរ (1970-1975)" / Khmer Republic) from the official Grade 12 History Q&A compilation by Eng Lay (Hun Sen 10 Makara High School / MoEYS Bac II 2014-2022) (Book pp. 11-17, PDF pp. 14-20).
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ប្រវត្តិវិទ្យា_អេង_ឡាយ/` and transcribed clean Markdown into `sources/ocr/ប្រវត្តិវិទ្យា_អេង_ឡាយ/lesson3-khmer-republic.md` containing all 10 authentic Bac II questions (2015, 2016, 2017, 2019, 2021, 2022) and their official scoring keys (អត្រាកំណែ). Covers 18 March 1970 coup causes (social/economic/political pre-coup crises) and severe multi-faceted aftermath, 1970-1975 civil war outbreak, FUNK/GRUNK, B-52 bombing impacts, and the 8 key factors that caused the collapse of the Khmer Republic leading up to 17 April 1975.
- **RAG Grounding**: Added keyworded chunk `tb:hist:republic:ch3:high-yield-bacii-qna` into `HISTORY_CH3_SECTIONS` in `server/textbook-search.ts` with comprehensive bilingual keywords covering exam queries and scoring rubrics. Included in `ALL_HISTORY_SECTIONS` and searchable via `searchHistoryTextbook`.
- **Verification**: Verified with `node scripts/ocr-check.mjs sources/ocr/ប្រវត្តិវិទ្យា_អេង_ឡាយ` (3 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), `npx tsc -b` (0 errors), and `npm test` (all 109 tests passed).



## 10 Nov 2026: Grade 12 History Eng Lay Q&A: Lesson 2 (Sangkum Reastr Niyum) OCR & KruAI RAG Grounding

Commit: `0720246`. **No database step needed.**

Transcribed and grounded Lesson 2 ("របបសង្គមរាស្ត្រនិយម (1953-1970)" / Sangkum Reastr Niyum) from the official Grade 12 History Q&A compilation by Eng Lay (Hun Sen 10 Makara High School / MoEYS Bac II 2014-2022) (Book pp. 5-10, PDF pp. 8-13).
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/ប្រវត្តិវិទ្យា_អេង_ឡាយ/` and transcribed clean Markdown into `sources/ocr/ប្រវត្តិវិទ្យា_អេង_ឡាយ/lesson2-sangkum-reastr-niyum.md` containing all 5 authentic Bac II questions (2016, 2017, 2018, 2019) and their official scoring keys (អត្រាកំណែ). Covers Sangkum achievements across 4 sectors (politics, economy, education/culture, society), national congress (សមាជជាតិ), neutrality policy (Bandung 1955, UN 1955, Belgrade NAM 1961, Cold War pressure), and violent vs non-violent independence struggle paths (Khmer Issarak vs King Sihanouk's Royal Crusade).
- **RAG Grounding**: Added keyworded chunk `tb:hist:sangkum:ch2:high-yield-bacii-qna` into `HISTORY_CH2_SECTIONS` in `server/textbook-search.ts` with comprehensive bilingual keywords covering exam queries and scoring rubrics. Included in `ALL_HISTORY_SECTIONS` and searchable via `searchHistoryTextbook`.
- **Verification**: Verified with `node scripts/ocr-check.mjs sources/ocr/ប្រវត្តិវិទ្យា_អេង_ឡាយ` (2 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), `npx tsc -b` (0 errors), and `npm test` (all 109 tests passed).



## 10 Nov 2026: Biology Tho Phon Q&A: Chapter 5 DNA & Genetics Calculations OCR & KruAI Grounding

Commit: `c26d912`. **No database step needed.**

Transcribed and grounded the official DNA & Genetics calculation guide and authentic Bac II problem sets from the ជីវវិទ្យា ថូ ភន (Tho Phon Biology Q&A) textbook (Book pp. 88–101, PDF pp. 89–102).
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/biology-qna/` and transcribed clean Markdown into `sources/ocr/biology-qna/chapter5-genetics-dna-exercises.md` (290 lines). Contains the complete 11-formula summary: DNA length $l = \frac{M}{2} \times 0.34\text{ nm}$, steps/spirals $\frac{M}{20}$, Chargaff rules $M = 2A + 2C$, hydrogen bonds $L = 2A + 3C = M + C$, phosphodiester bonds $M - 2$, molecular mass $M \times 300\text{ u}$, replication free nucleotides $M' = M(2^n - 1)$, nucleotide percentages $\%A + \%C = 50\%$, single-strand relations ($A_1 = T_2, C_1 = G_2$), and unit conversions, plus 9 complete Bac II worked calculation problems with full step-by-step mathematical reasoning.
- **RAG Grounding**: Added keyworded chunk `tb:bio:ch5:dna-genetics-calculations-worked-problems` into `BIOLOGY_CH5_SECTIONS` in `server/textbook-search.ts` with comprehensive bilingual keywords for retrieval by KruAI.
- **Verification**: Verified with `node scripts/ocr-check.mjs sources/ocr/biology-qna` (4 pages checked, 0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), `npx tsc -b` (0 errors), `npm test` (all 109 tests passed), and `npm run build` (production build and CSP check passed).


## 10 Nov 2026: Grade 12 History Eng Lay Q&A: Lesson 1 (French Protectorate) OCR & KruAI RAG Grounding

Commit: `c26d912`. **No database step needed.**

Transcribed and grounded Lesson 1 ("ប្រទេសកម្ពុជាក្រោមអាណាព្យាបាលបារាំង (1863-1953)" / French Protectorate) from the official Grade 12 History Q&A compilation by Eng Lay (Hun Sen 10 Makara High School / MoEYS Bac II 2014-2022) (Book pp. 1-4, PDF pp. 4-7).
- **Textbook Rendering & OCR**: Rendered high-resolution scans into `sources/pages/history-qna` and transcribed clean Markdown into `sources/ocr/history-qna/lesson1-french-protectorate.md` containing all 10 authentic Bac II questions (2015, 2016, 2017, 2018, 2021, 2022) and their official scoring keys (អត្រាកំណែ). Covers 9 Nov 1953 independence significance, political/economic/social reasons for seeking French protection under King Ang Duong and Mgr. Miche, positive points (territorial survival, administration/education, infrastructure, EFEO temple conservation, 1904/1907 recovered territories, 1908 Dangrek Map securing 1962 ICJ Preah Vihear victory), and negative points (heavy tax exploitation, social divide, WWI/WWII conscription, antiquities loss, and unilateral loss of Trat 1907, Koh Tral 1939, and Kampuchea Krom 1949).
- **RAG Grounding**: Added keyworded chunk `tb:hist:protectorate:ch1:high-yield-bacii-qna` into `HISTORY_CH1_SECTIONS` in `server/textbook-search.ts` with comprehensive bilingual keywords covering exam queries, scoring rubrics, and historical events. Included in `ALL_HISTORY_SECTIONS` and searchable via `searchHistoryTextbook`.
- **Verification**: Verified with `node scripts/ocr-check.mjs sources/ocr/history-qna` (0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), `npx tsc -b` (0 errors), and `npm test` (all 109 tests passed).



## 10 Nov 2026: Grade 12 Math Chapter 6 (Conics) OCR & KruAI RAG Grounding

Commit: `d06f379`. **No database step needed.**

Digitized Chapter 6 ("កោនិច" / Conics: Parabola, Ellipse, Hyperbola) from the official MoEYS Grade 12 Mathematics Summary textbook (Book pp. 69–77, PDF pp. 72–80).
- **Textbook Rendering & OCR**: Rendered high-resolution scans using `scripts/pdf-to-png.mjs` and transcribed clean Markdown with standard KaTeX formulas into `sources/ocr/Math summary/chapter6-conics.md`. Contains all theory, reference tables, and standard equations for parabolas (vertex $(0, 0)$ and $(h, k)$, focus, directrix $x = -p$ / $y = -p$, open directions), ellipses (center $(0, 0)$ and $(h, k)$, horizontal and vertical major axes, foci $(\pm c, 0)$ / $(0, \pm c)$, vertices, $c^2 = a^2 - b^2$, axis lengths $2a$ and $2b$), hyperbolas (center $(0, 0)$ and $(h, k)$, transverse axes, foci, vertices, $c^2 = a^2 + b^2$, asymptotes $y = \pm \frac{b}{a} x$ / $y = \pm \frac{a}{b} x$), and all 9 authentic MoEYS worked exercises.
- **RAG Grounding**: Added keyworded chunks (`MATH_CH6_SECTIONS` / `MATH_CONICS_SECTIONS`) into `server/textbook-search.ts` covering:
  - `tb:math:conics:ch6:parabola`: Parabola standard forms $y^2 = 4px$, $x^2 = 4py$, $(y - k)^2 = 4p(x - h)$, $(x - h)^2 = 4p(y - k)$, vertex, focus, directrix, and axis of symmetry.
  - `tb:math:conics:ch6:ellipse`: Ellipse standard forms $\frac{x^2}{a^2} + \frac{y^2}{b^2} = 1$, $\frac{(x - h)^2}{a^2} + \frac{(y - k)^2}{b^2} = 1$, center, major/minor axes, vertices, foci, and $c^2 = a^2 - b^2$.
  - `tb:math:conics:ch6:hyperbola`: Hyperbola standard forms $\frac{x^2}{a^2} - \frac{y^2}{b^2} = 1$, $\frac{y^2}{a^2} - \frac{x^2}{b^2} = 1$, transverse/conjugate axes, vertices, foci, $c^2 = a^2 + b^2$, asymptotes, and rectangular box construction.
  Included in `ALL_MATH_SECTIONS` and updated `searchMathTextbook`.
- **Curriculum Sessions**: Registered authentic section titles for Chapter 6 ("កោនិច") in `src/features/practice/quiz-path.ts` under `MATH_LESSONS`: "ប៉ារ៉ាបូល", "អេលីប", "អ៊ីពែបូល".
- **Verification**: Passed `node scripts/ocr-check.mjs sources/ocr/Math summary` (0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), `npx tsc -b` (0 errors), `npm test` (all 109 tests passed), and `npm run build` (production build and CSP check passed).


## 10 Nov 2026: Grade 12 Math Chapter 5 (Complex Numbers) OCR & KruAI RAG Grounding

Commit: `10240dd`. **No database step needed.**

Digitized Chapter 5 ("ចំនួនកុំផ្លិច" / Complex Numbers) from the official MoEYS Grade 12 Mathematics Summary textbook (Book pp. 56–68, PDF pp. 59–71).
- **Textbook Rendering & OCR**: Rendered high-resolution scans using `scripts/pdf-to-png.mjs` and transcribed clean Markdown with standard KaTeX formulas into `sources/ocr/Math summary/chapter5-complex-numbers.md`. Contains all theory and properties for algebraic form $z = a + bi$, real and imaginary parts, complex operations, conjugate $\bar{z} = a - bi$, opposite $-z$, Argand plane representation, modulus $r = \sqrt{a^2 + b^2}$, argument $\varphi$, trigonometric form $z = r(\cos\varphi + i\sin\varphi)$, De Moivre's theorem, $n$-th roots of complex numbers $w_k$, rotation by angle $\alpha$, geometric applications (distances, vectors, midpoints, triangles), and all 14 authentic MoEYS worked exercises (including powers of $i$, cyclicity, complex quadratics, polynomial factorization $z^3 + 8 = 0$, and parametric equations with $\cos\alpha$).
- **RAG Grounding**: Added keyworded chunks (`MATH_CH5_SECTIONS` / `MATH_COMPLEX_NUMBERS_SECTIONS`) into `server/textbook-search.ts` covering:
  - `tb:math:complex:ch5:algebraic-form-operations`: Algebraic form, operations, conjugates, opposites, complex plane affixes, and powers of $i$.
  - `tb:math:complex:ch5:trigonometric-demoivre`: Modulus, argument, trigonometric form, De Moivre's theorem, angle expansions, and center $O$ rotation.
  - `tb:math:complex:ch5:nth-roots-equations`: $n$-th roots of complex numbers, solving $z^n = w$, quadratic equations in $\mathbb{C}$, and trigonometric parameter $\cos\alpha$.
  - `tb:math:complex:ch5:geometry-applications`: Segment distances, vector affixes, midpoints, division by ratio, triangle side/angle ratios, and conditions for real vs. purely imaginary values.
  Included in `ALL_MATH_SECTIONS` and verified with `searchMathTextbook`.
- **Curriculum Sessions**: Registered authentic section titles for Chapter 5 ("ចំនួនកុំផ្លិច") in `src/features/practice/quiz-path.ts` under `MATH_LESSONS`.
- **Verification**: Passed `node scripts/ocr-check.mjs sources/ocr/Math summary` (0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), `npx tsc -b` (0 errors), `npm test` (all 109 tests passed), and `npm run build` (production build and CSP check passed).


## 10 Nov 2026: Grade 12 Math Chapter 4 (Function Variation & Curve Sketching) OCR & KruAI RAG Grounding

Commit: `e97b49a`. **No database step needed.**

Digitized Chapter 4 ("សិក្សាអថេរភាព និង សង់ខ្សែកោង" / Function Variation & Curve Sketching) from the official MoEYS Grade 12 Mathematics Summary textbook (Book pp. 39–55, PDF pp. 42–58).
- **Textbook Rendering & OCR**: Rendered high-resolution scans with zero external API costs using `scripts/pdf-to-png.mjs` and transcribed clean Markdown with standard KaTeX formulas into `sources/ocr/Math summary/chapter4-function-variation-curves.md`. Contains all theory and properties for rational functions, horizontal/vertical/oblique asymptotes, symmetry centers, exponential and logarithmic functions, and 7 authentic MoEYS worked exercises (including degree 2 rational curves, odd logarithmic functions, and the Bac II comprehensive exponential area problem).
- **RAG Grounding**: Added keyworded chunks (`MATH_CH4_SECTIONS` / `MATH_FUNCTION_VARIATION_CURVES_SECTIONS`) into `server/textbook-search.ts` covering:
  - `tb:math:curves:ch4:rational-asymptotes-variations`: Rational function asymptotes (vertical $x = -\frac{q}{p}$, oblique $y = mx + n$), center of symmetry, and table of signs.
  - `tb:math:curves:ch4:degree2-rational-functions`: Degree 2 / Degree 2 rational functions, classification by $\Delta = q^2 - 4pr$, and relative extrema.
  - `tb:math:curves:ch4:logarithmic-functions-and-graphs`: Logarithmic variations, odd symmetry $g(-x) = -g(x)$, tangent lines, and integration by parts.
  - `tb:math:curves:ch4:exponential-comprehensive-problem`: Bac II exam problem on $f(x) = x - e^x$ and $g(x) = (1 - x)e^x$, intermediate value theorem for unique intersection $\alpha \in [1, 2]$ ($1.6 < \alpha < 1.7$), relative curve positions, and bounded area $S = \frac{2(\alpha^3 - 4\alpha^2 + 2\alpha - 12)}{2 - \alpha}\text{ cm}^2$.
  Included in `ALL_MATH_SECTIONS` and verified with `searchMathTextbook`.
- **Curriculum Sessions**: Registered authentic section titles for Chapter 4 ("សិក្សាអថេរភាព និង សង់ខ្សែកោង") in `src/features/practice/quiz-path.ts` under `MATH_LESSONS`.
- **Verification**: Passed `node scripts/ocr-check.mjs sources/ocr/Math summary` (0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), `npx tsc -b` (0 errors), `npm test` (all 109 tests passed), and `npm run build` (production build and CSP check passed).


## 10 Nov 2026: Biology Tho Phon Q&A: Chapter 3 Lesson 1 (Nervous Coordination) OCR & KruAI Grounding

Commit: `f73e712`. **No database step needed.**

Transcribed and grounded Chapter 3 Lesson 1 ("តម្រូវប្រសាទ" / Nervous Coordination) from the official Grade 12 Biology Q&A textbook by Tho Phon (RUPP) (Book pp. 18-33, PDF pp. 19-34).
- **Textbook OCR**: Extracted and transcribed 16 pages of rich content into `sources/ocr/biology-qna/chapter3-lesson1-nervous-system.md` covering invertebrate nervous coordination (Protists, Hydra, Earthworm, Grasshopper), vertebrate nervous systems, neuron morphology and classification (by cytoplasmic process and function), nerve impulse transmission (120m/s) and synapse mechanisms, brain anatomy (Cerebrum, 4 lobes, Thalamus, Hypothalamus, Cerebellum, Brainstem), spinal cord structure and reflex arcs, peripheral nervous system (12 pairs cranial nerves, 31 pairs spinal nerves, sympathetic and parasympathetic systems), effects of drugs (alcohol, caffeine, nicotine), and all 34 authentic Bac II exam Q&As.
- **RAG Grounding**: Added `tb:bio:ch3:nervous-coordination-high-yield-qna` into `BIOLOGY_CH3_SECTIONS` in `server/textbook-search.ts` with comprehensive bilingual keywords covering invertebrate comparisons, telephone ringing 3-neuron workflow, why sharp wounds cause pain, cerebellum damage in alcohol intoxication, and cross-hemispheric control.
- **Verification**: Verified with `node scripts/ocr-check.mjs sources/ocr/biology-qna` (0 warnings across 3 files), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), `npx tsc -b` (0 errors), `npm test` (all 109 tests passed), and `npm run build` (production build and CSP check passed).

## 10 Nov 2026: Biology Tho Phon Q&A: Chapter 1 Lesson 1 (Gymnosperms) OCR, KruAI Grounding & Section Titles

Commit: `667dc8f`. **No database step needed.**

Transcribed and grounded Chapter 1 Lesson 1 ("ស៊ីមណូស្ពែម" / Gymnosperms) from the official Grade 12 Biology Q&A textbook by Tho Phon (RUPP) (Book pp. 1-5, PDF pp. 2-6), bringing Chapter 1 of the book to 100% completion alongside Lesson 2 (Angiosperms).
- **Textbook OCR**: Transcribed clean Markdown into `sources/ocr/biology-qna/chapter1-lesson1-gymnosperms.md` covering etymology, evolutionary origin (Silurian and Devonian of Mid-Paleozoic), the 4 surviving groups (Cycads, Conifers, Ginkgoes, Gnetophytes), vegetative organs (stem and leaf morphs), male and female cones, and all 7 authentic exam Q&As (including the high-yield male vs. female cone comparison).
- **RAG Grounding**: Added `tb:bio:ch1:gymnosperm-high-yield-qna` into `BIOLOGY_CH1_SECTIONS` in `server/textbook-search.ts` with bilingual search keywords (Khmer and Latin) covering male vs. female cone anatomy, gametophytes, pollen grain cells, and life cycle phases.
- **Curriculum Sessions**: Wired authentic section titles for Chapter 1 Lesson 1 into `src/features/lessons/sessions.ts` ("និយមន័យ និងប្រភេទទាំង 4 នៃស៊ីមណូស្ពែម", "សរីរាង្គលូតលាស់ និងការបន្តពូជ", "វដ្តជីវិត និងការប្រៀបធៀបកោន").
- **Verification**: Verified with `node scripts/ocr-check.mjs sources/ocr/biology-qna` (0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), `npx tsc -b` (0 errors), `npm test` (all 109 tests passed), and `npm run build` (production build and CSP check passed).



## 10 Nov 2026: Grade 12 Math Chapter 3 (Definite Integrals) OCR & KruAI RAG Grounding

Commit: `f7d6b95`. **No database step needed.**

Digitized Chapter 3 ("អាំងតេក្រាលកំណត់" / Definite Integrals) from the official MoEYS Grade 12 Mathematics Summary textbook (Book pp. 31–38, PDF pp. 34–41).
- **Textbook Rendering & OCR**: Rendered high-resolution scans with zero external API costs using `scripts/pdf-to-png.mjs` and transcribed clean Markdown with standard KaTeX formulas into `sources/ocr/Math summary/chapter3-definite-integrals.md`. Contains all fundamental definitions, Chasles' relation, linearity properties, integration by parts formula, power-reduction trigonometric integrals, rational fraction decomposition, parametric limit integrals, and 10 authentic MoEYS worked exercises.
- **RAG Grounding**: Added keyworded chunks (`MATH_CH3_SECTIONS` / `MATH_DEFINITE_INTEGRALS_SECTIONS`) into `server/textbook-search.ts` covering:
  - `tb:math:integrals:ch3:rules-and-properties`: Fundamental definition, identical limits, sign flipping, Chasles' relation, and linearity.
  - `tb:math:integrals:ch3:rational-and-substitution`: Composite substitution $u'/u$ and partial fraction decomposition.
  - `tb:math:integrals:ch3:integration-by-parts`: Integration by parts formula ($\int u\,dv = [uv] - \int v\,du$) applied to $\ln x$ and $x\sin^3 x$.
  - `tb:math:integrals:ch3:trigonometric-integrals`: Even-power reduction for $\sin^4 x$, $u^n u'$ product form for $\sin^4 x \cos x$, and symmetric system calculation for $I + J$ and $I - J$.
  - `tb:math:integrals:ch3:log-exp-and-limits`: Logarithmic integrals ($\frac{\ln x}{x}$ and $\frac{1}{x\ln x}$) and parametric integral limits ($\lim_{\alpha \to 1^-} g(\alpha) = 1$).
  Included in `ALL_MATH_SECTIONS` and verified with `searchMathTextbook`.
- **Curriculum Sessions**: Registered authentic section titles for Chapter 3 ("អាំងតេក្រាលកំណត់") in `src/features/practice/quiz-path.ts` under `MATH_LESSONS`.
- **Verification**: Passed `node scripts/ocr-check.mjs sources/ocr/Math summary` (0 warnings), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), `npx tsc -b` (0 errors), `npm test` (all 109 tests passed), and `npm run build` (production build and CSP checks passed).

Commit: `c222b09`. **No database step needed.**

Transcribed and processed Chapter 6 ("ការវិវត្តនៃភវៈរស់" / Evolution of Living Things) from the official MoEYS Grade 12 Biology Summary textbook (pp. 51-56), completing the entire 56-page summary book.
- **Textbook OCR**: Authored structured markdown transcriptions in `sources/ocr/biology-summary/chapter6/`:
  - `lesson1-darwin-theory.md` (pp. 51-52: Darwin's Beagle voyage, Galapagos observations, finch beaks, adaptations, natural and artificial selection).
  - `lesson2-evidence-of-evolution.md` (pp. 53-54: comparative embryology, homologous organs, biochemical/DNA and protein evidence, speciation, geographic and biological isolation).
  - `lesson3-fossil-records.md` (pp. 54-56: sedimentary rock formation, petrification, mold and cast, whole body preservation, relative dating, C14 dating 5,700-year half-life, Radium/Lead dating, importance of fossils).
- **RAG Grounding**: Added `BIOLOGY_CH6_SECTIONS` into `server/textbook-search.ts` and registered them in `ALL_BIOLOGY_SECTIONS` and `searchBiologyTextbook`.
- **Curriculum Sessions**: Wired authentic section titles for Chapter 6 into `src/features/lessons/sessions.ts` under `biology`.
- **Practice Flashcards**: Authored 30 high-yield flashcards across 3 decks (`biology-6-1`, `biology-6-2`, `biology-6-3`) in `content/new/biology-ch6.json` and merged into `content/fixture.json`.
- **Verification**: Verified with `npm run check:content` (0 errors), `npm run check:digits` (0 Khmer numerals across all 363 files), `npx oxlint` (0 errors), `npx tsc -b` (0 errors), and `npm test` (all 109 tests passed).


## 6 Nov 2026: Teacher Papers on the Mock Exam Page

Commit: `0790d3f`. **Database step:** run `20261106000001` in the SQL editor before importing the
first teacher paper (see `supabase/README.md`).

The Mock Exam page's second tab, **វិញ្ញាសារបង្កើតថ្មី**, now holds teacher papers: whole papers
written by teachers in the Bac II format, based on the past exams. Each subject can have many. A
student taps a subject, sees its list (**វិញ្ញាសារទី 1**, **វិញ្ញាសារទី 2**…), and sits one exactly
like a past paper: the rules, the timer, the history and the answer review. Each paper in the list
shows the student's best score. Until a subject has papers, its card says ឆាប់ៗនេះ.

Teacher papers are written as files (`content/README.md`, "Writing a teacher paper") and imported on
Admin → Content like every paper. That admin tab is now called **Papers** (វិញ្ញាសារ). They count in
the Mock Exam page's "papers done" and average. They are not added to Home's study list or the
Roadmap, since there can be hundreds.

**To re-test, please:** after the first teacher paper is published, open Mock Exam → វិញ្ញាសារតាមមុខវិជ្ជា
→ វិញ្ញាសារបង្កើតថ្មី, tap that subject, open a paper, finish it, then go back and check the list shows
your score and the back button returns to the list. A subject with no papers should say ឆាប់ៗនេះ.

## 6 Nov 2026: Feedback Explains Before Opening Telegram

Commit: `ba2e64d`. No database step.

Tapping the Feedback button in the corner used to jump straight to Telegram. Now it first shows a
short box explaining what to send: what went wrong, which page, and a screenshot if possible. It also
shows the Telegram name the message goes to. **Open Telegram** in the box goes to our chat, and **Not
now** closes it.

**To re-test, please:** tap the Feedback button, read the box, tap Open Telegram, and check Telegram
opens on our chat. Tap the button again and close the box with Not now.

## 6 Nov 2026: Tap Anywhere on the Install Card

Commit: `97f32d5`. No database step.

On Profile, the Install BrachNha card used to work only when the small purple Install button was
tapped. Now a tap anywhere on the card works: the icon, the title or the words.

**To re-test, please:** on Profile, tap the words on the Install card instead of the button. It should
do the same as the button.

## 6 Nov 2026: KruAI Is Off for Now, and the Corner Button Sends Feedback

Commit: `8e8bcf6`. No database step.

- **KruAI is switched off**, because we do not want to pay for the AI yet. The chat cannot be opened
  anywhere, and the server refuses every question, so nothing is spent. Nothing was deleted: students'
  old KruAI conversations, the limits and the Admin KruAI page all come back when it is switched on.
- **The round button in the corner is now Feedback.** It opens a Telegram chat with the team, so any
  student, signed in or not, can tell us what is wrong. It sits where the KruAI button was, and is
  hidden during exams and Battles, as before.
- **The sign-up form no longer mentions the AI coach** while KruAI is off.

**To re-test, please:** on Home, tap the round button in the corner. Telegram should open on our chat.
Check there is no way to open KruAI anywhere. Start a Battle and check the button is not shown while
playing.

## 6 Nov 2026: Install BrachNha From the Profile Page

Commit: `a6cdd00`. No database step.

Profile now has an **Install BrachNha** card, so a student can put the app on their home screen
whenever they want, not only when the install pop-up happens to appear.

- **On Android**, tapping Install opens the phone's own install box.
- **On an iPhone**, which has no install button for websites, it shows the two steps: tap Share, then
  Add to Home Screen.
- **Inside Telegram or Messenger**, which cannot install apps, it offers to open BrachNha in Chrome or
  Safari, and shows how to do it by hand if Telegram does not let it.
- **The card does not show** once the app is installed, or in a browser that cannot install it.

The automatic pop-up works as before.

**To re-test, please:** on an Android phone in Chrome, open Profile and tap Install. On an iPhone in
Safari, tap Install and check the two steps. Open a BrachNha link inside Telegram, go to Profile and
tap Open in Browser. After installing, the card should be gone.

## 6 Nov 2026: More Security Fixes, and the Privacy Page Mentions KruAI Photos

Commit: `7787ada`. No database step.

- **The privacy page now says photos are sent to the AI.** When a student attaches a photo to a KruAI
  question, the photo goes to Google Gemini with the question. The page listed everything else that is
  sent but not the photo. It now says so in English and in Khmer.
- **KruAI can no longer be made to hold a huge message in memory.** A request with no stated size was read
  in full before the size limit was checked. It is now stopped as soon as it passes the limit.
- **A developer tool was updated** to fix two known problems that affect only developers' computers,
  not the site.

Decided, nothing changed: a technical person could still fake a Battle result, which gains them nothing the app counts. Crash reports from guests are still collected, because without them crashes
that only guests hit would go unseen. The production KruAI key is on Google's paid service, which is
what the privacy page promises.

**To re-test, please:** ask KruAI a normal question and one with a photo; both should answer as before.
Read the Privacy page in Khmer and check the new sentence about KruAI.

## 6 Nov 2026: Security Fixes Before Launch

Commit: `0a65475`. No database step. The one dashboard step is done.

A security review before launch found these. Fixed in the app:

- **Diagrams could carry hidden page code.** The guard that cleans the drawings in lessons and papers
  missed two tricks that let other page parts out of a drawing. The site's security settings already
  stopped any code from running, so nobody could have been signed in as someone else, but a fake box
  or link could have been shown. It is closed now and checked automatically. Diagrams look the same.
- **KruAI's daily total can run out early.** All students share one daily total, so about ten
  accounts using their own limit fully could switch KruAI off for everyone until midnight. The
  Admin KruAI page now shows a yellow warning at half of the total and a pink one at 80% and when
  it is used up, so the owner can look at who is using it and raise the total.

Decided, nothing changed: photos of working that students added to Battles before photos were turned
off can still be seen by people who play that Battle. That is how Battles were designed.

**Fixed in the dashboard:** the sign-in settings in Supabase allowed any Vercel website to receive a
student's sign-in. They now allow only the real site and a developer's own computer. Sign-in on a
test (preview) version of the site no longer works, on purpose.

**To re-test, please:** sign in with Google on the live site, and once from a friend's invite link.
Open a lesson or past paper with a graph and check it draws as before. On Admin, KruAI, the Today
card shows no warning while less than half the total is used.

## 5 Nov 2026: Flashcard Back Button Fixed

Commit: `a96099f`. No database step.

On flashcards, tapping Back to re-read a card and then grading it again counted the card twice: the summary could say 7 cards for
a 6-card deck, the XP was paid again, and the card's next review date moved further than it should. Doing it over and over gave
free XP. Now grading a card that was already graded just moves on. To change a rating, grade the card the next time it comes round.

The automatic checks now also cover flashcards, practice quizzes and the 2-day Simulation, which is how this was found.

**To re-test, please:** in a flashcard deck, grade two cards, tap Back, grade again, and finish. The summary should count each
card once.

## 5 Nov 2026: Battle Limit Fixed, Student Questions Kept on the Paid Key, Screen Reader Labels

Commit: `e2adc00`, with the Battle limit in `affaa42`. **Database step:** run
`20261105000001_battle_cap_day_fix.sql` in the Supabase SQL editor. The app works before or after.

- **The 20 Battles a day limit had a bug.** It counted from 2 pm Phnom Penh time instead of midnight, so before 2 pm
  each day there was no limit at all. It counts from midnight now.
- **KruAI now uses only the one main key on the live site.** If an old free key were still saved on Vercel, some students'
  questions could have gone through it. Now it would simply be ignored.
- **Screen readers can find their way around.** Every screen now has a marked main section and a main heading, for
  students who have the phone read the screen aloud.

**Students should not notice any difference.** Old and new screens were compared pixel by pixel.

**To re-test, please:** ask KruAI one question on the live site. If it says it is temporarily unavailable, the paid key on
Vercel is saved under a different name, and it needs to be `GEMINI_API_KEY`.

## 4 Nov 2026: Faster First Screen, and the 3D Lesson Saves Data

Commit: `6ed52e2`. No database step.

Measured on a simulated cheap phone, since no real one has been tested yet:

- **The logo now shows straight away** instead of an empty screen, at about 1 second on ordinary 4G and about
  3 on a poor signal. It was about 3 and 7. The real screen arrives at the same time as before, so the wait is
  no shorter, it just no longer looks broken.
- **The 3D brain lesson (Biology 3.1.1) now waits for a tap.** It used to download 4.7 MB as soon as it opened.
  It now uses under 1 MB until the student taps the model, which adds about 1 MB, and the tile says so. The
  model file went from 3.8 MB to 861 KB and looks the same.
- **If the 3D download fails,** the student sees a short message with a button to try again, and keeps their lesson.

**To re-test, please:** on a phone, open the app fresh and look for the logo. Open Biology 3.1.1, tap the 3D tile,
and check the brain appears, turns when dragged, and names a part when tapped. Please also read the new Khmer on
the tile and on the failure message, and change it if it sounds wrong.

## 4 Nov 2026: Easier-to-Read Colours

Commit: `dacf8c6`. No database step.

Some text was too pale to read on a phone in sunlight: green, yellow and pink words on white, white words on
the bright lesson banners, grey "coming soon" labels and faint calendar dates. A scan of 22 screens found 153
such spots across light and dark mode. Now 10 are left, all on subject cards that are greyed out on purpose
because they are not available yet.

**What students will notice:** coloured text is a little deeper (green, pink, blue), yellow text is now amber,
and the lesson banners on the Lessons and Quiz paths are a deeper shade of the subject's colour. Icons, buttons,
progress bars and backgrounds keep their bright colours. The browser tab now reads "BrachNha: Bac II AI Mentor".

**To re-test, please:** open Home, Lessons, a subject path, Practice, Profile and Streak in light and dark mode,
and check the colours still feel like BrachNha. If any looks wrong, tell the developer which screen.

## 3 Nov 2026: Limit on Rows per Student

Commit: `c7c2db7`. **Database step:** run `20261103000009_row_limits_per_student.sql` in the Supabase
SQL editor. Nothing in the app changed, so it works before or after.

A script could keep adding rows to its own account until the database ran out of space. Now each student
has a limit in each table, set well above what the app ever saves. Over it, that student's oldest rows are
removed. Nothing is refused, so a student's saving cannot break because of this.

**Students should not notice any difference.**

**Still worth knowing:** one account made to fill everything could use about 300 MB at the very worst, so
it is worth glancing at the database size now and then. Removing that account deletes all of it.

**To re-test, please:** use KruAI and finish a quiz, then sign in on another phone and check your chats and
progress come back.

## 3 Nov 2026: Three Small Security Fixes

Commit: `9eebd55`. **Database step:** run `20261103000008_close_small_gaps.sql` in the Supabase SQL
editor. The app works before or after.

- **Photo uploads closed.** The Battle photo feature was already off in the app, but the database still
  accepted uploads from anyone calling it directly. Old photos can still be read and deleted.
- **Hidden content is really hidden.** Content hidden on Admin → Content could still be downloaded by
  someone asking for it by name. Now it cannot, until it is published again. A phone that already
  downloaded it keeps its copy.
- **The error log cannot grow forever.** Errors older than 45 days are deleted, and there is now a daily
  limit on how many can be saved.

**Students should not notice any difference.** One rare case: if a paper is hidden while a student is
sitting a Simulation, that paper says it needs internet until it is published again.

**To re-test, please:** open a lesson, a quiz and a past paper, and reopen an old attempt from a paper's
history. Hide something on Admin → Content and check it is gone for a student, then publish it again.

## 3 Nov 2026: Limits on Fake XP

Commit: `01c46e6`. **Database step:** run `20261103000007_progress_number_limits.sql` in the Supabase
SQL editor. Nothing in the app changed, so it works before or after.

Someone with technical skill could write any XP number or mark months of old days as studied, and go
straight to the top of the leaderboard. Now the database holds these numbers to what is possible: 5000 XP
a day, 16 study hours a day, no more total than the account's age allows, and no marking days from more
than about two weeks ago.

**This limits cheating, it does not end it.** A patient cheater who claims the most they can every day
could still lead the board. If that happens, remove their account on the admin page.

**Students should not notice any difference.** The limits are far above real study, and numbers on a
student's own phone never go down.

**To re-test, please:** after running the step, finish a quiz and check your XP goes up as usual, on your
phone and on another account's leaderboard.

## 3 Nov 2026: Limits on Long Text and Battles a Day

Commit: `c9bbcb6`. **Database step:** run `20261103000006_text_limits_and_battle_cap.sql` in the
Supabase SQL editor. The app and this step work in either order.

Before this, someone with technical skill could skip the app's screens and save a name of a million
letters, which everyone opening the leaderboard would then download, or post thousands of Battles to
fill the list. Now a name stops at 40 letters and text elsewhere has limits far above real use. Text
that is too long is cut rather than rejected, so a student's saving can never break because of it.

A student can share 20 new Battles a day. The 21st is still played and kept on the phone, the screen
says it is today's limit, and it shares by itself when they open Battles the next day.

**Students should not notice any difference in normal use.** The name boxes now stop at 40 letters.

**To re-test, please:** change your name on Profile and try typing more than 40 letters. Check your
name still shows correctly on the leaderboard. The 20 a day limit is not worth testing by hand.

## 3 Nov 2026: Security Headers

Commit: `465511e`. No database step.

The site now tells browsers what it is allowed to do. If a bug ever let someone sneak code onto a page,
the browser would refuse to run it or send data elsewhere. Other websites also can no longer embed
BrachNha and trick students into tapping it. No such bug is known: this is a safety net.

**Students should not notice any difference.**

**To re-test, please, on the live site:** sign in with Google, open a lesson with a video and play it,
ask KruAI a maths question, open the maths keyboard, and check Khmer text looks right. If something
that used to load has stopped loading, tell the developer which screen.

## 3 Nov 2026: Battles Can Only Hold Real Questions

Commit: `79f6b82`. **Database step: run `20261103000005_competition_writes_checked.sql` in the
SQL editor BEFORE this deploys.**

A security review found that someone with technical skill could skip the app and post a Battle with
any text and any creator name, which other students would then read. Most students are under 18, so
this was a way to bully someone under an official-looking name.

Now the database only accepts questions from your published pool. It takes the name from the
student's account and works out the score itself, so faked Battle scores are closed too.

**Students will not notice any difference.** Creating and joining Battles works as before.

**Still open from the review:** display names are still free text, and there are no size limits yet.

**To re-test:** create a Battle on one account, and join it from another. Both scores should appear
as normal.

## 3 Nov 2026: Practice What I Got Wrong

Commit: `f7bb3d8`. **Database step: run `20261103000004_question_mistakes.sql` in the SQL
editor.** It can be done before or after this deploys. Until it is, the list stays on the
student's phone and is not saved to their account.

Students now have a list of the questions they got wrong, and can practise just those.

- **How a question gets on the list:** answering it wrong in a practice quiz, a lesson section, a
  past paper or the Simulation. Questions left blank do not count, and neither do Battles.
- **How it comes off:** answering it right once, anywhere.
- **Practising:** up to 20 questions at a time, the most-missed first, with the same explanations
  as the original question. A right answer earns the usual XP.
- **Where to find it:** a card at the top of Flashcards & Quiz, which only appears when there is
  something on the list, and the "កំហុស" node on each lesson's path, which until now said "coming
  soon".
- The privacy page now says this list is saved.

**To re-test:** get a quiz question wrong on purpose, then open Flashcards & Quiz. Practise it and
get it right, and check it leaves the list.

## 3 Nov 2026 — A streak protection now costs 200 coins

Commit: `55ed58c`.

**What changed.** Buying a streak protection on the Streak page now costs 200 coins instead of 50,
so it takes several days of study to save up for one.

**What to re-test.** With fewer than 200 coins the Streak page should say how many more are needed,
with no button. With 200 or more, buying one should take exactly 200.

## 3 Nov 2026 — Streak protection, and a surprise gift

Commit: `71d2be6`. **Database step: run `20261103000003_streak_protection.sql` in the SQL editor
BEFORE this deploys.** Without it, the app cannot save students' progress to their accounts.

**What changed.**

- **Streak protection is new.** It keeps a streak alive when a student misses a day. It works by
  itself, and the next time they open the app it says "Your streak was protected yesterday".
- **The streak stays the same on that day.** It does not go up, because nobody studied.
- **A student can hold 2 at most.** The Streak page shows how many they have.
- **Coins can now be spent.** One protection costs 50 coins on the Streak page. This is the first
  thing coins can buy.
- **The gift is now a surprise.** Instead of always 50 XP and 12 coins, it gives 30 to 100 XP with
  coins to match, and about 1 gift in 5 also holds a protection.
- **Friends are covered too.** If a friend misses a day and a protection covers it, the shared
  streak survives.
- **The calendars show it.** A protected day has a shield on the Streak page, the shared week and
  the Profile calendar.

**Good to know.**

- Two missed days with only one protection uses none, and the streak breaks, because spending it
  would not have saved anything.
- Buying one after a streak has already broken does not bring it back. It only protects the days
  ahead.
- A friend can now see which days a protection covered. The privacy page says so.
- The price, the gift amounts and the 1 in 5 chance are easy to change.

**What to re-test.**

- With 50 or more coins, buy one on the Streak page. Coins should drop by 50, and the count should
  go up. At 2 the button should go away.
- Finish all 4 missions and open the gift a few times over several days. The amount should change.
- Please read the new Khmer wording on the Streak page card and the gift line.

## 3 Nov 2026: KruAI Fixes From Its First Test

Commit: `a80df57`. No database step.

A new test set asks KruAI 35 real questions and checks the answers. It found these, now fixed:

- **Answers that stopped halfway.** About 1 answer in 17 could end mid-sentence with no warning.
  Now it says the connection dropped and offers a Try again button.
- **Khmer numerals in answers.** Numbers are now always converted to 0-9.
- **Long solutions after guiding.** If KruAI has already guided an exercise, the full solution is
  now the short form: method, exam answer and tip.
- **Calling a wrong answer "almost right".** KruAI now says kindly that it is not right yet.
- **Formulas showing as raw code.** A Khmer word inside a chemical equation broke the whole
  formula. It now displays properly.

**Not fixed: KruAI can still occasionally get maths wrong.** On one limit from the 2025 paper it
made a sign error once in 6 tries. Students should not treat every answer as certain.

**To re-test:** ask KruAI an exercise, press "show full solution" and check it is short. Give a
wrong answer and check it does not say "almost right". A cut-off answer is rare and cannot be
triggered on purpose.

## 3 Nov 2026 — A section counts once a day, and the pledge says sections

Commit: `94894b2`.

**What changed.**

- **Finishing the same section twice in one day now counts once** toward the lesson mission.
  Before, a student could repeat one easy section to tick the mission. It counts again the next
  day, so going back over old sections still helps.
- **A repeat says why.** If the mission is not done yet, the completion screen tells the student
  this section has already counted today and to study a different one.
- **The signed pledge now says "sections"** (`ផ្នែកមេរៀន`), to match the missions card.

**Good to know.** The list of today's sections stays on the phone, so a student using two phones
could still count one section twice. That was judged not worth a database change.

**What to re-test.** With "Complete 2 sections" showing, finish a section, then finish the same
one again: the count should stay at 1/2 and the note should appear. Finish a different section: it
should reach 2/2. Please read the new Khmer note and check the wording.

## 3 Nov 2026 — The lesson mission now says "sections"

Commit: `9dd117d`.

**What changed.** The lesson row on Today's Missions now reads "Complete 2 sections"
(`បញ្ចប់ 2 ផ្នែកមេរៀន`) instead of "Complete 2 lessons". When the target is one, it reads
"Complete a section" (`បញ្ចប់ផ្នែកមេរៀន`).

**Why.** The mission has always counted finished sections, and a lesson is made of several
sections. So the old name promised more than it asked. How it counts has not changed.

**What to re-test.** Read the row on Home and on the Roadmap, in both languages and on a small
phone, and check it still sits neatly on its line.

## 3 Nov 2026: The Simulation Must Be Finished Within 2 Days

Commit: `7107e71`. No database step.

Students can sit the papers at any hours they like, but must finish them all within 48 hours
of starting their first paper. Before this there was no limit, so an attempt could drag on
for weeks.

- **The 48 hours start with the first paper**, not when the screen opens. A countdown shows
  how long is left.
- **All seven in one day is allowed.** Day 1 and Day 2 are now just the order of the papers.
- **If time runs out, the papers not sat score 0.** The student still gets a grade and can
  review what they did sit.
- **A paper running when the 48 hours end keeps its own timer**, so nobody is cut off mid-paper.

**To re-test:** this needs a test run left for 2 days, or ask for the clock to be faked. The
countdown can be checked straight away after starting a first paper.

## 3 Nov 2026: The 2-Day Bac II Simulation Works, Waiting for Its Papers

Commit: `dd6c44e`. **Database step: run `20261103000002_simulation_attempts.sql` in the
SQL editor.** It can be done before or after this deploys. Until it is, an attempt stays on
the student's phone and is not saved to their account.

The Simulation card used to lead to a briefing page whose button only opened the normal
list of papers. The two-day exam itself now exists.

**What it does**

- A student sits all seven subjects in order, four on Day 1 and three on Day 2. Day 2 opens
  once Day 1 is finished, on any date.
- Each paper has its own timer that never stops, even if the app is closed. KruAI and the
  menu are hidden while a paper is on screen.
- Progress saves after every answer. Closing the app and coming back counts as leaving the
  exam, and leaving too many times ends that paper, keeping what was answered.
- At the end the student gets one grade (A to F), marks for each subject, and a review of
  every question. Nothing is scored until then.

**What students see today: "coming soon".** Only 2 of the 7 subjects have a paper, so the
card says coming soon and there is no Start button. **It switches on by itself** when the
last paper is published on Admin → Content, with no code change. Admins can already start a
test run with the papers that exist, and it is marked as a test.

**Good to know**

- **The grade is an estimate, and the result screen says so.** The app can only mark tapped
  answers, so it scales the share of questions right up to each subject's real marks.
- **Please check the timetable** (subjects, times and points). It is what the briefing page
  already said and has not been compared with the Ministry's.
- **Please read the new Khmer wording.** The briefing page itself is still mostly in English.
- The privacy page now mentions simulation attempts.

**To re-test:** as an admin, open Mock Exam → the Simulation card and start a test run. Answer
a question, close the app, come back, and check the timer kept running and the answer is
still there. Finish it and open the review.

## 3 Nov 2026: Daily Targets, an Easier Streak and a Daily Gift

Commit: `eb12fe8` and `457c65f`. **Database step: run `20261103000001_daily_targets_and_gift.sql` in the
Supabase SQL editor BEFORE this goes live.**

**What changed:**

- **Missions now have daily targets** from the student's target grade and the time left. A
  grade A student today sees "Complete 3 lessons" and "Complete 2 quizzes", with a count such
  as 1/3. Flashcards and the daily challenge stay at one. Any lesson or quiz counts.
- **Finishing any 1 mission keeps the streak.** That means one full row: for grade A, 3
  lessons or 2 quizzes, or 1 flashcard review, or 1 daily challenge. It used to need a lesson,
  a quiz and flashcards on the same day, so a student who did ten quizzes got no streak.
  Streak with Friends and the Leaderboard follow the same rule.
- **Reaching all 4 missions opens a gift**: +50 XP and 12 coins, once a day. A gift left
  unopened is paid the next day, so nobody loses it.
- A flashcard review needs at least 5 cards, or the whole deck if it is smaller. A shorter
  review still earns XP per card, and the screen explains why the mission did not tick.
- The recommended hours on the Roadmap now come from the same sum as the targets, so grade A
  shows 2.5 hours today and at most 4 near the exam. New pledges use the same numbers;
  pledges already signed keep what the student agreed to.

**Nobody's past changes:** days that met the old goal still count, and days that did not stay
as they were.

**Worth knowing:** there are only 29 lessons, quizzes and decks published, so students can run
out at these targets. That was accepted, because more content is coming. Coins still cannot
be spent on anything.

**What to re-test:**

- As grade A, do one quiz: it should read 1/2 with no streak yet. A second quiz should tick
  the mission and light up the streak.
- Finish all 4 missions and open the gift, on Home.
- Two friends who each finish one mission: their shared streak should move.
- The new Khmer wording, which nobody has read through yet.

## 2 Nov 2026: One Missions Card

Commit: `a042da4`. No database step.

**What changed:**

- The Roadmap now shows the same **Today's Missions** card as Home: all 4 missions, line
  icons and +20 XP. It replaces the Daily Mission card added earlier today. The current
  month's page shows it too.
- No lesson is named on a mission, because any lesson, quiz or flashcard review earns the
  XP. Tapping a mission still opens a suggested next item.

**What to re-test:**

- Finish a mission and check it ticks on both Home and the Roadmap.

## 2 Nov 2026: The Roadmap Is a Real Plan

Commit: `0524b8e`. No database step.

**What changed:**

- The path now shows **real months** (November 2026 to August 2027) instead of "Month 1,
  Month 2", and marks the current one. It used to say "Month 1, Start now" for ever.
- Months are filled with **real lessons, flashcard decks and quizzes**, hardest subject
  first. That means real scores once a student has them, and the survey answers until
  then. Past papers wait for the exam month.
- **Tap a month** to see its list, with finished items ticked. Each item opens directly.
  The current month also has a "Today" box, and the exam month has the Bac II Simulation.
- **Missed work moves forward by itself**, so nobody falls behind. Past months show what
  was finished. They don't list what was skipped, because those items are in the current
  month.
- **Daily Mission tells the truth**: it names the next lesson, quiz and flashcards and goes
  straight to them, as Home does. It used to say "20 Practice today" when one quiz ticked it.
- The recommended hours now show the **minutes really studied today**.
- On the Khmer page, "Target Grade" is translated, "Flashcard" is spelled the usual way,
  and "Bac II" no longer turns into "BAC II".
- A weak subject with no lessons yet is mentioned once above the path.

**What did not change:** the look of the path (the glow, discs and emoji), on request. The
signed pledge still quotes "3 lessons, 20 questions" as its goal.

**What to re-test:**

- With a real account that has real history: do past months and ticks look right?
- With a brand-new account: after the survey, does the plan start on the weak subjects?
- The new Khmer wording, which nobody has read through yet.

## 2 Nov 2026: Add a Friend With a Link or QR Code

Commit: `7d3d84e`. **Database step: run `20261102000001_friend_invite.sql` in the Supabase
SQL editor BEFORE this goes live.**

**What changed:**

- **Add a friend** has a new button, **Invite with a link or QR code** (អញ្ជើញតាមតំណ ឬកូដ
  QR). It shows a QR code and a link you can copy or share to Telegram. Searching by name
  still works; this is for when a name won't search, or two people share a name.
- Opening someone's link shows their name and an **Add** button. Nothing is sent until you
  tap Add, and they still have to accept, so a link passed on to a stranger gives the
  stranger nothing.
- While your QR code is on screen, a request from the friend beside you appears by itself
  within about 5 seconds, ready to accept.
- A classmate with no account can use the link too: they sign in, answer the survey, and
  land back on your invite rather than on the Roadmap.
- With no friends yet, the page now opens on **Add a friend**, without the empty "Your
  friends" card above it.
- The privacy page now says that a signed-in student can open your invite link.

**What to re-test:**

- With two phones on the live site: A opens the QR code, B scans it, B taps Add, A taps
  Accept. This could not be tested without the live site and real cameras.
- Send the link on Telegram to someone with no account, and check they end up back on the
  invite after signing in. If they land on Home instead, Supabase's Redirect URLs list needs
  to allow `/friend/` (see `supabase/README.md`).
- The new Khmer wording, which nobody has read through yet.
- The Game's Invite button, which now shares this panel. It should look the same as before.

## 28 Oct 2026: The Questions Count Is Real

Commit: `1a40b5f`. No database step.

**What changed:**

- The four numbers at the top of **Home** and **Profile**: the last one, "Questions", was
  stuck at 0 for every student. It only counted mock exams, and no mock exam has
  questions yet. It now counts every question answered (lesson sections, quizzes, past
  papers), the same number the Progress page shows. Flashcards don't count, since they
  are not scored. The line under it now says "answered" (បានឆ្លើយ).
- The Streak number is labelled **Streak** in Khmer too (it said ជួរ), on Home, Profile
  and the Leaderboard's Streak tab, matching the rest of the app.
- The lines between those four numbers are solid black now, like every other card.

**To re-test:** answer a few quiz questions, then check the Questions number on Home and
Profile goes up by that many and matches Progress. Switch to Khmer and check the label
says Streak.

## 28 Oct 2026: Roadmap Is Back in the Menu

Commit: `1b387af`. No database step.

**What changed:** the menu (the drawer on a phone, the sidebar on a laptop) has a
**Roadmap** row again, directly under **Streak with Friends**. Home's "Quest Map" chip
still opens it too.

**To re-test:** open the menu, check Roadmap sits under Streak with Friends, tap it. A
guest should see the "sign in" panel with the menu still there.

## 27 Oct 2026: Grade Prediction Can Say F, and Is Fairer to Beginners

Commit: `dc6c351`. No database step.

**Why.** Two problems with the predicted grade:
- It could never say F. A student getting 20% of answers right was told E, which is a pass.
- It mixed "how well you answer" with "how much of the app you've finished". A beginner
  answering 85% right was predicted an E because they had only finished a few lessons, and
  every new lesson the team published made everyone's predicted grade go down.

**What changed:**
- Below 50% is now **F**. It shows on the big grade, in each subject's grade, as a sixth bar
  in the chance chart, and as "Below your target". The survey still only offers A to E as a
  target, since nobody aims for F.
- The grade now comes from how well the student answers: quiz accuracy and exam results.
  Studying regularly and improving lately add a few points (at most 8 together), and slacking
  takes a few away. Finished lessons no longer count, so publishing new content no longer
  lowers anyone's grade.
- The chance bars are worked out more sensibly. A score of 45 now shows mostly F with some E,
  not "100% E".

**What students will notice:** strong beginners see a higher grade than before, and weak
students may now see F.

**Re-test:** with a few wrong answers in a row, Grade Prediction should show F and "Below your
target", and Home's grade card should show the same letter. With mostly right answers it
should show A or B even with only a few lessons done.

## 27 Oct 2026: Battle Photos Turned Off

Commit: `ad8434f`. No database step.

**Why.** After a Battle, students could photograph their working for each question, and those
photos were filling up the app's storage.

**What changed:**
- After a Battle the review goes straight to the answers. There is no "photograph your
  working" step, no photos under the questions, and no "Report photo" button.
- Nothing is uploaded or downloaded any more.
- The feature is switched off, not deleted, so it can come back with a one-line change.

**To actually free the space:** the photos already uploaded are still stored. Delete them in
Supabase → Storage → `competition-work` (select all, delete). Nothing in the app needs them.

**Re-test:** finish a Battle: after the result, "See the answers" should open the answers
directly, with no photo step.

## 27 Oct 2026: A New "Section Finished" Screen

Commit: `26f5d62`. No database step.

**Why.** After a lesson section the screen showed a trophy, a fixed "+20 XP" and one button
back. The XP number was often wrong, and the screen did not say what to do next.

**What changed:** the screen now shows, top to bottom:
- a yellow card: "បញ្ចប់ផ្នែកនេះ!" with the section's number and name;
- three numbers, all real: questions right (e.g. 4/5), XP and coins actually earned in the
  section, and the time spent;
- the lesson's progress (e.g. "1/7 ផ្នែក"), counted the same way as on the lesson path;
- today's goal (lesson, Quiz, Flashcard): done ones ticked, open ones are links, and a line
  saying how many are left to keep the Streak;
- two buttons: back to the lesson path, and **ផ្នែកបន្ទាប់** (the next published section).
  When there is no next section, only the path button shows.

**Re-test:** finish a biology section with one answer wrong: check the numbers, tap Quiz or
Flashcard in the goal card, and tap ផ្នែកបន្ទាប់ to land at the start of the next section.

## 27 Oct 2026: Quiz "Try Again" Repeats Only the Wrong Questions

Commit: `7639a99`. No database step.

**Why.** After a quiz, "Try again" made the student answer all 10 questions again, even the
ones they already got right, to reach the few they missed.

**What changed:**
- The button on the results screen is now **ធ្វើសំណួរខុសម្តងទៀត (N)**: it runs only the
  questions answered wrong (or left unanswered). The results after it keep the real question
  numbers (សំណួរ 2, 3, 5…), and if some are still wrong the button offers those again.
- When nothing is wrong, the button is the usual **ធ្វើម្តងទៀត** (the whole quiz). The whole
  quiz is also always on the section's own screen.
- A wrong-only retry does not count as a new attempt: it is not added to the quiz history or
  the best score, and it does not tick the daily practice task. Correct answers still earn XP.

**Re-test:** finish a maths quiz with a few wrong, press the new button, check only those
questions come back, then check the history on the section's screen shows one attempt.

## 27 Oct 2026: Smarter Flashcards, and a Real "Remember Today" Figure

Commit: `a5e222b`. **Database step:** apply
`20261027000002_fsrs_memory.sql` in the Supabase SQL editor (one run) BEFORE this is
deployed. Until it is, flashcard progress stops saving to the account (nothing is lost:
it stays on the phone and uploads once the step is done).

**Why.** Flashcards used a simple rule: each "remember" doubled the wait. It ignored time,
so reviewing a card several times in one sitting pushed it months away, and the app could
not say how much a student actually still remembers.

**What changed:**

- **Flashcards now use FSRS**, the memory model the Anki app uses. For each card it
  learns how well the student knows it and how hard it is for them, and brings it back
  just before they are likely to forget it (when the chance of remembering drops to about
  90%).
- **Reviewing a card many times in a row no longer sends it months away.**
- **A card you forget still comes back tomorrow**, as before. The longest wait is still one
  year.
- **New line on a lesson's flashcard screen**, under the three piles: "ថ្ងៃនេះ
  អ្នកចាំបានប្រហែល 89% នៃកាតដែលបានរៀន" (today you remember about 89% of the cards you
  have studied), with an ⓘ that explains it. It is a different number from the ring: the
  ring is how you answered last time, this is how much is likely still in your head today.
- **Cards studied before today are converted automatically** the first time a flashcard
  screen opens, using each card's past answers.
- **Due dates will shift a little**: easy cards come back later, hard ones sooner.

**What to re-test:** open a flashcard lesson you have studied before; the new line should
appear with a percentage. Review a few cards, then check that the piles and the ring still
update. Open it on a second phone (same account) after the database step: the same cards
should come back on the same days.

## 27 Oct 2026: One "Remembered" Number on the Flashcard Screen, Not Two

Commit: `3259fa8`. No database step.

**What changed:** a lesson's flashcard screen showed two percentages. The ring (the share
of cards you marked "remember") is real and stays. The line under the piles,
"ប្រូបាបចងចាំប្រហាក់ប្រហែល ~N%", came from a made-up formula that ignored how long ago
you studied, so it is removed.

**Later, if wanted:** a real "chance you remember this card today" needs a proper memory
model (FSRS, as in Anki), which would also make the review schedule smarter. That is a
bigger piece of work (about 2 to 3 days).

**What to re-test:** open any flashcard lesson; the ring and the three piles show, the
line under them is gone.

## 27 Oct 2026: Small Look Fixes and a New Browser Tab Icon

Commit: `132d617`. No database step.

**What changed:**

- **The browser tab icon** is now the BrachNha logo. It was still an old icon from
  before the logo existed.
- **KruAI's title** ("KruAI" at the top of the chat) and **the pledge screen's title**
  had an emoji (🤖, ✍️) inside the purple title text, which could show as a purple blob.
  They now have a small purple icon beside the title instead. The pledge button's ✍️ is
  an icon too.
- **The quiz review** (after a practice quiz, or from its history) now has the same solid
  black outline around each question as the rest of the app. Right and wrong still show
  as light green and light pink.
- **The "Today" button** on Profile's study calendar no longer shows in a different font
  for a moment on slow internet.

**What to re-test:** open KruAI and the pledge screen (Roadmap, before signing) and check
the titles; finish a practice quiz and look at the review; look at the browser tab icon
(a hard refresh may be needed, browsers keep the old one for a while).

## 27 Oct 2026: The Content Editor Warns About a Dash Between Words

Commit: `6fc8464`. No database step. Admin accounts only.

**Why.** The app's rule is no dash between words in text students read, for example
"(SNC - Supreme National Council)". Students read it as machine-written. Nothing
checked for it, so it slipped into lessons and questions.

**What changed:** in Admin → Content, a text with a dash between words now shows a yellow
warning under it, with a tip on how to fix it. It is a warning, not a block: Publish still
works, because a few dashes are right (for example part of a term's own name). A dash
between numbers, like 1975 – 1979 or 45°C - 60°C, and maths are not flagged.

**To fix now (7 places, in Admin → Content):** Flashcards biology 3.3 cards 8 and 10;
Flashcards biology 5.2 card 1; lesson section 3.1.4 (biology); Game questions biology
question 27; Game questions history question 29.

## 27 Oct 2026: A Flashcard Never Waits More Than a Year

Commit: `aeab3db`. No database step.

**Why.** Each time a card is marked "remember", the wait before it comes back doubles.
There was no limit, so a card marked many times could be scheduled thousands of years
away, or on a broken date, and never came back at all.

**What changed:** the longest wait is now one year. Cards already scheduled too far away
are fixed automatically the next time the app opens: they come back at most a year after
they were last reviewed (straight away, if that year has already passed).

**What to re-test:** nothing visible should change for normal use. Flashcard reviews and
the "remember / not yet" piles should work as before.

## 27 Oct 2026: Flashcard and Quiz Progress Follows You to a New Phone

Commit: `fc6580b`. **Database step:** apply
`20261027000001_study_progress_sync.sql` in the Supabase SQL editor (one run). The app works
before and after; until it is applied, this progress simply stays on the phone as before.

**Why.** Signing in on a new phone brought back XP, the streak and lessons finished, but not
flashcard progress or quiz history. Those were saved only on the phone, so changing phones
or clearing the browser lost them even with an account.

**What changed (signed-in students):**

- **Now saved to the account and brought back on a new phone:** which flashcards you
  remember and when each is due again, the flashcards you write yourself, the ones you
  star, and your practice quiz and past paper history (with your answers, so an old
  attempt still opens its review).
- **Using two phones on one account** combines them; the latest grade of a card wins.
- **"Keep this device's work"** on the "two sets of progress" screen now also replaces the
  account's flashcard and quiz history with this phone's, as that screen already said.
- **Guests:** nothing changes. Without an account, progress stays on the phone.
- **The privacy page** now lists these as stored.

**What to re-test:** sign in on phone A, grade some flashcards, write and star a card, do a
quiz and a past paper. Then sign in with the same Google account on phone B (or a fresh
browser): all of it should be there, and an old quiz attempt should open its review.

## 26 Oct 2026: Audit Log for the Team

Commit: `59886de`. **Database step:** apply
`20261026000001_admin_audit_log.sql` in the Supabase SQL editor (one run). Until then the
new page says it could not load, and everything else works as before.

**Why.** Several admins can change things: delete accounts, pause KruAI, publish content,
post announcements. Until now some of those left no trace at all, so nobody could tell who
did what.

**What changed (admin accounts only, students see nothing new):**

- **A new page, Admin → Audit log.** Every change an admin makes, newest first, one line
  each: "Dara paused KruAI for Vann", "Rith published Flashcard deck: …, version 3", with
  the time, grouped by day. Filter by kind of change, or by which admin did it. "Show older"
  loads more.
- **Every admin can see it, except changes to who is an admin**, which only the owner sees.
- **It starts empty today.** Changes made before it was switched on are not in it.
- **Saving a draft is not listed**, only publishing, hiding, restoring and discarding.
  Students' own actions (like deleting their own account) are not listed either.
- **The privacy page** now says the team keeps this record, including the name of a student
  whose account the team deletes.

**What to re-test.** After applying the database step, do one small admin action (for
example pause and resume KruAI for a test account) and check it appears on Admin → Audit
log. Then open the page with a non-owner admin account and check role changes are not shown.

## 26 Oct 2026: Each Level Takes a Little Longer

Commit: `26ce659`. **Database step:** none.

**Why.** Every level used to cost the same 100 XP, so levels came fast and stopped
meaning much.

**What changed.** Each level now costs 20 XP more than the one before: level 1 to 2 is
100 XP, 2 to 3 is 120, 3 to 4 is 140, and so on. Reaching level 10 takes 1,620 XP in
total, level 20 takes 5,320 and level 30 takes 11,020. The bar at the top of the screen
and the "to next level" number on Home follow the new rule.

**Students who already had a level** were worked out again from their XP, as decided.
Most students with little XP see no change, but some will see their level go DOWN: for
example, 1,000 XP was level 11 and is now level 7. Their XP and coins are untouched.

**What to re-test.** Open the app with an account that has some XP and check the level
and the "XX / YYY XP" under it. Earning XP should fill the bar and move to the next level
at the new amounts.

## 25 Oct 2026: No More Error Screen After an Update

Commit: `fa47034`. **Database step:** none.

**Why.** Students keep the app open on their phone for days. When we put out a new
version, the parts of the app they had not opened yet are renamed on the site. So when
they later tapped one of those pages (Progress, Exam, Admin…), they got the
"Something went wrong" screen until they pressed Reload.

**What changed.** In that case the app now reloads itself once, quietly, and opens the
page they tapped on the new version. They never see the error screen. If the reload does
not help (no internet, or a broken update), the normal error screen with its Reload button
shows as before, so it can never keep reloading in a loop. These reloads are not sent to
the Admin → Errors page, because they are not real crashes.

**What to re-test.** Open the live site on a phone, leave it open, deploy a new version,
then come back and tap a page you had not opened yet. It should open normally, perhaps
after a quick reload.

## 13 Oct 2026: Errors Page for the Team

Commit: `39f064c`. **Database step:** done. `20261013000002_error_review.sql` was
applied to the live project on 13 Oct 2026.

**Why.** When the app breaks on a student's phone, it already sends us an error report. But
the only place to see them was a small "most frequent crashes" card on the Admin dashboard,
with no way to say "this one is fixed" and nothing to tell you a new one had arrived. This
was chosen instead of an outside service like Sentry, so student data stays in our own
database.

**What changed (admin accounts only, students see nothing new):**

- **A new page, Admin → Errors.** One card per error, last 30 days: how many times it
  happened, how many students hit it, and when it was first and last seen. It never shows
  WHO.
- **Mark fixed.** Once a fix is live, press it and the error moves down to "Marked fixed". If
  the same error happens again later, it comes back to the top on its own with a "Back again"
  label, so a fix that did not work cannot hide.
- **Details and "Copy for the developer".** Opens which pages it happened on, the app
  version, the phone's browser and the technical trace, and copies them as one block to send.
- **A chart of errors per day**, last 14 days. A sudden jump usually means the latest update
  broke something.
- **The red number on the Admin menu now counts open errors too**, next to photo and mistake
  reports.
- The dashboard's crash card has a "See all errors" link.

**Please re-test:** open Admin → Errors as an admin; mark
one fixed and check the menu number drops; check the Khmer wording on the page.

## 13 Oct 2026: New Page Titles, No Sparkle Icons, Fewer Dashes

Commit: `2a60b93`. No database step.

**Why.** On the Progress page the 📈 emoji showed as a solid purple square, because the
title was painted with the purple colour and the emoji got painted too. Separately, the team
set a rule against two things that make an app read as machine-written: dashes between words
in a sentence, and the sparkle (✨) icon.

**What changed:**

- **New page titles** on Progress, Grade Prediction, Leaderboard, Profile and Roadmap: a
  coloured icon tile (mint, pink, yellow, blue, orange), the title in black, and a short
  line underneath. No more purple squares.
- **Grade Prediction's title now follows the app language.** It was always in English.
- **Progress and Grade Prediction have a new line under the title** (for example "See how
  far you've come and what to study next."). Please check the Khmer wording.
- **Every sparkle icon was replaced** with one that fits the spot: the Home greeting is a
  sun, "recommended for you" is a lightbulb, Grade Prediction is a target, the weekly
  activity chart is an activity line, the exam chips are a calendar and a clipboard, and
  one intro screen tile is a lightbulb. KruAI's opening greeting ends with 📚 instead of ✨.
- **KruAI is told not to use a dash between words or the ✨ emoji.** A dash in a number
  range (1975 – 1979, pH 1.5 - 2) is still fine.

**Still to do, in Admin → Content:** three lines in the content have a dash between words:
the SNC answer in the History game questions, "(Estrogen - …)" on a biology flashcard, and
"(Sympathetic - …)" in lesson section 3.1.1.

**What to re-test:** open the five pages above in both languages and both themes and check
the title; open Home and the Mock Exam page and check the small icons.

## 13 Oct 2026 — Streak with Friends Is Real

Commit: `488a63e`. No database step left: the owner ran
`20261013000001_friends.sql` today, and the live project was checked (the new table is
there, and every friend function refuses a caller who is not signed in).

**Why.** The Streak with Friends page was a demo: one invented friend called "Dara", a
made-up week, and a "Simulate friend completion" button. The app had no way to know who
your friends are. Now it does.

**What changed:**

- **Students can add real friends.** On Streak with Friends, type a classmate's name (at
  least 2 letters), tap Add, and they get a request. Nothing happens until they tap
  Accept. Either of you can remove the other at any time.
- **Each friend has their own shared streak.** A day counts only when BOTH of you finish
  the daily goal (lesson + practice + flashcards). Every pair starts at 0 on the day you
  became friends.
- **The friends list** shows requests waiting for you, each friend with your shared streak
  and whether they finished today, the search box, and the requests you sent.
- **Tapping a friend** opens the shared page: the streak, today's goal for both of you
  (with a link to your next task if you haven't finished), the last 7 days, your best
  streak, and the date you became friends.
- **The menu shows a number** on "Streak with Friends" when someone has asked to be your
  friend.
- **Gone:** the fake friend, the Simulate button, the Remind button (the app can't send
  notifications yet) and the "Preview" tag.
- Guests see a "sign in" panel instead. The privacy page now says who can see what.

**Privacy, so the team knows:** any signed-in student can find another by name. They see
only the name and a cartoon avatar, never an email or photo. A friend sees only which days
you finished the goal since you became friends. At most 20 friends and 20 requests a day.

**What to re-test (needs two Google accounts):** search for the other account by name and
send a request; accept it on the other phone; finish the daily goal on both and check the
streak goes up for both; remove the friend.

## 7 Oct 2026 — The 10 Old Mock-Exam Questions and the Placement Test Are Removed

Commit: `9d94387`. No database step.

**Why.** The app still carried 10 old sample questions (5 maths, 5 biology) from its first
version. No screen showed them any more, and the only thing still using them was a
placement test that a student could reach only from an old roadmap card. They also showed
up in KruAI's list of app content as exams a student could not open.

**What changed:**

- **The 10 sample questions are gone**, and so is the placement test that used them. The
  address `/placement-test/...` now shows "This page isn't here".
- **The roadmap no longer has a "Pending Placement Tests" card.** Only accounts that booked a
  test before late September ever saw it.
- **KruAI no longer lists the sample questions** as app content, and no longer mentions
  placement tests.
- Nothing else changes: the survey still asks about weak subjects the same way, the Study
  page's Foundation tab is the same, and the "newly generated" exam papers still say
  "coming soon".

**What to re-test:** open the roadmap (it should look the same, minus the old card), and
ask KruAI what the app has for maths: it should list lesson sections and flashcards, not
"mock exam" questions.

## 7 Oct 2026 — Game Questions Are Khmer Only

Commit `7ba13dd`. No database step left: the owner ran
`20261007000002_game_questions_one_language.sql` today, and all 4 pools are now one
Khmer text per question (checked against the database).

**Why.** The game questions carried an English version of every question, added in an
earlier change, and the new editor asked for an English version too. That goes against the
rule that content is always Khmer (English only for the English subject) and is never
translated.

**What changed:**

- **Every game question now has one text, in Khmer.** The English versions are removed; the
  questions, options, answers, explanations and levels are otherwise exactly the same.
- **The editor has one question field**, like a quiz question. There is no English field.
- **With the app set to English, a game still shows its questions in Khmer.** The game's own
  buttons and labels still follow the app language.
- A game created earlier keeps the questions it started with.

**What to re-test:** after the database step and the deploy, set the app to English and
create a game: the questions are in Khmer. On Admin → Content → Game questions, open a
question: there is one question field.

## 7 Oct 2026 — Game Questions Get an Editor Too

Commit `8029823`. No database step left: the owner ran
`20261007000001_game_questions.sql` and imported the 4 question pools today (all 4 checked
against the database and identical).

**Why.** The 120 questions the Game (Battle) picks from were written into the app's code, so
fixing a typo in one needed a developer and a new version of the app. Now they are on Admin →
Content like everything else.

**What changed for the team (Admin → Content):**

- **A fifth tab: Game questions.** One pool per subject (maths, history, chemistry and biology
  have 30 questions each today). Each question has its English and Khmer wording, the options,
  the right answer, an explanation and a level (Basic, Medium or Hard). Save a draft (anyone on
  the team), publish (the owner only), every old version kept, Restore as draft to undo.
- **New** can start a pool for a subject that has none yet, such as physics.
- The same checks as everywhere else, on both languages: broken maths, Khmer numerals, long
  dashes, a right answer missing from the options, answers bunched on one letter.

**What changed for students:**

- **Nothing they will notice.** Creating a game looks and works as before: the same subjects
  have questions, and the level they pick still chooses the questions.
- **A fix reaches new games only.** A game keeps the questions it started with, so nobody's
  game changes while it is being played, and every joiner still answers exactly what the
  creator answered.
- Creating a game now downloads only the chosen subject's questions, a moment before Start.
  The first time needs a connection; with none, the screen says so and offers Try again.

**What to re-test (after the database step and the deploy):**

- create a game in maths at Hard: the questions are hard ones;
- create one in history in English: the questions show their English wording;
- edit a game question on Admin → Content and publish, then create a new game: the change
  shows; a game created before the edit keeps the old question.

## 7 Oct 2026 — The Old Starter Lessons Are Removed

Commit `8029823` (with the game questions). No database step.

**Why.** The app still carried six lessons from its very first version: Basic Limits and
Basic Probability (maths), Human Body and Human Brain (biology), and a maths and a biology
"foundation" lesson. The new lesson sections on the Study path had replaced them, and no
screen linked to them any more, so they could only be opened by typing their address. They
were also the last lessons that could only be changed in the code.

**What changed for students:**

- **Nothing they normally see.** The Study page, every subject path, the lesson sections and
  the roadmap look and work as before.
- **An old saved link to one of those lessons now opens the Study page** instead.
- **The 3D brain model is still in the app**, in biology section 3.1.1.
- The app opens very slightly faster (about 7 KB less to download first).
- KruAI no longer reads those old lessons, so it only points students to content they can
  actually find in the app.

**What to re-test:**

- open the Study page: maths opens from the first tab, biology from the second;
- open biology section 3.1.1 and check the 3D brain still appears;
- on the roadmap, a month for a weak subject that has lessons (biology, maths) opens the
  Study page; one for a subject without lessons says it is coming soon.

## 7 Oct 2026 — Lessons and Past Papers Now Come from the Content Editor (Part 2 of 2)

Commit `7c4512a` (parts 1 and 2 together). No database step: the migration was run and the 7 lesson sections
and 2 past papers were imported today (all 9 checked against the database and identical).

**Why.** Part 1 gave lesson sections and past papers an editor, but students still saw the copy
written into the app. Now they see what is published on Admin → Content, the same as
flashcards and quizzes, so a mistake in a lesson or a paper can be fixed without a new version
of the app.

**What changed for students:**

- **The app opens faster again.** It no longer downloads the lesson sections and the two past
  papers before the first screen. Each downloads when it is opened. The first screen
  downloads about 30 KB less.
- **A lesson section or paper opened once works without internet** afterwards. The first
  time needs a connection; with none, the screen says so and offers Try again.
- **Old exam results stay correct.** Reopening an earlier attempt at a past paper shows the
  questions as they were when it was taken, even if the paper was edited since.
- **One small wording fix on the results screen of a past paper:** the line under the writing
  task used a long dash (—). It is now two sentences (… មិនគិតពិន្ទុក្នុងកម្មវិធី។
  ពិនិត្យដោយខ្លួនឯងខាងក្រោម។). Please check the Khmer reads well.
- Everything else looks and works as before: the Study path, the lesson pages, the exam tab,
  sitting a paper and its practice drills.

**What changed for the team:**

- On Admin → Mistake reports, a question from a lesson section or a past paper now has an
  **Edit** button that opens it in the Content editor, like quiz questions. Fix it there, the
  owner publishes, then press Fixed. Reports sent before today still open on the right
  question.
- KruAI now reads the lesson sections from the database too, at the same time as the
  flashcard decks, so students don't wait longer for an answer.
- The copy of the lesson sections and past papers inside the app's code is deleted. **The
  database is the only copy now**, for all four kinds of content.

**What to re-test:**

- open the Study path for biology and for maths: the sections that have content can be
  opened, and each shows the right text, video picture and questions;
- open a lesson section, turn on airplane mode, close and reopen the app, open the same
  section: it still works;
- open the exam tab, the 2025 maths paper and the 2025 English paper, and sit one to the end:
  the results and the practice drills under wrong answers appear as before;
- edit a section or paper question on Admin → Content and publish, then reopen the app as a
  student: the change shows;
- reopen an old paper result from before the edit: it shows the old question;
- report a mistake on a lesson question, then open it on Admin → Mistake reports and press
  Edit: the editor opens on that question.

## 4 Oct 2026 — Lessons and Past Papers Get an Editor Too (Part 1 of 2)

Commit `7c4512a` (shipped together with part 2). **Database step needed:** the owner runs
`20261003000002_sections_and_papers.sql` in the Supabase SQL editor, then imports
`content/sections-papers.json` on Admin → Content with "publish items never published"
ticked (see `supabase/README.md`). Done on 7 Oct 2026.

**Why.** Flashcards and quizzes can now be fixed on Admin → Content without a new version of
the app. Lesson sections (the pages behind the Study path) and the past exam papers could
not: a mistake in one still needed a developer. This is the first half of moving them too.

**What changed for the team (Admin → Content):**

- **Two new tabs: Lesson sections and Past papers.** They work like the Flashcard and Quiz
  tabs: save a draft (anyone on the team), publish (the owner only), every old version kept,
  Restore as draft to undo.
- **A lesson section** can be fixed or written from empty: the title, the video's picture and
  YouTube id, the four parts (introduction, examples, lesson, key notes), the 3D model, the
  common mistakes and both sets of questions. Preview shows each part exactly as students
  see it. **New** offers the places on the Study path that have nothing written yet.
- **A past paper** can be fixed and extended: every question, option, answer and
  explanation, the reading passage and its word box, the writing task and the practice
  drills. Questions can be added, removed and moved inside a part. A whole new paper still
  comes as a file the developer prepares from photos.
- The checks work as before, with new ones: a word-box answer that is not in the box, a gap
  missing from the passage, a YouTube link pasted instead of its id. Tap a problem to jump
  to it.

**What changed for students:**

- **Nothing yet**, on purpose. Students keep seeing lessons and papers from the app itself
  until part 2, after the import.
- **One small fix they will see now:** 11 explanations in the 2025 maths paper used a long
  dash (—), which the app's writing rules ban. Each became a full stop (។), a colon (៖) or
  brackets. The words are unchanged.

**What to re-test:** after the database step, open Admin → Content → Lesson sections and Past
papers and check 7 sections and 2 papers are listed as "Live: version 1". Open a lesson section
on the Study path and the 2025 maths paper, and check both still look right.

## 3 Oct 2026 — Flashcards and Quizzes Now Come from the Content Editor (Part 2 of 2)

Commit `5e95715`. No database step: the migration was run and the content was
imported earlier today.

**Why.** Part 1 built the Content editor, but students still saw the copy of the flashcards and
quizzes written into the app. Now they see what is published on Admin → Content, so a
mistake can be fixed without a new version of the app.

**What changed for students:**

- **The app opens faster.** It used to download every flashcard deck and quiz before the
  first screen. Now each one downloads only when it is opened. The first screen downloads
  about 60 KB less.
- **A deck or quiz opened once works without internet** afterwards. The first time needs a
  connection; with none, the screen says so and offers Try again.
- **A fix reaches students the next time they open the app**, after the owner presses Publish.
- **Old quiz results stay correct.** Reopening an earlier attempt shows the questions as they
  were when it was taken, even if the quiz was edited since.
- Home quietly downloads the next couple of decks or quizzes it suggests, so tapping one
  opens at once.

**What changed for the team:**

- On Admin → Mistake reports, a practice-quiz question now has an **Edit** button that opens
  it in the Content editor. Fix it there, the owner publishes, then press Fixed. Lesson and
  past-paper questions are still fixed in the code.
- KruAI now reads the flashcard decks from the database too. It starts that download as
  soon as a question arrives, at the same time as its sign-in and daily-limit checks, so
  students don't wait longer for an answer.
- The yellow note on the Content page ("students still see the copy built into the app") is
  gone, because it is no longer true.
- The copy of the decks and quizzes inside the app's code is deleted. **The database is the
  only copy now.**

**What to re-test:**

- open Practice, a flashcard deck and a quiz: each opens and shows the right content;
- open a deck, turn on airplane mode, close and reopen the app, open the same deck: it still
  works;
- on a phone that has never opened the app, turn off the internet and open Practice: it says
  the first open needs internet, and Try again works once you are back online;
- edit a quiz question on Admin → Content and publish, then reopen the app as a student: the
  change shows;
- reopen an old quiz result from before the edit: it shows the old question;
- report a mistake on a quiz question, then open it on Admin → Mistake reports and press
  Edit: the editor opens on that question.

## 3 Oct 2026 — Explanations on the Admin Page and the Content Pages

Commit `64efc97`. No database step.

**Why.** The Admin page was hard to read: it was not clear what each number counted. The
Content pages (where flashcards and quizzes are edited) had the same problem.

**What changed.** On the Admin page, point at something with the mouse, or tap it on a
phone, to see what it means:

- each of the six numbers at the top (Students, Active today, KruAI units today, …);
- the ⓘ beside every card title (Students per day, What students did, Came back in week 2,
  Most frequent crashes);
- each activity name in "What students did".

The short paragraph that used to sit under the six numbers is gone; each number now explains
itself. Works in English and Khmer.

**On the Content pages** (Admin → Content), the same works for:

- **the list:** the New and Import panels, the "publish items never published" box, and three
  coloured labels above the list (Live, Not published, Draft) that say what each label on a
  row means;
- **the editor:** who sees what, Checks, Versions, the buttons at the bottom (Save draft,
  Publish, Undo, Discard), a card's id, and each field (front, back, situation, options,
  explanation, the help parts);
- **every problem shown under a field:** point at it or tap it to see how to fix it.

**What to re-test:**

- open Admin, point at or tap each number and each ⓘ;
- open Admin → Content, point at or tap the three coloured labels and each ⓘ;
- open a quiz, type a long dash (—) into an explanation, then point at the red line under it;
- tap a field's name (for example "Front") and check the cursor goes into its box.

## 3 Oct 2026 — Content Editor for Flashcards and Quizzes (Part 1 of 2)

Commit `64efc97`. **Database step needed:** run
`supabase/migrations/20261003000001_content_in_database.sql` once in the Supabase SQL
editor, all in one go.

**Why.** Fixing a wrong flashcard or quiz question needed a code change, so the "Fixed"
button on Mistake reports could only record that someone had fixed it elsewhere. Also, every
student downloads all the flashcards and quizzes before the first screen appears, whatever
they open.

**What changed.**

- **A new Admin page, "Content".** Every flashcard deck and practice quiz, named the way
  students see it. Open one to change its cards or questions, options, the correct answer
  (tap the circle beside it), the explanation, and the help shown after answering.
- **Checks as you type.** Broken maths, Khmer inside a formula, Khmer numerals, long dashes
  and a missing correct answer are listed, and an error stops it being published. Fields with
  maths show a preview.
- **Draft, then Publish.** Anyone on the team can save a draft. **Only the owner can press
  Publish.** Every published version is kept, so an older one can be restored.
- **Import.** The owner can import a file of decks and quizzes. It arrives as drafts to check
  first.
- **Students are not affected yet.** They still see the copy built into the app. Part 2
  switches the app to what is published here, and makes it load one lesson at a time.

**What to do** (owner, after running the migration):

1. Open Admin → Content → **Import a file**, choose `content/fixture.json`, tick "Publish
   items that have never been published", press **Import**. It should say 26 published.
2. Tell the developer, who checks that every item arrived exactly before Part 2.

**What to re-test:** open a quiz, change a word, Save draft, Publish, then open Versions and
restore version 1.

## 2 Oct 2026 — Announcements, and Students Reporting a Mistake in a Question

Commit `56016bf`. **Database step:** `supabase/migrations/20261002000005_announcements_and_content_reports.sql`,
run once in the Supabase SQL editor (already applied).

**Why.** The team had no way to tell every student something (a mock exam on Saturday, a
new lesson), and when a question in the app was wrong or unclear, students had no way to say so.

**What changed.**

- **Announcements.** On the new Admin page "Announcements", write a short message in Khmer
  (English is optional), pick a colour, add an optional link to a page in the app, and choose
  when it ends. A preview shows exactly what students will see. After publishing, every
  student sees it as a banner under the top bar, guests included. They can close it. "End
  now" takes it down for everyone.
- **"រាយការណ៍កំហុស" (report a mistake).** After answering a question in a lesson section, a
  practice quiz or a past paper's review, a signed-in student can report it: wrong answer,
  typo, unclear, or other, with an optional note.
- **Mistake reports page.** On the new Admin page "Mistake reports", each reported question
  is shown with its options, the marked answer, the explanation and what students wrote. After
  fixing the question in the app, press "Fixed". If it was right, press "Not a mistake".
- **The Admin menu badge** now also counts questions waiting for review.
- **The privacy page** now says that a mistake report stores which question, the kind of
  mistake and the note.

**What to re-test** (after running the migration):

- Publish a test announcement, check it shows under the top bar (in both languages), close
  it, then press "End now".
- As a student, answer a quiz question, press "រាយការណ៍កំហុស", choose a kind and send.
- As an admin, open "Mistake reports": the question should be there. Press "Not a mistake".

## 2 Oct 2026 — KruAI Limits and Pausing, From the Admin Area

Commit `68dacec`. **Database step:** `supabase/migrations/20261002000004_kruai_controls.sql`, run once in the
Supabase SQL editor (already applied).

**Why.** Changing how many KruAI questions a student or the whole app may ask each day meant
editing the database by hand, and the server kept its own copy of the student limit that had
to be changed too. There was no way to stop one account from using KruAI.

**What changed.**

- **A new KruAI page in the admin area (`/admin/kruai`):**
  - how many KruAI units were used today, against the whole-app limit;
  - a chart of the last 14 days, with the limit drawn as a dashed line;
  - the students who used the most today;
  - the two daily limits (per student, and for the whole app);
  - the students whose KruAI is paused, with a Resume button.
- **Only the owner can change the limits.** Other admins see them but cannot edit them, because
  the limits decide how fast the prepaid credit is spent. A question is 1 unit and a new photo
  is 3. The page shows units, not dollars.
- **Admins can pause KruAI for one student**, from that student's row on the Students page,
  with an optional reason. The student sees "KruAI is paused for this account" and can still
  use the rest of the app. Admins cannot pause each other or the owner.
- **"Questions left today" now follows the limit you set**, so it always matches what the app
  enforces.
- **The privacy page now says** that the team can pause KruAI for an account that misuses it.

**What to re-test** (after running the migration):

- As the owner, open Admin, then KruAI: check today's number and the chart.
- Change the per-student limit (for example to 20), then ask KruAI a question on a test account:
  the "questions left" line should count down from the new number. Set it back afterwards.
- On Students, pause a TEST account, then ask KruAI from it: it should say KruAI is paused.
  Resume it from the KruAI page.
- Signed in as an ordinary admin: the limits are shown but cannot be edited.

## 2 Oct 2026 — New Top Bar: Level Ring and XP Progress

Commit `5ad5eb9`. No database step needed.

**Why.** The top of every page used two rows: a row of four small number badges, then a
row with the menu button. On Home, level and XP were shown twice. Four header designs
were mocked up side by side, and the "level ring" one was chosen.

**What changed.**

- **One row at the top of every page:** a ring around your level number that fills up as
  you earn XP, the words "Level 1" with a small bar and "30 / 100 XP", then your streak,
  your coins and the menu button.
- **You can see how close the next level is**, not only the total XP.
- **Tapping the streak opens the Streak page.**
- **Home no longer has the BrachNha logo row** at the top. The logo is still in the menu.
- Page titles start a little higher, since the menu button is no longer floating on top
  of them.

**What to re-test.**

- On a phone: Home, Study, Profile and Streak all show the new bar, the menu button opens
  the menu, and nothing is cut off on a small phone.
- Earn some XP (answer a quiz question) and check the ring and bar move.
- On a laptop the bar shows without the menu button, because the side menu is always
  open there.

## 2 Oct 2026 — No More Login Page: Straight to Home as a Guest

Commit `5ad5eb9`. No database step needed.

**Why.** Opening the app for the first time meant three "why science" screens, then a page
asking you to sign in with Google or continue as a guest. That extra choice slowed new
students down before they had seen anything.

**What changed.**

- **After the three "why science" screens, the app goes straight to Home as a guest.** The
  login page is gone. Nobody has to choose anything to start.
- **Signing in works where it did before.** Tapping KruAI, Roadmap or creating a Battle
  shows the "Login required" pop-up with the Google button. Profile still has the Google
  button too. After signing in, new students still fill in their name and the short survey.
- **Logging out (or "Exit guest mode") now returns to Home as a guest**, not to a login page.
- **The privacy policy link** used to be on the login page. It is now under the Google
  button in the "Login required" pop-up and on Profile.
- **Opened from Telegram or Messenger:** these students used to be stopped by an
  "Open in browser" screen. Now they use the app as a guest like everyone else. Only when
  they try to sign in does the pop-up show "Open in Browser" instead of Google, because
  Google sign-in does not work inside those apps.
- The app still starts in English. The language can be changed from the menu.

**What to re-test.**

- On a fresh browser (or after clearing site data): the three screens, then Home, with no
  login page. Reload: still Home.
- As a guest: tap KruAI, open Roadmap, and go to Profile. Each should offer Google sign-in,
  and signing in should go through the name and survey screens as before.
- Open the site link from Telegram: you should reach Home. Tap KruAI and check the pop-up
  says "Open in Browser".
- Log out from Profile: you should land on Home as a guest.

## 2 Oct 2026 — You Can See Who Played Your Battle

Commit `abf6b99`. No database step needed.

**Why.** When someone played a battle you created, your Game page never showed it. The
"Your latest battle" card kept saying "Waiting for a joiner", and only the battle's answer
page knew someone had played.

**What changed.**

- **"Your latest battle" shows the newest match, whichever side you were on.** If a
  classmate just played your battle, it shows you against them, both scores, and whether
  you won or lost.
- **My Competitions says how many have played each battle** ("Played by 2").
- **Recent Games lists their runs too,** marked "Your challenge". Tapping one opens the
  answers straight on that classmate.
- **My Game Stats counts those matches,** so a classmate beating your battle counts as a
  loss for you, and you beating them as a win.

**What to re-test.** Create a battle on one account, play it on another, then open Game
on the first account: the card, My Competitions and Recent Games should all show it.

## 2 Oct 2026 — An Admin Area: Dashboard, Students, Admins and an Owner

Commit `4540f42`. **Database steps needed,** each once in the Supabase SQL
editor, in one go:

1. `supabase/migrations/20261002000001_roles_and_admin_tools.sql` (already applied);
2. `supabase/migrations/20261002000002_owner_role.sql` (already applied);
3. make the owner, with the SQL in `supabase/README.md` ("Admins and the owner"). Done:
   the owner is keop1484.
4. `supabase/migrations/20261002000003_creator_photo_cleanup.sql` (already applied).

**Why.** The team had one admin screen (photo reports) and the list of admins could only
be changed by hand in the database. There was no way to see how many students use the
app, look a student up, or remove an account without opening the database.

**What changed.**

- **Admins have an "Admin" row in the menu.** Students never see it. It opens the new
  admin hub and still shows how many photo reports are waiting.
- **The admin hub (`/admin`) shows how BrachNha is doing:**
  - students in total, active today, active this week, new this week, KruAI use today and
    crashes this week;
  - a chart of students per day for the last 30 days;
  - what students did this week (lessons finished, KruAI questions, and so on);
  - how many new students came back in their second week;
  - the most frequent crashes.
- **A Students page (`/admin/students`):**
  - search by name or email, and tap a student to see when they joined, when they were
    last seen, their XP and streak, and their KruAI use;
  - the owner can make someone an admin, or remove the role;
  - delete a student's account, with the same two steps and tick box as "Delete my
    account". Their battle photos are removed first. You cannot delete your own account
    here, and only the owner can delete an admin's (after removing the role).
- **There is one owner, above the admins.** The owner is the only one who can add or
  remove admins, and the owner's account can never be removed or deleted from the app,
  not even by the owner on Profile. Only the database can change who the owner is. This
  came from testing: with admins all equal, one admin could remove another and delete
  their account, and the only admin deleting their own account left nobody in charge.
- **The list of admins moved to a new "roles" table.** Everyone who was an admin stays
  an admin. A "teacher" role can be added later without redoing this.
- **"Delete my account" now leaves no photos behind.** Before, when a student who had
  created a battle deleted their account, the photos other players had added to that
  battle stayed in storage with nothing pointing at them. Now they are removed too.
- **The privacy page now says** that the BrachNha team can see a student's name, email,
  activity and KruAI use.

**What to re-test** (after running the migration):

- Signed in as the owner: open the menu, tap Admin, and check the numbers and chart.
- Open Students, search for someone, and make a TEST account an admin, then remove it.
- On the owner's Profile there is no "Delete my account" button, only a note.
- Signed in as that test admin: there is no "Make admin" button, and the owner's row
  has no buttons.
- Delete a TEST account (never a real student) and check it is gone.
- Signed in as a student: there is no Admin row, and typing `/admin` says the page is for
  the team.

## 2 Oct 2026 — KruAI's Full Solution Ends With the Formal Bac II Answer

Commit `a2d497b`. No database step needed.

**Why.** A full solution explained each step and then gave only the final number. A
student never saw how the answer must be written on the exam paper.

**What changed.**

- **A full solution now ends with "ចម្លើយ (សរសេរលើក្រដាសប្រឡង)៖".** That is the whole
  answer written from start to end the way a student writes it on the Bac II paper, in
  the same style as the answer keys: the form or formula used, the chain of steps, then
  "ដូចនេះ …" with the result.
- **Two lengths:**
  - If KruAI already guided the exercise step by step, the full solution is short: one
    method line and the formal answer, since the explaining already happened.
  - If the student asks for the solution straight away, KruAI explains the steps first,
    then gives the formal answer.
- **Long chains break over several short lines,** so they fit on a phone screen.
- **KruAI's chat bubbles are a little wider,** so formulas fit without sliding sideways
  on most phones.

**What to re-test.** Ask KruAI an exercise, press "បង្ហាញដំណោះស្រាយពេញ", and check the
formal answer at the bottom.

## 2 Oct 2026 — KruAI Talks Like a Kind Big Brother or Sister

Commit `2e1000e`. No database step needed.

**Why.** KruAI's answers were correct but stiff, like a textbook: it said "អ្នក" to
everyone, never used the student's name, and gave even "what is photosynthesis?" the
full exam layout. The aim is a chat that feels friendly and cute.

**What changed.**

- **KruAI talks like a kind big brother or sister.** It calls itself "បង" and the
  student "ប្អូន" or by name, praises right answers, is gentle with mistakes, and uses
  1 or 2 emoji. The name is written exactly as the student typed it ("Panharith" stays
  "Panharith"), never changed into Khmer letters.
- **Simple questions get short answers.** A question like "what is X?" now gets a few
  friendly lines instead of the full exam layout. Exercise solutions still use the full
  layout, and comparisons still come as a table.
- **When a student is stressed,** KruAI is kind first, then suggests one small step.
- **KruAI is a study helper, not a boyfriend or girlfriend.** If someone asks for that,
  it kindly says no and brings them back to studying. This is on purpose: most students
  are under 18.
- **The chat screen:** the greeting says the student's name, and while KruAI writes,
  three bouncing dots show "KruAI កំពុងគិត…". The dots stay still for anyone who has
  turned on reduced motion on their phone.
- **Chemistry equations with a Khmer word on the arrow** (like "ពន្លឺព្រះអាទិត្យ" in
  photosynthesis) now show as a proper equation, with the word right after the arrow in
  brackets. Before, the whole line showed as computer code.

**What to re-test.** Ask an exercise, a "what is…?" question and a comparison, and
check the tone. Open the chat and look for your name in the greeting.

## 2 Oct 2026 — Small Fixes: Back Button on Quiz Results, Sign-in Lands on Home

Commit `4be456f`. No database step needed.

**What changed.**

- **Quiz results screen:** a "← ត្រឡប់ក្រោយ" (back) button now sits next to
  "ធ្វើម្តងទៀត" (try again), so leaving the results no longer needs the small ✕
  at the top.
- **Signing in after logging out:** you log out from the Profile page, so
  signing in again used to bring you back to Profile. It now brings you to Home.

**What to re-test.** Finish a practice quiz and press back on the results
screen. Log out from Profile, sign in with Google again, and check that you land
on Home.

## 1 Oct 2026 — KruAI: A Follow-up About a Photo Costs 1, Not 3

Commit `d0fb895`. No database step needed.

**Why.** Found while testing: after sending a photo, every follow-up question in
the same chat also counted as 3 of the 30 daily questions. KruAI is shown the
photo again with each follow-up so it can still see the exercise, and the app
was charging for that photo every time. A guided photo exercise could use up a
whole day's questions in about ten turns.

**What changed.** Only the message that carries a NEW photo counts as 3. A
follow-up counts as 1, and KruAI still sees the photo.

**What to re-test.** On a real account, send a photo and watch the "questions
left" line (it shows once 10 or fewer are left): the photo takes 3, and each
follow-up after it takes 1.

## 1 Oct 2026 — New Look: Neobrutalism

Commit `fc55120`. No database step needed.

**What changed.** The whole app now has a bolder, flatter look, chosen from a
preview the team approved:
- thick dark outlines around cards and buttons;
- solid "sticker" shadows instead of soft glows;
- flat bright colours instead of gradients;
- a warm cream page instead of light lavender.

Home's main card is bright yellow with four coloured buttons, and the selected
tab at the bottom is a yellow sticker. Dark mode follows the same style, with
light outlines and light shadows (the mirror of light mode's dark ones). Text is the same as before.

The Mock Exam page and the 2-Day Bac II Simulation page got the new look too.
The simulation page used to stay dark even in light mode, and it could be
dragged sideways on every screen size; both are fixed. The Bac II Simulation
card keeps its dark navy-to-purple "exam night" colours (they were briefly
changed to light blue and put back, as it looked less premium), and the last
box on the simulation page uses the same colours.

**What did not change.** Everything works exactly as before: no features, data or
KruAI changes. The Leaderboard got the new look like every other screen, but its
students and numbers are untouched.

**Re-test.** Open Home, Study, a lesson, a quiz, Flashcards, Mock Exam (and its
2-Day Bac II Simulation page), Progress, Streak, Game and Profile, in light and
dark, on a phone and a laptop. On the simulation page, check the page no longer
moves sideways. Look for
anything hard to read, a button that no longer looks tappable, or a card that
looks unfinished. A selected or correct/wrong answer should still be easy to
tell apart.

## 1 Oct 2026 — Fixes: Photo Reports Page and Game History

Commit `fc55120`. One database step:
`supabase/migrations/20261001000004_fix_admin_photo_reports.sql`, run in the
Supabase SQL editor (already done on our project).

**Why.** Two bugs found while testing:
- the team's Photo reports page always said "Could not load reports", even
  with reports waiting;
- after logging out and signing back in, your Game history (the battles you
  created and the ones you played) was gone.

**What changed.**
- The Photo reports page loads again.
- Signing back in brings your battles back, with their results. No XP is paid a
  second time.

**What to re-test.**
- On an admin account, report a photo from another account, then open Team →
  Photo reports: the report should be listed.
- Create or play a battle, log out, sign in again with the same Google account
  and open Game: Recent Games and My Competitions should show it.

## 1 Oct 2026 — KruAI: Remembers the Exercise, Stop and Try Again, Questions Left

Commit `59ae567`. No database step needed.

**Why.** A review of the chat found one real bug and a few things students would feel.

**What changed.**

- **KruAI no longer forgets the exercise in a long guided chat.** KruAI only reads the
  last 12 messages, and guiding an exercise takes many short turns. After about six
  tries the exercise itself had dropped out. In a test, KruAI then made up a different
  exercise and told a student their wrong answer was correct. Now the exercise (and its
  photo) is always sent along while KruAI is still guiding it.
- **Stop button.** While KruAI is writing, the send button becomes a stop button. Words
  already shown stay. If nothing had arrived yet, the bubble says "បានបញ្ឈប់" and
  offers Try again.
- **Try again button** (ព្យាយាមម្តងទៀត) under an answer that failed: no connection, KruAI
  busy, or a server error. It asks the same question again, and the new answer takes the
  failed one's place. There is no Try again under "you have reached today's limit",
  since it cannot help until tomorrow.
- **"Questions left today".** Once a student has 10 or fewer questions left, a small line
  above the message box says how many (and that a photo counts as 3, while a photo is
  attached). At 0 it says to come back tomorrow.
- **A photo refused with 1 or 2 questions left** now explains that a photo costs 3 and
  that typed questions still work, instead of "come back tomorrow".
- **Error messages are no longer shown to KruAI** as if KruAI had said them.
- **Cheaper questions.** One example answer that was also saved as a free ready-made
  answer was removed from KruAI's instructions. Every question now costs about 650 fewer
  tokens, and the instructions have room for new rules again. Comparison answers still
  come back as a table.

**What to re-test.**

- Ask an exercise and keep answering for 7 or more turns, then give a wrong final
  answer: KruAI should say it is not right yet.
- Press stop in the middle of an answer, and again right after sending.
- Turn off the internet, send a question, turn it back on, press Try again.
- On a real account, after 20 or more questions today, the "questions left" line appears.

**Known gap.** Pressing stop before the first word arrives stops the answer on screen,
but KruAI finishes writing that one answer in the background, and the question still
counts toward the daily limit.

## 1 Oct 2026 — Real Numbers Everywhere, Crash Reports, Delete Account, Report a Photo

Commit `e6d5a10`. **Three database steps needed** (see the end of this entry).

**Why.** Getting the app ready for real students. Several screens still showed made-up
numbers that a student could mistake for their own, there was no way to know when the
app crashed or whether students come back, and two safety basics were missing.

**What changed.**

- **Grade Prediction now uses your own results.** The prediction comes from the
  questions you answered, your mock exam and past-paper scores, the lessons you
  finished and how regularly you study. Before you have answered 20 questions (or sat
  one exam), the page and the Home card say how many more you need instead of showing a
  grade. The chart shows your readiness score over the last 4 weeks. The two "try it
  live" buttons are gone.
- **Progress: the last three cards are real.** Focus Areas shows your strongest and
  weakest subjects and which are rising or falling. Study Activity shows the questions
  and flashcards you did each day. "AI Insights" became **Study Tips**: up to three short
  tips from your own numbers (your streak today, your weakest subject, your week, cards
  to review). No AI is used for these.
- **Streak page: today's goal and the week are real.** The three tasks show what you
  actually did today, and each one still open is a link to where you do it. The
  "Complete Today's Goal" button is gone (it was a demo). The week row is now your last 7
  days. Confetti plays once, the first time you open the page after finishing the goal.
- **Game: the big card shows your latest battle**, with both scores and times, or
  "Waiting for a joiner" for a battle you created. A new player sees "No battles yet".
- **Crash reports and simple usage counts** are saved to our own database (no outside
  company). They never include answers, KruAI messages or email. They tell us when the
  app breaks and how many students use it each day.
- **Delete my account** (Profile, under Logout, signed-in students only). It removes the
  account, everything saved with it and the photos shared in battles. It cannot be
  undone.
- **Report a photo**: in a battle review, a small flag on the other student's working
  photos. Reports come to the team to check; nothing is hidden automatically.
- **A review page for the team** at `/admin/reports` (not in any menu): each reported
  photo with **Keep** and **Delete** buttons. Delete removes the photo for everyone.
  Only accounts added as admins can use it; anyone else sees "This page is for the
  BrachNha team". Admin accounts also get a **Team → Photo reports** item in the menu, with
  the number of reports waiting; students never see it.
- The **Privacy page** was updated to say all of the above.

**What to know.** The leaderboard was not changed, as asked. Streak with Friends is
still a demo.

**Database steps (by hand, in the Supabase SQL editor):** run
`20261001000001_telemetry.sql`, `20261001000002_account_deletion_and_reports.sql` and
`20261001000003_report_review.sql`, then add each team member as an admin (the
command is in `supabase/README.md`).
Until then the app works, but crash reports are not saved, Delete my account shows an
error, and Report says it could not send.

**Re-test.**
- New student: Grade Prediction, Progress, Streak and Game show "not yet" messages, not
  numbers.
- After answering a quiz: Progress and Grade Prediction move together.
- Streak: task rows open the right lesson, quiz or flashcards.
- With a **test** Google account only: Profile → Delete my account removes it and returns
  to the start screen.
- Battle review: the flag on the other student's photo sends a report.

## 29 Sep 2026 — Leaderboard: No "Sample" Label, Smaller Demo Numbers

Commit `ff7465b`.

**What changed.** The leaderboard's 29 made-up students used to carry a small "Sample"
pill next to their name, on the podium and in the list. That pill has been removed on
request.

Their numbers were also lowered, because next to the real students' small totals they
looked unbelievable (thousands of XP and month-long streaks). On every tab (Weekly,
Monthly, All-time) they now stay under a 5-day streak, 2,000 XP and 2 hours of study, and
they all show the title "Beginner". Real students' numbers are not touched.

Four of them were also removed on request (Malis Chan, Sokha Tith, Sothea Vann, Nita Pen),
so there are 25 made-up students now instead of 29.

**What to know.** Nothing on the screen now tells a made-up student from a real one. They
are still made up: every name above you that is not a real classmate comes from the demo
list. If anyone asks, the honest answer is that the board is filled with sample students
until the app has enough real ones.

**Re-test.** Open Leaderboard in both languages: no "Sample" / "គំរូ" pill on the top
three or in the list, and the "You" chip and your own sticky card still show as before.
Switch between XP, Streak and Study time, and Weekly, Monthly and All-time: no made-up
student should reach 2,000 XP, 5 days or 2 hours.

## 29 Sep 2026 — KruAI Now Teaches Step by Step (Socratic Method)

Commit `056b8d0`. **No database step needed.**

**Why.** KruAI used to give the whole solution the moment a student sent an exercise. Students
learn more when they work it out themselves, with a teacher asking the right questions. That is
the Socratic method.

**What changed.**
- When a student sends an **exercise** (a calculation or problem, typed or as a photo), KruAI
  does not solve it straight away. It starts its reply with 🧭, says what the exercise gives,
  and asks **one** question or gives **one** hint about the first step.
- If the student answers correctly, KruAI praises them and asks about the next step. If the
  answer is wrong, KruAI does not reveal the right one; it asks a question that shows where
  the mistake is.
- A button **បង្ហាញដំណោះស្រាយពេញ** (show full solution) appears under KruAI's guided reply. Tapping
  it shows the complete step-by-step solution. KruAI also shows it by itself if the student is
  stuck after about 3 tries.
- **Fact questions** ("what is photosynthesis?") still get a direct answer, as before.
- The daily limit stays at 30. A guided exercise uses several messages, so students can do fewer
  exercises per day than before.

**What to re-test.**
1. Ask KruAI to calculate a limit. It should ask you a question instead of answering.
2. Give a wrong answer. It should give a hint, not the answer.
3. Tap បង្ហាញដំណោះស្រាយពេញ. The full solution should appear.
4. Ask a fact question. It should answer directly.
5. Please read KruAI's Khmer in these replies and tell us if any wording sounds wrong.

## 29 Sep 2026 — Paying for KruAI Safely: Daily Question Limits

Commit `0b88c48`. **Database step needed:** run
`supabase/migrations/20260929000001_kruai_usage.sql` in the Supabase SQL editor **before**
deploying. Without it, the live KruAI refuses every question, on purpose (see below).

**Why.** KruAI is moving from free AI keys to one paid key, loaded with $30 of prepaid
credit. The team wanted to be sure that $30 cannot all be spent in one day, by many
questions, a bug, or someone misusing an account.

**What changed.**
- **Each student can ask KruAI 30 questions a day.** A question with a photo counts as 3,
  because photos cost more. After that, KruAI says "come back tomorrow".
- **The whole app has a daily limit too** (starting at 300). When it is reached, KruAI
  says it is resting until tomorrow. This number will be adjusted once we see what one
  question really costs.
- The ready-made answers (for example mitosis vs meiosis) are free, so they don't count.
- If the app cannot check the limit (for example the database is down), KruAI stops
  answering rather than risk spending without a limit.
- The server now records how much each answer cost (numbers only, no student text), so
  the daily limit can be set from real prices.

**Settings to do in Google and Vercel (not code).**
1. When buying the $30 credit, make sure **auto top-up / auto reload is OFF**. Then Google
   can never charge more than the $30.
2. In Google Cloud Billing, add a budget alert at 25%, 50% and 90% of $30. It only sends
   an email; it does not stop anything.
3. Create the API key inside the paid project, and restrict it to the Generative Language
   API.
4. In Vercel, keep only `GEMINI_API_KEY` = the paid key. Delete `GEMINI_API_KEYS` and
   `GEMINI_API_KEY_1` to `_5`. Then redeploy.

**What to re-test.**
1. After running the migration, ask KruAI a question on the live site. It should answer
   normally.
2. Ask with a photo; it counts as 3.
3. In Google Cloud Billing, check that the charge appears after a few questions.

## 29 Sep 2026 — KruAI Can Read a Photo of an Exercise

Commit `0b88c48`. **No database step needed.**

**Why.** Students wanted to photograph an exercise (from the textbook, a past paper or their
notebook) and ask KruAI about it, instead of typing out a long formula.

**What changed.**
- In the KruAI chat there is a new **camera button** beside Σ. Tapping it offers two choices:
  **ថតរូប** (take a photo with the camera) or **ជ្រើសរូបភាព** (choose a photo from the phone).
- The student can add a question, or just press Send. With no question, KruAI is asked to
  explain and solve the exercise in the photo.
- KruAI first writes out the exercise as it read it, so the student can check it read correctly.
  If part of the photo is blurry or cut off, it says which part and asks for a clearer photo
  instead of guessing.
- Follow-up questions ("explain step 3") still see the photo, as long as the app has not been
  closed.
- Photos are made smaller on the phone before sending (about 300KB), to save mobile data.
- The chat history keeps a small preview of the photo. Only the 30 newest photos keep a
  preview, so the phone's storage stays safe; older ones show a small "រូបភាព" label.
- One photo per message.

**Not tested yet, and worth knowing.**
- On the day this was built, every free AI key was out of quota, so KruAI's real answers to
  photos have not been seen yet. Everything else was tested (sending, the preview, the limits,
  errors, small screens), using a stand-in for the AI.
- The camera and gallery have not been tried on a real phone yet.
- Photos of students' notebooks are sent to the AI provider, like any other question.

**What to re-test.**
1. On a phone, open KruAI, tap the camera button and choose ថតរូប. The camera should open.
   Photograph an exercise and press Send. KruAI should write the exercise out, then solve it.
2. Try ជ្រើសរូបភាព with a photo already on the phone, including one taken on an iPhone.
3. Send a blurry photo. KruAI should ask for a clearer one.
4. Ask a follow-up about the same photo, then close the app, reopen it, and check that the
   photo preview is still in the chat.

## 29 Sep 2026 — Grade 12 History Lesson 6 (Kingdom of Cambodia II 1993-Present) OCR, KruAI RAG Grounding & High-Yield Flashcards

Landed in commit `1082909`. **No database step needed.**

**Why.** Process Lesson 6 ("ព្រះរាជាណាចក្រកម្ពុជា ទី 2 (1993-បច្ចុប្បន្ន)" / Kingdom of Cambodia II 1993-Present) from the official MoEYS Grade 12 History Summary textbook (Book pp. 59-64). Ground KruAI's retrieval-augmented generation (RAG) system with authentic MoEYS facts on the May 23-28, 1993 UNTAC-organized general election (20 participating parties, Khmer Rouge boycott, 120 Constituent Assembly seats: FUNCINPEC 58, CPP 51, BLDP 10, MOLINAKA 1), the adoption of the September 21, 1993 Constitution and promulgation on September 24, 1993 re-establishing the Kingdom of Cambodia as a constitutional monarchy and multiparty liberal democracy ("the King reigns but does not govern"), King Norodom Sihanouk's second reign (1993-2004), the two-Prime Minister coalition government (Prince Norodom Ranariddh as First Prime Minister, Samdech Hun Sen as Second Prime Minister), the conclusion of UNTAC's mandate, the July 6, 1994 National Assembly law outlawing the Khmer Rouge, Samdech Techo Hun Sen's "Win-Win Policy" (guaranteeing life, career/rank, and property), Ieng Sary's August 8, 1996 defection bringing Pailin and Samlot into the fold, internal Khmer Rouge collapse (Pol Pot murdering Son Sen and family, arrest of Khieu Samphan, Ta Mok's defection on July 4, 1997), the armed clashes of July 5-6, 1997 in Phnom Penh, O'Smach, the appointment of Ung Huot as First Prime Minister, Pol Pot's death from heart failure in April 1998, the July 26, 1998 national election (CPP 64 seats, FUNCINPEC 43 seats, 2/3 constitutional majority requirement leading to Prince Ranariddh as National Assembly President, Samdech Chea Sim as Senate President, and Samdech Hun Sen as sole Prime Minister), the total dissolution of the Khmer Rouge military structure in late 1998 and early 1999 bringing complete national peace and territorial unity for the first time in modern history, successive election victories (2003, 2008, 2013), the Triangular Strategy (1998-2003: pacification, regional/international integration, and socio-economic reforms), Cambodia regaining its UN seat, accession as the 10th ASEAN member on April 30, 1999 and WTO accession in October 2004, the 4 major ASEAN membership benefits (political equality, economic growth, connectivity/visa exemption, social security cooperation), the Rectangular Strategy launched in 2004 centered on Good Governance (4 favorable environments, 4 reform angles, 4 growth angles across Phase 1 2004-2008, Phase 2 2008-2013, Phase 3 2013-2018), King Sihanouk's retirement and King Norodom Sihamoni's ascension in October 2004, the passing of King-Father Norodom Sihanouk on October 15, 2012 (Preah Borom Ratanakkot), the 6 UNESCO World Heritage inscriptions (Angkor 1992, Royal Ballet 2003, Sbek Thom 2005, Preah Vihear 2008, Chapei Dang Veng 2016, Sambor Prei Kuk 2017), and Cambodia's economic rise from low-income ($268/capita in the 1990s) to lower-middle income ($1,228/capita in 2016) with 2030 and 2050 development visions. Author 16 official high-yield flashcards in `src/data/practice.ts` (`history-1-6`). Wire authentic section titles into `src/features/lessons/sessions.ts`. Practice quiz mode remains gated to Math only.

**What changed.**

- **Transcribed Textbook OCR.** Rendered pages 59-64 from the MoEYS Grade 12 History Summary textbook into `sources/ocr/history/chapter6-kingdom-of-cambodia-second.md` covering all sections.
- **Grounded KruAI in `server/textbook-search.ts`.** Added 5 comprehensive RAG chunks under `HISTORY_CH6_SECTIONS` and included them in `ALL_HISTORY_SECTIONS` and `searchHistoryTextbook`:
  - `tb:hist:koc:ch6:election-1993-and-constitution` (May 1993 UNTAC election results, Sept 1993 Constitution, constitutional monarchy, Two-Prime Minister coalition government).
  - `tb:hist:koc:ch6:peace-building-and-win-win-policy` (Outlawing KR July 1994, Win-Win Policy 3 guarantees, Ieng Sary defection 1996, July 1997 events, Ung Huot, Pol Pot death 1998).
  - `tb:hist:koc:ch6:election-1998-and-total-peace` (July 1998 election, 2/3 requirement, Ranariddh/Chea Sim/Hun Sen government, total peace and integration 1998-1999, 2003/2008/2013 elections).
  - `tb:hist:koc:ch6:triangular-strategy-and-asean` (Triangular Strategy 3 angles, UN seat return, ASEAN 10th member April 30, 1999, WTO Oct 2004, 4 ASEAN benefits, macroeconomic stability).
  - `tb:hist:koc:ch6:rectangular-strategy-and-heritage` (Rectangular Strategy 2004 Good Governance core, 4 environments, 4 reform angles, 4 growth angles, King Sihamoni ascension 2004, King Sihanouk passing 2012, 6 UNESCO World Heritage sites, GDP per capita transition).
- **Authored 16 High-Yield Flashcards (`src/data/practice.ts`).** Added helper `hist16Card` and deck `"history-1-6"` containing 16 comprehensive flashcards testing high-frequency MoEYS Bac II historical facts.
- **Updated History Study Path (`src/features/lessons/sessions.ts`).** Authored 5 authentic section titles for `SUBJECT_SESSIONS.history[0].lessons[5]`.
- **Verification.** Passed `npm run check:digits` (0 Khmer numerals across all 289 files), `npx oxlint` (0 errors), `npx tsc --noEmit` (0 errors), and `npm run build`.

## 29 Sep 2026 — Grade 12 History Lesson 5 (People's Republic and State of Cambodia 1979-1993) OCR, KruAI RAG Grounding & High-Yield Flashcards

Landed in commit `31cda87`. **No database step needed.**

**Why.** Process Lesson 5 ("សាធារណរដ្ឋប្រជាមានិតកម្ពុជា និងរដ្ឋកម្ពុជា (1979-1993)" / People's Republic of Kampuchea and State of Cambodia) from the official MoEYS Grade 12 History Summary textbook (Book pp. 49–58). Ground KruAI's retrieval-augmented generation (RAG) system with authentic MoEYS facts on the December 2, 1978 founding of the Kampuchean United Front for National Salvation (KUFNS) in Snuol, Kratie, the January 7, 1979 liberation of Phnom Penh, the four governing organs (CPK/KPRP, Council of Ministers, Council of State, National Assembly), the four conflicting factions (PRK, Khmer Rouge/DK, KPNLF under Son Sann, FUNCINPEC under Prince Norodom Sihanouk), the 1982 Coalition Government of Democratic Kampuchea (CGDK), the July 12, 1984 "K-5 Plan" border defense, the 5-year military service law of 1985, post-liberation social restoration and "solidarity groups for production" (ក្រុមសាមគ្គីបង្កបង្កើនផល 10–30 families), re-introduction of the Riel currency in 1980, education literacy slogan ("អ្នកចេះច្រើនបង្រៀនអ្នកចេះតិច ឯអ្នកចេះតិចបង្រៀនអ្នកមិនចេះ"), reopening of the School of Fine Arts (1981) and Faculty of Medicine (1980), the historic Sihanouk-Hun Sen summit at Fère-en-Tardenois (Dec 2, 1987), full withdrawal of Vietnamese troops in September 1989, the April 1989 constitutional amendments (transitioning to "State of Cambodia", restoring Buddhism as state religion, market economy, abolishing capital punishment), the Supreme National Council (SNC, Sept 10, 1990), and the landmark Paris Peace Agreements of October 23, 1991 with the UNTAC mandate and repatriation of 350,000 refugees. Author 16 official high-yield flashcards in `src/data/practice.ts` (`history-1-5`). Wire authentic section titles into `src/features/lessons/sessions.ts`. Practice quiz mode remains gated to Math only.

**What changed.**

- **Transcribed Textbook OCR.** Rendered pages 49–58 from the MoEYS Grade 12 History Summary textbook into `sources/ocr/history/chapter5-peoples-republic-and-state-of-cambodia.md` covering all 5 core sections.
- **Grounded KruAI in `server/textbook-search.ts`.** Added 6 detailed RAG chunks under `HISTORY_CH5_SECTIONS` and included them in `ALL_HISTORY_SECTIONS` and `searchHistoryTextbook`:
  - `tb:hist:prk:ch5:liberation-and-government-structure` (Dec 2, 1978 KUFNS, Jan 7, 1979 liberation, 4 governing bodies, leadership groups from Eastern Zone and Hanoi).
  - `tb:hist:prk:ch5:four-factions-and-cgdk` (PRK, Khmer Rouge UN seat, KPNLF Son Sann, FUNCINPEC Sihanouk, and 1982 CGDK coalition).
  - `tb:hist:prk:ch5:k5-plan-and-economic-reconstruction` (July 12, 1984 K-5 Plan border fortifications, 1985 military service, solidarity groups 10–30 families, 1980 Riel currency, shift to private property).
  - `tb:hist:prk:ch5:social-education-and-health-restoration` (Literacy slogan, reopening of schools, Fine Arts school Jan 1981, 6,000 orphans, Faculty of Medicine Jan 1980).
  - `tb:hist:prk:ch5:peace-negotiations-and-1989-reforms` (Perestroika context, Dec 2, 1987 Sihanouk-Hun Sen summit, Jakarta JIM, Sept 1989 Vietnamese troop withdrawal, April 1989 State of Cambodia reforms).
  - `tb:hist:prk:ch5:snc-and-paris-peace-agreements-1991` (Sept 10, 1990 SNC 12 members, Oct 23, 1991 Paris Peace Agreements, UNTAC $2–3 billion mandate, 350,000 refugee repatriation, Sihanouk return).
- **Authored 16 High-Yield Flashcards (`src/data/practice.ts`).** Added helper `hist15Card` and deck `"history-1-5"` containing 16 comprehensive Q&A cards testing high-frequency MoEYS Bac II historical facts.
- **Updated History Study Path (`src/features/lessons/sessions.ts`).** Authored 5 authentic section titles for `SUBJECT_SESSIONS.history[0].lessons[4]`.
- **Verification.** Passed `npm run check:digits` (0 Khmer numerals across all 289 files), `npm run lint` (0 errors), `npx tsc --noEmit` (0 errors), and `npm run build`.

## 29 Sep 2026 — Grade 12 History Lesson 4 (Democratic Kampuchea 1975-1979) OCR, KruAI RAG Grounding & High-Yield Flashcards

Landed in commit `4487967`. **No database step needed.**

**Why.** Process Lesson 4 ("កម្ពុជាប្រជាធិបតេយ្យ (1975-1979)" / Democratic Kampuchea) from the official MoEYS Grade 12 History Summary textbook (Book pp. 39–47). Ground KruAI's retrieval-augmented generation (RAG) system with authentic MoEYS facts on the April 17, 1975 forced evacuation of Phnom Penh, the 8-point urgent CPK directives, the totalitarian structure under "Angkar", the January 5, 1976 Constitution and 250-seat Assembly, the 7 administrative zones, the "Super Great Leap Forward" Four-Year Plan (1977-1980) and 3 tons/ha paddy target, 3 stages of cooperatives, social class division (base people vs. new/17 April people), forced collective marriages, destruction of education, S-21 (Tuol Sleng) and internal purges (1978 Eastern Zone massacre), the rise of the Kampuchean United Front for National Salvation (KUFNS) led by Samdech Techo Hun Sen and comrades, the historic January 7, 1979 victory, and the Extraordinary Chambers in the Courts of Cambodia (ECCC) trials. Author 16 official high-yield flashcards in `src/data/practice.ts` (`history-1-4`). Wire authentic section titles into the History study path in `src/features/lessons/sessions.ts`. No quiz was created (quiz tab remains gated to Math only).

**What changed.**

- **Transcribed Textbook OCR.** Rendered pages from the MoEYS Grade 12 History Summary textbook into `sources/ocr/history/chapter4-democratic-kampuchea.md` across all 5 major sections of Lesson 4.
- **Grounded KruAI in `server/textbook-search.ts`.** Added 6 detailed RAG chunks under `HISTORY_CH4_SECTIONS` and included them in `ALL_HISTORY_SECTIONS` and `searchHistoryTextbook`:
  - `tb:hist:dk:ch4:takeover-and-angkar-structure` (April 17, 1975 forced evacuation, 8-point directive, Angkar concept, Pol Pot and CPK Standing Committee).
  - `tb:hist:dk:ch4:constitution-and-administrative-zones` (Jan 5, 1976 Constitution, 16 chapters, 21 articles, 250-seat Assembly, 7 zones plus Phnom Penh special zone).
  - `tb:hist:dk:ch4:super-great-leap-forward-and-cooperatives` (Four-Year Plan 1977-1980, 3-7 tons/ha rice goal, 4 rice shares, 3 cooperative phases, base vs 17 April people, collective marriage, child labor).
  - `tb:hist:dk:ch4:tragedy-purges-and-s21` (Excessive labor, starvation rations, Tuol Sleng S-21 under Kaing Guek Eav/Duch, 14,000 victims, 1978 Eastern Zone massacre).
  - `tb:hist:dk:ch4:fall-and-7-january-1979` (Failure of 3-ton plan, border clashes with Vietnam, June 20, 1977 journey of Samdech Hun Sen, Unit 125, Dec 2, 1978 KUFNS founding, Jan 7, 1979 liberation of Phnom Penh).
  - `tb:hist:dk:ch4:eccc-khmer-rouge-tribunal` (ECCC establishment under UN-Cambodia agreement, Aug 10, 2001 law, Feb 2006 trials, life sentences for Duch, Nuon Chea, and Khieu Samphan).
- **Authored 16 High-Yield Flashcards (`src/data/practice.ts`).** Added helper `hist14Card` and deck `"history-1-4"` containing 16 comprehensive flashcards testing high-frequency MoEYS Bac II historical facts.
- **Updated History Study Path (`src/features/lessons/sessions.ts`).** Authored 5 authentic section titles for `SUBJECT_SESSIONS.history[0].lessons[3]`.
- **Verification.** Passed `npm run check:digits` (0 Khmer numerals across all 289 files), `npm run lint` (0 errors), `npx tsc --noEmit` (0 errors), and `npm run build`.

## 29 Sep 2026 — Grade 12 History Lesson 3 (Khmer Republic 1970-1975) OCR, KruAI RAG Grounding & High-Yield Flashcards

Landed in commit `201a701`. **No database step needed.**

**Why.** Process Lesson 3 ("របបសាធារណរដ្ឋខ្មែរ (1970-1975)" / Khmer Republic) from the official MoEYS Grade 12 History Summary textbook (Book pp. 33–38, PDF pp. 39–44). Ground KruAI's retrieval-augmented generation (RAG) system with authentic MoEYS facts on the economic and political pre-coup context, the March 18, 1970 coup d'état against Prince Norodom Sihanouk, the 5-year civil war (1970-1975), US B-52 bombing (>2 million tons), hyperinflation and refugee crisis in Phnom Penh, internal corruption and weakening of Lon Nol's regime, the April 17, 1975 fall of Phnom Penh to the Khmer Rouge, and the devastating social and economic consequences. Author 16 official high-yield flashcards in `src/data/practice.ts` (`history-1-3`). Per user directive, no multiple-choice quiz was created (practice quiz mode remains gated to Math only). Wire authentic section titles into the History study path in `src/features/lessons/sessions.ts`.

**What changed.**

- **Transcribed Textbook OCR.** Rendered pages 39–44 locally without external OCR API calls, creating `sources/ocr/history/chapter3-khmer-republic.md` covering all 5 core sections of Lesson 3.
- **Grounded KruAI in `server/textbook-search.ts`.** Added 6 detailed RAG chunks under `HISTORY_CH3_SECTIONS` and included them in `ALL_HISTORY_SECTIONS` and `searchHistoryTextbook`:
  - `tb:hist:republic:ch3:pre-coup-context` (Pre-1970 agricultural crisis, nationalization effects, 25% rice smuggling to Viet Cong, rejection of US military aid, Saloth Sar's trip to China and CPK expansion).
  - `tb:hist:republic:ch3:coup-18-march-1970` (March 8–12 demonstrations, 86/89 Assembly vote to depose Sihanouk, Cheng Heng as acting Head of State, creation of FUNK on March 23, proclamation of Khmer Republic on Oct 9, 1970).
  - `tb:hist:republic:ch3:bombing-and-refugees` (US B-52 bombings >2 million tons, Phnom Penh refugee surge from 600,000 to >2 million, besieged city conditions).
  - `tb:hist:republic:ch3:civil-war-and-corruption` (Lon Nol stroke in 1971, Lon Non and officer corruption, phantom soldiers, weapons sales to insurgents, cutting of Mekong supply route in Jan 1975).
  - `tb:hist:republic:ch3:fall-of-phnom-penh-17-april-1975` (Lon Nol flight to US in early April 1975, Saloth Sar's unilateral offensive, entry of black-uniformed Khmer Rouge into Phnom Penh on April 17, 1975 at 9:30 AM).
  - `tb:hist:republic:ch3:war-damages-and-consequences` (>1 million dead, war orphans and widows, 55% of factories destroyed, 70–80% of roads/bridges wrecked, minefields and craters).
- **Authored 16 High-Yield Flashcards (`src/data/practice.ts`).** Added helper `hist13Card` and deck `"history-1-3"` containing 16 comprehensive flashcards testing high-frequency MoEYS Bac II historical facts.
- **Strict Quiz Restriction Respected.** No quiz authored for Lesson 3 in accordance with the user's directive.
- **Updated History Study Path (`src/features/lessons/sessions.ts`).** Authored 5 authentic section titles for `SUBJECT_SESSIONS.history[0].lessons[2]`.
- **Verification.** Passed `npm run check:digits` (0 Khmer numerals across all 289 files), `npm run lint` (0 errors), `npx tsc --noEmit` (0 errors), and `npm run build` (clean 10.85s production build).

## 29 Sep 2026 — Practice Quiz Tab Gated to Math Only, Non-Math Subjects Set to "Coming Soon"

Landed in commit `da2c88a`. **No database step needed.**

**Why.** Restrict the Practice Quiz mode to active quiz subjects (Math only) as requested by the user, while preserving all existing quiz content in `data/` and `features/practice/quiz-path.ts` without deletion for future release. Moving forward, newly processed textbook lessons will focus solely on flashcard decks. All other subjects on the Practice Quiz tab (Physics, History, Biology, Chemistry, Khmer, Foreign Language) now display "ឆាប់ៗនេះ" (Coming soon) and cannot be opened or touched by students.

**What changed.**

- **Introduced `ACTIVE_QUIZ_SUBJECTS` Policy in `features/practice/practice.ts`.** Defined `ACTIVE_QUIZ_SUBJECTS = ["math"]` and exported `isQuizSubjectActive(subjectId)`. Updated `practiceLessonsFor` and `readyQuizSectionCount` to return zero counts when a subject's quizzes are not in the active set.
- **Updated `PracticeSubjectCard` (`features/practice/components/practice-subject-card.tsx`).** Non-active quiz subjects (including Physics and History) display the dimmed "ឆាប់ៗនេះ" (Coming soon) badge and are completely non-interactive (no link, no touch action). Only Math shows its active section count ("5 ផ្នែក") and remains interactive.
- **Enforced Route Guards (`pages/practice-subject.tsx` & `pages/practice-run.tsx`).** Any direct URL navigation to `/practice/quiz/:subjectId` or `/practice/quiz/:subjectId/:lessonRef` for non-active quiz subjects immediately redirects to `/practice`.
- **Filtered Study Feed (`features/home/study-feed.ts`).** Quizzes from non-active subjects are excluded from Home's "continue where you left off" study feed.
- **Preserved Existing Quiz Assets.** All authored quizzes (History Lessons 1 & 2, Physics path template) remain intact in `src/data/quizzes/` and `src/data/practice.ts` for future activation.
- **Verification.** Passed `npm run check:digits` (0 Khmer numerals across all 289 files), `npm run lint` (0 errors), `npx tsc --noEmit` (0 errors), and `npm run build` (clean 12.87s production build).

## 29 Sep 2026 — Grade 12 History Lesson 2 (Sangkum Reastr Niyum 1955-1970) OCR, KruAI RAG Grounding & Practice Quiz/Flashcards

Landed in commit `da2c88a`. **No database step needed.**

**Why.** Process Lesson 2 ("របបសង្គមរាស្ត្រនិយម (1955-1970)" / Sangkum Reastr Niyum) from the official MoEYS Grade 12 History Summary textbook (Book pp. 25–31, PDF pp. 31–38). Ground KruAI's retrieval-augmented generation (RAG) system with authentic MoEYS facts on King Norodom Sihanouk's abdication, the creation of Sangkum Reastr Niyum, the National Congress (សមាជជាតិ), neutrality foreign policy, the 1960 Head of State status, infrastructure/education achievements, and factors leading to the regime's fall. Author 16 official practice flashcards and a 12-question Bac II multiple-choice quiz with balanced answer distribution, and wire the authentic section titles into the History study path.

**What changed.**

- **Rendered and Transcribed Lesson 2 (Book pp. 25–31).** Rendered 9 high-resolution page scans (`p31.png` to `p39.png`) with zero external OCR API costs using `scripts/pdf-to-png.mjs`. Transcribed complete, structured notes into `sources/ocr/history/chapter2-sangkum-reastr-niyum.md`:
  - Part I: Creation of Sangkum Reastr Niyum (1947 constitutional context, King Sihanouk's abdication on March 3, 1955 to father Norodom Suramarit, creation of Sangkum on March 23, 1955, landslide Sept 11, 1955 election >83% & 91 seats, transition to single-party system).
  - Part II: Factors of public trust (Sihanouk's popularity as Father of Independence, grassroots organization at village/commune/district/province levels, prominent figures Sim Var, Son Sann, Norindeth, Yem Sambaur, solid domestic financial support).
  - Part III: National Congress (សមាជជាតិ direct democracy 2x/year at Veal Mean, constitutional status, anti-corruption, Khmer as official language, national assembly oversight, women's full voting rights on Jan 6, 1958).
  - Part IV: Neutrality foreign policy (1954 Geneva foundation, March 18, 1955 Nehru declaration on peaceful coexistence, April 18–24, 1955 Bandung Conference with Zhou Enlai & Pham Van Dong, UN entry Dec 14, 1955, SEATO rejection, 15 years of peace vs Cold War deterioration with US rightists, Thai support for Khmer Serei, South Vietnam border incursions, North Vietnam/Viet Cong sanctuaries, March 18, 1970 coup by Lon Nol & Sirik Matak).
  - Part V: Prince Sihanouk as Head of State (April 3, 1960 death of King Suramarit, Regency Council under Sisowath Monireth, June 5, 1960 referendum 99.8%, Kep speech, special constitutional amendment creating "Head of State" without being King, Queen Kossamak as throne symbol).
  - Part VI: Sangkum achievements (Agriculture/irrigation; Sihanoukville port & NR4 & railway line 2 & Chroy Changvar Bridge & Pochentong/Siem Reap airports; Nov 1963 nationalization with SONEXIM, SORAPHA, SONACRIM, Crédit National bank; state factories; Olympic Stadium by Vann Molyvann; education, healthcare with Kantha Bopha, Preah Kossamak; reasons for economic/political decline).
- **Grounded KruAI RAG Retrieval.** Integrated 6 comprehensive knowledge sections into `server/textbook-search.ts` under `HISTORY_CH2_SECTIONS` and combined into `ALL_HISTORY_SECTIONS`:
  - `tb:hist:sangkum:ch2:creation-and-election`: Creation of Sangkum, abdication, and 1955 elections.
  - `tb:hist:sangkum:ch2:national-congress`: National Congress direct democracy, achievements, and women's voting rights.
  - `tb:hist:sangkum:ch2:neutrality-foreign-policy`: Neutrality foreign policy, Nehru pact, Bandung conference, and UN membership.
  - `tb:hist:sangkum:ch2:head-of-state-1960`: 1960 succession crisis, referendum, and constitutional amendment.
  - `tb:hist:sangkum:ch2:achievements-infrastructure-economy`: Economic policies, nationalization, infrastructure, industries, and education.
  - `tb:hist:sangkum:ch2:decline-and-1970-coup`: Cold War pressures, Viet Cong presence, economic issues, and March 18, 1970 coup.
- **Updated History Subject Path.** In `src/features/lessons/sessions.ts`, updated `SUBJECT_SESSIONS.history[0].lessons[1]` with 5 authentic section titles: `"ការបង្កើតរបបសង្គមរាស្ត្រនិយម"`, `"សមាជជាតិ និងលទ្ធិប្រជាធិបតេយ្យផ្ទាល់"`, `"នយោបាយការបរទេសអព្យាក្រឹត"`, `"ការឡើងកាន់តំណែងជាប្រមុខរដ្ឋ 1960"`, `"សមិទ្ធផលសំខាន់ៗ និងការដួលរលំនៃរបប"`.
- **Authored 16 High-Yield Flashcards.** In `src/data/practice.ts`, created the `history-1-2` flashcard deck covering all key milestones, dates, policies, and concepts.
- **Authored 12-Question Bac II Practice Quiz.** Created `src/data/quizzes/history-1-2.ts` and registered it under `PRACTICE_QUIZZES["history-1-2"]` and `PRACTICE_QUIZZES["history-1-2-1"]`. Correct answer choices are evenly distributed at 25% each across all 4 positions (options 0, 1, 2, 3 / ក, ខ, គ, ឃ).
- **Verification.** Passed `npm run check:digits` (0 Khmer numerals across all 289 files), zero em dashes in student-facing strings, `npm run lint` (0 errors), `npx tsc --noEmit` (0 errors), and `npm run build` (clean 12.04s production build).

## 29 Sep 2026 — Grade 12 History Lesson 1 (French Protectorate 1863-1953) OCR, KruAI RAG Grounding & Practice Quiz/Flashcards

Landed in commit `da2c88a`. **No database step needed.**

**Why.** Launch the Grade 12 History curriculum for BrachNha starting from Lesson 1 ("ប្រទេសកម្ពុជាក្រោមអាណាព្យាបាលបារាំង (1863-1953)" / Cambodia under the French Protectorate) in the official MoEYS Grade 12 History Summary textbook (Book pp. 5–23, PDF pp. 11–29). Ground KruAI's retrieval-augmented generation (RAG) system with authentic MoEYS historical facts, treaties, dates, and royal campaigns, author 16 official practice flashcards and a 12-question Bac II multiple-choice quiz with balanced answer distribution, and wire the History path into the lessons hub.

**What changed.**

- **Rendered and Transcribed Lesson 1 (Book pp. 5–23).** Rendered 27 high-resolution page scans (`p05.png` to `p31.png`) with zero external OCR API costs using the local renderer `scripts/pdf-to-png.mjs`. Transcribed complete, structured notes into `sources/ocr/history/chapter1-french-protectorate.md`:
  - 4 Kings of the Protectorate period (Norodom, Sisowath, Sisowath Monivong, Norodom Sihanouk).
  - Part I: Quest for French Protection (King Ang Duong letters of 1853/1856 to Napoleon III, Montigny mission, French strategic and commercial motives in Indochina).
  - Part II: Foundation of Protectorate (Treaty of Aug 11, 1863, Franco-Siamese Treaty of July 15, 1867 ceding Battambang/Siem Reap, Convention of June 17, 1884 forced by Gov Thomson, 1884–1887 Insurrection led by Prince Sivotha, Kralahom Kong & Pisnouk Lauk Chhouk, 1886 Compromise, Royal Ordinance of July 11, 1897 putting Ducos as head of Council of Ministers, early Franco-Cambodian schools, police, Ket Mealea hospital).
  - Part III: Evolution of the Protectorate 1900–1945 (1904 & 1907 Franco-Siamese treaties restoring Koh Kong, Melouprey, Battambang, Siem Reap & Sisophon, EFEO Angkor temple conservation, 1911 administrative & education reforms, pagoda schools, Pali High School, April 18, 1925 Bardez assassination at Krang Leav, 1930 Buddhist Institute, 1942 Umbrella Demonstration).
  - Part IV: Final Phase & Independence 1945–1953 (March 9, 1945 Japanese coup & March 13 first independence proclamation, 1946 Modus Vivendi, 1947 Constitution, armed Khmer Issarak movements, King Norodom Sihanouk's 1953 Royal Crusade for Independence, Nov 9, 1953 power transfer, July 21, 1954 Geneva Conference).
  - Part V: Positive vs Negative Impacts of the French Protectorate (territorial integrity saved from Siam/Annam, temple conservation, Preah Vihear 1908 map, modern education/health vs loss of Kampuchea Krom June 4, 1949 and Koh Tral Jan 31, 1939, heavy tax burden, forced labor and WWI conscription).
- **Grounded KruAI RAG Retrieval.** Integrated 7 comprehensive knowledge chunks in `server/textbook-search.ts` under `HISTORY_CH1_SECTIONS` and exported `searchHistoryTextbook()`:
  - `tb:hist:protectorate:ch1:kings-timeline`: The 4 Kings, key milestones, and timeline.
  - `tb:hist:protectorate:ch1:ang-duong-search`: King Ang Duong letters (1853, 1856) and French motives.
  - `tb:hist:protectorate:ch1:treaties-1863-1884`: Treaties of 1863, 1867, and 1884.
  - `tb:hist:protectorate:ch1:rebellion-and-1897`: 1884–1887 Insurrection, 1886 compromise, and 1897 Ducos ordinance.
  - `tb:hist:protectorate:ch1:territory-bardez-nationalism`: 1904 & 1907 territorial recovery, 1925 Bardez incident, and 1930 Buddhist Institute.
  - `tb:hist:protectorate:ch1:independence-crusade-1953`: 1945 Japanese coup, Khmer Issarak, 1953 Royal Crusade, and 1954 Geneva Conference.
  - `tb:hist:protectorate:ch1:positive-negative-impacts`: Detailed positive vs negative outcomes of French rule.
  - Connected `searchHistoryTextbook()` into `server/chat-handler.ts` with subject query routing.
- **Configured History Subject Path & Curriculum Syllabus.** In `src/features/lessons/sessions.ts`, registered History under `PATH_TAB` (`"all"`) and configured `SUBJECT_SESSIONS.history` with Chapter 1 ("ប្រវត្តិសាស្រ្តនៃប្រទេសកម្ពុជា") containing Lesson 1 and reserved nodes for Lessons 2 through 6.
- **Authored 16 High-Yield Flashcards.** In `src/data/practice.ts`, created the `history-1-1` flashcard deck covering all core definitions, treaties, dates, key historical figures, and exam questions.
- **Authored 12-Question Bac II Practice Quiz.** Created `src/data/quizzes/history-1-1.ts` and registered it under `PRACTICE_QUIZZES["history-1-1"]` and `PRACTICE_QUIZZES["history-1-1-1"]`. Correct answer choices are evenly distributed at 25% each across all 4 positions (options 0, 1, 2, 3 / ក, ខ, គ, ឃ).
- **Verification.** Passed `npm run check:digits` (0 Khmer numerals across all 288 files), zero em dashes in student-facing strings, `npm run lint` (0 errors), `npx tsc --noEmit` (0 errors), and `npm run build` (clean 8.11s production build).

## 29 Sep 2026 — Biology Chapter 5 (ADN, Gene Expression & Biotechnology) OCR, KruAI RAG Grounding & 24 Flashcards

*Not committed yet.* **No database step needed.**

**Why.** Transcribe the complete Chapter 5 ("ព័ត៌មានសេនេទិច និងការសំដែងនៃសែន" / Genetic Information and Gene Expression) from the official MoEYS Grade 12 Biology textbook summary (Book pp. 31–50, PDF pp. 31–50) encompassing all 3 lessons. Expand KruAI's retrieval-augmented generation (RAG) knowledge base to answer student questions on DNA structure, replication, transcription, translation, and genetic engineering, and author 24 official bilingual practice flashcards with updated curriculum syllabus nodes.

**What changed.**

- **Rendered and Transcribed Chapter 5 (Book pp. 31–50).** Rendered 20 high-resolution page scans (`p31.png` through `p50.png`) and authored 3 comprehensive Markdown transcriptions in `sources/ocr/biology-summary/chapter5/`:
  - `lesson1-dna-genetic-info.md` (pp. 31–39): Chemical nature of genetic info, Griffith (1928), Avery (1944), Hershey & Chase (1952) experiments, nucleotide structure & Chargaff rules ($A=T, G=C$), Watson & Crick (1953) double helix model, semi-conservative replication mechanism (Meselson & Stahl 1958), S phase cell cycle role, comprehensive formulas ($L, N, M, H, C$), and 5 fully worked practice problems.
  - `lesson2-gene-expression.md` (pp. 40–46): Beadle & Tatum (1941) "one gene one enzyme" hypothesis, structural comparison between DNA and RNA, 3 functional RNA types (ARNm, ARNt, ARNr), RNA polymerase transcription stages (initiation, elongation, termination), the 64-codon genetic code dictionary, translation steps, polysomes, and gene expression regulation.
  - `lesson3-biotechnology.md` (pp. 47–50): Selection & hybridization, heterosis (hybrid vigor), inbreeding vs outbreeding, micropropagation of plant tissue cultures (4 steps), identical twins & nuclear transfer cloning (Dolly), polyploidy induction with colchicine, recombinant DNA technology (restriction enzymes, ligase, vectors), 5-step human insulin production in *E. coli*, and agricultural/medical applications.
- **Grounded KruAI RAG Retrieval.** Integrated 5 high-density knowledge sections into `server/textbook-search.ts` under `BIOLOGY_CH5_SECTIONS`:
  - `tb:bio:ch5:dna-structure-chargaff`: Griffith/Hershey-Chase experiments, nucleotide structure, Chargaff rules, and Watson-Crick double helix.
  - `tb:bio:ch5:dna-replication-cell-cycle`: Semi-conservative replication mechanism, replication fork enzymes, and S phase DNA doubling.
  - `tb:bio:ch5:transcription-arn-types`: DNA vs RNA table, ARNm/ARNt/ARNr roles, and RNA polymerase transcription.
  - `tb:bio:ch5:genetic-code-translation`: 64 codons (AUG start, UAA/UAG/UGA stop), ribosome A/P sites, 3-step translation, and polysomes.
  - `tb:bio:ch5:biotechnology-cloning-gmo`: Heterosis, plant micropropagation, animal cloning, polyploidy/colchicine, and recombinant DNA insulin production.
- **Authored 24 Practice Flashcards (3 Decks).** Added official curriculum flashcard decks in `src/data/practice.ts`:
  - `biology-5-1` (8 cards): DNA genetic nature, Griffith transformation, Hershey-Chase bacteriophage proof, nucleotide anatomy, Chargaff base pairing, double helix geometry, semi-conservative replication, and S-phase cell cycle role.
  - `biology-5-2` (8 cards): Beadle-Tatum hypothesis, DNA vs RNA differences, 3 RNA types, transcription stages, triplet codon rules, 64-codon genetic dictionary, translation initiation/elongation/termination, and polysomes.
  - `biology-5-3` (8 cards): Artificial hybridization and heterosis, inbreeding vs outbreeding, cloning definition, plant tissue micropropagation steps, identical twins, polyploidy and colchicine, recombinant DNA technology steps, and human insulin production in *E. coli*.
- **Updated Curriculum Lesson Sessions.** In `src/features/lessons/sessions.ts`, configured authentic lesson syllabus titles for Chapter 5 Lesson 1, Lesson 2, and Lesson 3.
- **Verification.** Passed `npm run check:digits` (0 Khmer numerals across 287 files), zero em dashes in student-facing strings, `npm run lint` (0 errors), `npx tsc --noEmit` (0 errors), and `npm run build` (clean 12.91s build).

## 29 Sep 2026 — Mathematics Chapter 1 & 2 Practice Quizzes (50 Questions) & Quiz Path Integration

*Not committed yet.* **No database step needed.**

**Why.** Following OCR digitization of Mathematics Chapter 1 (Limits) and Chapter 2 (Derivatives & Primitives), author and wire complete practice quizzes into the Mimo-style Quiz Path so students can immediately practice and test their mastery of both chapters. Also conduct a comprehensive orthography and terminology audit across recently added decks and quizzes.

**What changed.**

- **Audited and Fixed Khmer Orthography in Biology Flashcards.** Corrected multiple spelling inconsistencies in `src/data/practice.ts` (`biology-1-2`):
  - Standardized "លំអង" to official MoEYS "លម្អង" ("ដំណើរលម្អង", "ប្លោកលម្អង", "គ្រាប់លម្អង", "បំពង់លម្អង").
  - Fixed French loanword for nucleus from phonetic "ញ៉្វៃយ៉ូ" to standard MoEYS Biology "ណ្វៃយ៉ូ" across cards 11, 12, 13, and 14.
  - Aligned Cotyledon spelling to MoEYS textbook "កូទីលេដូន" in card 15.
- **Authored 4 New Mathematics Quizzes (40 Questions + 160 Drill/Foundation Items).** Built complete curriculum-aligned quizzes covering all key MoEYS Bac II techniques with step-by-step solutions, common misconception notes, similar drills, and foundation exercises:
  - `math-1-1-2` (10 questions): លីមីតនៃអនុគមន៍ត្រីកោណមាត្រ និងអិចស្ប៉ូណង់ស្យែល (Trigonometric, Exponential & Logarithmic limits).
  - `math-1-1-3` (10 questions): អាស៊ឹមតូត និងភាពជាប់នៃអនុគមន៍ (Vertical, horizontal, and oblique asymptotes, and continuity).
  - `math-1-2-1` (10 questions): ដេរីវេនៃអនុគមន៍ (Polynomial, power, radical, product, quotient, trig, exp, ln derivatives and kinematics).
  - `math-1-2-2` (10 questions): ព្រីមីទីវនៃអនុគមន៍ (Power, sqrt, inverse square, trig, exp, log primitives, initial conditions, and partial fractions).
- **Wired Quizzes into Practice Hub & Quiz Path.**
  - Added all 4 new quizzes to `PRACTICE_QUIZZES` in `src/data/practice.ts`.
  - Updated `MATH_LESSONS` in `src/features/practice/quiz-path.ts` with real section titles for Lesson 1 and Lesson 2.
  - Upgraded `quizLesson()` so that lessons with defined curriculum sections render only their authentic sections, bringing Math ready quiz sections from 1 to 5.
- **Verification.** Passed `npm run check:digits` (0 Khmer numerals across 287 files), `npm run check:quiz` (50 questions across 5 quizzes, 2627 typeset math strings, 0 errors), `npx tsc --noEmit` (clean), and `npm run lint` (0 errors).

## 29 Sep 2026 — Mathematics Chapter 2 (Derivatives & Primitives) OCR, KruAI RAG Grounding & Flashcard Typo Fixes

*Not committed yet.* **No database step needed.**

**Why.** Continue digitizing the official MoEYS Grade 12 Mathematics Summary textbook, expand KruAI's math retrieval grounding beyond Chapter 1 (Limits) into Chapter 2 (Derivatives & Primitives), and fix OCR transcription errors across Biology flashcards.

**What changed.**

- **Audited and Fixed Khmer Terminology Errors in Flashcards.** Corrected multiple OCR-introduced transcription errors in `src/data/practice.ts` (`biology-1-1`):
  - Fixed misread words: "កោនញញោល" → "កោនឈ្មោល" (male cone), "ផលិតលង" / "គ្រាប់លងផ្កា" → "ផលិតគ្រាប់លម្អង" / "គ្រាប់លម្អង" (pollen grains), "ជាស្រុក" → "ជាស្រកា" (scale-like leaves), "សត្វកកេវ" → "សត្វកកេរ" (rodents), "ក្សេត្រូពិច" → "ក្បែរត្រូពិច" (subtropics), "ដើមឆ្កាត" → "ដើមត្នោត" (palm-like tree), "ស្លឹកទុំ" → "ស្លឹកដុំ" (terminal cluster of leaves), and "ប្រង់" / "ស៊ីណេគូតី" → "ប្រដឺ ឬស៊ីកាដ" / "ស៊ីណេតូភីត".
  - Cleaned up arrow symbols in `biology-1-2` double fertilization reactions from ASCII `->` to `→`.
- **Rendered and Transcribed Chapter 2 (Derivatives & Primitives).** Rendered PDF pages 22 to 33 (Book pages 19 to 30) of `Math summary.pdf` to high-resolution PNGs and transcribed the entire chapter into `sources/ocr/Math summary/chapter2-derivatives-primitives.md`. Contains all derivative and primitive rules plus 13 authentic worked exercises with full steps.
- **KruAI Math RAG Knowledge Expanded.** In `server/textbook-search.ts`, integrated 6 new structured knowledge modules into `ALL_MATH_SECTIONS`:
  - `tb:math:derivatives:ch2:basic-rules`: Basic rules, product, quotient, composite, roots, and powers.
  - `tb:math:derivatives:ch2:trig-derivatives`: Trigonometric derivatives, higher-order derivatives, and $n$-th derivative formulas.
  - `tb:math:derivatives:ch2:exp-log-derivatives`: Exponential and natural logarithmic derivatives.
  - `tb:math:derivatives:ch2:kinematics-applications`: Physical motion applications (velocity $v(t) = s'(t)$ and acceleration $a(t) = v'(t)$).
  - `tb:math:primitives:ch2:elementary-forms`: Elementary primitives and power forms ($u^n u'$, $u'/\sqrt{u}$).
  - `tb:math:primitives:ch2:log-exp-forms`: Logarithmic and exponential primitive forms ($u'/u$ and $u' e^u$).
- **Verified Retrieval & Formatting Standards.** Total math textbook chunks increased to 16. Verified query matching for trigonometric derivatives, exponential derivatives, and primitives. Passed `npm run check:digits` (all Latin digits 0-9), `npm run check:quiz`, and `npx tsc -b`.

## 29 Sep 2026 — Generated Mock Exams: Math and Biology retired to Coming Soon

*Not committed yet.* **No database step needed.**

**Why.** Retire the old prototype Math and Biology questions from the "វិញ្ញាសារបង្កើតថ្មី" (Newly Generated Papers) tab, setting all subjects into a consistent "ឆាប់ៗនេះ" (Coming Soon) state pending authentic newly-generated exam papers.

**What changed.**

- **Emptied `GENERATED_EXAM_QUESTIONS`.** In `src/data/generated-exams.ts`, removed the fallback derivation from the old `MOCK_QS` set. Math and Biology now display the "ឆាប់ៗនេះ" badge and inline preparation notice identical to all other subjects.
- **Audited Game & Practice fallbacks.** Verified that `src/data/game-questions.ts` maintains its full standalone questions for math, history, chemistry, and biology, so multiplayer and single-player games remain unaffected.
- **Verification standard.** `npm run check:digits`, `npm run lint`, and `npx tsc -b` all passed with 0 errors.

## 29 Sep 2026 — Biology: Chapter 1 Lesson 2 (Angiosperms) Q&A OCR, KruAI RAG Grounding & Flashcards

*Not committed yet.* **No database step needed.**

**Why.** Digitize and ground the complete official Grade 12 Biology Q&A curriculum for Chapter 1, Lesson 2 (អង់ស្យូស្ពែម / Angiosperms) into KruAI's textbook knowledge retrieval base and author an interactive 16-card practice deck directly aligned with official Bac II exam questions.

**What changed.**

- **OCR & Transcription of Chapter 1 Lesson 2.** Extracted Book pages 6 to 17 (12 pages) from the official `ជីវវិទ្យា - ធូ ភន biology qna.pdf` textbook, capturing the full theoretical summary and all 44 authentic exam Q&As into `sources/ocr/biology-qna/chapter1-lesson2-angiosperms.md`.
- **KruAI RAG Grounding Added.** In `server/textbook-search.ts`, integrated 3 rich knowledge chunks into `BIOLOGY_CH1_SECTIONS`:
  - `tb:bio:ch1:micro-mega-sporogenesis`: Microsporogenesis, megasporogenesis, pollen grain vs male gamete, and ovule vs female gamete distinctions.
  - `tb:bio:ch1:lifecycle-alternation`: Alternation of generations, diploid sporophyte (2n) vs haploid gametophyte (n), meiosis and fertilization transitions, and embryo/endosperm roles.
  - `tb:bio:ch1:angiosperm-high-yield-qna`: Real Bac II questions including palm/maize cross-pollination, 6-petal monocot flower anatomy, dicot leaf 3-tissue layer cross section, cambium growth tissue function, and artificial pollination methods.
- **16-Card Biology Practice Deck.** In `src/data/practice.ts`, added a dedicated 16-flashcard deck for `biology-1-2` covering flower organ structure, male/female sporogenesis, double fertilization products ($2n$ zygote and $3n$ endosperm), fruit/seed development, and monocot vs dicot anatomical contrasts.
- **Curriculum Catalog Updated.** In `src/features/lessons/sessions.ts`, added the 4 core section titles under Biology Chapter 1 Lesson 2 so students can browse syllabus topics clearly.
- **Strict Latin Digits & Style Rules.** Verified all numbers are in Latin digits (0-9) and no em dashes exist in student-facing prose (`npm run check:digits` passed).

## 29 Sep 2026 — 2-Day Bac II Simulation corrected to official 7-subject MoEYS Science Track schedule and score matrix

*Not committed yet.* **No database step needed.**

**Why.** Ensure the 2-Day Bac II Simulation accurately mirrors the official Ministry of Education, Youth and Sport (MoEYS) Grade 12 Science Track examination timetable and grading scale from `score.jpg`.

**What changed.**

- **Updated from 6 to 7 subjects.** The exam simulation now includes all 7 official Science Track subjects: History, Biology, Chemistry, Foreign Language (Day 1), and Khmer Literature, Physics, Mathematics (Day 2).
- **Official 2-Day Timetable Schedule.**
  - **Day 1 (4 subjects · 250 pts):**
    - Morning 1: History (ប្រវត្តិវិទ្យា) 07:30 - 08:30 (60 min) · 50 pts
    - Morning 2: Biology (ជីវវិទ្យា) 09:00 - 10:30 (90 min) · 75 pts
    - Afternoon 1: Chemistry (គីមីវិទ្យា) 14:00 - 15:30 (90 min) · 75 pts
    - Afternoon 2: Foreign Language (ភាសាបរទេស) 16:00 - 17:00 (60 min) · 50 pts
  - **Day 2 (3 subjects · 275 pts):**
    - Morning 1: Khmer Literature (អក្សរសាស្ត្រខ្មែរ) 07:30 - 09:00 (90 min) · 75 pts
    - Morning 2: Physics (រូបវិទ្យា) 09:30 - 11:00 (90 min) · 75 pts
    - Afternoon: Mathematics (គណិតវិទ្យា) 14:00 - 16:30 (150 min) · 125 pts
- **Official MoEYS Grade Scale Matrix.** Added a dedicated scoring matrix card derived directly from `score.jpg` displaying the 475 base points breakdown for Grade determination: Grade A (≥ 427 pts / 90%), Grade B (≥ 380 pts / 80%), Grade C (≥ 332 pts / 70%), Grade D (≥ 285 pts / 60%), and Grade E (≥ 237 pts / 50% passing threshold), with Foreign Language (50 pts) documented as an additional subject.
- **Updated Hub Card & Readiness Dialog.** `/exam` now highlights "2 ថ្ងៃពេញ 7 មុខវិជ្ជា", and the pre-exam readiness modal begins on Day 1 Session 1 with History (ប្រវត្តិវិទ្យា).
- **Latin Digits Standard.** All 283 files verified with `npm run check:digits`.

## 29 Sep 2026 — Three welcome screens before sign-in

Commit `74c4fb4`. **No database step needed.**

**Why.** A new student's first sight of the app was the sign-in screen. Before we ask them
for anything, we now show three short screens about why science is a good choice.

**What changed.**

- **Three screens, in Khmer:** more opportunities (university and scholarships), more paths
  after grade 12 (IT, engineering, AI and data, health and medicine), and science as more
  than formulas. Each one has its own picture and colour.
- **Move through them** with the big button, by swiping left and right, with the arrow keys
  on a laptop, or by tapping the dots. There is a back button from screen 2, and a
  **រំលង (skip)** link at the top for anyone who wants to go straight in.
- **Shown once per phone or computer.** After the last button it goes to the usual sign-in
  screen and does not come back, not even after logging out.
- **Who does NOT see it:** anyone already using the app (signed in, a guest, or with a name
  saved), and anyone who opened the link inside Telegram or Messenger. They still get the
  "open in your browser" screen first, and see the welcome screens there instead.

**What to re-test.**

- In a fresh browser or a private window, open the site: the three screens come first, then
  sign-in. Reload, and they should not show again.
- On a phone, swipe between the screens, and try the smallest phone you have. A long screen
  should scroll, with the text fading at the bottom rather than being cut off.
- Try both light and dark mode.

## 29 Sep 2026 — KruAI says hello

Commit `5e3f6be`. **No database step needed.**

**Why.** New students did not know that the round bot button in the corner is KruAI, the
study helper they can ask questions.

**What changed.**

- About a second after the app opens, a small bubble pops out beside the KruAI button:
  **"សួស្តី! តើមានអ្វីអាចឱ្យខ្ញុំជួយបាន?"** (or "Hi! What can I help you with?" in English).
- Tapping the bubble opens KruAI, just like tapping the button. Guests get the sign-in
  prompt, as before.
- It disappears by itself after 10 seconds, or straight away with the small ×.
- Once a student has found KruAI (tapped it, or closed the bubble), it never shows again on
  that phone or computer. If they just ignore it, it shows on up to 3 visits and then stops.
- It never appears on the welcome, sign-in or survey screens, or during exams.

**What to re-test.**

- Open the app fresh on a phone: the bubble appears next to the bot button and is readable.
- Tap ×, reload: it does not come back.
- On Home, the bot button looks fully bright while the bubble is showing.

## 28 Sep 2026 — The Math path is four lessons now

Commit `1e423d5`. **No database step needed.**

**Why.** The Math foundation path showed a single lesson, which said the whole foundation
review is one lesson long. It is not.

**What changed.**

- **Four lessons instead of one.** មេរៀនទី 1 keeps its six named sections (three of them
  written so far). មេរៀនទី 2, 3 and 4 have five sections each. The path is 21 circles now
  instead of 6, and the counter at the top reads 0/21.
- **The new lessons and their sections have NO names, on purpose.** The banner just reads
  "មេរៀនទី 2" and each circle shows only its number. Making up Khmer lesson names would put
  invented curriculum in front of a student, which is the one thing the app does not do.
  **Send me the real names whenever you have them** and they drop straight in.
- **The section numbers lost their leading "1.".** They read 1.1, 1.2 … 2.1, 2.2 … 4.5 rather
  than 1.1.1, 1.2.1 and so on. That first number was a chapter number, and this path has no
  chapters, so it referred to something the student never sees. The Bac II quiz paths already
  did it this way; the Study path was the odd one out.

**Nothing was lost.** Only the number shown on screen changed. Each section's internal id is
untouched, so finished work stays finished and the three written lessons still open normally.

**What to re-test.** Study → Math → មូលដ្ឋានគ្រឹះ. Scroll the whole path: four lesson
banners, the first three circles open, everything else labelled "coming soon".

## 28 Sep 2026 — "Coming soon" on every circle that is not written yet

Commit `57e0167`. **No database step needed.**

**Why.** You pointed at circles 1.1.4 and 1.1.5 on the Math path: full colour, a play
symbol, and nothing at all when you tap them. Nothing on screen said the lesson was not
written yet, so the only way to find out was to tap and get silence.

**What changed.**

- **Every circle with no lesson behind it now carries a “ឆាប់ៗនេះ” label.** Both kinds of
  path: the round circles on Study (Math, Biology and the rest) and the square badges on the
  Bac II quiz paths. The circle keeps its colour on purpose, because a whole path of greyed-out
  shapes reads as “you cannot have this” rather than “this is coming”. It still does nothing
  when tapped, which is correct: the label is there so you know that before tapping.
- **Screen readers are told too.** A locked circle used to be announced exactly like a playable
  one.

**I checked the rest of the app for the same problem and found none.** Subject tiles, practice
subject tiles, practice lesson rows, exam paper cards, the side menu rows and the video
placeholder all already say it. The Bac II simulation card is no longer a placeholder at all,
so it correctly says nothing.

**Also fixed: six more of the dashes.** Yesterday's sweep only searched one of the three ways
text is written in the code, so six were missed, including **two inside KruAI's instructions**.
That last one matters more than it sounds: the AI copies the punctuation style of its own
instructions into the answers students read, so a dash there reproduces itself every time it
replies.

**What to re-test.** Study → any subject → scroll down the path. Circles with no lesson yet
should be labelled. Then Practice → Quiz → Math, where every square except the first is not
written yet.

## 28 Sep 2026 — Math lesson 1.3 (Decimals), and two writing rules

Commit `dab914e`. **No database step needed.**

**Why.** Third section of the Math foundation lesson, plus two rules you asked for about how
every piece of text in the app is written.

**Math 1.3: ទសភាគ និងការបម្លែង is live** at circle 1.1.3. What a decimal is and place
value, converting between decimals, fractions and percentages both ways, adding, subtracting,
multiplying and dividing decimals, your three tips, the method, the key points and the five
common mistakes. Your ten exercises are in, split 5 on screen 1 (the conversions, which your
tips teach) and 5 on screen 2 (the arithmetic, which needs the rules on that screen). **All ten
of your answers were correct and no two options clashed**, unlike the fractions set. It has the
same video placeholder as 1.2, with no recording behind it yet.

**Your content arrived mostly in English this time**, so it was translated: the headings, the
steps, the shortcuts and the question stems (“Convert 0.5 to a fraction” and so on) are all
Khmer now. The maths, the examples and the answers are exactly yours. The column addition
showing how to line up the decimal point survived as a proper aligned sum, which took a little
care because the app collapses plain spaces.

**Rule 1: no dashes like this one in anything a student reads.** 55 were rewritten across the
app, each with whatever fitted: a full stop between two sentences, a Khmer colon before an
explanation, or brackets around an aside. Nine are left and they are not sentences at all: they
are the dash shown where a score or a grade does not exist yet. Tell me what you want in that
spot (a hyphen, a zero, or nothing) and I will change those too.

**Rule 2: student-visible Khmer stays Khmer.** “Tip 1”, “GCD”, “vs”, “Keep Change Flip”,
“Algebra” and “Limit” are Khmer now. Three things deliberately stay in English: science terms
a student meets on the exam paper, written Khmer-first with the English in brackets, like
ខួរធំ (Cerebrum) and pH; product words you chose earlier, like XP, Streak and KruAI; and the
English exam paper itself, plus the words a phone shows, like “Add to Home Screen”.

**Both rules are written into the developer notes**, so anything written from now on follows
them. Note that nothing checks them automatically, unlike the Latin-digits rule, so they depend
on being written correctly the first time.

**What to re-test.** Study → Math → មូលដ្ឋានគ្រឹះ → third circle, both screens. And read a few
screens elsewhere in the app (Home, Progress, the Game) to check nothing reads oddly after the
punctuation change.

## 28 Sep 2026 — Math lesson 1.2: Fractions

Commit `dab914e`. **No database step needed.**

**Why.** Second section of the Math foundation lesson. The first circle on the Math path was
the only one open; the second one is now written too.

**What changed.**

- **ប្រភាគ និងការសម្រួលប្រភាគ is live** at circle 1.1.2, written from the content you sent:
  what a fraction is, equivalent fractions, simplifying with the GCD, adding, subtracting,
  multiplying, dividing, and mixed numbers — plus your three tips, the four-step method, the
  key points and the four common mistakes.
- **All the fraction notation displays properly** — over a hundred fractions, the boxed answer,
  the "not equal" sign and the arrows. Checked at phone and laptop size, light and dark.
- **A video placeholder**, like Biology's: the poster, the play symbol and the player frame,
  with nothing behind it yet. It shows no running time, because stating one for a video that
  has not been recorded would be claiming something untrue.
- **"ឆាប់ៗនេះ" now appears on any video placeholder** — this section AND Biology. A student
  can now see there is no video yet without tapping to find out. The placeholder still does
  nothing when tapped, on purpose: it says what it is instead of pretending to be a button.
- **Your 15 exercises are in**, split 7 on screen 1 and 8 on screen 2. Screen 1 gets
  simplifying, multiplying and dividing — the three your Tips demonstrate. Screen 2 gets
  adding/subtracting with unlike denominators, mixed numbers and the algebra ones, because
  those need the written rules that are on screen 2.

**I found five questions with two options that are the same answer — you spotted two.**

- **Q5 and Q11** had the same option printed twice, which you flagged.
- **Q14** had the same one twice too (A and D were both the same expression).
- **Q8** offered `6/9` and `2/3`, which are the same number written two ways.
- **Q6 was the dangerous one.** It offered `1/2` and `2/4` — the same number, and `1/2` was the
  correct answer. A student choosing `2/4` would have been **right and marked wrong**.

Each duplicate was replaced with a wrong answer that comes from a real mistake, so the question
still teaches something. All 15 of your answers were correct. I also spread the correct answers
evenly across the four positions — in the order you sent them, 14 of 15 sat on A or B and none
on D.

**What to re-test.** Study → Math → មូលដ្ឋានគ្រឹះ → second circle. Read the Khmer: it was
transcribed from what you sent, not rewritten, but the section numbers were changed from Khmer
numerals to 2.1, 2.2 … because the whole app uses Latin digits for numbers a student sees, and
the fractions were all written in one consistent style.

**Still to come.** No video for this section — send a link and the placeholder becomes a real
player.

**Getting heavier, and worth acting on before long.** The file Home loads on first open (all
written lesson content) went from 60 KB to 75 KB with just this one section added — the growth
predicted in the previous entry, now measurable. It is not slow yet. It will be.

## 28 Sep 2026 — The lesson videos play, and Math lesson 1.1 is live

Commit `698aad7`. **No database step needed.**

**Why.** The video box at the top of a section was a picture of a player — your illustration
with a play button drawn on it, and nothing happened when you tapped it, because there was no
recording yet. There is one now. Separately, the whole Math foundation path was locked, so a
student who tapped Math found six greyed-out circles and nothing to do.

**What changed.**

- **The play button really plays.** Tapping it starts the video, in one tap, inside the lesson
  screen. The videos are hosted on YouTube as **unlisted** — not searchable, not public, only
  reachable from inside the app.
- **Nothing is downloaded from YouTube until you tap play.** This matters more than it sounds:
  a normal YouTube embed starts downloading roughly a megabyte the moment the page opens, for
  every student, whether or not they watch. Here the page opens with just our own small picture,
  and YouTube is contacted only when a student actually asks for the video. Checked and
  confirmed: zero contact with Google before the tap.
- **The video picks its own quality.** A student on a slow connection gets a smaller version
  automatically instead of waiting for it to buffer. That was the main reason for using YouTube
  rather than putting video files on our own server.
- **Math · ជំពូក 1 · មេរៀនទី 1 · ផ្នែកទី 1 — វិន័យនៃសញ្ញា is written and open.** The first circle
  on the Math path is now tappable. It has the video, the lesson in two screens, worked
  examples, tips, the key points, and the four mistakes students usually make with signs.
- **Formulas and tables now display properly inside lesson content.** They used to come out as
  raw code (`$$ (+3)+(+5)=+8 $$`). Maths lessons need this; it changes nothing for the biology
  sections, which have no formulas.

**What to re-test.**

1. Study → Math → មូលដ្ឋានគ្រឹះ → tap the first circle (1.1.1).
2. Tap the video. It should start playing on **one** tap, and stay inside the lesson screen
   rather than jumping to full screen.
3. Check the formulas and the plus/minus table on screen 2 look right, at phone size and in
   dark mode.
4. Read the Khmer. **It was transcribed from what you supplied, not rewritten** — but the
   section numbers were changed from Khmer numerals to 1.1, 1.2, 1.3, 1.4, because the whole app
   uses Latin digits for every number a student sees.

**The exercises.**

- **All 15 are in, split across the two screens.** Screen 1 gets Parts A and B (adding and
  subtracting signed numbers, 8 questions). Screen 2 gets Parts C and D (multiply/divide and
  the mixed ones, 7 questions). **The split is not arbitrary** — the plus/minus times table is
  printed on screen 2, so asking multiplication on screen 1 would be asking before teaching.
  Each screen needs its own questions answered before it will move on.
- **Every answer explains itself immediately** — the wrong one in pink, the right one in green,
  and the rule underneath, exactly the "show them where they went wrong" shape you asked for.
- **I found two mistakes in your answer key and fixed them.** Q13 `-5+8-(-3)` is 6 and the key
  said option C, but C was 10 — 6 was option B. Q15 `(-24)÷(-6)-5` is **-1**, not 1: that one
  had the letter AND the value wrong. All 15 were recomputed, not trusted.
- **I also reshuffled the options.** In the order you sent them the right answer was option B
  on 8 of the 15 — students spot that in a week and start guessing B. They are now spread
  evenly across ក./ខ./គ./ឃ., and each screen is balanced on its own. Only the ORDER changed;
  every option value is yours.

**Also fixed, and it affected every lesson, not just math.** Moving to the next screen used to
leave you scrolled at the BOTTOM of the new screen — so after a long screen you would press
Continue and see a footer, with the new content off-screen above you. It looked like the screen
had failed to load. Every screen now opens at the top: the section flow, the lesson flow, the
practice quiz, the Game battle and the flashcard review. (The past-paper exam already did this;
the other five were simply never given it.)

**Known and expected.**

- **Inside Telegram or Messenger's built-in browser the video may need a second tap.** Those
  apps can refuse to auto-start a video and there is nothing any website can do about it. The
  student just taps YouTube's own play button; nothing is stuck.
- **Worth checking on a real phone**, in Telegram, on a real mobile connection. Everything above
  was verified on a computer, which cannot prove how Telegram's browser behaves.

**One thing to look at separately, not caused by this change.** Home now loads all written
lesson content on first open — 60 KB today — because the new "Continue learning" list reads the
content catalogue to build itself. It grows with every lesson we write, so it is worth fixing
before there are many. Nothing is broken; the app just starts a little heavier than it needs to.

## 28 Sep 2026 — Home: "Continue Learning" and Missions You Have to Earn

Commit `53eb58f`. **No database step needed.**

**Why.** Home's Study list still showed the old lessons from the first version of the app,
none of the new content (biology sections, flashcard decks, the math quiz, past papers). And a
mission could be ticked just by tapping it, so the XP and the streak didn't mean anything.

**What changed.**
- **The Study card is now "Continue learning".** It shows up to 5 things to do next, built from
  the content that really exists: lessons, flashcard decks, quizzes and past papers. It puts
  first the flashcard decks you started, then decks that are due for review, then the next
  unfinished thing in each subject you've been studying. Adding new content makes it show up
  here automatically.
- **A new student sees "Recommended for you"** instead: the first lesson, deck and quiz of each
  subject, starting with the subjects they marked as weak in the survey.
- **Missions only tick when the work is done.** Tapping a mission now opens where to do it:
  - Complete a lesson → finish a lesson.
  - Practice quiz → finish a quiz.
  - Study flashcards → finish a flashcard review.
  - Daily challenge → finish a Game battle or an exam.

  The Roadmap's "Done" button was removed for the same reason.

**What to re-test.**
- A brand-new account: Home should say "Recommended for you".
- After finishing a section: it should say "Continue learning", and "Complete a lesson" should
  be ticked.
- Tapping a mission should never tick it.

## 28 Sep 2026 — The Signature Box Now Says "Sign Here"

Commit `53eb58f`. **No database step needed.**

**Why.** On the commitment screen, the signature box was an empty dark rectangle. Most students
did not know they were meant to draw their signature in it.

**What changed.** The empty box now shows **"សូមចុះហត្ថលេខា"** (English: "Sign here") in the
middle, with a small pen icon. The text disappears as soon as the student starts drawing, and
comes back if they tap **Clear**.

**What to re-test.** Open the commitment pledge and check the text is in the middle of the box.
Draw in it (the text should disappear), then tap Clear (it should come back).

## 28 Sep 2026 — BrachNha Can Be Installed on the Home Screen

Commit `c3c8f6e`. **No database step needed.**

**Why.** Students open BrachNha from a link every time. Installing it puts the BrachNha icon on
their phone's home screen, like a normal app. It opens full screen, with no browser bar.

**What changed.**
- **A pop-up offers to install the app** at two moments:
  - **When the app opens.** If the student taps "Not now", it stays away for 3 days, so it
    doesn't appear on every visit.
  - **After they finish their first lesson.** This one appears once per phone. It waits until
    they leave the lesson screen. It never appears in the middle of a lesson or an exam.
- **Android (Chrome):** the pop-up has an **Install** button. Tapping it opens the phone's own
  install screen.
- **iPhone:** Apple doesn't let websites show an install button, so the pop-up shows the two
  steps instead: tap **Share**, then **Add to Home Screen**.
- **Inside Telegram or Messenger** nothing appears. Installing isn't possible there.
- **New home-screen icon**, made from the BrachNha logo.
- **If the installed app is opened with no internet**, it shows a short "You're offline, try
  again" page instead of the browser's error page.

**This is not connected to Google sign-in** and doesn't go through any Google review.

**Please re-test on a real phone after this is deployed** (it can't be tested on localhost):
1. Android Chrome: open the site and wait about 2 seconds. The pop-up should appear. Tap
   **Install**. The BrachNha icon should appear on the home screen and open full screen.
2. iPhone Safari: the pop-up should show the Share → Add to Home Screen steps. Follow them and
   check the icon.
3. Finish a lesson and leave the lesson screen. The "Nice work — lesson done!" pop-up should
   appear once. It should not appear again after the next lesson.
4. Open the installed app with Wi-Fi and mobile data off. You should see the offline page.

## 28 Sep 2026 — KruAI: Privacy Fix, Faster Fallback Between Keys, Cleaner Textbook Lookup

Commit `c3c8f6e`. **No database step needed.** No change to how the chat looks.

**Why.** A review of the KruAI chatbot after the switch to several free API keys found:
- **A privacy problem.** KruAI remembered its answers and handed the same answer to the next
  student who typed the same words. But every answer is written for one student: it can use
  their name, their weak subjects and their exam average. So student B could get an answer
  addressed to student A. Short follow-ups like "why?" were also replayed into other people's
  conversations, where they made no sense.
- **Slow answers when a key ran out.** When one of the free keys has used up its daily limit,
  Google sometimes waits about 30 seconds before saying so. Every few questions a student was
  left staring at an empty bubble for half a minute.
- **Wrong ready-made answers.** Some prepared answers were triggered too easily. For example,
  "which part of the brain stem controls breathing" got the general "three parts of the brain"
  answer.
- **Unrelated textbook pages in the background.** Even "hi" pulled textbook pages into what
  KruAI reads before answering, which slows it down and can pull the answer off topic.

**What changed.**
- The memory of past answers is **removed**. Each student gets an answer written for them.
  The hand-written answers (for example mitosis vs meiosis, or Mendel's laws) are kept. They
  are only used for the first question in a chat, only when the question is really that
  question, and only for signed-in students.
- When a key is out of quota or slow, KruAI now gives up on it after 10 seconds, tries the
  next key, and skips the tired key for the next few minutes. In testing, the worst wait went
  from about 33 seconds to about 13, and every question after that answered in about 2 seconds.
- A broken key is skipped straight away instead of being tried again with every model.
- If a student closes the chat mid-answer, KruAI stops generating it (this saves quota).
- The textbook lookup now only pulls a page when the question actually names its topic.

**Worth deciding (not a code change).** On Google's free tier, what students type may be
used by Google to improve its products and may be read by reviewers. KruAI's instructions
include the student's name and study profile. Also, spreading use across several free
accounts to get more free quota may go against Google's usage terms. Worth reading Google's
current Gemini API terms before using KruAI in a real classroom.

**What to re-test.**
1. Sign in, open KruAI and ask "compare mitosis and meiosis". A table answer appears instantly.
2. Ask the same thing again as a follow-up in the same chat. KruAI writes a fresh answer.
3. Ask a few normal questions. Answers should start within a couple of seconds.

## 28 Sep 2026 — Fix Chemistry KaTeX Formula Formatting & Expand check:quiz Verification to Game Questions

Commit `pending`. **No database step needed.**

**Why.** When reviewing Chemistry questions in Game Mode (e.g. Question 6 on buffer solutions), formulas were rendering as broken raw LaTeX code (such as `$pH = pK_a + \log\frac{[\text{បាស}]}{[\text{អាស៊ីត}]}$`) rather than typeset math. KaTeX fonts lack Khmer glyph coverage, so `src/utils/math-render.ts` deliberately skips rendering any `$…$` math segment containing Khmer characters to prevent rendering tofu boxes. Additionally, `scripts/check-quiz.mjs` was only checking practice quizzes and past papers, allowing broken math formulas in `GAME_QUESTIONS` to slip past automated checks.

**What changed.**
- **Chemistry Formula Normalization (`src/data/game-questions.ts`):**
  - **Henderson-Hasselbalch Buffer Equation (Medium Q4):** Replaced Khmer terms inside LaTeX math delimiters with standard chemical notation `$pH = pK_a + \log\frac{[\text{Base}]}{[\text{Acid}]}$` and $\frac{[\text{Base}]}{[\text{Acid}]} = 1$, keeping the Khmer explanation cleanly in adjacent prose so KaTeX typesets the fractions, logs, and subscripts properly.
  - **Chemical Equilibrium & Heat (Basic Q5):** Fixed `$A_{(g)} + B_{(g)} \rightleftharpoons C_{(g)} + \text{កម្តៅ}$` by placing `+ កម្តៅ` outside math delimiters (`$A_{(g)} + B_{(g)} \rightleftharpoons C_{(g)}$ + កម្តៅ`), preventing split math segments with dangling operators.
  - **Reaction Rate & Equilibrium (Hard Q2, Q6, Q9):** Removed Khmer subscripts inside LaTeX (`v_{\text{បំបាត់}}`, `n_{\text{ឧស្ម័នផល}}`, `n_{\text{សាប៊ូ}}`) and replaced them with standard symbols (`$v$`, `$n_{\text{products}} - n_{\text{reactants}}$`, `$n = 3 \times n_{\text{triglyceride}}$`) while providing the Khmer definitions directly in the explanation sentences.
- **Mathematics Past Papers Formula Fix (`src/data/papers/math-2025.ts`):**
  - Moved Khmer terms out of math delimiters in `g11` options and explanation (`$S = 10\ln 2 - 6\ln 3$ ឯកតាផ្ទៃ`).
- **Expanded Verification Harness (`scripts/check-quiz.mjs`):**
  - Added full test coverage for all 120 questions across all 4 subjects in `src/data/game-questions.ts` (Mathematics, Biology, History, Chemistry).
  - `npm run check:quiz` now verifies every question stem (`q.en`, `q.km`), explanation, option text, option uniqueness, and correct option key across both quizzes, past papers, and game matches.

**What to re-test.**
1. Open Game mode and play or review Chemistry match questions (e.g. buffer solution question, equilibrium questions).
2. Verify that the Henderson-Hasselbalch equation and all reaction rate / equilibrium formulas render crisply with proper mathematical formatting (fractions, logarithmic bases, subscripts) rather than raw LaTeX syntax.

## 28 Sep 2026 — Grade 12 Mathematics: Chapter 1 (Limits) OCR & KruAI RAG Grounding

Commit `pending`. **No database step needed.**

**Why.** Grade 12 Mathematics carries the highest weight in the Bac II National Examination. To equip KruAI with authoritative textbook explanations and worked problem solutions for **Chapter 1: Limits of Functions**, we transcribed the official MoEYS Grade 12 Mathematics summary textbook (`Math summary.pdf`, Book pp. 3–18) and connected it to KruAI's real-time retrieval grounding (RAG).

**What changed.**
- **High-Fidelity MoEYS Mathematics Transcription (`sources/ocr/Math summary/chapter1-limits.md`):**
  - Rendered high-resolution pages locally (PDF pp. 6–21) without consuming AI API quota.
  - Transcribed all foundational definitions, operation limit rules, indeterminate form removal techniques, composite function limits, squeeze theorem, trigonometric limits, exponential limits, and natural logarithm limits.
  - Transcribed all 19 model Bac II exercise solutions with step-by-step LaTeX formulas, conjugate multiplier expansions, and factorization methods.
- **KruAI Math RAG Knowledge Grounding (`server/textbook-search.ts`, `server/chat-handler.ts`):**
  - Created 10 structured textbook knowledge modules covering operational rules, indeterminate forms, trigonometric limits, exponential/logarithmic limits, and worked Bac II exercises.
  - Implemented `searchMathTextbook()` with multi-keyword matching for Khmer and English mathematical terms.
  - Wired KruAI's streaming chat endpoint to automatically retrieve up to 3 relevant MoEYS textbook excerpts when students ask math questions, ensuring responses adhere strictly to the MoEYS exam criteria and step-by-step layout.

**How to test.**
1. Open KruAI mentor chat and ask a question about limits in Khmer or English, e.g., "របៀបគណនាលីមីតរាង 0/0 ដែលមានរ៉ាឌីកាល់" or "How to solve limit (sqrt(x+1)-2)/(x-3) as x approaches 3". Verify that KruAI replies with the MoEYS step-by-step structure and cites the textbook method.


## 28 Sep 2026 — Game Mode: Biology Hard Questions Added (Complete 30-Question Biology Pool)

Commit `pending`. **No database step needed.**

**Why.** To complete the full three difficulty tiers (Basic, Medium, Hard) for Biology in Game mode (`/game`), 10 advanced Grade 12 Bac II calculation and mechanism questions were authored for the **Hard** difficulty tier. The authored Biology pool now reaches a full 30 questions (10 Basic, 10 Medium, 10 Hard), joining Mathematics, History, and Chemistry with complete competition pools.

**What changed.**
- **Authored 10 Biology Hard Competition Questions ([`src/data/game-questions.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/game-questions.ts)):**
  - Covers quantitative calculations, molecular genetics, and complex physiological mechanisms:
    - **DNA Quantitative Calculations (សំណួរទី 1):** Calculating total nucleotides ($N = \frac{2L}{3.4} = 3000$) and hydrogen bonds ($H = 2A + 3G = 3900$) using Chargaff's rules from DNA length $L = 5100\text{ Å}$ and $A = 600$.
    - **Translation & Polypeptide Assembly (សំណួរទី 2):** Calculating amino acid count ($298$) and peptide bonds ($297$) from a 900-nucleotide mRNA chain accounting for stop codon elimination and N-terminal methionine excision.
    - **Semi-Conservative DNA Replication (សំណួរទី 3):** Meselson-Stahl $^{15}\text{N}/^{14}\text{N}$ isotope ratio calculation yielding a $1:3$ ratio of hybrid to light DNA molecules after 3 replication generations.
    - **Action Potential Ion Fluxes (សំណួរទី 4):** Voltage-gated $Na^+$ channel opening triggering depolarization ($+30\text{ mV}$) followed by $Na^+$ channel inactivation and voltage-gated $K^+$ efflux driving repolarization.
    - **Resting Potential & Ion Pump (សំណួរទី 5):** Maintenance of $-70\text{ mV}$ resting membrane potential via electrogenic $Na^+/K^+$ ATPase pump exporting $3\text{ Na}^+$ and importing $2\text{ K}^+$ per ATP consumed.
    - **Angiosperm Double Fertilization (សំណួរទី 6):** Ploidy deductions for the two simultaneous fertilizations: first sperm ($n$) fusing with egg ($n$) to form diploid zygote ($2n$); second sperm ($n$) fusing with central polar nuclei ($2n$) to form triploid endosperm ($3n$).
    - **Endocrine Axis & Negative Feedback (សំណួរទី 7):** Elevated thyroxine ($T_3, T_4$) acting on the hypothalamus (reducing TRH) and anterior pituitary (inhibiting TSH) to restore homeostatic levels.
    - **Enzyme Inhibition Mechanisms (សំណួរទី 8):** Distinguishing competitive inhibitors (binding active site, reversible with excess substrate) from non-competitive inhibitors (binding allosteric site, altering active site conformation).
    - **Mendelian Blood Group Inheritance (សំណួរទី 9):** Cross between heterozygous type A ($I^A i$) and type B ($I^B i$) parents yielding a $25\%$ ($1/4$) probability of having a type O ($ii$) child.
    - **Sex-Linked Inheritance (សំណួរទី 10):** Hemophilia carrier mother ($X^H X^h$) and normal father ($X^H Y$) offspring probability, yielding a $50\%$ chance that a male child inherits the disease ($X^h Y$).
- **Strict Compliance:**
  - **Authentic Khmer Curriculum:** Questions written in natural Khmer without English translations, keeping `en` and `km` aligned.
  - **Latin Digits Only (0-9):** Strict compliance with `scripts/check-digits.mjs` (0 Khmer numerals across all 270 files).
  - **Balanced Option Distribution:** Correct answers distributed evenly (3 `ក`, 2 `ខ`, 3 `គ`, 2 `ឃ`), avoiding clustering on option 1.

## 28 Sep 2026 — Game Mode: Biology Medium Questions Added (20 Biology Questions Authored)

Commit `pending`. **No database step needed.**

**Why.** To expand the Biology competition pool in Game mode (`/game`), 10 Grade 12 Bac II competition questions were authored for the **Medium** difficulty tier. Combined with the 10 Basic questions, the Biology pool now stands at 20 authentic curriculum questions.

**What changed.**
- **Authored 10 Biology Medium Competition Questions ([`src/data/game-questions.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/game-questions.ts)):**
  - Covers conceptual mechanisms, comparisons, and physiological processes from MoEYS Chapters 1–4:
    - **Plant Anatomy & Monocots vs Dicots (សំណួរទី 1):** Ring vascular bundle arrangement, net-like venation, 2 cotyledons, and taproot system distinguishing dicotyledons.
    - **Stomatal Mechanisms (សំណួរទី 2):** Osmotic opening of stomata powered by active $K^+$ ion influx into guard cells making them turgid.
    - **Tropisms & Auxin Distribution (សំណួរទី 3):** Unilateral light causing auxin relocation to the shaded side, promoting faster cell elongation and positive phototropic curvature.
    - **Spinal Reflex Arc (សំណួរទី 4):** 5-step sequence of neural transmission (Receptor $\rightarrow$ Sensory neuron $\rightarrow$ Spinal cord interneuron $\rightarrow$ Motor neuron $\rightarrow$ Effector muscle).
    - **Autonomic Nervous System (សំណួរទី 5):** Sympathetic "fight-or-flight" physiological shifts (pupil dilation, elevated heart rate, bronchial dilation, inhibited digestion).
    - **Sensory Accommodation (សំណួរទី 6):** Ciliary muscle contraction and ligament relaxation causing the lens to thicken for near focus.
    - **Endocrine Calcium Homeostasis (សំណួរទី 7):** Antagonistic actions of Calcitonin (lowers blood $Ca^{2+}$) and Parathyroid Hormone / PTH (elevates blood $Ca^{2+}$).
    - **Hormone Signaling Mechanisms (សំណួរទី 8):** Lipid-soluble steroid hormones directly diffusing across the plasma membrane to intracellular receptors vs. water-soluble peptide hormones requiring cell-surface receptors.
    - **Protein Higher-Order Structures (សំណួរទី 9):** Hydrogen bonds between $>\text{C}=\text{O}$ and $-\text{NH}-$ of the polypeptide backbone stabilizing $\alpha$-helices and $\beta$-pleated sheets in secondary structure.
    - **Enzyme Kinetics & Denaturation (សំណួរទី 10):** Thermal disruption of hydrogen bonds above optimum temperature causing active site loss (denaturation).
- **Strict Compliance:**
  - **Authentic Khmer Curriculum:** Natural Khmer phrasing without artificial English translations, keeping `en` and `km` aligned.
  - **Latin Digits Only (0-9):** Strict compliance with `scripts/check-digits.mjs` (0 Khmer numerals across all 270 files).
  - **Balanced Option Distribution:** Correct answers distributed evenly (3 `ក`, 2 `ខ`, 3 `គ`, 2 `ឃ`), avoiding clustering on option 1.

## 28 Sep 2026 — Game Mode: Biology Basic Questions Added (Subject Unlocked on /game)

Commit `pending`. **No database step needed.**

**Why.** To unlock the **Biology** subject card in 1v1 Game match mode (`/game`), 10 authentic Grade 12 Bac II competition questions were authored for the **Basic** (`easy`) difficulty tier based on official MoEYS curriculum summaries (Chapters 1, 3, and 4). With content in `GAME_QUESTIONS`, the Biology card automatically transitions from "ឆាប់ៗនេះ" to active and selectable on `/game/create`.

**What changed.**
- **Authored 10 Biology Basic Competition Questions ([`src/data/game-questions.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/game-questions.ts)):**
  - Covers fundamental MoEYS Grade 12 Biology concepts:
    - **Gymnosperms (សំណួរទី 1):** Defining characteristic of Gymnosperms (naked seeds on cone scales without fruit/ovary protection).
    - **Nervous System & Neurons (សំណួរទី 2–3):** Three core structural components of a neuron (cell body / soma, dendrites, axon); and the synaptic junction transmitting action potentials via neurotransmitters.
    - **Receptor Organs (សំណួរទី 4–5):** Retina photoreceptors (cones for daytime color vision vs. rods for dim light); and the semicircular canals of the inner ear maintaining dynamic balance during head rotations.
    - **Endocrine System (សំណួរទី 6–7):** The pituitary gland as the "master gland" directing other endocrine organs; and insulin secretion by pancreatic $\beta$-cells lowering blood glucose toward normal homeostatic levels (~1 g/L).
    - **Proteins & Enzymes (សំណួរទី 8–10):** The 20 fundamental amino acid monomers of proteins; covalent peptide bonds linking amino acids into primary structure; and the biological catalytic function of enzymes accelerating cellular metabolic reactions by lowering activation energy.
- **Strict Compliance:**
  - **Latin Digits Only:** Zero Khmer numerals across all options, questions, and explanations. Verified via `npm run check:digits`.
  - **Balanced Option Distribution:** Correct answers distributed evenly across options (3 `ក`, 2 `ខ`, 3 `គ`, 2 `ឃ`), preventing answer clustering.
  - **Bilingual Support:** Full English and Khmer prompts `{ en, km }` for every question.

## 28 Sep 2026 — Game Mode: Chemistry Hard Questions Added (Complete 30-Question Chemistry Pool)

Commit `pending`. **No database step needed.**

**Why.** To complete the full three difficulty tiers (Basic, Medium, Hard) for Chemistry in Game mode (`/game`), 10 advanced Grade 12 Bac II Chemistry calculation questions were authored for the **Hard** difficulty, bringing the authored Chemistry question pool to 30 questions.

**What changed.**
- **Authored 10 Chemistry Hard Competition Questions ([`src/data/game-questions.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/game-questions.ts)):**
  - Covers advanced and quantitative Bac II Grade 12 Chemistry curriculum:
    - **Chemical Kinetics (សំណួរទី 1–2):** Determining rate law and reaction orders from initial rate data ($2A + B \rightarrow C \implies v = k[A]^2[B]$); and calculating instantaneous rate of disappearance from tangent slopes on $[H_2O_2]$ decomposition concentration-time graphs ($v = 2.0 \times 10^{-4}\text{ mol}\cdot\text{L}^{-1}\cdot\text{s}^{-1}$).
    - **Acids, Bases & Titrations (សំណួរទី 3–5):** $pH$ calculation of weak acid $HCOOH$ via $[H_3O^+] = \sqrt{K_a \cdot C} \approx 4.24 \times 10^{-3}\text{ M} \implies pH = 2.37$; degree of ionization $\alpha = \frac{[H_3O^+]}{C} \times 100\% = 2\%$; and weak acid-strong base titration equivalence point characterization ($CH_3COO^-$ hydrolysis producing basic solution with $pH > 7$).
    - **Chemical Equilibria (សំណួរទី 6–7):** Ideal gas equilibrium relation $K_p = K_c(RT)^{\Delta n}$ for $N_2O_4(g) \rightleftharpoons 2NO_2(g) \implies K_p = K_c(RT)$; and ICE table equilibrium calculation for $2HI(g) \rightleftharpoons H_2(g) + I_2(g) \implies K_c = \frac{1}{36}$.
    - **Organic Chemistry & Biochemistry (សំណួរទី 8–10):** Le Chatelier shift and quadratic solving for ester equilibrium yield under excess alcohol ($x \approx 0.90\text{ mol}$); molar mass deduction of fatty acid from triglyceride saponification soap yield ($M(R-COOH) = 284\text{ g/mol}$ corresponding to stearic acid $C_{17}H_{35}COOH$); and amino acid isoelectric point calculation ($pI = \frac{2.34 + 9.69}{2} \approx 6.02$) with zwitterion dipole form.
  - **Balanced Option Distribution:** Correct answers distributed evenly across positions (`ក`: 3, `ខ`: 2, `គ`: 3, `ឃ`: 2), avoiding clustering on option 1.
  - **Latin Digits Enforced:** Strict Latin digits (0-9) used across all questions, options, formulas, and explanations in compliance with `npm run check:digits`.
  - **Comprehensive Explanations:** Detailed worked mathematical steps and chemical rationales provided for student review.

**What to re-test.**
- Navigate to `/game/create`.
- Select Chemistry ("គីមីវិទ្យា") and the **Hard** ("ពិបាក") or **Mix** ("ចម្រុះ") difficulty chip.
- Start a competition and play through the 10 questions.
- Verify options, rate laws, ICE tables, answer review, and explanations display correctly.

## 28 Sep 2026 — Biology Curriculum: MoEYS Summary PDF Chapter 4 Extracted, KruAI Grounding & Flashcards Added

Commit `pending`. **No database step needed.**

**Why.** To provide authentic, high-yield Grade 12 Bac II exam preparation for Biology Chapter 4 ("នាទីរបស់ប្រូតេអ៊ីនក្នុងសារពាង្គកាយ" / Role of Proteins in Organisms), the official MoEYS Biology Summary PDF (Pages 24–31) was extracted, transcribed, and integrated across the study path, KruAI AI search grounding, and flashcard practice.

**What changed.**
- **Transcribed Official MoEYS Chapter 4 Summary Material (Pages 24–31):**
  - **Lesson 1: អាស៊ីតអាមីណេ (Amino Acids, Pages 24–27):** General structure of amino acids (central carbon, amino group $-\mathrm{NH_2}$, carboxyl group $-\mathrm{COOH}$, hydrogen $-\mathrm{H}$, variable radical $-\mathrm{R}$); amphoteric nature and zwitterion form at $\mathrm{pH = 7}$; the 20 standard amino acids; neurotransmitter and metabolic roles (Gly, Glu, Ser, Tyr, Arg, Citrulline, Ornithine); peptide bond formation ($-\mathrm{CO-NH}-$) via condensation; and dipeptides, tripeptides, polypeptides, and proteins.
  - **Lesson 2: ប្រូតេអ៊ីន (Proteins, Pages 27–29):** The 4 structural levels of proteins: Primary (amino acid sequence linked by peptide bonds), Secondary ($\alpha$-helix and $\beta$-pleated sheet stabilized by hydrogen bonds), Tertiary (3D globular folding stabilized by hydrogen bonds, ionic bonds, hydrophobic interactions, and disulfide $-\mathrm{S-S}-$ bridges; protein domains), and Quaternary (multi-subunit assemblies like hemoglobin with 4 chains and heme-$Fe^{2+}$); 6 essential protein functions (catalytic, structural, contractile/movement, defensive, regulatory/hormonal, and transport); fibrous vs. globular proteins; simple vs. conjugated proteins; and denaturation factors (heat $>45\text{--}60^\circ\text{C}$, extreme $\mathrm{pH}$, heavy metals $\mathrm{Hg/Pb}$, detergents, salt concentration, mechanical agitation).
  - **Lesson 3: អង់ស៊ីម (Enzymes, Pages 29–31):** Biological catalysis mechanism and activation energy reduction; high catalytic efficiency (catalase decomposes $5\text{ million}$ $\mathrm{H_2O_2}$ molecules/min); lock-and-key / induced fit specificity; suffix "-ase"; 6 major enzyme classes (Oxidoreductases, Transferases, Hydrolases, Lyases, Isomerases, Ligases/Synthetases); and factors influencing enzyme activity (optimum temperature $40\text{--}45^\circ\text{C}$, reversible low-temperature inactivation at $0^\circ\text{C}$, thermal denaturation, optimum $\mathrm{pH}$ curves for pepsin, amylase, and trypsin, substrate/enzyme concentration saturation $V_{\max}$, and organic coenzymes / inorganic metal cofactors).
- **Enriched KruAI Search Grounding ([`server/textbook-search.ts`](file:///e:/Kru%20AI/Brachnha-v2/server/textbook-search.ts)):**
  - Added 5 rich textbook search chunks (`BIOLOGY_CH4_SECTIONS`):
    - `tb:bio:ch4:amino-acid-structure-peptides`
    - `tb:bio:ch4:protein-structures-four-levels`
    - `tb:bio:ch4:protein-functions-denaturation`
    - `tb:bio:ch4:enzyme-catalysis-classification`
    - `tb:bio:ch4:enzyme-activity-factors`
  - Integrated into `searchBiologyTextbook()` so student questions about protein folding, peptide bonds, denaturation, or enzyme kinetics receive exact MoEYS curriculum-grounded answers.
- **Added 24 Official Flashcards ([`src/data/practice.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/practice.ts)):**
  - Authored complete practice decks for Chapter 4:
    - `biology-4-1`: 8 cards covering amino acid structure, amphoteric zwitterion, 20 amino acids, peptide bonds, condensation, and hydrolysis.
    - `biology-4-2`: 8 cards covering 4 protein structural levels, domains, 6 protein functions, fibrous vs globular, simple vs conjugated, and denaturation mechanisms.
    - `biology-4-3`: 8 cards covering enzyme catalysis, lock & key specificity, 6 enzyme classes, hydrolase substrates, temperature curves, optimum pH, saturation kinetics, and cofactors.
- **Updated Section Titles on Study Path ([`src/features/lessons/sessions.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/features/lessons/sessions.ts)):**
  - Replaced generic placeholder labels with authentic MoEYS section titles for Lesson 4.1 ("ទម្រង់អាស៊ីតអាមីណេ", "ប្រភេទនៃអាស៊ីតអាមីណេ", "ចំណងប៉ិបទីត"), Lesson 4.2 ("រូបផ្គុំ និងទម្រង់ទាំង 4 របស់ប្រូតេអ៊ីន", "នាទីទាំង 6 របស់ប្រូតេអ៊ីន", "ចំណាត់ថ្នាក់ និងការបាត់បង់គុណភាព"), and Lesson 4.3 ("លក្ខណៈទូទៅនៃអង់ស៊ីម", "ចំណាត់ថ្នាក់អង់ស៊ីមទាំង 6 ក្រុម", "កត្តាមានឥទ្ធិពលលើអង់ស៊ីម").
- **Latin Digits Enforced:** Ran `npm run check:digits` verifying 100% compliance across all new Khmer content.

**What to re-test.**
- Navigate to `/practice`. Select Biology and check that Flashcard decks for Lessons 4.1, 4.2, and 4.3 are available and interactive.
- Open KruAI chat (`/chat`) and test asking questions about proteins or enzymes (e.g. "តើប្រូតេអ៊ីនមានទម្រង់ប៉ុន្មានកម្រិត?", "តើសីតុណ្ហភាពមានឥទ្ធិពលយ៉ាងដូចម្តេចលើអង់ស៊ីម?").
- Navigate to `/subjects/biology` and verify the path displays real section titles for Chapter 4 Lessons 1, 2, and 3.

## 28 Sep 2026 — Game Mode: Chemistry Medium Questions Added

Commit `pending`. **No database step needed.**

**Why.** Following the Basic tier, 10 intermediate Grade 12 Bac II Chemistry questions were authored for the **Medium** difficulty tier in Game mode (`/game`), adding calculations and deeper chemical principles across chemical kinetics, acid-base equilibria, and organic chemistry.

**What changed.**
- **Authored 10 Chemistry Medium Competition Questions ([`src/data/game-questions.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/game-questions.ts)):**
  - Covers key Grade 12 Bac II Chemistry topics:
    - **Chemical Kinetics (សំណួរទី 1–2):** Calculating average rate of product formation from concentration changes ($V_m(C) = \frac{\Delta [C]}{\Delta t} = 3.0 \times 10^{-3}\text{ mol}\cdot\text{L}^{-1}\cdot\text{s}^{-1}$); relating reaction rates using stoichiometric coefficients ($2A + 3B \rightarrow 4C \implies V(C) = 2 \cdot V(A) = 0.08\text{ mol}\cdot\text{L}^{-1}\cdot\text{s}^{-1}$).
    - **Acids and Bases (សំណួរទី 3–4):** $pH$ calculation of strong base $NaOH$ from $[OH^-] = 1.0 \times 10^{-4}\text{ M} \implies pOH = 4 \implies pH = 10$; Henderson-Hasselbalch equation for equimolar buffer solution ($CH_3COOH/CH_3COONa \implies pH = pK_a = 4.75$).
    - **Chemical Equilibrium (សំណួរទី 5–6):** Equilibrium constant expression $K_c = \frac{[SO_3]^2}{[SO_2]^2 [O_2]}$ for $2SO_2 + O_2 \rightleftharpoons 2SO_3$; Le Chatelier's principle with pressure increase on $N_2(g) + 3H_2(g) \rightleftharpoons 2NH_3(g)$ shifting towards fewer gas moles (forward reaction).
    - **Organic Chemistry (សំណួរទី 7–10):** Saponification of esters with hot $NaOH$ producing carboxylate salts (soap) and alcohols; acid hydrolysis of triglycerides yielding glycerol (propan-1,2,3-triol) and 3 fatty acid molecules; basicity of amines due to nitrogen's lone electron pair accepting a proton $H^+$; and peptide bond ($-\text{CO}-\text{NH}-$) condensation between amino acids.
  - **Balanced Option Distribution:** Correct answers distributed evenly across positions (`ក`: 3, `ខ`: 2, `គ`: 3, `ឃ`: 2), avoiding clustering on option 1.
  - **Latin Digits Enforced:** Strict Latin digits (0-9) used in all concentrations, scientific notation, steps, and formulas in compliance with `npm run check:digits`.
  - **Comprehensive Explanations:** Step-by-step mathematical calculations and chemical explanations provided for student review.

**What to re-test.**
- Navigate to `/game/create`.
- Select Chemistry ("គីមីវិទ្យា") and the **Medium** ("មធ្យម") difficulty chip.
- Start a competition and play through the 10 questions.
- Verify KaTeX chemical formulas, rate calculations, answer review, and explanations display correctly.

## 28 Sep 2026 — Game Mode: Chemistry Basic Questions Added & Subject Enabled

Commit `pending`. **No database step needed.**

**Why.** To expand the Game feature (`/game`) with authentic Grade 12 Bac II Chemistry preparation, 10 foundational Chemistry questions were authored for the **Basic** difficulty tier. Adding these questions automatically unlocks Chemistry as a playable subject on the Game setup screen (`/game/create`).

**What changed.**
- **Authored 10 Chemistry Basic Competition Questions ([`src/data/game-questions.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/game-questions.ts)):**
  - Covers core Grade 12 Bac II Chemistry concepts:
    - **Chemical Kinetics (សំណួរទី 1–2):** Reaction rate factors (temperature, reactant concentration, effective collisions); catalyst mechanisms (reducing activation energy, remaining chemically unchanged).
    - **Acids and Bases (សំណួរទី 3–4):** Brønsted-Lowry acid definition (proton $H^+$ donor); pH calculation of hydrochloric acid ($[H_3O^+] = 10^{-3}\text{ M} \implies pH = 3$).
    - **Chemical Equilibrium (សំណួរទី 5):** Le Chatelier's principle applied to an exothermic reaction ($A_{(g)} + B_{(g)} \rightleftharpoons C_{(g)} + \text{Heat}$) shifting reverse upon temperature increase.
    - **Organic Chemistry (សំណួរទី 6–10):** Ester functional group ($-\text{COO}-$); direct esterification reactants ($\text{R-COOH} + \text{R'-OH} \rightleftharpoons \text{R-COOR'} + \text{H}_2\text{O}$ with concentrated $\text{H}_2\text{SO}_4$); esterification characteristics (slow, athermic, reversible/equilibrium); IUPAC nomenclature for propanoic acid ($\text{CH}_3-\text{CH}_2-\text{COOH}$); and amine classification (primary amine $\text{CH}_3-\text{NH}_2$).
  - **Balanced Option Distribution:** Correct answers distributed evenly across positions (`ក`: 3, `ខ`: 2, `គ`: 3, `ឃ`: 2), avoiding clustering on option 1.
  - **Latin Digits Enforced:** Strict Latin digits (0-9) used in all formulas, concentrations, classifications, and explanations in compliance with `npm run check:digits`.
  - **Subject Unlocking:** Chemistry is now automatically active in `gameSubjects()` and selectable on `/game/create`.

**What to re-test.**
- Navigate to `/game/create`.
- Verify Chemistry ("គីមីវិទ្យា") is active and selectable alongside Mathematics and History.
- Start a competition with **Basic** ("មូលដ្ឋាន") difficulty and play through the 10 questions.
- Verify KaTeX chemical formulas, answer review, and explanations display correctly.

## 28 Sep 2026 — Biology Curriculum: MoEYS Summary PDF Chapter 3 Extracted, KruAI Grounding & Flashcards Added

Commit `pending`. **No database step needed.**

**Why.** To provide authentic, high-yield Grade 12 Bac II exam preparation for Biology Chapter 3 ("តម្រូវផ្សេងៗរបស់សារពាង្គកាយ" / Various Regulations of the Organism), the official MoEYS Biology Summary PDF was transcribed and integrated across the study path, KruAI AI search grounding, and flashcard practice.

**What changed.**
- **Transcribed Official MoEYS Chapter 3 Summary Material (Pages 6–24):**
  - **Lesson 1: ប្រព័ន្ធប្រសាទ (Nervous System, Pages 6–11):** Invertebrate vs vertebrate nerve organization, neuron structure, nerve impulse conduction, synapses & neurotransmitters, central vs peripheral nervous system, and somatic vs autonomic nervous systems.
  - **Lesson 2: សរីរាង្គវិញ្ញាណ (Sense Organs, Pages 11–17):** Eye anatomy (sclera, choroid, retina, cones/rods, blind spot, fovea, accommodation, 3D vision); ear anatomy (outer, middle with ossicles & Eustachian tube, inner with cochlea & semicircular canals, hearing pathway & cerebellar balance); tongue & 4 primary tastes; olfactory receptors (10,000 scents); and skin (9 functions, epidermis/dermis, thermoregulation & melanin).
  - **Lesson 3: ប្រព័ន្ធអង់ដូគ្រីន (Endocrine System, Pages 18–24):** Homeostasis; exocrine vs endocrine glands; peptide vs steroid hormone action mechanisms; negative feedback control; hypothalamus & pituitary hormones (ADH, Oxytocin, GH, PRL, MSH, TSH, ACTH, FSH/LH); thyroid (thyroxine, calcitonin, goiter) & parathyroid (PTH, tetany); adrenal medulla (epinephrine/fight-or-flight) vs adrenal cortex (cortisol, aldosterone); pancreas (islets of Langerhans, beta/insulin, alpha/glucagon, diabetes mellitus); and gonads (estrogen, progesterone, testosterone).
- **Enriched KruAI Search Grounding ([`server/textbook-search.ts`](file:///e:/Kru%20AI/Brachnha-v2/server/textbook-search.ts)):**
  - Added 6 rich textbook search chunks (`BIOLOGY_CH3_SECTIONS`) for KruAI:
    - `tb:bio:ch3:eye-anatomy-retina`
    - `tb:bio:ch3:eye-accommodation-vision`
    - `tb:bio:ch3:ear-hearing-balance`
    - `tb:bio:ch3:taste-smell-skin`
    - `tb:bio:ch3:homeostasis-hormones`
    - `tb:bio:ch3:pituitary-thyroid-parathyroid`
    - `tb:bio:ch3:adrenal-pancreas-gonads`
  - Integrated into `searchBiologyTextbook()` so student questions about sensory organs or hormone regulations receive exact MoEYS curriculum-grounded answers.
- **Added 26 Official Flashcards ([`src/data/practice.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/practice.ts)):**
  - Authored complete practice decks for Chapter 3:
    - `biology-3-1`: 8 cards covering nervous regulation, reflex arc, and autonomic pathways.
    - `biology-3-2`: 8 cards covering eye layers, photoreceptors, accommodation, ear ossicles, hearing mechanism, and skin functions.
    - `biology-3-3`: 10 cards covering endocrine mechanisms, negative feedback, pituitary hormones, calcium regulation, adrenal glands, blood glucose regulation, and diabetes.
- **Updated Section Titles on Study Path ([`src/features/lessons/sessions.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/features/lessons/sessions.ts)):**
  - Replaced generic placeholder titles with authentic MoEYS section titles for Lesson 3.2 ("ចក្ខុវិញ្ញាណ (ភ្នែក)", "សោតវិញ្ញាណ និងតុល្យភាព", "ជីវ្ហាវិញ្ញាណ និងឃានវិញ្ញាណ", "កាយវិញ្ញាណ (ស្បែក)") and Lesson 3.3 ("ក្រពេញ អរម៉ូន និងថេរលំនឹង", "ក្រពេញអ៊ីប៉ូតាឡាមុស អ៊ីប៉ូភីស និងទីរ៉ូអ៊ីត", "ក្រពេញលើតម្រងនោម លំពែង និងក្រពេញភេទ").
- **Terminology Cleanliness:** Corrected OCR artifact `ក vỏ លើតម្រងនោម` to standard MoEYS terminology `សំបកលើតម្រងនោម` (Adrenal Cortex).
- **Latin Digits Enforced:** Ran `npm run check:digits` verifying 100% compliance across all new Khmer content.

**What to re-test.**
- Navigate to `/practice`. Select Biology and check that Flashcard decks for Lessons 3.1, 3.2, and 3.3 are available and interactive.
- Open KruAI chat (`/chat`) and test asking questions about sense organs or hormones (e.g. "តើកែវភ្នែកសម្របតម្រូវយ៉ាងដូចម្តេច?", "ចូរប្រៀបធៀបនាទីរវាងកាល់ស៊ីតូនីន និង PTH").
- Navigate to `/subjects/biology` and verify the path displays real section titles for Chapter 3 Lessons 2 and 3.

## 28 Sep 2026 — Game Mode: History Hard Questions Added (Complete 30-Question History Pool)

Commit `pending`. **No database step needed.**

**Why.** To complete the full three difficulty tiers (Basic, Medium, Hard) for History in Game mode (`/game`), 10 advanced Grade 12 Bac II History questions were added for the **Hard** difficulty, bringing the authored History question pool to 30 questions.

**What changed.**
- **Authored 10 History Hard Competition Questions ([`src/data/game-questions.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/game-questions.ts)):**
  - Covers advanced and analytical Bac II Grade 12 modern Cambodian history:
    - **French Protectorate & Early Resistance (សំណួរទី 1–3):** Convention of 17 June 1884 stripping King Norodom of internal administrative, judicial, fiscal, and land powers leading to the Prince Si Votha revolt (1885–1886); the 20 July 1942 Umbrella Demonstration protesting the arrest of Achar Hem Chieu and Nuon Duong; and King Norodom Sihanouk's 1953 diplomatic leverage tactics in Siem Reap and the New York Times interview warning of communist expansion.
    - **Sangkum & Civil War Eras (សំណួរទី 4–5):** The direct democracy mechanism of the Sangkum National Congress at Veal Menh; and how the US secret carpet bombings (Operations Menu and Freedom Deal, 1969–1973) devastated rural communities and catalyzed mass peasant recruitment into the Khmer Rouge.
    - **Democratic Kampuchea & 1980s PRK (សំណួរទី 6–8):** The 7 administrative zones and numbered regional sectors replacing traditional provinces; Pol Pot's paranoid 1978 purges of So Phim's Eastern Zone ("Vietnamese mind in Khmer body"); and the K-5 Plan (1984–1989) conscripting civilian labor to trench, clear forest, and mine the Thai border.
    - **Peace & Reconciliation (សំណួរទី 9–10):** The role of the Supreme National Council (SNC) embodying Cambodian sovereignty under Prince Sihanouk prior to the 1993 UNTAC elections; and the 29 December 1998 surrender of final Khmer Rouge leaders under Samdech Techo Hun Sen's Win-Win Policy achieving total territorial unity for the first time in over 500 years.
  - **Balanced Option Distribution:** Correct answers distributed evenly across positions (`ក`: 3, `ខ`: 2, `គ`: 3, `ឃ`: 2), avoiding clustering on option 1.
  - **Latin Digits Enforced:** Strict Latin digits (0-9) used across all questions, options, and explanations in compliance with `scripts/check-digits.mjs`.
  - **Comprehensive Explanations:** In-depth historical commentary accompanying every question.

**What to re-test.**
- Navigate to `/game/create`.
- Select History ("ប្រវត្តិវិទ្យា") and the **Hard** ("ពិបាក") or **Mix** ("ចម្រុះ") difficulty chip.
- Start a competition and play through the 10 questions.
- Verify answer selections, review step, and historical explanations.

## 28 Sep 2026 — Game Mode: History Medium Questions Added

Commit `pending`. **No database step needed.**

**Why.** Following the Basic tier, 10 intermediate Grade 12 Bac II History questions were authored for the **Medium** difficulty tier in Game mode (`/game`), deepening coverage across Cambodian modern history and 20th-century world geopolitics.

**What changed.**
- **Authored 10 History Medium Competition Questions ([`src/data/game-questions.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/game-questions.ts)):**
  - Covers critical Grade 12 Bac II History topics:
    - **Cambodian History (សំណួរទី 1–5):** Sangkum Reastr Niyum's foreign policy of neutrality and non-alignment (Bandung Conference 1955); economic nationalization and border Viet Cong presence leading to the 18 March 1970 coup; Democratic Kampuchea's social stratification ("Base People" vs "New/17 April People"); the Khmer Rouge's 4-Year Plan (1977–1980) targeting 3 to 7 tons/hectare of rice; and the multi-party democratic election and national reconciliation principles of the 23 October 1991 Paris Peace Agreements.
    - **World History (សំណួរទី 6–10):** The severe economic and territorial repercussions of the 1919 Treaty of Versailles fueling German revanchism; the Allied Appeasement Policy emboldening Hitler's expansion into Poland (1939); Eisenhower's Domino Theory justifying US intervention in Indochina; the resolution of the 1962 Cuban Missile Crisis; and Mikhail Gorbachev's Glasnost (openness) and Perestroika (restructuring) reforms leading up to 1991.
  - **Balanced Option Distribution:** Correct answers distributed evenly across positions (`ក`: 3, `ខ`: 2, `គ`: 3, `ឃ`: 2), avoiding clustering on option 1.
  - **Latin Digits Enforced:** Fully converted all dates, years, and quantities to standard Latin digits (0-9) ensuring zero Khmer numerals across questions, choices, and explanations.
  - **Rich Explanations:** Deep contextual explanations provided for student review.

**What to re-test.**
- Navigate to `/game/create`.
- Select History ("ប្រវត្តិវិទ្យា") and the **Medium** ("មធ្យម") difficulty chip.
- Start a competition and play through the 10 questions.
- Verify options, answer review, and explanations display correctly.

## 28 Sep 2026 — Game Mode: History Basic Questions Added & Subject Enabled

Commit `pending`. **No database step needed.**

**Why.** To expand the Game feature (`/game`) beyond Mathematics and support Grade 12 Bac II History preparation, 10 foundational Cambodian and World History questions were authored for the **Basic** difficulty tier. Adding these questions automatically unlocks History as a playable subject on the Game setup screen (`/game/create`).

**What changed.**
- **Authored 10 History Basic Competition Questions ([`src/data/game-questions.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/game-questions.ts)):**
  - Covers key Grade 12 Bac II History curriculum milestones:
    - **Cambodian History (សំណួរទី 1–5):** Full independence from France on 09 November 1953; 1954 Geneva Conference on Indochina; 18 March 1970 coup led by Lon Nol; 1975–1979 Democratic Kampuchea (Khmer Rouge) regime; and 23 October 1991 Paris Peace Agreements.
    - **World History (សំណួរទី 6–10):** 1914–1918 World War I; 01 September 1939 invasion of Poland starting World War II in Europe; 1945 establishment of the United Nations; Cold War standoff between the United States and the Soviet Union; and 1989 fall of the Berlin Wall.
  - **Balanced Option Distribution:** Correct answers distributed evenly across all positions (`ក`: 3, `ខ`: 2, `គ`: 3, `ឃ`: 2), avoiding clustering on option 1.
  - **Latin Digits Enforced:** Converted all Khmer numerals to standard Latin digits (0-9) across questions, choices, and explanations in compliance with `npm run check:digits`.
  - **Comprehensive Explanations:** Detailed historical context provided for every answer.
  - **Subject Unlocking:** History is now automatically active in `gameSubjects()` and selectable on `/game/create`.

**What to re-test.**
- Navigate to `/game/create`.
- Verify History ("ប្រវត្តិវិទ្យា") is active and selectable alongside Mathematics.
- Start a competition with **Basic** ("មូលដ្ឋាន") difficulty and play through the 10 questions.
- Verify answer selections, review step, and explanation displays.

## 28 Sep 2026 — Game Mode: Math Hard Questions Added (Complete 30-Question Math Pool)

Commit `pending`. **No database step needed.**

**Why.** To complete the three difficulty tiers (Basic, Medium, Hard) for Mathematics in the Game feature (`/game`), 10 advanced Grade 12 Math questions were added for the **Hard** difficulty, bringing the authored Math question pool to 30 questions.

**What changed.**
- **Authored 10 Math Hard Competition Questions ([`src/data/game-questions.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/game-questions.ts)):**
  - Covers advanced Bac II topics: Limits of form $1^\infty$ ($\lim_{x \to 0} (1+2x)^{3/x} = e^6$), Oblique asymptotes of irrational functions ($f(x) = \sqrt{x^2 - 4x + 5} \implies y = x - 2$), Derivative of inverse functions ($(f^{-1})'(2) = \frac{1}{6}$), Looping integration by parts ($\int_0^\pi e^x \cos x\,dx = -\frac{e^\pi + 1}{2}$), Area between two intersecting curves ($y = x^2$ and $y = 2x \implies S = \frac{4}{3}$), High powers via De Moivre's theorem ($(1 + i\sqrt{3})^{12} = 4096$), Complex geometric locus ($|z - 3 + 4i| = 2$ circle with center $(3, -4)$ and radius 2), Second-order linear differential equations with constant coefficients ($y'' + 4y = 0 \implies y = C_1\cos 2x + C_2\sin 2x$), Bayes' theorem conditional probability ($P(A \mid D) = \frac{3}{8}$), and Binomial distribution ($X \sim B(5, 2/3)$ for at least 4 hits $\implies P = \frac{112}{243}$).
  - Balanced multiple-choice options distributed evenly across all positions (`ក`: 3, `ខ`: 3, `គ`: 2, `ឃ`: 2).
  - Detailed step-by-step mathematical explanations included for every question.
  - Strict Latin digit enforcement (`0-9`) passing `npm run check:digits`.

**What to re-test.**
- Navigate to `/game/create`.
- Select Mathematics and the **Hard** ("ពិបាក") or **Mix** ("ចម្រុះ") difficulty chip.
- Start the competition and play through the questions, verifying mathematical formulas, options, photo working step, and review screens.

## 28 Sep 2026 — Game Mode: Math Medium Questions Added

Commit `pending`. **No database step needed.**

**Why.** Students competing in the Game feature (`/game`) need multiple difficulty levels for Mathematics. Following the Basic tier, 10 intermediate Grade 12 Math questions were added for the **Medium** difficulty.

**What changed.**
- **Authored 10 Math Medium Competition Questions ([`src/data/game-questions.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/game-questions.ts)):**
  - Covers key intermediate Bac II topics: Limits (conjugates for $0/0$ and trigonometric limits $\lim_{x \to 0} \frac{1 - \cos 2x}{x^2}$), Tangent line equation ($y = f'(x_0)(x - x_0) + f(x_0)$), Local extrema / relative minimum ($f'(x) = 0$), Substitution integrals ($\int 2x(x^2+1)^3\,dx$), Integration by parts ($\int x\ln x\,dx$), Complex Numbers (trigonometric polar form $r(\cos\theta + i\sin\theta)$ and quadratic equations $z^2 - 2z + 5 = 0$ in $\mathbb{C}$), Probability combinations ($C(n, k)$ marble draws), and First-order linear differential equations ($y' - 2y = 0, y(0) = 3$).
  - Balanced multiple-choice options distributed evenly across all positions (`ក`: 3, `ខ`: 2, `គ`: 3, `ឃ`: 2) with no option-1 clustering.
  - Detailed step-by-step mathematical explanations included for every question.
  - Strict Latin digit enforcement (`0-9`) passing `npm run check:digits`.

**What to re-test.**
- Navigate to `/game/create`.
- Select Mathematics and the **Medium** ("មធ្យម") difficulty chip.
- Start the competition and play through the 10 Medium questions, verifying KaTeX math formulas render properly on prompts, options, photo working, and review screens.

## 28 Sep 2026 — Grade 12 Biology: Complete 8 Chapters and 20 Lessons Added to Study & Flashcard Pages

Commit `16a1a9a`. **No database step needed.**

**Why.** Students studying Grade 12 Biology need to see the complete curriculum roadmaps across both the Study path (`/subjects/biology`) and the Flashcards/Practice hub (`/practice/biology`). Previously, only Chapters 1, 2 (untitled), and 3 were registered in `sessions.ts`. All 8 chapters and 20 lessons from the official MoEYS Grade 12 Biology textbook table of contents were added without authored section bodies so they appear as structured placeholders.

**What changed.**
- **Complete Biology Curriculum Structure ([`src/features/lessons/sessions.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/features/lessons/sessions.ts)):**
  - Populated all 8 chapters and 20 lessons according to the official MoEYS Grade 12 Biology textbook:
    - ជំពូក 1 : ស៊ីមណូស្ពែម និងអង់ស្យូស្ពែម (2 lessons)
    - ជំពូក 2 : ការលូតលាស់ និងតំណបបំពេញរុក្ខជាតិ (2 lessons: ដំណឹកនាំ និងការលូតលាស់នៅក្នុងរុក្ខជាតិ, តំណបបំពេញ)
    - ជំពូក 3 : តម្រូវផ្សេងៗរបស់សារពាង្គកាយ (3 lessons: តម្រូវប្រសាទ [playable], សរីរាង្គវិញ្ញាណ, ប្រព័ន្ធអង់ដូគ្រីន)
    - ជំពូក 4 : នាទីរបស់ប្រូតេអ៊ីនក្នុងសារពាង្គកាយ (3 lessons: អាស៊ីតអាមីណេ, ប្រូតេអ៊ីន, អង់ស៊ីម)
    - ជំពូក 5 : ព័ត៌មានសេនេទិច និងការសំដែងនៃសែន (3 lessons: ADN ជាព័ត៌មានសេនេទិច, ការសំដែងចេញនៃសែន, បច្ចេកវិទ្យាជីវៈ)
    - ជំពូក 6 : ការវិវត្តនៃការរស់ (3 lessons: ទ្រឹស្ដីរបស់លោកដាវិន, ភស្តុតាងនៃការវិវត្ត, កំណត់ត្រាផូស៊ីល)
    - ជំពូក 7 : ពពួក និងសហគមន៍ (2 lessons: ពពួក, អន្តរអំពើក្នុងចំណោមការរស់)
    - ជំពូក 8 : អេកូឡូស៊ី (2 lessons: បង្វែរថាមពលក្នុងស្ថានប្រព័ន្ធ, វដ្តរូបធាតុ)
- **Automatic Sync with Study & Flashcard Pages:**
  - On the **Study path** (`/subjects/biology`): displays all 8 chapter banners, lesson headers, and locked placeholder nodes, with the Jump menu listing all 20 lessons.
  - On the **Flashcards list** (`/practice/biology`): lists all 8 chapters and 20 lessons with chapter kickers; non-authored decks cleanly display the `ឆាប់ៗនេះ` ("Coming soon") chip.
  - Updated `lessonsOnTab` in [`src/features/lessons/components/subject-card.tsx`](file:///e:/Kru%20AI/Brachnha-v2/src/features/lessons/components/subject-card.tsx) so the Study tab card accurately reports `20 មេរៀន`.

**What to re-test.**
- Open `/subjects/biology`: verify all 8 chapters and 20 lessons appear on the Study path, and open the Jump drawer to see all 20 lessons.
- Open `/practice/biology` under the Flashcard tab: verify all 8 chapters and 20 lessons are listed with chapter kickers and coming-soon chips.

## 28 Sep 2026 — Game Mode: Math Basic Questions & KaTeX Formula Rendering

Commit `pending`. **No database step needed.**

**Why.** Students competing in the Game feature (/game) need real, curriculum-aligned questions for Mathematics. Previously `GAME_QUESTIONS` had no authored questions, so competitions fell back to generic mock items. The Game create flow offers Basic (Easy), Medium, and Hard difficulties; 10 foundational Grade 12 Math questions were added for the Basic level.

**What changed.**
- **Authored 10 Math Basic Competition Questions ([`src/data/game-questions.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/game-questions.ts)):**
  - Covers key Bac II topics: Limits (factorization & limits at infinity), Derivatives (polynomial, exponential, logarithm), Integrals (antiderivatives and definite integration), Complex Numbers (modulus and conjugates), and Probability (fair die with prime numbers).
  - Balanced multiple-choice options distributed evenly across all positions (`ក`: 3, `ខ`: 2, `គ`: 3, `ឃ`: 2).
  - Detailed step-by-step explanations included for every question.
  - Strict Latin digit enforcement (`0-9`) passing `npm run check:digits`.
- **KaTeX Typesetting & Explanations in Game ([`src/features/game/components/game-question.tsx`](file:///e:/Kru%20AI/Brachnha-v2/src/features/game/components/game-question.tsx), [`src/features/game/components/answer-review.tsx`](file:///e:/Kru%20AI/Brachnha-v2/src/features/game/components/answer-review.tsx), [`src/features/game/components/work-photo-step.tsx`](file:///e:/Kru%20AI/Brachnha-v2/src/features/game/components/work-photo-step.tsx)):**
  - Added `MathText` rendering to `GameQuestion` prompts and options, beautifully typesetting fractions, limits, integrals, and formulas during gameplay.
  - Added `MathText` rendering to the photo working step (`WorkPhotoStep`) between the competition result and the answers.
  - Added `MathText` rendering and step-by-step mathematical explanations to the post-game `AnswerReview` screen.
- **Difficulty Selection & Question Pool ([`src/features/game/game.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/features/game/game.ts)):**
  - Updated the English label for `easy` to "Basic" to match the Basic / Medium / Hard terminology.
  - Ensured `gameQuestionsFor()` returns full authored question sets so `pickQuestions()` properly filters by selected difficulty without premature truncation.

**What to re-test.**
- Navigate to `/game` and click "Create Game Now" (`/game/create`).
- Select Mathematics and Basic (ងាយ) difficulty.
- Start the competition and play through the 10 questions, verifying mathematical formulas render clearly.
- Submit the competition and review questions on the review screen, verifying the option markers, correct answers, and mathematical explanations.

## 28 Sep 2026 — Grade 12 Biology Chapter 3 Lesson 1 ("តម្រូវប្រសាទ"): Sections 2, 3, and 4 Authored & Playable

Commit `1936bd3`. **No database step needed.**

**Why.** Chapter 3 Lesson 1 ("តម្រូវប្រសាទ" / Nervous Regulation) is a core foundational topic in Grade 12 Biology for the Bac II exam. Only Section 1 ("សេចក្ដីផ្ដើម") was playable on the Study path; sections 2, 3, and 4 were locked placeholders awaiting full curriculum transcription from official MoEYS textbooks.

**What changed.**
- **Authored 3 Complete Biology Sections ([`src/data/sections.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/sections.ts)):**
  - `biology-3-1-2` ("តម្រូវប្រសាទសត្វឥតឆ្អឹងកង"): Hydra nerve net (បណ្ដាញប្រសាទ), Planaria & Earthworm ventral nerve cord and ganglia, Arthropod sensory organs (compound eyes, antennae), cephalization (ក្បាលវិវត្ត).
  - `biology-3-1-3` ("តម្រូវប្រសាទសត្វឆ្អឹងកង"): Dorsal hollow nerve cord, structural breakdown (nerve fibers $\to$ fascicles $\to$ nerves; nuclei vs ganglia), 5 brain divisions across vertebrates (olfactory, cerebrum, optic lobes, cerebellum, medulla oblongata) showing evolutionary expansion from fish to mammals.
  - `biology-3-1-4` ("ប្រព័ន្ធប្រសាទរបស់មនុស្ស"): Neuron anatomy (dendrite, soma, axon with myelin), nerve impulses ($120\text{ m/s}$), synaptic transmission via neurotransmitters, CNS (cerebral hemispheres, thalamus, hypothalamus, cerebellum, medulla, spinal cord), PNS (12 cranial pairs, 31 spinal pairs), 5-part reflex arc (ធ្នូរ៉េផ្លិច), autonomic sympathetic vs parasympathetic regulation, and interactive 3D brain model.
- **Strict Digit Discipline & Balanced Quiz Options:**
  - 100% Latin digits (`0-9`) used across all prose and explanations; passed `npm run check:digits`.
  - Authored 7 new authentic multiple-choice scenario questions with balanced answer distributions across positions `ក`, `ខ`, `គ`, `ឃ`.

**What to re-test.**
- Open `/subjects/biology` on the Study page: observe that Sections 3.1.2, 3.1.3, and 3.1.4 on the path are unlocked and playable.
- Click each section to verify the 7-step flow: Introduction, Lesson details, Real-world examples, Key notes, Misconceptions, 3D Brain Viewer (Section 4), and Section Quizzes.

## 28 Sep 2026 — Math 2025 Bac II Full Exam Paper with Tables & SVG Graphs, Option Balancing & MathText SVG Rendering

Commit `pending`. **No database step needed.**

**Why.** Students preparing for the national Bac II exam require complete, verified solutions for the latest 2025 National Mathematics Examination (125 total points across all 7 exercises). Several questions (such as function study, sign analysis, and integral area) require sign tables, variation tables, and geometric coordinate graphs. Additionally, multiple-choice quiz questions were updated to ensure correct answers do not cluster on the first choice.

**What changed.**
- **Complete Math 2025 Paper ([`src/data/papers/math-2025.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/papers/math-2025.ts)):**
  - Fully authored all 7 MoEYS exam exercises (125 points total): Limits (15 pts), Probability (10 pts), Complex Numbers (15 pts), Integrals (15 pts), Differential Equations (10 pts), Space Vectors & Parabola (20 pts), and Function Study $g(x) = \ln\frac{-x-3}{x-3}$ (40 pts).
  - Included step-by-step verified worked answers adhering to MoEYS grading criteria (Given $\to$ Method $\to$ Steps $\to$ Answer $\to$ Exam tip).
  - Formatted sign tables and the function variation table (តារាងអថេរភាព) as Markdown comparison tables.
  - Added responsive SVG diagrams with coordinate grids, asymptotes ($x = \pm 3$), tangent line $T$, curve $(C)$, and shaded region $S$.
- **SVG & Table Rendering in MathText ([`src/components/shell/math-text.tsx`](file:///e:/Kru%20AI/Brachnha-v2/src/components/shell/math-text.tsx)):**
  - Upgraded the block parser to recognize `<svg ... </svg>` elements alongside Markdown tables.
  - SVG elements render inline with dark/light mode CSS color inheritance, responsive scaling, and XSS sanitization (scripts stripped).
- **Quiz Option Distribution ([`src/data/quizzes/math-1-1-1.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/quizzes/math-1-1-1.ts), [`src/data/questions.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/questions.ts), [`src/data/lessons.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/lessons.ts)):**
  - Shuffled multiple-choice quiz questions evenly across choices 0, 1, 2, 3 (ក, ខ, គ, ឃ) to eliminate option 1 clustering.

**What to re-test.**
- Open `/mock-exam` and navigate to Math 2025: verify all 7 exercises show complete statements and point values totaling 125.
- Expand Exercise VII in Math 2025: verify the variation table, sign table, and both SVG coordinate graphs render crisp and centered in both light and dark themes.

## 27 Sep 2026 — KruAI Competition Multi-Key Rotation Pool, Expanded Model Fallback Chain & 0-Token Bac II Query Cache

Commit `e81cc64`. **No database step needed.**

**Why.** Ahead of app demonstrations and competition testing by ~20 judges and students, KruAI needed bulletproof reliability and zero-cost scaling. The Google AI Studio free tier limits each API key to 20 requests per day per model. Additionally, frequent Bac II comparison questions (such as Monocot vs Dicot or Mitosis vs Meiosis) should not consume quota when tested repeatedly by multiple users.

**What changed.**
- **API Key Rotation Pool ([`server/chat-handler.ts`](file:///e:/Kru%20AI/Brachnha-v2/server/chat-handler.ts), [`server/vite-chat-plugin.ts`](file:///e:/Kru%20AI/Brachnha-v2/server/vite-chat-plugin.ts)):**
  - Accepts a pool of multiple Gemini API keys via `GEMINI_API_KEYS` (comma-separated) or `GEMINI_API_KEY_1` through `GEMINI_API_KEY_5`.
  - Implements round-robin rotation so consecutive student requests distribute load evenly across accounts.
  - Automatically falls back to the next key in the pool if a key encounters rate limits (429), quota exhaustion, or server demand spikes.
- **Expanded Model Fallback Chain ([`server/chat-handler.ts`](file:///e:/Kru%20AI/Brachnha-v2/server/chat-handler.ts)):**
  - Expanded candidate models to: `["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.6-flash", "gemini-3-flash-preview"]`.
  - With 4 keys x 4 models, the app now supports up to 16 fallback tiers (~320 queries/day) with $0 cost.
  - Dynamically configures thinking parameters per model (`thinking_level: "low"` for `gemini-flash-latest`, `"minimal"` for 3.x flash models).
- **0-Token Bac II Cache & Simulated Streaming ([`server/chat-cache.ts`](file:///e:/Kru%20AI/Brachnha-v2/server/chat-cache.ts)):**
  - Pre-computed verified Bac II curriculum answers for high-frequency exam questions (Monocot vs Dicot, Auxin vs Cytokinin, Sympathetic vs Parasympathetic, 3 Brain Parts, Mitosis vs Meiosis, DNA Replication, 3 RNA Types, Mendel's Laws).
  - Emits natural simulated streaming (12ms micro-delay) so users see realistic typing animation without making any external API calls.
  - Serves cached responses before the auth gate so judges and guests can test key exam questions instantly without logging in.
  - Dynamic LRU cache (200 items) caches successful model answers for repeated questions from other testers.

**What to re-test.**
- Ask KruAI "compare monocot and dicot" or "ប្រៀបធៀបម៉ូណូកូទីលេដូន និងឌីកូទីលេដូន": verify answer streams instantly with 0 delay and formatted comparison table.
- Ask "compare mitosis and meiosis": verify structured table and Bac II exam tips appear.
- Test with multiple keys defined in `.env.local` (`GEMINI_API_KEYS="key1,key2,key3"`).

---

## 27 Sep 2026 — Math 2025 Bac II Exam Completed: Parts VI (Geometry & Parabola) & VII (Functions) Added (Full 125 Points)

*Not committed yet.* **No database step needed.**

**Why.** The Mathematics 2025 Bac II mock exam paper had Parts I through V completed (65 points), but was missing the two final large sections: Part VI (Geometry in Space & Parabola, 20 points) and Part VII (Full Function Study & Logarithmic Integral Area, 40 points). Adding these completes the full 125-point national Bac II exam paper so students can practice the entire exam end-to-end under real 150-minute exam conditions.

**What changed.**
- **Completed Part VI ([`math-2025.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/papers/math-2025.ts), 20 points):**
  - **3D Vectors (5 points)**: Vector coordinate calculations $\vec{AC}=(-3,1,2)$, $\vec{AE}=(1,7,-2)$, $\vec{BD}=(0,1,-1)$, $\vec{BF}=(1,0,-1)$, $\vec{DF}=(1,-1,0)$.
  - **Geometric Proofs (5 points)**: Scalar product $\vec{AC} \cdot \vec{AE} = 0 \Rightarrow \triangle ACE$ is a right triangle at $A$ (2 pts); side lengths $|\vec{BD}|=|\vec{BF}|=|\vec{DF}|=\sqrt{2} \Rightarrow \triangle BDF$ is equilateral (3 pts).
  - **Parabola (10 points)**: Standard equation $y^2 = 8x$ with vertex $O(0,0)$, axis of symmetry $y=0$, passing through $A(2,4)$ (7 pts); finding abscissa $x_1 = 8$ for $B(x_1,-8)$ (3 pts).
- **Completed Part VII ([`math-2025.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/papers/math-2025.ts), 40 points):**
  - **Domain & Parity (5 points)**: Domain $D=(-3, 3)$ from sign table $\frac{-x-3}{x-3}>0$ (3 pts); algebraic proof that $g(-x) = -g(x) \Rightarrow g$ is an odd function (2 pts).
  - **Limits & Asymptotes (6 points)**: $\lim_{x \to -3^+} g(x) = -\infty$ with vertical asymptote $x=-3$ (3 pts); $\lim_{x \to 3^-} g(x) = +\infty$ with vertical asymptote $x=3$ (3 pts).
  - **Derivatives & Monotonicity (10 points)**: Derivative $g'(x) = \frac{6}{9-x^2} > 0$ for all $x \in (-3, 3)$ (5 pts); strict increasing variation and table with no extrema (5 pts).
  - **Tangent & Geometry (8 points)**: Tangent line $T: y = \frac{2}{3}x$ at $x_0 = 0$ (5 pts); geometric properties of curve $C$ with inflection/symmetry center at $O(0,0)$ (3 pts).
  - **Sign Study (5 points)**: $g(x) < 0$ on $(-3, 0)$, $g(0)=0$, $g(x) > 0$ on $(0, 3)$.
  - **Integration & Area (6 points)**: Product derivative $h'(x) = [x g(x)]' = g(x) + \frac{6x}{9-x^2}$ (3 pts); exact plane area $S = \int_0^1 g(x)dx = [h(x) + 3\ln|x^2-9|]_0^1 = 10\ln 2 - 6\ln 3$ area units (3 pts).
- **Exam completion**: 7 of 7 sections complete, exactly 125/125 points accounted for, 0 Khmer digits, and option answers balanced across all four choices (ក, ខ, គ, ឃ).

**What to re-test.**
- Open **Exams -> Mathematics 2025** on the app.
- Check that all 7 sections appear in the exam overview:
  - I. លីមីត (15 pts)
  - II. ប្រូបាប (10 pts)
  - III. ចំនួនកុំផ្លិច (15 pts)
  - IV. អាំងតេក្រាល (15 pts)
  - V. សមីការឌីផេរ៉ង់ស្យែល (10 pts)
  - VI. ធរណីមាត្រក្នុងលំហ និងកោនិក (20 pts)
  - VII. សិក្សាអនុគមន៍ (40 pts)
- Tap into Section VI and Section VII: verify problem statements match the printed exam, KaTeX equations render sharply, and selecting options reveals step-by-step solutions with MoEYS points.

---

## 27 Sep 2026 — Grade 12 Biology Chapter 3 Lesson 1 (Nervous Regulation) Digitized & Grounded in KruAI

*Not committed yet.* **No database step needed.**

**Why.** Chapter 3 covers **ជំពូក 3 ៖ តម្រូវផ្សេងៗរបស់សារពាង្គកាយ** (Regulation and Coordination in Organisms). Lesson 1 (Nervous Regulation) contains foundational, high-frequency Bac II questions on neuron structure and classifications, nerve impulse propagation (120 m/s), synapse neurotransmitter mechanisms, central vs. peripheral nervous systems, brain lobes and functions (cerebrum, cerebellum, brainstem), the reflex arc, and the autonomic sympathetic vs. parasympathetic comparison table.

**What changed.**
- **19 textbook pages digitized & verified**: Pages `p060.md` to `p077.md` and chapter review page `p121.md` transcribed in `sources/ocr/biology/chapter3/` with 0 errors via `ocr-check` and 100% Latin digits compliance.
- **Search index expanded ([`textbook-search.ts`](file:///e:/Kru%20AI/Brachnha-v2/server/textbook-search.ts))**: Added 6 high-yield Chapter 3 sections (`tb:bio:ch3:*`) covering CNS & PNS divisions, neuron structure and classifications, nerve impulse & synapse neurotransmitter transmission, brain anatomy & lobes, spinal cord & reflex arc, and autonomic sympathetic vs parasympathetic nervous systems.
- **Bac II comparison format example ([`bac2-format.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/bac2-format.ts))**: Added a verified comparison example for **Sympathetic vs. Parasympathetic Nervous Systems** with similarities, differences table, and marking scheme exam tips.

**What to re-test.**
- Ask KruAI in chat:
  - "ប្រៀបធៀបប្រព័ន្ធប្រសាទសាំប៉ាទិច និងប៉ារ៉ាសាំប៉ាទិច" (Sympathetic vs. Parasympathetic)
  - "តើអាំងភ្លុចប្រសាទឆ្លងកាត់ស៊ីណាប់ដូចម្តេច?" (Nerve impulse across synapse)
  - "រៀបរាប់ផ្នែកសំខាន់ទាំង 3 នៃខួរក្បាលមនុស្ស" (3 main parts of human brain)
  - "តើអ្វីជាធ្នូរ៉េផ្លិច?" (Reflex arc)
- Verify answers cite official MoEYS definitions and render structured comparison tables with exam tips.

---

## 27 Sep 2026 — Math 2025 Mock Test Parts IV & V Added + Correct Answer Option Positions Shuffled Across All Quizzes

*Not committed yet.* **No database step needed.**

**Why.**
1. The 2025 Bac II Mathematics mock exam paper had Parts I–III completed, but was missing Exercises IV (Integrals) and V (Differential Equations). Students needed the full 5 core analytical sections of the exam ready for practice with authentic MoEYS problem statements, point allocations, and detailed step-by-step explanations.
2. In several quizzes, skill drills, and foundation exercises, the correct answer was previously clustered at option position 1 (index 0). Students taking the quizzes could guess the first option and pass without working out the problems.

**What changed.**
- **Math 2025 Mock Paper ([`math-2025.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/papers/math-2025.ts)):**
  - Added **Part IV: Integrals (IV. អាំងតេក្រាល, 15 points)** covering polynomial and rational integrals ($I, J_1, J_1+J_2, J_2$) and trigonometric power reduction integral ($K = \int_0^{\pi/2}(\sin^2 x\cos^4 x + \sin^4 x\cos^2 x)dx = \pi/16$).
  - Added **Part V: Differential Equations (V. សមីការឌីផេរ៉ង់ស្យែល, 10 points)** covering characteristic equation, real distinct roots, general solution, and finding the particular solution given boundary conditions ($y(0)=1, y'(1)=e \Rightarrow y=e^x$).
  - Total covered points now reach 65/125 points across parts I to V with verified marking keys.
- **Answer Option Shuffling Across All Quizzes:**
  - Shuffled option orders across all 10 limit skill drills and foundation exercises in [`math-1-1-1.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/quizzes/math-1-1-1.ts) (40 questions), ensuring a balanced 25% distribution across positions 1, 2, 3, 4 without repetition within skills.
  - Balanced question option positions across [`questions.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/questions.ts) (Placement Test / Survey questions), [`lessons.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/lessons.ts) (PRACTICE questions), and [`sections.ts`](file:///e:/Kru%20AI/Brachnha-v2/src/data/sections.ts) (curriculum quizzes).

**What to re-test.**
- Navigate to **Exams -> Mathematics 2025** and verify all 5 sections are playable:
  - Check Part IV (Integrals) and Part V (Differential Equations) questions, options, KaTeX typesetting, and solution explanations.
- Take quizzes in **Practice -> Limits** and **Placement Test / Survey**:
... [truncated for diff preview]