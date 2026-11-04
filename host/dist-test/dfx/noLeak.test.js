import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setup } from '../index';
const SECRET_PROMPT = 'SECRET_SYSTEM_PROMPT_CONTENT_12345';
const SECRET_TOOL_PARAM = 'SECRET_TOOL_PARAM_VALUE';
function makeMockCtx() {
    const handlers = new Map();
    const pushed = [];
    const logs = [];
    return {
        handlers,
        pushed,
        logs,
        on: vi.fn((event, handler) => {
            handlers.set(event, handler);
            return () => { handlers.delete(event); };
        }),
        effect: vi.fn((fn) => fn()),
        inject: ['agents', 'tools'],
        log: vi.fn((level, msg, fields) => { logs.push({ level, msg, fields }); }),
        config: {
            read: vi.fn(async () => null),
            write: vi.fn(async () => { }),
            subscribe: vi.fn(() => () => { }),
        },
        expose: vi.fn(),
        push: vi.fn((event, payload) => { pushed.push({ event, payload }); }),
    };
}
describe('DFX: No Sensitive Data Leak', () => {
    let ctx;
    beforeEach(async () => {
        ctx = makeMockCtx();
        await setup(ctx);
    });
    it('HealthSignal 不含会话原文', () => {
        ctx.handlers.get('session/event')({ type: 'system_prompt_change', systemPrompt: SECRET_PROMPT });
        const signalStr = JSON.stringify(ctx.pushed);
        expect(signalStr).not.toContain(SECRET_PROMPT);
    });
    it('HealthSignal 不含工具调用参数', () => {
        ctx.handlers.get('tools/pre-execute')({ toolSchemas: [SECRET_TOOL_PARAM] });
        const signalStr = JSON.stringify(ctx.pushed);
        expect(signalStr).not.toContain(SECRET_TOOL_PARAM);
    });
    it('日志不含会话原文', () => {
        ctx.handlers.get('session/event')({ type: 'system_prompt_change', systemPrompt: SECRET_PROMPT });
        const logStr = JSON.stringify(ctx.logs);
        expect(logStr).not.toContain(SECRET_PROMPT);
    });
    it('sessionWindowSummary 仅含三个投影字段', () => {
        ctx.handlers.get('agent/assistant-stream')({ tokenDelta: 100, messageCount: 5 });
        for (const entry of ctx.pushed) {
            const payload = entry.payload;
            if (payload?.sessionWindowSummary) {
                const keys = Object.keys(payload.sessionWindowSummary);
                expect(keys).toEqual(expect.arrayContaining(['messageCount', 'toolsetHash', 'systemPromptHash']));
                expect(keys.length).toBe(3);
            }
        }
    });
});
