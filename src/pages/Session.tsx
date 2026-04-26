import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Plus, Trash2, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Timer } from '@/components/ui/Timer';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';
import { useConcepts } from '@/hooks/useConcepts';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useSessions } from '@/hooks/useSessions';
import { SESSION_PHASES } from '@/domain/session';
import type { FlashcardMediaType } from '@/domain/types';

interface DraftCard { front: string; back: string; mediaType: FlashcardMediaType }

function useElapsed() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return { elapsed: seconds, label: `${mm}:${ss}` };
}

function PhaseStepper({ current, completed }: { current: number; completed: number[] }) {
  return (
    <div className="flex items-center gap-0">
      {SESSION_PHASES.map((phase, i) => {
        const done   = completed.includes(phase.id);
        const active = current === phase.id;
        return (
          <div key={phase.id} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${done    ? 'bg-green-100 text-green-700'
              : active  ? 'bg-brand-500 text-white'
              :           'bg-gray-100 text-gray-400'}`}>
              {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
              {phase.label}
            </div>
            {i < SESSION_PHASES.length - 1 && (
              <div className={`w-6 h-px mx-1 ${done ? 'bg-green-300' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FlashcardCreator({
  drafts, onAdd, onRemove,
}: {
  drafts: DraftCard[];
  onAdd: (card: DraftCard) => void;
  onRemove: (i: number) => void;
}) {
  const [front, setFront] = useState('');
  const [back, setBack]   = useState('');

  const handleAdd = () => {
    if (!front.trim() || !back.trim()) return;
    onAdd({ front: front.trim(), back: back.trim(), mediaType: 'text' });
    setFront('');
    setBack('');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-gray-400" />
        Session flashcards
        {drafts.length > 0 && <Badge variant="info">{drafts.length}</Badge>}
      </h3>

      {drafts.length > 0 && (
        <div className="space-y-2">
          {drafts.map((d, i) => (
            <div key={i} className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2 group">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">{d.front}</p>
                <p className="text-xs text-gray-400 truncate">{d.back}</p>
              </div>
              <button
                onClick={() => onRemove(i)}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <textarea
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="Front (question / term)"
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none
                     focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        <textarea
          value={back}
          onChange={(e) => setBack(e.target.value)}
          placeholder="Back (answer / definition)"
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none
                     focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={handleAdd}
          disabled={!front.trim() || !back.trim()}
          className="w-full"
        >
          <Plus className="w-4 h-4" />
          Add flashcard
        </Button>
      </div>
    </div>
  );
}

export function Session() {
  const { id: conceptId } = useParams<{ id: string }>();
  const navigate          = useNavigate();

  const areas    = useAppStore((s) => s.areas);
  const concepts = useAppStore((s) => s.concepts);

  const concept = concepts.find((c) => c.id === conceptId);
  const area    = areas.find((a) => a.id === concept?.areaId);

  const { markStudied }     = useConcepts();
  const { createFlashcard } = useFlashcards(conceptId);
  const { saveSession }     = useSessions();

  const { elapsed, label: elapsedLabel } = useElapsed();
  const startedAt = useRef(new Date());

  const [currentPhase, setCurrentPhase]       = useState(0);
  const [phasesCompleted, setPhasesCompleted] = useState<number[]>([]);
  const [drafts, setDrafts]                   = useState<DraftCard[]>([]);
  const [notes, setNotes]                     = useState('');
  const [finishing, setFinishing]             = useState(false);
  const [saving, setSaving]                   = useState(false);

  const isLastPhase  = currentPhase === SESSION_PHASES.length - 1;
  const showCards    = currentPhase === 2;
  const showFinalize = finishing || phasesCompleted.length === SESSION_PHASES.length;

  const completePhase = () => {
    const next = [...phasesCompleted, currentPhase];
    setPhasesCompleted(next);
    if (!isLastPhase) {
      setCurrentPhase((p) => p + 1);
    } else {
      setFinishing(true);
    }
  };

  const handleFinish = async () => {
    if (!concept || !area) return;
    setSaving(true);

    for (const d of drafts) {
      await createFlashcard({ conceptId: concept.id, areaId: area.id, ...d });
    }

    const type =
      !concept.lastStudiedAt ? 'initial'
      : drafts.length > 0    ? 'practice'
      : 'review';

    await saveSession({
      areaId: area.id,
      conceptId: concept.id,
      type,
      phasesCompleted,
      notes,
      flashcardsCreated: drafts.length,
      durationMinutes: Math.round(elapsed / 60),
    });

    await markStudied(concept.id);
    navigate('/');
  };

  if (!concept || !area) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-4 text-center px-4">
        <BookOpen className="w-10 h-10 opacity-30" />
        <div>
          <p className="font-medium text-gray-600">No concept selected</p>
          <p className="text-sm mt-1">
            Sessions are started from the <strong>Start</strong> button in the dashboard agenda.
            Create areas and concepts in <strong>Areas</strong> for them to appear in the agenda.
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/')}>Go to dashboard</Button>
      </div>
    );
  }

  const phase     = SESSION_PHASES[currentPhase];
  const phaseMins = phase.durationMinutes[1] - phase.durationMinutes[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 font-medium">{area.name}</p>
          <h1 className="text-lg font-bold text-gray-900 truncate">{concept.title}</h1>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-1.5">
          <span className="text-xs text-gray-500">Total time</span>
          <span className="font-mono text-sm font-bold text-gray-700">{elapsedLabel}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <PhaseStepper current={currentPhase} completed={phasesCompleted} />
      </div>

      {!showFinalize && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-gray-900">{phase.label}</h2>
                <Badge variant="default">{phase.duration}</Badge>
                {!phase.isRequired && <Badge variant="warning">optional</Badge>}
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-lg">
                {phase.instruction}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <Timer durationMinutes={phaseMins} />
            <div className="flex items-center gap-2">
              {!phase.isRequired && (
                <Button variant="ghost" size="sm" onClick={completePhase}>Skip</Button>
              )}
              <Button onClick={completePhase}>
                {isLastPhase ? 'Finish' : 'Complete phase'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCards && !showFinalize && (
        <FlashcardCreator
          drafts={drafts}
          onAdd={(d) => setDrafts((prev) => [...prev, d])}
          onRemove={(i) => setDrafts((prev) => prev.filter((_, idx) => idx !== i))}
        />
      )}

      {!showFinalize && currentPhase > 0 && (
        <div className="text-center">
          <button
            onClick={() => setFinishing(true)}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
          >
            End session now
          </button>
        </div>
      )}

      {showFinalize && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Session complete</h2>
            <p className="text-sm text-gray-400">
              {phasesCompleted.length} phase{phasesCompleted.length !== 1 ? 's' : ''} completed
              {drafts.length > 0 && ` · ${drafts.length} flashcard${drafts.length !== 1 ? 's' : ''} created`}
              {' · '}{elapsedLabel} total
            </p>
          </div>

          {!showCards && (
            <FlashcardCreator
              drafts={drafts}
              onAdd={(d) => setDrafts((prev) => [...prev, d])}
              onRemove={(i) => setDrafts((prev) => prev.filter((_, idx) => idx !== i))}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What became clearer? What gaps remain?"
              rows={4}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <Button onClick={handleFinish} disabled={saving} className="w-full" size="lg">
            {saving ? 'Saving...' : 'Save and return to dashboard'}
          </Button>
        </div>
      )}
    </div>
  );
}
