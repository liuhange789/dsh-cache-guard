import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setup } from '../index.ts';
import type { DshHostContext, Disposer } from '../types/dshContext.ts';

function makeMockCtx(): DshHostContext & { handlers: Map<string, (...args: unknown[]) => void>; configSubs: ((config: Record<string, unknown>) => void)[]; pushed: unknown[] } {
  const handlers = new Map<string, (...args: unknown[]) => void>();
  const configSubs: ((config: Record<string, unknown>) => void)[] = [];
  const pushed: unknown[] = [];
  return {
    handlers,
    configSubs,
    pushed,
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      handlers.set(event, handler);
      return () => { handlers.delete(event); };
    }),
    effect: vi.fn(<T>(fn: () => Disposer): T => fn() as unknown as T),
    inject: ['agents', 'tools'],
    log: vi.fn(),
    config: {
      read: vi.fn(async () => ({ enabled: true, sensitivity: 'standard', showPtcHint: true })),
      write: vi.fn(async () => {}),
      subscribe: vi.fn((handler: (config: Record<string, unknown>) => void) => {
        configSubs.push(handler);
        return () => {};
      }),
    },
    expose: vi.fn(),
    push: vi.fn((event: string, payload: unknown) => { pushed.push({ event, payload }); }),
  };
}

describe('Config Hot Reload Integration', () => {
  let ctx: ReturnType<typeof makeMockCtx>;

  beforeEach(async () => {
    ctx = makeMockCtx();
    await setup(ctx);
  });

  it('sensitivity 变更后配置生效', () => {
    ctx.configSubs.forEach((sub) => sub({ enabled: true, sensitivity: 'aggressive', showPtcHint: true }));
    expect(ctx.log).toHaveBeenCalled();
  });

  it('enabled=false 后停止信号计算', () => {
    ctx.pushed.length = 0;
    ctx.configSubs.forEach((sub) => sub({ enabled: false, sensitivity: 'standard', showPtcHint: true }));
    ctx.handlers.get('agent/assistant-stream')!({ tokenDelta: 100, messageCount: 5 });
    const nonePush = ctx.pushed.find(
      (p) => (p as { payload: { level: string } }).payload?.level === 'none',
    );
    expect(nonePush).toBeDefined();
  });

  it('showPtcHint=false 后不展示 PTC 提示', () => {
    ctx.configSubs.forEach((sub) => sub({ enabled: true, sensitivity: 'standard', showPtcHint: false }));
    ctx.handlers.get('tools/pre-execute')!({ toolSchemas: ['t1'] });
    ctx.handlers.get('tools/pre-execute')!({ toolSchemas: ['t1'] });
    ctx.handlers.get('tools/pre-execute')!({ toolSchemas: ['t1'] });
    ctx.handlers.get('tools/pre-execute')!({ toolSchemas: ['t1'] });
    ctx.handlers.get('tools/pre-execute')!({ toolSchemas: ['t1'] });
    const ptcPush = ctx.pushed.find(
      (p) => (p as { payload: { ptcHintActive: boolean } }).payload?.ptcHintActive === true,
    );
    expect(ptcPush).toBeUndefined();
  });
});