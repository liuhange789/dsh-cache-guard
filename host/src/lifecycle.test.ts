import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setup } from './index.ts';
import type { DshHostContext, DshToolDefinition, Disposer } from './types/dshContext.ts';

interface MockCtx extends DshHostContext {
  handlers: Map<string, (...args: unknown[]) => unknown>;
  toolDefs: Map<string, DshToolDefinition>;
  register: ReturnType<typeof vi.fn>;
}

function makeMockCtx(): MockCtx {
  const handlers = new Map<string, (...args: unknown[]) => unknown>();
  const toolDefs = new Map<string, DshToolDefinition>();
  const register = vi.fn((definition: DshToolDefinition) => {
    toolDefs.set(definition.name, definition);
    return () => {
      toolDefs.delete(definition.name);
    };
  });
  const ctx = {
    handlers,
    toolDefs,
    register,
    on: vi.fn((event: string, handler: (...args: unknown[]) => unknown) => {
      handlers.set(event, handler);
      return () => {
        handlers.delete(event);
      };
    }),
    effect: vi.fn(<T>(fn: () => Disposer): T => fn() as unknown as T),
    log: vi.fn(),
    tools: { register },
  };
  return ctx as unknown as MockCtx;
}

describe('Lifecycle Integration', () => {
  let ctx: MockCtx;

  beforeEach(() => {
    ctx = makeMockCtx();
  });

  it('装载后三监听器与两个工具已注册', async () => {
    await setup(ctx);
    expect(ctx.handlers.has('agent/assistant-stream')).toBe(true);
    expect(ctx.handlers.has('tools/pre-execute')).toBe(true);
    expect(ctx.handlers.has('session/event')).toBe(true);
    expect([...ctx.toolDefs.keys()].sort()).toEqual(['cache_guard_config', 'cache_guard_health']);
  });

  it('卸载后 listener 与工具都被注销', async () => {
    const dispose = await setup(ctx);
    dispose();
    expect(ctx.handlers.size).toBe(0);
    expect(ctx.toolDefs.size).toBe(0);
  });

  it('缺少 tools 服务 → 拒绝装载', async () => {
    const bare = { ...ctx, tools: undefined } as MockCtx;
    const dispose = await setup(bare);
    expect(ctx.register).not.toHaveBeenCalled();
    expect(ctx.handlers.size).toBe(0);
    dispose();
  });

  it('卸载重复调用不抛错', async () => {
    const dispose = await setup(ctx);
    dispose();
    expect(() => dispose()).not.toThrow();
  });
});
