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

describe('Config Hot Reload Integration', () => {
  let ctx: MockCtx;

  beforeEach(() => {
    ctx = makeMockCtx();
  });

  it('装载时传入的 sensitivity 生效', async () => {
    await setup(ctx, { enabled: true, sensitivity: 'aggressive', showPtcHint: true });
    const health = await readHealth(ctx);
    expect(health.sensitivity).toBe('aggressive');
  });

  it('enabled=false 后停止信号计算', async () => {
    await setup(ctx, { enabled: false, sensitivity: 'standard', showPtcHint: true });
    ctx.handlers.get('agent/assistant-stream')!({ tokenDelta: 100, messageCount: 5 });
    const health = await readHealth(ctx);
    expect(health.level).toBe('none');
  });

  it('showPtcHint=false 后不展示 PTC 提示', async () => {
    await setup(ctx, { enabled: true, sensitivity: 'standard', showPtcHint: false });
    for (let i = 0; i < 5; i += 1) {
      ctx.handlers.get('tools/pre-execute')!({ toolSchemas: ['t1'] });
    }
    const health = await readHealth(ctx);
    expect(health.ptcHintActive).toBe(false);
  });

  it('cache_guard_config 改写配置后立即生效', async () => {
    await setup(ctx);
    const configTool = ctx.toolDefs.get('cache_guard_config')!;
    const result = await configTool.execute({ sensitivity: 'loose' });
    expect(result.errorCode).toBe('');
    expect((result.config as { sensitivity: string }).sensitivity).toBe('loose');
    const health = await readHealth(ctx);
    expect(health.sensitivity).toBe('loose');
    expect(ctx.log).toHaveBeenCalled();
  });
});
