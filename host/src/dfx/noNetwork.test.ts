import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setup } from '../index.ts';
import type { DshHostContext, DshToolDefinition, Disposer } from '../types/dshContext.ts';

interface MockCtx extends DshHostContext {
  handlers: Map<string, (...args: unknown[]) => unknown>;
  toolDefs: Map<string, DshToolDefinition>;
}

function makeMockCtx(): MockCtx {
  const handlers = new Map<string, (...args: unknown[]) => unknown>();
  const toolDefs = new Map<string, DshToolDefinition>();
  const ctx = {
    handlers,
    toolDefs,
    on: vi.fn((event: string, handler: (...args: unknown[]) => unknown) => {
      handlers.set(event, handler);
      return () => {
        handlers.delete(event);
      };
    }),
    effect: vi.fn(<T>(fn: () => Disposer): T => fn() as unknown as T),
    log: vi.fn(),
    tools: {
      register: (definition: DshToolDefinition) => {
        toolDefs.set(definition.name, definition);
        return () => {
          toolDefs.delete(definition.name);
        };
      },
    },
  };
  return ctx as unknown as MockCtx;
}

describe('DFX: No Network', () => {
  let ctx: MockCtx;
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(async () => {
    originalFetch = globalThis.fetch;
    fetchSpy = vi.fn().mockResolvedValue(new Response(''));
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    ctx = makeMockCtx();
    await setup(ctx);
  });

  it('全流程无 fetch 调用', async () => {
    ctx.handlers.get('agent/assistant-stream')!({ tokenDelta: 100, messageCount: 5 });
    ctx.handlers.get('tools/pre-execute')!({ toolSchemas: ['t1'] });
    ctx.handlers.get('session/event')!({ type: 'other' });
    await ctx.toolDefs.get('cache_guard_health')!.execute({});
    await ctx.toolDefs.get('cache_guard_config')!.execute({});
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
