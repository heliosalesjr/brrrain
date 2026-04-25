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
      title: 'Sessão de resgate',
      description: `Você ficou ${gapDays} dias sem estudar. Faça uma sessão de resgate com retrieval ativo para reconsolidar o material.`,
      recommendedDuration: '20–30 min',
      areasToFocus: -1,
    };
  }

  if (gapDays <= 14) {
    return {
      gapDays,
      type: 'quick-review',
      title: 'Revisão rápida por área',
      description: `${gapDays} dias de pausa. Faça uma revisão rápida de 15 minutos por área para reativar o material antes de avançar.`,
      recommendedDuration: '15 min/área',
      areasToFocus: -1,
    };
  }

  return {
    gapDays,
    type: 'partial-restart',
    title: 'Reinício parcial recomendado',
    description: `${gapDays} dias de pausa. Reduza o foco para 1 área por enquanto e reconstrua o ritmo gradualmente antes de retomar todas as áreas.`,
    recommendedDuration: '30–45 min',
    areasToFocus: 1,
  };
}
