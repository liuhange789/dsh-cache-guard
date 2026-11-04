import { describe, it, expect } from 'vitest';
import { compute } from './healthSignalEngine';
import { resolveProfile } from '../model/sensitivityProfile';
import { createSessionSnapshot } from '../model/sessionSnapshot';
import { createNoneSignal } from '../model/healthSignal';
const profile = resolveProfile('standard');
const baseTime = 1700000000000;
function makeSnapshot(overrides = {}) {
    return createSessionSnapshot({
        messageCount: 10,
        toolsetHash: 'abc',
        systemPromptHash: 'xyz',
        contextTokenDelta: 100,
        consecutiveToolCalls: 0,
        lastSignalAt: baseTime,
        ...overrides,
    });
}
describe('HealthSignalEngine', () => {
    it('连续5帧稳定增长 → green', () => {
        const snapshots = [];
        for (let i = 0; i < 5; i++) {
            snapshots.push(makeSnapshot({ messageCount: 10 + i, capturedAt: baseTime + i * 100 }));
        }
        const signal = compute({
            snapshots,
            profile,
            prevSignal: createNoneSignal(baseTime),
            toolsetChanged: false,
            systemPromptRewrite: false,
            now: baseTime + 500,
        });
        expect(signal.level).toBe('green');
    });
    it('系统提示重复 → yellow(system_prompt_rewrite)', () => {
        const snapshots = [makeSnapshot()];
        const signal = compute({
            snapshots,
            profile,
            prevSignal: createNoneSignal(baseTime),
            toolsetChanged: false,
            systemPromptRewrite: true,
            now: baseTime,
        });
        expect(signal.level).toBe('yellow');
        expect(signal.triggerReason).toBe('system_prompt_rewrite');
    });
    it('工具集哈希变化 → yellow(toolset_change)', () => {
        const snapshots = [makeSnapshot()];
        const signal = compute({
            snapshots,
            profile,
            prevSignal: createNoneSignal(baseTime),
            toolsetChanged: true,
            systemPromptRewrite: false,
            now: baseTime,
        });
        expect(signal.level).toBe('yellow');
        expect(signal.triggerReason).toBe('toolset_change');
    });
    it('消息数超阈值未命中 → yellow(message_over_threshold)', () => {
        const snapshots = [
            makeSnapshot({ messageCount: 30, contextTokenDelta: 50 }),
            makeSnapshot({ messageCount: 30, contextTokenDelta: 50 }),
            makeSnapshot({ messageCount: 30, contextTokenDelta: 50 }),
            makeSnapshot({ messageCount: 30, contextTokenDelta: 50 }),
            makeSnapshot({ messageCount: 30, contextTokenDelta: 50 }),
        ];
        const signal = compute({
            snapshots,
            profile,
            prevSignal: createNoneSignal(baseTime),
            toolsetChanged: false,
            systemPromptRewrite: false,
            now: baseTime,
        });
        expect(signal.level).toBe('yellow');
        expect(signal.triggerReason).toBe('message_over_threshold');
    });
    it('连续3次工具调用膨胀 → red', () => {
        const snapshots = [
            makeSnapshot({ consecutiveToolCalls: 1, contextTokenDelta: 6000 }),
            makeSnapshot({ consecutiveToolCalls: 2, contextTokenDelta: 6000 }),
            makeSnapshot({ consecutiveToolCalls: 3, contextTokenDelta: 6000 }),
        ];
        const signal = compute({
            snapshots,
            profile,
            prevSignal: createNoneSignal(baseTime),
            toolsetChanged: false,
            systemPromptRewrite: false,
            now: baseTime,
        });
        expect(signal.level).toBe('red');
        expect(signal.triggerReason).toBe('context_bloat_no_reuse');
    });
    it('红+黄同时 → red', () => {
        const snapshots = [
            makeSnapshot({ consecutiveToolCalls: 1, contextTokenDelta: 6000, messageCount: 30 }),
            makeSnapshot({ consecutiveToolCalls: 2, contextTokenDelta: 6000, messageCount: 30 }),
            makeSnapshot({ consecutiveToolCalls: 3, contextTokenDelta: 6000, messageCount: 30 }),
        ];
        const signal = compute({
            snapshots,
            profile,
            prevSignal: createNoneSignal(baseTime),
            toolsetChanged: true,
            systemPromptRewrite: false,
            now: baseTime,
        });
        expect(signal.level).toBe('red');
    });
    it('输出无百分比数值字段', () => {
        const snapshots = [makeSnapshot()];
        const signal = compute({
            snapshots,
            profile,
            prevSignal: createNoneSignal(baseTime),
            toolsetChanged: false,
            systemPromptRewrite: false,
            now: baseTime,
        });
        expect(signal).not.toHaveProperty('hitRate');
        expect(signal).not.toHaveProperty('cachePercentage');
    });
});
