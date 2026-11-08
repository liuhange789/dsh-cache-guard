export function createNoneSignal(computedAt = Date.now()) {
    return {
        level: 'none',
        triggerReason: null,
        computedAt,
        sessionWindowSummary: null,
        ptcHintActive: false,
    };
}
export function createGreenSignal(summary, computedAt = Date.now()) {
    return {
        level: 'green',
        triggerReason: null,
        computedAt,
        sessionWindowSummary: summary,
        ptcHintActive: false,
    };
}
export function createYellowSignal(reason, summary, computedAt = Date.now()) {
    return {
        level: 'yellow',
        triggerReason: reason,
        computedAt,
        sessionWindowSummary: summary,
        ptcHintActive: false,
    };
}
export function createRedSignal(summary, computedAt = Date.now()) {
    return {
        level: 'red',
        triggerReason: 'context_bloat_no_reuse',
        computedAt,
        sessionWindowSummary: summary,
        ptcHintActive: false,
    };
}
//# sourceMappingURL=healthSignal.js.map