import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getRescueProtocol } from '@/domain/rescue';
import type { RescueProtocol } from '@/domain/types';

export function useRescue(): RescueProtocol | null {
  const lastActivityAt = useAppStore((s) => s.lastActivityAt);

  return useMemo(() => {
    return getRescueProtocol(lastActivityAt);
  }, [lastActivityAt]);
}
