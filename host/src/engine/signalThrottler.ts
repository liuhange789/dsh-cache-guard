import type { HealthSignal } from '../model/healthSignal.ts';
import type { TriggerReason } from '../model/types.ts';

const YELLOW_THROTTLE_MS = 30_000;
const PTC_THROTTLE_MS = 300_000;
const UI_THROTTLE_MS = 1_000;

export class SignalThrottler {
  private lastYellowByReason: Map<TriggerReason, number> = new Map();
  private lastPtcAt = 0;
  private lastUiLevel: string | null = null;
  private lastUiAt = 0;

  shouldEmit(signal: HealthSignal, now: number): boolean {
    if (signal.level === 'yellow' && signal.triggerReason) {
      if (!this.lastYellowByReason.has(signal.triggerReason)) {
        this.lastYellowByReason.set(signal.triggerReason, now);
        return true;
      }
      const last = this.lastYellowByReason.get(signal.triggerReason)!;
      if (now - last < YELLOW_THROTTLE_MS) return false;
      this.lastYellowByReason.set(signal.triggerReason, now);
      return true;
    }
    if (signal.level === 'red' || signal.level === 'green') {
      return true;
    }
    if (signal.level === 'none') {
      return true;
    }
    return false;
  }

  shouldEmitPtc(now: number): boolean {
    if (this.lastPtcAt === 0 || now - this.lastPtcAt >= PTC_THROTTLE_MS) {
      this.lastPtcAt = now;
      return true;
    }
    return false;
  }

  shouldRepaint(level: string, now: number): boolean {
    if (level === this.lastUiLevel && now - this.lastUiAt < UI_THROTTLE_MS) {
      return false;
    }
    this.lastUiLevel = level;
    this.lastUiAt = now;
    return true;
  }

  reset(): void {
    this.lastYellowByReason.clear();
    this.lastPtcAt = 0;
    this.lastUiLevel = null;
    this.lastUiAt = 0;
  }
}