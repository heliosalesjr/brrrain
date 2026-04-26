import { Flame } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/store/useAppStore';
import { differenceInDays } from 'date-fns';

export function StreakWidget() {
  const sessions = useAppStore((s) => s.sessions);

  // Calculate streak: count consecutive days with at least one session
  const streak = calculateStreak(sessions.map((s) => s.date));

  return (
    <Card className="p-4 flex items-center gap-4">
      <div
        className={`
          w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
          ${streak > 0 ? 'bg-orange-100' : 'bg-gray-100'}
        `}
      >
        <Flame
          className={`w-6 h-6 ${streak > 0 ? 'text-orange-500' : 'text-gray-400'}`}
        />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{streak}</p>
        <p className="text-sm text-gray-500">
          {streak === 1 ? 'day streak' : 'day streak'}
        </p>
      </div>
      {streak >= 7 && (
        <span className="ml-auto text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
          🔥 On fire!
        </span>
      )}
    </Card>
  );
}

function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const uniqueDays = new Set(
    dates.map((d) => {
      const day = new Date(d);
      day.setHours(0, 0, 0, 0);
      return day.getTime();
    })
  );

  let streak = 0;
  let current = today;

  while (true) {
    if (uniqueDays.has(current.getTime())) {
      streak++;
      current = new Date(current.getTime() - 86400000);
    } else {
      // Allow 1-day gap if today hasn't been studied yet
      if (streak === 0 && differenceInDays(today, current) === 0) {
        current = new Date(current.getTime() - 86400000);
        continue;
      }
      break;
    }
  }

  return streak;
}
