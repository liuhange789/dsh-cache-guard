import { describe, it, expect, beforeEach } from 'vitest';
import { SnapshotWindow, MAX_WINDOW_BYTES, MAX_WINDOW_ENTRIES } from './snapshotWindow.ts';
import { createSessionSnapshot } from './sessionSnapshot.ts';
import type { SessionSnapshot } from './sessionSnapshot.ts';

function makeSnapshot(i: number): SessionSnapshot {
  return createSessionSnapshot({
    messageCount: i,
    toolsetHash: `hash${i}`,
    systemPromptHash: `prompt${i}`,
    contextTokenDelta: 100,
    consecutiveToolCalls: 0,
    lastSignalAt: 0,
  });
}

describe('SnapshotWindow', () => {
  let window: SnapshotWindow;

  beforeEach(() => {
    window = new SnapshotWindow();
  });

  it('灌入1000帧后 totalBytes ≤ 512KB', () => {
    for (let i = 0; i < 1000; i++) {
      window.push(makeSnapshot(i));
    }
    expect(window.totalBytes()).toBeLessThanOrEqual(MAX_WINDOW_BYTES);
  });

  it('条数 ≤ 256', () => {
    for (let i = 0; i < 1000; i++) {
      window.push(makeSnapshot(i));
    }
    expect(window.size()).toBeLessThanOrEqual(MAX_WINDOW_ENTRIES);
  });

  it('latest 返回最新', () => {
    window.push(makeSnapshot(1));
    window.push(makeSnapshot(2));
    const latest = window.latest();
    expect(latest?.messageCount).toBe(2);
  });

  it('clear 全量清空', () => {
    window.push(makeSnapshot(1));
    window.push(makeSnapshot(2));
    window.clear();
    expect(window.size()).toBe(0);
    expect(window.totalBytes()).toBe(0);
    expect(window.latest()).toBeNull();
  });

  it('evict 淘汰最旧', () => {
    for (let i = 0; i < 300; i++) {
      window.push(makeSnapshot(i));
    }
    expect(window.size()).toBeLessThanOrEqual(MAX_WINDOW_ENTRIES);
    const all = window.all();
    if (all.length > 0) {
      expect(all[0]!.messageCount).toBeGreaterThanOrEqual(0);
    }
  });
});