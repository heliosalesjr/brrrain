import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, RotateCcw, BookOpen, Zap, Info, Clock } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { StreakWidget } from '@/components/dashboard/StreakWidget';
import { StudyLinksPanel } from '@/components/dashboard/StudyLinksPanel';
import { useAreas } from '@/hooks/useAreas';
import { useConcepts } from '@/hooks/useConcepts';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useSessions } from '@/hooks/useSessions';
import { useScheduler } from '@/hooks/useScheduler';
import { useAppStore } from '@/store/useAppStore';
import { isConfigured } from '@/firebase/config';
import { MOCK_AREAS, MOCK_CONCEPTS, MOCK_SESSIONS } from '@/mock/data';
import type { Concept, Area } from '@/domain/types';

function sessionDateLabel(date: Date): string {
  if (isToday(date))     return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

interface TodayItem {
  concept: Concept;
  area: Area | undefined;
  tag: 'new' | 'due';
}

export function Dashboard() {
  useAreas();
  useConcepts();
  useFlashcards();
  useSessions();

  const navigate  = useNavigate();
  const { newConceptPool, dueStudySessions, dueReviewsToday } = useScheduler();
  const { setAreas, setConcepts, setSessions, activeAreaId } = useAppStore();
  const areas    = useAppStore((s) => s.areas);
  const concepts = useAppStore((s) => s.concepts);
  const sessions = useAppStore((s) => s.sessions);

  useEffect(() => {
    if (!isConfigured && areas.length === 0) {
      setAreas(MOCK_AREAS);
      setConcepts(MOCK_CONCEPTS);
      setSessions(MOCK_SESSIONS);
    }
  }, [isConfigured, areas.length, setAreas, setConcepts, setSessions]);

  const todayItems: TodayItem[] = [
    ...dueStudySessions.map((c) => ({
      concept: c,
      area: areas.find((a) => a.id === c.areaId),
      tag: 'due' as const,
    })),
    ...newConceptPool.map((c) => ({
      concept: c,
      area: areas.find((a) => a.id === c.areaId),
      tag: 'new' as const,
    })),
  ].slice(0, 5);

  const recentSessions = [...sessions]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 4);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {!isConfigured && (
        <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">Firebase not configured</p>
            <p className="text-sm opacity-90">
              Showing demo data. Copy{' '}
              <code className="bg-blue-100 px-1 rounded">.env.example</code> to{' '}
              <code className="bg-blue-100 px-1 rounded">.env</code> and add your credentials.
            </p>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StreakWidget />

        <Card className="p-4 flex items-center gap-4">
          <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <RotateCcw className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{dueReviewsToday.length}</p>
            <p className="text-xs text-gray-400">flashcards due</p>
          </div>
          {dueReviewsToday.length > 0 && (
            <button
              onClick={() => navigate('/review')}
              className="ml-auto text-orange-500 hover:text-orange-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{todayItems.length}</p>
            <p className="text-xs text-gray-400">to study today</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Today's focus */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-700">Today's focus</h2>
              {todayItems.length > 0 && (
                <span className="text-xs text-gray-400">
                  {todayItems.length} concept{todayItems.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {todayItems.length === 0 ? (
              <Card className="p-6 text-center">
                <Zap className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-500">All caught up!</p>
                <p className="text-xs text-gray-400 mt-1">
                  {activeAreaId
                    ? 'No concepts due for this area today.'
                    : 'Add concepts in the Concepts page to start learning.'}
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {todayItems.map(({ concept, area, tag }) => (
                  <div
                    key={concept.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3
                               flex items-center gap-4 hover:border-brand-200 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {concept.title}
                        </p>
                        {tag === 'new' ? (
                          <Badge variant="default">New</Badge>
                        ) : (
                          <Badge variant="warning">Due</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {area?.name ?? 'Unknown area'}
                        {concept.description ? ` · ${concept.description}` : ''}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/session/${concept.id}`)}
                    >
                      Study
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Flashcard reviews */}
          {dueReviewsToday.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-gray-700 mb-3">Flashcard reviews</h2>
              <Card className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-4 h-4 text-orange-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {dueReviewsToday.length} card{dueReviewsToday.length !== 1 ? 's' : ''} due
                    </p>
                    <p className="text-xs text-gray-400">
                      Spaced repetition review
                    </p>
                  </div>
                </div>
                <Button onClick={() => navigate('/review')}>
                  Start reviewing
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Card>
            </section>
          )}

          {/* Recent sessions */}
          {recentSessions.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-700">Recent activity</h2>
                <button
                  onClick={() => navigate('/history')}
                  className="text-xs text-brand-500 hover:text-brand-600 font-medium"
                >
                  View all
                </button>
              </div>
              <div className="space-y-2">
                {recentSessions.map((session) => {
                  const concept = concepts.find((c) => c.id === session.conceptId);
                  const area    = areas.find((a) => a.id === session.areaId);
                  return (
                    <div
                      key={session.id}
                      className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-4"
                    >
                      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {concept?.title ?? 'Unknown concept'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {area?.name ?? ''} · {session.duration}min · {sessionDateLabel(session.date)}
                        </p>
                      </div>
                      <Badge variant={
                        session.type === 'initial' ? 'info'
                        : session.type === 'review' ? 'warning'
                        : 'default'
                      }>
                        {session.type}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Right panel */}
        <div>
          <StudyLinksPanel areaId={activeAreaId} />
        </div>
      </div>
    </div>
  );
}
