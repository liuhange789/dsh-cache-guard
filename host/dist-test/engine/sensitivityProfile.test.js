import { describe, it, expect } from 'vitest';
import { resolveProfile } from './sensitivityProfile';
describe('SensitivityProfile', () => {
    it('三档阈值与设计表一致', () => {
        const loose = resolveProfile('loose');
        const standard = resolveProfile('standard');
        const aggressive = resolveProfile('aggressive');
        expect(loose.messageThreshold).toBe(40);
        expect(loose.rewriteWindowMs).toBe(20000);
        expect(loose.bloatThreshold).toBe(8000);
        expect(loose.consecutiveToolCallsForPtc).toBe(8);
        expect(standard.messageThreshold).toBe(25);
        expect(standard.rewriteWindowMs).toBe(10000);
        expect(standard.bloatThreshold).toBe(5000);
        expect(standard.consecutiveToolCallsForPtc).toBe(5);
        expect(aggressive.messageThreshold).toBe(15);
        expect(aggressive.rewriteWindowMs).toBe(5000);
        expect(aggressive.bloatThreshold).toBe(3000);
        expect(aggressive.consecutiveToolCallsForPtc).toBe(3);
    });
    it('aggressive < standard < loose 单调性', () => {
        const loose = resolveProfile('loose');
        const standard = resolveProfile('standard');
        const aggressive = resolveProfile('aggressive');
        expect(aggressive.messageThreshold).toBeLessThan(standard.messageThreshold);
        expect(standard.messageThreshold).toBeLessThan(loose.messageThreshold);
        expect(aggressive.rewriteWindowMs).toBeLessThan(standard.rewriteWindowMs);
        expect(standard.rewriteWindowMs).toBeLessThan(loose.rewriteWindowMs);
        expect(aggressive.bloatThreshold).toBeLessThan(standard.bloatThreshold);
        expect(standard.bloatThreshold).toBeLessThan(loose.bloatThreshold);
        expect(aggressive.consecutiveToolCallsForPtc).toBeLessThan(standard.consecutiveToolCallsForPtc);
        expect(standard.consecutiveToolCallsForPtc).toBeLessThan(loose.consecutiveToolCallsForPtc);
    });
    it('非法值回退 standard', () => {
        const invalid = resolveProfile('invalid');
        const standard = resolveProfile('standard');
        expect(invalid).toEqual(standard);
    });
});
