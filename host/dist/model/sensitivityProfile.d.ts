import type { Sensitivity } from './types.ts';
export interface SensitivityProfile {
    messageThreshold: number;
    rewriteWindowMs: number;
    bloatThreshold: number;
    consecutiveToolCallsForPtc: number;
    greenStableFrames: number;
}
export declare function resolveProfile(sensitivity: Sensitivity): SensitivityProfile;
//# sourceMappingURL=sensitivityProfile.d.ts.map