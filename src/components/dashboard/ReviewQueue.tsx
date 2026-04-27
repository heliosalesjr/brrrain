import { useNavigate } from 'react-router-dom';
import { RotateCcw, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Flashcard, Area } from '@/domain/types';

interface ReviewQueueProps {
  dueCards: Flashcard[];
  areas: Area[];
}

export function ReviewQueue({ dueCards, areas }: ReviewQueueProps) {
  const navigate = useNavigate();
  if (dueCards.length === 0) {
    return (
      <Card className="p-6 text-center">
        <RotateCcw className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-500">No pending reviews</p>
        <p className="text-xs text-gray-400 mt-1">Great work! Come back tomorrow.</p>
      </Card>
    );
  }

  const byArea = dueCards.reduce<Record<string, Flashcard[]>>((acc, card) => {
    acc[card.areaId] = [...(acc[card.areaId] ?? []), card];
    return acc;
  }, {});

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-brand-500" />
          <h3 className="font-semibold text-gray-800 text-sm">Pending reviews</h3>
          <Badge variant="danger">{dueCards.length}</Badge>
        </div>
        <Button variant="primary" size="sm" onClick={() => navigate('/review')}>
          Start review
          <ChevronRight className="w-3 h-3" />
        </Button>
      </div>

      <div className="divide-y divide-gray-50">
        {Object.entries(byArea).map(([areaId, cards]) => {
          const area = areas.find((a) => a.id === areaId);
          return (
            <div key={areaId} className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {area?.name ?? 'Unknown area'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Oldest:{' '}
                  {formatDistanceToNow(
                    cards.reduce((oldest, c) =>
                      c.nextReviewAt < oldest ? c.nextReviewAt : oldest,
                      cards[0].nextReviewAt
                    ),
                    { addSuffix: true }
                  )}
                </p>
              </div>
              <Badge variant="warning">{cards.length} cards</Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
