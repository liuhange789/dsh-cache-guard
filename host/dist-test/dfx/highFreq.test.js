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
describe('DFX: High Frequency', () => {
    let ctx;
    beforeEach(async () => {
        ctx = makeMockCtx();
        await setup(ctx);
    });
    it('50+帧/秒不丢失工具集变更', () => {
        for (let i = 0; i < 100; i++) {
            ctx.handlers.get('agent/assistant-stream')({ tokenDelta: 50, messageCount: i });
        }
        ctx.pushed.length = 0;
        ctx.handlers.get('tools/pre-execute')({ toolSchemas: ['new_tool'] });
        const hasToolsetChange = ctx.pushed.some((p) => p.payload?.triggerReason === 'toolset_change');
        expect(hasToolsetChange).toBe(true);
    });
    it('50+帧/秒不丢失系统提示变更', () => {
        for (let i = 0; i < 100; i++) {
            ctx.handlers.get('agent/assistant-stream')({ tokenDelta: 50, messageCount: i });
        }
        ctx.pushed.length = 0;
        ctx.handlers.get('session/event')({ type: 'system_prompt_change', systemPrompt: 'new_prompt' });
        const hasPromptChange = ctx.pushed.some((p) => p.payload?.triggerReason === 'system_prompt_rewrite');
        expect(hasPromptChange).toBe(true);
    });
    it('高频下单事件 ≤5ms', () => {
        const handler = ctx.handlers.get('agent/assistant-stream');
        const times = [];
        for (let i = 0; i < 5000; i++) {
            const start = performance.now();
            handler({ tokenDelta: 50, messageCount: i });
            times.push(performance.now() - start);
        }
        const sorted = [...times].sort((a, b) => a - b);
        const p99 = sorted[Math.floor(sorted.length * 0.99)];
        expect(p99).toBeLessThanOrEqual(5);
    });
});
