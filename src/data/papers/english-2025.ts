import type { PastPaperContent } from "@/types";

/**
 * MoEYS Bac II — ENGLISH, session 28 សីហា 2025. 50 points, 60 minutes.
 *
 * ⚠ TRANSCRIBED FROM PHOTOGRAPHS OF THE PRINTED PAPER, and every Khmer
 * explanation below is WRITTEN FOR BRACHNHA rather than taken from the paper.
 * Both are best-effort and have NOT been checked by a teacher — the same
 * warning data/practice.ts carries, for the same reason: fixing a misread word
 * or a weak explanation is a plain edit in this file and nothing else in the app
 * has to change, but nobody should assume someone has already looked.
 *
 * TWO DELIBERATE DEPARTURES FROM THE PRINTED PAPER, both agreed with the user:
 *
 *  1. Grammar 5. The printed answer key says `a- would buy`, but "would buy" is
 *     option **d** on the question page (`a- may buy`). The WORD is right and the
 *     LETTER is wrong, so the key's letter is not reproduced; "would buy" is
 *     marked correct, which is also what the second conditional requires.
 *  2. Vocabulary 3 is printed "The restaurant service **are** bad" and reads
 *     "is" here. An English exam must not teach a subject-verb agreement error.
 *     (Vocabulary 4's mid-sentence "The idea" is lower-cased for the same
 *     reason; the phrase "clean and green city" is left exactly as printed.)
 *
 * Nothing else is edited. If a third correction is ever needed, add it to this
 * list — the value of the list is that it is exhaustive.
 *
 * The PARTS carry the paper's own numbering (I, II, III, IV). Part I's example
 * gap is gap 1, printed already filled, so ten gaps are answerable and the word
 * bank still shows all eleven words.
 *
 * MARKS ARE NOT MODELLED. The paper is worth 50 points but the pages supplied do
 * not print the per-part split, so the app scores the 20 objective questions and
 * says so, rather than inventing a conversion to 50.
 */
