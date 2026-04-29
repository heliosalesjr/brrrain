import { useState } from 'react';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { Clock, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useAreas } from '@/hooks/useAreas';
import { useConcepts } from '@/hooks/useConcepts';
import { useSessions } from '@/hooks/useSessions';
import { useAppStore } from '@/store/useAppStore';
import type { Session } from '@/domain/types';

function groupByDate(sessions: Session[]): { label: string; sessions: Session[] }[] {
  const groups: Record<string, Session[]> = {};

  for (const session of sessions) {
    let label: string;
    if (isToday(session.date))           label = 'Today';
    else if (isYesterday(session.date))  label = 'Yesterday';
    else if (isThisWeek(session.date))   label = 'This week';
    else                                 label = format(session.date, 'MMMM yyyy');

    if (!groups[label]) groups[label] = [];
    groups[label].push(session);
  }

  const order = ['Today', 'Yesterday', 'This week'];
  const keys  = Object.keys(groups).sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return 0;
  });

  return keys.map((label) => ({ label, sessions: groups[label] }));
}

function SessionRow({ session }: { session: Session }) {
  const [expanded, setExpanded] = useState(false);
  const concept = useAppStore((s) => s.concepts.find((c) => c.id === session.conceptId));
  const area    = useAppStore((s) => s.areas.find((a) => a.id === session.areaId));

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <Clock className="w-4 h-4 text-gray-400" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {concept?.title ?? 'Unknown concept'}
          </p>
          <p className="text-xs text-gray-400">
            {area?.name ?? ''} · {format(session.date, 'MMM d, h:mm a')} · {session.duration}min
            {session.flashcardsCreated > 0 && ` · +${session.flashcardsCreated} cards`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={
            session.type === 'initial' ? 'info'
            : session.type === 'review' ? 'warning'
            : 'default'
          }>
            {session.type}
          </Badge>
          {session.notes && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="p-1 rounded text-gray-400 hover:text-gray-600"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {expanded && session.notes && (
        <div className="px-4 pb-3 pt-0 border-t border-gray-50">
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {session.notes}
          </p>
        </div>
      )}
    </div>
  );
}

export function History() {
  useAreas();
  useConcepts();
  useSessions();

  const sessions = useAppStore((s) => s.sessions);

  const sorted = [...sessions].sort((a, b) => b.date.getTime() - a.date.getTime());
  const groups = groupByDate(sorted);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Study history</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {sessions.length === 0 ? 'No sessions yet' : `${sessions.length} session${sessions.length !== 1 ? 's' : ''} recorded`}
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Complete your first study session to see history here.</p>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.label} className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-500">{group.label}</h2>
            {group.sessions.map((session) => (
              <SessionRow key={session.id} session={session} />
            ))}
          </section>
        ))
      )}
    </div>
  );
}
