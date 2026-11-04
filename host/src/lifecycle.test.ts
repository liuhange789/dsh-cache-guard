import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setup } from './index.ts';
import type { DshHostContext, Disposer } from './types/dshContext.ts';

function makeMockCtx(): DshHostContext & { handlers: Map<string, (...args: unknown[]) => void> } {
  const handlers = new Map<string, (...args: unknown[]) => void>();
  return {
    handlers,
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      handlers.set(event, handler);
      return () => { handlers.delete(event); };
    }),
    effect: vi.fn(<T>(fn: () => Disposer): T => {
      const d = fn();
      return d as unknown as T;
    }),
    inject: ['agents', 'tools'],
    log: vi.fn(),
    config: {
      read: vi.fn(async () => null),
      write: vi.fn(async () => {}),
      subscribe: vi.fn(() => () => {}),
    },
    expose: vi.fn(),
    push: vi.fn(),
  };
}

describe('Lifecycle Integration', () => {
  let ctx: ReturnType<typeof makeMockCtx>;

  beforeEach(() => {
    ctx = makeMockCtx();
  });

  it('装载后三监听器已注册', async () => {
    await setup(ctx);
    expect(ctx.handlers.has('agent/assistant-stream')).toBe(true);
    expect(ctx.handlers.has('tools/pre-execute')).toBe(true);
    expect(ctx.handlers.has('session/event')).toBe(true);
  });

  it('卸载后所有 disposer 被调用且 handler 不再被调用', async () => {
    const dispose = await setup(ctx);
    dispose();
    expect(ctx.handlers.has('agent/assistant-stream')).toBe(false);
    expect(ctx.handlers.has('tools/pre-execute')).toBe(false);
    expect(ctx.handlers.has('session/event')).toBe(false);
  });

  it('inject 缺 agents → 拒绝装载', async () => {
    ctx.inject = ['tools'];
    const dispose = await setup(ctx);
    expect(ctx.handlers.size).toBe(0);
    dispose();
  });

  it('卸载后推送 none 信号至 Client', async () => {
    const dispose = await setup(ctx);
    vi.mocked(ctx.push).mockClear();
    dispose();
    expect(ctx.push).toHaveBeenCalledWith('onSignalPush', expect.objectContaining({ level: 'none' }));
  });
});