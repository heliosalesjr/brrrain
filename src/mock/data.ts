import { addDays, subDays } from 'date-fns';
import type { Area, Concept, Session } from '@/domain/types';

const today = new Date();

export const MOCK_AREAS: Area[] = [
  {
    id: 'area-1',
    name: 'Programação',
    color: 'blue',
    icon: 'code',
    createdAt: subDays(today, 30),
    isActive: true,
  },
  {
    id: 'area-2',
    name: 'Neurociência',
    color: 'purple',
    icon: 'brain',
    createdAt: subDays(today, 20),
    isActive: true,
  },
  {
    id: 'area-3',
    name: 'Matemática',
    color: 'green',
    icon: 'math',
    createdAt: subDays(today, 15),
    isActive: true,
  },
];

export const MOCK_CONCEPTS: Concept[] = [
  // Programação
  {
    id: 'concept-1',
    areaId: 'area-1',
    title: 'React Server Components',
    description: 'Componentes que rodam no servidor, sem re-renderização no cliente.',
    status: 'learning',
    lastStudiedAt: subDays(today, 2),
    nextSessionAt: today,
  },
  {
    id: 'concept-2',
    areaId: 'area-1',
    title: 'TypeScript Generics',
    description: 'Tipos paramétricos para escrever código reutilizável e type-safe.',
    status: 'reviewing',
    lastStudiedAt: subDays(today, 5),
    nextSessionAt: subDays(today, 1),
  },
  {
    id: 'concept-3',
    areaId: 'area-1',
    title: 'Event Loop',
    description: 'Como o Node.js processa operações assíncronas.',
    status: 'mastered',
    lastStudiedAt: subDays(today, 10),
    nextSessionAt: addDays(today, 20),
  },
  // Neurociência
  {
    id: 'concept-4',
    areaId: 'area-2',
    title: 'Memória de trabalho',
    description: 'Sistema que mantém informações temporárias durante tarefas cognitivas.',
    status: 'learning',
    lastStudiedAt: subDays(today, 1),
    nextSessionAt: addDays(today, 2),
  },
  {
    id: 'concept-5',
    areaId: 'area-2',
    title: 'Consolidação do sono',
    description: 'Processo de fortalecimento de memórias durante o sono.',
    status: 'new',
    lastStudiedAt: null,
    nextSessionAt: today,
  },
  // Matemática
  {
    id: 'concept-6',
    areaId: 'area-3',
    title: 'Cálculo diferencial',
    description: 'Derivadas, limites e taxa de variação.',
    status: 'learning',
    lastStudiedAt: subDays(today, 3),
    nextSessionAt: today,
  },
];

export const MOCK_SESSIONS: Session[] = [
  {
    id: 'session-1',
    areaId: 'area-1',
    conceptId: 'concept-1',
    date: subDays(today, 2),
    type: 'practice',
    phasesCompleted: [0, 1, 2],
    notes: 'Estudei sobre RSC e hidratação.',
    flashcardsCreated: 3,
    duration: 40,
  },
  {
    id: 'session-2',
    areaId: 'area-2',
    conceptId: 'concept-4',
    date: subDays(today, 1),
    type: 'initial',
    phasesCompleted: [0, 1],
    notes: 'Primeira leitura sobre WM.',
    flashcardsCreated: 2,
    duration: 35,
  },
  {
    id: 'session-3',
    areaId: 'area-1',
    conceptId: 'concept-2',
    date: subDays(today, 1),
    type: 'review',
    phasesCompleted: [0, 1, 2, 3],
    notes: 'Revisão de generics com exemplos avançados.',
    flashcardsCreated: 0,
    duration: 45,
  },
];
