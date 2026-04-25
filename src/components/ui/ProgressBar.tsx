interface ProgressBarProps {
  value: number; // 0–100
  color?: string;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  color = 'bg-brand-500',
  className = '',
  showLabel = false,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500 w-8 text-right">{clamped}%</span>
      )}
    </div>
  );
}
