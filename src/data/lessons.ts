import type { Lesson, Flashcard, PracticeQuestion } from "../types/index.js";

export const LESSONS: Record<string, Record<string, Lesson>> = {
  math: {
    limits: {
      title: { en: "Basic Limits", km: "លីមីតមូលដ្ឋាន" },
      importance: "85%",
      icon: "📐",
      content: {
        en: "A limit describes the value that a function approaches as the input approaches some value. Limits are essential for calculus and frequently tested in Bac II.",
        km: "លីមីតពិពណ៌នាអំពីតម្លៃដែលអនុគមន៍ទៅជិតនៅពេលដែលធាតុចូលទៅជិតតម្លៃមួយ។ លីមីតមានសារៈសំខាន់សម្រាប់ Bac II។",
      },
      summary: {
        en: "Key formula: lim(x→a) f(x) = L. Always check left and right limits separately.",
        km: "រូបមន្ត: lim(x→a) f(x) = L។ ពិនិត្យលីមីតខាងឆ្វេងនិងស្តាំ។",
      },
      funFact: {
        en: "Limits were invented so mathematicians could divide by zero... safely!",
        km: "លីមីតត្រូវបានបង្កើតឡើងឲ្យគណិតវិទូអាចចែកដោយសូន្យ... ប៉ុន្តែឲ្យមានសុវត្ថិភាព!",
      },
      tip: {
        en: "Always check left and right limits — they might not match!",
        km: "ពិនិត្យលីមីតខាងឆ្វេងនិងស្តាំ — ពួកវាប្រហែលជាមិនដូចគ្នា!",
      },
    },
    probability: {
      title: { en: "Basic Probability", km: "ប្រូបាប៊ីលីតេ" },
      importance: "40%",
      icon: "🎲",
      content: {
        en: "Probability measures the likelihood of an event. Combined with combinatorics, it forms a big part of the Bac II math exam.",
        km: "ប្រូបាប៊ីលីតេវាស់លទ្ធភាពនៃការកើតឡើង។ បញ្ចូលជាមួយ combinatorics គឺជាផ្នែកធំ។",
      },
      summary: {
        en: "P(Event) = Favorable / Total. Use tree diagrams for complex problems.",
        km: "P(ព្រឹត្តិការណ៍) = អំណោយផល / សរុប។ ប្រើដ្យាក្រាមដើមឈើ។",
      },
      funFact: {
        en: "Flipping heads 10 times doesn't make tails more likely — each flip is independent!",
        km: "បោះក្បាល 10 ដងមិនធ្វើឲ្យកន្ទុយមានលទ្ធភាពច្រើននោះទេ!",
      },
      tip: {
        en: "Draw tree diagrams — much faster and you won't miss cases!",
        km: "គូរដ្យាក្រាមដើមឈើ — រហ័សជាង!",
      },
    },
  },
  biology: {
    body: {
      title: { en: "Human Body", km: "រាងកាយមនុស្ស" },
      importance: "65%",
      icon: "🫀",
      content: {
        en: "The human body has multiple organ systems working together. The digestive system is the most tested topic in Bac II biology.",
        km: "រាងកាយមនុស្សមានប្រព័ន្ធសរីរាង្គច្រើន។ ប្រព័ន្ធរំលាយអាហារត្រូវបានសាកល្បងញឹកញាប់បំផុត។",
      },
      summary: {
        en: "Major systems: Digestive, Respiratory, Circulatory, Nervous, Skeletal, Muscular.",
        km: "ប្រព័ន្ធ: រំលាយអាហារ ដង្ហើម ចរាចរ សរសៃប្រសាទ គ្រោង សាច់ដុំ។",
      },
      funFact: {
        en: "Your stomach gets a completely new lining every 3–4 days to protect from its own acid!",
        km: "ក្រពះរបស់អ្នកទទួលស្រទាប់ថ្មីរៀងរាល់ 3-4 ថ្ងៃ!",
      },
      tip: {
        en: "Draw body system diagrams with different colors — much easier to remember!",
        km: "គូរដ្យាក្រាមជាមួយពណ៌ផ្សេងៗ — ងាយចងចាំ!",
      },
      didYouKnow: {
        en: "You have the same number of neck bones as a giraffe: 7 cervical vertebrae!",
        km: "អ្នកមានឆ្អឹងក ដូចហ្សីរ៉ាហ្វ: 7 កង!",
      },
    },
    brain: {
      title: { en: "Human Brain", km: "ខួរក្បាលមនុស្ស" },
      importance: "70%",
      icon: "🧠",
      content: {
        en: "The human brain controls all body functions through billions of neurons. Understanding neuron structure is critical for Bac II.",
        km: "ខួរក្បាលគ្រប់គ្រងមុខងារទាំងអស់តាមរយៈណឺរ៉ូន។",
      },
      summary: {
        en: "Main parts: Cerebrum (thinking), Cerebellum (coordination), Brain stem (vital). Neurons communicate via synapses.",
        km: "ផ្នែក: សេរេប្រុម (គំនិត), សេរេបែល (សម្របសម្រួល), ដើម (សំខាន់)។",
      },
      funFact: {
        en: "Your brain uses 20% of your body's energy but is only 2% of body weight!",
        km: "ខួរក្បាលប្រើ 20% ថាមពលប៉ុន្តែ 2% ទម្ងន់!",
      },
      tip: {
        en: "Connect brain parts to functions using stories — sticks better than memorization!",
        km: "ភ្ជាប់ផ្នែករឿង — ស្អិតជាងការចងចាំ!",
      },
      didYouKnow: {
        en: "You have enough neurons to count every star in the Milky Way!",
        km: "ណឺរ៉ូនរបស់អ្នកគ្រប់គ្រាន់ដើម្បីរាប់ផ្កាយ Milky Way!",
      },
    },
  },
};

