import type { Sensitivity } from './types.ts';

export interface SensitivityProfile {
  messageThreshold: number;
  rewriteWindowMs: number;
  bloatThreshold: number;
  consecutiveToolCallsForPtc: number;
  greenStableFrames: number;
}

const LOOSE_PROFILE: SensitivityProfile = {
  messageThreshold: 40,
  rewriteWindowMs: 20000,
  bloatThreshold: 8000,
  consecutiveToolCallsForPtc: 8,
  greenStableFrames: 5,
};

const STANDARD_PROFILE: SensitivityProfile = {
  messageThreshold: 25,
  rewriteWindowMs: 10000,
  bloatThreshold: 5000,
  consecutiveToolCallsForPtc: 5,
  greenStableFrames: 5,
};

const AGGRESSIVE_PROFILE: SensitivityProfile = {
  messageThreshold: 15,
  rewriteWindowMs: 5000,
  bloatThreshold: 3000,
  consecutiveToolCallsForPtc: 3,
  greenStableFrames: 5,
};

const PROFILE_TABLE: Record<Sensitivity, SensitivityProfile> = {
  loose: LOOSE_PROFILE,
  standard: STANDARD_PROFILE,
  aggressive: AGGRESSIVE_PROFILE,
};

export function resolveProfile(sensitivity: Sensitivity): SensitivityProfile {
  return PROFILE_TABLE[sensitivity] ?? STANDARD_PROFILE;
}