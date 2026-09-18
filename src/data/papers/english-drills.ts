import type { SkillHelp, SkillId } from "@/types";

/**
 * What a student gets after a WRONG answer: the rule behind the question, and
 * two or three similar exercises to practise it on immediately.
 *
 * THE DRILLS ARE NOT FROM THE PAPER. They are written for BrachNha in the same
 * shape as the questions they follow, so a student who missed "because of" can
 * meet the same decision three more times without needing another exam. Like
 * everything in data/papers/, they are best-effort and unverified — see the
 * header of english-2025.ts.
 *
 * KEYED BY SkillId, and every question in a paper carries one, so the review
 * screen can always find something to offer. Deliberately NO link to a lesson:
 * English has no entries in data/lessons.ts, and pointing at a lesson that does
 * not exist is the mistake the Progress page's geography bar made.
 *
 * The note is the "content to study" half and the questions are the "practise
 * more" half. Both are Khmer, except the English being taught.
 */
export const SKILLS: Record<SkillId, SkillHelp> = {
  quantifiers: {
    label: "some / any / much / many",
    note: [
      "some ប្រើក្នុងប្រយោគបញ្ជាក់ ជាមួយនាមរាប់បានពហុវចនៈ និងនាមរាប់មិនបាន។",
      "any ប្រើក្នុងសំណួរ និងប្រយោគអវិជ្ជមាន។",
      "many + នាមរាប់បាន (many children), much + នាមរាប់មិនបាន (much water)។",
      "a / an មិនអាចនៅមុខនាមពហុវចនៈបានឡើយ។",
    ],
    questions: [
      {
        prompt: "There is ......... milk in the fridge.",
        options: ["many", "some", "a", "few"],
        correct: "some",
        explanation: "milk ជានាមរាប់មិនបាន ក្នុងប្រយោគបញ្ជាក់ → some។",
      },
      {
        prompt: "I don't have ......... money with me today.",
        options: ["some", "many", "any", "a"],
        correct: "any",
        explanation: "ប្រយោគអវិជ្ជមាន (don't have) → any។",
      },
      {
        prompt: "How ......... students passed the exam?",
        options: ["much", "many", "some", "any"],
        correct: "many",
        explanation: "students ជានាមរាប់បានពហុវចនៈ → many។",
      },
    ],
  },

  "past-simple": {
    label: "អតីតកាលសាមញ្ញ (past simple)",
    note: [
      "ពេលរឿងកើតឡើងរួចរាល់នៅអតីតកាល ប្រើទម្រង់ទី 2 របស់កិរិយាស័ព្ទ (broke, went, saw)។",
      "ទម្រង់ទី 3 (broken, gone, seen) ត្រូវការ have/has/had ឬ be នៅមុខ។",
      "ប្រយោគតែមួយត្រូវរក្សាកាលឱ្យស៊ីគ្នា៖ was going → broke។",
    ],
    questions: [
      {
        prompt: "She ......... her phone while she was running.",
        options: ["drop", "drops", "dropped", "dropping"],
        correct: "dropped",
        explanation: "ឃ្លា while she was running ជាអតីតកាល → dropped។",
      },
      {
        prompt: "We wanted to watch the film, but the power ......... off.",
        options: ["go", "goes", "gone", "went"],
        correct: "went",
        explanation: "wanted ជាអតីតកាល ដូច្នេះ go off → went off។",
      },
      {
        prompt: "The window was ......... by the storm last night.",
        options: ["broke", "broken", "breaks", "break"],
        correct: "broken",
        explanation: "មាន was នៅមុខ → ត្រូវការ past participle broken (អកម្ម)។",
      },
    ],
  },

  "future-passive": {
    label: "អនាគតកាលអកម្ម (will be + V3)",
    note: [
      "នៅពេលប្រធានមិនធ្វើសកម្មភាពដោយខ្លួនឯង តែត្រូវគេធ្វើលើវា ប្រើទម្រង់អកម្ម។",
      "អនាគតកាលអកម្ម៖ will be + past participle (will be completed, will be built)។",
      "សាកល្បងសួរខ្លួនឯង៖ «អ្នកណាធ្វើ?» បើប្រធានមិនមែនជាអ្នកធ្វើ នោះជាអកម្ម។",
    ],
    questions: [
      {
        prompt: "The new school ......... next year.",
        options: ["will build", "will be built", "builds", "is building"],
        correct: "will be built",
        explanation: "សាលាមិនសាងសង់ខ្លួនឯង → will be + built។",
      },
      {
        prompt: "The results ......... on Monday morning.",
        options: [
          "will announce",
          "announce",
          "will be announced",
          "are announcing",
        ],
        correct: "will be announced",
        explanation: "គេជាអ្នកប្រកាសលទ្ធផល → អកម្ម will be announced។",
      },
      {
        prompt: "The road ......... before the rainy season starts.",
        options: ["will repair", "will be repaired", "repairs", "repaired"],
        correct: "will be repaired",
        explanation: "ផ្លូវត្រូវបានជួសជុលដោយគេ → will be repaired។",
      },
    ],
  },

  "because-of": {
    label: "because / because of / so",
    note: [
      "because of + នាម ឬឃ្លានាម៖ because of the rain។",
      "because + ប្រយោគពេញ (ប្រធាន + កិរិយា)៖ because it rained។",
      "so ណែនាំលទ្ធផល មិនមែនមូលហេតុ៖ It rained, so we stayed home។",
    ],
    questions: [
      {
        prompt: "The match was cancelled ......... the heavy rain.",
        options: ["because", "because of", "so", "although"],
        correct: "because of",
        explanation: "the heavy rain ជានាម → because of។",
      },
      {
        prompt: "We stayed at home ......... it was raining.",
        options: ["because of", "because", "due to", "so"],
        correct: "because",
        explanation: "it was raining ជាប្រយោគពេញ → because។",
      },
      {
        prompt: "He couldn't sleep ......... the noise from the street.",
        options: ["because", "so", "because of", "since"],
        correct: "because of",
        explanation: "the noise ជានាម → because of។",
      },
    ],
  },

  "conditional-2": {
    label: "លក្ខខណ្ឌទី 2 (unreal present)",
    note: [
      "រចនាសម្ព័ន្ធ៖ If + អតីតកាលសាមញ្ញ, S + would + កិរិយាមូលដ្ឋាន។",
      "និយាយពីរឿងមិនពិត ឬស្រមៃនាពេលបច្ចុប្បន្ន — មិនមែនអតីតកាលពិតទេ។",
      "ជាមួយ be គេច្រើនប្រើ were គ្រប់បុរស៖ If I were you…។",
    ],
    questions: [
      {
        prompt: "If I had more time, I ......... English every day.",
        options: ["will study", "would study", "studied", "study"],
        correct: "would study",
        explanation: "If + had (អតីតកាល) → would + study។",
      },
      {
        prompt: "If she ......... nearer, she would visit us more often.",
        options: ["lives", "will live", "lived", "would live"],
        correct: "lived",
        explanation: "ផ្នែក if ប្រើអតីតកាលសាមញ្ញ → lived។",
      },
      {
        prompt: "We would travel more if tickets ......... so expensive.",
        options: ["aren't", "weren't", "won't be", "wouldn't be"],
        correct: "weren't",
        explanation: "ផ្នែក if នៃលក្ខខណ្ឌទី 2 ប្រើ were/weren't។",
      },
    ],
  },

  collocation: {
    label: "ពាក្យផ្គូផ្គងថេរ (collocations)",
    note: [
      "ភាសាអង់គ្លេសមានពាក្យដែលតែងតែទៅជាមួយគ្នា — ត្រូវចាំទាំងឃ្លា មិនមែនម្តងមួយពាក្យ។",
      "ឧទាហរណ៍៖ make friends, get to know, have something in common, best friend, weather forecast, in writing។",
      "ពេលឃើញចន្លោះនៅក្នុងឃ្លាថេរ សូមសួរថា «ឃ្លានេះខ្ញុំធ្លាប់ឃើញទាំងមូលដែរឬទេ?»",
    ],
    questions: [
      {
        prompt: "She soon ......... friends with her new classmates.",
        options: ["did", "made", "took", "got"],
        correct: "made",
        explanation: "make friends (with somebody) = ចងមិត្ត។",
      },
      {
        prompt: "My sister and I have a lot ......... common.",
        options: ["on", "with", "in", "at"],
        correct: "in",
        explanation: "have something in common = មានចំណុចរួម។",
      },
      {
        prompt: "According to the weather ........., it will be hot tomorrow.",
        options: ["report card", "forecast", "notice", "prediction"],
        correct: "forecast",
        explanation: "weather forecast ជាឃ្លាផ្គូផ្គងថេរ។",
      },
    ],
  },

  "word-choice": {
    label: "ជ្រើសពាក្យតាមអត្ថន័យ",
    note: [
      "ពាក្យបួនក្នុងជម្រើសច្រើនតែជិតគ្នា — សម្រេចដោយអត្ថន័យ និងធ្នាក់ដែលវាទាមទារ។",
      "ពិនិត្យអ្វីដែលនៅពីក្រោយពាក្យ៖ agree with, approve of, believe in, តែ support + នាមផ្ទាល់។",
      "ពិនិត្យអ្នកធ្វើសកម្មភាព៖ គេ charge មនុស្ស តែរបស់ costs លុយ។",
    ],
    questions: [
      {
        prompt: "The hotel ......... us $30 for one night.",
        options: ["cost", "charged", "paid", "spent"],
        correct: "charged",
        explanation: "charge somebody for something = គិតថ្លៃពីមនុស្ស។",
      },
      {
        prompt: "Most parents ......... the new school rules.",
        options: ["agree", "support", "approve", "believe"],
        correct: "support",
        explanation: "support + នាមផ្ទាល់; ពាក្យផ្សេងត្រូវការធ្នាក់។",
      },
      {
        prompt: "He wrote a ......... about the noisy room to the manager.",
        options: ["complaint", "information", "advice", "news"],
        correct: "complaint",
        explanation: "write a complaint = សរសេរពាក្យតវ៉ា; ពាក្យផ្សេងជានាមរាប់មិនបាន។",
      },
    ],
  },

  "gap-context": {
    label: "អានបរិបទដើម្បីបំពេញចន្លោះ",
    note: [
      "មើលពាក្យនៅមុខ និងក្រោយចន្លោះមុននឹងជ្រើស៖ បន្ទាប់ពី to ត្រូវការកិរិយាមូលដ្ឋាន បន្ទាប់ពីគុណនាមត្រូវការនាម។",
      "រកសញ្ញាពហុវចនៈ (lots of, many) ដើម្បីដឹងថាត្រូវប្រើនាមឯកវចនៈ ឬពហុវចនៈ។",
      "អានប្រយោគបន្ទាប់ផង — ជារឿយៗវាផ្ទុកពាក្យផ្ទុយ ឬពាក្យដដែលដែលបញ្ជាក់ចម្លើយ។",
      "បំពេញចន្លោះងាយៗសិន រួចពាក្យដែលនៅសល់នឹងជួយបំពេញចន្លោះពិបាក។",
    ],
    questions: [
      {
        prompt: "It was a good way to ......... new people.",
        options: ["met", "meeting", "meet", "meets"],
        correct: "meet",
        explanation: "បន្ទាប់ពី to ត្រូវការកិរិយាមូលដ្ឋាន → meet។",
      },
      {
        prompt: "There were lots of married ......... in the class.",
        options: ["couple", "couples", "coupling", "coupled"],
        correct: "couples",
        explanation: "lots of ទាមទារនាមពហុវចនៈ → couples។",
      },
      {
        prompt: "I never expected to ......... a professional singer.",
        options: ["became", "becoming", "becomes", "become"],
        correct: "become",
        explanation: "expect to + កិរិយាមូលដ្ឋាន → become។",
      },
    ],
  },
};