export const FOUNDATION: Record<string, Lesson> = {
  math: {
    title: { en: "Math Foundation", km: "គ្រឹះគណិត" },
    importance: "100%",
    icon: "🔢",
    content: {
      en: "Before diving into advanced topics, review the basics. Variables, equations, and operations are essential for all math.",
      km: "មុនរៀនកម្រិតខ្ពស់ ពិនិត្យមូលដ្ឋាន។",
    },
    summary: {
      en: "Variables (x, y) represent unknowns. Equations show equality (2x+3=7).",
      km: "អថេរ (x, y) តំណាងអ្វីមិនស្គាល់។ សមីការ (2x+3=7)។",
    },
    funFact: {
      en: "'Algebra' comes from Arabic meaning 'reunion of broken parts'!",
      km: "'Algebra' មកពីអារ៉ាប់ 'ការរួបរួមផ្នែកបែក'!",
    },
    tip: {
      en: "Always isolate the variable. What you do to one side, do to the other!",
      km: "ដោះអថេរម្ខាង។ ធ្វើដូចគ្នានៅក្បែរ!",
    },
  },
  biology: {
    title: { en: "Biology Foundation", km: "គ្រឹះជីវវិទ្យា" },
    importance: "100%",
    icon: "🧫",
    content: {
      en: "All living things are made of cells. Cells → Tissues → Organs → Systems. Understanding this hierarchy is key.",
      km: "សារពាង្គទាំងអស់ជាកោសិកា។ កោសិកា → ជាលិកា → សរីរាង្គ → ប្រព័ន្ធ។",
    },
    summary: {
      en: "Cell → Tissue → Organ → Organ System → Organism. The biological hierarchy.",
      km: "កោសិកា → ជាលិកា → សរីរាង្គ → ប្រព័ន្ធ → សារពាង្គ។",
    },
    funFact: {
      en: "Your body has about 37 trillion cells!",
      km: "រាងកាយអ្នកមាន 37 ទ្រីលាន កោសិកា!",
    },
    tip: {
      en: "Draw diagrams! Visual learning helps remember organ structures.",
      km: "គូរដ្យាក្រាម! ជួយចងចាំ។",
    },
    didYouKnow: {
      en: "Red blood cells live only 120 days before being replaced!",
      km: "កោសិកាឈាមក្រហមរស់ 120 ថ្ងៃ!",
    },
  },
};

