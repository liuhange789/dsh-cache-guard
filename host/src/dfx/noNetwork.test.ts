import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setup } from '../index.ts';
import type { DshHostContext, Disposer } from '../types/dshContext.ts';

function makeMockCtx(): DshHostContext & { handlers: Map<string, (...args: unknown[]) => void> } {
  const handlers = new Map<string, (...args: unknown[]) => void>();
  return {
    handlers,
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      handlers.set(event, handler);
      return () => { handlers.delete(event); };
    }),
    effect: vi.fn(<T>(fn: () => Disposer): T => fn() as unknown as T),
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

describe('DFX: No Network', () => {
  let ctx: ReturnType<typeof makeMockCtx>;
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(async () => {
    originalFetch = globalThis.fetch;
    fetchSpy = vi.fn().mockResolvedValue(new Response(''));
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    ctx = makeMockCtx();
    await setup(ctx);
  });

  it('全流程无 fetch 调用', () => {
    ctx.handlers.get('agent/assistant-stream')!({ tokenDelta: 100, messageCount: 5 });
    ctx.handlers.get('tools/pre-execute')!({ toolSchemas: ['t1'] });
    ctx.handlers.get('session/event')!({ type: 'other' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('卸载也无 fetch 调用', async () => {
    const dispose = await setup(ctx);
    fetchSpy.mockClear();
    dispose();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('恢复 fetch', () => {
    globalThis.fetch = originalFetch;
  });
});