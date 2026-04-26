import { addDays, subDays } from 'date-fns';
import type { Area, Concept, Session } from '@/domain/types';

const today = new Date();

export const MOCK_AREAS: Area[] = [
  {
    id: 'area-1',
    name: 'Programming',
    color: 'blue',
    icon: 'code',
    createdAt: subDays(today, 30),
    isActive: true,
  },
  {
    id: 'area-2',
    name: 'Neuroscience',
    color: 'purple',
    icon: 'brain',
    createdAt: subDays(today, 20),
    isActive: true,
  },
  {
    id: 'area-3',
    name: 'Mathematics',
    color: 'green',
    icon: 'math',
    createdAt: subDays(today, 15),
    isActive: true,
  },
];

export const MOCK_CONCEPTS: Concept[] = [
  // Programming
  {
    id: 'concept-1',
    areaId: 'area-1',
    title: 'React Server Components',
    description: 'Components that run on the server with no client-side re-rendering.',
    status: 'learning',
    lastStudiedAt: subDays(today, 2),
    nextSessionAt: today,
  },
  {
    id: 'concept-2',
    areaId: 'area-1',
    title: 'TypeScript Generics',
    description: 'Parametric types for writing reusable, type-safe code.',
    status: 'reviewing',
    lastStudiedAt: subDays(today, 5),
    nextSessionAt: subDays(today, 1),
  },
  {
    id: 'concept-3',
    areaId: 'area-1',
    title: 'Event Loop',
    description: 'How Node.js processes asynchronous operations.',
    status: 'mastered',
    lastStudiedAt: subDays(today, 10),
    nextSessionAt: addDays(today, 20),
  },
  // Neuroscience
  {
    id: 'concept-4',
    areaId: 'area-2',
    title: 'Working memory',
    description: 'System that holds temporary information during cognitive tasks.',
    status: 'learning',
    lastStudiedAt: subDays(today, 1),
    nextSessionAt: addDays(today, 2),
  },
  {
    id: 'concept-5',
    areaId: 'area-2',
    title: 'Sleep consolidation',
    description: 'The process of strengthening memories during sleep.',
    status: 'new',
    lastStudiedAt: null,
    nextSessionAt: today,
  },
  // Mathematics
  {
    id: 'concept-6',
    areaId: 'area-3',
    title: 'Differential calculus',
    description: 'Derivatives, limits, and rates of change.',
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
    notes: 'Studied RSC and hydration.',
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
    notes: 'First read on working memory.',
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
    notes: 'Reviewed generics with advanced examples.',
    flashcardsCreated: 0,
    duration: 45,
  },
];
