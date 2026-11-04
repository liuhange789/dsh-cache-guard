import { describe, it, expect } from 'vitest';
import { isStale, guard } from './staleGuard.ts';
import type { HealthSignal } from './model/types.ts';

const baseSignal: HealthSignal = {
  level: 'yellow',
  triggerReason: 'toolset_change',
  computedAt: 1000000,
  sessionWindowSummary: { messageCount: 10, toolsetHash: 'abc', systemPromptHash: 'xyz' },
  ptcHintActive: false,
};

describe('StaleGuard', () => {
  it('computedAt + 1999ms 不超时', () => {
    expect(isStale(baseSignal.computedAt, baseSignal.computedAt + 1999)).toBe(false);
  });

  it('computedAt + 2001ms 超时', () => {
    expect(isStale(baseSignal.computedAt, baseSignal.computedAt + 2001)).toBe(true);
  });

  it('边界 2000ms 判定', () => {
    expect(isStale(baseSignal.computedAt, baseSignal.computedAt + 2000)).toBe(false);
  });

  it('超时返回 level=none', () => {
    const result = guard(baseSignal, baseSignal.computedAt + 3000);
    expect(result.level).toBe('none');
    expect(result.triggerReason).toBeNull();
  });

  it('未超时返回原信号', () => {
    const result = guard(baseSignal, baseSignal.computedAt + 1000);
    expect(result.level).toBe('yellow');
  });
});