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
 * What that means for every entry below:
 *
 *  - **The question text is the paper's.** Same prompt, same notation. Only the
 *    answering changed, and the detail screen says so in as many words.
 *  - **THE OPTIONS ARE OURS.** The correct answer is the paper's, checked
 *    against the supplied answer key; the three wrong ones are written here, as
 *    the results the working actually produces when it goes wrong — a dropped
 *    sign, a forgotten conjugate, arg(z₁/z₂) added instead of subtracted. A
 *    distractor must never be a second correct answer: check the arithmetic
 *    before adding one.
 *  - **The solutions are OURS TOO, written for BrachNha.** The answer key that
 *    came with the paper is ក្រូ សុខ ពិសិដ្ឋ / STEAM Tuition Center's work,
 *    watermarked on every page. Every answer below was worked out here and then
 *    checked against theirs; none of their wording is reproduced. Don't paste
 *    their solutions in — that would need their permission and a credit line.
 *
 * ⚠ PARTS I TO III ONLY (40 of the paper's 125 points). IV to VII are not
 * transcribed yet; `note` says so on the detail screen, so the parts list does
 * not read as the whole exam. Question VII also needs a graph, which will be
 * DRAWN by the app rather than cropped out of the answer key's photo.
 *
 * ⚠ TRANSCRIBED FROM PHOTOGRAPHS and UNVERIFIED, exactly like the English paper
 * and the first practice deck. **The Khmer word for the balls in part II
 * (កូនប្ញើ) is the least certain thing here** — it is a term read off a
 * photograph, and the biology deck already proved how a plausible-looking
 * misreading survives. A correction is a plain edit in this file.
 *
 * KHMER NEVER GOES INSIDE `$…$`. KaTeX substitutes its own fonts, which have no
 * Khmer glyphs, so Khmer between dollars renders as empty boxes — `splitMath`
 * in utils/math-render.ts refuses such a span outright. Khmer prose sits
 * outside the delimiters, always.
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
      instruction:
        "គណនាលីមីតខាងក្រោម។ សូមគណនាលើក្រដាសជាមុនសិន រួចជ្រើសរើសចម្លើយ។",
      questions: [
        {
          id: "l1",
          points: 3,
          q: {
            en: String.raw`គណនា $\lim_{x \to 1}\left(\sqrt{x^{2}-1}+3x\right)$`,
            km: String.raw`គណនា $\lim_{x \to 1}\left(\sqrt{x^{2}-1}+3x\right)$`,
          },
          options: [String.raw`$0$`, String.raw`$3$`, String.raw`$4$`, "គ្មានលីមីត"],
          correct: String.raw`$3$`,
          explanation: String.raw`អនុគមន៍នេះជាប់នៅ $x = 1$ ដូច្នេះជំនួសតម្លៃដោយផ្ទាល់បាន៖
$$\sqrt{1^{2}-1}+3(1)=\sqrt{0}+3=3$$
មិនមានរាងមិនកំណត់ទេ ព្រោះភាគបែងគ្មាន។`,
        },
        {
          id: "l2",
          points: 4,
          q: {
            en: String.raw`គណនា $\lim_{x \to 0}\dfrac{e^{4x}-1}{e^{x}-1}$`,
            km: String.raw`គណនា $\lim_{x \to 0}\dfrac{e^{4x}-1}{e^{x}-1}$`,
          },
          options: [
            String.raw`$0$`,
            String.raw`$1$`,
            String.raw`$4$`,
            String.raw`$\frac{1}{4}$`,
          ],
          correct: String.raw`$4$`,
          explanation: String.raw`រាងមិនកំណត់ $\frac{0}{0}$។ ប្រើរូបមន្តគោល $\lim_{u \to 0}\dfrac{e^{u}-1}{u}=1$។
ចែកភាគយកនិងភាគបែងរៀងគ្នាដោយ $4x$ និង $x$៖
$$\frac{e^{4x}-1}{e^{x}-1}=\frac{\dfrac{e^{4x}-1}{4x}\cdot 4x}{\dfrac{e^{x}-1}{x}\cdot x}=\frac{\dfrac{e^{4x}-1}{4x}}{\dfrac{e^{x}-1}{x}}\cdot 4$$
ពេល $x \to 0$ ប្រភាគទាំងពីរខាងលើទៅជា $1$ ដូច្នេះលីមីតស្មើ $1 \times 4 = 4$។`,
        },
        {
          id: "l3",
          points: 4,
          q: {
            en: String.raw`គណនា $\lim_{x \to 2}\dfrac{2-\sqrt{x+2}}{x^{3}-8}$`,
            km: String.raw`គណនា $\lim_{x \to 2}\dfrac{2-\sqrt{x+2}}{x^{3}-8}$`,
          },
          options: [
            String.raw`$-\frac{1}{48}$`,
            String.raw`$\frac{1}{48}$`,
            String.raw`$-\frac{1}{24}$`,
            String.raw`$-\frac{1}{12}$`,
          ],
          correct: String.raw`$-\frac{1}{48}$`,
          explanation: String.raw`រាងមិនកំណត់ $\frac{0}{0}$។ គុណភាគយកនិងភាគបែងដោយផ្សំរបស់ភាគយក $\left(2+\sqrt{x+2}\right)$៖
$$\frac{2-\sqrt{x+2}}{x^{3}-8}=\frac{4-(x+2)}{(x^{3}-8)\left(2+\sqrt{x+2}\right)}=\frac{2-x}{(x-2)(x^{2}+2x+4)\left(2+\sqrt{x+2}\right)}$$
$2-x=-(x-2)$ ដូច្នេះកាត់ $(x-2)$ ចេញបាន៖
$$\frac{-1}{(x^{2}+2x+4)\left(2+\sqrt{x+2}\right)} \to \frac{-1}{(4+4+4)(2+2)}=-\frac{1}{48}$$
សញ្ញាអវិជ្ជមានមកពី $2-x=-(x-2)$ — បើភ្លេច នឹងបាន $\frac{1}{48}$។`,
        },
        {
          id: "l4",
          points: 4,
          q: {
            en: String.raw`គណនា $\lim_{x \to \frac{\pi}{3}}\dfrac{x-\frac{\pi}{3}}{\sin x-\sqrt{3}\cos x}$`,
            km: String.raw`គណនា $\lim_{x \to \frac{\pi}{3}}\dfrac{x-\frac{\pi}{3}}{\sin x-\sqrt{3}\cos x}$`,
          },
          options: [
            String.raw`$\frac{1}{2}$`,
            String.raw`$1$`,
            String.raw`$2$`,
            String.raw`$\frac{\sqrt{3}}{2}$`,
          ],
          correct: String.raw`$\frac{1}{2}$`,
          explanation: String.raw`រាងមិនកំណត់ $\frac{0}{0}$។ ដកចេញ $2$ ពីភាគបែង រួចប្រើ $\sin A\cos B-\cos A\sin B=\sin(A-B)$៖
$$\sin x-\sqrt{3}\cos x=2\left(\tfrac{1}{2}\sin x-\tfrac{\sqrt{3}}{2}\cos x\right)=2\left(\sin x\cos\tfrac{\pi}{3}-\cos x\sin\tfrac{\pi}{3}\right)=2\sin\left(x-\tfrac{\pi}{3}\right)$$
តាង $X=x-\dfrac{\pi}{3}$ ដូច្នេះ $X \to 0$ ហើយ៖
$$\lim_{X \to 0}\frac{X}{2\sin X}=\frac{1}{2}\lim_{X \to 0}\frac{X}{\sin X}=\frac{1}{2}$$`,
        },
      ],
    },

    {
      id: "probability",
      title: "II. ប្រូបាប",
      instruction:
        "ក្នុងប្រអប់មួយមានកូនប្ញើសរុប 4n ដែលក្នុងនោះ (2n+1) មានពណ៌លឿង និង (2n-1) មានពណ៌បៃតង។ គេចាប់យកកូនប្ញើពីរព្រមគ្នាដោយចៃដន្យ។ ក្នុងសំណួរនេះយកតម្លៃ n = 10។",
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
ការចាប់ពីរព្រមគ្នាមិនគិតលំដាប់ ដូច្នេះជាបន្សំ៖
$$n(S)=C(40,2)=\frac{40 \times 39}{2}=780$$
បើគិតលំដាប់ (រៀបចំ) នឹងបាន $1560$ ដែលច្រើនជាងការពិតពីរដង។`,
        },
        {
          id: "p2",
          points: 2,
          q: {
            en: String.raw`$P(A)$ ៖ កូនប្ញើទាំងពីរមានពណ៌ខុសគ្នា`,
            km: String.raw`$P(A)$ ៖ កូនប្ញើទាំងពីរមានពណ៌ខុសគ្នា`,
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
$$P(A)=\frac{399}{780}=\frac{133}{260}$$`,
        },
        {
          id: "p3",
          points: 2,
          q: {
            en: String.raw`$P(B)$ ៖ កូនប្ញើទាំងពីរមានពណ៌បៃតង`,
            km: String.raw`$P(B)$ ៖ កូនប្ញើទាំងពីរមានពណ៌បៃតង`,
          },
          options: [
            String.raw`$\frac{57}{260}$`,
            String.raw`$\frac{7}{26}$`,
            String.raw`$\frac{133}{260}$`,
            String.raw`$\frac{19}{40}$`,
          ],
          correct: String.raw`$\frac{57}{260}$`,
          explanation: String.raw`ជ្រើសពីរក្នុងចំណោមបៃតង $19$៖
$$n(B)=C(19,2)=\frac{19 \times 18}{2}=171 \quad\Rightarrow\quad P(B)=\frac{171}{780}=\frac{57}{260}$$
$\frac{7}{26}$ គឺជាប្រូបាបដែលទាំងពីរមានពណ៌លឿង ($C(21,2)=210$)។`,
        },
        {
          id: "p4",
          points: 2,
          q: {
            en: String.raw`$P(C)$ ៖ កូនប្ញើទាំងពីរមានពណ៌ដូចគ្នា`,
            km: String.raw`$P(C)$ ៖ កូនប្ញើទាំងពីរមានពណ៌ដូចគ្នា`,
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
ឬគណនាផ្ទាល់៖ $C(21,2)+C(19,2)=210+171=381$ និង $\dfrac{381}{780}=\dfrac{127}{260}$។`,
        },
      ],
    },

    {
      id: "complex",
      title: "III. ចំនួនកុំផ្លិច",
      instruction:
        "គេឱ្យ z₁ = √3 − i , z₂ = 2(1 − i) និង Z = z₁⁷ / z₂⁶។ រកម៉ូឌុល អាគុយម៉ង់ ទម្រង់ត្រីកោណមាត្រ និងទម្រង់ពីជគណិត។",
      questions: [
        {
          id: "c1",
          points: 2,
          q: {
            en: String.raw`ម៉ូឌុល និងអាគុយម៉ង់នៃ $z_{1}=\sqrt{3}-i$`,
            km: String.raw`ម៉ូឌុល និងអាគុយម៉ង់នៃ $z_{1}=\sqrt{3}-i$`,
          },
          options: [
            String.raw`$|z_{1}|=2$ , $\arg z_{1}=-\frac{\pi}{6}$`,
            String.raw`$|z_{1}|=2$ , $\arg z_{1}=\frac{\pi}{6}$`,
            String.raw`$|z_{1}|=4$ , $\arg z_{1}=-\frac{\pi}{6}$`,
            String.raw`$|z_{1}|=\sqrt{2}$ , $\arg z_{1}=-\frac{\pi}{3}$`,
          ],
          correct: String.raw`$|z_{1}|=2$ , $\arg z_{1}=-\frac{\pi}{6}$`,
          explanation: String.raw`$$|z_{1}|=\sqrt{\left(\sqrt{3}\right)^{2}+(-1)^{2}}=\sqrt{4}=2$$
$$\cos\alpha_{1}=\frac{\sqrt{3}}{2} \quad,\quad \sin\alpha_{1}=-\frac{1}{2} \quad\Rightarrow\quad \alpha_{1}=-\frac{\pi}{6}$$
ផ្នែកពិតវិជ្ជមាន ផ្នែកនិមិត្តអវិជ្ជមាន ដូច្នេះចំណុចនៅត្រីមាសទី 4 ហើយអាគុយម៉ង់ត្រូវតែអវិជ្ជមាន។`,
        },
        {
          id: "c2",
          points: 2,
          q: {
            en: String.raw`ទម្រង់ត្រីកោណមាត្រនៃ $z_{1}$`,
            km: String.raw`ទម្រង់ត្រីកោណមាត្រនៃ $z_{1}$`,
          },
          options: [
            String.raw`$2\left(\cos\left(-\frac{\pi}{6}\right)+i\sin\left(-\frac{\pi}{6}\right)\right)$`,
            String.raw`$2\left(\cos\frac{\pi}{6}+i\sin\frac{\pi}{6}\right)$`,
            String.raw`$4\left(\cos\left(-\frac{\pi}{6}\right)+i\sin\left(-\frac{\pi}{6}\right)\right)$`,
            String.raw`$2\left(\sin\left(-\frac{\pi}{6}\right)+i\cos\left(-\frac{\pi}{6}\right)\right)$`,
          ],
          correct: String.raw`$2\left(\cos\left(-\frac{\pi}{6}\right)+i\sin\left(-\frac{\pi}{6}\right)\right)$`,
          explanation: String.raw`ទម្រង់ត្រីកោណមាត្រគឺ $z=r(\cos\alpha+i\sin\alpha)$ ដោយ $r=|z|$។
ជាមួយ $r=2$ និង $\alpha=-\dfrac{\pi}{6}$៖
$$z_{1}=2\left(\cos\left(-\frac{\pi}{6}\right)+i\sin\left(-\frac{\pi}{6}\right)\right)$$
$\cos$ តែងតែនៅផ្នែកពិត និង $\sin$ នៅផ្នែកនិមិត្ត — កុំដូរកន្លែងគ្នា។`,
        },
        {
          id: "c3",
          points: 2,
          q: {
            en: String.raw`ម៉ូឌុល និងអាគុយម៉ង់នៃ $z_{2}=2(1-i)$`,
            km: String.raw`ម៉ូឌុល និងអាគុយម៉ង់នៃ $z_{2}=2(1-i)$`,
          },
          options: [
            String.raw`$|z_{2}|=2\sqrt{2}$ , $\arg z_{2}=-\frac{\pi}{4}$`,
            String.raw`$|z_{2}|=2$ , $\arg z_{2}=-\frac{\pi}{4}$`,
            String.raw`$|z_{2}|=2\sqrt{2}$ , $\arg z_{2}=\frac{\pi}{4}$`,
            String.raw`$|z_{2}|=4$ , $\arg z_{2}=-\frac{\pi}{4}$`,
          ],
          correct: String.raw`$|z_{2}|=2\sqrt{2}$ , $\arg z_{2}=-\frac{\pi}{4}$`,
          explanation: String.raw`$z_{2}=2-2i$ ដូច្នេះ៖
$$|z_{2}|=\sqrt{2^{2}+(-2)^{2}}=\sqrt{8}=2\sqrt{2}$$
$$\cos\alpha_{2}=\frac{2}{2\sqrt{2}}=\frac{\sqrt{2}}{2} \quad,\quad \sin\alpha_{2}=-\frac{\sqrt{2}}{2} \quad\Rightarrow\quad \alpha_{2}=-\frac{\pi}{4}$$
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
            String.raw`$2\sqrt{2}\left(\cos\left(-\frac{\pi}{4}\right)+i\sin\left(-\frac{\pi}{4}\right)\right)$`,
            String.raw`$2\sqrt{2}\left(\cos\frac{\pi}{4}+i\sin\frac{\pi}{4}\right)$`,
            String.raw`$2\left(\cos\left(-\frac{\pi}{4}\right)+i\sin\left(-\frac{\pi}{4}\right)\right)$`,
            String.raw`$\sqrt{2}\left(\cos\left(-\frac{\pi}{4}\right)+i\sin\left(-\frac{\pi}{4}\right)\right)$`,
          ],
          correct: String.raw`$2\sqrt{2}\left(\cos\left(-\frac{\pi}{4}\right)+i\sin\left(-\frac{\pi}{4}\right)\right)$`,
          explanation: String.raw`ជាមួយ $r=2\sqrt{2}$ និង $\alpha=-\dfrac{\pi}{4}$៖
$$z_{2}=2\sqrt{2}\left(\cos\left(-\frac{\pi}{4}\right)+i\sin\left(-\frac{\pi}{4}\right)\right)$$`,
        },
        {
          id: "c5",
          points: 1,
          q: {
            en: String.raw`ម៉ូឌុលនៃ $Z=\dfrac{z_{1}^{7}}{z_{2}^{6}}$`,
            km: String.raw`ម៉ូឌុលនៃ $Z=\dfrac{z_{1}^{7}}{z_{2}^{6}}$`,
          },
          options: [
            String.raw`$\frac{1}{4}$`,
            String.raw`$4$`,
            String.raw`$\frac{1}{2}$`,
            String.raw`$\frac{1}{8}$`,
          ],
          correct: String.raw`$\frac{1}{4}$`,
          explanation: String.raw`ម៉ូឌុលនៃផលចែកគឺផលចែកនៃម៉ូឌុល ហើយស្វ័យគុណឡើងតាមស្វ័យគុណ៖
$$|Z|=\frac{|z_{1}|^{7}}{|z_{2}|^{6}}=\frac{2^{7}}{\left(2\sqrt{2}\right)^{6}}=\frac{128}{2^{6} \times \left(\sqrt{2}\right)^{6}}=\frac{128}{64 \times 8}=\frac{1}{4}$$`,
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
          explanation: String.raw`អាគុយម៉ង់នៃផលចែកគឺជាការដក មិនមែនការបូកទេ៖
$$\arg Z=7\arg z_{1}-6\arg z_{2}=7\left(-\frac{\pi}{6}\right)-6\left(-\frac{\pi}{4}\right)=-\frac{7\pi}{6}+\frac{3\pi}{2}$$
$$=\frac{-7\pi+9\pi}{6}=\frac{2\pi}{6}=\frac{\pi}{3}$$
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
          explanation: String.raw`ផ្គុំម៉ូឌុល $\dfrac{1}{4}$ ជាមួយអាគុយម៉ង់ $\dfrac{\pi}{3}$៖
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
