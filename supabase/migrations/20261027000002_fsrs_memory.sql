-- ═════════════════════════════════════════════════════════════════════════════
-- FSRS's memory model on card_reviews (27 Oct 2026)
--
-- The flashcard scheduler is FSRS now (src/utils/fsrs.ts). Besides the due date
-- it keeps two numbers per card:
--   stability   days until the chance of remembering falls to 90%
--   difficulty  1 (easy) to 10 (hard)
-- They are what the "you remember about N% today" line is computed from, so
-- they have to follow the student to a new phone like the rest of the card.
--
-- NULLABLE: rows written before FSRS have neither, and the app rebuilds them
-- from the review log the first time a flashcard screen opens. Both or neither,
-- never one: the app always writes them together.
--
-- Order with the app: the app sends both columns on every card it pushes. If
-- the app ships first, that push fails quietly until this is applied, the
-- device keeps everything, and the next push after it uploads. Nothing is lost
-- either way.
-- ═════════════════════════════════════════════════════════════════════════════

begin;

alter table public.card_reviews
  add column if not exists stability  double precision,
  add column if not exists difficulty double precision;

alter table public.card_reviews drop constraint if exists card_reviews_fsrs_range;
alter table public.card_reviews add constraint card_reviews_fsrs_range check (
  (stability is null) = (difficulty is null)
  and (stability  is null or (stability > 0 and stability <= 1000000))
  and (difficulty is null or difficulty between 1 and 10)
);

commit;
