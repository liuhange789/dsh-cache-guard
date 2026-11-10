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

describe('DFX: High Frequency', () => {
  let ctx: MockCtx;

  beforeEach(async () => {
    ctx = makeMockCtx();
    await setup(ctx);
  });

  it('50+帧/秒不丢失工具集变更', async () => {
    for (let i = 0; i < 100; i++) {
      ctx.handlers.get('agent/assistant-stream')!({ tokenDelta: 50, messageCount: i });
    }
    ctx.handlers.get('tools/pre-execute')!({ toolSchemas: ['initial_tool'] });
    ctx.handlers.get('tools/pre-execute')!({ toolSchemas: ['new_tool'] });
    const health = await readHealth(ctx);
    expect(health.triggerReason).toBe('toolset_change');
  });

  it('50+帧/秒不丢失系统提示变更', async () => {
    for (let i = 0; i < 100; i++) {
      ctx.handlers.get('agent/assistant-stream')!({ tokenDelta: 50, messageCount: i });
    }
    ctx.handlers.get('session/event')!({ type: 'system_prompt_change', systemPrompt: 'prompt_a' });
    ctx.handlers.get('session/event')!({ type: 'system_prompt_change', systemPrompt: 'prompt_b' });
    const health = await readHealth(ctx);
    expect(health.triggerReason).toBe('system_prompt_rewrite');
  });

  it('高频下单事件 ≤5ms', () => {
    const handler = ctx.handlers.get('agent/assistant-stream')!;
    const times: number[] = [];
    for (let i = 0; i < 5000; i++) {
      const start = performance.now();
      handler({ tokenDelta: 50, messageCount: i });
      times.push(performance.now() - start);
    }
    const sorted = [...times].sort((a, b) => a - b);
    const p99 = sorted[Math.floor(sorted.length * 0.99)]!;
    expect(p99).toBeLessThanOrEqual(5);
  });
});