export const FLASHCARDS: Record<string, Flashcard[]> = {
  math: [
    {
      q: { en: "What is a limit?", km: "តើលីមីតជាអ្វី?" },
      a: {
        en: "Value a function approaches as input approaches a value",
        km: "តម្លៃអនុគមន៍ទៅជិតនៅពេលធាតុចូលទៅជិតតម្លៃ",
      },
      topic: "limits",
    },
    {
      q: { en: "Probability formula?", km: "រូបមន្តប្រូបាប?" },
      a: {
        en: "P(E) = Favorable / Total outcomes",
        km: "P(E) = អំណោយផល / លទ្ធផលសរុប",
      },
      topic: "probability",
    },
    {
      q: { en: "What is 0/0 in limits?", km: "0/0 ក្នុងលីមីត?" },
      a: {
        en: "Indeterminate — use factoring or L'Hôpital's rule",
        km: "មិនកំណត់ — ប្រើដាក់កត្តា",
      },
      topic: "limits",
    },
    {
      q: { en: "What is a variable?", km: "អថេរជាអ្វី?" },
      a: { en: "Symbol representing a number (x or y)", km: "និមិត្តតំណាងលេខ (x ឬ y)" },
      topic: "foundation",
    },
  ],
  biology: [
    {
      q: { en: "Neck bones count?", km: "ឆ្អឹងកប៉ុន្មាន?" },
      a: { en: "7 cervical vertebrae", km: "7 កងឆ្អឹងក" },
      topic: "body",
    },
    {
      q: { en: "Main brain parts?", km: "ផ្នែកខួរក្បាល?" },
      a: { en: "Cerebrum, Cerebellum, Brain stem", km: "សេរេប្រុម, សេរេបែល, ដើម" },
      topic: "brain",
    },
    {
      q: { en: "Cerebellum controls?", km: "សេរេបែលគ្រប់គ្រង?" },
      a: { en: "Balance and coordination", km: "តុល្យភាពនិងការសម្របសម្រួល" },
      topic: "brain",
    },
    {
      q: { en: "What is a cell?", km: "កោសិកាជាអ្វី?" },
      a: { en: "Basic unit of all living things", km: "ឯកតាមូលដ្ឋាននៃសារពាង្គ" },
      topic: "foundation",
    },
  ],
};

export const PRACTICE: Record<string, PracticeQuestion[]> = {
  math: [
    {
      q: { en: "lim(x→2) (x²-4)/(x-2) = ?", km: "lim(x→2) (x²-4)/(x-2) = ?" },
      correct: "4",
      options: ["2", "4", "0", "undefined"],
      explanation: {
        en: "Factor: (x+2)(x-2)/(x-2) = x+2 → at x=2 → 4",
        km: "ដាក់កត្តា: (x+2)(x-2)/(x-2) = x+2 → x=2 → 4",
      },
    },
    {
      q: { en: "P(both heads, 2 flips)?", km: "P(ក្បាលទាំងពីរ)?" },
      correct: "1/4",
      options: ["1/2", "1/4", "1/3", "2/3"],
      explanation: { en: "1/2 × 1/2 = 1/4", km: "1/2 × 1/2 = 1/4" },
    },
  ],
  biology: [
    {
      q: { en: "Which part coordinates balance?", km: "ផ្នែកណាសម្របតុល្យភាព?" },
      correct: "Cerebellum",
      options: ["Cerebrum", "Cerebellum", "Brain stem", "Neuron"],
      explanation: {
        en: "Cerebellum controls coordination and balance",
        km: "សេរេបែលគ្រប់គ្រងតុល្យភាព",
      },
    },
    {
      q: { en: "Stomach lining regenerates every?", km: "ស្រទាប់ក្រពះកើតឡើងវិញ?" },
      correct: "3-4 days",
      options: ["1 day", "3-4 days", "1 week", "1 month"],
      explanation: {
        en: "Stomach regenerates every 3-4 days to protect from acid",
        km: "ក្រពះកើតឡើងវិញ 3-4 ថ្ងៃ",
      },
    },
  ],
};
