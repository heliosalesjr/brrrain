import { useMemo } from 'react';
import { isToday, isBefore, startOfDay } from 'date-fns';
import { useAppStore } from '@/store/useAppStore';
import type { DailyAgendaItem } from '@/domain/types';
import { getDueCards } from '@/domain/scheduler';

export function useScheduler() {
  const { areas, concepts, flashcards, activeAreaId } = useAppStore();

  const agendaItems = useMemo<DailyAgendaItem[]>(() => {
    const now = new Date();
    const today = startOfDay(now);
    const items: DailyAgendaItem[] = [];

    const activeAreas = areas
      .filter((a) => a.isActive)
      .filter((a) => !activeAreaId || a.id === activeAreaId);

    for (const area of activeAreas) {
      const areaConcepts = concepts.filter((c) => c.areaId === area.id);
      const dueCards = getDueCards(flashcards.filter((f) => f.areaId === area.id));

      for (const concept of areaConcepts) {
        const { nextSessionAt, lastStudiedAt } = concept;

        if (!nextSessionAt) continue;

        const isDue =
          isToday(nextSessionAt) || isBefore(nextSessionAt, today);

        if (!isDue) continue;

        const overdueDays = isBefore(nextSessionAt, today)
          ? Math.floor((today.getTime() - startOfDay(nextSessionAt).getTime()) / 86400000)
          : 0;

        const sessionType =
          !lastStudiedAt
            ? 'initial'
            : dueCards.some((c) => c.conceptId === concept.id)
            ? 'review'
            : 'practice';

        items.push({
          areaId: area.id,
          areaName: area.name,
          areaColor: area.color,
          conceptId: concept.id,
          conceptTitle: concept.title,
          sessionType,
          priority: overdueDays > 7 ? 1 : overdueDays > 3 ? 2 : overdueDays > 0 ? 3 : 4,
          dueDate: nextSessionAt,
        });
      }
    }

    return items.sort((a, b) => a.priority - b.priority || a.dueDate.getTime() - b.dueDate.getTime());
  }, [areas, concepts, flashcards]);

  const dueReviewsToday = useMemo(() => {
    const now = new Date();
    return flashcards.filter(
      (c) => c.nextReviewAt <= now && (!activeAreaId || c.areaId === activeAreaId)
    );
  }, [flashcards, activeAreaId]);

  return { agendaItems, dueReviewsToday };
}
