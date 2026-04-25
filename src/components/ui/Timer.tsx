import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface TimerProps {
  durationMinutes: number;
  onComplete?: () => void;
  className?: string;
}

export function Timer({ durationMinutes, onComplete, className = '' }: TimerProps) {
  const total = durationMinutes * 60;
  const [seconds, setSeconds] = useState(total);
  const [running, setRunning] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(id);
          setRunning(false);
          onCompleteRef.current?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const progress = ((total - seconds) / total) * 100;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#e5e7eb" strokeWidth="4" />
          <circle
            cx="24" cy="24" r="20"
            fill="none" stroke="#4f6ef7" strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-gray-700">
          {mm}:{ss}
        </span>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRunning((r) => !r)}
        >
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setSeconds(total); setRunning(false); }}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
