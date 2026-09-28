// In-memory query cache and Bac II pre-computed answers for KruAI.
//
// Zero-token, zero-latency instant response layer:
//   1. Checks hand-written Bac II curriculum answers (e.g. comparison matrices)
//      against a student's FIRST question — see getCachedAnswer for why only
//      then, and why nothing the model writes is ever cached.
//   2. Emits a smooth simulated text stream so the frontend UI renders the exact
//      same typed streaming animation without any Gemini API call or token cost.

/** Normalize text for fuzzy matching (case, punctuation, whitespace). */
export function normalizeQuery(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[?!.,;:()"'`~@#$%^&*_=+\\/|<>[\]{}–—។៕]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Pre-computed Bac II curriculum knowledge mappings. */
interface CachedEntry {
  patterns: string[];
  answer: string;
}

const CURRICULUM_ENTRIES: CachedEntry[] = [
  // 1. Monocot vs Dicot
  {
    patterns: [
      "ប្រៀបធៀបម៉ូណូកូទីលេដូន និងឌីកូទីលេដូន",
      "ប្រៀបធៀប ម៉ូណូកូទីលេដូន និង ឌីកូទីលេដូន",
      "ម៉ូណូកូទីលេដូន និងឌីកូទីលេដូន",
      "ភាពខុសគ្នារវាងម៉ូណូកូទីលេដូន និងឌីកូទីលេដូន",
      "compare monocotyledons and dicotyledons",
      "compare monocots and dicots",
      "monocot and dicot",
      "monocots and dicots",
      "monocot vs dicot",
      "monocots vs dicots",
    ],
    answer: `+ លក្ខណៈដូចគ្នា
- ជារុក្ខជាតិមានផ្កា (អង់ស្យូស្ពែម) ដូចគ្នា
- មានគ្រាប់ការពារដោយផ្លែ និងមានប្រព័ន្ធសរសៃនាំដូចគ្នា។

+ លក្ខណៈខុសគ្នា
| លក្ខណៈ | ម៉ូណូកូទីលេដូន | ឌីកូទីលេដូន |
| :--- | :--- | :--- |
| គ្រាប់ | មានកូទីលេដុង 1 | មានកូទីលេដុង 2 |
| ស្លឹក | ស្លឹកមានទ្រនុងស្រប | ស្លឹកមានទ្រនុងបែកខ្នែង |
| ផ្កា | មាន 3 ស្រទាប់ ឬពហុគុណនឹង 3 | មាន 4 ឬ 5 ស្រទាប់ |
| ដើម | បាច់សរសៃនាំស្ថិតនៅរាយប៉ាយ | បាច់សរសៃនាំស្ថិតជារង្វង់ |
| ឫស | ប្រព័ន្ធឫសស្ញែ | ប្រព័ន្ធឫសកែវ |

គន្លឹះប្រឡង៖ ពេលប្រឡងបាក់ឌុប សំណួរប្រៀបធៀបត្រូវឆ្លើយទាំង «លក្ខណៈដូចគ្នា» និង «លក្ខណៈខុសគ្នា» ជាតារាងជានិច្ច។ បើឆ្លើយតែលក្ខណៈខុសគ្នា នោះនឹងបាត់ពិន្ទុពាក់កណ្តាលលើលក្ខណៈដូចគ្នា!`,
  },

  // 2. Auxin vs Cytokinin
  {
    patterns: [
      "ប្រៀបធៀបអរម៉ូនអុកស៊ីន និងស៊ីតូគីនីន",
      "ប្រៀបធៀប អុកស៊ីន និង ស៊ីតូគីនីន",
      "ប្រៀបធៀបអុកស៊ីន និងស៊ីតូគីនីន",
      "អុកស៊ីន និងស៊ីតូគីនីន",
      "compare auxin and cytokinin",
      "compare the plant hormones auxin and cytokinin",
      "auxin and cytokinin",
      "auxin vs cytokinin",
    ],
    answer: `+ លក្ខណៈដូចគ្នា
- ជាអរម៉ូនលូតលាស់រុក្ខជាតិ (ភីតូអរម៉ូន) ដូចគ្នា
- ត្រូវបានផលិតក្នុងបរិមាណតិចតួចបំផុត ប៉ុន្តែមានប្រសិទ្ធភាពខ្ពស់លើការលូតលាស់ និងការអភិវឌ្ឍរុក្ខជាតិដូចគ្នា។

+ លក្ខណៈខុសគ្នា
| លក្ខណៈ | អរម៉ូនអុកស៊ីន (Auxin) | អរម៉ូនស៊ីតូគីនីន (Cytokinin) |
| :--- | :--- | :--- |
| កន្លែងផលិតចម្បង | ចុងពន្លកកំពូល ស្លឹកខ្ចី និងអំប្រ៊ីយ៉ុង | ចុងឫស (មេរីស្តែមឫស) និងជាលិកាកំពុងលូតលាស់ |
| ឥទ្ធិពលលើកោសិកា | ជំរុញការលូតវែងនៃកោសិកា | ជំរុញការចែកកោសិកា (ស៊ីតូគីណេស) |
| ឥទ្ធិពលលើពន្លកចំហៀង | ទប់ស្កាត់ការលូតលាស់ពន្លកចំហៀង (ភាពត្រួតត្រានៃពន្លកកំពូល) | ជំរុញការលូតលាស់ពន្លកចំហៀង (បែកមែកធាង) |
| ឥទ្ធិពលលើភាពចាស់នៃស្លឹក | ជំរុញការជ្រុះស្លឹកចាស់ | ពន្យឺតភាពចាស់នៃស្លឹក (រក្សាជាតិបៃតង) |

គន្លឹះប្រឡង៖ ចងចាំថាអុកស៊ីន និងស៊ីតូគីនីន មានឥទ្ធិពលប្រឆាំងគ្នាលើពន្លកចំហៀង (អុកស៊ីនទប់ស្កាត់ ស៊ីតូគីនីនជំរុញ)។ ក្នុងវិញ្ញាសាបាក់ឌុប សំណួរប្រៀបធៀបត្រូវសរសេរទាំង «លក្ខណៈដូចគ្នា» និង «លក្ខណៈខុសគ្នា» ជាតារាងជានិច្ចដើម្បីទទួលបានពិន្ទុពេញ!`,
  },

  // 3. Sympathetic vs Parasympathetic
  {
    patterns: [
      "ប្រៀបធៀបប្រព័ន្ធប្រសាទសាំប៉ាទិច និងប៉ារ៉ាសាំប៉ាទិច",
      "ប្រៀបធៀបសាំប៉ាទិច និងប៉ារ៉ាសាំប៉ាទិច",
      "ប្រៀបធៀប សាំប៉ាទិច និង ប៉ារ៉ាសាំប៉ាទិច",
      "សាំប៉ាទិច និងប៉ារ៉ាសាំប៉ាទិច",
      "compare sympathetic and parasympathetic",
      "compare the sympathetic and parasympathetic nervous systems",
      "sympathetic and parasympathetic",
      "sympathetic vs parasympathetic",
    ],
    answer: `+ លក្ខណៈដូចគ្នា
- ជាផ្នែកទាំងពីរនៃប្រព័ន្ធប្រសាទស្វ័យប្រវត្តិ (អឆន្ទៈ) ដូចគ្នា
- ត្រួតពិនិត្យ និងសម្របសម្រួលសរីរាង្គខាងក្នុង (បេះដូង សរសៃឈាម ទងសួត ក្រពះ-ពោះវៀន ក្រពេញ) ដូចគ្នា
- ធ្វើការរួមគ្នាដើម្បីរក្សាលំនឹង (Homeostasis) ក្នុងសារពាង្គកាយដូចគ្នា។

+ លក្ខណៈខុសគ្នា
| លក្ខណៈ | ប្រព័ន្ធប្រសាទសាំប៉ាទិច (Sympathetic) | ប្រព័ន្ធប្រសាទប៉ារ៉ាសាំប៉ាទិច (Parasympathetic) |
| :--- | :--- | :--- |
| ស្ថានភាពសកម្មភាព | សកម្មក្នុងគ្រាអាសន្ន ឬតានតឹង (Fight or Flight) | សកម្មក្នុងពេលសម្រាក និងរំលាយអាហារ (Rest and Digest) |
| ចង្វាក់បេះដូង | បង្កើនល្បឿន និងកម្លាំងកន្ត្រាក់បេះដូង | បន្ថយល្បឿនចង្វាក់បេះដូងមកធម្មតា |
| ប្រស្រីភ្នែក | ពង្រីកប្រស្រីភ្នែក | បង្រួមប្រស្រីភ្នែក |
| ទងសួត | ពង្រីកទងសួត (ស្រូប O_2 បានច្រើន) | បង្រួមទងសួតមកធម្មតា |
| ការរំលាយអាហារ | បន្ថយការបញ្ចេញទឹកមាត់ និងការរំលាយអាហារ | ជំរុញការបញ្ចេញទឹកមាត់ និងការរំលាយអាហារ |
| ជាតិស្ករក្នុងឈាម | ថ្លើមបំប្លែងគ្លីកូសែនជាគ្លុយកូស (បញ្ចេញថាមពល) | ថ្លើមបំប្លែងគ្លុយកូសជាគ្លីកូសែន (ស្តុកទុកជាតិស្ករ) |
| ការបញ្ចេញអរម៉ូន | ជំរុញការបញ្ចេញអេពីណេព្រីនពីក្រពេញលើតម្រងនោម | បន្ថយការបញ្ចេញអេពីណេព្រីន |
| ប្លោកនោម | បន្ធូរប្លោកនោម | បង្រួមប្លោកនោម |

គន្លឹះប្រឡង៖ ក្នុងវិញ្ញាសាបាក់ឌុប សំណួរប្រៀបធៀបត្រូវសរសេរទាំង «លក្ខណៈដូចគ្នា» និង «លក្ខណៈខុសគ្នាជាតារាង» ជានិច្ចដើម្បីកុំឱ្យបាត់ពិន្ទុ។ សម្គាល់ថា ប្រព័ន្ធទាំងពីរមានសកម្មភាពផ្ទុយគ្នាជានិច្ចលើសរីរាង្គគោលដៅដដែល (សាំប៉ាទិចជំរុញពេលអាសន្ន ប៉ារ៉ាសាំប៉ាទិចសម្រាលពេលសម្រាក)។`,
  },

  // 4. Brain parts
  {
    patterns: [
      "ផ្នែកសំខាន់ទាំងបីនៃខួរក្បាលមនុស្ស",
      "ផ្នែកសំខាន់ទាំង 3 នៃខួរក្បាលមនុស្ស",
      "រៀបរាប់ផ្នែកសំខាន់ទាំងបីនៃខួរក្បាលមនុស្ស",
      "រៀបរាប់ផ្នែកសំខាន់ទាំង 3 នៃខួរក្បាលមនុស្ស",
      "three main parts of the human brain",
      "parts of the brain",
      "parts of brain",
      "parts of the human brain",
      "main parts of the brain",
      "3 parts of brain",
      "main parts of brain",
    ],
    answer: `ទិន្នន័យ៖ ខួរក្បាលមនុស្ស
សំណួរ៖ ផ្នែកសំខាន់ទាំង 3 និងមុខងារនីមួយៗ

វិធីសាស្ត្រ៖ ប្រើការបែងចែកកាយវិភាគសាស្ត្រស្តង់ដារ ជា ខួរធំ (សេរេប្រុម) ខួរតូច (សេរេបែល) និងខួរកញ្ចឹងក (ដើមខួរ)។

1. ខួរធំ (Cerebrum) - ផ្នែកធំបំផុត (ប្រហែល 80% នៃជាលិកាប្រសាទ) គ្រប់គ្រងការគិត ការចងចាំ ភាសា និងចលនាដោយចេតនា (ឆន្ទៈ)។
2. ខួរតូច (Cerebellum) - ស្ថិតនៅក្រោម និងខាងក្រោយខួរធំ គ្រប់គ្រងតុល្យភាព/លំនឹង និងការសម្របសម្រួលចលនាសាច់ដុំឱ្យរលូន។
3. ខួរកញ្ចឹងក ឬដើមខួរ (Brain stem / Medulla) - ភ្ជាប់ខួរក្បាលទៅខួរឆ្អឹងខ្នង គ្រប់គ្រងមុខងារស្វ័យប្រវត្តិ (អឆន្ទៈ) ដូចជាចង្វាក់ដង្ហើម និងចង្វាក់បេះដូង។

ចម្លើយ៖ ផ្នែកសំខាន់ទាំង 3 គឺ ខួរធំ (ការគិត និងចលនាឆន្ទៈ) ខួរតូច (តុល្យភាព និងការសម្របសម្រួល) និងខួរកញ្ចឹងក (ដង្ហើម និងចង្វាក់បេះដូង)។

គន្លឹះប្រឡង៖ សរសេរមុខងារជាប់នឹងឈ្មោះផ្នែកនីមួយៗ កុំបំបែកជាកថាខណ្ឌដាច់ដោយឡែក។ តារាងពិន្ទុបាក់ឌុបផ្គូផ្គងឈ្មោះនឹងមុខងារ ដូច្នេះឈ្មោះតែឯងបានត្រឹមពាក់កណ្តាលពិន្ទុ។`,
  },

  // 5. Mitosis vs Meiosis
  {
    patterns: [
      "ប្រៀបធៀបមីតូស និងមេយ៉ូស",
      "ប្រៀបធៀប មីតូស និង មេយ៉ូស",
      "មីតូស និងមេយ៉ូស",
      "compare mitosis and meiosis",
      "mitosis and meiosis",
      "mitosis vs meiosis",
    ],
    answer: `+ លក្ខណៈដូចគ្នា
- ជាដំណើរការចែកណ្វៃយ៉ូ និងកោសិកាក្នុងភាវរស់ដូចគ្នា
- មានការស្វ័យតម្លើងទ្វេនៃ DNA ក្នុងវគ្គចន្លោះ (Interphase) មុនពេលចាប់ផ្តើមចែកដូចគ្នា
- ឆ្លងកាត់វគ្គបណ្តុះដូចគ្នា៖ ប្រូផាស មេតាផាស អានាផាស និងតេឡូផាស។

+ លក្ខណៈខុសគ្នា
| លក្ខណៈ | មីតូស (Mitosis) | មេយ៉ូស (Meiosis) |
| :--- | :--- | :--- |
| ប្រភេទកោសិកា | កើតលើកោសិកាសូម៉ាទិច (កោសិការាងកាយ) | កើតលើកោសិកាបន្តពូជ (បង្កើតស្ពែរម៉ាតូសូអ៊ីត ឬអូវុល) |
| ចំនួនដងនៃការចែក | ចែកតែ 1 ដងប៉ុណ្ណោះ | ចែក 2 ដងបន្តបន្ទាប់ (មេយ៉ូស I និងមេយ៉ូស II) |
| ចំនួនកោសិកាកូន | បង្កើតបានកោសិកាកូន 2 | បង្កើតបានកោសិកាកូន 4 |
| បរិមាណក្រូម៉ូសូម | កោសិកាកូនមានក្រូម៉ូសូមឌីប្លូអ៊ីត ($2n$) ដូចកោសិកាមេ | កោសិកាកូនមានក្រូម៉ូសូមអាប្លូអ៊ីត ($n$) ស្មើពាក់កណ្តាលកោសិកាមេ |
| បាតុភូតកាត់ប្តូរ (Crossing over) | គ្មានបាតុភូតកាត់ប្តូរក្រូម៉ាទីតទេ | មានបាតុភូតកាត់ប្តូរក្រូម៉ាទីតក្នុងវគ្គប្រូផាស I (បង្កើតបន្សំថ្មី) |
| នាទីចម្បង | ការលូតលាស់ ជួសជុលជាលិកា និងបន្តពូជអភេទ | បង្កើតហ្គាម៉ែតសម្រាប់បន្តពូជភេទ |

គន្លឹះប្រឡង៖ ត្រូវឆ្លើយទាំង «លក្ខណៈដូចគ្នា» និង «លក្ខណៈខុសគ្នាជាតារាង» ជានិច្ចដើម្បីទទួលបានពិន្ទុពេញ!`,
  },

  // 6. DNA Replication
  {
    patterns: [
      "ស្វ័យតម្លើងទ្វេនៃ dna",
      "ការស្វ័យតម្លើងទ្វេនៃ dna",
      "តើ dna ស្វ័យតម្លើងទ្វេយ៉ាងដូចម្តេច",
      "dna replication",
      "how does dna replicate",
    ],
    answer: `ទិន្នន័យ៖ ម៉ូលេគុល DNA ក្នុងវគ្គចន្លោះ (Interphase) នៃវដ្តកោសិកា
សំណួរ៖ ដំណើរការស្វ័យតម្លើងទ្វេនៃ DNA

វិធីសាស្ត្រ៖ ពន្យល់តាមគំរូពាក់កណ្តាលរក្សាទុក (Semi-conservative Model) និងតួនាទីអង់ស៊ីមសំខាន់ៗ។

1. ការពន្លាតខ្សែ DNA៖ អង់ស៊ីមដេអុកស៊ីរីបូញ៉ូក្លេអាស (Helicase) ផ្តាច់សម្ព័ន្ធអ៊ីដ្រូសែនរវាងគូបាសបំពេញ ធ្វើឱ្យច្រវាក់ទ្វេរបើកចេញពីគ្នាជាច្រវាក់ទោលពីរ (Fork replication)។
2. ការសំយោគច្រវាក់ថ្មី៖ អង់ស៊ីម DNA Polymerase នាំយកនុយក្លេអូទីដសេរីពីមជ្ឈដ្ឋានក្នុងណ្វៃយ៉ូមកភ្ជាប់ជាមួយនុយក្លេអូទីដនៃច្រវាក់ចាស់នីមួយៗតាមគោលការណ៍បំពេញបាស (A ភ្ជាប់ T ដោយសម្ព័ន្ធអ៊ីដ្រូសែន 2, C ភ្ជាប់ G ដោយសម្ព័ន្ធអ៊ីដ្រូសែន 3)។
3. លទ្ធផល៖ បង្កើតបានម៉ូលេគុល DNA ថ្មី 2 ដែលមានលក្ខណៈដូចគ្នាបេះបិទ និងដូចម៉ូលេគុល DNA មេដើម។ ក្នុង DNA ថ្មីនីមួយៗ មានច្រវាក់ចាស់ 1 (ជាពុម្ព) និងច្រវាក់ទើបសំយោគថ្មី 1 (ហៅថា គំរូពាក់កណ្តាលរក្សាទុក)។

ចម្លើយ៖ ការស្វ័យតម្លើងទ្វេនៃ DNA ប្រព្រឹត្តទៅតាមបែបពាក់កណ្តាលរក្សាទុក ដោយមានជំនួយពីអង់ស៊ីម Helicase (ពន្លាតខ្សែ) និង DNA Polymerase (សំយោគខ្សែបំពេញ A=T, C=G)។

គន្លឹះប្រឡង៖ កុំភ្លេចពាក្យគន្លឹះ «ពាក់កណ្តាលរក្សាទុក» និងការផ្គូផ្គងបាសបំពេញ A=T, C=G ដែលជាចំណុចស៊ីពិន្ទុក្នុងវិញ្ញាសាបាក់ឌុប!`,
  },

  // 7. Types of RNA
  {
    patterns: [
      "ប្រភេទនៃ rna",
      "ប្រភេទ rna ទាំងបី",
      "ប្រភេទ rna ទាំង 3",
      "រៀបរាប់ប្រភេទ rna",
      "three types of rna",
      "types of rna",
      "mrna trna rrna",
    ],
    answer: `ទិន្នន័យ៖ អាស៊ីតរីបូញ៉ូក្លេអិច (RNA)
សំណួរ៖ ប្រភេទនៃ RNA ទាំង 3 និងនាទីនីមួយៗ

វិធីសាស្ត្រ៖ បែងចែកជា 3 ប្រភេទស្តង់ដារតាមកាយវិភាគវិទ្យា និងជីវម៉ូលេគុលថ្នាក់ទី 12៖

1. mRNA (Messenger RNA / RNA នាំសារ)៖
   - មានច្រវាក់ទោលត្រង់ គ្មានសម្ព័ន្ធអ៊ីដ្រូសែនខាងក្នុង។
   - នាទី៖ ចម្លងព័ត៌មានពន្ធុពី DNA ក្នុងណ្វៃយ៉ូ រួចដឹកនាំចេញមកកាន់ស៊ីតូប្លាសឆ្ពោះទៅរីបូសូម ដើម្បីធ្វើជាពុម្ពសំយោគប្រូតេអ៊ីន។

2. tRNA (Transfer RNA / RNA ដឹកនាំ)៖
   - មានរាងដូចស្លឹកត្រចៀកកាំ (Cloverleaf) មានអង់ទីកូដុងនៅចុងម្ខាង និងកន្លែងភ្ជាប់អាស៊ីតអាមីណូនៅចុងម្ខាងទៀត។
   - នាទី៖ ដឹកនាំអាស៊ីតអាមីណូជាក់លាក់ពីស៊ីតូប្លាសមកកាន់រីបូសូម តាមការណែនាំនៃកូដុងលើ mRNA។

3. rRNA (Ribosomal RNA / RNA រីបូសូម)៖
   - ជាប្រភេទ RNA ដែលមានបរិមាណច្រើនជាងគេ (ប្រហែល 80% នៃ RNA សរុបក្នុងកោសិកា)។
   - នាទី៖ ផ្សំជាមួយប្រូតេអ៊ីនដើម្បីបង្កើតបានជារីបូសូម ដែលជារោងចក្រសំយោគប្រូតេអ៊ីនរបស់កោសិកា។

ចម្លើយ៖ RNA មាន 3 ប្រភេទគឺ mRNA (នាំសារព័ត៌មានពន្ធុ), tRNA (ដឹកនាំអាស៊ីតអាមីណូ), និង rRNA (ផ្សំជារីបូសូម)។

គន្លឹះប្រឡង៖ ត្រូវសរសេរទាំងឈ្មោះកាត់ (mRNA, tRNA, rRNA) ឈ្មោះពេញជាភាសាខ្មែរ និងនាទីជាក់លាក់របស់វា ដើម្បីទទួលបានពិន្ទុពេញ 100%!`,
  },

  // 8. Mendel's Laws
  {
    patterns: [
      "ច្បាប់ម៉ង់ដែល",
      "ច្បាប់ទាំងពីររបស់ម៉ង់ដែល",
      "ច្បាប់ទាំង 2 របស់ម៉ង់ដែល",
      "mendel laws",
      "mendel's laws",
      "law of segregation",
      "law of independent assortment",
    ],
    answer: `ទិន្នន័យ៖ ពិសោធន៍បង្កាត់សណ្តែករបស់លោក ហ្គ្រេហ្គ័រ ម៉ង់ដែល (Gregor Mendel)
សំណួរ៖ ច្បាប់ទាំង 2 របស់ម៉ង់ដែល

វិធីសាស្ត្រ៖ សង្ខេបច្បាប់ទី 1 និងច្បាប់ទី 2 តាមកម្មវិធីសិក្សាជីវវិទ្យាថ្នាក់ទី 12 របស់ក្រសួងអប់រំ យុវជន និងកីឡា។

1. ច្បាប់ទី 1៖ ច្បាប់ឯកសណ្ឋានភាពនៃកូនកាត់ជំនាន់ទី 1 (F1)
   - ខ្លឹមសារ៖ កាលណាគេបង្កាត់ពូជសុទ្ធពីរដែលមានលក្ខណៈផ្ទុយគ្នា នោះកូនកាត់ជំនាន់ទី 1 (F1) ទាំងអស់មានលក្ខណៈដូចគ្នាទាំងស្រុង (ឯកសណ្ឋាន) ដោយបង្ហាញតែលក្ខណៈលេចប៉ុណ្ណោះ រីឯលក្ខណៈបន្ទាប់ត្រូវកំបាំង។

2. ច្បាប់ទី 2៖ ច្បាប់បំបែកនៃគូកត្តា (ឬភាពឯករាជ្យនៃកត្តា) ក្នុងជំនាន់ទី 2 (F2)
   - ខ្លឹមសារ៖ នៅពេលកូនកាត់ F1 បង្កាត់គ្នានៅជំនាន់ F2 គូកត្តាកំណត់លក្ខណៈនីមួយៗត្រូវបំបែកចេញពីគ្នាយ៉ាងឯករាជ្យចូលទៅក្នុងហ្គាម៉ែតខុសៗគ្នា។
   - សមាមាត្រម៉ូណូអ៊ីប្រ៊ីឌីស F2៖ 3 ធ្លាយលេច : 1 ធ្លាយបន្ទាប់ (សមាមាត្រសេណូទីប 1:2:1)។
   - សមាមាត្រឌីអ៊ីប្រ៊ីឌីស F2៖ 9 : 3 : 3 : 1។

ចម្លើយ៖ ច្បាប់ទាំង 2 របស់ម៉ង់ដែលគឺ៖ ច្បាប់ទី 1 ឯកសណ្ឋានភាពនៃកូនកាត់ F1 និង ច្បាប់ទី 2 បំបែកនៃគូកត្តាក្នុងជំនាន់ F2។

គន្លឹះប្រឡង៖ បើប្រឡងសួរសមាមាត្រ ចងចាំថាការបង្កាត់ 1 គូលក្ខណៈ (Monohybrid) ជំនាន់ F2 តែងតែចេញ 3:1 រីឯ 2 គូលក្ខណៈ (Dihybrid) ចេញ 9:3:3:1!`,
  },

  // 9. How to get Grade A in Bac II
  {
    patterns: [
      "how to get an a in bac2",
      "how to get an a in bac 2",
      "how to get grade a in bac2",
      "how to get grade a",
      "get an a in bac2",
      "get grade a in bac2",
      "ធ្វើដូចម្តេចដើម្បីបាននិទ្ទេស a",
      "ធ្វើម៉េចបាននិទ្ទេស a",
      "គន្លឹះប្រឡងបាននិទ្ទេស a",
      "វិធីសាស្ត្រប្រឡងបាននិទ្ទេស a",
      "ចង់បាននិទ្ទេស a",
    ],
    answer: `ដើម្បីទទួលបាននិទ្ទេស A ក្នុងការប្រឡងបាក់ឌុប (Bac II) នេះជាផែនការយុទ្ធសាស្ត្រជាក់ស្តែងចំនួន 4 ចំណុចដែលសិស្សនិទ្ទេស A តែងតែអនុវត្ត៖

1. ក្តាប់ឱ្យបានពិន្ទុអតិបរិមាលើមុខវិជ្ជាមេគុណខ្ពស់
   - សម្រាប់ថ្នាក់វិទ្យាសាស្ត្រ៖ គណិតវិទ្យា (មេគុណ 2 ឬពិន្ទុ 125) ជីវវិទ្យា (75 ពិន្ទុ) រូបវិទ្យា (75 ពិន្ទុ) និងគីមីវិទ្យា (75 ពិន្ទុ)។ មុខវិជ្ជាទាំង 4 នេះតំណាងឱ្យជាង 70% នៃពិន្ទុសរុប។

2. រូបមន្តគ្រប់គ្រងពេលវេលា 2+2 ប្រចាំថ្ងៃ
   - 2 ម៉ោងទី 1 (ទ្រឹស្តី និងរូបមន្ត)៖ រំលឹកមេរៀនគ្រឹះ មើលរូបមន្ត និងសង្ខេបចំណុចសំខាន់ៗ។
   - 2 ម៉ោងទី 2 (អនុវត្តជាក់ស្តែង)៖ ធ្វើលំហាត់វិញ្ញាសាចាស់ៗដោយកំណត់ម៉ោងដូចពេលប្រឡងមែនទែន (Time-boxed practice)។

3. ហាត់ធ្វើវិញ្ញាសាបាក់ឌុបឆ្នាំចាស់ៗ (Past Papers)
   - ហាត់ធ្វើវិញ្ញាសាពីឆ្នាំ 2014 ដល់ 2024 យ៉ាងតិច 2 ទៅ 3 ដងក្នុងមួយមុខ។ វិញ្ញាសាបាក់ឌុបតែងតែចេញទម្រង់លំហាត់ដដែលៗប្រហែល 80% (ដូចជា លីមីត អាំងតេក្រាល កុំផ្លិច ធរណីមាត្រក្នុងលំហ អរម៉ូន និងការប្រៀបធៀបក្នុងជីវវិទ្យា)។

4. គន្លឹះស៊ីពិន្ទុរបស់គណៈកម្មការកែ (MoEYS Rubric)
   - សរសេរឱ្យមានរបៀប៖ ទិន្នន័យ (Given) $\\to$ វិធីសាស្ត្រ/រូបមន្ត (Formula) $\\to$ ដំណាក់កាលគណនា (Steps) $\\to$ ចម្លើយ និងខ្នាត (Final Answer with Units)។
   - កុំរំលងជំហាន៖ គណៈកម្មការកែចែកពិន្ទុតាមដំណាក់កាល ដូច្នេះការសរសេររូបមន្តត្រឹមត្រូវតែងតែទទួលបានពិន្ទុ ទោះបីជាការគណនាលេខចុងក្រោយខុសក៏ដោយ។

គន្លឹះលើកទឹកចិត្តពី KruAI៖ «ភាពជោគជ័យមិនមែនកើតឡើងដោយចៃដន្យទេ តែជាលទ្ធផលនៃការអនុវត្តជាប្រចាំថ្ងៃ!» តស៊ូឡើង អ្នកប្រាកដជាអាចធ្វើបាន! 💪`,
  },
];

/**
 * Words a question may carry AROUND a curated pattern and still be that
 * question: "what are the parts of the brain?", "សូមពន្យល់ … មានអ្វីខ្លះ".
 *
 * Matching used to be a bare `includes`, so a pattern matched any question that
 * merely CONTAINED it: "which part of the brain stem controls breathing" got the
 * canned "parts of the brain" answer, and "what errors happen in dna
 * replication" got the canned replication walkthrough. Now everything outside
 * the pattern has to be filler, so a question that adds any real content goes
 * to the model.
 *
 * English is checked per whole word. Khmer has no spaces, so a Khmer filler is
 * stripped as a substring (longest first) and the token must be empty after.
 */
const EN_FILLER = new Set([
  "what", "are", "is", "the", "a", "an", "of", "please", "can", "you", "could",
  "explain", "tell", "me", "about", "describe", "list", "give", "show", "how",
  "do", "does", "i", "kruai", "hi", "hello", "between", "difference",
  "differences", "in", "compare", "vs",
]);
const KM_FILLER = [
  "យ៉ាងដូចម្តេច", "ដូចម្តេច", "មានអ្វីខ្លះ", "អ្វីខ្លះ", "ជាអ្វី", "ពន្យល់",
  "រៀបរាប់", "បង្ហាញ", "ប្រាប់", "ខ្ញុំ", "ជួយ", "សូម", "តើ", "មាន", "បាទ", "ចាស",
  "ប្រៀបធៀប", "ភាពខុសគ្នា", "រវាង",
].sort((a, b) => b.length - a.length);

function isFiller(token: string): boolean {
  if (EN_FILLER.has(token)) return true;
  let rest = token;
  for (const f of KM_FILLER) rest = rest.split(f).join("");
  return rest.length === 0;
}

function matchesPattern(query: string, pattern: string): boolean {
  if (query === pattern) return true;
  const at = query.indexOf(pattern);
  if (at < 0) return false;
  const leftover = query.slice(0, at) + " " + query.slice(at + pattern.length);
  return leftover.split(" ").filter(Boolean).every(isFiller);
}

/**
 * A curated answer for this question, or null.
 *
 * FIRST TURN ONLY. A curated answer is a standalone explanation; mid-conversation
 * the same words usually mean something narrower ("compare mitosis and meiosis"
 * after three turns about crossing-over), and replacing a follow-up with a
 * canned reply ignores everything the student already said.
 *
 * There is deliberately NO cache of model answers any more. There was one, keyed
 * on the question text alone, and it was a privacy leak: every reply is written
 * with that student's name, weak subjects and exam average in the system prompt
 * (see buildSystemPrompt), plus their history and the screen they had open — so
 * the next student to type the same words received a reply addressed to someone
 * else, and a follow-up like "why?" was replayed into unrelated conversations.
 * Personalised output cannot be shared by keying on the input alone. Don't bring
 * it back without keying on everything that went into the prompt, at which point
 * it would never hit.
 */
export function getCachedAnswer(
  userText: string,
  isFirstTurn: boolean
): string | null {
  if (!isFirstTurn || !userText || typeof userText !== "string") return null;
  const normalized = normalizeQuery(userText);
  if (!normalized || normalized.length < 3) return null;

  for (const entry of CURRICULUM_ENTRIES) {
    for (const pat of entry.patterns) {
      const normPat = normalizeQuery(pat);
      if (normPat && matchesPattern(normalized, normPat)) return entry.answer;
    }
  }
  return null;
}

/**
 * Creates a simulated stream from cached text with natural chunk pacing.
 * Preserves the exact same streaming UX on the client while consuming 0 API tokens.
 */
export function createCachedStreamResponse(text: string): Response {
  const encoder = new TextEncoder();
  // Split into natural word/phrase chunks
  const words = text.split(/(?<=[ \n])/);

  const stream = new ReadableStream({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(word));
        // Subtle micro-delay (10ms) to give a fluid streaming experience
        await new Promise((r) => setTimeout(r, 12));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-KruAI-Source": "cache",
    },
  });
}
