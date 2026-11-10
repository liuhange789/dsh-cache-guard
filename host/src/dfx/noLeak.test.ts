import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setup } from '../index.ts';
import type { DshHostContext, DshToolDefinition, Disposer } from '../types/dshContext.ts';

const SECRET_PROMPT = 'SECRET_SYSTEM_PROMPT_CONTENT_12345';
const SECRET_TOOL_PARAM = 'SECRET_TOOL_PARAM_VALUE';

interface MockCtx extends DshHostContext {
  handlers: Map<string, (...args: unknown[]) => unknown>;
  toolDefs: Map<string, DshToolDefinition>;
  logs: { level: string; msg: string; fields?: unknown }[];
}

function makeMockCtx(): MockCtx {
  const handlers = new Map<string, (...args: unknown[]) => unknown>();
  const toolDefs = new Map<string, DshToolDefinition>();
  const logs: { level: string; msg: string; fields?: unknown }[] = [];
  const ctx = {
    handlers,
    toolDefs,
    logs,
    on: vi.fn((event: string, handler: (...args: unknown[]) => unknown) => {
      handlers.set(event, handler);
      return () => {
        handlers.delete(event);
      };
    }),
    effect: vi.fn(<T>(fn: () => Disposer): T => fn() as unknown as T),
    log: vi.fn((level: string, msg: string, fields?: unknown) => {
      logs.push({ level, msg, fields });
    }),
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

describe('DFX: No Sensitive Data Leak', () => {
  let ctx: MockCtx;

  beforeEach(async () => {
    ctx = makeMockCtx();
    await setup(ctx);
  });

  it('HealthSignal 不含会话原文', async () => {
    ctx.handlers.get('session/event')!({ type: 'system_prompt_change', systemPrompt: SECRET_PROMPT });
    const health = await readHealth(ctx);
    expect(JSON.stringify(health)).not.toContain(SECRET_PROMPT);
  });

  it('HealthSignal 不含工具调用参数', async () => {
    ctx.handlers.get('tools/pre-execute')!({ toolSchemas: [SECRET_TOOL_PARAM] });
    const health = await readHealth(ctx);
    expect(JSON.stringify(health)).not.toContain(SECRET_TOOL_PARAM);
  });

  it('日志不含会话原文', () => {
    ctx.handlers.get('session/event')!({ type: 'system_prompt_change', systemPrompt: SECRET_PROMPT });
    const logStr = JSON.stringify(ctx.logs);
    expect(logStr).not.toContain(SECRET_PROMPT);
  });

  it('summary 仅含三个投影字段', async () => {
    ctx.handlers.get('agent/assistant-stream')!({ tokenDelta: 100, messageCount: 5 });
    const health = await readHealth(ctx);
    const keys = Object.keys(health.summary as Record<string, unknown>);
    expect(keys).toEqual(expect.arrayContaining(['messageCount', 'toolsetHash', 'systemPromptHash']));
    expect(keys.length).toBe(3);
  });
});
