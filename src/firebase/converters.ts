import type {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from 'firebase/firestore';
import type { Area, Concept, Session, Flashcard } from '@/domain/types';

function toDate(value: Timestamp | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  return value.toDate();
}

function toDateRequired(value: Timestamp | Date | undefined): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  return value.toDate();
}

export const areaConverter: FirestoreDataConverter<Area> = {
  toFirestore(area: Area) {
    return {
      name: area.name,
      color: area.color,
      icon: area.icon,
      createdAt: area.createdAt,
      isActive: area.isActive,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Area {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name,
      color: data.color,
      icon: data.icon,
      createdAt: toDateRequired(data.createdAt),
      isActive: data.isActive ?? true,
    };
  },
};

export const conceptConverter: FirestoreDataConverter<Concept> = {
  toFirestore(concept: Concept) {
    return {
      areaId: concept.areaId,
      title: concept.title,
      description: concept.description,
      status: concept.status,
      lastStudiedAt: concept.lastStudiedAt,
      nextSessionAt: concept.nextSessionAt,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Concept {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      areaId: data.areaId,
      title: data.title,
      description: data.description ?? '',
      status: data.status ?? 'new',
      lastStudiedAt: toDate(data.lastStudiedAt),
      nextSessionAt: toDate(data.nextSessionAt),
    };
  },
};

export const sessionConverter: FirestoreDataConverter<Session> = {
  toFirestore(session: Session) {
    return {
      areaId: session.areaId,
      conceptId: session.conceptId,
      date: session.date,
      type: session.type,
      phasesCompleted: session.phasesCompleted,
      notes: session.notes,
      flashcardsCreated: session.flashcardsCreated,
      duration: session.duration,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Session {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      areaId: data.areaId,
      conceptId: data.conceptId,
      date: toDateRequired(data.date),
      type: data.type ?? 'initial',
      phasesCompleted: data.phasesCompleted ?? [],
      notes: data.notes ?? '',
      flashcardsCreated: data.flashcardsCreated ?? 0,
      duration: data.duration ?? 0,
    };
  },
};

export const flashcardConverter: FirestoreDataConverter<Flashcard> = {
  toFirestore(card: Flashcard) {
    return {
      conceptId: card.conceptId,
      areaId: card.areaId,
      front: card.front,
      back: card.back,
      mediaType: card.mediaType,
      nextReviewAt: card.nextReviewAt,
      intervalDays: card.intervalDays,
      easeFactor: card.easeFactor,
      repetitions: card.repetitions,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Flashcard {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      conceptId: data.conceptId,
      areaId: data.areaId,
      front: data.front,
      back: data.back,
      mediaType: data.mediaType ?? 'text',
      nextReviewAt: toDateRequired(data.nextReviewAt),
      intervalDays: data.intervalDays ?? 1,
      easeFactor: data.easeFactor ?? 2.5,
      repetitions: data.repetitions ?? 0,
    };
  },
};
