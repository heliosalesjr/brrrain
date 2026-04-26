export interface SessionPhase {
  id: number;
  label: string;
  duration: string; // descriptive, e.g. "0–5 min"
  durationMinutes: [number, number]; // [start, end]
  instruction: string;
  isRequired: boolean;
}

export const SESSION_PHASES: SessionPhase[] = [
  {
    id: 0,
    label: 'Preparation',
    duration: '0–5 min',
    durationMinutes: [0, 5],
    instruction:
      'Briefly review what you already know about the topic before starting. No materials — mental retrieval only.',
    isRequired: true,
  },
  {
    id: 1,
    label: 'Active study',
    duration: '5–30 min',
    durationMinutes: [5, 30],
    instruction:
      'Study the main material. Process actively: ask questions, create examples, connect with what you already know.',
    isRequired: true,
  },
  {
    id: 2,
    label: 'Elaboration',
    duration: '30–40 min',
    durationMinutes: [30, 40],
    instruction:
      'Create flashcards and synthesis notes. Focus on key concepts and connections between ideas.',
    isRequired: true,
  },
  {
    id: 3,
    label: 'Consolidation',
    duration: '40–45 min',
    durationMinutes: [40, 45],
    instruction:
      'Close the material and try to explain the main concept in your own words. Identify any remaining gaps.',
    isRequired: false,
  },
];

export type SessionPhaseId = 0 | 1 | 2 | 3;

export const TOTAL_SESSION_DURATION_MINUTES = 45;
