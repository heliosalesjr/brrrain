import { useEffect } from 'react';
import { onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db, isConfigured } from '@/firebase/config';
import { flashcardsCollection } from '@/firebase/collections';
import { flashcardConverter } from '@/firebase/converters';
import { useAppStore } from '@/store/useAppStore';
import type { Flashcard, FlashcardMediaType, ReviewQuality } from '@/domain/types';
import { newCardDefaults, scheduleNextReview, getDueCards } from '@/domain/scheduler';

export function useFlashcards(conceptId?: string) {
  const { flashcards, setFlashcards, addFlashcard, updateFlashcard } = useAppStore();

  useEffect(() => {
    const col = flashcardsCollection();
    if (!col) return;

    const unsubscribe = onSnapshot(col, (snapshot) => {
      setFlashcards(snapshot.docs.map((d) => d.data()));
    });

    return unsubscribe;
  }, [setFlashcards]);

  const createFlashcard = async (input: {
    conceptId: string;
    areaId: string;
    front: string;
    back: string;
    mediaType?: FlashcardMediaType;
  }) => {
    const col = flashcardsCollection();
    const defaults = newCardDefaults();

    const card: Flashcard = {
      id: `local-${Date.now()}`,
      mediaType: 'text',
      ...input,
      ...defaults,
    };

    if (!col) {
      addFlashcard(card);
      return card;
    }

    const docRef = await addDoc(col, card);
    return { ...card, id: docRef.id };
  };

  const reviewCard = async (cardId: string, quality: ReviewQuality) => {
    const card = flashcards.find((c) => c.id === cardId);
    if (!card) return;

    const result = scheduleNextReview(card, quality);
    const partial: Partial<Flashcard> = {
      nextReviewAt: result.nextReviewAt,
      intervalDays: result.intervalDays,
      easeFactor: result.easeFactor,
      repetitions: result.repetitions,
    };

    if (!isConfigured || !db) {
      updateFlashcard(cardId, partial);
      return;
    }

    await updateDoc(
      doc(db, 'flashcards', cardId).withConverter(flashcardConverter),
      partial
    );
  };

  const allCards = conceptId
    ? flashcards.filter((c) => c.conceptId === conceptId)
    : flashcards;

  const dueCards = getDueCards(allCards);

  return { flashcards: allCards, dueCards, createFlashcard, reviewCard };
}
