const YELLOW_THROTTLE_MS = 30_000;
const PTC_THROTTLE_MS = 300_000;
const UI_THROTTLE_MS = 1_000;
export class SignalThrottler {
    lastYellowByReason = new Map();
    lastPtcAt = 0;
    lastUiLevel = null;
    lastUiAt = 0;
    shouldEmit(signal, now) {
        if (signal.level === 'yellow' && signal.triggerReason) {
            const last = this.lastYellowByReason.get(signal.triggerReason) ?? 0;
            if (now - last < YELLOW_THROTTLE_MS)
                return false;
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
    shouldEmitPtc(now) {
        if (now - this.lastPtcAt < PTC_THROTTLE_MS)
            return false;
        this.lastPtcAt = now;
        return true;
    }
    shouldRepaint(level, now) {
        if (level === this.lastUiLevel && now - this.lastUiAt < UI_THROTTLE_MS) {
            return false;
        }
        this.lastUiLevel = level;
        this.lastUiAt = now;
        return true;
    }
    reset() {
        this.lastYellowByReason.clear();
        this.lastPtcAt = 0;
        this.lastUiLevel = null;
        this.lastUiAt = 0;
    }
}
