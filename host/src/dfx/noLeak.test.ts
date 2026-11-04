import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setup } from '../index.ts';
import type { DshHostContext, Disposer } from '../types/dshContext.ts';

const SECRET_PROMPT = 'SECRET_SYSTEM_PROMPT_CONTENT_12345';
const SECRET_TOOL_PARAM = 'SECRET_TOOL_PARAM_VALUE';

function makeMockCtx(): DshHostContext & { handlers: Map<string, (...args: unknown[]) => void>; pushed: unknown[]; logs: { level: string; msg: string; fields?: unknown }[] } {
  const handlers = new Map<string, (...args: unknown[]) => void>();
  const pushed: unknown[] = [];
  const logs: { level: string; msg: string; fields?: unknown }[] = [];
  return {
    handlers,
    pushed,
    logs,
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      handlers.set(event, handler);
      return () => { handlers.delete(event); };
    }),
    effect: vi.fn(<T>(fn: () => Disposer): T => fn() as unknown as T),
    inject: ['agents', 'tools'],
    log: vi.fn((level: string, msg: string, fields?: unknown) => { logs.push({ level, msg, fields }); }),
    config: {
      read: vi.fn(async () => null),
      write: vi.fn(async () => {}),
      subscribe: vi.fn(() => () => {}),
    },
    expose: vi.fn(),
    push: vi.fn((event: string, payload: unknown) => { pushed.push({ event, payload }); }),
  };
}

describe('DFX: No Sensitive Data Leak', () => {
  let ctx: ReturnType<typeof makeMockCtx>;

  beforeEach(async () => {
    ctx = makeMockCtx();
    await setup(ctx);
  });

  it('HealthSignal 不含会话原文', () => {
    ctx.handlers.get('session/event')!({ type: 'system_prompt_change', systemPrompt: SECRET_PROMPT });
    const signalStr = JSON.stringify(ctx.pushed);
    expect(signalStr).not.toContain(SECRET_PROMPT);
  });

  it('HealthSignal 不含工具调用参数', () => {
    ctx.handlers.get('tools/pre-execute')!({ toolSchemas: [SECRET_TOOL_PARAM] });
    const signalStr = JSON.stringify(ctx.pushed);
    expect(signalStr).not.toContain(SECRET_TOOL_PARAM);
  });

  it('日志不含会话原文', () => {
    ctx.handlers.get('session/event')!({ type: 'system_prompt_change', systemPrompt: SECRET_PROMPT });
    const logStr = JSON.stringify(ctx.logs);
    expect(logStr).not.toContain(SECRET_PROMPT);
  });

  it('sessionWindowSummary 仅含三个投影字段', () => {
    ctx.handlers.get('agent/assistant-stream')!({ tokenDelta: 100, messageCount: 5 });
    for (const entry of ctx.pushed) {
      const payload = (entry as { payload: { sessionWindowSummary: unknown } }).payload;
      if (payload?.sessionWindowSummary) {
        const keys = Object.keys(payload.sessionWindowSummary);
        expect(keys).toEqual(expect.arrayContaining(['messageCount', 'toolsetHash', 'systemPromptHash']));
        expect(keys.length).toBe(3);
      }
    }
  });
});