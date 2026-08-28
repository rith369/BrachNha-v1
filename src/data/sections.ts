import type { SectionContent } from "../types/index.js";

/**
 * Authored SECTION content, keyed by the section id that
 * features/lessons/sessions.ts generates ("biology-3-1-1").
 *
 * **Nearly empty, and that is the normal state** — the same shape as
 * PAST_PAPER_QUESTIONS in data/past-papers.ts. A section on the path is playable
 * if and only if it has an entry here, so a node can never claim content the app
 * does not have. Adding one entry turns one node on; no other file changes.
 *
 * KHMER ONLY. See the note on SectionContent in types/index.ts.
 */
export const SECTION_CONTENT: Record<string, SectionContent> = {
  "biology-3-1-1": {
    title: "សេចក្ដីផ្ដើម",

    lesson: {
      intro: `តើអ្វីទៅជា «តម្រូវប្រសាទ»? វាគឺជារបៀបដែលប្រព័ន្ធប្រសាទ (រួមមាន ខួរក្បាល ខួរឆ្អឹងខ្នង និងសរសៃប្រសាទ) ដើរតួជាមេបញ្ជាការ ចាំសម្របសម្រួល និងបញ្ជាឱ្យសរីរាង្គផ្សេងៗក្នុងខ្លួនធ្វើការសហការគ្នាបានល្អ។ ការធ្វើបែបនេះគឺដើម្បីឆ្លើយតបទៅនឹងរំញោច (ការប្រែប្រួលជុំវិញខ្លួន) និងដើម្បីរក្សាលំនឹងក្នុងរាងកាយឱ្យមានសុវត្ថិភាព (Homeostasis)។

ក្រុមការងារទាំង ៤ ក្នុងការឆ្លើយតប៖ ដើម្បីអាចដឹង និងឆ្លើយតបទៅនឹងរំញោចបានលឿន សារពាង្គកាយ (ជាពិសេសសត្វថ្នាក់ខ្ពស់ និងមនុស្ស) ត្រូវការការសហការគ្នាយ៉ាងជិតស្និទ្ធរវាងប្រព័ន្ធទាំង ៤ គឺ៖`,
      items: [
        {
          label: "សរីរាង្គវិញ្ញាណ",
          body: "ភ្នែក ត្រចៀក ច្រមុះ អណ្តាត និងស្បែក (ចាំទទួលព័ត៌មានពីរំញោច)។",
        },
        {
          label: "ប្រព័ន្ធប្រសាទ",
          body: "ខួរក្បាល និងខួរឆ្អឹងខ្នង (ចាំវិភាគព័ត៌មាន និងចេញបញ្ជា)។",
        },
        {
          label: "ប្រព័ន្ធអង់ដូគ្រីន (ប្រព័ន្ធអរម៉ូន)",
          body: "បញ្ចេញសារធាតុគីមីជួយសម្របសម្រួលការងារយឺតៗក្នុងខ្លួន។",
        },
        {
          label: "ប្រព័ន្ធគ្រោងឆ្អឹង និងសាច់ដុំ",
          // Source ended this bullet in a CJK "。" rather than a Khmer "។" —
          // a typo in the paste, normalised here.
          body: "ធ្វើចលនាឆ្លើយតបទៅតាមការបញ្ជា។",
        },
      ],
    },

    examples: {
      items: [
        {
          label: "ឧទាហរណ៍ក្នុងសៀវភៅសិក្សា (ការជិះទោងយោល)",
          body: "នៅពេលយើងកំពុងលេងជិះទោងយោលយ៉ាងខ្លាំង ភ្នែករបស់យើងត្រូវសម្លឹងទៅមុខ ដៃត្រូវចាប់ខ្សែទោងឱ្យជាប់ ហើយខ្លួនប្រាណត្រូវបង្កង់ឱ្យត្រង់ដើម្បីរក្សាលំនឹងកុំឱ្យធ្លាក់។ រាល់សកម្មភាពសម្របសម្រួលសាច់ដុំ និងការដឹងអារម្មណ៍ទាំងអស់នេះ កើតឡើងទៅបានដោយសារកោសិកាប្រសាទបញ្ជូនសញ្ញាទៅពាសពេញរាងកាយ។",
        },
        {
          label: "ឧទាហរណ៍ក្នុងជីវភាពរស់នៅ",
          body: "នៅពេលដៃយើងច្រឡំប៉ះចំរបស់ក្តៅខ្លាំង (របស់ក្តៅ = រំញោច) ស្បែកបញ្ជូនសញ្ញាទៅខួរក្បាលភ្លាម ហើយខួរក្បាលបញ្ជាមកសាច់ដុំដៃឱ្យកន្ត្រាក់ទាញដៃចេញភ្លាមៗ (ដកដៃចេញ = ការឆ្លើយតប) ដើម្បីការពារកុំឱ្យរលាកស្បែក។",
        },
      ],
    },

    notes: {
      items: [
        {
          label: "រំញោច (Stimulus) vs ការឆ្លើយតប (Response)",
          body: "",
          items: [
            "រំញោច៖ គឺជារាល់ការប្រែប្រួលនានានៅក្នុងខ្លួន ឬក្រៅខ្លួន (ដូចជា កម្តៅ ពន្លឺ សំឡេង សារធាតុគីមី)។",
            "ការឆ្លើយតប៖ គឺជារបៀបដែលរាងកាយប្រតិកម្មតបតទៅនឹងរំញោចនោះវិញ។",
          ],
        },
        {
          label: "សត្វអេប៉ុង (Sponges)",
          body: "ជាសត្វឥតឆ្អឹងកងតែមួយគត់ដែល គ្មានប្រព័ន្ធប្រសាទ និងគ្មានកោសិកាប្រសាទសោះ។",
        },
      ],
    },

    mistakes: [
      {
        wrong: "ប្រព័ន្ធប្រសាទធ្វើការតែម្នាក់ឯងក្នុងការសម្របសម្រួលរាងកាយ។",
        right:
          "ប្រព័ន្ធប្រសាទមិនអាចធ្វើការតែម្នាក់ឯងបានទេ វាត្រូវតែសហការគ្នាយ៉ាងជិតស្និទ្ធជាមួយ ប្រព័ន្ធអង់ដូគ្រីន (ប្រព័ន្ធអរម៉ូន) ទើបអាចសម្របសម្រួលរាងកាយទាំងមូលបានល្អ។",
      },
      {
        wrong: "សារពាង្គកាយមានជីវិតទាំងអស់សុទ្ធតែមានប្រព័ន្ធប្រសាទ។",
        right:
          "សត្វឯកកោសិកា (ដូចជា ប៉ារ៉ាមេស៊ី អាមីប) និងសត្វអេប៉ុង គ្មានប្រព័ន្ធប្រសាទពិតប្រាកដ ឬគ្មានកោសិកាប្រសាទឡើយ ប៉ុន្តែពួកវានៅតែអាចឆ្លើយតបនឹងរំញោចសាមញ្ញៗបាន។",
      },
    ],

    // quiz: supplied later. The step is built and skipped while this is absent.
  },
};

/** The content for a section id, or null when nothing is written for it yet. */
export function sectionContentFor(id: string): SectionContent | null {
  return SECTION_CONTENT[id] ?? null;
}

/** Whether a section has content behind it — what makes its path node playable. */
export function hasSectionContent(id: string): boolean {
  return id in SECTION_CONTENT;
}
