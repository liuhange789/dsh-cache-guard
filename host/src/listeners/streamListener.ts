import type { Disposer } from '../types/dshContext.ts';
import { createLog } from '../types/dshContext.ts';
import type { PipelineDeps } from './listenerState.ts';
import { recomputeAndPush } from './listenerState.ts';
import { createSessionSnapshot } from '../model/sessionSnapshot.ts';

export interface StreamFrame {
  tokenDelta?: number;
  messageCount?: number;
}

export function registerStreamListener(
  deps: PipelineDeps,
): Disposer {
  const { ctx, state, window } = deps;
  const log = createLog(ctx);

  const handler = (...args: unknown[]): void => {
    const frame = args[0] as StreamFrame | undefined;
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