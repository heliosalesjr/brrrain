import { create } from 'zustand';
import type { Area, Concept, Flashcard, Session } from '@/domain/types';

interface ActiveSession {
  sessionId: string;
  conceptId: string;
  areaId: string;
  startedAt: Date;
  currentPhase: number;
}

interface AppState {
  // Data
  areas: Area[];
  concepts: Concept[];
  flashcards: Flashcard[];
  sessions: Session[];

  // UI State
  loading: boolean;
  error: string | null;
  activeSession: ActiveSession | null;
  lastActivityAt: Date | null;

  // Actions — Areas
  setAreas: (areas: Area[]) => void;
  addArea: (area: Area) => void;
  updateArea: (id: string, partial: Partial<Area>) => void;
  removeArea: (id: string) => void;

  // Actions — Concepts
  setConcepts: (concepts: Concept[]) => void;
  addConcept: (concept: Concept) => void;
  updateConcept: (id: string, partial: Partial<Concept>) => void;
  removeConcept: (id: string) => void;

  // Actions — Flashcards
  setFlashcards: (cards: Flashcard[]) => void;
  addFlashcard: (card: Flashcard) => void;
  updateFlashcard: (id: string, partial: Partial<Flashcard>) => void;
  removeFlashcard: (id: string) => void;

  // Actions — Sessions
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;

  // Actions — UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveSession: (session: ActiveSession | null) => void;
  setLastActivityAt: (date: Date | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  areas: [],
  concepts: [],
  flashcards: [],
  sessions: [],
  loading: false,
  error: null,
  activeSession: null,
  lastActivityAt: null,

  setAreas: (areas) => set({ areas }),
  addArea: (area) => set((s) => ({ areas: [...s.areas, area] })),
  updateArea: (id, partial) =>
    set((s) => ({
      areas: s.areas.map((a) => (a.id === id ? { ...a, ...partial } : a)),
    })),
  removeArea: (id) =>
    set((s) => ({ areas: s.areas.filter((a) => a.id !== id) })),

  setConcepts: (concepts) => set({ concepts }),
  addConcept: (concept) => set((s) => ({ concepts: [...s.concepts, concept] })),
  updateConcept: (id, partial) =>
    set((s) => ({
      concepts: s.concepts.map((c) => (c.id === id ? { ...c, ...partial } : c)),
    })),
  removeConcept: (id) =>
    set((s) => ({ concepts: s.concepts.filter((c) => c.id !== id) })),

  setFlashcards: (flashcards) => set({ flashcards }),
  addFlashcard: (card) => set((s) => ({ flashcards: [...s.flashcards, card] })),
  updateFlashcard: (id, partial) =>
    set((s) => ({
      flashcards: s.flashcards.map((c) => (c.id === id ? { ...c, ...partial } : c)),
    })),
  removeFlashcard: (id) =>
    set((s) => ({ flashcards: s.flashcards.filter((c) => c.id !== id) })),

  setSessions: (sessions) => set({ sessions }),
  addSession: (session) => set((s) => ({ sessions: [...s.sessions, session] })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setActiveSession: (activeSession) => set({ activeSession }),
  setLastActivityAt: (lastActivityAt) => set({ lastActivityAt }),
}));
