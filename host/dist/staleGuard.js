import { createNoneSignal } from "./model/healthSignal.js";
const STALE_THRESHOLD_MS = 2000;
export function isStale(computedAt, now) {
    return now - computedAt > STALE_THRESHOLD_MS;
}
export function guard(signal, now) {
    if (isStale(signal.computedAt, now)) {
        return createNoneSignal(now);
    }
    return signal;
}
//# sourceMappingURL=staleGuard.js.map