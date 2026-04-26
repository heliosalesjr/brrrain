import { differenceInDays } from 'date-fns';
import type { RescueProtocol } from './types';

/**
 * Detects the gap since last activity and returns the appropriate rescue protocol.
 * @param lastActivityAt - Date of last study session (null if never studied)
 * @param now - Current date (defaults to today)
 */
export function getRescueProtocol(
  lastActivityAt: Date | null,
  now: Date = new Date()
): RescueProtocol | null {
  if (!lastActivityAt) return null;

  const gapDays = differenceInDays(now, lastActivityAt);

  if (gapDays <= 2) {
    // Normal return — no alert needed
    return null;
  }

  if (gapDays <= 5) {
    return {
      gapDays,
      type: 'rescue',
      title: 'Rescue session',
      description: `You have been away for ${gapDays} days. Do a rescue session with active retrieval to reconsolidate the material.`,
      recommendedDuration: '20–30 min',
      areasToFocus: -1,
    };
  }

  if (gapDays <= 14) {
    return {
      gapDays,
      type: 'quick-review',
      title: 'Quick review by area',
      description: `${gapDays} days away. Do a quick 15-minute review per area to reactivate the material before moving forward.`,
      recommendedDuration: '15 min/area',
      areasToFocus: -1,
    };
  }

  return {
    gapDays,
    type: 'partial-restart',
    title: 'Partial restart recommended',
    description: `${gapDays} days away. Reduce focus to 1 area for now and rebuild your rhythm gradually before resuming all areas.`,
    recommendedDuration: '30–45 min',
    areasToFocus: 1,
  };
}
