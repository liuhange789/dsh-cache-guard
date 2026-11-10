import type { HealthSignal } from '../model/healthSignal.ts';
export declare class SignalThrottler {
    private lastYellowByReason;
    private lastPtcAt;
    private lastUiLevel;
    private lastUiAt;
    shouldEmit(signal: HealthSignal, now: number): boolean;
    shouldEmitPtc(now: number): boolean;
    shouldRepaint(level: string, now: number): boolean;
    reset(): void;
}
//# sourceMappingURL=signalThrottler.d.ts.map