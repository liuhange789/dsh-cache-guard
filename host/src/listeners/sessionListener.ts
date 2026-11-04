import type { Disposer } from '../types/dshContext.ts';
import type { PipelineDeps } from './listenerState.ts';
import { recomputeAndPush, resetStateForNewSession } from './listenerState.ts';
import { createSessionSnapshot } from '../model/sessionSnapshot.ts';
import { hashSystemPrompt } from '../engine/hashUtil.ts';

export interface SessionEventFrame {
  type?: 'system_prompt_change' | 'session_reset' | 'other';
  systemPrompt?: string;
}

export function registerSessionListener(
  deps: PipelineDeps,
): Disposer {
  const { ctx, state, window, getProfile } = deps;

  const handler = (...args: unknown[]): void => {
    const frame = args[0] as SessionEventFrame | undefined;
    if (!frame) {
      ctx.log('warn', 'sessionListener: frame missing');
      return;
    }

    const now = Date.now();

    if (frame.type === 'session_reset') {
      resetStateForNewSession(deps, now);
      return;
    }

    if (frame.type === 'system_prompt_change') {
      if (typeof frame.systemPrompt !== 'string') {
        ctx.log('warn', 'sessionListener: systemPrompt missing');
        return;
      }
      const newHash = hashSystemPrompt(frame.systemPrompt);
      const profile = getProfile();
      const windowMs = profile.rewriteWindowMs;

      const recentCutoff = now - windowMs;
      const prevHashes = state.prevPromptHashes;
      if (prevHashes.length > 0) {
        const recentEntry = prevHashes[prevHashes.length - 1];
        if (recentEntry && recentEntry >= recentCutoff) {
          state.systemPromptRewrite = true;
        }
      }

      state.systemPromptHash = newHash;
      state.prevPromptHashes = [...prevHashes, now].filter((t) => t >= now - windowMs);

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
      return;
    }

    recomputeAndPush(deps, now);
  };

  return ctx.on('session/event', handler);
}