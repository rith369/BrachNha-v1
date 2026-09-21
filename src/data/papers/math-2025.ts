import type { PastPaperContent } from "@/types";

/**
 * MoEYS Bac II — MATHEMATICS (science stream), session 28 សីហា 2025.
 * 125 points, 150 minutes.
 *
 * ⚠ THIS IS AN ADAPTATION, NOT THE PAPER AS SAT, and that is the first thing to
 * know about this file. The real paper is written work end to end — limits,
 * probability, complex numbers, integrals, a differential equation, vectors and
 * a full function study — and nothing in this app can mark a written solution.
 * The user's decision was to turn each part into MULTIPLE CHOICE so it can be
 * marked at all.
 *
 * ── THE ONE RULE THAT SPLITS THIS FILE IN TWO ─────────────────────────────
 *
 * The user's instruction, and everything below follows from it: *"all exercise
 * i want u to write exactly like an exercise i give cuz it is the original
 * exercise so u dont have to change it. but when qcm so u can inovation as u
 * want."*
 *
 *  - **`statement` IS THE PAPER, WORD FOR WORD.** Copied off the photographs,
 *    down to the lettering (I uses Latin `a. b. c. d.`, II names its events
 *    `A`/`B`/`C` in guillemets, III is one prose paragraph with no letters at
 *    all). **Nothing in a statement may be rewritten, tidied, or invented** —
 *    a paraphrase there is our sentence wearing MoEYS's authority, and a
 *    student who practises on it meets different words in the real exam. An
 *    earlier pass did exactly that and had to be deleted.
 *  - **EVERYTHING ELSE IS OURS, and is meant to be.** The sub-question prompts,
 *    the options, the solutions. That is where the adaptation lives.
 *
 * ── The sub-questions ─────────────────────────────────────────────────────
 *
 * Several multiple-choice steps per exercise is the shape the user asked for,
 * and **a step may ask an INTERMEDIATE result rather than the final answer** —
 * `p1` asks for $n(S)$, which the printed paper never asks for as its own part
 * but which its answer key awards 4 of part II's 10 points for. That is what
 * lets a written exercise be marked by taps at all.
 *
 * `points` is the PRINTED mark for that step, taken from the answer key's own
 * per-part figures, and the three parts add up exactly: I = 3+4+4+4 = 15,
 * II = 4+2+2+2 = 10, III = 2+2+2+2+1+1+2+3 = 15. Total 40.
 *
 * ── The options and the solutions ─────────────────────────────────────────
 *
 *  - **THE OPTIONS ARE OURS.** The correct answer is the paper's; the three
 *    wrong ones are written here as the results the working actually produces
 *    when it goes wrong — a dropped sign, a forgotten factor of 2,
 *    `arg(z₁/z₂)` added instead of subtracted. A distractor must never be a
 *    second correct answer: check the arithmetic before adding one.
 *  - **The solutions follow the answer key's method**, including its
 *    alternatives where they teach something (I.b's `a⁴-b⁴` factorisation is
 *    the key's own second method). The user's call (19 Sep 2026): the paper and
 *    its key are MoEYS material, public, and no credit line is owed. The copy
 *    supplied carries a ក្រូ សុខ ពិសិដ្ឋ / STEAM Tuition Center watermark,
 *    which is that centre's typesetting of a public exam rather than a claim on
 *    the mathematics. Every answer was also worked independently and agrees.
 *  - **The key's own Khmer is the terminology used here.** It writes
 *    "មានរាងមិនកំណត់" for an indeterminate form, so that is what the
 *    explanations say — an earlier pass "corrected" it to ទម្រង់មិនកំណត់ and
 *    that has been reverted. The key is the Khmer a Cambodian student meets in
 *    their own revision material, which beats a tidier coinage.
 *
 * ⚠ PARTS I TO III ONLY (40 of the paper's 125 points). IV to VII are
 * photographed but not transcribed; `note` says so on the detail screen, so
 * the parts list does not read as the whole exam. Part VII also needs a graph,
 * which will be DRAWN by the app rather than cropped out of the key's photo.
 *
 * KHMER NEVER GOES INSIDE `$…$`. KaTeX substitutes its own fonts, which have no
 * Khmer glyphs, so Khmer between dollars renders as empty boxes — `splitMath`
 * in utils/math-render.ts refuses such a span outright. `npm run check:quiz`
 * fails on it.
 *
 * Every string carrying LaTeX is a String.raw template. A plain template
 * literal eats the backslashes — `\t`, `\f`, `\b` become control characters —
 * which is the exact bug data/bac2-format.ts carries a header about.
 */
