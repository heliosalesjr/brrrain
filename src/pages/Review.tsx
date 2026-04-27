import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import { useFlashcards } from '@/hooks/useFlashcards';
import { getDueCards, scheduleNextReview } from '@/domain/scheduler';
import { formatDistanceToNow } from 'date-fns';
import type { Flashcard, ReviewQuality } from '@/domain/types';

// ── rating config ─────────────────────────────────────────────────────────────
const RATINGS: {
  quality: ReviewQuality;
  label: string;
  sublabel: string;
  style: string;
  key: string;
}[] = [
  { quality: 1, label: 'Again',  sublabel: 'Forgot',         style: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',       key: '1' },
  { quality: 2, label: 'Hard',   sublabel: 'Struggled',      style: 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100', key: '2' },
  { quality: 4, label: 'Good',   sublabel: 'Remembered',     style: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100',  key: '3' },
  { quality: 5, label: 'Easy',   sublabel: 'Too easy',       style: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',    key: '4' },
];

// ── progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 100 : Math.round((done / total) * 100);
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div
        className="bg-brand-500 h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── next interval hint ────────────────────────────────────────────────────────
function intervalHint(card: Flashcard, quality: ReviewQuality): string {
  const result = scheduleNextReview(card, quality);
  return formatDistanceToNow(result.nextReviewAt, { addSuffix: false });
}

// ── main page ─────────────────────────────────────────────────────────────────
export function Review() {
  const navigate      = useNavigate();
  const areas         = useAppStore((s) => s.areas);
  const concepts      = useAppStore((s) => s.concepts);
  const activeAreaId  = useAppStore((s) => s.activeAreaId);

  const { dueCards, reviewCard } = useFlashcards();

  // Snapshot the queue once when the page loads so it doesn't shift mid-session
  const [queue]      = useState<Flashcard[]>(() => {
    const filtered = activeAreaId
      ? dueCards.filter((c) => c.areaId === activeAreaId)
      : dueCards;
    return getDueCards(filtered);
  });

  const [index, setIndex]       = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [rating, setRating]     = useState<ReviewQuality | null>(null);
  const [done, setDone]         = useState(false);
  const [stats, setStats]       = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  const current = queue[index];
  const area    = current ? areas.find((a) => a.id === current.areaId) : null;
  const concept = current ? concepts.find((c) => c.id === current.conceptId) : null;

  const handleRate = useCallback(async (quality: ReviewQuality) => {
    if (!current || rating !== null) return;
    setRating(quality);

    setStats((s) => ({
      ...s,
      again: quality === 1 ? s.again + 1 : s.again,
      hard:  quality === 2 ? s.hard  + 1 : s.hard,
      good:  quality === 4 ? s.good  + 1 : s.good,
      easy:  quality === 5 ? s.easy  + 1 : s.easy,
    }));

    await reviewCard(current.id, quality);

    setTimeout(() => {
      if (index + 1 >= queue.length) {
        setDone(true);
      } else {
        setIndex((i) => i + 1);
        setRevealed(false);
        setRating(null);
      }
    }, 300);
  }, [current, rating, index, queue.length, reviewCard]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space' && !revealed) {
        e.preventDefault();
        setRevealed(true);
      }
      if (revealed && rating === null) {
        const r = RATINGS.find((x) => x.key === e.key);
        if (r) handleRate(r.quality);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [revealed, rating, handleRate]);

  // Empty queue
  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center px-4">
        <CheckCircle2 className="w-12 h-12 text-green-400" />
        <div>
          <p className="font-semibold text-gray-800">No cards due</p>
          <p className="text-sm text-gray-400 mt-1">You're all caught up. Come back later!</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/')}>Back to dashboard</Button>
      </div>
    );
  }

  // Session complete
  if (done) {
    const total = queue.length;
    return (
      <div className="max-w-lg mx-auto space-y-6 py-8">
        <div className="text-center space-y-2">
          <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">Review complete!</h1>
          <p className="text-gray-500">{total} card{total !== 1 ? 's' : ''} reviewed</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid grid-cols-4 gap-4 text-center">
          {[
            { label: 'Again', value: stats.again, color: 'text-red-600' },
            { label: 'Hard',  value: stats.hard,  color: 'text-orange-600' },
            { label: 'Good',  value: stats.good,  color: 'text-green-600' },
            { label: 'Easy',  value: stats.easy,  color: 'text-blue-600' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <Button className="w-full" onClick={() => navigate('/')}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-gray-700">Review queue</span>
            <span className="text-sm text-gray-400">{index + 1} / {queue.length}</span>
          </div>
          <ProgressBar done={index} total={queue.length} />
        </div>
      </div>

      {/* Context */}
      {(area || concept) && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {area && <span>{area.name}</span>}
          {area && concept && <span>·</span>}
          {concept && <span>{concept.title}</span>}
          <RotateCcw className="w-3 h-3 ml-auto" />
          <span>{queue.length - index} remaining</span>
        </div>
      )}

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-64">
        {/* Front */}
        <div className={`px-8 py-8 ${revealed ? 'border-b border-gray-100' : ''}`}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Front</p>
          <p className="text-xl font-medium text-gray-900 leading-relaxed">{current.front}</p>
        </div>

        {/* Back */}
        {revealed ? (
          <div className="px-8 py-8 bg-gray-50/60">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Answer</p>
            <p className="text-lg text-gray-700 leading-relaxed">{current.back}</p>
          </div>
        ) : (
          <div className="px-8 py-6 flex justify-center">
            <Button onClick={() => setRevealed(true)} size="lg">
              Show answer
              <span className="text-xs opacity-60 ml-1">[space]</span>
            </Button>
          </div>
        )}
      </div>

      {/* Rating buttons */}
      {revealed && (
        <div className="grid grid-cols-4 gap-3">
          {RATINGS.map((r) => (
            <button
              key={r.quality}
              onClick={() => handleRate(r.quality)}
              disabled={rating !== null}
              className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border-2 font-medium
                transition-all disabled:opacity-50 disabled:cursor-not-allowed
                ${rating === r.quality ? 'scale-95 opacity-70' : ''}
                ${r.style}`}
            >
              <span className="text-sm font-semibold">{r.label}</span>
              <span className="text-xs opacity-70">{r.sublabel}</span>
              <span className="text-[10px] opacity-50 mt-0.5">
                {intervalHint(current, r.quality)}
              </span>
              <span className="text-[10px] opacity-30">[{r.key}]</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
