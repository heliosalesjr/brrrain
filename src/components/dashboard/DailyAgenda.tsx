import { BookOpen, Play, ChevronRight, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { DailyAgendaItem } from '@/domain/types';

interface DailyAgendaProps {
  items: DailyAgendaItem[];
}

const sessionTypeLabel: Record<DailyAgendaItem['sessionType'], string> = {
  initial: 'Nova sessão',
  practice: 'Prática',
  review: 'Revisão',
  rescue: 'Resgate',
};

const sessionTypeBadge: Record<
  DailyAgendaItem['sessionType'],
  'default' | 'info' | 'warning' | 'danger' | 'success'
> = {
  initial: 'info',
  practice: 'success',
  review: 'warning',
  rescue: 'danger',
};

const priorityColors: Record<number, string> = {
  1: 'border-l-red-400',
  2: 'border-l-orange-400',
  3: 'border-l-yellow-400',
  4: 'border-l-gray-200',
};

export function DailyAgenda({ items }: DailyAgendaProps) {
  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="font-medium text-gray-600">Nada agendado para hoje</p>
        <p className="text-sm text-gray-400 mt-1">
          Adicione conceitos nas suas áreas para começar a estudar.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Card
          key={`${item.areaId}-${item.conceptId}`}
          className={`p-4 border-l-4 ${priorityColors[item.priority] ?? priorityColors[4]}`}
        >
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-500">{item.areaName}</span>
                <Badge variant={sessionTypeBadge[item.sessionType]}>
                  {sessionTypeLabel[item.sessionType]}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {item.conceptTitle}
                </p>
              </div>
            </div>
            <Button variant="primary" size="sm" className="flex-shrink-0">
              <Play className="w-3 h-3" />
              Iniciar
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
