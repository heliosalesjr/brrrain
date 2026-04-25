import { addDays } from 'date-fns';
import type { Flashcard, ReviewQuality } from './types';

// Initial steps in days
const INITIAL_STEPS = [1, 3, 7, 14, 30, 90];

export interface ScheduleResult {
  nextReviewAt: Date;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
}

/**
 * Computes next review date after a review event.
 * Uses fixed steps for first reviews, then SM-2-like formula.
 */
export function scheduleNextReview(
  card: Flashcard,
  quality: ReviewQuality,
  reviewedAt: Date = new Date()
): ScheduleResult {
  const { repetitions, easeFactor, intervalDays } = card;

  // Failed recall: reset to step 0
  if (quality < 3) {
    return {
      nextReviewAt: addDays(reviewedAt, INITIAL_STEPS[0]),
      intervalDays: INITIAL_STEPS[0],
      easeFactor: Math.max(1.3, easeFactor - 0.2),
      repetitions: 0,
    };
  }

  // Still in initial steps
  if (repetitions < INITIAL_STEPS.length) {
    const stepDays = INITIAL_STEPS[repetitions];
    return {
      nextReviewAt: addDays(reviewedAt, stepDays),
      intervalDays: stepDays,
      easeFactor,
      repetitions: repetitions + 1,
    };
  }

  // Beyond initial steps: SM-2-like
  const newEaseFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );
  const newInterval = Math.round(intervalDays * newEaseFactor);

  return {
    nextReviewAt: addDays(reviewedAt, newInterval),
    intervalDays: newInterval,
    easeFactor: newEaseFactor,
    repetitions: repetitions + 1,
  };
}

/**
 * Returns default values for a new flashcard.
 */
export function newCardDefaults(createdAt: Date = new Date()): Pick<
  Flashcard,
  'nextReviewAt' | 'intervalDays' | 'easeFactor' | 'repetitions'
> {
  return {
    nextReviewAt: addDays(createdAt, INITIAL_STEPS[0]),
    intervalDays: INITIAL_STEPS[0],
    easeFactor: 2.5,
    repetitions: 0,
  };
}

/**
 * Returns flashcards due today or overdue.
 */
export function getDueCards(cards: Flashcard[], now: Date = new Date()): Flashcard[] {
  return cards
    .filter(c => c.nextReviewAt <= now)
    .sort((a, b) => a.nextReviewAt.getTime() - b.nextReviewAt.getTime());
}
