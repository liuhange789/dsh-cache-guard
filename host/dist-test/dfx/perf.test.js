import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setup } from '../index';
function makeMockCtx() {
    const handlers = new Map();
    return {
        handlers,
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
        push: vi.fn(),
    };
}
function p99(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const idx = Math.floor(sorted.length * 0.99);
    return sorted[idx] ?? sorted[sorted.length - 1];
}
describe('DFX: Performance', () => {
    let ctx;
    beforeEach(async () => {
        ctx = makeMockCtx();
        await setup(ctx);
    });
    it('stream handler P99 ≤5ms', () => {
        const handler = ctx.handlers.get('agent/assistant-stream');
        const times = [];
        for (let i = 0; i < 10000; i++) {
            const start = performance.now();
            handler({ tokenDelta: 100, messageCount: i });
            times.push(performance.now() - start);
        }
        expect(p99(times)).toBeLessThanOrEqual(5);
    });
    it('tools/pre-execute handler P99 ≤5ms', () => {
        const handler = ctx.handlers.get('tools/pre-execute');
        const times = [];
        for (let i = 0; i < 10000; i++) {
            const start = performance.now();
            handler({ toolSchemas: ['t1', 't2'] });
            times.push(performance.now() - start);
        }
        expect(p99(times)).toBeLessThanOrEqual(5);
    });
    it('session/event handler P99 ≤5ms', () => {
        const handler = ctx.handlers.get('session/event');
        const times = [];
        for (let i = 0; i < 10000; i++) {
            const start = performance.now();
            handler({ type: 'other' });
            times.push(performance.now() - start);
        }
        expect(p99(times)).toBeLessThanOrEqual(5);
    });
});
