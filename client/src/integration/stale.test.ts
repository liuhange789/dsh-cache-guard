import { describe, it, expect } from 'vitest';
import { isStale, guard } from '../staleGuard.ts';
import type { HealthSignal } from '../model/types.ts';

const baseSignal: HealthSignal = {
  level: 'yellow',
  triggerReason: 'toolset_change',
  computedAt: 1000000,
  sessionWindowSummary: { messageCount: 10, toolsetHash: 'abc', systemPromptHash: 'xyz' },
  ptcHintActive: false,
};

describe('Stale Integration', () => {
  it('超 2s 后置 none', () => {
    const result = guard(baseSignal, baseSignal.computedAt + 3000);
    expect(result.level).toBe('none');
  });

  it('恢复后重新显示合法信号', () => {
    const freshSignal = { ...baseSignal, computedAt: Date.now() };
    const result = guard(freshSignal, Date.now());
    expect(result.level).toBe('yellow');
  });

  it('isStale 边界判定', () => {
    expect(isStale(baseSignal.computedAt, baseSignal.computedAt + 1999)).toBe(false);
    expect(isStale(baseSignal.computedAt, baseSignal.computedAt + 2001)).toBe(true);
  });
});