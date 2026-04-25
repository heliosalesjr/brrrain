import { useEffect } from 'react';
import { onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db, isConfigured } from '@/firebase/config';
import { conceptsCollection } from '@/firebase/collections';
import { conceptConverter } from '@/firebase/converters';
import { useAppStore } from '@/store/useAppStore';
import type { Concept, ConceptStatus } from '@/domain/types';
import { addDays } from 'date-fns';

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
          // Merge: keep concepts from other areas, replace this area's
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
  }) => {
    const col = conceptsCollection();

    const concept: Concept = {
      id: `local-${Date.now()}`,
      areaId: input.areaId,
      title: input.title,
      description: input.description ?? '',
      status: 'new',
      lastStudiedAt: null,
      nextSessionAt: addDays(new Date(), 1),
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
    const next = addDays(now, 3);
    const partial: Partial<Concept> = {
      lastStudiedAt: now,
      nextSessionAt: next,
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

  const filteredConcepts = areaId
    ? concepts.filter((c) => c.areaId === areaId)
    : concepts;

  return { concepts: filteredConcepts, createConcept, markStudied, deleteConcept };
}
