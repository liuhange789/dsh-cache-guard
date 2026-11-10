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

async function readHealth(ctx: MockCtx): Promise<Record<string, unknown>> {
  return ctx.toolDefs.get('cache_guard_health')!.execute({});
}

describe('Event Mix Integration', () => {
  let ctx: MockCtx;

  beforeEach(async () => {
    ctx = makeMockCtx();
    await setup(ctx);
  });

  it('stream 事件后信号可读且级别合法', async () => {
    ctx.handlers.get('agent/assistant-stream')!({ tokenDelta: 100, messageCount: 5 });
    ctx.handlers.get('agent/assistant-stream')!({ tokenDelta: 200, messageCount: 6 });
    const health = await readHealth(ctx);
    expect(['green', 'yellow', 'red', 'none']).toContain(health.level);
    expect(typeof health.hint).toBe('string');
  });

  it('工具集变更触发 yellow 信号', async () => {
    ctx.handlers.get('tools/pre-execute')!({ toolSchemas: ['tool1'] });
    ctx.handlers.get('tools/pre-execute')!({ toolSchemas: ['tool1', 'tool2'] });
    const health = await readHealth(ctx);
    expect(health.level).toBe('yellow');
    expect(health.triggerReason).toBe('toolset_change');
  });

  it('会话重置后窗口清空', async () => {
    ctx.handlers.get('agent/assistant-stream')!({ tokenDelta: 100, messageCount: 5 });
    ctx.handlers.get('session/event')!({ type: 'session_reset' });
    const health = await readHealth(ctx);
    expect(['green', 'none']).toContain(health.level);
    expect((health.summary as { messageCount: number }).messageCount).toBe(0);
  });
});
