import type { Level, TriggerReason } from './types.ts';
import type { SessionWindowSummary } from './sessionSnapshot.ts';

export interface HealthSignal {
  level: Level;
  triggerReason: TriggerReason | null;
  computedAt: number;
  sessionWindowSummary: SessionWindowSummary | null;
  ptcHintActive: boolean;
}

export function createNoneSignal(computedAt: number = Date.now()): HealthSignal {
  return {
    level: 'none',
    triggerReason: null,
    computedAt,
    sessionWindowSummary: null,
    ptcHintActive: false,
  };
}

export function createGreenSignal(
  summary: SessionWindowSummary,
  computedAt: number = Date.now(),
): HealthSignal {
  return {
    level: 'green',
    triggerReason: null,
    computedAt,
    sessionWindowSummary: summary,
    ptcHintActive: false,
  };
}

export function createYellowSignal(
  reason: TriggerReason,
  summary: SessionWindowSummary,
  computedAt: number = Date.now(),
): HealthSignal {
  return {
    level: 'yellow',
    triggerReason: reason,
    computedAt,
    sessionWindowSummary: summary,
    ptcHintActive: false,
  };
}

export function createRedSignal(
  summary: SessionWindowSummary,
  computedAt: number = Date.now(),
): HealthSignal {
  return {
    level: 'red',
    triggerReason: 'context_bloat_no_reuse',
    computedAt,
    sessionWindowSummary: summary,
    ptcHintActive: false,
  };
}