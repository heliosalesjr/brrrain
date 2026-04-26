import { addDoc } from 'firebase/firestore';
import { sessionsCollection } from '@/firebase/collections';
import { useAppStore } from '@/store/useAppStore';
import type { Session, SessionType } from '@/domain/types';

export function useSessions() {
  const { addSession } = useAppStore();

  const saveSession = async (input: {
    areaId: string;
    conceptId: string;
    type: SessionType;
    phasesCompleted: number[];
    notes: string;
    flashcardsCreated: number;
    durationMinutes: number;
  }) => {
    const session: Session = {
      id: `local-${Date.now()}`,
      areaId: input.areaId,
      conceptId: input.conceptId,
      date: new Date(),
      type: input.type,
      phasesCompleted: input.phasesCompleted,
      notes: input.notes,
      flashcardsCreated: input.flashcardsCreated,
      duration: input.durationMinutes,
    };

    const col = sessionsCollection();
    if (col) {
      const ref = await addDoc(col, session);
      session.id = ref.id;
    }

    addSession(session);
    return session;
  };

  return { saveSession };
}
