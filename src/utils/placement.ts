// The 3 "foundation" subjects: math, physics and chemistry. The survey asks
// about them differently (Weak / Not weak / Not sure) and the Study page's
// Foundation tab is built from them.
//
// The file keeps its name from the placement test that used to live here (a
// short quiz per foundation subject, run from the roadmap). It never had real
// questions behind it and was deleted on 7 Oct 2026, with the 10 old mock-exam
// questions it drew from.
export const FOUNDATION_SUBJECTS = ["math", "physics", "chemistry"] as const;
export type FoundationSubject = (typeof FOUNDATION_SUBJECTS)[number];
