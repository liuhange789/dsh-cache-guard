import type { HealthSignal } from './model/types.ts';

const STALE_THRESHOLD_MS = 2000;

export function isStale(computedAt: number, now: number): boolean {
  return now - computedAt > STALE_THRESHOLD_MS;
}

export function guard(signal: HealthSignal, now: number): HealthSignal {
  if (isStale(signal.computedAt, now)) {
    return {
      level: 'none',
      triggerReason: null,
      computedAt: now,
      sessionWindowSummary: null,
      ptcHintActive: false,
    };
  }
  return signal;
}