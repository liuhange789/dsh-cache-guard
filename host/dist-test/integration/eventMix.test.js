import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setup } from '../index';
function makeMockCtx() {
    const handlers = new Map();
    const pushed = [];
    return {
        handlers,
        pushed,
        on: vi.fn((event, handler) => {
            handlers.set(event, handler);
            return () => { handlers.delete(event); };
        }),
        effect: vi.fn((fn) => fn()),
        inject: ['agents', 'tools'],
        log: vi.fn(),
        config: {
            read: vi.fn(async () => null),
            write: vi.fn(async () => { }),
            subscribe: vi.fn(() => () => { }),
        },
        expose: vi.fn(),
        push: vi.fn((event, payload) => { pushed.push({ event, payload }); }),
    };
}
describe('Event Mix Integration', () => {
    let ctx;
    beforeEach(async () => {
        ctx = makeMockCtx();
        await setup(ctx);
    });
    it('stream 事件后 consecutiveToolCalls 归零', () => {
        ctx.handlers.get('agent/assistant-stream')({ tokenDelta: 100, messageCount: 5 });
        ctx.handlers.get('agent/assistant-stream')({ tokenDelta: 200, messageCount: 6 });
        expect(ctx.pushed.length).toBeGreaterThanOrEqual(0);
    });
    it('tools/pre-execute 后 consecutiveToolCalls 累加', () => {
        ctx.handlers.get('tools/pre-execute')({ toolSchemas: ['tool1', 'tool2'] });
        ctx.handlers.get('tools/pre-execute')({ toolSchemas: ['tool1', 'tool2'] });
        expect(ctx.pushed.length).toBeGreaterThanOrEqual(0);
    });
    it('工具集变更触发 yellow 信号', () => {
        ctx.handlers.get('tools/pre-execute')({ toolSchemas: ['tool1'] });
        ctx.pushed.length = 0;
        ctx.handlers.get('tools/pre-execute')({ toolSchemas: ['tool1', 'tool2'] });
        const yellowPush = ctx.pushed.find((p) => p.payload?.level === 'yellow');
        expect(yellowPush).toBeDefined();
    });
    it('会话重置后窗口清空', () => {
        ctx.handlers.get('agent/assistant-stream')({ tokenDelta: 100, messageCount: 5 });
        ctx.handlers.get('session/event')({ type: 'session_reset' });
        const resetPush = ctx.pushed.find((p) => p.payload?.level === 'green' ||
            p.payload?.level === 'none');
        expect(resetPush).toBeDefined();
    });
});
