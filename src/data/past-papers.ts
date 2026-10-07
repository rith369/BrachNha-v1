/**
 * REAL MoEYS Bac II past papers: the exam sessions the "វិញ្ញាសារឆ្នាំចាស់" tab
 * on /exam/subjects offers.
 *
 * THE PAPERS THEMSELVES LIVE IN THE DATABASE since step B of
 * docs/plans/sections-and-papers-in-database.md (kind `paper`, key
 * "{year}-{subjectId}", e.g. "2025-english"). The team fixes them on
 * /admin/content and only the owner publishes; a new paper arrives as a file
 * prepared from photographs (content/README.md). Publishing one turns its card
 * on, with no code change: the card list is DERIVED from the subject catalog,
 * and whether a card has a paper behind it comes from the manifest
 * (features/exam/papers.ts, lib/content.ts). So a card's state can never
 * disagree with the content it describes.
 *
 * What stays here is STRUCTURE: which sessions are offered. This file imports
 * nothing from features/ — data/ sits at the bottom of the graph.
 */

/**
 * The exam sessions offered, newest first. Order IS the chip order.
 *
 * A plain number because Bac II is one sitting per year today. If a year ever
 * needs two, this becomes `{ year: number; label: string }[]` and only this file
 * plus papersForYear()'s signature change — the chips, the heading and every
 * card derive from it.
 */
export const PAST_PAPER_YEARS: readonly number[] = [2025, 2024, 2023, 2022, 2021];