export const MATH_2025: PastPaperContent = {
  minutes: 150,
  points: 125,
  // Both facts a student needs before starting, and neither is guessable from
  // the screen: the app holds three parts of seven, and the real paper is
  // written work while this is multiple choice.
  note: "កម្មវិធីមានតែផ្នែក I ដល់ III សិន (40 ពិន្ទុ) — ផ្នែកផ្សេងទៀតកំពុងរៀបចំ។ វិញ្ញាសាពិតត្រូវសរសេរដំណោះស្រាយ តែនៅទីនេះជាការជ្រើសរើសចម្លើយ ដូច្នេះសូមគណនាលើក្រដាសជាមុនសិន។",

  sections: [
    {
      id: "limits",
      title: "I. លីមីត",
      // The paper's own words and its own Latin lettering. Do not translate the
      // a/b/c/d into ក/ខ/គ/ឃ — the printed paper uses Latin here.
      statement: String.raw`គណនាលីមីត ៖

a. $\lim_{x \to 1}\left(\sqrt{x^{2}-1}+3x\right)$

b. $\lim_{x \to 0}\dfrac{e^{4x}-1}{e^{x}-1}$

c. $\lim_{x \to 2}\dfrac{2-\sqrt{x+2}}{x^{3}-8}$

d. $\lim_{x \to \frac{\pi}{3}}\dfrac{x-\frac{\pi}{3}}{\sin x-\sqrt{3}\cos x}$`,
      // Ours: how to answer it HERE. Kept separate from the statement so the
      // app's voice is never mistaken for the paper's.
      instruction:
        "សូមគណនាលើក្រដាសជាមុនសិន រួចជ្រើសរើសចម្លើយម្តងមួយៗខាងក្រោម។",
      questions: [
        {
          id: "l1",
          points: 3,
          q: {
            en: String.raw`a. គណនា $\lim_{x \to 1}\left(\sqrt{x^{2}-1}+3x\right)$`,
            km: String.raw`a. គណនា $\lim_{x \to 1}\left(\sqrt{x^{2}-1}+3x\right)$`,
          },
          options: [String.raw`$0$`, String.raw`$3$`, String.raw`$4$`, "គ្មានលីមីត"],
          correct: String.raw`$3$`,
          explanation: String.raw`ជំនួសតម្លៃ $x=1$ ដោយផ្ទាល់ ព្រោះគ្មានរាងមិនកំណត់៖
$$\lim_{x \to 1}\left(\sqrt{x^{2}-1}+3x\right)=\sqrt{1^{2}-1}+3 \cdot 1=0+3=3$$
ចំណាំ៖ $\sqrt{x^{2}-1}$ កំណត់បានលុះត្រាតែ $x^{2}-1 \ge 0$ គឺ $x \ge 1$ ឬ $x \le -1$ ដូច្នេះលីមីតនេះគិតពីខាងស្តាំនៃ $1$។`,
        },
        {
          id: "l2",
          points: 4,
          q: {
            en: String.raw`b. គណនា $\lim_{x \to 0}\dfrac{e^{4x}-1}{e^{x}-1}$`,
            km: String.raw`b. គណនា $\lim_{x \to 0}\dfrac{e^{4x}-1}{e^{x}-1}$`,
          },
          options: [
            String.raw`$0$`,
            String.raw`$1$`,
            String.raw`$4$`,
            String.raw`$\frac{1}{4}$`,
          ],
          correct: String.raw`$4$`,
          explanation: String.raw`មានរាងមិនកំណត់ $\frac{0}{0}$។ ប្រើរូបមន្តគោល $\lim_{u \to 0}\dfrac{e^{u}-1}{u}=1$៖
$$\lim_{x \to 0}\frac{e^{4x}-1}{e^{x}-1}=\lim_{x \to 0}\frac{\dfrac{e^{4x}-1}{4x} \times 4}{\dfrac{e^{x}-1}{x}}=\frac{1 \times 4}{1}=4$$
វិធីម្យ៉ាងទៀត — ប្រើ $a^{4}-b^{4}=(a-b)\left(a^{3}+a^{2}b+ab^{2}+b^{3}\right)$ ជាមួយ $a=e^{x}$៖
$$\frac{\left(e^{x}\right)^{4}-1^{4}}{e^{x}-1}=e^{3x}+e^{2x}+e^{x}+1 \longrightarrow 1+1+1+1=4$$`,
        },
        {
          id: "l3",
          points: 4,
          q: {
            en: String.raw`c. គណនា $\lim_{x \to 2}\dfrac{2-\sqrt{x+2}}{x^{3}-8}$`,
            km: String.raw`c. គណនា $\lim_{x \to 2}\dfrac{2-\sqrt{x+2}}{x^{3}-8}$`,
          },
          options: [
            String.raw`$-\frac{1}{48}$`,
            String.raw`$\frac{1}{48}$`,
            String.raw`$-\frac{1}{24}$`,
            String.raw`$-\frac{1}{12}$`,
          ],
          correct: String.raw`$-\frac{1}{48}$`,
          explanation: String.raw`មានរាងមិនកំណត់ $\frac{0}{0}$។ គុណភាគយក និងភាគបែងនឹង $\left(2+\sqrt{x+2}\right)$ រួចប្រើ $(A-B)(A+B)=A^{2}-B^{2}$ និង $x^{3}-2^{3}=(x-2)\left(x^{2}+2x+4\right)$៖
$$\lim_{x \to 2}\frac{\left(2-\sqrt{x+2}\right)\left(2+\sqrt{x+2}\right)}{\left(x^{3}-2^{3}\right)\left(2+\sqrt{x+2}\right)}=\lim_{x \to 2}\frac{2^{2}-(x+2)}{(x-2)\left(x^{2}+2x+4\right)\left(2+\sqrt{x+2}\right)}$$
$$=\lim_{x \to 2}\frac{-(x-2)}{(x-2)\left(x^{2}+2x+4\right)\left(2+\sqrt{x+2}\right)}=\frac{-1}{(4+4+4)\left(2+\sqrt{4}\right)}=-\frac{1}{12 \times 4}=-\frac{1}{48}$$
សញ្ញាអវិជ្ជមានមកពី $2-x=-(x-2)$ — បើភ្លេច នឹងបាន $\frac{1}{48}$។`,
        },
        {
          id: "l4",
          points: 4,
          q: {
            en: String.raw`d. គណនា $\lim_{x \to \frac{\pi}{3}}\dfrac{x-\frac{\pi}{3}}{\sin x-\sqrt{3}\cos x}$`,
            km: String.raw`d. គណនា $\lim_{x \to \frac{\pi}{3}}\dfrac{x-\frac{\pi}{3}}{\sin x-\sqrt{3}\cos x}$`,
          },
          options: [
            String.raw`$\frac{1}{2}$`,
            String.raw`$1$`,
            String.raw`$2$`,
            String.raw`$\frac{\sqrt{3}}{2}$`,
          ],
          correct: String.raw`$\frac{1}{2}$`,
          explanation: String.raw`មានរាងមិនកំណត់ $\frac{0}{0}$។ ដកកត្តា $2$ ចេញពីភាគបែង រួចប្រើ $\sin A\cos B-\sin B\cos A=\sin(A-B)$៖
$$\sin x-\sqrt{3}\cos x=2\left(\tfrac{1}{2}\sin x-\tfrac{\sqrt{3}}{2}\cos x\right)=2\left(\sin x\cos\tfrac{\pi}{3}-\sin\tfrac{\pi}{3}\cos x\right)=2\sin\left(x-\tfrac{\pi}{3}\right)$$
តាង $X=x-\dfrac{\pi}{3}$ ពេល $x \to \dfrac{\pi}{3}$ នាំឱ្យ $X \to 0$៖
$$\lim_{x \to \frac{\pi}{3}}\frac{x-\frac{\pi}{3}}{\sin x-\sqrt{3}\cos x}=\frac{1}{2}\lim_{X \to 0}\frac{X}{\sin X}=\frac{1}{2} \cdot 1=\frac{1}{2}$$`,
        },
      ],
    },

    {
      id: "probability",
      title: "II. ប្រូបាប",
      // The paper's own words, including the guillemets around each event. The
      // paper asks only for P(A), P(B), P(C); n(S) is an intermediate the key
      // marks 4 points for, so it is a sub-question below and NOT invented into
      // the statement.
      statement: String.raw`នៅក្នុងប្រអប់មួយមានកូនឃ្លីទាំងអស់ចំនួន $4n$ ។ ដែលក្នុងនោះមានកូនឃ្លីចំនួន $(2n+1)$ មានពណ៌លឿង និង $(2n-1)$ មានពណ៌បៃតង។ គេចាប់យកកូនឃ្លីពីរព្រមគ្នាដោយចៃដន្យ។ ក្នុងសំណួរនេះយើងកំណត់យក $n=10$។

គណនាប្រូបាបនៃព្រឹត្តិការណ៍ខាងក្រោម ៖

$A$ ៖ « កូនឃ្លីទាំងពីរដែលចាប់បានមានពណ៌ខុសគ្នា »

$B$ ៖ « កូនឃ្លីទាំងពីរដែលចាប់បានមានពណ៌បៃតង »

$C$ ៖ « កូនឃ្លីទាំងពីរដែលចាប់បានមានពណ៌ដូចគ្នា »`,
      instruction:
        "សូមគណនាលើក្រដាសជាមុនសិន រួចជ្រើសរើសចម្លើយម្តងមួយៗខាងក្រោម។",
      questions: [
        {
          id: "p1",
          points: 4,
          q: {
            en: String.raw`ចំនួនករណីអាចមានទាំងអស់ $n(S)$ ស្មើប៉ុន្មាន?`,
            km: String.raw`ចំនួនករណីអាចមានទាំងអស់ $n(S)$ ស្មើប៉ុន្មាន?`,
          },
          options: [
            String.raw`$190$`,
            String.raw`$780$`,
            String.raw`$1560$`,
            String.raw`$40$`,
          ],
          correct: String.raw`$780$`,
          explanation: String.raw`ជាមួយ $n=10$ គេបាន $4n=40$ ពណ៌លឿង $2n+1=21$ និងពណ៌បៃតង $2n-1=19$។
គេចាប់យកកូនឃ្លី 2 ព្រមគ្នា ដូច្នេះមិនគិតលំដាប់ គឺជាបន្សំ៖
$$n(S)=C(40,2)=\frac{40 \times 39}{2 \times 1}=780$$
រូបមន្ត៖ $C(n,r)=\dfrac{n!}{(n-r)! \times r!}$។ បើគិតលំដាប់ (ការរៀបលំដាប់) នឹងបាន $1560$ ដែលច្រើនជាងការពិតពីរដង។`,
        },
        {
          id: "p2",
          points: 2,
          q: {
            en: String.raw`$P(A)$ ៖ កូនឃ្លីទាំងពីរដែលចាប់បានមានពណ៌ខុសគ្នា`,
            km: String.raw`$P(A)$ ៖ កូនឃ្លីទាំងពីរដែលចាប់បានមានពណ៌ខុសគ្នា`,
          },
          options: [
            String.raw`$\frac{133}{260}$`,
            String.raw`$\frac{127}{260}$`,
            String.raw`$\frac{57}{260}$`,
            String.raw`$\frac{7}{26}$`,
          ],
          correct: String.raw`$\frac{133}{260}$`,
          explanation: String.raw`ពណ៌ខុសគ្នា មានន័យថាយកលឿងមួយ និងបៃតងមួយ៖
$$n(A)=C(21,1) \times C(19,1)=21 \times 19=399$$
$$P(A)=\frac{n(A)}{n(S)}=\frac{399}{780}=\frac{133}{260}$$`,
        },
        {
          id: "p3",
          points: 2,
          q: {
            en: String.raw`$P(B)$ ៖ កូនឃ្លីទាំងពីរដែលចាប់បានមានពណ៌បៃតង`,
            km: String.raw`$P(B)$ ៖ កូនឃ្លីទាំងពីរដែលចាប់បានមានពណ៌បៃតង`,
          },
          options: [
            String.raw`$\frac{57}{260}$`,
            String.raw`$\frac{7}{26}$`,
            String.raw`$\frac{133}{260}$`,
            String.raw`$\frac{19}{40}$`,
          ],
          correct: String.raw`$\frac{57}{260}$`,
          explanation: String.raw`ជ្រើសពីរក្នុងចំណោមកូនឃ្លីបៃតង $19$៖
$$n(B)=C(19,2)=\frac{19 \times 18}{2 \times 1}=171 \quad\Rightarrow\quad P(B)=\frac{171}{780}=\frac{57}{260}$$
$\frac{7}{26}$ គឺជាប្រូបាបដែលទាំងពីរមានពណ៌លឿង ($C(21,2)=210$)។`,
        },
        {
          id: "p4",
          points: 2,
          q: {
            en: String.raw`$P(C)$ ៖ កូនឃ្លីទាំងពីរដែលចាប់បានមានពណ៌ដូចគ្នា`,
            km: String.raw`$P(C)$ ៖ កូនឃ្លីទាំងពីរដែលចាប់បានមានពណ៌ដូចគ្នា`,
          },
          options: [
            String.raw`$\frac{127}{260}$`,
            String.raw`$\frac{133}{260}$`,
            String.raw`$\frac{57}{260}$`,
            String.raw`$\frac{7}{26}$`,
          ],
          correct: String.raw`$\frac{127}{260}$`,
          explanation: String.raw`$C$ ជាព្រឹត្តិការណ៍ផ្ទុយនៃ $A$ ព្រោះពណ៌មានតែពីរ៖
$$P(C)=1-P(A)=1-\frac{133}{260}=\frac{127}{260}$$
របៀបទី 2៖ $n(C)=C(21,2)+C(19,2)=\dfrac{21 \times 20}{2 \times 1}+\dfrac{19 \times 18}{2 \times 1}=210+171=381$ ដូច្នេះ $P(C)=\dfrac{381}{780}=\dfrac{127}{260}$។`,
        },
      ],
    },

    {
      id: "complex",
      title: "III. ចំនួនកុំផ្លិច",
      // The paper's own words. One prose paragraph, no lettering — so none is
      // added here, and the sub-questions below carry no invented letters
      // either.
      statement: String.raw`គេមានចំនួនកុំផ្លិច $z_{1}=\sqrt{3}-i$ , $z_{2}=2(1-i)$ និង $Z=\dfrac{z_{1}^{7}}{z_{2}^{6}}$ ។ រកម៉ូឌុល និងអាគុយម៉ង់នៃ $z_{1}$ , $z_{2}$ និង $Z$ រួចសរសេរ $z_{1}$ , $z_{2}$ និង $Z$ ជាទម្រង់ត្រីកោណមាត្រ។ សរសេរ $Z$ ជាទម្រង់ពីជគណិត។`,
      instruction:
        "សូមគណនាលើក្រដាសជាមុនសិន រួចជ្រើសរើសចម្លើយម្តងមួយៗខាងក្រោម។",
      questions: [
        {
          id: "c1",
          points: 2,
          q: {
            en: String.raw`ម៉ូឌុល និងអាគុយម៉ង់នៃ $z_{1}$`,
            km: String.raw`ម៉ូឌុល និងអាគុយម៉ង់នៃ $z_{1}$`,
          },
          options: [
            String.raw`$|z_{1}|=2,\ \arg z_{1}=-\frac{\pi}{6}$`,
            String.raw`$|z_{1}|=2,\ \arg z_{1}=\frac{\pi}{6}$`,
            String.raw`$|z_{1}|=4,\ \arg z_{1}=-\frac{\pi}{6}$`,
            String.raw`$|z_{1}|=\sqrt{2},\ \arg z_{1}=-\frac{\pi}{3}$`,
          ],
          correct: String.raw`$|z_{1}|=2,\ \arg z_{1}=-\frac{\pi}{6}$`,
          explanation: String.raw`$$r_{1}=|z_{1}|=\sqrt{a_{1}^{2}+b_{1}^{2}}=\sqrt{\left(\sqrt{3}\right)^{2}+(-1)^{2}}=\sqrt{4}=2$$
$$\cos\alpha_{1}=\frac{a_{1}}{r_{1}}=\frac{\sqrt{3}}{2} \quad,\quad \sin\alpha_{1}=\frac{b_{1}}{r_{1}}=-\frac{1}{2} \quad\Rightarrow\quad \alpha_{1}=-\frac{\pi}{6}+2k\pi \ , \ k \in \mathbb{Z}$$
ផ្នែកនិមិត្តអវិជ្ជមាន ដូច្នេះអាគុយម៉ង់ត្រូវតែអវិជ្ជមាន។`,
        },
        {
          id: "c2",
          points: 2,
          q: {
            en: String.raw`ទម្រង់ត្រីកោណមាត្រនៃ $z_{1}$`,
            km: String.raw`ទម្រង់ត្រីកោណមាត្រនៃ $z_{1}$`,
          },
          options: [
            String.raw`$2\left[\cos\left(-\frac{\pi}{6}\right)+i\sin\left(-\frac{\pi}{6}\right)\right]$`,
            String.raw`$2\left[\cos\frac{\pi}{6}+i\sin\frac{\pi}{6}\right]$`,
            String.raw`$4\left[\cos\left(-\frac{\pi}{6}\right)+i\sin\left(-\frac{\pi}{6}\right)\right]$`,
            String.raw`$2\left[\sin\left(-\frac{\pi}{6}\right)+i\cos\left(-\frac{\pi}{6}\right)\right]$`,
          ],
          correct: String.raw`$2\left[\cos\left(-\frac{\pi}{6}\right)+i\sin\left(-\frac{\pi}{6}\right)\right]$`,
          explanation: String.raw`ទម្រង់ត្រីកោណមាត្រគឺ $z_{k}=r_{k}\left(\cos\alpha_{k}+i\sin\alpha_{k}\right)$។ ជាមួយ $r_{1}=2$ និង $\alpha_{1}=-\dfrac{\pi}{6}$៖
$$z_{1}=2\left[\cos\left(-\frac{\pi}{6}\right)+i\sin\left(-\frac{\pi}{6}\right)\right]$$
$\cos$ នៅផ្នែកពិត និង $\sin$ នៅផ្នែកនិមិត្ត — កុំដូរកន្លែងគ្នា។`,
        },
        {
          id: "c3",
          points: 2,
          q: {
            en: String.raw`ម៉ូឌុល និងអាគុយម៉ង់នៃ $z_{2}$`,
            km: String.raw`ម៉ូឌុល និងអាគុយម៉ង់នៃ $z_{2}$`,
          },
          options: [
            String.raw`$|z_{2}|=2\sqrt{2},\ \arg z_{2}=-\frac{\pi}{4}$`,
            String.raw`$|z_{2}|=2,\ \arg z_{2}=-\frac{\pi}{4}$`,
            String.raw`$|z_{2}|=2\sqrt{2},\ \arg z_{2}=\frac{\pi}{4}$`,
            String.raw`$|z_{2}|=4,\ \arg z_{2}=-\frac{\pi}{4}$`,
          ],
          correct: String.raw`$|z_{2}|=2\sqrt{2},\ \arg z_{2}=-\frac{\pi}{4}$`,
          explanation: String.raw`$z_{2}=2(1-i)=2-2i$ ដូច្នេះ៖
$$r_{2}=|z_{2}|=\sqrt{2^{2}+(-2)^{2}}=\sqrt{8}=2\sqrt{2}$$
$$\cos\alpha_{2}=\frac{2}{2\sqrt{2}}=\frac{\sqrt{2}}{2} \quad,\quad \sin\alpha_{2}=\frac{-2}{2\sqrt{2}}=-\frac{\sqrt{2}}{2} \quad\Rightarrow\quad \alpha_{2}=-\frac{\pi}{4}+2k\pi$$
កុំភ្លេចគុណ $2$ ចូលមុន — $|1-i|=\sqrt{2}$ តែ $|z_{2}|=2\sqrt{2}$។`,
        },
        {
          id: "c4",
          points: 2,
          q: {
            en: String.raw`ទម្រង់ត្រីកោណមាត្រនៃ $z_{2}$`,
            km: String.raw`ទម្រង់ត្រីកោណមាត្រនៃ $z_{2}$`,
          },
          options: [
            String.raw`$2\sqrt{2}\left[\cos\left(-\frac{\pi}{4}\right)+i\sin\left(-\frac{\pi}{4}\right)\right]$`,
            String.raw`$2\sqrt{2}\left[\cos\frac{\pi}{4}+i\sin\frac{\pi}{4}\right]$`,
            String.raw`$2\left[\cos\left(-\frac{\pi}{4}\right)+i\sin\left(-\frac{\pi}{4}\right)\right]$`,
            String.raw`$\sqrt{2}\left[\cos\left(-\frac{\pi}{4}\right)+i\sin\left(-\frac{\pi}{4}\right)\right]$`,
          ],
          correct: String.raw`$2\sqrt{2}\left[\cos\left(-\frac{\pi}{4}\right)+i\sin\left(-\frac{\pi}{4}\right)\right]$`,
          explanation: String.raw`ជាមួយ $r_{2}=2\sqrt{2}$ និង $\alpha_{2}=-\dfrac{\pi}{4}$៖
$$z_{2}=2\sqrt{2}\left[\cos\left(-\frac{\pi}{4}\right)+i\sin\left(-\frac{\pi}{4}\right)\right]$$`,
        },
        {
          id: "c5",
          points: 1,
          q: {
            en: String.raw`ម៉ូឌុលនៃ $Z$`,
            km: String.raw`ម៉ូឌុលនៃ $Z$`,
          },
          options: [
            String.raw`$\frac{1}{4}$`,
            String.raw`$4$`,
            String.raw`$\frac{1}{2}$`,
            String.raw`$\frac{1}{8}$`,
          ],
          correct: String.raw`$\frac{1}{4}$`,
          explanation: String.raw`ប្រើ $\left|\dfrac{z_{1}}{z_{2}}\right|=\dfrac{|z_{1}|}{|z_{2}|}$៖
$$|Z|=\frac{|z_{1}|^{7}}{|z_{2}|^{6}}=\frac{2^{7}}{\left(2\sqrt{2}\right)^{6}}=\frac{2^{7}}{2^{6} \cdot 2^{3}}=\frac{2^{7}}{2^{9}}=\frac{1}{2^{2}}=\frac{1}{4}$$`,
        },
        {
          id: "c6",
          points: 1,
          q: {
            en: String.raw`អាគុយម៉ង់នៃ $Z$`,
            km: String.raw`អាគុយម៉ង់នៃ $Z$`,
          },
          options: [
            String.raw`$\frac{\pi}{3}$`,
            String.raw`$-\frac{\pi}{3}$`,
            String.raw`$-\frac{7\pi}{6}$`,
            String.raw`$\frac{\pi}{6}$`,
          ],
          correct: String.raw`$\frac{\pi}{3}$`,
          explanation: String.raw`ប្រើ $\arg\left(\dfrac{z_{1}}{z_{2}}\right)=\arg z_{1}-\arg z_{2}$ និង $\arg\left(z^{n}\right)=n \cdot \arg z$៖
$$\arg Z=\arg\left(z_{1}^{7}\right)-\arg\left(z_{2}^{6}\right)=7\left(-\frac{\pi}{6}\right)-6\left(-\frac{\pi}{4}\right)+2k\pi=\frac{-14\pi+18\pi}{12}+2k\pi$$
$$=\frac{4\pi}{12}+2k\pi=\frac{\pi}{3}+2k\pi \ , \ k \in \mathbb{Z}$$
បើបូកជំនួសឱ្យដក នឹងបាន $-\dfrac{7\pi}{6}$ ដែលជាចម្លើយខុសមួយក្នុងជម្រើស។`,
        },
        {
          id: "c7",
          points: 2,
          q: {
            en: String.raw`ទម្រង់ត្រីកោណមាត្រនៃ $Z$`,
            km: String.raw`ទម្រង់ត្រីកោណមាត្រនៃ $Z$`,
          },
          options: [
            String.raw`$\frac{1}{4}\left(\cos\frac{\pi}{3}+i\sin\frac{\pi}{3}\right)$`,
            String.raw`$4\left(\cos\frac{\pi}{3}+i\sin\frac{\pi}{3}\right)$`,
            String.raw`$\frac{1}{4}\left(\cos\left(-\frac{\pi}{3}\right)+i\sin\left(-\frac{\pi}{3}\right)\right)$`,
            String.raw`$\frac{1}{8}\left(\cos\frac{\pi}{3}+i\sin\frac{\pi}{3}\right)$`,
          ],
          correct: String.raw`$\frac{1}{4}\left(\cos\frac{\pi}{3}+i\sin\frac{\pi}{3}\right)$`,
          explanation: String.raw`ជាមួយ $r=\dfrac{1}{4}$ និង $\alpha=\dfrac{\pi}{3}$៖
$$Z=\frac{1}{4}\left(\cos\frac{\pi}{3}+i\sin\frac{\pi}{3}\right)$$`,
        },
        {
          id: "c8",
          points: 3,
          q: {
            en: String.raw`ទម្រង់ពីជគណិតនៃ $Z$`,
            km: String.raw`ទម្រង់ពីជគណិតនៃ $Z$`,
          },
          options: [
            String.raw`$\frac{1}{8}+\frac{\sqrt{3}}{8}i$`,
            String.raw`$\frac{1}{8}-\frac{\sqrt{3}}{8}i$`,
            String.raw`$\frac{\sqrt{3}}{8}+\frac{1}{8}i$`,
            String.raw`$\frac{1}{4}+\frac{\sqrt{3}}{4}i$`,
          ],
          correct: String.raw`$\frac{1}{8}+\frac{\sqrt{3}}{8}i$`,
          explanation: String.raw`ជំនួស $\cos\dfrac{\pi}{3}=\dfrac{1}{2}$ និង $\sin\dfrac{\pi}{3}=\dfrac{\sqrt{3}}{2}$៖
$$Z=\frac{1}{4}\left(\frac{1}{2}+i\frac{\sqrt{3}}{2}\right)=\frac{1}{8}+\frac{\sqrt{3}}{8}i$$
ផ្នែកពិតគឺ $\dfrac{1}{8}$ និងផ្នែកនិមិត្តគឺ $\dfrac{\sqrt{3}}{8}$ — កុំដូរកន្លែងគ្នា។`,
        },
      ],
    },
  ],
};
