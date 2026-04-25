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
    label: 'Preparação',
    duration: '0–5 min',
    durationMinutes: [0, 5],
    instruction:
      'Revise brevemente o que você sabe sobre o tema antes de começar. Sem consultar materiais — apenas retrieval mental.',
    isRequired: true,
  },
  {
    id: 1,
    label: 'Estudo ativo',
    duration: '5–30 min',
    durationMinutes: [5, 30],
    instruction:
      'Estude o material principal. Processe ativamente: faça perguntas, crie exemplos, conecte com o que já sabe.',
    isRequired: true,
  },
  {
    id: 2,
    label: 'Elaboração',
    duration: '30–40 min',
    durationMinutes: [30, 40],
    instruction:
      'Crie flashcards e faça anotações de síntese. Foco em conceitos-chave e conexões entre ideias.',
    isRequired: true,
  },
  {
    id: 3,
    label: 'Consolidação',
    duration: '40–45 min',
    durationMinutes: [40, 45],
    instruction:
      'Feche o material e tente explicar o conceito principal em suas próprias palavras. Identifique lacunas.',
    isRequired: false,
  },
];

export type SessionPhaseId = 0 | 1 | 2 | 3;

export const TOTAL_SESSION_DURATION_MINUTES = 45;
