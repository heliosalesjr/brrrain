import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import type { RescueProtocol } from '@/domain/types';

interface RescueAlertProps {
  protocol: RescueProtocol;
}

const typeStyles: Record<RescueProtocol['type'], string> = {
  normal: 'bg-green-50 border-green-200 text-green-800',
  rescue: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  'quick-review': 'bg-orange-50 border-orange-200 text-orange-800',
  'partial-restart': 'bg-red-50 border-red-200 text-red-800',
};

export function RescueAlert({ protocol }: RescueAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className={`
      flex items-start gap-3 px-4 py-3 rounded-xl border mb-5
      ${typeStyles[protocol.type]}
    `}>
      <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{protocol.title}</p>
        <p className="text-sm mt-0.5 opacity-90">{protocol.description}</p>
        <p className="text-xs mt-1 opacity-75">
          Duração recomendada: {protocol.recommendedDuration}
          {protocol.areasToFocus === 1 ? ' · Foco em 1 área' : ''}
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
