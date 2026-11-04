import { describe, it, expect, beforeEach } from 'vitest';
import { SignalThrottler } from './signalThrottler';
import { createYellowSignal } from '../model/healthSignal';
const summary = {
    messageCount: 10,
    toolsetHash: 'abc',
    systemPromptHash: 'xyz',
};
describe('SignalThrottler', () => {
    let throttler;
    beforeEach(() => {
        throttler = new SignalThrottler();
    });
    it('黄灯同原因 30s 内仅 1 次', () => {
        const signal = createYellowSignal('toolset_change', summary, 1000);
        expect(throttler.shouldEmit(signal, 1000)).toBe(true);
        expect(throttler.shouldEmit(signal, 15000)).toBe(false);
        expect(throttler.shouldEmit(signal, 31000)).toBe(true);
    });
    it('PTC 5min 内仅 1 次', () => {
        expect(throttler.shouldEmitPtc(1000)).toBe(true);
        expect(throttler.shouldEmitPtc(100000)).toBe(false);
        expect(throttler.shouldEmitPtc(301000)).toBe(true);
    });
    it('UI 1s 内同 level 仅 1 次', () => {
        expect(throttler.shouldRepaint('yellow', 1000)).toBe(true);
        expect(throttler.shouldRepaint('yellow', 1500)).toBe(false);
        expect(throttler.shouldRepaint('yellow', 2100)).toBe(true);
    });
    it('不同原因互不影响', () => {
        const s1 = createYellowSignal('toolset_change', summary, 1000);
        const s2 = createYellowSignal('system_prompt_rewrite', summary, 1000);
        expect(throttler.shouldEmit(s1, 1000)).toBe(true);
        expect(throttler.shouldEmit(s2, 1000)).toBe(true);
    });
    it('reset 后节流状态清空', () => {
        const signal = createYellowSignal('toolset_change', summary, 1000);
        throttler.shouldEmit(signal, 1000);
        throttler.reset();
        expect(throttler.shouldEmit(signal, 1000)).toBe(true);
    });
});
