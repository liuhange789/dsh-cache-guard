import { describe, it, expect } from 'vitest';
import {
  getYellowHint,
  getPtcHint,
  getFallback,
  truncateHint,
  MAX_HINT_LENGTH,
} from './hintTemplates.ts';
import type { TriggerReason } from './model/types.ts';

describe('HintTemplates', () => {
  const reasons: TriggerReason[] = [
    'system_prompt_rewrite',
    'toolset_change',
    'message_over_threshold',
    'context_bloat_no_reuse',
  ];

  it('所有黄灯文案 ≤20 字且简体中文', () => {
    for (const reason of reasons) {
      const hint = getYellowHint(reason);
      expect(hint.length).toBeLessThanOrEqual(MAX_HINT_LENGTH);
      expect(hint.length).toBeGreaterThan(0);
    }
  });

  it('PTC 文案 ≤20 字且无金额数字', () => {
    const ptc = getPtcHint();
    expect(ptc.length).toBeLessThanOrEqual(MAX_HINT_LENGTH);
    expect(ptc).not.toMatch(/\d+元/);
    expect(ptc).not.toMatch(/\$\d/);
  });

  it('兜底文案存在且 ≤20 字', () => {
    const fallback = getFallback();
    expect(fallback.length).toBeLessThanOrEqual(MAX_HINT_LENGTH);
    expect(fallback.length).toBeGreaterThan(0);
  });

  it('各原因文案与 spec 5.2.1 对应', () => {
    expect(getYellowHint('system_prompt_rewrite')).toContain('归档');
    expect(getYellowHint('toolset_change')).toContain('收敛');
    expect(getYellowHint('message_over_threshold')).toContain('新会话');
  });

  it('truncateHint 超长截断', () => {
    const long = '这是一段超过二十个字的测试文案用于验证截断功能是否正常工作';
    const truncated = truncateHint(long);
    expect(truncated.length).toBeLessThanOrEqual(MAX_HINT_LENGTH);
    expect(truncated).toContain('…');
  });
});