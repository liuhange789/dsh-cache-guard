import { compute } from "../engine/healthSignalEngine.js";
import { createNoneSignal, createGreenSignal } from "../model/healthSignal.js";
import { toSummary } from "../model/sessionSnapshot.js";
export function createListenerState() {
    return {
        messageCount: 0,
        toolsetHash: '',
        systemPromptHash: '',
        contextTokenDelta: 0,
        consecutiveToolCalls: 0,
        lastSignalAt: 0,
        toolsetChanged: false,
        systemPromptRewrite: false,
        ptcHintActive: false,
        prevPromptHashes: [],
        currentSignal: createNoneSignal(0),
    };
}
export function recomputeAndPush(deps, now) {
    const config = deps.getConfig();
    if (!config.enabled) {
        const noneSignal = createNoneSignal(now);
        deps.state.currentSignal = noneSignal;
        deps.onSignalChange(noneSignal);
        return;
    }
    const profile = deps.getProfile();
    const signal = compute({
        snapshots: deps.window.all(),
        profile,
        prevSignal: deps.state.currentSignal,
        toolsetChanged: deps.state.toolsetChanged,
        systemPromptRewrite: deps.state.systemPromptRewrite,
        now,
    });
    signal.ptcHintActive = deps.state.ptcHintActive;
    if (!deps.throttler.shouldEmit(signal, now))
        return;
    deps.state.currentSignal = signal;
    deps.state.lastSignalAt = now;
    deps.state.toolsetChanged = false;
    deps.state.systemPromptRewrite = false;
    deps.onSignalChange(signal);
}
export function resetStateForNewSession(deps, now) {
    deps.window.clear();
    const state = deps.state;
    state.messageCount = 0;
    state.consecutiveToolCalls = 0;
    state.contextTokenDelta = 0;
    state.toolsetChanged = false;
    state.systemPromptRewrite = false;
    state.ptcHintActive = false;
    state.prevPromptHashes = [];
    deps.throttler.reset();
    const latest = deps.window.latest();
    const summary = latest ? toSummary(latest) : null;
    const greenSignal = summary
        ? createGreenSignal(summary, now)
        : createNoneSignal(now);
    state.currentSignal = greenSignal;
    deps.onSignalChange(greenSignal);
}
//# sourceMappingURL=listenerState.js.map