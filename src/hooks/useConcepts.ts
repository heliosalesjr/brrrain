import { useEffect } from 'react';
import {
  onSnapshot, addDoc, updateDoc, deleteDoc, doc,
  query, where, writeBatch,
} from 'firebase/firestore';
import { db, isConfigured } from '@/firebase/config';
import { conceptsCollection } from '@/firebase/collections';
import { conceptConverter } from '@/firebase/converters';
import { useAppStore } from '@/store/useAppStore';
import type { Concept, ConceptStatus } from '@/domain/types';
import { addDays } from 'date-fns';

function nextSessionForStatus(status: ConceptStatus): Date | null {
  if (status === 'mastered')  return addDays(new Date(), 30);
  if (status === 'reviewing') return addDays(new Date(), 3);
  if (status === 'learning')  return addDays(new Date(), 1);
  return null;
}

export function useConcepts(areaId?: string) {
  const { concepts, setConcepts, addConcept, updateConcept, removeConcept, setError } =
    useAppStore();

  useEffect(() => {
    const col = conceptsCollection();
    if (!col) return;

    const q = areaId ? query(col, where('areaId', '==', areaId)) : col;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => d.data());
        if (areaId) {
          const others = concepts.filter((c) => c.areaId !== areaId);
          setConcepts([...others, ...data]);
        } else {
          setConcepts(data);
        }
      },
      (err) => setError(err.message)
    );

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaId]);

  const createConcept = async (input: {
    areaId: string;
    title: string;
    description?: string;
    status?: ConceptStatus;
  }) => {
    const col = conceptsCollection();
    const status = input.status ?? 'new';
    // Sort new items after existing ones in the same area+status
    const maxOrder = concepts
      .filter((c) => c.areaId === input.areaId && c.status === status)
      .reduce((max, c) => Math.max(max, c.sortOrder), -1);

    const concept: Concept = {
      id: `local-${Date.now()}`,
      areaId: input.areaId,
      title: input.title,
      description: input.description ?? '',
      status,
      lastStudiedAt: null,
      nextSessionAt: nextSessionForStatus(status),
      sortOrder: maxOrder + 1,
    };

    if (!col) {
      addConcept(concept);
      return concept;
    }

    const docRef = await addDoc(col, concept);
    return { ...concept, id: docRef.id };
  };

  const markStudied = async (id: string) => {
    const now = new Date();
    const partial: Partial<Concept> = {
      lastStudiedAt: now,
      nextSessionAt: addDays(now, 3),
      status: 'learning' as ConceptStatus,
    };

    if (!isConfigured || !db) {
      updateConcept(id, partial);
      return;
    }
    await updateDoc(doc(db, 'concepts', id).withConverter(conceptConverter), partial);
  };

  const deleteConcept = async (id: string) => {
    if (!isConfigured || !db) {
      removeConcept(id);
      return;
    }
    await deleteDoc(doc(db, 'concepts', id));
  };

  const updateConceptStatus = async (id: string, status: ConceptStatus, sortOrder?: number) => {
    const partial: Partial<Concept> = {
      status,
      nextSessionAt: nextSessionForStatus(status),
      ...(sortOrder !== undefined ? { sortOrder } : {}),
    };
    if (!isConfigured || !db) {
      updateConcept(id, partial);
      return;
    }
    await updateDoc(doc(db, 'concepts', id).withConverter(conceptConverter), partial);
    updateConcept(id, partial);
  };

  // Persist a full column's new order after a drag operation
  const reorderConcepts = async (updates: { id: string; sortOrder: number; status?: ConceptStatus }[]) => {
    // Optimistically update store first for instant feedback
    for (const u of updates) {
      updateConcept(u.id, { sortOrder: u.sortOrder, ...(u.status ? { status: u.status, nextSessionAt: nextSessionForStatus(u.status) } : {}) });
    }

    if (!isConfigured || !db) return;

    const batch = writeBatch(db);
    for (const u of updates) {
      const ref = doc(db, 'concepts', u.id).withConverter(conceptConverter);
      batch.update(ref, {
        sortOrder: u.sortOrder,
        ...(u.status ? { status: u.status, nextSessionAt: nextSessionForStatus(u.status) } : {}),
      });
    }
    await batch.commit();
  };

  const filteredConcepts = areaId
    ? concepts.filter((c) => c.areaId === areaId)
    : concepts;

  return { concepts: filteredConcepts, createConcept, markStudied, deleteConcept, updateConceptStatus, reorderConcepts };
}
