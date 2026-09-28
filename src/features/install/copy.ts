/**
 * Copy for the "add to home screen" pop-up. Bilingual, following the store's
 * `lang` like the rest of the app's chrome — this is not curriculum.
 *
 * The iPhone steps keep Apple's own menu names in English ("Share", "Add to
 * Home Screen"): iOS has no Khmer interface, so that is literally what the
 * student will see on their screen.
 */
const en = {
  openTitle: "Put BrachNha on your home screen",
  openBody: "Open it in one tap, full screen, like any other app. No app store needed.",
  lessonTitle: "Nice work, lesson done!",
  lessonBody: "Add BrachNha to your home screen so your next lesson is one tap away.",
  install: "Install",
  notNow: "Not now",
  gotIt: "Got it",
  iosStep1: "Tap the Share button",
  iosStep1Hint: "in your browser's toolbar",
  iosStep2: "Choose “Add to Home Screen”",
  dialogLabel: "Install BrachNha",
};

const km: typeof en = {
  openTitle: "ដាក់ BrachNha នៅលើអេក្រង់ដើម",
  openBody: "ចុចតែម្តងក៏បើកបាន ពេញអេក្រង់ ដូចកម្មវិធីធម្មតា។ មិនចាំបាច់ទាញយកពីហាងកម្មវិធីទេ។",
  lessonTitle: "ពូកែណាស់។ រៀនចប់មួយមេរៀនហើយ!",
  lessonBody: "ដាក់ BrachNha នៅលើអេក្រង់ដើម ដើម្បីចុចតែម្តងក៏រៀនមេរៀនបន្ទាប់បាន។",
  install: "ដំឡើង",
  notNow: "ពេលក្រោយ",
  gotIt: "យល់ហើយ",
  iosStep1: "ចុចប៊ូតុង Share",
  iosStep1Hint: "នៅលើរបារឧបករណ៍របស់កម្មវិធីរុករក",
  iosStep2: "ជ្រើសរើស «Add to Home Screen»",
  dialogLabel: "ដំឡើង BrachNha",
};

export const INSTALL_COPY = { en, km };
