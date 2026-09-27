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
 * ⚠ ALL PARTS I TO VII (125 of the paper's 125 points).
 * Complete paper transcribed and adapted to multiple-choice.
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
  note: "វិញ្ញាសាពិតត្រូវសរសេរដំណោះស្រាយ តែនៅទីនេះជាការជ្រើសរើសចម្លើយ ដូច្នេះសូមគណនាលើក្រដាសជាមុនសិន។",

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
            String.raw`$-\frac{1}{24}$`,
            String.raw`$\frac{1}{48}$`,
            String.raw`$-\frac{1}{48}$`,
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
            String.raw`$1$`,
            String.raw`$2$`,
            String.raw`$\frac{\sqrt{3}}{2}$`,
            String.raw`$\frac{1}{2}$`,
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
            String.raw`$\frac{57}{260}$`,
            String.raw`$\frac{127}{260}$`,
            String.raw`$\frac{133}{260}$`,
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
            String.raw`$\frac{7}{26}$`,
            String.raw`$\frac{57}{260}$`,
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
            String.raw`$\frac{133}{260}$`,
            String.raw`$\frac{57}{260}$`,
            String.raw`$\frac{7}{26}$`,
            String.raw`$\frac{127}{260}$`,
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
            String.raw`$|z_{1}|=4,\ \arg z_{1}=-\frac{\pi}{6}$`,
            String.raw`$|z_{1}|=2,\ \arg z_{1}=\frac{\pi}{6}$`,
            String.raw`$|z_{1}|=2,\ \arg z_{1}=-\frac{\pi}{6}$`,
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
            String.raw`$2\left[\cos\frac{\pi}{6}+i\sin\frac{\pi}{6}\right]$`,
            String.raw`$4\left[\cos\left(-\frac{\pi}{6}\right)+i\sin\left(-\frac{\pi}{6}\right)\right]$`,
            String.raw`$2\left[\sin\left(-\frac{\pi}{6}\right)+i\cos\left(-\frac{\pi}{6}\right)\right]$`,
            String.raw`$2\left[\cos\left(-\frac{\pi}{6}\right)+i\sin\left(-\frac{\pi}{6}\right)\right]$`,
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
            String.raw`$|z_{2}|=2,\ \arg z_{2}=-\frac{\pi}{4}$`,
            String.raw`$|z_{2}|=2\sqrt{2},\ \arg z_{2}=-\frac{\pi}{4}$`,
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
            String.raw`$2\left[\cos\left(-\frac{\pi}{4}\right)+i\sin\left(-\frac{\pi}{4}\right)\right]$`,
            String.raw`$2\sqrt{2}\left[\cos\frac{\pi}{4}+i\sin\frac{\pi}{4}\right]$`,
            String.raw`$2\sqrt{2}\left[\cos\left(-\frac{\pi}{4}\right)+i\sin\left(-\frac{\pi}{4}\right)\right]$`,
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
            String.raw`$4$`,
            String.raw`$\frac{1}{4}$`,
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
            String.raw`$4\left(\cos\frac{\pi}{3}+i\sin\frac{\pi}{3}\right)$`,
            String.raw`$\frac{1}{4}\left(\cos\left(-\frac{\pi}{3}\right)+i\sin\left(-\frac{\pi}{3}\right)\right)$`,
            String.raw`$\frac{1}{8}\left(\cos\frac{\pi}{3}+i\sin\frac{\pi}{3}\right)$`,
            String.raw`$\frac{1}{4}\left(\cos\frac{\pi}{3}+i\sin\frac{\pi}{3}\right)$`,
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
            String.raw`$\frac{1}{8}-\frac{\sqrt{3}}{8}i$`,
            String.raw`$\frac{1}{8}+\frac{\sqrt{3}}{8}i$`,
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

    {
      id: "integrals",
      title: "IV. អាំងតេក្រាល",
      statement: String.raw`គណនាអាំងតេក្រាល $I=\displaystyle\int_{0}^{2}\left(x^{2}+2-x^{3}\right)dx$ ។ គណនាអាំងតេក្រាល $J_{1}=\displaystyle\int_{0}^{1}\dfrac{xdx}{1+x^{2}}$ ។ គេមាន $J_{2}=\displaystyle\int_{0}^{1}\dfrac{x^{3}}{1+x^{2}}dx$

គណនា $J_{1}+J_{2}$ និងទាញយកតែម្ខាង $J_{2}$ ។ គណនាអាំងតេក្រាល $K=\displaystyle\int_{0}^{\frac{\pi}{2}}\left(\sin^{2}x\cos^{4}x+\sin^{4}x\cos^{2}x\right)dx$`,
      instruction:
        "សូមគណនាលើក្រដាសជាមុនសិន រួចជ្រើសរើសចម្លើយម្តងមួយៗខាងក្រោម។",
      questions: [
        {
          id: "i1",
          points: 3,
          q: {
            en: String.raw`គណនា $I=\displaystyle\int_{0}^{2}\left(x^{2}+2-x^{3}\right)dx$`,
            km: String.raw`គណនា $I=\displaystyle\int_{0}^{2}\left(x^{2}+2-x^{3}\right)dx$`,
          },
          options: [
            String.raw`$\frac{4}{3}$`,
            String.raw`$4$`,
            String.raw`$\frac{8}{3}$`,
            String.raw`$\frac{10}{3}$`,
          ],
          correct: String.raw`$\frac{8}{3}$`,
          explanation: String.raw`គណនាអាទិភូមិម្តងមួយៗ៖
$$I=\left[\frac{x^{3}}{3}+2x-\frac{x^{4}}{4}\right]_{0}^{2}=\left(\frac{2^{3}}{3}+2 \times 2-\frac{2^{4}}{4}\right)-(0+0-0)$$
$$=\frac{8}{3}+4-4=\frac{8}{3}$$
កុំភ្លេចសញ្ញាដក ($-x^{3}$) នៅអាំងតេក្រាល — បើភ្លេច នឹងបាន $\frac{8}{3}+4+4=\frac{32}{3}$។`,
        },
        {
          id: "i2",
          points: 3,
          q: {
            en: String.raw`គណនា $J_{1}=\displaystyle\int_{0}^{1}\dfrac{xdx}{1+x^{2}}$`,
            km: String.raw`គណនា $J_{1}=\displaystyle\int_{0}^{1}\dfrac{xdx}{1+x^{2}}$`,
          },
          options: [
            String.raw`$\ln 2$`,
            String.raw`$\frac{1}{2}$`,
            String.raw`$\frac{1}{4}$`,
            String.raw`$\frac{\ln 2}{2}$`,
          ],
          correct: String.raw`$\frac{\ln 2}{2}$`,
          explanation: String.raw`សម្គាល់ថា $(1+x^{2})'=2x$ ដូច្នេះ $xdx=\dfrac{1}{2}d(1+x^{2})$៖
$$J_{1}=\int_{0}^{1}\frac{1}{2}\cdot\frac{(1+x^{2})'}{(1+x^{2})}dx=\frac{1}{2}\left[\ln(1+x^{2})\right]_{0}^{1}$$
$$=\frac{1}{2}\left(\ln(1+1)-\ln(1+0)\right)=\frac{1}{2}\left(\ln 2-\ln 1\right)=\frac{\ln 2}{2}$$
ដោយ $\ln 1=0$។ ការដូរអថេរ $t=1+x^{2}$ ក៏បានដែរ — $dt=2xdx$, $x=0 \Rightarrow t=1$, $x=1 \Rightarrow t=2$។`,
        },
        {
          id: "i3",
          points: 3,
          q: {
            en: String.raw`គណនា $J_{1}+J_{2}$`,
            km: String.raw`គណនា $J_{1}+J_{2}$`,
          },
          options: [
            String.raw`$1$`,
            String.raw`$\frac{1}{2}$`,
            String.raw`$\frac{\ln 2}{2}$`,
            String.raw`$\frac{3}{4}$`,
          ],
          correct: String.raw`$\frac{1}{2}$`,
          explanation: String.raw`បន្ថែមអាំងតេក្រាលពីរ — ភាគបែងដូចគ្នា៖
$$J_{1}+J_{2}=\int_{0}^{1}\frac{xdx}{1+x^{2}}+\int_{0}^{1}\frac{x^{3}}{1+x^{2}}dx=\int_{0}^{1}\frac{x+x^{3}}{1+x^{2}}dx=\int_{0}^{1}\frac{x(1+x^{2})}{1+x^{2}}dx$$
$$=\int_{0}^{1}x \cdot dx=\left[\frac{x^{2}}{2}\right]_{0}^{1}=\frac{1}{2}-0=\frac{1}{2}$$
គន្លឹះ៖ រៀងរាល់ពេលឃើញ $(1+x^{2})$ នៅភាគយក និងភាគបែង — សូមពិចារណាសម្រួល។`,
        },
        {
          id: "i4",
          points: 3,
          q: {
            en: String.raw`គណនាតម្លៃ $J_{2}$`,
            km: String.raw`គណនាតម្លៃ $J_{2}$`,
          },
          options: [
            String.raw`$\frac{1-\ln 2}{2}$`,
            String.raw`$\frac{1}{2}-\ln 2$`,
            String.raw`$\frac{\ln 2-1}{2}$`,
            String.raw`$\frac{1}{4}$`,
          ],
          correct: String.raw`$\frac{1-\ln 2}{2}$`,
          explanation: String.raw`គេដឹង $J_{1}+J_{2}=\dfrac{1}{2}$ និង $J_{1}=\dfrac{\ln 2}{2}$៖
$$J_{2}=\frac{1}{2}-J_{1}=\frac{1}{2}-\frac{\ln 2}{2}=\frac{1-\ln 2}{2}$$
សញ្ញាវិជ្ជមាន ព្រោះ $\ln 2 \approx 0.693 < 1$។ បើដូរសញ្ញា នឹងបាន $\dfrac{\ln 2-1}{2}<0$ ដែលមិនអាចជាអាំងតេក្រាលនៃអនុគមន៍វិជ្ជមានលើ $[0,1]$។`,
        },
        {
          id: "i5",
          points: 3,
          q: {
            en: String.raw`គណនា $K=\displaystyle\int_{0}^{\frac{\pi}{2}}\left(\sin^{2}x\cos^{4}x+\sin^{4}x\cos^{2}x\right)dx$`,
            km: String.raw`គណនា $K=\displaystyle\int_{0}^{\frac{\pi}{2}}\left(\sin^{2}x\cos^{4}x+\sin^{4}x\cos^{2}x\right)dx$`,
          },
          options: [
            String.raw`$\frac{\pi}{8}$`,
            String.raw`$\frac{\pi}{32}$`,
            String.raw`$\frac{\pi}{16}$`,
            String.raw`$\frac{1}{16}$`,
          ],
          correct: String.raw`$\frac{\pi}{16}$`,
          explanation: String.raw`ដកកត្តារួមចេញ៖
$$K=\int_{0}^{\frac{\pi}{2}}\sin^{2}x\cos^{2}x\left(\cos^{2}x+\sin^{2}x\right)dx=\int_{0}^{\frac{\pi}{2}}\sin^{2}x\cos^{2}x \cdot 1 \, dx$$
ប្រើ $\sin 2\alpha=2\sin\alpha\cos\alpha$ ដូច្នេះ $\sin^{2}x\cos^{2}x=\left(\dfrac{1}{2}\sin 2x\right)^{2}=\dfrac{1}{4}\sin^{2}2x$។
បន្ទាប់មកប្រើ $\sin^{2}\alpha=\dfrac{1-\cos 2\alpha}{2}$៖
$$K=\int_{0}^{\frac{\pi}{2}}\frac{1}{4}\cdot\frac{1-\cos 4x}{2}dx=\int_{0}^{\frac{\pi}{2}}\left(\frac{1}{8}-\frac{1}{8}\cos 4x\right)dx$$
$$=\left[\frac{1}{8}x-\frac{1}{32}\sin 4x\right]_{0}^{\frac{\pi}{2}}=\left(\frac{1}{8}\cdot\frac{\pi}{2}-\frac{1}{32}\sin 2\pi\right)-(0)=\frac{\pi}{16}$$
$\sin 2\pi=0$ ដូច្នេះមានតែស្មា $\dfrac{\pi}{16}$ ប៉ុណ្ណោះ។`,
        },
      ],
    },

    {
      id: "ode",
      title: "V. សមីការឌីផេរ៉ង់ស្យែល",
      statement: String.raw`a. រកដំណោះស្រាយទីផេរ៉ង់ស្យែលទូទៅនៃសមីការ $(E): y''=3y-2y'$ ។

b. រកចម្លើយពិសេសម្តងនៃសមីការឌីផេរ៉ង់ស្យែល $(E)$ ដែល $y(0)=1$ និង $y'(1)=e$ (គេចាំថានិមិត្តសញ្ញា $\ln e=1$)`,
      instruction:
        "សូមគណនាលើក្រដាសជាមុនសិន រួចជ្រើសរើសចម្លើយម្តងមួយៗខាងក្រោម។",
      questions: [
        {
          id: "d1",
          points: 2,
          q: {
            en: String.raw`សមីការលក្ខណៈនៃ $(E)$ គឺ៖`,
            km: String.raw`សមីការលក្ខណៈនៃ $(E)$ គឺ៖`,
          },
          options: [
            String.raw`$\lambda^{2}-2\lambda+3=0$`,
            String.raw`$\lambda^{2}+2\lambda-3=0$`,
            String.raw`$\lambda^{2}-2\lambda-3=0$`,
            String.raw`$\lambda^{2}+2\lambda+3=0$`,
          ],
          correct: String.raw`$\lambda^{2}+2\lambda-3=0$`,
          explanation: String.raw`សរសេរសមីការជាទម្រង់ស្តង់ដារ៖ $y''=3y-2y' \Leftrightarrow y''+2y'-3y=0$។
សមីការលក្ខណៈ (characteristic equation) គឺ៖
$$\lambda^{2}+2\lambda-3=0$$
ចំណាំ៖ មេគុណ ($+2$ មុន $\lambda$ និង $-3$ ថេរ) ត្រូវផ្គូផ្គងជាមួយ $y''+2y'-3y=0$ ដោយផ្ទាល់។ បើបញ្ចូលសញ្ញាខុស នឹងបាន $\lambda^{2}-2\lambda+3=0$ ឬ $\lambda^{2}-2\lambda-3=0$។`,
        },
        {
          id: "d2",
          points: 2,
          q: {
            en: String.raw`ឫសនៃសមីការលក្ខណៈ៖`,
            km: String.raw`ឫសនៃសមីការលក្ខណៈ៖`,
          },
          options: [
            String.raw`$\lambda_{1}=-1,\ \lambda_{2}=3$`,
            String.raw`$\lambda_{1}=1,\ \lambda_{2}=3$`,
            String.raw`$\lambda_{1}=1,\ \lambda_{2}=-3$`,
            String.raw`$\lambda_{1}=-1,\ \lambda_{2}=-3$`,
          ],
          correct: String.raw`$\lambda_{1}=1,\ \lambda_{2}=-3$`,
          explanation: String.raw`ដោះស្រាយ $\lambda^{2}+2\lambda-3=0$៖
$$(\lambda-1)(\lambda+3)=0 \quad\Rightarrow\quad \lambda_{1}=1 \,,\quad \lambda_{2}=-3$$
ផ្ទៀងផ្ទាត់៖ ផលបូកឫស $= 1+(-3) = -2 = -\dfrac{b}{a}$ ✓ ផលគុណឫស $= 1 \times (-3) = -3 = \dfrac{c}{a}$ ✓`,
        },
        {
          id: "d3",
          points: 2,
          q: {
            en: String.raw`ចម្លើយទូទៅនៃ $(E)$ គឺ៖`,
            km: String.raw`ចម្លើយទូទៅនៃ $(E)$ គឺ៖`,
          },
          options: [
            String.raw`$y=Ae^{-x}+Be^{3x}$`,
            String.raw`$y=(A+Bx)e^{x}$`,
            String.raw`$y=Ae^{x}+Be^{3x}$`,
            String.raw`$y=Ae^{x}+Be^{-3x}$`,
          ],
          correct: String.raw`$y=Ae^{x}+Be^{-3x}$`,
          explanation: String.raw`ឫសពិតផ្សេងគ្នាពីរ $\lambda_{1}=1$ និង $\lambda_{2}=-3$ ដូច្នេះចម្លើយទូទៅគឺ៖
$$y=Ae^{\lambda_{1}x}+Be^{\lambda_{2}x}=Ae^{x}+Be^{-3x} \quad,\quad (A,B \in \mathbb{R})$$
បើឫសស្មើគ្នា ($\lambda_{1}=\lambda_{2}$) ចម្លើយនឹងមានទម្រង់ $(A+Bx)e^{\lambda x}$ ដែលមិនមែនជាករណីនេះ។`,
        },
        {
          id: "d4",
          points: 2,
          q: {
            en: String.raw`ពីលក្ខខណ្ឌ $y(0)=1$ គេបានទំនាក់ទំនង៖`,
            km: String.raw`ពីលក្ខខណ្ឌ $y(0)=1$ គេបានទំនាក់ទំនង៖`,
          },
          options: [
            String.raw`$A+B=1$`,
            String.raw`$A-B=1$`,
            String.raw`$A+B=0$`,
            String.raw`$A-3B=1$`,
          ],
          correct: String.raw`$A+B=1$`,
          explanation: String.raw`ជំនួស $x=0$ ក្នុង $y=Ae^{x}+Be^{-3x}$៖
$$y(0)=Ae^{0}+Be^{0}=A+B=1$$
ព្រោះ $e^{0}=1$ គ្រប់ពេល។`,
        },
        {
          id: "d5",
          points: 2,
          q: {
            en: String.raw`ចម្លើយពិសេសម្តង (ដែល $y(0)=1$, $y'(1)=e$) គឺ៖`,
            km: String.raw`ចម្លើយពិសេសម្តង (ដែល $y(0)=1$, $y'(1)=e$) គឺ៖`,
          },
          options: [
            String.raw`$y=e^{x}+e^{-3x}$`,
            String.raw`$y=e^{-3x}$`,
            String.raw`$y=e^{x}$`,
            String.raw`$y=\frac{1}{2}e^{x}+\frac{1}{2}e^{-3x}$`,
          ],
          correct: String.raw`$y=e^{x}$`,
          explanation: String.raw`គណនាដេរីវេ៖ $y'=Ae^{x}-3Be^{-3x}$។ ជំនួស $x=1$៖
$$y'(1)=Ae^{1}-3Be^{-3}=e$$
ផ្គូផ្គងជាមួយលក្ខខណ្ឌ $y(0)=1$ គឺ $A+B=1$ — ដោះប្រព័ន្ធ៖
$$\begin{cases}Ae^{1}-3Be^{-3}=e \\ A+B=1\end{cases}$$
គុណសមីការ (1) នឹង $(-e)$៖ $-Ae-Be=-e$

បន្ថែមជាមួយ $Ae-3Be^{-3}=e$៖
$$-Be-3Be^{-3}=0 \quad\Rightarrow\quad -B(e+3e^{-3})=0 \quad\Rightarrow\quad B=0$$
ដោយ $e+3e^{-3} \ne 0$។ បញ្ចូលក្នុង (1)៖ $A+0=1 \Rightarrow A=1$។
$$y=1 \cdot e^{x}+0 \cdot e^{-3x}=e^{x}$$
ផ្ទៀងផ្ទាត់៖ $y(0)=e^{0}=1$ ✓ និង $y'(1)=e^{1}=e$ ✓`,
        },
      ],
    },

    {
      id: "geometry",
      title: "VI. ធរណីមាត្រក្នុងលំហ និងកោនិក",
      statement: String.raw`A. នៅក្នុងលំហប្រដាប់ដោយតម្រុយអរតូណរម៉ាល់ $(O, \vec{i}, \vec{j}, \vec{k})$ គេមានចំណុច $A(1,-2,0)$, $B(-2,0,1)$, $C(-2,-1,2)$, $D(-2,1,-2)$, $E(2,5,-2)$, $F(-1,0,-2)$ ។
1. គណនាវ៉ិចទ័រ $\vec{AC}$, $\vec{AE}$, $\vec{BD}$, $\vec{BF}$, $\vec{DF}$ ។
2. បង្ហាញថាត្រីកោណ $ACE$ កែងត្រង់ $A$ និងត្រីកោណ $BDF$ សម័ង្ស។

B. ប៉ារ៉ាបូលមួយមានកំណុំ $F$ នៅលើអ័ក្សអាប់ស៊ីស និងកំពូល $O(0,0)$ ។ រកសមីការស្តង់ដា៉ប៉ារ៉ាបូលនេះបើតកាត់តាមចំណុច $A(2,4)$ ។ រកតម្លៃ $x_{1}$ បើ $B(x_{1},-8)$ នៅលើប៉ារ៉ាបូលនេះ។`,
      instruction:
        "សូមគណនាលើក្រដាសជាមុនសិន រួចជ្រើសរើសចម្លើយម្តងមួយៗខាងក្រោម។",
      questions: [
        {
          id: "v1",
          points: 3,
          q: {
            en: String.raw`1. គណនាវ៉ិចទ័រ $\vec{AC}$ និង $\vec{AE}$`,
            km: String.raw`1. គណនាវ៉ិចទ័រ $\vec{AC}$ និង $\vec{AE}$`,
          },
          options: [
            String.raw`$\vec{AC}=(3,-1,-2),\ \vec{AE}=(-1,-7,2)$`,
            String.raw`$\vec{AC}=(-3,1,2),\ \vec{AE}=(1,7,-2)$`,
            String.raw`$\vec{AC}=(-1,-3,2),\ \vec{AE}=(3,3,-2)$`,
            String.raw`$\vec{AC}=(-3,1,2),\ \vec{AE}=(3,3,-2)$`,
          ],
          correct: String.raw`$\vec{AC}=(-3,1,2),\ \vec{AE}=(1,7,-2)$`,
          explanation: String.raw`រូបមន្តកូអរដោនេវ៉ិចទ័រ $\vec{AB}=(x_{B}-x_{A}, y_{B}-y_{A}, z_{B}-z_{A})$៖
$$\vec{AC}=(-2-1, -1-(-2), 2-0)=(-3, 1, 2)$$
$$\vec{AE}=(2-1, 5-(-2), -2-0)=(1, 7, -2)$$
សញ្ញាដកដកទៅជាបូក ($y_{C}-y_{A}=-1-(-2)=1$) — បើភ្លេច នឹងច្រឡំសញ្ញា។`,
        },
        {
          id: "v2",
          points: 2,
          q: {
            en: String.raw`1. គណនាវ៉ិចទ័រ $\vec{BD}$, $\vec{BF}$ និង $\vec{DF}$`,
            km: String.raw`1. គណនាវ៉ិចទ័រ $\vec{BD}$, $\vec{BF}$ និង $\vec{DF}$`,
          },
          options: [
            String.raw`$\vec{BD}=(0,-1,1),\ \vec{BF}=(-1,0,1),\ \vec{DF}=(-1,1,0)$`,
            String.raw`$\vec{BD}=(0,1,-3),\ \vec{BF}=(1,0,-3),\ \vec{DF}=(1,-1,-4)$`,
            String.raw`$\vec{BD}=(0,1,-1),\ \vec{BF}=(1,0,-1),\ \vec{DF}=(1,-1,0)$`,
            String.raw`$\vec{BD}=(0,1,-1),\ \vec{BF}=(1,0,1),\ \vec{DF}=(1,1,0)$`,
          ],
          correct: String.raw`$\vec{BD}=(0,1,-1),\ \vec{BF}=(1,0,-1),\ \vec{DF}=(1,-1,0)$`,
          explanation: String.raw`$$\vec{BD}=(-2-(-2), 1-0, -2-1)=(0, 1, -1)$$
$$\vec{BF}=(-1-(-2), 0-0, -2-1)=(1, 0, -1)$$
$$\vec{DF}=(-1-(-2), 0-1, -2-(-2))=(1, -1, 0)$$
ចំណាំ៖ $-2-(-2)=-2+2=0$ សម្រាប់កូអរដោនេ $z$ នៃ $\vec{DF}$។`,
        },
        {
          id: "v3",
          points: 2,
          q: {
            en: String.raw`2. បង្ហាញថាត្រីកោណ $ACE$ កែងត្រង់ $A$`,
            km: String.raw`2. បង្ហាញថាត្រីកោណ $ACE$ កែងត្រង់ $A$`,
          },
          options: [
            String.raw`$\vec{AC} \cdot \vec{AE} = (-3)(1)+(1)(7)+(2)(-2) = 0 \Rightarrow \vec{AC} \perp \vec{AE}$`,
            String.raw`$\vec{AC} \cdot \vec{AE} = (-3)(1)+(1)(7)-(2)(-2) = 8 \ne 0$`,
            String.raw`$AC^2 + AE^2 = CE^2 = 68$`,
            String.raw`$\vec{AC} \times \vec{AE} = \vec{0}$`,
          ],
          correct: String.raw`$\vec{AC} \cdot \vec{AE} = (-3)(1)+(1)(7)+(2)(-2) = 0 \Rightarrow \vec{AC} \perp \vec{AE}$`,
          explanation: String.raw`ផលគុណស្កាលែនៃវ៉ិចទ័រពីរ៖ $\vec{u} \cdot \vec{v} = x x' + y y' + z z'$
$$\vec{AC} \cdot \vec{AE} = (-3)(1) + (1)(7) + (2)(-2) = -3 + 7 - 4 = 0$$
ដោយ $\vec{AC} \cdot \vec{AE} = 0$ នាំឱ្យ $\vec{AC} \perp \vec{AE}$ ដូចនេះត្រីកោណ $ACE$ ជាត្រីកោណកែងត្រង់កំពូល $A$។`,
        },
        {
          id: "v4",
          points: 3,
          q: {
            en: String.raw`2. បង្ហាញថាត្រីកោណ $BDF$ ជាត្រីកោណសម័ង្ស`,
            km: String.raw`2. បង្ហាញថាត្រីកោណ $BDF$ ជាត្រីកោណសម័ង្ស`,
          },
          options: [
            String.raw`$|\vec{BD}|=|\vec{BF}|=2,\ |\vec{DF}|=\sqrt{2}$`,
            String.raw`$|\vec{BD}|=\sqrt{3},\ |\vec{BF}|=\sqrt{3},\ |\vec{DF}|=\sqrt{2}$`,
            String.raw`$|\vec{BD}|=2,\ |\vec{BF}|=2,\ |\vec{DF}|=2$`,
            String.raw`$|\vec{BD}|=|\vec{BF}|=|\vec{DF}|=\sqrt{2}$`,
          ],
          correct: String.raw`$|\vec{BD}|=|\vec{BF}|=|\vec{DF}|=\sqrt{2}$`,
          explanation: String.raw`គណនាប្រវែងជ្រុងទាំងបីនៃត្រីកោណ $BDF$ តាមរូបមន្ត $|\vec{u}|=\sqrt{x^2+y^2+z^2}$៖
$$|\vec{BD}|=\sqrt{0^2+1^2+(-1)^2}=\sqrt{0+1+1}=\sqrt{2}$$
$$|\vec{BF}|=\sqrt{1^2+0^2+(-1)^2}=\sqrt{1+0+1}=\sqrt{2}$$
$$|\vec{DF}|=\sqrt{1^2+(-1)^2+0^2}=\sqrt{1+1+0}=\sqrt{2}$$
ដោយ $|\vec{BD}|=|\vec{BF}|=|\vec{DF}|=\sqrt{2}$ (ឯកតាប្រវែង) នាំឱ្យត្រីកោណ $BDF$ ជាត្រីកោណសម័ង្ស (equilateral triangle)។`,
        },
        {
          id: "v5",
          points: 7,
          q: {
            en: String.raw`B. រកសមីការស្តង់ដានៃប៉ារ៉ាបូល`,
            km: String.raw`B. រកសមីការស្តង់ដានៃប៉ារ៉ាបូល`,
          },
          options: [
            String.raw`$x^2 = 8y$`,
            String.raw`$y^2 = 8x$`,
            String.raw`$y^2 = 4x$`,
            String.raw`$y^2 = 16x$`,
          ],
          correct: String.raw`$y^2 = 8x$`,
          explanation: String.raw`តាមបម្រាប់ ប៉ារ៉ាបូលមានកំណុំនៅលើអ័ក្សអាប់ស៊ីស (អ័ក្សដេក) និងកំពូល $O(0,0)$ នាំឱ្យអ័ក្សឆ្លុះជាអ័ក្សដេក ($y=0$)។
សមីការស្តង់ដាមានទម្រង់៖ $(y-k)^2 = 4p(x-h)$ ជាមួយ $h=0, k=0$ គឺ $y^2 = 4px$។
ដោយប៉ារ៉ាបូលកាត់តាមចំណុច $A(2,4)$ គេបាន៖
$$4^2 = 4p(2) \quad\Rightarrow\quad 16 = 8p \quad\Rightarrow\quad p = 2 \quad\Rightarrow\quad 4p = 8$$
ដូចនេះ សមីការស្តង់ដានៃប៉ារ៉ាបូលគឺ $y^2 = 8x$។`,
        },
        {
          id: "v6",
          points: 3,
          q: {
            en: String.raw`រកតម្លៃ $x_{1}$ បើចំណុច $B(x_{1},-8)$ នៅលើប៉ារ៉ាបូល`,
            km: String.raw`រកតម្លៃ $x_{1}$ បើចំណុច $B(x_{1},-8)$ នៅលើប៉ារ៉ាបូល`,
          },
          options: [
            String.raw`$x_{1} = -8$`,
            String.raw`$x_{1} = 4$`,
            String.raw`$x_{1} = 8$`,
            String.raw`$x_{1} = 64$`,
          ],
          correct: String.raw`$x_{1} = 8$`,
          explanation: String.raw`ជំនួសកូអរដោនេនៃ $B(x_{1}, -8)$ ចូលក្នុងសមីការប៉ារ៉ាបូល $y^2 = 8x$៖
$$(-8)^2 = 8x_{1} \quad\Rightarrow\quad 64 = 8x_{1} \quad\Rightarrow\quad x_{1} = \frac{64}{8} = 8$$`,
        },
      ],
    },

    {
      id: "functions",
      title: "VII. សិក្សាអនុគមន៍",
      statement: String.raw`គេមានអនុគមន៍ $g$ ដែល $g(x)=\ln\left(\dfrac{-x-3}{x-3}\right)$ ។

1. រកដែនកំណត់នៃអនុគមន៍ $g$ និងសិក្សាថាតើ $g$ ជាអនុគមន៍គូ ឬជាអនុគមន៍សេស? ($g$ ជាអនុគមន៍គូលុះត្រាតែ $g(-x)=g(x)$ និង $g$ ជាអនុគមន៍សេសលុះត្រាតែ $g(-x)=-g(x)$)។

2. គណនាលីមីតនៃអនុគមន៍ $g$ ត្រង់ $-3$ និងត្រង់ $+3$។ សិក្សាអថេរភាពនៃ $g$ លើដែនកំណត់របស់វា។ សង់តារាងអថេរភាពរបស់វា។

3. $(O,\vec{i},\vec{j})$ ជាតម្រុយអរតូណរម៉ាល់។ តាង $C$ ក្រាបនៃអនុគមន៍ $g$ ក្នុងតម្រុយនេះ។ កំណត់សមីការបន្ទាត់ប៉ះ $T$ ទៅនឹងក្រាប $C$ ត្រង់ចំណុចដែលមានអាប់ស៊ីស $0$។ សង់ក្រាប $C$ និងបន្ទាត់ប៉ះ $T$។ សិក្សាសញ្ញានៃ $g(x)$ ទៅតាមតម្លៃ $x$។

4. a. គណនាដេរីវេនៃអនុគមន៍ $h$ ដែល $h(x)=x g(x)$ ។
b. រកផ្ទៃក្រឡានៃផ្នែកប្លង់នៅចន្លោះក្រាប $C$ អ័ក្សអាប់ស៊ីស និងបន្ទាត់ដែលមានសមីការ $x=0$ និង $x=1$។`,
      instruction:
        "សូមគណនាលើក្រដាសជាមុនសិន រួចជ្រើសរើសចម្លើយម្តងមួយៗខាងក្រោម។",
      questions: [
        {
          id: "g1",
          points: 3,
          q: {
            en: String.raw`1. រកដែនកំណត់នៃអនុគមន៍ $g$`,
            km: String.raw`1. រកដែនកំណត់នៃអនុគមន៍ $g$`,
          },
          options: [
            String.raw`$D = (-\infty, -3) \cup (3, +\infty)$`,
            String.raw`$D = [-3, 3]$`,
            String.raw`$D = (-3, 3)$`,
            String.raw`$D = \mathbb{R} \setminus \{3\}$`,
          ],
          correct: String.raw`$D = (-3, 3)$`,
          explanation: String.raw`អនុគមន៍ $g(x)=\ln\left(\dfrac{-x-3}{x-3}\right)$ មានន័យលុះត្រាតែ $\dfrac{-x-3}{x-3} > 0$ និង $x-3 \ne 0$។
ឫសភាគយក៖ $-x-3=0 \Rightarrow x=-3$
ឫសភាគបែង៖ $x-3=0 \Rightarrow x=3$

តារាងសញ្ញានៃ $\dfrac{-x-3}{x-3}$ ៖

| $x$ | $-\infty$ | $-3$ | $3$ | $+\infty$ |
| :--- | :---: | :---: | :---: | :---: |
| $-x-3$ | $+$ | $0$ | $-$ | $-$ |
| $x-3$ | $-$ | $-$ | $0$ | $+$ |
| $\dfrac{-x-3}{x-3}$ | $-$ | $0$ | $+$ | $-$ |

តាមតារាងសញ្ញា កន្សោមវិជ្ជមាន ($>0$) លើចន្លោះ $(-3, 3)$។
ដូចនេះ ដែនកំណត់គឺ $D = (-3, 3)$។`,
        },
        {
          id: "g2",
          points: 2,
          q: {
            en: String.raw`1. សិក្សាភាពគូ ឬសេសនៃអនុគមន៍ $g$`,
            km: String.raw`1. សិក្សាភាពគូ ឬសេសនៃអនុគមន៍ $g$`,
          },
          options: [
            String.raw`$g$ ជាអនុគមន៍គូ ព្រោះ $g(-x) = g(x)$`,
            String.raw`$g$ ជាអនុគមន៍សេស ព្រោះ $g(-x) = -g(x)$`,
            String.raw`$g$ មិនគូ និងមិនសេស`,
            String.raw`$g$ មិនអាចកំណត់ភាពគូសេសបានទេ`,
          ],
          correct: String.raw`$g$ ជាអនុគមន៍សេស ព្រោះ $g(-x) = -g(x)$`,
          explanation: String.raw`ដែនកំណត់ $D=(-3, 3)$ ជាចន្លោះស៊ីមេទ្រីធៀបនឹង $0$ គឺ $\forall x \in D \Rightarrow -x \in D$។
$$g(-x) = \ln\left(\frac{-(-x)-3}{(-x)-3}\right) = \ln\left(\frac{x-3}{-x-3}\right)$$
$$= \ln\left[\left(\frac{-x-3}{x-3}\right)^{-1}\right] = -\ln\left(\frac{-x-3}{x-3}\right) = -g(x)$$
ដោយ $g(-x) = -g(x)$ ដូចនេះ $g$ ជាអនុគមន៍សេស (odd function)។`,
        },
        {
          id: "g3",
          points: 3,
          q: {
            en: String.raw`2. គណនាលីមីត $\lim_{x \to -3^+} g(x)$ និងទាញរកសមីការអាស៊ីមតូត`,
            km: String.raw`2. គណនាលីមីត $\lim_{x \to -3^+} g(x)$ និងទាញរកសមីការអាស៊ីមតូត`,
          },
          options: [
            String.raw`$\lim_{x \to -3^+} g(x) = -\infty$ និងមានអាស៊ីមតូតឈរ $x = -3$`,
            String.raw`$\lim_{x \to -3^+} g(x) = +\infty$ និងមានអាស៊ីមតូតឈរ $x = -3$`,
            String.raw`$\lim_{x \to -3^+} g(x) = 0$ និងមានអាស៊ីមតូតដេក $y = 0$`,
            String.raw`$\lim_{x \to -3^+} g(x) = -\infty$ និងមានអាស៊ីមតូតដេក $y = -3$`,
          ],
          correct: String.raw`$\lim_{x \to -3^+} g(x) = -\infty$ និងមានអាស៊ីមតូតឈរ $x = -3$`,
          explanation: String.raw`តាង $X = \dfrac{-x-3}{x-3}$។
ពេល $x \to -3^+$ គេបាន $-x-3 \to 0^+$ និង $x-3 \to -6 < 0$ នាំឱ្យ $X \to 0^+$។
$$\lim_{x \to -3^+} g(x) = \lim_{X \to 0^+} \ln X = -\infty$$
ដោយ $\lim_{x \to -3^+} g(x) = -\infty$ ដូចនេះបន្ទាត់ $x = -3$ ជាអាស៊ីមតូតឈរនៃក្រាប $C$។`,
        },
        {
          id: "g4",
          points: 3,
          q: {
            en: String.raw`2. គណនាលីមីត $\lim_{x \to 3^-} g(x)$ និងទាញរកសមីការអាស៊ីមតូត`,
            km: String.raw`2. គណនាលីមីត $\lim_{x \to 3^-} g(x)$ និងទាញរកសមីការអាស៊ីមតូត`,
          },
          options: [
            String.raw`$\lim_{x \to 3^-} g(x) = -\infty$ និងមានអាស៊ីមតូតឈរ $x = 3$`,
            String.raw`$\lim_{x \to 3^-} g(x) = 0$ និងគ្មានអាស៊ីមតូតទេ`,
            String.raw`$\lim_{x \to 3^-} g(x) = 1$ និងមានអាស៊ីមតូតដេក $y = 1$`,
            String.raw`$\lim_{x \to 3^-} g(x) = +\infty$ និងមានអាស៊ីមតូតឈរ $x = 3$`,
          ],
          correct: String.raw`$\lim_{x \to 3^-} g(x) = +\infty$ និងមានអាស៊ីមតូតឈរ $x = 3$`,
          explanation: String.raw`តាង $X = \dfrac{-x-3}{x-3}$។
ពេល $x \to 3^-$ គេបាន $-x-3 \to -6 < 0$ និង $x-3 \to 0^-$ នាំឱ្យ $X \to \dfrac{-6}{0^-} = +\infty$។
$$\lim_{x \to 3^-} g(x) = \lim_{X \to +\infty} \ln X = +\infty$$
ដោយ $\lim_{x \to 3^-} g(x) = +\infty$ ដូចនេះបន្ទាត់ $x = 3$ ជាអាស៊ីមតូតឈរនៃក្រាប $C$។`,
        },
        {
          id: "g5",
          points: 5,
          q: {
            en: String.raw`2. គណនាដេរីវេ $g'(x)$ លើចន្លោះ $(-3, 3)$`,
            km: String.raw`2. គណនាដេរីវេ $g'(x)$ លើចន្លោះ $(-3, 3)$`,
          },
          options: [
            String.raw`$g'(x) = \dfrac{6}{(x-3)^2}$`,
            String.raw`$g'(x) = \dfrac{-6}{9-x^2}$`,
            String.raw`$g'(x) = \dfrac{6}{9-x^2}$`,
            String.raw`$g'(x) = \dfrac{1}{9-x^2}$`,
          ],
          correct: String.raw`$g'(x) = \dfrac{6}{9-x^2}$`,
          explanation: String.raw`ប្រើរូបមន្ត $[\ln u]' = \dfrac{u'}{u}$ ជាមួយ $u = \dfrac{-x-3}{x-3}$៖
$$u' = \frac{(-x-3)'(x-3) - (x-3)'(-x-3)}{(x-3)^2} = \frac{-1(x-3) - 1(-x-3)}{(x-3)^2} = \frac{-x+3+x+3}{(x-3)^2} = \frac{6}{(x-3)^2}$$
$$g'(x) = \frac{u'}{u} = \frac{\dfrac{6}{(x-3)^2}}{\dfrac{-x-3}{x-3}} = \frac{6}{(x-3)^2} \times \frac{x-3}{-x-3} = \frac{6}{(x-3)(-x-3)} = \frac{6}{-(x^2-9)} = \frac{6}{9-x^2}$$
វិធីម្យ៉ាងទៀត៖ $g(x) = \ln(-x-3) - \ln(x-3)$ មិនអាចសរសេរបានទេ ព្រោះកន្សោមទាំងពីរអវិជ្ជមានលើ $(-3, 3)$។`,
        },
        {
          id: "g6",
          points: 5,
          q: {
            en: String.raw`2. សិក្សាទិសដៅអថេរភាពនៃអនុគមន៍ $g$`,
            km: String.raw`2. សិក្សាទិសដៅអថេរភាពនៃអនុគមន៍ $g$`,
          },
          options: [
            String.raw`$g$ ចុះជានិច្ចលើ $(-3, 3)$ ព្រោះភាគយកវិជ្ជមាន`,
            String.raw`$g$ កើនជានិច្ចលើ $(-3, 3)$ និងគ្មានបរមាទេ`,
            String.raw`$g$ កើនលើ $(-3, 0)$ និងចុះលើ $(0, 3)$`,
            String.raw`$g$ មានអតិបរមាត្រង់ $x = 0$`,
          ],
          correct: String.raw`$g$ កើនជានិច្ចលើ $(-3, 3)$ និងគ្មានបរមាទេ`,
          explanation: String.raw`ចំពោះគ្រប់ $x \in (-3, 3)$ គេបាន $x^2 < 9 \Rightarrow 9-x^2 > 0$។
ដោយភាគយក $6 > 0$ និងភាគបែង $9-x^2 > 0$ នាំឱ្យ៖
$$g'(x) = \frac{6}{9-x^2} > 0 \quad (\forall x \in D)$$
ដូចនេះ អនុគមន៍ $g$ ជាអនុគមន៍កើនដាច់ខាតលើដែនកំណត់ $D=(-3, 3)$ របស់វា និងគ្មានតម្លៃបរមា (extreme values) ឡើយ។

តារាងអថេរភាពនៃអនុគមន៍ $g$ ៖

| $x$ | $-3$ | | $3$ |
| :--- | :---: | :---: | :---: |
| $g'(x)$ | | $+$ | |
| $g(x)$ | $-\infty$ | $\nearrow$ | $+\infty$ |`,
        },
        {
          id: "g7",
          points: 5,
          q: {
            en: String.raw`3. រកសមីការបន្ទាត់ប៉ះ $T$ ទៅនឹងក្រាប $C$ ត្រង់ចំណុចដែលមានអាប់ស៊ីស $x_0 = 0$`,
            km: String.raw`3. រកសមីការបន្ទាត់ប៉ះ $T$ ទៅនឹងក្រាប $C$ ត្រង់ចំណុចដែលមានអាប់ស៊ីស $x_0 = 0$`,
          },
          options: [
            String.raw`$T: y = \dfrac{3}{2}x$`,
            String.raw`$T: y = \dfrac{2}{3}x + 1$`,
            String.raw`$T: y = \dfrac{1}{3}x$`,
            String.raw`$T: y = \dfrac{2}{3}x$`,
          ],
          correct: String.raw`$T: y = \dfrac{2}{3}x$`,
          explanation: String.raw`រូបមន្តសមីការបន្ទាត់ប៉ះ៖ $y = g'(x_{0})(x - x_{0}) + g(x_{0})$
ត្រង់ $x_{0} = 0$៖
$$g(0) = \ln\left(\frac{-0-3}{0-3}\right) = \ln 1 = 0$$
$$g'(0) = \frac{6}{9 - 0^2} = \frac{6}{9} = \frac{2}{3}$$
ជំនួសចូលរូបមន្ត៖
$$T: y = \frac{2}{3}(x - 0) + 0 \quad\Rightarrow\quad T: y = \frac{2}{3}x$$

តារាងតម្លៃចំណុចសម្រាប់សង់បន្ទាត់ប៉ះ $T$ ៖

| $x$ | $0$ | $3$ |
| :--- | :---: | :---: |
| $y$ | $0$ | $2$ |`,
        },
        {
          id: "g8",
          points: 3,
          q: {
            en: String.raw`3. លក្ខណៈធរណីមាត្រនៃក្រាប $C$ និងបន្ទាត់ប៉ះ $T$`,
            km: String.raw`3. លក្ខណៈធរណីមាត្រនៃក្រាប $C$ និងបន្ទាត់ប៉ះ $T$`,
          },
          options: [
            String.raw`ក្រាប $C$ កាត់តាម $O(0,0)$ មានផ្ចិតឆ្លុះ $O$, អាស៊ីមតូតឈរ $x=\pm 3$ និងប៉ះ $T$ ត្រង់ $O$`,
            String.raw`ក្រាប $C$ មានអ័ក្សឆ្លុះជាអ័ក្សអរដោនេ $(Oy)$ និងប៉ះ $T$ ត្រង់ $(0, 1)$`,
            String.raw`ក្រាប $C$ មានអាស៊ីមតូតដេក $y = 0$ និងមិនកាត់គល់តម្រុយ $O$`,
            String.raw`ក្រាប $C$ កាត់តាមចំណុច $(1, 0)$ និង $(-1, 0)$`,
          ],
          correct: String.raw`ក្រាប $C$ កាត់តាម $O(0,0)$ មានផ្ចិតឆ្លុះ $O$, អាស៊ីមតូតឈរ $x=\pm 3$ និងប៉ះ $T$ ត្រង់ $O$`,
          explanation: String.raw`លក្ខណៈសង់ក្រាប $C$ និងបន្ទាត់ប៉ះ $T$៖
- គល់តម្រុយ $O(0,0)$ ជាផ្ចិតឆ្លុះនៃក្រាប $C$ ដោយសារ $g$ ជាអនុគមន៍សេស ($g(-x)=-g(x)$)។
- ក្រាប $C$ កាត់តាម $O(0,0)$ ព្រោះ $g(0)=0$។
- មានអាស៊ីមតូតឈរពីរគឺបន្ទាត់ $x = -3$ និង $x = 3$។
- បន្ទាត់ប៉ះ $T: y = \dfrac{2}{3}x$ កាត់តាមចំណុច $(0,0)$ និង $(3,2)$ ដោយប៉ះក្រាប $C$ ចំគល់តម្រុយ $O$។

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 320" width="100%" height="auto" style="max-width:360px">
  <defs>
    <marker id="arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="currentColor" opacity="0.6"/>
    </marker>
  </defs>
  <line x1="24" y1="160" x2="336" y2="160" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.5" marker-end="url(#arr)"/>
  <line x1="180" y1="300" x2="180" y2="20" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.5" marker-end="url(#arr)"/>
  <text x="338" y="156" fill="currentColor" font-size="11" font-weight="bold" font-family="sans-serif">x</text>
  <text x="186" y="24" fill="currentColor" font-size="11" font-weight="bold" font-family="sans-serif">y</text>
  <text x="170" y="174" fill="currentColor" opacity="0.7" font-size="10" font-family="sans-serif">O</text>
  <text x="102" y="174" fill="currentColor" opacity="0.6" font-size="9" text-anchor="middle" font-family="sans-serif">-3</text>
  <text x="258" y="174" fill="currentColor" opacity="0.6" font-size="9" text-anchor="middle" font-family="sans-serif">3</text>
  <text x="206" y="174" fill="currentColor" opacity="0.6" font-size="9" text-anchor="middle" font-family="sans-serif">1</text>
  <text x="172" y="112" fill="currentColor" opacity="0.6" font-size="9" text-anchor="end" font-family="sans-serif">2</text>
  <line x1="102" y1="25" x2="102" y2="295" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="4,4"/>
  <line x1="258" y1="25" x2="258" y2="295" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="4,4"/>
  <text x="102" y="18" fill="#a855f7" font-size="10" font-weight="bold" text-anchor="middle" font-family="sans-serif">x = -3</text>
  <text x="258" y="18" fill="#a855f7" font-size="10" font-weight="bold" text-anchor="middle" font-family="sans-serif">x = 3</text>
  <line x1="63" y1="238" x2="297" y2="82" stroke="#3b82f6" stroke-width="1.8"/>
  <text x="290" y="74" fill="#3b82f6" font-size="10.5" font-weight="bold" font-family="sans-serif">T: y = 2/3 x</text>
  <path d="M 106,255 L 110,237 L 115,222 L 123,209 L 133,196 L 144,186 L 154,178 L 164,171 L 172,165 L 180,160 L 188,155 L 196,149 L 206,142 L 216,134 L 227,124 L 237,111 L 245,98 L 250,83 L 254,65" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="240" y="55" fill="#ef4444" font-size="12" font-weight="bold" font-family="sans-serif">(C)</text>
  <circle cx="180" cy="160" r="3" fill="#ef4444"/>
  <circle cx="258" cy="108" r="3" fill="#3b82f6"/>
  <text x="264" y="112" fill="#3b82f6" font-size="9" font-family="sans-serif">(3, 2)</text>
</svg>`,
        },
        {
          id: "g9",
          points: 5,
          q: {
            en: String.raw`3. សិក្សាសញ្ញានៃ $g(x)$ ទៅតាមតម្លៃ $x$`,
            km: String.raw`3. សិក្សាសញ្ញានៃ $g(x)$ ទៅតាមតម្លៃ $x$`,
          },
          options: [
            String.raw`$g(x) > 0$ គ្រប់ $x \in (-3, 3)$ ព្រោះ $g$ ជាអនុគមន៍កើន`,
            String.raw`$g(x) < 0$ ចំពោះ $x \in (0, 3)$ និង $g(x) > 0$ ចំពោះ $x \in (-3, 0)$`,
            String.raw`$g(x) < 0$ ចំពោះ $x \in (-3, 0)$ ; $g(0)=0$ ; $g(x) > 0$ ចំពោះ $x \in (0, 3)$`,
            String.raw`$g(x) \le 0$ គ្រប់ $x \in (-3, 3)$`,
          ],
          correct: String.raw`$g(x) < 0$ ចំពោះ $x \in (-3, 0)$ ; $g(0)=0$ ; $g(x) > 0$ ចំពោះ $x \in (0, 3)$`,
          explanation: String.raw`ដោយ $g(0)=0$ និង $g$ ជាអនុគមន៍កើនដាច់ខាតលើ $(-3, 3)$ (ឬពិនិត្យលើក្រាប $C$)៖

តារាងសញ្ញាសង្ខេបនៃ $g(x)$ ៖

| ចន្លោះ $x$ | $(-3, 0)$ | $0$ | $(0, 3)$ |
| :--- | :---: | :---: | :---: |
| សញ្ញា $g(x)$ | $g(x) < 0$ (អវិជ្ជមាន) | $0$ | $g(x) > 0$ (វិជ្ជមាន) |
| ទីតាំងក្រាប $C$ | នៅក្រោមអ័ក្ស $Ox$ | កាត់គល់ $O$ | នៅខាងលើអ័ក្ស $Ox$ |`,
        },
        {
          id: "g10",
          points: 3,
          q: {
            en: String.raw`4. a. គណនាដេរីវេនៃអនុគមន៍ $h(x) = x g(x)$`,
            km: String.raw`4. a. គណនាដេរីវេនៃអនុគមន៍ $h(x) = x g(x)$`,
          },
          options: [
            String.raw`$h'(x) = g(x) - \dfrac{6x}{9-x^2}$`,
            String.raw`$h'(x) = \ln\left(\dfrac{-x-3}{x-3}\right) + \dfrac{6x}{9-x^2}$`,
            String.raw`$h'(x) = x \cdot \dfrac{6}{9-x^2}$`,
            String.raw`$h'(x) = \ln\left(\dfrac{-x-3}{x-3}\right) + \dfrac{6}{9-x^2}$`,
          ],
          correct: String.raw`$h'(x) = \ln\left(\dfrac{-x-3}{x-3}\right) + \dfrac{6x}{9-x^2}$`,
          explanation: String.raw`ប្រើរូបមន្តដេរីវេផលគុណ $(uv)' = u'v + uv'$ ជាមួយ $u=x$ និង $v=g(x)$៖
$$h'(x) = (x)' \cdot g(x) + x \cdot g'(x) = 1 \cdot g(x) + x \cdot \frac{6}{9-x^2}$$
$$= \ln\left(\frac{-x-3}{x-3}\right) + \frac{6x}{9-x^2} \quad\text{ឬ}\quad \ln\left(\frac{-x-3}{x-3}\right) - \frac{6x}{x^2-9}$$`,
        },
        {
          id: "g11",
          points: 3,
          q: {
            en: String.raw`4. b. គណនាផ្ទៃក្រឡា $S$ នៃផ្នែកប្លង់ខណ្ឌដោយក្រាប $C$, អ័ក្សអាប់ស៊ីស និងបន្ទាត់ $x=0$, $x=1$`,
            km: String.raw`4. b. គណនាផ្ទៃក្រឡា $S$ នៃផ្នែកប្លង់ខណ្ឌដោយក្រាប $C$, អ័ក្សអាប់ស៊ីស និងបន្ទាត់ $x=0$, $x=1$`,
          },
          options: [
            String.raw`$S = 6\ln 2 - 10\ln 3\text{ ឯកតាផ្ទៃ}$`,
            String.raw`$S = 10\ln 3 - 6\ln 2\text{ ឯកតាផ្ទៃ}$`,
            String.raw`$S = 8\ln 2 - 3\ln 3\text{ ឯកតាផ្ទៃ}$`,
            String.raw`$S = 10\ln 2 - 6\ln 3\text{ ឯកតាផ្ទៃ}$`,
          ],
          correct: String.raw`$S = 10\ln 2 - 6\ln 3\text{ ឯកតាផ្ទៃ}$`,
          explanation: String.raw`ចំពោះ $x \in [0, 1]$ គេបាន $g(x) \ge 0$ ដូច្នេះរូបមន្តផ្ទៃក្រឡាគឺ $S = \int_{0}^{1} g(x) dx$។
ពីសំណួរ 4.a៖ $h'(x) = g(x) - \dfrac{6x}{x^2-9} \Rightarrow g(x) = h'(x) + \dfrac{6x}{x^2-9}$
$$S = \int_{0}^{1}\left[h'(x) + \frac{3 \cdot 2x}{x^2-9}\right]dx = \left[h(x) + 3\ln|x^2-9|\right]_{0}^{1}$$
$$= \left[x \ln\left(\frac{-x-3}{x-3}\right) + 3\ln|x^2-9|\right]_{0}^{1}$$
ជំនួស $x=1$៖ $1 \cdot \ln\left(\frac{-4}{-2}\right) + 3\ln|1-9| = \ln 2 + 3\ln 8 = \ln 2 + 3\ln(2^3) = \ln 2 + 9\ln 2 = 10\ln 2$
ជំនួស $x=0$៖ $0 \cdot \ln 1 + 3\ln|-9| = 0 + 3\ln 9 = 3\ln(3^2) = 6\ln 3$
$$S = 10\ln 2 - 6\ln 3\text{ (ឯកតាផ្ទៃ)}$$

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 320" width="100%" height="auto" style="max-width:360px">
  <defs>
    <marker id="arr2" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="currentColor" opacity="0.6"/>
    </marker>
  </defs>
  <!-- Shaded Area S for x in [0, 1] -->
  <polygon points="180,160 188,155 196,149 206,142 206,160" fill="rgba(236,72,153,0.3)" stroke="none"/>
  <text x="194" y="152" fill="#ec4899" font-size="10" font-weight="bold">S</text>
  <line x1="206" y1="142" x2="206" y2="160" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="2,2"/>
  <line x1="24" y1="160" x2="336" y2="160" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.5" marker-end="url(#arr2)"/>
  <line x1="180" y1="300" x2="180" y2="20" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.5" marker-end="url(#arr2)"/>
  <text x="338" y="156" fill="currentColor" font-size="11" font-weight="bold" font-family="sans-serif">x</text>
  <text x="186" y="24" fill="currentColor" font-size="11" font-weight="bold" font-family="sans-serif">y</text>
  <text x="170" y="174" fill="currentColor" opacity="0.7" font-size="10" font-family="sans-serif">O</text>
  <text x="102" y="174" fill="currentColor" opacity="0.6" font-size="9" text-anchor="middle" font-family="sans-serif">-3</text>
  <text x="258" y="174" fill="currentColor" opacity="0.6" font-size="9" text-anchor="middle" font-family="sans-serif">3</text>
  <text x="206" y="174" fill="#ec4899" font-size="9" font-weight="bold" text-anchor="middle" font-family="sans-serif">x=1</text>
  <line x1="102" y1="25" x2="102" y2="295" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="4,4"/>
  <line x1="258" y1="25" x2="258" y2="295" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="4,4"/>
  <text x="102" y="18" fill="#a855f7" font-size="10" font-weight="bold" text-anchor="middle" font-family="sans-serif">x = -3</text>
  <text x="258" y="18" fill="#a855f7" font-size="10" font-weight="bold" text-anchor="middle" font-family="sans-serif">x = 3</text>
  <path d="M 106,255 L 110,237 L 115,222 L 123,209 L 133,196 L 144,186 L 154,178 L 164,171 L 172,165 L 180,160 L 188,155 L 196,149 L 206,142 L 216,134 L 227,124 L 237,111 L 245,98 L 250,83 L 254,65" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="240" y="55" fill="#ef4444" font-size="12" font-weight="bold" font-family="sans-serif">(C)</text>
  <circle cx="180" cy="160" r="3" fill="#ef4444"/>
</svg>`,
        },
      ],
    },
  ],
};
