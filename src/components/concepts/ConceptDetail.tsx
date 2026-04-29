import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, BookOpen, Clock, Layers } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';
import type { Concept, Area, ConceptStatus } from '@/domain/types';

interface Props {
  concept: Concept;
  area: Area | undefined;
  onClose: () => void;
  onStatusChange: (id: string, status: ConceptStatus) => void;
}

const STATUS_OPTIONS: { value: ConceptStatus; label: string }[] = [
  { value: 'new',       label: 'New' },
  { value: 'learning',  label: 'Learning' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'mastered',  label: 'Mastered' },
];

const STATUS_BADGE: Record<ConceptStatus, { label: string; variant: 'default' | 'info' | 'warning' | 'success' }> = {
  new:       { label: 'New',       variant: 'default' },
  learning:  { label: 'Learning',  variant: 'info' },
  reviewing: { label: 'Reviewing', variant: 'warning' },
  mastered:  { label: 'Mastered',  variant: 'success' },
};

function sessionDateLabel(date: Date): string {
  if (isToday(date))     return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d, yyyy');
}

export function ConceptDetail({ concept, area, onClose, onStatusChange }: Props) {
  const navigate = useNavigate();

  // Stable references — useMemo prevents new arrays on every render,
  // avoiding Zustand's Object.is comparison triggering infinite re-renders.
  const allFlashcards = useAppStore((s) => s.flashcards);
  const allSessions   = useAppStore((s) => s.sessions);

  const flashcards = useMemo(
    () => allFlashcards.filter((f) => f.conceptId === concept.id),
    [allFlashcards, concept.id]
  );

  const sessions = useMemo(
    () =>
      allSessions
        .filter((s) => s.conceptId === concept.id)
        .sort((a, b) => b.date.getTime() - a.date.getTime()),
    [allSessions, concept.id]
  );

  const { label, variant } = STATUS_BADGE[concept.status];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-30 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-3">
            <h2 className="font-semibold text-gray-900 leading-tight">{concept.title}</h2>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Badge variant={variant}>{label}</Badge>
              {area && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Layers className="w-3 h-3" />
                  {area.name}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {concept.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{concept.description}</p>
          )}

          {/* Status change */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Move to
            </label>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (opt.value !== concept.status) onStatusChange(concept.id, opt.value);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all border
                    ${concept.status === opt.value
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-brand-300 hover:text-brand-600'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Study now */}
          <Button
            className="w-full"
            onClick={() => { navigate(`/session/${concept.id}`); onClose(); }}
          >
            <BookOpen className="w-4 h-4" />
            Study now
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Flashcards */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Flashcards ({flashcards.length})
            </h3>
            {flashcards.length === 0 ? (
              <p className="text-xs text-gray-400">
                No flashcards yet — create them during a study session.
              </p>
            ) : (
              <div className="space-y-2">
                {flashcards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100"
                  >
                    <p className="text-xs font-medium text-gray-700">{card.front}</p>
                    <p className="text-xs text-gray-400 mt-1 pt-1 border-t border-gray-200">
                      {card.back}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sessions history */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Sessions ({sessions.length})
            </h3>
            {sessions.length === 0 ? (
              <p className="text-xs text-gray-400">No sessions recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="border border-gray-100 rounded-xl px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {sessionDateLabel(session.date)} · {session.duration}min
                      </div>
                      <Badge variant={
                        session.type === 'initial' ? 'info'
                        : session.type === 'review' ? 'warning'
                        : 'default'
                      }>
                        {session.type}
                      </Badge>
                    </div>
                    {session.notes && (
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                        {session.notes}
                      </p>
                    )}
                    {session.flashcardsCreated > 0 && (
                      <p className="text-xs text-brand-500 mt-1">
                        +{session.flashcardsCreated} flashcard{session.flashcardsCreated !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
