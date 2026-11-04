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
describe('DFX: No Network', () => {
    let ctx;
    let fetchSpy;
    let originalFetch;
    beforeEach(async () => {
        originalFetch = globalThis.fetch;
        fetchSpy = vi.fn().mockResolvedValue(new Response(''));
        globalThis.fetch = fetchSpy;
        ctx = makeMockCtx();
        await setup(ctx);
    });
    it('全流程无 fetch 调用', () => {
        ctx.handlers.get('agent/assistant-stream')({ tokenDelta: 100, messageCount: 5 });
        ctx.handlers.get('tools/pre-execute')({ toolSchemas: ['t1'] });
        ctx.handlers.get('session/event')({ type: 'other' });
        expect(fetchSpy).not.toHaveBeenCalled();
    });
    it('卸载也无 fetch 调用', async () => {
        const dispose = await setup(ctx);
        fetchSpy.mockClear();
        dispose();
        expect(fetchSpy).not.toHaveBeenCalled();
    });
    it('恢复 fetch', () => {
        globalThis.fetch = originalFetch;
    });
});
