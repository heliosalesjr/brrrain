import { useEffect } from 'react';
import { Info } from 'lucide-react';
import { DailyAgenda } from '@/components/dashboard/DailyAgenda';
import { ReviewQueue } from '@/components/dashboard/ReviewQueue';
import { StreakWidget } from '@/components/dashboard/StreakWidget';
import { RescueAlert } from '@/components/dashboard/RescueAlert';
import { StudyLinksPanel } from '@/components/dashboard/StudyLinksPanel';
import { useAreas } from '@/hooks/useAreas';
import { useConcepts } from '@/hooks/useConcepts';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useScheduler } from '@/hooks/useScheduler';
import { useRescue } from '@/hooks/useRescue';
import { useAppStore } from '@/store/useAppStore';
import { isConfigured } from '@/firebase/config';
import { MOCK_AREAS, MOCK_CONCEPTS, MOCK_SESSIONS } from '@/mock/data';

export function Dashboard() {
  useAreas();
  useConcepts();
  const { dueCards } = useFlashcards();
  const { agendaItems, dueReviewsToday } = useScheduler();
  const rescue = useRescue();
  const { setAreas, setConcepts, setSessions, activeAreaId } = useAppStore();
  const areas = useAppStore((s) => s.areas);

  useEffect(() => {
    if (!isConfigured && areas.length === 0) {
      setAreas(MOCK_AREAS);
      setConcepts(MOCK_CONCEPTS);
      setSessions(MOCK_SESSIONS);
    }
  }, [isConfigured, areas.length, setAreas, setConcepts, setSessions]);

  const filteredDueCards = activeAreaId
    ? dueCards.filter((c) => c.areaId === activeAreaId)
    : dueCards;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Firebase not configured notice */}
      {!isConfigured && (
        <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">Firebase não configurado</p>
            <p className="text-sm opacity-90">
              Exibindo dados demonstrativos. Copie{' '}
              <code className="bg-blue-100 px-1 rounded">.env.example</code> para{' '}
              <code className="bg-blue-100 px-1 rounded">.env</code> e preencha com suas credenciais Firebase.
            </p>
          </div>
        </div>
      )}

      {/* Rescue alert */}
      {rescue && <RescueAlert protocol={rescue} />}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StreakWidget />
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-brand-500">{agendaItems.length}</span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Para hoje</p>
            <p className="text-xs text-gray-400">conceitos agendados</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-orange-500">{dueReviewsToday.length}</span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Revisões</p>
            <p className="text-xs text-gray-400">flashcards vencidos</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Agenda + Review queue */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-base font-semibold text-gray-700 mb-3">Agenda do dia</h2>
            <DailyAgenda items={agendaItems} />
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-700 mb-3">Fila de revisão</h2>
            <ReviewQueue dueCards={filteredDueCards} areas={areas} />
          </section>
        </div>

        {/* Right: Study links */}
        <div>
          <StudyLinksPanel areaId={activeAreaId} />
        </div>
      </div>
    </div>
  );
}
