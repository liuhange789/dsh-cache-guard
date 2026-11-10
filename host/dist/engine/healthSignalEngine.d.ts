import type { SessionSnapshot } from '../model/sessionSnapshot.ts';
import type { SensitivityProfile } from '../model/sensitivityProfile.ts';
import type { HealthSignal } from '../model/healthSignal.ts';
export interface EngineInput {
    snapshots: readonly SessionSnapshot[];
    profile: SensitivityProfile;
    prevSignal: HealthSignal;
    toolsetChanged: boolean;
    systemPromptRewrite: boolean;
    now: number;
}
export declare function compute(input: EngineInput): HealthSignal;
//# sourceMappingURL=healthSignalEngine.d.ts.map