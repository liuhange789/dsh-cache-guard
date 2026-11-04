import { describe, it, expect, beforeEach } from 'vitest';
import { SnapshotWindow, MAX_WINDOW_BYTES, MAX_WINDOW_ENTRIES } from '../model/snapshotWindow';
import { createSessionSnapshot } from '../model/sessionSnapshot';
describe('DFX: Window Capacity', () => {
    let window;
    beforeEach(() => {
        window = new SnapshotWindow();
    });
    it('灌入1000帧2KB快照后 totalBytes ≤512KB', () => {
        for (let i = 0; i < 1000; i++) {
            window.push(createSessionSnapshot({
                messageCount: i,
                toolsetHash: `hash_${i.toString().padStart(10, '0')}`,
                systemPromptHash: `prompt_${i.toString().padStart(10, '0')}`,
                contextTokenDelta: 100,
                consecutiveToolCalls: 0,
                lastSignalAt: 0,
            }));
        }
        expect(window.totalBytes()).toBeLessThanOrEqual(MAX_WINDOW_BYTES);
    });
    it('条数 ≤256', () => {
        for (let i = 0; i < 1000; i++) {
            window.push(createSessionSnapshot({
                messageCount: i,
                toolsetHash: 'h',
                systemPromptHash: 'p',
                contextTokenDelta: 100,
                consecutiveToolCalls: 0,
                lastSignalAt: 0,
            }));
        }
        expect(window.size()).toBeLessThanOrEqual(MAX_WINDOW_ENTRIES);
    });
});