export const ENGLISH_2025: PastPaperContent = {
  minutes: 60,
  points: 50,

  sections: [
    {
      id: "reading",
      title: "I. Reading",
      instruction:
        "Read the text and fill the gaps with the words in the box. Gap one has been done as an example.",
      gapFill: {
        title: "New friends",
        // {n} marks where gap n goes. Authored as one string so the passage
        // stays proofreadable against the photograph; paper-gap-fill.tsx splits
        // it. Paragraph breaks are real \n\n.
        body: `My family recently moved to a new town and it was the beginning of the summer holidays. My {1} were both busy at work and I didn't know anyone. So I decided to join some dancing classes as I thought it might be a way to {2} people. But when I got there I nearly went home again as there seemed to be lots of married {3}. Then I realised that was the class for {4} dances and I wanted to learn modern dance. When I found the correct room, some people came to talk to me and I soon {5} friends.

After a few days I realised that I wasn't very good at dancing. But then I never expected to {6} a brilliant dancer. All I wanted was to {7} to know some people. I found out one girl was a {8} who lived in the next flat to ours and we had lots of things {9} common. She is now my {10} friend. We see {11} other every day. We get on well together and we never fall out. And one of my friends is now married to someone she met at that class.`,
        // The order the printed box uses, read row by row.
        wordBank: [
          "parents",
          "best",
          "each",
          "traditional",
          "couples",
          "in",
          "made",
          "meet",
          "neighbour",
          "get",
          "become",
        ],
        gaps: [
          {
            id: "r1",
            number: 1,
            correct: "parents",
            example: true,
            skill: "gap-context",
            explanation: "ចន្លោះគំរូដែលវិញ្ញាសាបំពេញឱ្យស្រាប់។",
          },
          {
            id: "r2",
            number: 2,
            correct: "meet",
            skill: "gap-context",
            explanation:
              "a way to + កិរិយាស័ព្ទមូលដ្ឋាន (infinitive) → a way to meet people = មធ្យោបាយជួបមនុស្ស។",
          },
          {
            id: "r3",
            number: 3,
            correct: "couples",
            skill: "gap-context",
            explanation:
              "បន្ទាប់ពីគុណនាម married ត្រូវការនាម ហើយ lots of ទាមទារពហុវចនៈ → married couples = គូស្វាមីភរិយា។",
          },
          {
            id: "r4",
            number: 4,
            correct: "traditional",
            skill: "word-choice",
            explanation:
              "ត្រូវការគុណនាមពីមុខនាម dances ហើយអត្ថន័យផ្ទុយនឹង modern dance នៅឃ្លាបន្ទាប់ → traditional dances។",
          },
          {
            id: "r5",
            number: 5,
            correct: "made",
            skill: "collocation",
            explanation:
              "make friends = ចងមិត្ត។ រឿងនិទានជាអតីតកាល ដូច្នេះ make → made។",
          },
          {
            id: "r6",
            number: 6,
            correct: "become",
            skill: "gap-context",
            explanation:
              "expect to + កិរិយាស័ព្ទមូលដ្ឋាន → I never expected to become a brilliant dancer។",
          },
          {
            id: "r7",
            number: 7,
            correct: "get",
            skill: "collocation",
            explanation:
              "get to know somebody = ចាប់ផ្តើមស្គាល់គេ។ ឃ្លាថេរដែលត្រូវចាំទាំងមូល។",
          },
          {
            id: "r8",
            number: 8,
            correct: "neighbour",
            skill: "word-choice",
            explanation:
              "អ្នកដែលរស់នៅ next flat to ours គឺ neighbour = អ្នកជិតខាង។",
          },
          {
            id: "r9",
            number: 9,
            correct: "in",
            skill: "collocation",
            explanation:
              "have something in common = មានចំណុចរួមដូចគ្នា។ ធ្នាក់ត្រឹមត្រូវគឺ in មិនមែន with ទេ។",
          },
          {
            id: "r10",
            number: 10,
            correct: "best",
            skill: "collocation",
            explanation: "best friend = មិត្តល្អបំផុត។ ពាក្យផ្គូផ្គងធម្មតាបំផុត។",
          },
          {
            id: "r11",
            number: 11,
            correct: "each",
            skill: "collocation",
            explanation:
              "see each other = ជួបគ្នាទៅវិញទៅមក។ each other ជាសព្វនាមអន្យោន្យ។",
          },
        ],
      },
    },

    {
      id: "grammar",
      title: "II. Grammar",
      instruction:
        "There are four answers after each statement. Only one answer is correct. Choose the correct letter a, b, c, or d.",
      example: "I can't go out; I'm ....making.... dinner.  (a- making)",
      questions: [
        {
          id: "g1",
          q: {
            en: "We saw ......... children in the park.",
            km: "We saw ......... children in the park.",
          },
          options: ["any", "some", "a", "much"],
          correct: "some",
          skill: "quantifiers",
          explanation:
            "ប្រយោគបញ្ជាក់ (affirmative) ជាមួយនាមរាប់បានពហុវចនៈ ប្រើ some។ any ប្រើក្នុងសំណួរ ឬអវិជ្ជមាន, much សម្រាប់នាមរាប់មិនបាន, ហើយ a មិនអាចនៅមុខពហុវចនៈ។",
        },
        {
          id: "g2",
          q: {
            en: "I was going to do the washing, but the machine ............ down.",
            km: "I was going to do the washing, but the machine ............ down.",
          },
          options: ["broken", "break", "breaks", "broke"],
          correct: "broke",
          skill: "past-simple",
          explanation:
            "ឃ្លាដំបូងជាអតីតកាល (I was going to…) ដូច្នេះត្រូវប្រើអតីតកាលសាមញ្ញ break down → broke down។ broken ជា past participle ត្រូវការ was/has នៅមុខ។",
        },
        {
          id: "g3",
          q: {
            en: "The new bridge ......... before the end of next month.",
            km: "The new bridge ......... before the end of next month.",
          },
          options: [
            "will be completed",
            "is completed",
            "completes",
            "will complete",
          ],
          correct: "will be completed",
          skill: "future-passive",
          explanation:
            "ស្ពានមិនសាងសង់ខ្លួនឯងទេ — គេសាងសង់វា។ អនាគតកាលអកម្ម: will be + past participle → will be completed។",
        },
        {
          id: "g4",
          q: {
            en: "Several trees fell down last night ...... the strong wind.",
            km: "Several trees fell down last night ...... the strong wind.",
          },
          options: ["because", "so", "because of", "since"],
          correct: "because of",
          skill: "because-of",
          explanation:
            "because of + នាម (the strong wind)។ because និង since ត្រូវការប្រយោគពេញ (ប្រធាន + កិរិយា) នៅពីក្រោយ។",
        },
        {
          id: "g5",
          q: {
            en: "If souvenirs weren't so expensive, I ......... many more.",
            km: "If souvenirs weren't so expensive, I ......... many more.",
          },
          options: ["may buy", "will buy", "bought", "would buy"],
          correct: "would buy",
          skill: "conditional-2",
          explanation:
            "លក្ខខណ្ឌទី 2 (រឿងមិនពិតនាពេលបច្ចុប្បន្ន): If + អតីតកាលសាមញ្ញ, S + would + កិរិយាមូលដ្ឋាន → weren't … would buy។",
        },
      ],
    },

    {
      id: "vocabulary",
      title: "III. Vocabulary",
      instruction:
        "There are four answers after each statement. Only one answer is correct. Choose the correct letter a, b, c, or d.",
      example:
        "At ...harvest... time there is always plenty of work to do on a farm.  (d- harvest)",
      questions: [
        {
          id: "v1",
          q: {
            en: "According to the weather ......... there will be rain tomorrow.",
            km: "According to the weather ......... there will be rain tomorrow.",
          },
          options: ["programme", "survey", "forecast", "information"],
          correct: "forecast",
          skill: "collocation",
          explanation:
            "weather forecast = ការព្យាករណ៍អាកាសធាតុ។ ជាពាក្យផ្គូផ្គងថេរ — គេមិននិយាយ weather survey ឬ weather programme ក្នុងន័យនេះទេ។",
        },
        {
          id: "v2",
          q: {
            en: "How much do they ...... for cleaning your room?",
            km: "How much do they ...... for cleaning your room?",
          },
          options: ["cost", "need", "demand", "charge"],
          correct: "charge",
          skill: "word-choice",
          explanation:
            "charge (somebody) for something = គិតថ្លៃលើសេវា។ cost មានរបស់ជាប្រធាន (The room costs $20) មិនមែនមនុស្សទេ។",
        },
        {
          id: "v3",
          q: {
            en: "The restaurant service is bad, so we should write a ...... to the manager.",
            km: "The restaurant service is bad, so we should write a ...... to the manager.",
          },
          options: ["complaint", "information", "message", "essay"],
          correct: "complaint",
          skill: "word-choice",
          explanation:
            "write a complaint = សរសេរពាក្យតវ៉ា/បណ្តឹង ទៅអ្នកគ្រប់គ្រង។ information ជានាមរាប់មិនបាន ដូច្នេះ a information ខុសវេយ្យាករណ៍។",
        },
        {
          id: "v4",
          q: {
            en: "Most people in the town ....... the idea of clean and green city.",
            km: "Most people in the town ....... the idea of clean and green city.",
          },
          options: ["support", "agree", "believe", "approve"],
          correct: "support",
          skill: "word-choice",
          explanation:
            "support + នាម ដោយផ្ទាល់ = គាំទ្រ។ agree ត្រូវការ with, approve ត្រូវការ of, ហើយ believe in — មានតែ support ទេដែលអាចភ្ជាប់នាមផ្ទាល់។",
        },
        {
          id: "v5",
          q: {
            en: "Please confirm your reservation in ......",
            km: "Please confirm your reservation in ......",
          },
          options: ["writing", "words", "letter", "paper"],
          correct: "writing",
          skill: "collocation",
          explanation:
            "in writing = ជាលាយលក្ខណ៍អក្សរ។ ឃ្លាថេរ — ប្រើនៅពេលបញ្ជាក់ផ្លូវការ។",
        },
      ],
    },
  ],

  writing: {
    title: "IV. Writing",
    prompt: 'Write an essay: "The importance of English Language." At least 80 words.',
    minWords: 80,
    // WRITTEN FOR BRACHNHA — deliberately not the sample printed on the paper,
    // which the user asked not to copy and which carries several grammar
    // mistakes of its own.
    modelEssay: [
      "English is one of the most important languages in the world today, and learning it changes what a student is able to do.",
      "First, English opens the door to knowledge. Most books, websites and videos about science, technology and medicine are written in English, so a student who reads English can study almost anything without waiting for a translation.",
      "Second, English creates opportunities at work. In Cambodia, hotels, banks, NGOs and tourism companies all look for staff who can speak with foreign customers, and those jobs are usually better paid.",
      "Finally, English connects people. It is the language travellers, students and businesses from different countries use to understand each other.",
      "For these reasons, English is not only a school subject. It is a skill that helps young Cambodians learn more, work better and meet the world with confidence.",
    ],
    checklist: [
      "សរសេរបានយ៉ាងតិច 80 ពាក្យ",
      "មានសេចក្ដីផ្ដើម ខ្លឹមសារ និងសេចក្ដីសន្និដ្ឋាន",
      "លើកហេតុផលយ៉ាងតិច 2 ព្រមទាំងឧទាហរណ៍",
      "ប្រើពាក្យតភ្ជាប់ (First, Second, Finally, For these reasons)",
      "ពិនិត្យកាល កិរិយាស័ព្ទ និងពហុវចនៈឡើងវិញ",
    ],
  },
};
