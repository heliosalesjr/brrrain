import { useEffect } from 'react';
import { onSnapshot, addDoc } from 'firebase/firestore';
import { sessionsCollection } from '@/firebase/collections';
import { useAppStore } from '@/store/useAppStore';
import type { Session, SessionType } from '@/domain/types';

export function useSessions() {
  const { addSession } = useAppStore();

  useEffect(() => {
    const col = sessionsCollection();
    if (!col) return;
    // Use getState() inside the callback so we don't depend on the extracted
    // action reference, which could vary across renders in Zustand v5.
    return onSnapshot(col, (snapshot) => {
      useAppStore.getState().setSessions(snapshot.docs.map((d) => d.data()));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
