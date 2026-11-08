import type { Level, TriggerReason } from './types.ts';
import type { SessionWindowSummary } from './sessionSnapshot.ts';
export interface HealthSignal {
    level: Level;
    triggerReason: TriggerReason | null;
    computedAt: number;
    sessionWindowSummary: SessionWindowSummary | null;
    ptcHintActive: boolean;
}
export declare function createNoneSignal(computedAt?: number): HealthSignal;
export declare function createGreenSignal(summary: SessionWindowSummary, computedAt?: number): HealthSignal;
export declare function createYellowSignal(reason: TriggerReason, summary: SessionWindowSummary, computedAt?: number): HealthSignal;
export declare function createRedSignal(summary: SessionWindowSummary, computedAt?: number): HealthSignal;
