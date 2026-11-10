import type { HealthSignal } from './model/healthSignal.ts';
export declare function isStale(computedAt: number, now: number): boolean;
export declare function guard(signal: HealthSignal, now: number): HealthSignal;
//# sourceMappingURL=staleGuard.d.ts.map