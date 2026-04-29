export type AreaColor =
  | 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow' | 'teal' | 'pink';

export type AreaIcon =
  | 'code' | 'book' | 'brain' | 'flask' | 'math' | 'language' | 'music' | 'art';

export interface Area {
  id: string;
  name: string;
  color: AreaColor;
  icon: AreaIcon;
  createdAt: Date;
  isActive: boolean;
}

export type ConceptStatus = 'new' | 'learning' | 'reviewing' | 'mastered';

export interface Concept {
  id: string;
  areaId: string;
  title: string;
  description: string;
  status: ConceptStatus;
  lastStudiedAt: Date | null;
  nextSessionAt: Date | null;
  sortOrder: number;
}

export type SessionType = 'initial' | 'practice' | 'review' | 'rescue';

export interface Session {
  id: string;
  areaId: string;
  conceptId: string;
  date: Date;
  type: SessionType;
  phasesCompleted: number[];
  notes: string;
  flashcardsCreated: number;
  duration: number; // in minutes
}

export type FlashcardMediaType = 'text' | 'image' | 'code';

export interface Flashcard {
  id: string;
  conceptId: string;
  areaId: string;
  front: string;
  back: string;
  mediaType: FlashcardMediaType;
  nextReviewAt: Date;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
}

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

export interface ReviewEvent {
  flashcardId: string;
  reviewedAt: Date;
  quality: ReviewQuality;
  responseTime: number; // in milliseconds
}

export type LinkMediaType = 'video' | 'article' | 'pdf' | 'book' | 'audio' | 'course' | 'website';

export interface StudyLink {
  id: string;
  areaId: string;
  title: string;
  url: string;
  mediaType: LinkMediaType;
}

// Computed types for UI
export interface DailyAgendaItem {
  areaId: string;
  areaName: string;
  areaColor: AreaColor;
  conceptId: string;
  conceptTitle: string;
  sessionType: SessionType;
  priority: number; // 1 = highest
  dueDate: Date;
}

export interface RescueProtocol {
  gapDays: number;
  type: 'normal' | 'rescue' | 'quick-review' | 'partial-restart';
  title: string;
  description: string;
  recommendedDuration: string;
  areasToFocus: number; // -1 means all
}
