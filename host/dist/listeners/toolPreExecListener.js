import { recomputeAndPush } from './listenerState.ts';
import { createSessionSnapshot } from '../model/sessionSnapshot.ts';
import { hashToolset } from '../engine/hashUtil.ts';
export function registerToolPreExecListener(deps) {
    const { ctx, state, window, getConfig, getProfile } = deps;
    const handler = (...args) => {
        const frame = args[0];
        if (!frame) {
            ctx.log('warn', 'toolPreExecListener: frame missing');
            return;
        }
        if (!Array.isArray(frame.toolSchemas)) {
            ctx.log('warn', 'toolPreExecListener: toolSchemas missing');
            return;
        }
        const now = Date.now();
        const newHash = hashToolset(frame.toolSchemas);
        if (state.toolsetHash && newHash !== state.toolsetHash) {
            state.toolsetChanged = true;
        }
        state.toolsetHash = newHash;
        state.consecutiveToolCalls += 1;
        const config = getConfig();
        const profile = getProfile();
        if (config.showPtcHint &&
            state.consecutiveToolCalls >= profile.consecutiveToolCallsForPtc) {
            if (deps.throttler.shouldEmitPtc(now)) {
                state.ptcHintActive = true;
            }
        }
        const snapshot = createSessionSnapshot({
            messageCount: state.messageCount,
            toolsetHash: state.toolsetHash,
            systemPromptHash: state.systemPromptHash,
            contextTokenDelta: state.contextTokenDelta,
            consecutiveToolCalls: state.consecutiveToolCalls,
            lastSignalAt: state.lastSignalAt,
        });
        window.push(snapshot);
        recomputeAndPush(deps, now);
    };
    return ctx.on('tools/pre-execute', handler);
}
//# sourceMappingURL=toolPreExecListener.js.map