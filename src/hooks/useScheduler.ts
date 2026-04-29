import { useMemo } from 'react';
import { isToday, isBefore, startOfDay } from 'date-fns';
import { useAppStore } from '@/store/useAppStore';
import type { Concept } from '@/domain/types';

const MAX_NEW_PER_DAY  = 3;
const MAX_DUE_SESSIONS = 5;

export function useScheduler() {
  const { areas, concepts, flashcards, activeAreaId } = useAppStore();

  const relevantConcepts = useMemo<Concept[]>(() => {
    const activeAreas = areas
      .filter((a) => a.isActive)
      .filter((a) => !activeAreaId || a.id === activeAreaId);
    const ids = new Set(activeAreas.map((a) => a.id));
    return concepts.filter((c) => ids.has(c.areaId));
  }, [areas, concepts, activeAreaId]);

  // New concept pool — no scheduling, first N unstarted concepts
  const newConceptPool = useMemo<Concept[]>(() => {
    return relevantConcepts
      .filter((c) => c.status === 'new')
      .slice(0, MAX_NEW_PER_DAY);
  }, [relevantConcepts]);

  // Due concept study sessions — already started, nextSessionAt <= today
  const dueStudySessions = useMemo<Concept[]>(() => {
    const today = startOfDay(new Date());
    return relevantConcepts
      .filter(
        (c) =>
          c.lastStudiedAt !== null &&
          c.nextSessionAt !== null &&
          (isToday(c.nextSessionAt) || isBefore(c.nextSessionAt, today)) &&
          (c.status === 'learning' || c.status === 'reviewing')
      )
      .slice(0, MAX_DUE_SESSIONS);
  }, [relevantConcepts]);

  // Due flashcard reviews
  const dueReviewsToday = useMemo(() => {
    const now = new Date();
    return flashcards.filter(
      (c) => c.nextReviewAt <= now && (!activeAreaId || c.areaId === activeAreaId)
    );
  }, [flashcards, activeAreaId]);

  return { newConceptPool, dueStudySessions, dueReviewsToday };
}
