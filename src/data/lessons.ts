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
    // The longest lesson in the app, and deliberately so — it is the worked
    // example of how much a `content` field can carry. Paragraphs are separated
    // by blank lines, which only render as breaks because the content and
    // summary blocks in lesson-detail.tsx carry `whitespace-pre-line`. Strings
    // are flush-left inside the template literal on purpose: indenting them
    // would put a leading space on every rendered line.
    brain: {
      title: { en: "Human Brain", km: "ខួរក្បាលមនុស្ស" },
      importance: "70%",
      icon: "🧠",
      content: {
        en: `The brain is the control centre of the nervous system. It weighs about 1.4 kg — roughly 2% of body weight — yet uses around 20% of the body's energy. It holds an estimated 86 billion neurons, and it is protected by the skull, by three membranes called the meninges, and by cerebrospinal fluid that cushions it against shock.

1. CEREBRUM — the largest part. It is split into left and right hemispheres joined by the corpus callosum, and its deeply folded surface increases the area that fits inside the skull. Each hemisphere has four lobes: the frontal lobe (thinking, planning, decisions, voluntary movement), the parietal lobe (touch, temperature, pain), the temporal lobe (hearing, language, memory) and the occipital lobe (vision). Note that each hemisphere controls the OPPOSITE side of the body.

2. CEREBELLUM — sits below and behind the cerebrum. It does not start movement; it refines it. It controls balance, posture and the smooth coordination of muscles. Damage here causes unsteady, jerky movement rather than paralysis.

3. BRAIN STEM — connects the brain to the spinal cord, and is made of the midbrain, the pons and the medulla oblongata. It runs the automatic functions you never think about: breathing, heart rate, blood pressure, swallowing, and reflexes such as coughing. Because it controls breathing and heartbeat, damage to the brain stem is life-threatening.

THE NEURON — the brain's working unit. A neuron has dendrites that receive signals, a cell body (soma) holding the nucleus, and one long axon that carries the signal away. Most axons are wrapped in a fatty myelin sheath, which insulates the fibre and makes the impulse travel far faster.

THE SYNAPSE — neurons never actually touch. At the synapse there is a tiny gap. When the electrical impulse reaches the axon terminal it releases chemical neurotransmitters, which cross the gap and pass the signal to the next neuron. So the signal is electrical ALONG a neuron and chemical BETWEEN neurons — a point Bac II papers ask about often.`,
        km: `ខួរក្បាលគឺជាមជ្ឈមណ្ឌលបញ្ជានៃប្រព័ន្ធសរសៃប្រសាទ។ វាមានទម្ងន់ប្រហែល 1.4 គីឡូក្រាម គឺប្រហែល 2% នៃទម្ងន់រាងកាយ ប៉ុន្តែប្រើថាមពលរបស់រាងកាយដល់ទៅ 20%។ វាមានណឺរ៉ូន (neuron) ប្រហែល 86 ពាន់លាន ហើយត្រូវបានការពារដោយលលាដ៍ក្បាល ស្រទាប់ស្រោមបីជាន់ (meninges) និងទឹករាវ cerebrospinal fluid ដែលការពារពីការប៉ះទង្គិច។

1. សេរេប្រុម (Cerebrum) — ជាផ្នែកធំជាងគេ។ វាបែងចែកជាអឌ្ឍគោលឆ្វេង និងស្តាំ ភ្ជាប់គ្នាដោយ corpus callosum ហើយផ្ទៃរបស់វាមានផ្នត់ជ្រៅៗ ដើម្បីឲ្យផ្ទៃដីធំអាចផ្ទុកនៅក្នុងលលាដ៍ក្បាលបាន។ អឌ្ឍគោលនីមួយៗមានបួន lobe៖ frontal lobe (ការគិត ការរៀបចំផែនការ ការសម្រេចចិត្ត ចលនាតាមបំណង), parietal lobe (ការប៉ះ សីតុណ្ហភាព ការឈឺចាប់), temporal lobe (ការស្តាប់ ភាសា ការចងចាំ) និង occipital lobe (ការមើល)។ ចំណាំ៖ អឌ្ឍគោលម្ខាងគ្រប់គ្រងរាងកាយម្ខាងទៀត។

2. សេរេបែល (Cerebellum) — ស្ថិតនៅខាងក្រោម និងខាងក្រោយសេរេប្រុម។ វាមិនចាប់ផ្តើមចលនាទេ តែធ្វើឲ្យចលនារលូន។ វាគ្រប់គ្រងតុល្យភាព ឥរិយាបថ និងការសម្របសម្រួលសាច់ដុំ។ បើផ្នែកនេះខូច អ្នកជំងឺនឹងដើរមិនស្មើ និងញ័រ មិនមែនស្លាប់សរសៃទេ។

3. ដើមខួរ (Brain stem) — ភ្ជាប់ខួរក្បាលទៅខួរឆ្អឹងខ្នង ផ្សំឡើងពី midbrain, pons និង medulla oblongata។ វាគ្រប់គ្រងមុខងារស្វ័យប្រវត្តិដែលយើងមិនបាច់គិត៖ ដង្ហើម ចង្វាក់បេះដូង សម្ពាធឈាម ការលេប និងការក្អក។ ដោយសារវាគ្រប់គ្រងដង្ហើម និងបេះដូង ការខូចខាតនៅដើមខួរគឺគ្រោះថ្នាក់ដល់អាយុជីវិត។

ណឺរ៉ូន (Neuron) — ជាឯកតាធ្វើការរបស់ខួរក្បាល។ ណឺរ៉ូនមានដេនឌ្រីត (dendrite) សម្រាប់ទទួលសញ្ញា មានតួកោសិកា (cell body) ដែលផ្ទុកនុយក្លេអ៊ែរ និងមានអាក់សូន (axon) វែងមួយសម្រាប់បញ្ជូនសញ្ញាចេញ។ អាក់សូនភាគច្រើនត្រូវបានរុំដោយស្រទាប់ខ្លាញ់ myelin ដែលធ្វើឲ្យសញ្ញាធ្វើដំណើរលឿនជាងមុន។

ស៊ីណាប់ (Synapse) — ណឺរ៉ូនមិនប៉ះគ្នាដោយផ្ទាល់ទេ។ នៅចន្លោះមានគម្លាតតូចមួយ។ ពេលសញ្ញាអគ្គិសនីមកដល់ចុងអាក់សូន វាបញ្ចេញសារធាតុគីមី neurotransmitter ដែលឆ្លងកាត់គម្លាតនោះ ដើម្បីបញ្ជូនសញ្ញាបន្តទៅណឺរ៉ូនបន្ទាប់។ ដូច្នេះ សញ្ញាគឺអគ្គិសនីនៅតាមបណ្តោយណឺរ៉ូន និងគីមីនៅចន្លោះណឺរ៉ូន — ជាចំណុចដែលវិញ្ញាសា Bac II ចូលចិត្តសួរ។`,
      },
      summary: {
        en: `Three main parts: Cerebrum (thought, voluntary movement, memory, language), Cerebellum (balance and coordination), Brain stem (breathing, heartbeat, blood pressure).

Cerebrum lobes: frontal = thinking and movement; parietal = touch; temporal = hearing and memory; occipital = vision. Each hemisphere controls the opposite side of the body.

Neuron: dendrites receive → cell body → axon transmits. The myelin sheath speeds the impulse up.

Signal: electrical ALONG a neuron, chemical (neurotransmitters) ACROSS the synapse between neurons.`,
        km: `ផ្នែកសំខាន់បី៖ សេរេប្រុម (ការគិត ចលនាតាមបំណង ការចងចាំ ភាសា), សេរេបែល (តុល្យភាព និងការសម្របសម្រួល), ដើមខួរ (ដង្ហើម ចង្វាក់បេះដូង សម្ពាធឈាម)។

Lobe នៃសេរេប្រុម៖ frontal = ការគិត និងចលនា; parietal = ការប៉ះ; temporal = ការស្តាប់ និងការចងចាំ; occipital = ការមើល។ អឌ្ឍគោលម្ខាងគ្រប់គ្រងរាងកាយម្ខាងទៀត។

ណឺរ៉ូន៖ ដេនឌ្រីតទទួល → តួកោសិកា → អាក់សូនបញ្ជូន។ ស្រទាប់ myelin ធ្វើឲ្យសញ្ញាលឿន។

សញ្ញា៖ អគ្គិសនីនៅតាមបណ្តោយណឺរ៉ូន គីមីនៅឯស៊ីណាប់។`,
      },
      funFact: {
        en: "Your brain uses 20% of your body's energy but is only 2% of body weight!",
        km: "ខួរក្បាលប្រើ 20% ថាមពលប៉ុន្តែ 2% ទម្ងន់!",
      },
      tip: {
        en: "Exam questions usually ask you to NAME a part and GIVE its function, so learn them as pairs rather than as a list. If you are asked which part is damaged, work backwards from the symptom: lost balance → cerebellum; breathing failure → brain stem; lost memory or speech → cerebrum.",
        km: "វិញ្ញាសាតែងសួរឲ្យប្រាប់ឈ្មោះផ្នែក និងមុខងាររបស់វា ដូច្នេះត្រូវរៀនជាគូ មិនមែនជាបញ្ជីទេ។ បើគេសួរថាផ្នែកណាខូច សូមគិតត្រឡប់ពីរោគសញ្ញា៖ បាត់តុល្យភាព → សេរេបែល; ដកដង្ហើមមិនបាន → ដើមខួរ; បាត់ការចងចាំ ឬការនិយាយ → សេរេប្រុម។",
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
