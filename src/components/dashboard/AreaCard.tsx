import { BookOpen, Clock, RotateCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { Area, Concept, Flashcard } from '@/domain/types';

interface AreaCardProps {
  area: Area;
  concepts: Concept[];
  dueCards: Flashcard[];
}

const areaColors: Record<string, { bg: string; text: string; bar: string }> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   bar: 'bg-blue-500' },
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  bar: 'bg-green-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', bar: 'bg-purple-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', bar: 'bg-orange-500' },
  red:    { bg: 'bg-red-50',    text: 'text-red-700',    bar: 'bg-red-500' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', bar: 'bg-yellow-500' },
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-700',   bar: 'bg-teal-500' },
  pink:   { bg: 'bg-pink-50',   text: 'text-pink-700',   bar: 'bg-pink-500' },
};

export function AreaCard({ area, concepts, dueCards }: AreaCardProps) {
  const colors = areaColors[area.color] ?? areaColors.blue;

  const mastered = concepts.filter((c) => c.status === 'mastered').length;
  const progress = concepts.length > 0
    ? Math.round((mastered / concepts.length) * 100)
    : 0;

  const nextConcept = concepts
    .filter((c) => c.status !== 'mastered')
    .sort((a, b) => {
      if (!a.nextSessionAt) return 1;
      if (!b.nextSessionAt) return -1;
      return a.nextSessionAt.getTime() - b.nextSessionAt.getTime();
    })[0];

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className={`px-2 py-1 rounded-lg ${colors.bg}`}>
          <span className={`text-sm font-semibold ${colors.text}`}>{area.name}</span>
        </div>
        {dueCards.length > 0 && (
          <Badge variant="warning" className="gap-1">
            <RotateCcw className="w-3 h-3" />
            {dueCards.length} revisões
          </Badge>
        )}
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{mastered}/{concepts.length} conceitos</span>
          <span>{progress}%</span>
        </div>
        <ProgressBar value={progress} color={colors.bar} />
      </div>

      {/* Next concept */}
      {nextConcept ? (
        <div className="flex items-start gap-2 pt-3 border-t border-gray-50">
          <BookOpen className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{nextConcept.title}</p>
            {nextConcept.nextSessionAt && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(nextConcept.nextSessionAt, {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-400 pt-3 border-t border-gray-50">
          Todos os conceitos dominados
        </p>
      )}
    </Card>
  );
}
