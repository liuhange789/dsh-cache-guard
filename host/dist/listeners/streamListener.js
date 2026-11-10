import { createLog } from "../types/dshContext.js";
import { recomputeAndPush } from "./listenerState.js";
import { createSessionSnapshot } from "../model/sessionSnapshot.js";
export function registerStreamListener(deps) {
    const { ctx, state, window } = deps;
    const log = createLog(ctx);
    const handler = (...args) => {
        const frame = args[0];
        if (!frame) {
            log('warn', 'streamListener: frame missing');
            return;
        }
        if (typeof frame.tokenDelta !== 'number' || typeof frame.messageCount !== 'number') {
            log('warn', 'streamListener: required fields missing');
            return;
        }
        const now = Date.now();
        state.contextTokenDelta = frame.tokenDelta;
        state.messageCount = frame.messageCount;
        state.consecutiveToolCalls = 0;
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
    return ctx.on('agent/assistant-stream', handler);
}
//# sourceMappingURL=streamListener.js.map